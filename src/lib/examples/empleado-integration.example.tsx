/**
 * Example: How to integrate empleado.controller with EmpleadoModal
 * 
 * This file demonstrates the proper way to use the empleado controller
 * in your React components, specifically with the EmpleadoModal.
 */

import { useState, useEffect } from 'react'
import { Empleado } from '../../types'
import { 
  createEmpleado, 
  updateEmpleado, 
  getAllEmpleados,
  getEmpleadoById,
  searchEmpleados 
} from '../controllers/empleado.controller'
import { 
  syncFamiliares,
  getFamiliaresByEmpleadoId 
} from '../controllers/familiar.controller'

/**
 * Example 1: Using controller in EmpleadoModal component
 * 
 * Replace the current handleSubmit in EmpleadoModal with this approach:
 */
export const handleEmpleadoSubmit = async (
  formData: Partial<Empleado>,
  empleadoId?: string
) => {
  try {
    if (empleadoId) {
      // Update existing empleado
      const { data, error } = await updateEmpleado(
        parseInt(empleadoId),
        formData
      )

      if (error) {
        console.error('Error updating empleado:', error)
        alert('Error al actualizar el empleado')
        return { success: false, error }
      }

      // Sync familiares (grupo familiar)
      if (formData.grupoFamiliar && formData.grupoFamiliar.length > 0) {
        const { error: familiaresError } = await syncFamiliares(
          parseInt(empleadoId),
          formData.grupoFamiliar
        )
        
        if (familiaresError) {
          console.warn('Error syncing familiares:', familiaresError)
        }
      }

      return { success: true, data }
    } else {
      // Create new empleado
      const { data, error } = await createEmpleado(formData)

      if (error) {
        console.error('Error creating empleado:', error)
        alert('Error al crear el empleado')
        return { success: false, error }
      }

      // Sync familiares (grupo familiar)
      if (data && formData.grupoFamiliar && formData.grupoFamiliar.length > 0) {
        const { error: familiaresError } = await syncFamiliares(
          parseInt(data.id),
          formData.grupoFamiliar
        )
        
        if (familiaresError) {
          console.warn('Error syncing familiares:', familiaresError)
        }
      }

      return { success: true, data }
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

/**
 * Example 2: Custom hook for empleados management
 */
export const useEmpleados = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all empleados
  const loadEmpleados = async () => {
    setLoading(true)
    const { data, error } = await getAllEmpleados()
    
    if (error) {
      setError(error)
    } else {
      setEmpleados(data)
    }
    
    setLoading(false)
  }

  // Load empleado with familiares
  const loadEmpleadoWithFamiliares = async (empleadoId: number) => {
    const { data: empleado, error: empleadoError } = await getEmpleadoById(empleadoId)
    
    if (empleadoError || !empleado) {
      return { data: null, error: empleadoError }
    }

    const { data: familiares, error: familiaresError } = await getFamiliaresByEmpleadoId(empleadoId)
    
    if (familiaresError) {
      console.warn('Error loading familiares:', familiaresError)
    }

    return {
      data: {
        ...empleado,
        grupoFamiliar: familiares || []
      },
      error: null
    }
  }

  // Search empleados
  const search = async (query: string) => {
    setLoading(true)
    const { data, error } = await searchEmpleados(query)
    
    if (error) {
      setError(error)
    } else {
      setEmpleados(data)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    loadEmpleados()
  }, [])

  return {
    empleados,
    loading,
    error,
    loadEmpleados,
    loadEmpleadoWithFamiliares,
    search
  }
}

/**
 * Example 3: Updating EmpleadosPage to use the controller
 * 
 * Replace the DataContext usage with direct controller calls:
 */
export const EmpleadosPageExample = () => {
  const { empleados, loading, search } = useEmpleados()

  const handleSearch = (query: string) => {
    search(query)
  }

  if (loading) {
    return <div>Cargando empleados...</div>
  }

  return (
    <div>
      {/* Your EmpleadosPage component */}
      <p>Total empleados: {empleados.length}</p>
    </div>
  )
}

/**
 * Example 4: Complete EmpleadoModal integration
 * 
 * Add this to EmpleadoModal component:
 */
export const handleEmpleadoModalSubmit = async (
  e: React.FormEvent,
  formData: Partial<Empleado>,
  empleado: Empleado | null,
  onClose: () => void,
  onSuccess?: () => void
) => {
  e.preventDefault()

  const result = await handleEmpleadoSubmit(
    formData,
    empleado?.id
  )

  if (result.success) {
    alert(empleado ? 'Empleado actualizado correctamente' : 'Empleado creado correctamente')
    onClose()
    
    // Optionally reload the empleados list
    if (onSuccess) {
      onSuccess()
    }
  }
}
