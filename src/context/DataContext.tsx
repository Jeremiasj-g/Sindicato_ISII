import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Empleado, Beneficio, Prestamo } from '../types'
import {
  createEmpleado as createEmpleadoController,
  deleteEmpleado as deleteEmpleadoController,
  getAllEmpleados as getAllEmpleadosController,
  updateEmpleado as updateEmpleadoController
} from '../lib/controllers/empleado.controller'
import {
  getFamiliaresByEmpleadoId,
  replaceGrupoFamiliar
} from '../lib/controllers/familiar.controller'

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
  addBeneficio: (beneficio: Beneficio) => void
  updateBeneficio: (id: string, beneficio: Partial<Beneficio>) => void
  getBeneficiosByEmpleado: (empleadoId: string) => Beneficio[]
  addPrestamo: (prestamo: Prestamo) => void
  updatePrestamo: (id: string, prestamo: Partial<Prestamo>) => void
  getPrestamosByEmpleado: (empleadoId: string) => Prestamo[]
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

  const addBeneficio = (beneficio: Beneficio) => {
    setBeneficios((prev) => [...prev, beneficio])
  }

  const updateBeneficio = (id: string, updatedBeneficio: Partial<Beneficio>) => {
    setBeneficios((prev) => prev.map((ben) =>
      ben.id === id ? { ...ben, ...updatedBeneficio } : ben
    ))
  }

  const getBeneficiosByEmpleado = (empleadoId: string): Beneficio[] => {
    return beneficios.filter((ben) => ben.empleadoId === empleadoId)
  }

  const addPrestamo = (prestamo: Prestamo) => {
    setPrestamos((prev) => [...prev, prestamo])
  }

  const updatePrestamo = (id: string, updatedPrestamo: Partial<Prestamo>) => {
    setPrestamos((prev) => prev.map((pres) =>
      pres.id === id ? { ...pres, ...updatedPrestamo } : pres
    ))
  }

  const getPrestamosByEmpleado = (empleadoId: string): Prestamo[] => {
    return prestamos.filter((pres) => pres.empleadoId === empleadoId)
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
      addBeneficio,
      updateBeneficio,
      getBeneficiosByEmpleado,
      addPrestamo,
      updatePrestamo,
      getPrestamosByEmpleado
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