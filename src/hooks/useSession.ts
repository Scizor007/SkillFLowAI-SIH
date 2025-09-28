
import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get the current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", currentSession);
        
        if (currentSession) {
          setSession(currentSession);
          // Get user data from session
          const userInfo: User = {
            id: currentSession.user.id,
            name: currentSession.user.user_metadata.name || '',
            email: currentSession.user.email || '',
            skills: currentSession.user.user_metadata.skills || [],
            visualPoints: 0,
            textualPoints: 0,
            createdAt: currentSession.user.created_at,
            updatedAt: new Date().toISOString(),
          };
          setUser(userInfo);
          localStorage.setItem('user', JSON.stringify(userInfo));
        } else {
          // Check for stored user data
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (error) {
              console.error('Failed to parse stored user data:', error);
              localStorage.removeItem('user');
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state change event:", event);
        console.log("New session:", newSession);
        
        setSession(newSession);
        
        if (newSession) {
          // Get user data from session
          const userInfo: User = {
            id: newSession.user.id,
            name: newSession.user.user_metadata.name || '',
            email: newSession.user.email || '',
            skills: newSession.user.user_metadata.skills || [],
            visualPoints: 0,
            textualPoints: 0,
            createdAt: newSession.user.created_at,
            updatedAt: new Date().toISOString(),
          };
          setUser(userInfo);
          localStorage.setItem('user', JSON.stringify(userInfo));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
  };
}
