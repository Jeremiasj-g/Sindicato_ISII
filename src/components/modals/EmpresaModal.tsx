import { useEffect, useState } from 'react'
import { X, Save, Building2 } from 'lucide-react'
import type { Empresa } from '../../types'

interface EmpresaModalProps {
  empresa: Empresa | null
  isOpen: boolean
  onClose: () => void
  onSave: (empresa: Partial<Empresa>) => Promise<void>
}

export function EmpresaModal({ empresa, isOpen, onClose, onSave }: EmpresaModalProps) {
  const [nombre, setNombre] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setNombre(empresa?.nombre ?? '')
  }, [empresa])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim()) {
      window.alert('El nombre de la empresa es obligatorio.')
      return
    }

    setSaving(true)
    await onSave({ nombre })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {empresa ? 'Editar Empresa' : 'Nueva Empresa'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la empresa
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Aguas de Corrientes"
            />
          </div>

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