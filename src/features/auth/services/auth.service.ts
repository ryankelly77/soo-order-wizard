import { createClient } from '@/lib/supabase/client';
import type { User } from '@/contracts/types';
import type { LoginInput, CreateUserInput } from '@/contracts/schemas';

export async function login({ email, password }: LoginInput) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function register(input: CreateUserInput) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
        company_name: input.companyName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function logout() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch additional user profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email!,
    firstName: profile?.first_name || user.user_metadata.first_name || '',
    lastName: profile?.last_name || user.user_metadata.last_name || '',
    phone: profile?.phone,
    companyName: profile?.company_name,
    role: profile?.role || 'customer',
    preferences: profile?.preferences || {
      communicationPreferences: {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: false,
      },
    },
    createdAt: new Date(user.created_at),
    updatedAt: new Date(profile?.updated_at || user.created_at),
  };
}

export async function resetPassword(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
}
