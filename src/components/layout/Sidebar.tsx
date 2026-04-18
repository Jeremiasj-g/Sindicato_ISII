
import { 
  Home, 
  Users, 
  Gift, 
  FileText, 
  Settings, 
  ChevronLeft,
  Building2
} from 'lucide-react';
import { ActivePage } from '../../App';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, module: 'dashboard' },
  { id: 'empleados', label: 'Empleados', icon: Users, module: 'empleados' },
  { id: 'beneficios', label: 'Beneficios', icon: Gift, module: 'beneficios' },
  { id: 'reportes', label: 'Reportes', icon: FileText, module: 'reportes' },
  { id: 'configuracion', label: 'Configuración', icon: Settings, module: 'configuracion' }
];

export function Sidebar({ activePage, setActivePage, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { user } = useAuth();

  const hasPermission = (module: string, action: string): boolean => {
    if (!user) return false;
    const modulePermission = user.permissions.find(p => p.module === module);
    return modulePermission?.actions.includes(action as any) || false;
  };

  const filteredMenuItems = menuItems.filter(item => 
    hasPermission(item.module, 'read')
  );

  return (
    <div className={`fixed left-0 top-0 h-full bg-blue-900 text-white transition-all duration-300 z-30 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-blue-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-300" />
              <div>
                <h1 className="text-lg font-bold">Sistema Sindical</h1>
                <p className="text-xs text-blue-300">Gestión Integral</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md hover:bg-blue-800 transition-colors"
          >
            <ChevronLeft className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <ul className="space-y-2 px-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActivePage(item.id as ActivePage)}
                  className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-700 shadow-lg border-l-4 border-blue-300' 
                      : 'hover:bg-blue-800'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-200' : 'text-blue-300'}`} />
                  {!isCollapsed && (
                    <span className={`ml-3 font-medium ${isActive ? 'text-white' : 'text-blue-100'}`}>
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-blue-800 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-200">Sindicato de Trabajadores</p>
            <p className="text-xs text-blue-300 font-semibold">v1.0.0</p>
          </div>
        </div>
      )}
    </div>
  );
}