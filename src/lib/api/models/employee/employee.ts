import { Rol } from '../role/role';

export interface NuevoEmpleadoInput {
    name: string;
    lastName: string;
    roleId: number;
}

export interface Empleado {
    id: number;
    name: string;
    lastName: string;
    active: boolean;
    role: Rol;
}
