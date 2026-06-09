import type { Database } from './database.types'
import type { Empresa } from '../../types'

export type EmpresaDB = Database['public']['Tables']['empresas']['Row']
export type EmpresaInsert = Database['public']['Tables']['empresas']['Insert']
export type EmpresaUpdate = Database['public']['Tables']['empresas']['Update']

export interface CreateEmpresaInput {
  nombre: string
}

export interface UpdateEmpresaInput {
  nombre?: string
}

export type EmpresaControllerResponse = {
  data: Empresa | null
  error: string | null
}

export type EmpresasControllerResponse = {
  data: Empresa[]
  error: string | null
}

export type EmpresaMutationResponse = {
  success: boolean
  error: string | null
}