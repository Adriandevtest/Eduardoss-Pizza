'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validación básica de contraseñas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirigir al login tras éxito
        router.push('/login?registered=true');
      } else {
        setError(data.error || 'Ocurrió un error al registrarte');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Crear Cuenta</h1>
          <p className="text-gray-500">Únete a la familia de Pizzería Eduardo's</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm font-medium border border-red-100">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              required
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500 transition-all"
              placeholder="Tu nombre completo"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              required
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500 transition-all"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              required
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500 transition-all"
              placeholder="Contraseña"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              required
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500 transition-all"
              placeholder="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 rounded-xl font-bold text-lg"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Registrarme'}
          </Button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-red-600 font-bold hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </main>
  );
}