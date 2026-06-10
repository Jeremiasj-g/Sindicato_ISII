import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Empleado, Beneficio, Prestamo } from '../types'
import {
  createEmpleado as createEmpleadoController,
  deleteEmpleado as deleteEmpleadoController,
  getAllEmpleados as getAllEmpleadosController,
  updateEmpleado as updateEmpleadoController
} from '../lib/controllers/empleado.controller'

import {
  createBeneficio as createBeneficioController,
  getAllBeneficios as getAllBeneficiosController,
  updateBeneficio as updateBeneficioController,
  deleteBeneficio as deleteBeneficioController
} from '../lib/controllers/beneficio.controller'

import {
  getFamiliaresByEmpleadoId,
  replaceGrupoFamiliar
} from '../lib/controllers/familiar.controller'

import { PrestamoFacade } from '../lib/facades/prestamo.facade'

type MutationResult = {
  success: boolean
  error: string | null
}

interface DataContextType {
  empleados: Empleado[]
  beneficios: Beneficio[]
  prestamos: Prestamo[]
  loadingEmpleados: boolean
  errorEmpleados: string | null
  addEmpleado: (empleado: Empleado) => Promise<MutationResult>
  updateEmpleado: (id: string, empleado: Partial<Empleado>) => Promise<MutationResult>
  deleteEmpleado: (id: string) => Promise<MutationResult>
  refreshEmpleados: () => Promise<void>
  getEmpleadoById: (id: string) => Empleado | undefined
  searchEmpleados: (query: string) => Empleado[]
  loadingBeneficios: boolean
  errorBeneficios: string | null
  addBeneficio: (beneficio: Beneficio) => Promise<MutationResult>
  updateBeneficio: (id: string, beneficio: Partial<Beneficio>) => Promise<MutationResult>
  deleteBeneficio: (id: string) => Promise<MutationResult>
  refreshBeneficios: () => Promise<void>
  getBeneficiosByEmpleado: (empleadoId: string) => Beneficio[]

