CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    numero_afiliado INTEGER UNIQUE, 
    nombre_completo VARCHAR(150) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    cuil VARCHAR(20) NOT NULL UNIQUE,
    legajo VARCHAR(50),
    domicilio VARCHAR(200),
    telefono_fijo VARCHAR(30),
    telefono_celular VARCHAR(30),
    email VARCHAR(100),
    empresa_id INTEGER REFERENCES empresas(id),
    localidad_id INTEGER REFERENCES localidades(id),
    cargo_sindicato_id INTEGER REFERENCES cargos_sindicato(id),
    afiliado BOOLEAN NOT NULL DEFAULT true,
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_alta DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_baja DATE
);

CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE cargos_sindicato (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);