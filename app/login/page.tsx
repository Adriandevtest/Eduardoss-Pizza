'use client';

import { useState } from 'react';
import { Mail, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Extraemos los datos del usuario (manejando diferentes formatos de API)
        const userData = data.user || data;
        login(userData); 

        // Redirección inteligente basada en el rol guardado en MongoDB
        // Si el rol es admin o cajero, lo mandamos a la cocina de Tabasco
        if (userData.role === 'admin' || userData.role === 'cajero') {
          router.push('/cocina');
        } else {
          router.push('/menu');
        }
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor en Tabasco');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">¡Hola de nuevo!</h1>
          <p className="text-gray-500">Ingresa para pedir tu pizza favorita en Tabasco</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm font-medium border border-red-100">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" className="text-red-600 font-bold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}