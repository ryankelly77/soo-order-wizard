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

export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const supabase = await createClient();
    const { itemId } = params;

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

    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.MENU_ITEM_UNAVAILABLE,
              message: 'Menu item not found',
            },
          },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: mapMenuItemFromDb(menuItem),
    });
  } catch (error) {
    console.error('Get menu item error:', error);
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const supabase = await createClient();
    const { itemId } = params;

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
    const validation = menuItemFormSchema.partial().safeParse(body);

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
    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl || null;
    if (input.dietaryTags !== undefined) updateData.dietary_tags = input.dietaryTags;
    if (input.allergens !== undefined) updateData.allergens = input.allergens;
    if (input.servingSize !== undefined) updateData.serving_size = input.servingSize || null;
    if (input.isAvailable !== undefined) updateData.is_available = input.isAvailable;
    if (input.isPopular !== undefined) updateData.is_popular = input.isPopular;
    if (input.calories !== undefined) updateData.calories = input.calories || null;
    if (input.preparationTime !== undefined) updateData.preparation_time = input.preparationTime || null;

    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.MENU_ITEM_UNAVAILABLE,
              message: 'Menu item not found',
            },
          },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: mapMenuItemFromDb(menuItem),
    });
  } catch (error) {
    console.error('Update menu item error:', error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const supabase = await createClient();
    const { itemId } = params;

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

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete menu item error:', error);
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
