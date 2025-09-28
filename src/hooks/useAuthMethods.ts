
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthResponse } from '@/context/auth/types';

export function useAuthMethods() {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Logged in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      // Changed to not require email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            email: email
          }
        }
      });

      if (error) throw error;

      // Check if email confirmation is required or if user is created directly
      if (data?.user && !data.user.identities?.length) {
        toast.error('Email address is already registered. Please login instead.');
      } else if (data?.user && data.session) {
        // User is immediately signed in (email confirmation is disabled in Supabase)
        toast.success('Account created successfully! Redirecting...');
      } else {
        // Email confirmation is required
        toast.success('Account created successfully! Please check your email for verification.');
      }
      
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Signup failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });

      if (error) throw error;
      
      console.log("Google OAuth initiated, redirecting to:", data.url);
      toast.success('Redirecting to Google for authentication...');
    } catch (error: any) {
      console.error("Google OAuth error:", error);
      toast.error(error.message || 'Google login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    login,
    signup,
    signInWithGoogle,
    logout,
  };
}
