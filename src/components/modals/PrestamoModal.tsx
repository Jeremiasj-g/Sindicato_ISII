import { useEffect, useState } from 'react'
import { DollarSign, Save, X } from 'lucide-react'
import type { Prestamo } from '../../types'
import { useData } from '../../context/DataContext'
import {
  calcularMontoCuota,
  calcularTotalConInteres
} from '../../utils/prestamoUtils'

interface PrestamoModalProps {
  prestamo: Prestamo | null
  isOpen: boolean
  onClose: () => void
}

export function PrestamoModal({ prestamo, isOpen, onClose }: PrestamoModalProps) {
  const { empleados, addPrestamo, updatePrestamo } = useData()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<Partial<Prestamo>>({
    empleadoId: '',
    monto: 0,
    interesPorcentaje: 5,
    cuotas: 1,
    fechaOtorgamiento: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    activo: true
  })

  useEffect(() => {
    if (prestamo) {
      setFormData(prestamo)
    } else {
      setFormData({
        empleadoId: '',
        monto: 0,
        interesPorcentaje: 5,
        cuotas: 1,
        fechaOtorgamiento: new Date().toISOString().split('T')[0],
        fechaFin: new Date().toISOString().split('T')[0],
        activo: true
      })
    }
  }, [prestamo, isOpen])

  if (!isOpen) return null

  const monto = Number(formData.monto ?? 0)
  const interes = Number(formData.interesPorcentaje ?? 5)
  const cuotas = Number(formData.cuotas ?? 1)
  const total = calcularTotalConInteres(monto, interes)
  const montoCuota = calcularMontoCuota(monto, interes, cuotas)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const prestamoData: Prestamo = {
      id: prestamo?.id || '',
      empleadoId: formData.empleadoId || '',
      monto,
      interesPorcentaje: interes,
      totalConInteres: total,
      cuotas,
      cuotasPagadas: prestamo?.cuotasPagadas ?? 0,
      cuotasRestantes: cuotas - (prestamo?.cuotasPagadas ?? 0),
      montoCuota,
      fechaOtorgamiento: formData.fechaOtorgamiento || '',
      fechaFin: formData.fechaFin || '',
      estado: formData.activo === false ? 'finalizado' : 'activo',
      activo: formData.activo ?? true,
      observaciones: formData.observaciones || ''
    }

    setSaving(true)

    const result = prestamo
      ? await updatePrestamo(prestamo.id, prestamoData)
      : await addPrestamo(prestamoData)

    setSaving(false)

    if (!result.success) {
      window.alert(result.error ?? 'No se pudo guardar el préstamo.')
      return
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {prestamo ? 'Editar Préstamo' : 'Nuevo Préstamo'}
            </h2>
            <p className="text-blue-100 text-sm">
              Gestión de préstamos sindicales
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empleado *
            </label>
            <select
              value={formData.empleadoId || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, empleadoId: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar empleado</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} {emp.apellido} - {emp.legajo}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.monto || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, monto: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interés %
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.interesPorcentaje ?? 5}
                onChange={(e) => setFormData((prev) => ({ ...prev, interesPorcentaje: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuotas *
              </label>
              <input
                type="number"
                min="1"
                value={formData.cuotas || 1}
                onChange={(e) => setFormData((prev) => ({ ...prev, cuotas: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div>
              <p className="text-sm text-gray-600">Total con interés</p>
              <p className="text-xl font-bold text-gray-900">
                ${total.toLocaleString('es-AR')}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Monto por cuota</p>
              <p className="text-xl font-bold text-blue-600">
                ${montoCuota.toLocaleString('es-AR')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha otorgamiento *
              </label>
              <input
                type="date"
                value={formData.fechaOtorgamiento || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, fechaOtorgamiento: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha finalización *
              </label>
              <input
                type="date"
                value={formData.fechaFin || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, fechaFin: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {prestamo && (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.activo ?? true}
                onChange={(e) => setFormData((prev) => ({ ...prev, activo: e.target.checked }))}
              />
              <span className="text-sm text-gray-700">Préstamo activo</span>
            </label>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}