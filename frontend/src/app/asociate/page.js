"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import ClubShield from '@/components/ClubShield';
import { apiFetch } from '@/lib/apiClient';
import { useTheme } from '@/components/ThemeContext';

export default function AsociatePage() {
  const { theme } = useTheme();
  const tvTitleDisplay = theme?.tvTitle || (theme?.clubShortName ? `${theme.clubShortName} TV` : 'CLUB TV');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [category, setCategory] = useState('Activo (Mayores 18 años)');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch(`/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dni: dni.trim(),
          birthDate: new Date(birthDate).toISOString()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo procesar la solicitud. Revisa los datos.');
      }

      setSuccessData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-jn-black text-white py-20 px-4 relative overflow-hidden">
      {/* Background neon elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-jn-red blur-[120px] rounded-full opacity-15 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-jn-red blur-[120px] rounded-full opacity-15 pointer-events-none"></div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-12 flex flex-col items-center">
          <ClubShield className="w-14 h-16 drop-shadow-[0_0_15px_rgba(211,47,47,0.4)] mb-4" />
          <h1 className="text-5xl font-black text-jn-white mb-2 uppercase tracking-tight">Hacete Socio</h1>
          <p className="text-sm text-gray-400 max-w-lg">Sumate a la familia de {theme?.clubName || 'nuestra institución'}. Rápido, digital y sin papeles.</p>
        </div>

        {successData ? (
          /* PANTALLA DE ÉXITO */
          <div className="max-w-xl mx-auto bg-white text-jn-black p-8 rounded-3xl border border-gray-100 shadow-2xl text-center space-y-6 animate-fade-in select-none">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle size={44} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase text-gray-900 tracking-tight">¡Bienvenido al Club!</h2>
              <p className="text-gray-500 text-sm mt-2">Tu solicitud de alta ha sido aprobada de manera digital e instantánea.</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-400 font-bold uppercase">Socio Nº:</span>
                <span className="font-bold text-jn-black text-sm">{successData.user?.member?.socioNumber}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-400 font-bold uppercase">Nombre:</span>
                <span className="font-bold text-jn-black">{successData.user?.member?.firstName} {successData.user?.member?.lastName}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-gray-400 font-bold uppercase">Usuario/Email:</span>
                <span className="font-bold text-jn-red">{successData.user?.email}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400">Ya puedes iniciar sesión en el portal utilizando tu correo electrónico y la contraseña elegida.</p>

            <Link href="/portal/login" className="flex items-center justify-center gap-2 bg-jn-black hover:bg-jn-red text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow shadow-black/25">
              Ir al Portal Socio <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* FORMULARIO DE ALTA */
          <div className="grid md:grid-cols-2 gap-12 items-center bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
            {/* Beneficios */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase tracking-tight text-white border-l-4 border-jn-red pl-3.5">Beneficios Exclusivos</h2>
              <ul className="space-y-4 text-sm font-semibold text-gray-300">
                <li className="flex items-center gap-3"><CheckCircle className="text-jn-red flex-shrink-0" size={18} /> Ingreso libre a las instalaciones del club</li>
                <li className="flex items-center gap-3"><CheckCircle className="text-jn-red flex-shrink-0" size={18} /> Descuentos en alquiler de canchas y quinchos</li>
                <li className="flex items-center gap-3"><CheckCircle className="text-jn-red flex-shrink-0" size={18} /> Precios preferenciales en aranceles de disciplinas</li>
                <li className="flex items-center gap-3"><CheckCircle className="text-jn-red flex-shrink-0" size={18} /> Acceso prioritario a transmisiones en vivo ({tvTitleDisplay})</li>
                <li className="flex items-center gap-3"><CheckCircle className="text-jn-red flex-shrink-0" size={18} /> Voto en asambleas para elecciones de la directiva</li>
              </ul>
            </div>

            {/* Formulario */}
            <div className="bg-white text-jn-black p-8 rounded-2xl shadow-2xl space-y-4">
              <h3 className="text-2xl font-black text-center text-gray-900 uppercase tracking-tight">Completá tus Datos</h3>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-jn-red focus:bg-white outline-none transition-all text-xs font-semibold"
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Apellido</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-jn-red focus:bg-white outline-none transition-all text-xs font-semibold"
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">DNI (Sin puntos)</label>
                    <input
                      type="text"
                      required
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-jn-red focus:bg-white outline-none transition-all text-xs font-semibold"
                      placeholder="45892110"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fec. Nacimiento</label>
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-jn-red focus:bg-white outline-none transition-all text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-jn-red focus:bg-white outline-none transition-all text-xs font-semibold"
                    placeholder="juan.perez@example.com"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contraseña del Portal</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-jn-red focus:bg-white outline-none transition-all text-xs font-semibold"
                    placeholder="Elegí una clave"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Categoría Sugerida</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-jn-red focus:bg-white outline-none transition-all text-xs font-semibold"
                  >
                    <option>Activo (Mayores 18 años)</option>
                    <option>Cadete (13 a 17 años)</option>
                    <option>Infantil (Menores 12 años)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-jn-red to-jn-darkred text-white font-black py-4 rounded-xl shadow-lg hover:shadow-jn-red/45 hover:scale-[1.01] transition-all text-xs uppercase tracking-widest disabled:opacity-50 disabled:shadow-none disabled:scale-100"
                >
                  {loading ? 'Procesando Solicitud...' : 'Solicitar Alta'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
