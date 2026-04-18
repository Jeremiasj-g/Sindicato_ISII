import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, User, Users, Phone } from 'lucide-react';
import { Empleado, Familiar } from '../../types';
import { useData } from '../../context/DataContext';

interface EmpleadoModalProps {
  empleado: Empleado | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmpleadoModal({ empleado, isOpen, onClose }: EmpleadoModalProps) {
  const { addEmpleado, updateEmpleado, empleados } = useData();
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState<Partial<Empleado>>({
    nombre: '',
    apellido: '',
    dni: '',
    cuil: '',
    legajo: '',
    empresa: 'Aguas de Corrientes',
    esAfiliado: true,
    domicilio: '',
    telefonoFijo: '',
    telefonoCelular: '',
    email: '',
    fechaIngreso: '',
    estadoLaboral: 'activo',
    grupoFamiliar: []
  });

  useEffect(() => {
    if (empleado) {
      setFormData(empleado);
    } else {
      // Asignar número de afiliado automáticamente
      const maxAfiliado = Math.max(...empleados.filter(e => e.esAfiliado).map(e => e.numeroAfiliado), 1000);
      setFormData(prev => ({
        ...prev,
        numeroAfiliado: maxAfiliado + 1
      }));
    }
  }, [empleado, empleados]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const empleadoData: Empleado = {
      id: empleado?.id || Date.now().toString(),
      numeroAfiliado: formData.esAfiliado ? (formData.numeroAfiliado || 0) : 0,
      nombre: formData.nombre || '',
      apellido: formData.apellido || '',
      dni: formData.dni || '',
      cuil: formData.cuil || '',
      legajo: formData.legajo || '',
      empresa: formData.empresa || 'Aguas de Corrientes',
      esAfiliado: formData.esAfiliado || false,
      domicilio: formData.domicilio || '',
      telefonoFijo: formData.telefonoFijo,
      telefonoCelular: formData.telefonoCelular,
      email: formData.email,
      fechaIngreso: formData.fechaIngreso || '',
      estadoLaboral: formData.estadoLaboral || 'activo',
      grupoFamiliar: formData.grupoFamiliar || [],
      beneficios: empleado?.beneficios || [],
      prestamos: empleado?.prestamos || [],
      createdAt: empleado?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (empleado) {
      updateEmpleado(empleado.id, empleadoData);
    } else {
      addEmpleado(empleadoData);
    }
    
    onClose();
  };

  const addFamiliar = () => {
    const nuevoFamiliar: Familiar = {
      id: Date.now().toString(),
      empleadoId: empleado?.id || '',
      nombre: '',
      apellido: '',
      parentesco: 'hijo',
      esEstudiante: false
    };
    
    setFormData(prev => ({
      ...prev,
      grupoFamiliar: [...(prev.grupoFamiliar || []), nuevoFamiliar]
    }));
  };

  const updateFamiliar = (index: number, familiar: Partial<Familiar>) => {
    setFormData(prev => ({
      ...prev,
      grupoFamiliar: prev.grupoFamiliar?.map((f, i) => 
        i === index ? { ...f, ...familiar } : f
      ) || []
    }));
  };

  const removeFamiliar = (index: number) => {
    setFormData(prev => ({
      ...prev,
      grupoFamiliar: prev.grupoFamiliar?.filter((_, i) => i !== index) || []
    }));
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'personal', label: 'Datos Personales', icon: User },
    { id: 'familiar', label: 'Grupo Familiar', icon: Users },
    { id: 'contacto', label: 'Contacto', icon: Phone }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {empleado ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h2>
            <p className="text-blue-100 text-sm">
              {empleado ? 'Modificar información del empleado' : 'Registrar nuevo empleado en el sistema'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'personal' && (
              <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={formData.apellido || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DNI *
                    </label>
                    <input
                      type="text"
                      value={formData.dni || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, dni: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CUIL *
                    </label>
                    <input
                      type="text"
                      value={formData.cuil || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cuil: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="20-12345678-9"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Legajo *
                    </label>
                    <input
                      type="text"
                      value={formData.legajo || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, legajo: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ACO-001 o URB-045"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa *
                    </label>
                    <select
                      value={formData.empresa || 'Aguas de Corrientes'}
                      onChange={(e) => setFormData(prev => ({ ...prev, empresa: e.target.value as any }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Aguas de Corrientes">Aguas de Corrientes</option>
                      <option value="Urbatec">Urbatec</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Ingreso *
                    </label>
                    <input
                      type="date"
                      value={formData.fechaIngreso || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, fechaIngreso: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado Laboral
                    </label>
                    <select
                      value={formData.estadoLaboral || 'activo'}
                      onChange={(e) => setFormData(prev => ({ ...prev, estadoLaboral: e.target.value as any }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="jubilado">Jubilado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domicilio *
                  </label>
                  <input
                    type="text"
                    value={formData.domicilio || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, domicilio: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dirección completa"
                    required
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    id="esAfiliado"
                    checked={formData.esAfiliado || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, esAfiliado: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="esAfiliado" className="text-sm font-medium text-gray-700">
                    Es afiliado al sindicato
                  </label>
                </div>

                {formData.esAfiliado && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Afiliado
                    </label>
                    <input
                      type="number"
                      value={formData.numeroAfiliado || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, numeroAfiliado: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Se asigna automáticamente</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contacto' && (
              <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono Fijo
                    </label>
                    <input
                      type="tel"
                      value={formData.telefonoFijo || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefonoFijo: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="379-4123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono Celular
                    </label>
                    <input
                      type="tel"
                      value={formData.telefonoCelular || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefonoCelular: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="379-154123456"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="empleado@email.com"
                  />
                </div>
              </div>
            )}

            {activeTab === 'familiar' && (
              <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Grupo Familiar</h3>
                  <button
                    type="button"
                    onClick={addFamiliar}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Familiar</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.grupoFamiliar?.map((familiar, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Familiar {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeFamiliar(index)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre
                          </label>
                          <input
                            type="text"
                            value={familiar.nombre}
                            onChange={(e) => updateFamiliar(index, { nombre: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Apellido
                          </label>
                          <input
                            type="text"
                            value={familiar.apellido}
                            onChange={(e) => updateFamiliar(index, { apellido: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CUIL
                          </label>
                          <input
                            type="text"
                            value={familiar.cuil || ''}
                            onChange={(e) => updateFamiliar(index, { cuil: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            placeholder="20-12345678-9"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Parentesco
                          </label>
                          <select
                            value={familiar.parentesco}
                            onChange={(e) => updateFamiliar(index, { parentesco: e.target.value as any })}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="conyuge">Cónyuge</option>
                            <option value="hijo">Hijo/a</option>
                            <option value="padre">Padre</option>
                            <option value="madre">Madre</option>
                            <option value="otro">Otro</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de Nacimiento
                          </label>
                          <input
                            type="date"
                            value={familiar.fechaNacimiento || ''}
                            onChange={(e) => updateFamiliar(index, { fechaNacimiento: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Escolaridad
                          </label>
                          <select
                            value={familiar.escolaridad || 'ninguna'}
                            onChange={(e) => updateFamiliar(index, { escolaridad: e.target.value as any })}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="ninguna">Ninguna</option>
                            <option value="inicial">Inicial</option>
                            <option value="primaria">Primaria</option>
                            <option value="secundaria">Secundaria</option>
                            <option value="terciaria">Terciaria</option>
                            <option value="universitaria">Universitaria</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={familiar.esEstudiante}
                            onChange={(e) => updateFamiliar(index, { esEstudiante: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Es estudiante activo</span>
                        </label>
                      </div>
                    </div>
                  ))}
                  
                  {(!formData.grupoFamiliar || formData.grupoFamiliar.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay familiares registrados</p>
                      <p className="text-sm">Haz clic en "Agregar Familiar" para empezar</p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
              <span>{empleado ? 'Actualizar' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}