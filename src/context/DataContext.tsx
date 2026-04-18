import { createContext, useContext, useState, ReactNode } from 'react';
import { Empleado, Beneficio, Prestamo } from '../types';
import { generateMockData } from '../utils/mockData';

interface DataContextType {
  empleados: Empleado[];
  beneficios: Beneficio[];
  prestamos: Prestamo[];
  addEmpleado: (empleado: Empleado) => void;
  updateEmpleado: (id: string, empleado: Partial<Empleado>) => void;
  deleteEmpleado: (id: string) => void;
  getEmpleadoById: (id: string) => Empleado | undefined;
  searchEmpleados: (query: string) => Empleado[];
  addBeneficio: (beneficio: Beneficio) => void;
  updateBeneficio: (id: string, beneficio: Partial<Beneficio>) => void;
  getBeneficiosByEmpleado: (empleadoId: string) => Beneficio[];
  addPrestamo: (prestamo: Prestamo) => void;
  updatePrestamo: (id: string, prestamo: Partial<Prestamo>) => void;
  getPrestamosByEmpleado: (empleadoId: string) => Prestamo[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [empleados, setEmpleados] = useState<Empleado[]>(generateMockData());
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);

  const addEmpleado = (empleado: Empleado) => {
    setEmpleados(prev => [...prev, empleado]);
  };

  const updateEmpleado = (id: string, updatedEmpleado: Partial<Empleado>) => {
    setEmpleados(prev => prev.map(emp => 
      emp.id === id ? { ...emp, ...updatedEmpleado, updatedAt: new Date().toISOString() } : emp
    ));
  };

  const deleteEmpleado = (id: string) => {
    setEmpleados(prev => prev.filter(emp => emp.id !== id));
  };

  const getEmpleadoById = (id: string): Empleado | undefined => {
    return empleados.find(emp => emp.id === id);
  };

  const searchEmpleados = (query: string): Empleado[] => {
    const searchTerm = query.toLowerCase();
    return empleados.filter(emp => 
      emp.nombre.toLowerCase().includes(searchTerm) ||
      emp.apellido.toLowerCase().includes(searchTerm) ||
      emp.dni.includes(searchTerm) ||
      emp.cuil.includes(searchTerm) ||
      emp.legajo.includes(searchTerm)
    );
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