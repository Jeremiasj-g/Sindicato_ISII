import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type { Permission, User } from '../types'
import { hasUserPermission } from '../utils/permissions'

type PermissionAction = Permission['actions'][number]

interface UserContextType {
  currentUser: User | null
  hasPermission: (module: string, action: PermissionAction) => boolean
  canRead: (module: string) => boolean
  canWrite: (module: string) => boolean
  canDelete: (module: string) => boolean
  canAdmin: (module: string) => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: currentUser } = useAuth()

  const hasPermission = (module: string, action: PermissionAction) => {
    return hasUserPermission(currentUser, module, action)
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        hasPermission,
        canRead: (module) => hasPermission(module, 'read'),
        canWrite: (module) => hasPermission(module, 'write'),
        canDelete: (module) => hasPermission(module, 'delete'),
        canAdmin: (module) => hasPermission(module, 'admin')
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}
