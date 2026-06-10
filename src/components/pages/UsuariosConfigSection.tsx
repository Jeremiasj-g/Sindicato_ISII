import { useEffect, useMemo, useState } from 'react'
import { Edit, Save, Search, Shield, Trash2, UserPlus, X } from 'lucide-react'
import type { User } from '../../types'
import {
    createUsuario,
    deleteUsuario,
    getAllUsuarios,
    toggleUsuarioActivo,
    updateUsuario
} from '../../lib/controllers/usuario.controller'

interface UsuariosConfigSectionProps {
    canAdmin: boolean
}

const roles = [
    { value: 'administrador', label: 'Administrador', description: 'Acceso completo al sistema' },
    { value: 'secretario_hacienda', label: 'Secretario de Hacienda', description: 'Acceso contable y consultas' },
    { value: 'secretaria', label: 'Secretaria', description: 'Carga de datos y consultas limitadas' },
    { value: 'desarrollador', label: 'Desarrollador', description: 'Mantenimiento técnico sin acceso contable' }
] as const

const emptyForm = {
    username: '',
    nombre: '',
    email: '',
    role: 'secretaria' as User['role'],
    isActive: true
}

export function UsuariosConfigSection({ canAdmin }: UsuariosConfigSectionProps) {
    const [usuarios, setUsuarios] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [formData, setFormData] = useState(emptyForm)

    const filteredUsuarios = useMemo(() => {
        const term = searchQuery.trim().toLowerCase()

        if (!term) return usuarios

        return usuarios.filter((user) =>
            user.username.toLowerCase().includes(term) ||
            user.nombre.toLowerCase().includes(term) ||
            user.role.toLowerCase().includes(term)
        )
    }, [usuarios, searchQuery])

    const refreshUsuarios = async () => {
        setLoading(true)
        setError(null)

        const { data, error } = await getAllUsuarios()

        if (error) {
            setError(error)
            setUsuarios([])
        } else {
            setUsuarios(data)
        }

        setLoading(false)
    }

    useEffect(() => {
        void refreshUsuarios()
    }, [])

    const resetForm = () => {
        setEditingUser(null)
        setFormData(emptyForm)
    }

    const handleEdit = (user: User) => {
        setEditingUser(user)
        setFormData({
            username: user.username,
            nombre: user.nombre,
            email: user.email ?? '',
            password: '',
            role: user.role,
            isActive: user.isActive
        })
    }

    const handleSubmit = async () => {
        setSaving(true)

        const result = editingUser
            ? await updateUsuario(Number(editingUser.id), formData)
            : await createUsuario(formData)

        setSaving(false)

        if (result.error) {
            window.alert(result.error)
            return
        }

        await refreshUsuarios()
        resetForm()
    }

    const handleToggleActivo = async (user: User) => {
        const result = await toggleUsuarioActivo(Number(user.id), !user.isActive)

        if (result.error) {
            window.alert(result.error)
            return
        }

        await refreshUsuarios()
    }

    const handleDelete = async (user: User) => {
        const confirmar = window.confirm(
            `¿Seguro que querés eliminar el usuario "${user.username}"?`
        )

        if (!confirmar) return

        const result = await deleteUsuario(Number(user.id))

        if (!result.success) {
            window.alert(result.error ?? 'No se pudo eliminar el usuario.')
            return
        }

        await refreshUsuarios()
    }

    const getRoleLabel = (role: User['role']) => {
        return roles.find((r) => r.value === role)?.label ?? role
    }

    return (
        <div className="space-y-6">
            {canAdmin && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <UserPlus className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-medium text-gray-900">
                            {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Usuario
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
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
                                value={formData.nombre}
                                onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                placeholder="Juan Pérez"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rol
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as User['role'] }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            >
                                {roles.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled={!!editingUser}
                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                placeholder="usuario@email.com"
                            />
                        </div>

                        

                        <div className="flex items-end space-x-2">
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 w-full"
                            >
                                <Save className="h-4 w-4" />
                                <span>{saving ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear'}</span>
                            </button>

                            {editingUser && (
                                <button
                                    onClick={resetForm}
                                    className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                                    title="Cancelar edición"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Usuarios del Sistema
                        </h3>
                        <p className="text-sm text-gray-500">
                            Administra usuarios internos vinculados a roles del sistema
                        </p>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {filteredUsuarios.map((user) => (
                    <div
                        key={user.id}
                        className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
                    >
                        <div className="flex items-start space-x-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-blue-600" />
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900">{user.nombre}</h4>
                                <p className="text-sm text-gray-500">@{user.username}</p>
                                <p className="text-xs text-gray-400">{getRoleLabel(user.role)}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => canAdmin && handleToggleActivo(user)}
                                disabled={!canAdmin}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    } ${canAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                                title={canAdmin ? 'Cambiar estado' : ''}
                            >
                                {user.isActive ? 'Activo' : 'Inactivo'}
                            </button>

                            {canAdmin && (
                                <>
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
                                        title="Editar"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>

                                    <button
                                        onClick={() => void handleDelete(user)}
                                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="text-center py-12 text-gray-500">
                        Cargando usuarios...
                    </div>
                )}

                {!loading && filteredUsuarios.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No se encontraron usuarios
                    </div>
                )}
            </div>
        </div>
    )
}