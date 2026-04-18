import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { User } from '../types';

interface UserContextType {
  currentUser: User | null;
  hasPermission: (module: string, action: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: currentUser } = useAuth();

  const hasPermission = (module: string, action: string): boolean => {
    if (!currentUser) return false;
    const modulePermission = currentUser.permissions.find(p => p.module === module);
    return modulePermission?.actions.includes(action as any) || false;
  };

  return (
    <UserContext.Provider value={{ currentUser, hasPermission }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}