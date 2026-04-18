
import { Menu, LogOut, User, Bell } from 'lucide-react';
import { ActivePage } from '../../App';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  activePage: ActivePage;
}

const pageNames = {
  dashboard: 'Dashboard',
  empleados: 'Gestión de Empleados',
  beneficios: 'Beneficios y Asistencias',
  reportes: 'Reportes y Estadísticas',
  configuracion: 'Configuración del Sistema'
};

export function Header({ onToggleSidebar, activePage }: HeaderProps) {
  const { user: currentUser, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {pageNames[activePage]}
            </h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('es-AR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{currentUser?.nombre}</p>
                <p className="text-gray-500 capitalize">{currentUser?.role.replace('_', ' ')}</p>
              </div>
            </div>
            
            <button 
              onClick={handleSignOut}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}