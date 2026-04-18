import { useState, useEffect } from 'react';
import { X, Save, FileText, Plus, Trash2 } from 'lucide-react';
import { Beneficio, Factura } from '../../types';
import { useData } from '../../context/DataContext';

interface BeneficioModalProps {
  beneficio: Beneficio | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BeneficioModal({ beneficio, isOpen, onClose }: BeneficioModalProps) {
  const { addBeneficio, updateBeneficio, empleados } = useData();
  const [formData, setFormData] = useState<Partial<Beneficio>>({
    empleadoId: '',
    tipo: 'voucher_escolar',
    descripcion: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    estado: 'pendiente',
    observaciones: '',
    facturas: [],
    beneficiario: ''
  });

  useEffect(() => {
    if (beneficio) {
      setFormData(beneficio);
    }
  }, [beneficio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const beneficioData: Beneficio = {
      id: beneficio?.id || Date.now().toString(),
      empleadoId: formData.empleadoId || '',
      tipo: formData.tipo || 'voucher_escolar',
      descripcion: formData.descripcion || '',
      monto: formData.monto || 0,
      fecha: formData.fecha || '',
      estado: formData.estado || 'pendiente',
      observaciones: formData.observaciones,
      facturas: formData.facturas || [],
      beneficiario: formData.beneficiario
    };

    if (beneficio) {
      updateBeneficio(beneficio.id, beneficioData);
    } else {
      addBeneficio(beneficioData);
    }
    
    onClose();
  };

  const addFactura = () => {
    const nuevaFactura: Factura = {
      id: Date.now().toString(),
      beneficioId: beneficio?.id || '',
      numero: '',
      proveedor: '',
      monto: 0,
      fecha: new Date().toISOString().split('T')[0]
    };
    
    setFormData(prev => ({
      ...prev,
      facturas: [...(prev.facturas || []), nuevaFactura]
    }));
  };

  const updateFactura = (index: number, factura: Partial<Factura>) => {
    setFormData(prev => ({
      ...prev,
      facturas: prev.facturas?.map((f, i) => 
        i === index ? { ...f, ...factura } : f
      ) || []
    }));
  };

  const removeFactura = (index: number) => {
    setFormData(prev => ({
      ...prev,
      facturas: prev.facturas?.filter((_, i) => i !== index) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
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
            {/* Datos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empleado *
                </label>
                <select
                  value={formData.empleadoId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, empleadoId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar empleado</option>
                  {empleados.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} {emp.apellido} - {emp.legajo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Beneficio *
                </label>
                <select
                  value={formData.tipo || 'voucher_escolar'}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="voucher_escolar">Voucher Escolar</option>
                  <option value="ayuda_universitaria">Ayuda Universitaria</option>
                  <option value="premio_evento">Premio por Evento</option>
                  <option value="asistencia_salud">Asistencia Económica por Salud</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto *
                </label>
                <input
                  type="number"
                  value={formData.monto || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, monto: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.fecha || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beneficiario (opcional)
              </label>
              <input
                type="text"
                value={formData.beneficiario || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, beneficiario: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Hijo - Santiago Pérez"
              />
              <p className="text-xs text-gray-500 mt-1">
                Especificar si el beneficio es para un familiar
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.descripcion || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Detalle del beneficio o asistencia..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Notas adicionales..."
              />
            </div>

            {/* Facturas para auditoría AFIP */}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número de Factura
                        </label>
                        <input
                          type="text"
                          value={factura.numero}
                          onChange={(e) => updateFactura(index, { numero: e.target.value })}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          placeholder="0001-00001234"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Proveedor
                        </label>
                        <input
                          type="text"
                          value={factura.proveedor}
                          onChange={(e) => updateFactura(index, { proveedor: e.target.value })}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre del proveedor"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Monto
                        </label>
                        <div className="flex">
                          <input
                            type="number"
                            value={factura.monto}
                            onChange={(e) => updateFactura(index, { monto: parseFloat(e.target.value) || 0 })}
                            className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                          <button
                            type="button"
                            onClick={() => removeFactura(index)}
                            className="bg-red-600 text-white px-3 py-2 rounded-r hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {(!formData.facturas || formData.facturas.length === 0) && (
                  <div className="text-center py-6 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No hay facturas registradas</p>
                    <p className="text-xs">Importante para auditorías AFIP</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{beneficio ? 'Actualizar' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}