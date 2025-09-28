
import React from 'react';
import { useSession } from '@/hooks/useSession';
import { useAuthMethods } from '@/hooks/useAuthMethods';

export function useAuthProvider() {
  const { user, session, isLoading, loading } = useSession();
  const { login, signup, logout, signInWithGoogle } = useAuthMethods();

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    loading, // Keep this alias for backward compatibility
    login,
    signup,
    logout,
    signInWithGoogle,
    session,
  };
}
