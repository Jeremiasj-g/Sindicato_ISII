import { Empleado } from '../types';

export function generateMockData(): Empleado[] {
  return [
    {
      id: '1',
      numeroAfiliado: 1001,
      nombre: 'Juan Carlos',
      apellido: 'Pérez',
      dni: '25123456',
      cuil: '20-25123456-8',
      legajo: 'ACO-001',
      empresa: 'Aguas de Corrientes',
      esAfiliado: true,
      domicilio: 'Av. Costanera 1234, Corrientes',
      telefonoFijo: '379-4123456',
      telefonoCelular: '379-154123456',
      email: 'juan.perez@email.com',
      fechaIngreso: '2020-03-15',
      estadoLaboral: 'activo',
      grupoFamiliar: [
        {
          id: 'f1',
          empleadoId: '1',
          nombre: 'María',
          apellido: 'González',
          cuil: '27-23456789-2',
          parentesco: 'conyuge',
          fechaNacimiento: '1985-08-20',
          edad: 38,
          escolaridad: 'universitaria',
          esEstudiante: false
        },
        {
          id: 'f2',
          empleadoId: '1',
          nombre: 'Santiago',
          apellido: 'Pérez',
          parentesco: 'hijo',
          fechaNacimiento: '2010-05-12',
          edad: 13,
          escolaridad: 'secundaria',
          esEstudiante: true
        }
      ],
      beneficios: [],
      prestamos: [],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      numeroAfiliado: 1002,
      nombre: 'Ana',
      apellido: 'Rodríguez',
      dni: '30987654',
      cuil: '27-30987654-1',
      legajo: 'URB-045',
      empresa: 'Urbatec',
      esAfiliado: true,
      domicilio: 'Calle San Martín 567, Corrientes',
      telefonoCelular: '379-155987654',
      email: 'ana.rodriguez@email.com',
      fechaIngreso: '2019-07-22',
      estadoLaboral: 'activo',
      grupoFamiliar: [
        {
          id: 'f3',
          empleadoId: '2',
          nombre: 'Lucía',
          apellido: 'Rodríguez',
          parentesco: 'hijo',
          fechaNacimiento: '2015-11-03',
          edad: 8,
          escolaridad: 'primaria',
          esEstudiante: true
        }
      ],
      beneficios: [],
      prestamos: [],
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z'
    },
    {
      id: '3',
      numeroAfiliado: 0,
      nombre: 'Roberto',
      apellido: 'Martínez',
      dni: '28456789',
      cuil: '20-28456789-5',
      legajo: 'ACO-078',
      empresa: 'Aguas de Corrientes',
      esAfiliado: false,
      domicilio: 'Barrio San Gerónimo, Mz 15 Casa 8',
      telefonoCelular: '379-156456789',
      fechaIngreso: '2021-11-01',
      estadoLaboral: 'activo',
      grupoFamiliar: [],
      beneficios: [],
      prestamos: [],
      createdAt: '2024-02-01T09:15:00Z',
      updatedAt: '2024-02-01T09:15:00Z'
    }
  ];
}