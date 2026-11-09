import { createContext, useContext, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Profile, Role } from '@/lib/supabase';
import { MOCK_ADMIN_PROFILE } from '@/lib/mockData';

type AuthContextType = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: Role, location?: string, phone?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        session: null,
        profile: MOCK_ADMIN_PROFILE,
        loading: false,
        signUp: async () => ({ error: null }),
        signIn: async () => ({ error: null }),
        signOut: async () => {},
        refreshProfile: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
