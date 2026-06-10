import type { Prestamo } from '../../types'
import {
  createPrestamo,
  deletePrestamo,
  getAllPrestamos,
  pagarCuotaPrestamo,
  revertirUltimaCuotaPrestamo,
  updatePrestamo
} from '../controllers/prestamo.controller'
import type { CreatePrestamoInput, UpdatePrestamoInput } from '../types/prestamos.types'

type MutationResult = {
  success: boolean
  error: string | null
}

export const PrestamoFacade = {
  async listar() {
    return getAllPrestamos()
  },

  async crear(prestamo: CreatePrestamoInput) {
    return createPrestamo(prestamo)
  },

  async actualizar(id: string, prestamo: UpdatePrestamoInput) {
    return updatePrestamo(Number(id), prestamo)
  },

  async eliminar(id: string): Promise<MutationResult> {
    return deletePrestamo(Number(id))
  },

  async pagarCuota(id: string): Promise<MutationResult> {
    return pagarCuotaPrestamo(Number(id))
  },

  async revertirUltimoPago(id: string): Promise<MutationResult> {
    return revertirUltimaCuotaPrestamo(Number(id))
  },

  filtrarPorEmpleado(prestamos: Prestamo[], empleadoId: string) {
    return prestamos.filter((prestamo) => prestamo.empleadoId === empleadoId)
  }
}