'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import * as authService from '../services/auth.service';
import type { User } from '@/contracts/types';
import type { LoginInput, CreateUserInput } from '@/contracts/schemas';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN') {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const login = useCallback(async (input: LoginInput) => {
    setIsLoading(true);
    try {
      await authService.login(input);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (input: CreateUserInput) => {
    setIsLoading(true);
    try {
      await authService.register(input);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}
