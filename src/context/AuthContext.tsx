import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, getCurrentUser, signOut } from '../lib/supabase';
import { User, Permission } from '../types';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getCurrentUser().then(({ user: supabaseUser }) => {
      if (supabaseUser) {
        setSupabaseUser(supabaseUser);
        // Convert Supabase user to our User type
        const userData: User = {
          id: supabaseUser.id,
          username: supabaseUser.email?.split('@')[0] || '',
          nombre: supabaseUser.user_metadata?.nombre || supabaseUser.email || '',
          role: supabaseUser.user_metadata?.role || 'secretaria',
          permissions: getPermissionsByRole(supabaseUser.user_metadata?.role || 'secretaria'),
          isActive: true
        };
        setUser(userData);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          const userData: User = {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || '',
            nombre: session.user.user_metadata?.nombre || session.user.email || '',
            role: session.user.user_metadata?.role || 'secretaria',
            permissions: getPermissionsByRole(session.user.user_metadata?.role || 'secretaria'),
            isActive: true
          };
          setUser(userData);
        } else {
          setUser(null);
          setSupabaseUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setSupabaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to get permissions based on role
function getPermissionsByRole(role: string): Permission[] {
  switch (role) {
    case 'administrador':
      return [
        { module: 'empleados', actions: ['read', 'write', 'delete', 'admin'] as const },
        { module: 'beneficios', actions: ['read', 'write', 'delete', 'admin'] as const },
        { module: 'reportes', actions: ['read', 'write', 'admin'] as const },
        { module: 'configuracion', actions: ['read', 'write', 'admin'] as const }
      ];
    case 'secretario_hacienda':
      return [
        { module: 'empleados', actions: ['read'] as const },
        { module: 'beneficios', actions: ['read', 'write'] as const },
        { module: 'reportes', actions: ['read', 'write'] as const },
        { module: 'configuracion', actions: ['read'] as const }
      ];
    case 'secretaria':
      return [
        { module: 'empleados', actions: ['read', 'write'] as const },
        { module: 'beneficios', actions: ['read', 'write'] as const },
        { module: 'reportes', actions: ['read'] as const },
        { module: 'configuracion', actions: ['read'] as const }
      ];
    case 'desarrollador':
      return [
        { module: 'empleados', actions: ['read'] as const },
        { module: 'beneficios', actions: ['read'] as const },
        { module: 'reportes', actions: ['read'] as const },
        { module: 'configuracion', actions: ['read', 'write', 'admin'] as const }
      ];
    default:
      return [];
  }
}