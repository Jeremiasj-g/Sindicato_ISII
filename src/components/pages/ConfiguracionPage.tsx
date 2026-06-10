import { useState } from 'react'
import { Settings, Users, Shield, Database, Download, Upload } from 'lucide-react'
import { UsuariosConfigSection } from './UsuariosConfigSection'
import { useUser } from '../../context/UserContext'

const roles = [
  { value: 'administrador', label: 'Administrador', description: 'Acceso completo: lectura, carga, edición, eliminación y administración.' },
  { value: 'secretario_hacienda', label: 'Secretario de Hacienda', description: 'Acceso completo: lectura, carga, edición, eliminación y administración.' },
  { value: 'secretaria', label: 'Secretaria/o', description: 'Acceso de solo lectura.' },
  { value: 'desarrollador', label: 'Desarrollador', description: 'Acceso completo: lectura, carga, edición, eliminación y administración.' }
]

export function ConfiguracionPage() {
  const { canAdmin, canWrite } = useUser()
  const [activeTab, setActiveTab] = useState('usuarios')

  const tabs = [
    { id: 'usuarios', label: 'Gestión de Usuarios', icon: Users },
    { id: 'sistema', label: 'Configuración del Sistema', icon: Settings },
    { id: 'seguridad', label: 'Seguridad y Permisos', icon: Shield },
    { id: 'datos', label: 'Respaldo de Datos', icon: Database }
  ]

  const puedeAdministrar = canAdmin('configuracion')
  const puedeEditarConfiguracion = canWrite('configuracion')

  const exportBackup = () => {
    console.log('Exportando respaldo de datos...')
  }

  const importBackup = () => {
    if (!puedeEditarConfiguracion) return
    console.log('Importando respaldo de datos...')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
        <p className="text-gray-600">Administra usuarios, permisos y configuraciones generales</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'usuarios' && (
            <UsuariosConfigSection canAdmin={puedeAdministrar} />
          )}

          {activeTab === 'sistema' && (
            <div className="space-y-6">
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Versión del Sistema:</p>
                    <p className="font-medium text-gray-900">v1.0.0</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Última Actualización:</p>
                    <p className="font-medium text-gray-900">2026-06-09</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Control de Roles:</p>
                    <p className="font-medium text-gray-900">Activo</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Base de Datos:</p>
                    <p className="font-medium text-gray-900">Supabase</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Seguridad</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Autenticación gestionada con Supabase Auth.</p>
                  <p>• Permisos centralizados por rol.</p>
                  <p>• Las acciones de escritura se ocultan para usuarios de solo lectura.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="space-y-6">
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Seguridad y Permisos</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">Control de Acceso por Roles</p>
                      <p className="text-sm text-gray-600">Permisos diferenciados para lectura, escritura, eliminación y administración.</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Activo</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">Usuarios de solo lectura</p>
                      <p className="text-sm text-gray-600">Secretaria/o puede consultar información, pero no crear, editar ni eliminar.</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Activo</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map((role) => (
                  <div key={role.value} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{role.label}</h4>
                    <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                    <div className="space-x-1 text-xs">
                      {role.value === 'secretaria' ? (
                        <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded">read</span>
                      ) : (
                        <>
                          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded">read</span>
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">write</span>
                          <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded">delete</span>
                          <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded">admin</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'datos' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Respaldo y Restauración</h3>
                <p className="text-gray-600 mb-6">
                  Mantén tus datos seguros con respaldos regulares.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Exportar Datos</h4>
                    <button
                      onClick={exportBackup}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      <span>Crear Respaldo Completo</span>
                    </button>
                    <p className="text-xs text-gray-500">Incluye empleados, beneficios, préstamos y configuraciones.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Importar Datos</h4>
                    <button
                      onClick={importBackup}
                      disabled={!puedeEditarConfiguracion}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Restaurar desde Respaldo</span>
                    </button>
                    <p className="text-xs text-gray-500">Solo usuarios con permiso de escritura pueden importar datos.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
