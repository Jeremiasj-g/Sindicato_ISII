import { useState } from 'react'
import { Lock, Save } from 'lucide-react'
import { supabase } from '../../lib/config/supabase'

export function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

    setMessage('Contraseña configurada correctamente. Ya podés acceder al sistema.')

    setTimeout(() => {
      window.location.href = '/'
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Lock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Configurar contraseña</h1>
            <p className="text-sm text-gray-500">Completá tu acceso al sistema</p>
          </div>
        </div>

        {message && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Guardando...' : 'Guardar contraseña'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}