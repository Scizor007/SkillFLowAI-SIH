
import { User } from '@/types';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type AuthResponse = {
  user: SupabaseUser | null;
  session: Session | null;
} | null;

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean; // Added this property to match usage in ProtectedRoute
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  session: Session | null;
}
