import { useState } from 'react'
import { KeyRound, Mail, Shield, UserCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/config/supabase'

export function PerfilPage() {
  const { user, supabaseUser } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleChangePassword = async () => {
    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.')
      return
    }

    setSaving(true)

    const { error } = await supabase.auth.updateUser({
      password
    })

    setSaving(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setPassword('')
    setConfirmPassword('')
    setMessage('Contraseña actualizada correctamente.')
  }

  const handleSendRecoveryEmail = async () => {
    if (!supabaseUser?.email) return

    const { error } = await supabase.auth.resetPasswordForEmail(supabaseUser.email, {
      redirectTo: `${window.location.origin}/set-password`
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Te enviamos un correo para cambiar tu contraseña.')
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
        <p className="text-gray-600">Datos de usuario y seguridad de la cuenta</p>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3">
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
            <UserCircle className="h-9 w-9 text-blue-600" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.nombre}</h3>
            <p className="text-sm text-gray-500">{user.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <Mail className="h-5 w-5 text-gray-500 mb-2" />
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{supabaseUser?.email || user.email}</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <Shield className="h-5 w-5 text-gray-500 mb-2" />
            <p className="text-sm text-gray-500">Rol</p>
            <p className="font-medium text-gray-900">{user.role}</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <UserCircle className="h-5 w-5 text-gray-500 mb-2" />
            <p className="text-sm text-gray-500">Estado</p>
            <p className="font-medium text-gray-900">
              {user.isActive ? 'Activo' : 'Inactivo'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <KeyRound className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Cambiar contraseña</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Actualizar contraseña'}
          </button>

          <button
            onClick={handleSendRecoveryEmail}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Enviar correo de cambio
          </button>
        </div>
      </div>
    </div>
  )
}