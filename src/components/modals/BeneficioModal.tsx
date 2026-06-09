import { useState, useEffect } from 'react'
import { X, Save, FileText, Plus, Trash2 } from 'lucide-react'
import { Beneficio, Factura, TipoBeneficio } from '../../types'
import { useData } from '../../context/DataContext'
import { getAllTiposBeneficio } from '../../lib/controllers/tipo-beneficio.controller'

interface BeneficioModalProps {
  beneficio: Beneficio | null
  isOpen: boolean
  onClose: () => void
}

export function BeneficioModal({ beneficio, isOpen, onClose }: BeneficioModalProps) {
  const { addBeneficio, updateBeneficio, empleados } = useData()
  const [tiposBeneficio, setTiposBeneficio] = useState<TipoBeneficio[]>([])
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<Partial<Beneficio>>({
    empleadoId: '',
    tipo: '',
    descripcion: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    estado: 'pendiente',
    observaciones: '',
    facturas: [],
    beneficiario: ''
  })

  useEffect(() => {
    const loadTipos = async () => {
      const { data, error } = await getAllTiposBeneficio()

      if (error) {
        window.alert(error)
        return
      }

      setTiposBeneficio(data)

      if (!beneficio && data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          tipo: prev.tipo || data[0].id
        }))
      }
    }

    if (isOpen) {
      void loadTipos()
    }
  }, [isOpen, beneficio])

  useEffect(() => {
    if (beneficio) {
      setFormData(beneficio)
    } else {
      setFormData({
        empleadoId: '',
        tipo: '',
        descripcion: '',
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
        estado: 'pendiente',
        observaciones: '',
        facturas: [],
        beneficiario: ''
      })
    }
  }, [beneficio])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const beneficioData: Beneficio = {
      id: beneficio?.id || '',
      empleadoId: formData.empleadoId || '',
      tipo: formData.tipo || '',
      descripcion: formData.descripcion || '',
      monto: formData.monto || 0,
      fecha: formData.fecha || '',
      estado: formData.estado || 'pendiente',
      observaciones: formData.observaciones || '',
      facturas: formData.facturas || [],
      beneficiario: formData.beneficiario || ''
    }

    setSaving(true)

    const result = beneficio
      ? await updateBeneficio(beneficio.id, beneficioData)
      : await addBeneficio(beneficioData)

    setSaving(false)

    if (!result.success) {
      window.alert(result.error ?? 'No se pudo guardar el beneficio.')
      return
    }

    onClose()
  }

  const addFactura = () => {
    const nuevaFactura: Factura = {
      id: Date.now().toString(),
      beneficioId: beneficio?.id || '',
      numero: '',
      proveedor: '',
      monto: 0,
      fecha: new Date().toISOString().split('T')[0]
    }

    setFormData((prev) => ({
      ...prev,
      facturas: [...(prev.facturas || []), nuevaFactura]
    }))
  }

  const updateFactura = (index: number, factura: Partial<Factura>) => {
    setFormData((prev) => ({
      ...prev,
      facturas: prev.facturas?.map((f, i) =>
        i === index ? { ...f, ...factura } : f
      ) || []
    }))
  }

  const removeFactura = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      facturas: prev.facturas?.filter((_, i) => i !== index) || []
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {beneficio ? 'Editar Beneficio' : 'Nuevo Beneficio'}
            </h2>
            <p className="text-blue-100 text-sm">
              Registrar asistencia económica o beneficio
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Empleado *</label>
                <select
                  value={formData.empleadoId || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, empleadoId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Beneficio *</label>
                <select
                  value={formData.tipo || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tipo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposBeneficio.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monto *</label>
                <input
                  type="number"
                  value={formData.monto || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, monto: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                <input
                  type="date"
                  value={formData.fecha || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fecha: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Beneficiario</label>
              <input
                type="text"
                value={formData.beneficiario || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, beneficiario: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Hijo - Santiago Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
              <textarea
                value={formData.descripcion || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
              <textarea
                value={formData.observaciones || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, observaciones: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Facturas y Comprobantes</h3>
                <button
                  type="button"
                  onClick={addFactura}
                  className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar Factura</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.facturas?.map((factura, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <input
                        type="text"
                        value={factura.numero}
                        onChange={(e) => updateFactura(index, { numero: e.target.value })}
                        className="border border-gray-300 rounded px-3 py-2"
                        placeholder="Número"
                      />

                      <input
                        type="text"
                        value={factura.proveedor}
                        onChange={(e) => updateFactura(index, { proveedor: e.target.value })}
                        className="border border-gray-300 rounded px-3 py-2"
                        placeholder="Proveedor"
                      />

                      <input
                        type="number"
                        value={factura.monto}
                        onChange={(e) => updateFactura(index, { monto: parseFloat(e.target.value) || 0 })}
                        className="border border-gray-300 rounded px-3 py-2"
                        placeholder="Monto"
                        min="0"
                        step="0.01"
                      />

                      <div className="flex">
                        <input
                          type="date"
                          value={factura.fecha}
                          onChange={(e) => updateFactura(index, { fecha: e.target.value })}
                          className="flex-1 border border-gray-300 rounded-l px-3 py-2"
                        />
                        <button
                          type="button"
                          onClick={() => removeFactura(index)}
                          className="bg-red-600 text-white px-3 py-2 rounded-r"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {(!formData.facturas || formData.facturas.length === 0) && (
                  <div className="text-center py-6 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No hay facturas registradas</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg">
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Guardando...' : beneficio ? 'Actualizar' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}