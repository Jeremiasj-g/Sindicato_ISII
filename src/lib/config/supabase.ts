import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey
)

// Check if we're using placeholder values
export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey

// Auth helper functions
export const signUp = async (email: string, password: string, userData: { nombre: string, role: string }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre: userData.nombre,
        role: userData.role
      }
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured) {
    return { data: null, error: { message: 'Supabase no está configurado. Por favor configura las variables de entorno.' } }
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  if (!isSupabaseConfigured) {
    return { error: { message: 'Supabase no está configurado.' } }
  }
  
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured) {
    return { user: null, error: { message: 'Supabase no está configurado.' } }
  }
  
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}
