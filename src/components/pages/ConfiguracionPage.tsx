import { useState } from 'react';
import { Settings, Users, Shield, Database, Download, Upload, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';

export function ConfiguracionPage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [newUser, setNewUser] = useState({
    username: '',
    nombre: '',
    role: 'secretaria' as User['role'],
    isActive: true
  });

  const hasPermission = (module: string, action: string): boolean => {
    if (!currentUser) return false;
    const modulePermission = currentUser.permissions.find(p => p.module === module);
    return modulePermission?.actions.includes(action as any) || false;
  };

  const tabs = [
    { id: 'usuarios', label: 'Gestión de Usuarios', icon: Users },
    { id: 'sistema', label: 'Configuración del Sistema', icon: Settings },
    { id: 'seguridad', label: 'Seguridad y Permisos', icon: Shield },
    { id: 'datos', label: 'Respaldo de Datos', icon: Database }
  ];

  const roles = [
    { value: 'administrador', label: 'Administrador', description: 'Acceso completo al sistema' },
    { value: 'secretario_hacienda', label: 'Secretario de Hacienda', description: 'Acceso contable y consultas' },
    { value: 'secretaria', label: 'Secretaria', description: 'Carga de datos y consultas limitadas' },
    { value: 'desarrollador', label: 'Desarrollador', description: 'Mantenimiento técnico sin acceso contable' }
  ];

  const mockUsers: User[] = [
    {
      id: '1',
      username: 'admin',
      nombre: 'Administrador Sistema',
      role: 'administrador',
      permissions: [],
      isActive: true
    },
    {
      id: '2',
      username: 'secretario',
      nombre: 'Juan Carlos Mendoza',
      role: 'secretario_hacienda',
      permissions: [],
      isActive: true
    },
    {
      id: '3',
      username: 'secretaria',
      nombre: 'María González',
      role: 'secretaria',
      permissions: [],
      isActive: true
    }
  ];

  const handleCreateUser = () => {
    console.log('Crear usuario:', newUser);
    setNewUser({
      username: '',
      nombre: '',
      role: 'secretaria',
      isActive: true
    });
  };

  const exportBackup = () => {
    console.log('Exportando respaldo de datos...');
  };

  const importBackup = () => {
    console.log('Importando respaldo de datos...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
        <p className="text-gray-600">Administra usuarios, permisos y configuraciones generales</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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

        <div className="p-6">
          {activeTab === 'usuarios' && (
            <div className="space-y-6">
              {/* Crear nuevo usuario */}
              {hasPermission('configuracion', 'admin') && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Usuario</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de Usuario
                      </label>
                      <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="usuario123"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={newUser.nombre}
                        onChange={(e) => setNewUser(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rol
                      </label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      >
                        {roles.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleCreateUser}
                    className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Crear Usuario</span>
                  </button>
                </div>
              )}

              {/* Lista de usuarios */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Usuarios del Sistema</h3>
                <div className="space-y-4">
                  {mockUsers.map(user => (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{user.nombre}</h4>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                        <p className="text-xs text-gray-400 capitalize">{user.role.replace('_', ' ')}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                        {hasPermission('configuracion', 'admin') && (
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            Editar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                    <p className="font-medium text-gray-900">2025-01-13</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Terminales Configuradas:</p>
                    <p className="font-medium text-gray-900">3 de 3 máximo</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Base de Datos:</p>
                    <p className="font-medium text-gray-900">Sincronizada</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Red</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Servidor Principal: Computadora Central (Core i5 8400, 16GB RAM)</p>
                  <p>• Conexiones por Cable: 4 terminales disponibles</p>
                  <p>• Conexiones Wi-Fi: Configurada para red interna</p>
                  <p>• Horario de Operación: Solo durante horario laboral</p>
                  <p>• Seguridad: Red interna únicamente, sin acceso externo</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="space-y-6">
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Seguridad</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Acceso Solo Red Interna</p>
                      <p className="text-sm text-gray-600">El sistema solo es accesible desde la red del sindicato</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Activo
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Encriptación de Datos Sensibles</p>
                      <p className="text-sm text-gray-600">Información de salud y datos personales protegidos</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Activo
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Control de Acceso por Roles</p>
                      <p className="text-sm text-gray-600">Permisos diferenciados según el rol del usuario</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Activo
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map(role => (
                  <div key={role.value} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{role.label}</h4>
                    <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                    <div className="space-y-1 text-xs">
                      {role.value === 'administrador' && (
                        <>
                          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded">Acceso Total</span>
                          <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded ml-1">Sin acceso contable</span>
                        </>
                      )}
                      {role.value === 'secretario_hacienda' && (
                        <>
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">Área Contable</span>
                          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded ml-1">Consultas</span>
                        </>
                      )}
                      {role.value === 'secretaria' && (
                        <>
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">Carga de Datos</span>
                          <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-1">Acceso Limitado</span>
                        </>
                      )}
                      {role.value === 'desarrollador' && (
                        <>
                          <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded">Mantenimiento</span>
                          <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded ml-1">Sin datos personales</span>
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
                  Mantén tus datos seguros con respaldos regulares. Fundamental para recuperación ante fallas de hardware.
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
                    <p className="text-xs text-gray-500">
                      Incluye empleados, beneficios, préstamos y configuraciones
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Importar Datos</h4>
                    <button
                      onClick={importBackup}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Restaurar desde Respaldo</span>
                    </button>
                    <p className="text-xs text-gray-500">
                      Restaurar datos desde archivo de respaldo
                    </p>
                  </div>
                </div>
              </div>

              {/* Carga masiva desde Excel */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Carga Masiva desde Excel</h3>
                <p className="text-gray-600 mb-4">
                  Importa hasta 500 registros de empleados desde un archivo Excel para evitar carga manual.
                </p>
                
                <div className="space-y-4">
                  <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors">
                    <Upload className="h-5 w-5" />
                    <span>Seleccionar Archivo Excel</span>
                  </button>
                  
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Formato requerido:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Nombre, Apellido, DNI, CUIL, Legajo</li>
                      <li>• Empresa, Domicilio, Teléfonos</li>
                      <li>• Estado de afiliación, Fecha de ingreso</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Última Actividad</h3>
                <div className="space-y-2 text-sm">
                  <p>• Último respaldo: 10/01/2025 - 18:30</p>
                  <p>• Último mantenimiento: 08/01/2025 - 09:00</p>
                  <p>• Total de registros: {mockUsers.length} usuarios activos</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}