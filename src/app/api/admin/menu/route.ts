import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ERROR_CODES, ERROR_MESSAGES } from '@/contracts/constants';
import { menuItemFormSchema } from '@/contracts/schemas';

async function checkAdminAuth(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { authorized: false, userId: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return {
    authorized: profile?.is_admin === true,
    userId: user.id,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { authorized } = await checkAdminAuth(supabase);
    if (!authorized) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.AUTH_UNAUTHORIZED,
            message: 'Admin access required',
          },
        },
        { status: 403 }
      );
    }

    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category')
      .order('name');

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: menuItems.map(mapMenuItemFromDb),
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { authorized } = await checkAdminAuth(supabase);
    if (!authorized) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.AUTH_UNAUTHORIZED,
            message: 'Admin access required',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = menuItemFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: validation.error.errors[0]?.message || 'Invalid input',
          },
        },
        { status: 400 }
      );
    }

    const input = validation.data;

    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .insert({
        name: input.name,
        description: input.description,
        category: input.category,
        price: input.price,
        image_url: input.imageUrl || null,
        dietary_tags: input.dietaryTags,
        allergens: input.allergens,
        serving_size: input.servingSize || null,
        is_available: input.isAvailable,
        is_popular: input.isPopular || false,
        calories: input.calories || null,
        preparation_time: input.preparationTime || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: mapMenuItemFromDb(menuItem),
    }, { status: 201 });
  } catch (error) {
    console.error('Create menu item error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
        },
      },
      { status: 500 }
    );
  }
}

function mapMenuItemFromDb(data: Record<string, unknown>) {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    category: data.category,
    price: Number(data.price),
    imageUrl: data.image_url,
    dietaryTags: data.dietary_tags || [],
    allergens: data.allergens || [],
    isAvailable: data.is_available,
    isPopular: data.is_popular,
    servingSize: data.serving_size,
    calories: data.calories,
    preparationTime: data.preparation_time,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
