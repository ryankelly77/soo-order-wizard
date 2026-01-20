'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const checkAdmin = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        setIsAdmin(false);
        return false;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, is_admin')
        .eq('id', authUser.id)
        .single();

      const adminUser: AdminUser = {
        id: authUser.id,
        email: authUser.email || '',
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        isAdmin: profile?.is_admin === true,
      };

      setUser(adminUser);
      setIsAdmin(adminUser.isAdmin);
      return adminUser.isAdmin;
    } catch {
      setUser(null);
      setIsAdmin(false);
      return false;
    }
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await checkAdmin();
      setIsLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN') {
          await checkAdmin();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, checkAdmin]);

  const requireAdmin = useCallback(async () => {
    const hasAdmin = await checkAdmin();
    if (!hasAdmin) {
      router.push('/login?error=unauthorized');
      return false;
    }
    return true;
  }, [checkAdmin, router]);

  return {
    user,
    isAdmin,
    isLoading,
    isAuthenticated: !!user,
    requireAdmin,
    checkAdmin,
  };
}
