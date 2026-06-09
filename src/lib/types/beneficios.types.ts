import type { Database } from './database.types'
import type { Beneficio, Factura, TipoBeneficio } from '../../types'

export type BeneficioDB = Database['public']['Tables']['beneficios']['Row']
export type BeneficioInsert = Database['public']['Tables']['beneficios']['Insert']
export type BeneficioUpdate = Database['public']['Tables']['beneficios']['Update']

export type FacturaDB = Database['public']['Tables']['facturas']['Row']
export type FacturaInsert = Database['public']['Tables']['facturas']['Insert']
export type FacturaUpdate = Database['public']['Tables']['facturas']['Update']

export type TipoBeneficioDB = Database['public']['Tables']['tipos_beneficio']['Row']
export type TipoBeneficioInsert = Database['public']['Tables']['tipos_beneficio']['Insert']
export type TipoBeneficioUpdate = Database['public']['Tables']['tipos_beneficio']['Update']

export interface CreateBeneficioInput extends Partial<Beneficio> {}
export interface UpdateBeneficioInput extends Partial<Beneficio> {}

export interface CreateTipoBeneficioInput {
  nombre: string
  categoria?: string
}

export interface UpdateTipoBeneficioInput {
  nombre?: string
  categoria?: string
}

export type BeneficioControllerResponse = {
  data: Beneficio | null
  error: string | null
}

export type BeneficiosControllerResponse = {
  data: Beneficio[]
  error: string | null
}

export type TipoBeneficiosControllerResponse = {
  data: TipoBeneficio[]
  error: string | null
}

export type MutationResponse = {
  success: boolean
  error: string | null
}