  loadingPrestamos: boolean
  errorPrestamos: string | null
  addPrestamo: (prestamo: Prestamo) => Promise<MutationResult>
  updatePrestamo: (id: string, prestamo: Partial<Prestamo>) => Promise<MutationResult>
  deletePrestamo: (id: string) => Promise<MutationResult>
  pagarCuotaPrestamo: (id: string) => Promise<MutationResult>
  refreshPrestamos: () => Promise<void>
  getPrestamosByEmpleado: (empleadoId: string) => Prestamo[]
  revertirUltimaCuotaPrestamo: (
    id: string
  ) => Promise<MutationResult>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const hydrateEmpleadosConFamilia = async (empleadosBase: Empleado[]) => {
  const empleadosConFamilia = await Promise.all(
    empleadosBase.map(async (empleado) => {
      const { data: grupoFamiliar } = await getFamiliaresByEmpleadoId(Number(empleado.id))

      return {
        ...empleado,
        grupoFamiliar,
        beneficios: empleado.beneficios ?? [],
        prestamos: empleado.prestamos ?? []
      }
    })
  )

  return empleadosConFamilia
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [beneficios, setBeneficios] = useState<Beneficio[]>([])
  const [prestamos, setPrestamos] = useState<Prestamo[]>([])
  const [loadingEmpleados, setLoadingEmpleados] = useState(true)
  const [errorEmpleados, setErrorEmpleados] = useState<string | null>(null)
  const [loadingBeneficios, setLoadingBeneficios] = useState(true)
  const [errorBeneficios, setErrorBeneficios] = useState<string | null>(null)
  const [loadingPrestamos, setLoadingPrestamos] = useState(true)
  const [errorPrestamos, setErrorPrestamos] = useState<string | null>(null)

  const refreshEmpleados = async () => {
    setLoadingEmpleados(true)
    setErrorEmpleados(null)

    const { data, error } = await getAllEmpleadosController()

    if (error) {
      setErrorEmpleados(error)
      setEmpleados([])
      setLoadingEmpleados(false)
      return
    }

    const empleadosConFamilia = await hydrateEmpleadosConFamilia(data)
    setEmpleados(empleadosConFamilia)
    setLoadingEmpleados(false)
  }

  useEffect(() => {
    void refreshEmpleados()
    void refreshBeneficios()
    void refreshPrestamos()
  }, [])

  const addEmpleado = async (empleado: Empleado): Promise<MutationResult> => {
    const { data, error } = await createEmpleadoController(empleado)

    if (error || !data) {
      return {
        success: false,
        error: error ?? 'No se pudo crear el empleado.'
      }
    }

    const { success, error: familiaError } = await replaceGrupoFamiliar(
      Number(data.id),
      empleado.grupoFamiliar ?? []
    )

    if (!success) {
      return {
        success: false,
        error: familiaError
      }
    }

    const { data: grupoFamiliar } = await getFamiliaresByEmpleadoId(Number(data.id))

    setEmpleados((prev) => [
      ...prev,
      {
        ...data,
        grupoFamiliar,
        beneficios: [],
        prestamos: []
      }
    ])

    return {
      success: true,
      error: null
    }
  }

  const updateEmpleado = async (id: string, updatedEmpleado: Partial<Empleado>): Promise<MutationResult> => {
    const { data, error } = await updateEmpleadoController(Number(id), updatedEmpleado)

    if (error || !data) {
      return {
        success: false,
        error: error ?? 'No se pudo actualizar el empleado.'
      }
    }

    const grupoFamiliarActualizado = updatedEmpleado.grupoFamiliar ?? []
    const { success, error: familiaError } = await replaceGrupoFamiliar(
      Number(id),
      grupoFamiliarActualizado
    )

    if (!success) {
      return {
        success: false,
        error: familiaError
      }
    }

    const { data: grupoFamiliar } = await getFamiliaresByEmpleadoId(Number(id))

    setEmpleados((prev) => prev.map((emp) => (
      emp.id === id
        ? {
          ...emp,
          ...data,
          grupoFamiliar,
          updatedAt: new Date().toISOString()
        }
        : emp
    )))

    return {
      success: true,
      error: null
    }
  }

  const deleteEmpleado = async (id: string): Promise<MutationResult> => {
    const { success, error } = await deleteEmpleadoController(Number(id))

    if (!success) {
      return {
        success: false,
        error: error ?? 'No se pudo eliminar el empleado.'
      }
    }

    setEmpleados((prev) => prev.map((emp) => (
      emp.id === id
        ? {
          ...emp,
          estadoLaboral: 'inactivo',
          updatedAt: new Date().toISOString()
        }
        : emp
    )))

    return {
      success: true,
      error: null
    }
  }

  const getEmpleadoById = (id: string): Empleado | undefined => {
    return empleados.find((emp) => emp.id === id)
  }

  const searchEmpleados = (query: string): Empleado[] => {
    const searchTerm = query.trim().toLowerCase()

    if (!searchTerm) return empleados

    return empleados.filter((emp) =>
      `${emp.nombre} ${emp.apellido}`.toLowerCase().includes(searchTerm)
      || emp.dni.toLowerCase().includes(searchTerm)
      || emp.cuil.toLowerCase().includes(searchTerm)
      || emp.legajo.toLowerCase().includes(searchTerm)
    )
  }

  const refreshBeneficios = async () => {
    setLoadingBeneficios(true)
    setErrorBeneficios(null)

    const { data, error } = await getAllBeneficiosController()

    if (error) {
      setErrorBeneficios(error)
      setBeneficios([])
      setLoadingBeneficios(false)
      return
    }

    setBeneficios(data)
    setLoadingBeneficios(false)
  }

  const addBeneficio = async (beneficio: Beneficio): Promise<MutationResult> => {
    const { data, error } = await createBeneficioController(beneficio)

    if (error || !data) {
      return {
        success: false,
        error: error ?? 'No se pudo crear el beneficio.'
      }
    }

    setBeneficios((prev) => [data, ...prev])

    return {
      success: true,
      error: null
    }
  }

  const updateBeneficio = async (
    id: string,
    updatedBeneficio: Partial<Beneficio>
  ): Promise<MutationResult> => {
    const { data, error } = await updateBeneficioController(Number(id), updatedBeneficio)

    if (error || !data) {
      return {
        success: false,
        error: error ?? 'No se pudo actualizar el beneficio.'
      }
    }

    setBeneficios((prev) => prev.map((ben) =>
      ben.id === id ? data : ben
    ))

    return {
      success: true,
      error: null
    }
  }

  const deleteBeneficio = async (id: string): Promise<MutationResult> => {
    const { success, error } = await deleteBeneficioController(Number(id))

    if (!success) {
      return {
        success: false,
        error: error ?? 'No se pudo eliminar el beneficio.'
      }
    }

    setBeneficios((prev) => prev.filter((ben) => ben.id !== id))

    return {
      success: true,
      error: null
    }
  }

  const getBeneficiosByEmpleado = (empleadoId: string): Beneficio[] => {
    return beneficios.filter((ben) => ben.empleadoId === empleadoId)
  }

  // Prestamos
  // Prestamos usando patrón Fachada
  const refreshPrestamos = async () => {
    setLoadingPrestamos(true)
    setErrorPrestamos(null)

    const { data, error } = await PrestamoFacade.listar()

    if (error) {
      setErrorPrestamos(error)
      setPrestamos([])
      setLoadingPrestamos(false)
      return
    }

    setPrestamos(data)
    setLoadingPrestamos(false)
  }

  const addPrestamo = async (prestamo: Prestamo): Promise<MutationResult> => {
    const { data, error } = await PrestamoFacade.crear(prestamo)

    if (error || !data) {
      return {
        success: false,
        error: error ?? 'No se pudo crear el préstamo.'
      }
    }

    setPrestamos((prev) => [data, ...prev])

    return {
      success: true,
      error: null
    }
  }

  const updatePrestamo = async (
    id: string,
    updatedPrestamo: Partial<Prestamo>
  ): Promise<MutationResult> => {
    const { data, error } = await PrestamoFacade.actualizar(id, updatedPrestamo)

    if (error || !data) {
      return {
        success: false,
        error: error ?? 'No se pudo actualizar el préstamo.'
      }
    }

    setPrestamos((prev) =>
      prev.map((prestamo) => (prestamo.id === id ? data : prestamo))
    )

    return {
      success: true,
      error: null
    }
  }

  const deletePrestamo = async (id: string): Promise<MutationResult> => {
    const { success, error } = await PrestamoFacade.eliminar(id)

    if (!success) {
      return {
        success: false,
        error: error ?? 'No se pudo eliminar el préstamo.'
      }
    }

    setPrestamos((prev) => prev.filter((prestamo) => prestamo.id !== id))

    return {
      success: true,
      error: null
    }
  }

  const pagarCuotaPrestamo = async (id: string): Promise<MutationResult> => {
    const { success, error } = await PrestamoFacade.pagarCuota(id)

    if (!success) {
      return {
        success: false,
        error: error ?? 'No se pudo pagar la cuota.'
      }
    }

    await refreshPrestamos()

    return {
      success: true,
      error: null
    }
  }

  const revertirUltimaCuotaPrestamo = async (
    id: string
  ): Promise<MutationResult> => {
    const { success, error } = await PrestamoFacade.revertirUltimoPago(id)

    if (!success) {
      return {
        success: false,
        error: error ?? 'No se pudo revertir el último pago.'
      }
    }

    await refreshPrestamos()

    return {
      success: true,
      error: null
    }
  }

  const getPrestamosByEmpleado = (empleadoId: string): Prestamo[] => {
    return PrestamoFacade.filtrarPorEmpleado(prestamos, empleadoId)
  }

  return (
    <DataContext.Provider value={{
      empleados,
      beneficios,
      prestamos,
      loadingEmpleados,
      errorEmpleados,
      addEmpleado,
      updateEmpleado,
      deleteEmpleado,
      refreshEmpleados,
      getEmpleadoById,
      searchEmpleados,
      loadingBeneficios,
      errorBeneficios,
      deleteBeneficio,
      refreshBeneficios,
      addBeneficio,
      updateBeneficio,
      getBeneficiosByEmpleado,
      addPrestamo,
      updatePrestamo,
      getPrestamosByEmpleado,
      loadingPrestamos,
      errorPrestamos,
      deletePrestamo,
      pagarCuotaPrestamo,
      refreshPrestamos,
      revertirUltimaCuotaPrestamo
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}