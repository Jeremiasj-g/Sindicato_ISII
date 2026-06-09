import type { Database } from './database.types'
import type { Prestamo } from '../../types'

export type PrestamoDB = Database['public']['Tables']['prestamos']['Row']
export type PrestamoInsert = Database['public']['Tables']['prestamos']['Insert']
export type PrestamoUpdate = Database['public']['Tables']['prestamos']['Update']

export type CuotaPrestamoDB = Database['public']['Tables']['cuotas_prestamo']['Row']
export type CuotaPrestamoInsert = Database['public']['Tables']['cuotas_prestamo']['Insert']
export type CuotaPrestamoUpdate = Database['public']['Tables']['cuotas_prestamo']['Update']

export interface CreatePrestamoInput extends Partial<Prestamo> {}

export interface UpdatePrestamoInput extends Partial<Prestamo> {}

export type PrestamoControllerResponse = {
  data: Prestamo | null
  error: string | null
}

export type PrestamosControllerResponse = {
  data: Prestamo[]
  error: string | null
}

export type PrestamoMutationResponse = {
  success: boolean
  error: string | null
}