import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Empleado, Beneficio, Prestamo } from '../types';
import {
  createEmpleado,
  deleteEmpleado as deleteEmpleadoDB,
  getAllEmpleados,
  searchEmpleados as searchEmpleadosDB,
  updateEmpleado as updateEmpleadoDB
} from '../lib';

interface DataContextType {
  empleados: Empleado[];
  beneficios: Beneficio[];
  prestamos: Prestamo[];
  loadingEmpleados: boolean;
  empleadoError: string | null;
  refreshEmpleados: () => Promise<void>;
  addEmpleado: (empleado: Empleado) => Promise<{ error: string | null }>;
  updateEmpleado: (id: string, empleado: Partial<Empleado>) => Promise<{ error: string | null }>;
  deleteEmpleado: (id: string) => Promise<{ error: string | null }>;
  getEmpleadoById: (id: string) => Empleado | undefined;
  searchEmpleados: (query: string) => Promise<Empleado[]>;
  addBeneficio: (beneficio: Beneficio) => void;
  updateBeneficio: (id: string, beneficio: Partial<Beneficio>) => void;
  getBeneficiosByEmpleado: (empleadoId: string) => Beneficio[];
  addPrestamo: (prestamo: Prestamo) => void;
  updatePrestamo: (id: string, prestamo: Partial<Prestamo>) => void;
  getPrestamosByEmpleado: (empleadoId: string) => Prestamo[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  const [empleadoError, setEmpleadoError] = useState<string | null>(null);

  const refreshEmpleados = useCallback(async () => {
    setLoadingEmpleados(true);
    const { data, error } = await getAllEmpleados();

    if (error) {
      setEmpleadoError(error);
      setEmpleados([]);
    } else {
      setEmpleadoError(null);
      setEmpleados(data);
    }

    setLoadingEmpleados(false);
  }, []);

  useEffect(() => {
    refreshEmpleados();
  }, [refreshEmpleados]);

  const addEmpleado = async (empleado: Empleado) => {
    const { data, error } = await createEmpleado(empleado);

    if (error || !data) {
      return { error: error || 'No se pudo crear el empleado' };
    }

    setEmpleados(prev => [...prev, data]);
    return { error: null };
  };

  const updateEmpleado = async (id: string, updatedEmpleado: Partial<Empleado>) => {
    const { data, error } = await updateEmpleadoDB(Number(id), updatedEmpleado);

    if (error || !data) {
      return { error: error || 'No se pudo actualizar el empleado' };
    }

    setEmpleados(prev => prev.map(emp => (emp.id === id ? data : emp)));
    return { error: null };
  };

  const deleteEmpleado = async (id: string) => {
    const { success, error } = await deleteEmpleadoDB(Number(id));

    if (!success || error) {
      return { error: error || 'No se pudo eliminar el empleado' };
    }

    setEmpleados(prev =>
      prev.map(emp =>
        emp.id === id
          ? {
              ...emp,
              estadoLaboral: 'inactivo',
              updatedAt: new Date().toISOString()
            }
          : emp
      )
    );

    return { error: null };
  };

  const getEmpleadoById = (id: string): Empleado | undefined => {
    return empleados.find(emp => emp.id === id);
  };

  const searchEmpleados = async (query: string): Promise<Empleado[]> => {
    if (!query.trim()) return empleados;

    const { data, error } = await searchEmpleadosDB(query);

    if (error) {
      setEmpleadoError(error);
      return [];
    }

    setEmpleadoError(null);
    return data;
  };

  const addBeneficio = (beneficio: Beneficio) => {
    setBeneficios(prev => [...prev, beneficio]);
  };

  const updateBeneficio = (id: string, updatedBeneficio: Partial<Beneficio>) => {
    setBeneficios(prev => prev.map(ben => 
      ben.id === id ? { ...ben, ...updatedBeneficio } : ben
    ));
  };

  const getBeneficiosByEmpleado = (empleadoId: string): Beneficio[] => {
    return beneficios.filter(ben => ben.empleadoId === empleadoId);
  };

  const addPrestamo = (prestamo: Prestamo) => {
    setPrestamos(prev => [...prev, prestamo]);
  };

  const updatePrestamo = (id: string, updatedPrestamo: Partial<Prestamo>) => {
    setPrestamos(prev => prev.map(pres => 
      pres.id === id ? { ...pres, ...updatedPrestamo } : pres
    ));
  };

  const getPrestamosByEmpleado = (empleadoId: string): Prestamo[] => {
    return prestamos.filter(pres => pres.empleadoId === empleadoId);
  };

  return (
    <DataContext.Provider value={{
      empleados,
      beneficios,
      prestamos,
      loadingEmpleados,
      empleadoError,
      refreshEmpleados,
      addEmpleado,
      updateEmpleado,
      deleteEmpleado,
      getEmpleadoById,
      searchEmpleados,
      addBeneficio,
      updateBeneficio,
      getBeneficiosByEmpleado,
      addPrestamo,
      updatePrestamo,
      getPrestamosByEmpleado
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
