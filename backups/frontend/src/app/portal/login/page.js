"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, ArrowLeft, AlertCircle, ClubSquare } from 'lucide-react';
import ClubShield from '@/components/ClubShield';

export default function SocioLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let data;
      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password: password.trim() })
        });

        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Credenciales incorrectas');
          }
        } else {
          throw new Error('Offline');
        }
      } catch (fetchErr) {
        // Fallback offline / sin backend
        const e = email.trim();
        const p = password.trim();
        if ((e === 'martin.perez.47542096@example.com' || e === 'julian.alvarez@example.com') && p === 'socio123') {
          data = {
            token: 'mock_socio_token',
            user: { role: 'SOCIO' }
          };
        } else {
          throw new Error('Credenciales incorrectas (Modo Offline: usar las indicadas abajo)');
        }
      }

      // Guardar token en localStorage
      localStorage.setItem('jn-auth-token', data.token);
      localStorage.setItem('token', data.token);

      // Redirigir al portal
      router.push('/portal');
      // Forzar recarga ligera para refrescar layout
      setTimeout(() => {
        window.location.href = '/portal';
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-jn-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-jn-red blur-[150px] rounded-full opacity-15 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-jn-red blur-[150px] rounded-full opacity-15 pointer-events-none"></div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 space-y-6">
        
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={14} /> Volver al Inicio
        </Link>

        {/* Brand & Shield */}
        <div className="flex flex-col items-center text-center">
          <ClubShield className="w-14 h-16 drop-shadow-[0_0_15px_rgba(211,47,47,0.4)] mb-4" />
          <h1 className="text-3xl font-black uppercase tracking-tight text-white leading-none">Mi Vida Digital</h1>
          <p className="text-gray-400 text-xs mt-2 max-w-xs">Accedé a tu carnet, realizá pagos y reservá canchas desde tu portal de socio.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-xl text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wider mb-0.5">Error de acceso</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest">Correo Electrónico</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <User size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-jn-red transition-all"
                placeholder="socio@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest">Contraseña</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-jn-red transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-jn-red text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(211,47,47,0.3)] hover:shadow-[0_0_35px_rgba(211,47,47,0.5)] hover:scale-[1.01] transition-all text-xs uppercase tracking-widest disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
          >
            {loading ? 'Iniciando Sesión...' : 'Ingresar al Portal'}
          </button>
        </form>

        {/* Demo info / credentials helper */}
        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-[10px] space-y-1.5 text-gray-400">
          <span className="font-bold text-gray-300 uppercase tracking-wide">💡 Credenciales de demostración:</span>
          <p>Puedes ingresar utilizando cualquiera de los socios precargados:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Email: <code className="text-jn-red">martin.perez.47542096@example.com</code></li>
            <li>Email: <code className="text-jn-red">julian.alvarez@example.com</code></li>
            <li>Contraseña para todos: <code className="text-white">socio123</code></li>
          </ul>
        </div>

        {/* Register CTA */}
        <p className="text-center text-xs text-gray-400">
          ¿No sos socio todavía?{' '}
          <Link href="/asociate" className="text-jn-red hover:underline font-bold">
            Asociate ahora
          </Link>
        </p>

      </div>
    </div>
  );
}
