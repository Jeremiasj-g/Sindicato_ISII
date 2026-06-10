import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, getCurrentUser, signOut } from '../lib/supabase'
import type { User } from '../types'
import { getPermissionsByRole, normalizeRole } from '../utils/permissions'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mapSupabaseUserToUser = (supabaseUser: SupabaseUser): User => {
  const role = normalizeRole(supabaseUser.user_metadata?.role)
  const email = supabaseUser.email ?? ''

  return {
    id: supabaseUser.id,
    username: email.split('@')[0] || supabaseUser.user_metadata?.username || '',
    nombre: supabaseUser.user_metadata?.nombre || email || 'Usuario',
    email,
    role,
    permissions: getPermissionsByRole(role),
    isActive: true
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then(({ user: currentSupabaseUser }) => {
      if (currentSupabaseUser) {
        setSupabaseUser(currentSupabaseUser)
        setUser(mapSupabaseUserToUser(currentSupabaseUser))
      }

      setLoading(false)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user)
        setUser(mapSupabaseUserToUser(session.user))
      } else {
        setUser(null)
        setSupabaseUser(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setSupabaseUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
