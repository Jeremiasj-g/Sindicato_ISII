import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthForm } from './components/auth/AuthForm';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/pages/Dashboard';
import { EmpleadosPage } from './components/pages/EmpleadosPage';
import { BeneficiosPage } from './components/pages/BeneficiosPage';
import { ReportesPage } from './components/pages/ReportesPage';
import { ConfiguracionPage } from './components/pages/ConfiguracionPage';
import { DataProvider } from './context/DataContext';
import { EmpresasPage } from './components/pages/EmpresasPage'
import { PrestamosPage } from './components/pages/PrestamosPage'
import { PerfilPage } from './components/pages/PerfilPage'
import { SetPasswordPage } from './components/auth/SetPasswordPage'

export type ActivePage = 'dashboard' | 'empleados' | 'empresas' | 'beneficios' | 'prestamos' | 'reportes' | 'configuracion' | 'perfil';

function AppContent() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={() => window.location.reload()} />;
  }

  if (window.location.pathname === '/set-password') {
    return <SetPasswordPage />
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'empleados':
        return <EmpleadosPage />;
      case 'empresas':
        return <EmpresasPage />
      case 'beneficios':
        return <BeneficiosPage />;
      case 'prestamos':
        return <PrestamosPage />
      case 'reportes':
        return <ReportesPage />;
      case 'configuracion':
        return <ConfiguracionPage />;
      case 'perfil':
        return <PerfilPage />
      default:
        return <Dashboard />;
    }
  };

  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            activePage={activePage}
            onPageChange={setActivePage}
          />
          <main className="flex-1 p-6">
            {renderPage()}
          </main>
        </div>
      </div>
    </DataProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;