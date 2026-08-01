"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  User, ArrowLeft, Edit, Shield, Heart, Star, CheckCircle,
  XCircle, Phone, Mail, MapPin, Calendar, Activity, Trophy,
  FileText, AlertTriangle, Camera, Clock, ChevronRight,
  AlertCircle, Flag, Users
} from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';

const STATUS_CONFIG = {
  ACTIVE: { label: 'Activo', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  INJURED: { label: 'Lesionado', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  SUSPENDED: { label: 'Suspendido', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  INACTIVE: { label: 'Inactivo', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  CONVOCADO: { label: 'Convocado', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
};

const FOOT_LABELS = { DERECHA: 'Derecha', IZQUIERDA: 'Izquierda', AMBAS: 'Ambidiestro' };

function InfoRow({ label, value, icon: Icon }) {
  if (!value && value !== 0 && value !== false) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      {Icon && <Icon size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function StatBox({ label, value, color = 'text-gray-900', bg = 'bg-gray-50' }) {
  return (
    <div className={`${bg} rounded-2xl p-4 text-center`}>
      <span className={`text-3xl font-black ${color}`}>{value ?? 0}</span>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

function DocBadge({ label, value, icon: Icon }) {
  return (
    <div className={`flex items-center gap-2.5 p-3 rounded-xl ${value ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
      {value
        ? <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
        : <XCircle size={16} className="text-gray-400 flex-shrink-0" />
      }
      <div>
        <p className="text-xs font-black text-gray-700">{label}</p>
        <p className={`text-[10px] font-bold ${value ? 'text-green-600' : 'text-gray-400'}`}>
          {value ? 'Registrado' : 'No registrado'}
        </p>
      </div>
    </div>
  );
}

const TABS = [
  { key: 'datos', label: 'Datos Personales', icon: User },
  { key: 'deportivos', label: 'Datos Deportivos', icon: Trophy },
  { key: 'estadisticas', label: 'Estadísticas', icon: Activity },
  { key: 'documentacion', label: 'Documentación', icon: FileText },
  { key: 'medica', label: 'Ficha Médica', icon: Heart },
  { key: 'contacto', label: 'Contacto', icon: Phone },
  { key: 'historial', label: 'Historial', icon: Clock },
];

export default function JugadorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('datos');

  useEffect(() => {
    if (!id) return;
    const fetchPlayer = async () => {
      try {
        const res = await apiFetch(`/api/players/${id}`);
        if (!res.ok) throw new Error('Jugador no encontrado');
        const data = await res.json();
        setPlayer(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-jn-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-500">Cargando ficha del jugador...</p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-600">Jugador no encontrado</h2>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button onClick={() => router.back()} className="mt-4 px-6 py-3 bg-jn-red text-white rounded-xl font-black text-sm hover:bg-red-700 transition-colors">
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  const age = player.age || (player.birthDate
    ? Math.floor((Date.now() - new Date(player.birthDate)) / (365.25 * 24 * 3600 * 1000))
    : null);

  const status = STATUS_CONFIG[player.playerStatus] || STATUS_CONFIG.ACTIVE;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative h-64 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
        {player.photoUrl && (
          <>
            <img src={player.photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover object-top opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white text-sm font-bold transition-all"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
        </div>

        {/* Player Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-5">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-gray-700 flex-shrink-0">
            {player.photoUrl
              ? <img src={player.photoUrl} alt="" className="w-full h-full object-cover object-top" />
              : <div className="w-full h-full flex items-center justify-center"><User size={32} className="text-white/40" /></div>
            }
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
              {player.isCaptain && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-500 text-white">⭐ Capitán</span>}
              {player.isSubCaptain && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-500 text-white">🏅 Subcapitán</span>}
            </div>
            <h1 className="text-2xl font-black text-white leading-tight">
              {player.lastName ? `${player.lastName.toUpperCase()}, ${player.name}` : player.name}
            </h1>
            <p className="text-gray-300 font-bold text-sm">
              {player.position} · {player.category}
              {age ? ` · ${age} años` : ''}
            </p>
          </div>

          <div className="flex-shrink-0 pb-1">
            <div className="w-14 h-14 bg-jn-red rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-black text-white">#{player.dorsal || '?'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex-shrink-0 ${
                  activeTab === t.key
                    ? 'bg-jn-red text-white shadow-lg shadow-red-500/20'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon size={13} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {activeTab === 'datos' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-black text-gray-900 mb-4 pb-3 border-b border-gray-100">Datos Personales</h2>
                <InfoRow label="Nombre completo" value={`${player.lastName ? player.lastName + ', ' : ''}${player.name}`} icon={User} />
                <InfoRow label="DNI" value={player.dni} icon={Flag} />
                <InfoRow label="Fecha de nacimiento" value={player.birthDate ? new Date(player.birthDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }) : null} icon={Calendar} />
                <InfoRow label="Edad" value={age ? `${age} años` : null} icon={User} />
                <InfoRow label="Nacionalidad" value={player.nationality || 'Argentina'} icon={Flag} />
                <InfoRow label="Altura" value={player.height ? `${player.height} cm` : null} icon={User} />
                <InfoRow label="Peso" value={player.weight ? `${player.weight} kg` : null} icon={User} />
                <InfoRow label="Fecha de ingreso" value={player.entryDate ? new Date(player.entryDate).toLocaleDateString('es-AR') : null} icon={Calendar} />
                {player.observations && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
                    <p className="text-[10px] font-black text-yellow-700 uppercase tracking-wider mb-1">Observaciones</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{player.observations}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'deportivos' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-black text-gray-900 mb-4 pb-3 border-b border-gray-100">Datos Deportivos</h2>
                <InfoRow label="Categoría" value={player.category} icon={Trophy} />
                <InfoRow label="Posición" value={player.position} icon={Activity} />
                <InfoRow label="Número / Dorsal" value={player.dorsal ? `#${player.dorsal}` : null} icon={Shield} />
                <InfoRow label="Pierna hábil" value={FOOT_LABELS[player.dominantFoot] || player.dominantFoot} icon={Activity} />
                <InfoRow label="Estado" value={status.label} icon={Activity} />
                <InfoRow label="Temporada" value={player.season || '2026'} icon={Calendar} />
                <InfoRow label="Equipo" value={player.team} icon={Users} />
              </div>
            )}

            {activeTab === 'estadisticas' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-black text-gray-900 mb-5 pb-3 border-b border-gray-100">Estadísticas</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <StatBox label="Partidos Jugados" value={player.matchesPlayed} bg="bg-gray-50" />
                  <StatBox label="Goles" value={player.goals} color="text-jn-red" bg="bg-red-50" />
                  <StatBox label="Asistencias" value={player.assists} color="text-blue-600" bg="bg-blue-50" />
                  <StatBox label="Tarjetas Amarillas" value={player.yellowCards} color="text-yellow-600" bg="bg-yellow-50" />
                  <StatBox label="Tarjetas Rojas" value={player.redCards} color="text-red-700" bg="bg-red-50" />
                  <StatBox label="Vallas Invictas" value={player.cleanSheets} color="text-green-600" bg="bg-green-50" />
                </div>
              </div>
            )}

            {activeTab === 'documentacion' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-black text-gray-900 mb-4 pb-3 border-b border-gray-100">Documentación</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DocBadge label="Licencia AFA" value={player.licenciaAFA} />
                  <DocBadge label="Carnet" value={player.carnet} />
                  <DocBadge label="Seguro" value={player.seguro} />
                  <DocBadge label="Apto Físico" value={player.aptoFisico} />
                  <DocBadge label="Es Socio del Club" value={player.esSocio} />
                </div>
                {player.tutorNombre && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider mb-1">Tutor Legal (Menor)</p>
                    <p className="text-sm font-bold text-gray-900">{player.tutorNombre}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'medica' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-black text-gray-900 mb-4 pb-3 border-b border-gray-100">Ficha Médica</h2>
                <InfoRow label="Grupo Sanguíneo" value={player.bloodType} icon={Heart} />
                <InfoRow label="Teléfono Emergencia" value={player.emergencyPhone} icon={Phone} />
                <InfoRow label="Apto Físico" value={player.aptoFisico ? '✓ Habilitado' : '✗ No registrado'} icon={Heart} />
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Historial médico detallado</p>
                  <p className="text-xs text-gray-400 mt-1">Los registros médicos se gestionan desde el módulo de Ficha Médica del sistema.</p>
                </div>
              </div>
            )}

            {activeTab === 'contacto' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-black text-gray-900 mb-4 pb-3 border-b border-gray-100">Información de Contacto</h2>
                <InfoRow label="Teléfono" value={player.phone} icon={Phone} />
                <InfoRow label="Email" value={player.email} icon={Mail} />
                <InfoRow label="Dirección" value={player.address} icon={MapPin} />
                <InfoRow label="Teléfono de Emergencia" value={player.emergencyPhone} icon={Phone} />
                {player.tutorNombre && <InfoRow label="Tutor" value={player.tutorNombre} icon={User} />}
              </div>
            )}

            {activeTab === 'historial' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-black text-gray-900 mb-4 pb-3 border-b border-gray-100">Historial</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-black text-gray-900">Registro creado</p>
                      <p className="text-xs text-gray-400">{new Date(player.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  {player.updatedAt && player.updatedAt !== player.createdAt && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-black text-gray-900">Última actualización</p>
                        <p className="text-xs text-gray-400">{new Date(player.updatedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                  )}
                  {player.entryDate && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-jn-red mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-black text-gray-900">Ingresó al club</p>
                        <p className="text-xs text-gray-400">{new Date(player.entryDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-jn-black to-gray-900 rounded-2xl p-5 text-white">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-4">Resumen Temporada</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'PJ', value: player.matchesPlayed || 0 },
                  { label: 'Goles', value: player.goals || 0 },
                  { label: 'Asist.', value: player.assists || 0 },
                  { label: 'TA', value: player.yellowCards || 0 },
                ].map((s, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
                    <span className="text-2xl font-black text-white">{s.value}</span>
                    <p className="text-[9px] font-black text-gray-400 uppercase mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Club Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Club</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield size={13} className="text-jn-red" />
                  <span className="text-xs font-bold text-gray-700">Club Atlético Jorge Newbery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy size={13} className="text-jn-red" />
                  <span className="text-xs font-bold text-gray-700">Futsal AFA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-jn-red" />
                  <span className="text-xs font-bold text-gray-700">Temporada {player.season || '2026'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={13} className="text-jn-red" />
                  <span className="text-xs font-bold text-gray-700">{player.category}</span>
                </div>
              </div>
            </div>

            {/* Documentation Quick View */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Documentación</p>
              <div className="space-y-2">
                {[
                  { label: 'Lic. AFA', value: player.licenciaAFA },
                  { label: 'Seguro', value: player.seguro },
                  { label: 'Apto Físico', value: player.aptoFisico },
                  { label: 'Carnet', value: player.carnet },
                  { label: 'Es Socio', value: player.esSocio },
                ].map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">{d.label}</span>
                    {d.value
                      ? <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓</span>
                      : <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">—</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
