"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users, Search, Filter, Plus, Edit, Trash2, Eye, Heart,
  Shield, Star, AlertTriangle, ChevronDown, X, Camera,
  Phone, Mail, User, Calendar, Activity, Award, Flag,
  AlertCircle, CheckCircle, XCircle, Zap, FileText, Download
} from 'lucide-react';
import MediaUploadUniversal from '@/components/MediaUploadUniversal';

const OFFICIAL_CATEGORIES = [
  'Primera', 'Reserva', '3ra', '4ta', '5ta', '6ta', '7ma', '8va',
  'Escuelita', 'Pre Infantil', 'Infantil'
];

const POSITIONS = ['Arquero', 'Cierre', 'Ala Izquierda', 'Ala Derecha', 'Pivot'];

const STATUS_CONFIG = {
  ACTIVE: { label: 'Activo', color: 'bg-green-100 text-green-700', dot: 'bg-green-500', icon: CheckCircle },
  INJURED: { label: 'Lesionado', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', icon: Heart },
  SUSPENDED: { label: 'Suspendido', color: 'bg-red-100 text-red-700', dot: 'bg-red-500', icon: XCircle },
  INACTIVE: { label: 'Inactivo', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', icon: AlertCircle },
  CONVOCADO: { label: 'Convocado', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', icon: Star },
};

const FOOT_LABELS = { DERECHA: 'Derecha', IZQUIERDA: 'Izquierda', AMBAS: 'Ambidiestro' };

// ── Player Card ──────────────────────────────────────────────────────────────
function PlayerCard({ player, onView, onEdit, onDelete }) {
  const status = STATUS_CONFIG[player.playerStatus] || STATUS_CONFIG.ACTIVE;
  const StatusIcon = status.icon;
  const age = player.age || (player.birthDate
    ? Math.floor((Date.now() - new Date(player.birthDate)) / (365.25 * 24 * 3600 * 1000))
    : null);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group">
      {/* Photo Header */}
      <div className="relative h-44 bg-gradient-to-br from-gray-800 to-gray-900">
        {player.photoUrl ? (
          <img
            src={player.photoUrl}
            alt={`${player.name} ${player.lastName}`}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center">
              <User size={32} className="text-white/40" />
            </div>
          </div>
        )}

        {/* Dorsal Badge */}
        <div className="absolute top-3 left-3 w-9 h-9 bg-jn-red rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-sm font-black text-white">#{player.dorsal || '?'}</span>
        </div>

        {/* Status Badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black ${status.color} backdrop-blur-sm`}>
          <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </div>

        {/* Captain/Sub Badge */}
        {player.isCaptain && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-yellow-500 px-2 py-0.5 rounded-full">
            <Star size={9} fill="white" className="text-white" />
            <span className="text-[9px] font-black text-white">Capitán</span>
          </div>
        )}

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button onClick={() => onView(player)} className="p-2.5 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-xl transition-all">
            <Eye size={16} className="text-white" />
          </button>
          <button onClick={() => onEdit(player)} className="p-2.5 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-xl transition-all">
            <Edit size={16} className="text-white" />
          </button>
          <button onClick={() => onDelete(player.id)} className="p-2.5 bg-red-500/60 hover:bg-red-500 backdrop-blur-sm rounded-xl transition-all">
            <Trash2 size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-base font-black text-gray-900 leading-tight">
            {player.lastName ? `${player.lastName.toUpperCase()}, ${player.name}` : player.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400 font-bold">{player.position || 'Sin posición'}</span>
            {age && (
              <>
                <span className="text-gray-200">·</span>
                <span className="text-xs text-gray-400 font-bold">{age} años</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {player.category}
          </span>
          {player.dominantFoot && (
            <span className="text-[10px] font-bold text-gray-400">
              🦶 {FOOT_LABELS[player.dominantFoot] || player.dominantFoot}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {[
            { label: 'PJ', value: player.matchesPlayed || 0 },
            { label: 'G', value: player.goals || 0 },
            { label: 'A', value: player.assists || 0 },
            { label: 'TA', value: player.yellowCards || 0 },
          ].map((s, i) => (
            <div key={i} className="text-center bg-gray-50 rounded-lg p-1.5">
              <span className="text-sm font-black text-gray-900">{s.value}</span>
              <p className="text-[8px] text-gray-400 font-bold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* License & Insurance */}
        <div className="flex items-center gap-2">
          {player.licenciaAFA && (
            <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Shield size={8} /> AFA
            </span>
          )}
          {player.seguro && (
            <span className="text-[9px] font-black bg-green-50 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle size={8} /> Seguro
            </span>
          )}
          {player.aptoFisico && (
            <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Heart size={8} /> Apto
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Player Form Modal ────────────────────────────────────────────────────────
function PlayerFormModal({ isOpen, editId, form, onChange, onSave, onClose, loading }) {
  if (!isOpen) return null;
  const [activeSection, setActiveSection] = useState('personal');

  const sections = [
    { key: 'personal', label: 'Datos Personales' },
    { key: 'deportivo', label: 'Datos Deportivos' },
    { key: 'documentacion', label: 'Documentación' },
    { key: 'contacto', label: 'Contacto' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-xl font-black text-gray-900">{editId ? 'Editar Jugador' : 'Nuevo Jugador'}</h2>
            <p className="text-sm text-gray-400 font-medium">Futsal AFA · Club Atlético Jorge Newbery</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-gray-100">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`px-3 py-2 rounded-t-xl text-xs font-black transition-all ${activeSection === s.key ? 'bg-jn-red text-white' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={onSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeSection === 'personal' && (
            <>
              {/* Photo */}
              <div className="flex justify-center mb-4">
                <MediaUploadUniversal
                  value={form.photoUrl}
                  onChange={(url) => onChange({ target: { name: 'photoUrl', value: url } })}
                  label="Foto del jugador"
                  accept="image/*"
                  compact
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Nombre *</label>
                  <input name="name" value={form.name} onChange={onChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red focus:ring-2 focus:ring-jn-red/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Apellido *</label>
                  <input name="lastName" value={form.lastName} onChange={onChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red focus:ring-2 focus:ring-jn-red/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">DNI</label>
                  <input name="dni" value={form.dni} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red focus:ring-2 focus:ring-jn-red/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Fecha de Nacimiento</label>
                  <input type="date" name="birthDate" value={form.birthDate} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red focus:ring-2 focus:ring-jn-red/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Altura (cm)</label>
                  <input type="number" name="height" value={form.height} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red focus:ring-2 focus:ring-jn-red/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Peso (kg)</label>
                  <input type="number" name="weight" value={form.weight} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red focus:ring-2 focus:ring-jn-red/20 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Observaciones</label>
                <textarea name="observations" value={form.observations} onChange={onChange} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red focus:ring-2 focus:ring-jn-red/20 outline-none transition-all resize-none" />
              </div>
            </>
          )}

          {activeSection === 'deportivo' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Categoría *</label>
                  <select name="category" value={form.category} onChange={onChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red focus:ring-2 focus:ring-jn-red/20 outline-none transition-all">
                    {OFFICIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Posición</label>
                  <select name="position" value={form.position} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red focus:ring-2 focus:ring-jn-red/20 outline-none transition-all">
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Número / Dorsal</label>
                  <input type="number" name="dorsal" value={form.dorsal} onChange={onChange} min="0" max="99" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red focus:ring-2 focus:ring-jn-red/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Pierna Hábil</label>
                  <select name="dominantFoot" value={form.dominantFoot} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red focus:ring-2 focus:ring-jn-red/20 outline-none transition-all">
                    <option value="DERECHA">Derecha</option>
                    <option value="IZQUIERDA">Izquierda</option>
                    <option value="AMBAS">Ambidiestro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Estado</label>
                  <select name="playerStatus" value={form.playerStatus} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red focus:ring-2 focus:ring-jn-red/20 outline-none transition-all">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Fecha de Ingreso</label>
                  <input type="date" name="entryDate" value={form.entryDate || ''} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red focus:ring-2 focus:ring-jn-red/20 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isCaptain" checked={form.isCaptain || false} onChange={e => onChange({ target: { name: 'isCaptain', value: e.target.checked } })} className="w-4 h-4 rounded" />
                  <span className="text-xs font-bold text-gray-700">⭐ Capitán</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isSubCaptain" checked={form.isSubCaptain || false} onChange={e => onChange({ target: { name: 'isSubCaptain', value: e.target.checked } })} className="w-4 h-4 rounded" />
                  <span className="text-xs font-bold text-gray-700">🏅 Subcapitán</span>
                </label>
              </div>
            </>
          )}

          {activeSection === 'documentacion' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Licencia AFA', name: 'licenciaAFA', type: 'checkbox' },
                { label: 'Carnet', name: 'carnet', type: 'checkbox' },
                { label: 'Seguro', name: 'seguro', type: 'checkbox' },
                { label: 'Apto Físico', name: 'aptoFisico', type: 'checkbox' },
                { label: 'Es Socio', name: 'esSocio', type: 'checkbox' },
              ].map(f => (
                <label key={f.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    name={f.name}
                    checked={form[f.name] || false}
                    onChange={e => onChange({ target: { name: f.name, value: e.target.checked } })}
                    className="w-4 h-4 rounded accent-jn-red"
                  />
                  <span className="text-sm font-bold text-gray-700">{f.label}</span>
                </label>
              ))}
              <div className="col-span-2">
                <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Tutor (menores)</label>
                <input name="tutor" value={form.tutor || ''} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" placeholder="Nombre del tutor legal" />
              </div>
            </div>
          )}

          {activeSection === 'contacto' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Teléfono</label>
                <input name="phone" value={form.phone} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Email</label>
                <input type="email" name="email" value={form.email} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Dirección</label>
                <input name="address" value={form.address} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">Teléfono Emergencia</label>
                <input name="emergencyPhone" value={form.emergencyPhone || ''} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
          {activeSection !== 'personal' && (
            <button type="button" onClick={() => setActiveSection(sections[sections.findIndex(s => s.key === activeSection) - 1]?.key)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              ← Anterior
            </button>
          )}
          {activeSection !== 'contacto' ? (
            <button type="button" onClick={() => setActiveSection(sections[sections.findIndex(s => s.key === activeSection) + 1]?.key)} className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-black hover:bg-gray-700 transition-colors">
              Siguiente →
            </button>
          ) : (
            <button onClick={onSave} disabled={loading} className="flex-1 py-2.5 bg-jn-red text-white rounded-xl text-sm font-black hover:bg-red-700 transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : editId ? 'Actualizar Jugador' : 'Registrar Jugador'}
            </button>
          )}
          <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Player Detail Modal ──────────────────────────────────────────────────────
function PlayerDetailModal({ player, onClose, onEdit }) {
  const [activeTab, setActiveTab] = useState('datos');
  if (!player) return null;

  const tabs = [
    { key: 'datos', label: 'Datos Personales' },
    { key: 'deportivos', label: 'Deportivos' },
    { key: 'estadisticas', label: 'Estadísticas' },
    { key: 'documentacion', label: 'Documentación' },
    { key: 'contacto', label: 'Contacto' },
  ];

  const age = player.age || (player.birthDate
    ? Math.floor((Date.now() - new Date(player.birthDate)) / (365.25 * 24 * 3600 * 1000))
    : null);

  const status = STATUS_CONFIG[player.playerStatus] || STATUS_CONFIG.ACTIVE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-800 flex-shrink-0">
          {player.photoUrl && (
            <img src={player.photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-xl transition-all">
            <X size={18} className="text-white" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gray-700 flex-shrink-0">
              {player.photoUrl
                ? <img src={player.photoUrl} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><User size={28} className="text-white/40" /></div>
              }
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="text-xl font-black text-white leading-tight">
                {player.lastName ? `${player.lastName.toUpperCase()}, ${player.name}` : player.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm text-gray-300 font-bold">{player.position}</span>
                <span className="text-gray-500">·</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                {player.isCaptain && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-500 text-white">⭐ Capitán</span>}
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-jn-red rounded-xl flex items-center justify-center">
                <span className="text-xl font-black text-white">#{player.dorsal || '?'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b border-gray-100 overflow-x-auto flex-shrink-0">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-2 rounded-t-xl text-[11px] font-black whitespace-nowrap transition-all ${activeTab === t.key ? 'bg-jn-red text-white' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'datos' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nombre completo', value: `${player.lastName ? player.lastName + ', ' : ''}${player.name}` },
                { label: 'DNI', value: player.dni || '—' },
                { label: 'Fecha de nacimiento', value: player.birthDate ? new Date(player.birthDate).toLocaleDateString('es-AR') : '—' },
                { label: 'Edad', value: age ? `${age} años` : '—' },
                { label: 'Altura', value: player.height ? `${player.height} cm` : '—' },
                { label: 'Peso', value: player.weight ? `${player.weight} kg` : '—' },
                { label: 'Nacionalidad', value: player.nationality || 'Argentina' },
                { label: 'Fecha de ingreso', value: player.entryDate ? new Date(player.entryDate).toLocaleDateString('es-AR') : '—' },
              ].map((f, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{f.label}</p>
                  <p className="text-sm font-bold text-gray-900">{f.value}</p>
                </div>
              ))}
              {player.observations && (
                <div className="col-span-2 bg-yellow-50 rounded-xl p-3">
                  <p className="text-[9px] font-black text-yellow-700 uppercase tracking-wider mb-0.5">Observaciones</p>
                  <p className="text-sm text-gray-700">{player.observations}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'deportivos' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Categoría', value: player.category },
                { label: 'Posición', value: player.position },
                { label: 'Número', value: player.dorsal ? `#${player.dorsal}` : '—' },
                { label: 'Pierna hábil', value: FOOT_LABELS[player.dominantFoot] || player.dominantFoot || '—' },
                { label: 'Estado', value: status.label },
                { label: 'Temporada', value: player.season || '2026' },
              ].map((f, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{f.label}</p>
                  <p className="text-sm font-bold text-gray-900">{f.value}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'estadisticas' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Partidos Jugados', value: player.matchesPlayed || 0, color: 'text-gray-900' },
                  { label: 'Goles', value: player.goals || 0, color: 'text-jn-red' },
                  { label: 'Asistencias', value: player.assists || 0, color: 'text-blue-600' },
                  { label: 'Tarjetas Amarillas', value: player.yellowCards || 0, color: 'text-yellow-600' },
                  { label: 'Tarjetas Rojas', value: player.redCards || 0, color: 'text-red-700' },
                  { label: 'Vallas Invictas', value: player.cleanSheets || 0, color: 'text-green-600' },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                    <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
                    <p className="text-[10px] text-gray-400 font-black uppercase mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'documentacion' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Licencia AFA', value: player.licenciaAFA, icon: Shield },
                { label: 'Carnet', value: player.carnet, icon: FileText },
                { label: 'Seguro', value: player.seguro, icon: CheckCircle },
                { label: 'Apto Físico', value: player.aptoFisico, icon: Heart },
                { label: 'Es Socio', value: player.esSocio, icon: Star },
              ].map((f, i) => (
                <div key={i} className={`rounded-xl p-3 flex items-center gap-3 ${f.value ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <f.icon size={16} className={f.value ? 'text-green-600' : 'text-gray-400'} />
                  <div>
                    <p className="text-xs font-black text-gray-700">{f.label}</p>
                    <p className={`text-[10px] font-bold ${f.value ? 'text-green-600' : 'text-gray-400'}`}>
                      {f.value ? '✓ Presente' : '✗ No registrado'}
                    </p>
                  </div>
                </div>
              ))}
              {player.tutor && (
                <div className="col-span-2 bg-blue-50 rounded-xl p-3">
                  <p className="text-[9px] font-black text-blue-700 uppercase tracking-wider mb-0.5">Tutor Legal</p>
                  <p className="text-sm font-bold text-gray-900">{player.tutor}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contacto' && (
            <div className="space-y-3">
              {[
                { label: 'Teléfono', value: player.phone, icon: Phone },
                { label: 'Email', value: player.email, icon: Mail },
                { label: 'Dirección', value: player.address, icon: User },
                { label: 'Teléfono Emergencia', value: player.emergencyPhone, icon: Phone },
              ].filter(f => f.value).map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-jn-red/10 rounded-lg">
                    <f.icon size={14} className="text-jn-red" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">{f.label}</p>
                    <p className="text-sm font-bold text-gray-900">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <Link href={`/admin/jugadores/${player.id}`} target="_blank" className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-black hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
            <Eye size={14} /> Ficha Completa
          </Link>
          <button onClick={() => onEdit(player)} className="flex-1 py-2.5 bg-jn-red text-white rounded-xl text-sm font-black hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
            <Edit size={14} /> Editar Jugador
          </button>
          <button onClick={onClose} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function PlantelTab({
  players, teams, onSavePlayer, onDeletePlayer, loading,
  filterCategory, setFilterCategory
}) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'list'
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerModal, setPlayerModal] = useState({ isOpen: false, editId: null });
  const [playerForm, setPlayerForm] = useState({
    name: '', lastName: '', age: '', dorsal: 0, category: 'Primera',
    position: 'Ala Derecha', team: 'Futsal AFA',
    matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0,
    playerStatus: 'ACTIVE', birthDate: '', photoUrl: '',
    phone: '', email: '', address: '', dni: '', dominantFoot: 'DERECHA',
    height: '', weight: '', observations: '', entryDate: '',
    isCaptain: false, isSubCaptain: false, licenciaAFA: false, carnet: false,
    seguro: false, aptoFisico: false, esSocio: false, tutor: '', emergencyPhone: ''
  });

  const filtered = useMemo(() => {
    return players.filter(p => {
      const matchSearch = !search || [p.name, p.lastName, p.dni, p.position, p.category].some(
        f => f && f.toLowerCase().includes(search.toLowerCase())
      );
      const matchCat = !filterCategory || filterCategory === 'ALL' || (p.category || '').toLowerCase().includes((filterCategory || '').toLowerCase());
      const matchStatus = filterStatus === 'ALL' || p.playerStatus === filterStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [players, search, filterCategory, filterStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlayerForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (player) => {
    setSelectedPlayer(null);
    setPlayerForm({
      name: player.name || '', lastName: player.lastName || '', age: player.age || '',
      dorsal: player.dorsal || 0, category: player.category || 'Primera',
      position: player.position || 'Ala Derecha', team: player.team || 'Futsal AFA',
      matchesPlayed: player.matchesPlayed || 0, goals: player.goals || 0,
      assists: player.assists || 0, yellowCards: player.yellowCards || 0,
      redCards: player.redCards || 0, cleanSheets: player.cleanSheets || 0,
      playerStatus: player.playerStatus || 'ACTIVE',
      birthDate: player.birthDate ? new Date(player.birthDate).toISOString().split('T')[0] : '',
      photoUrl: player.photoUrl || '', phone: player.phone || '',
      email: player.email || '', address: player.address || '',
      dni: player.dni || '', dominantFoot: player.dominantFoot || 'DERECHA',
      height: player.height || '', weight: player.weight || '',
      observations: player.observations || '',
      entryDate: player.entryDate ? new Date(player.entryDate).toISOString().split('T')[0] : '',
      isCaptain: player.isCaptain || false, isSubCaptain: player.isSubCaptain || false,
      licenciaAFA: player.licenciaAFA || false, carnet: player.carnet || false,
      seguro: player.seguro || false, aptoFisico: player.aptoFisico || false,
      esSocio: player.esSocio || false, tutor: player.tutor || '',
      emergencyPhone: player.emergencyPhone || ''
    });
    setPlayerModal({ isOpen: true, editId: player.id });
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSavePlayer(playerForm, playerModal.editId);
    setPlayerModal({ isOpen: false, editId: null });
  };

  const handleNew = () => {
    setPlayerForm({
      name: '', lastName: '', age: '', dorsal: 0,
      category: filterCategory && filterCategory !== 'ALL' ? filterCategory : 'Primera',
      position: 'Ala Derecha', team: 'Futsal AFA',
      matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0,
      playerStatus: 'ACTIVE', birthDate: '', photoUrl: '',
      phone: '', email: '', address: '', dni: '', dominantFoot: 'DERECHA',
      height: '', weight: '', observations: '', entryDate: '',
      isCaptain: false, isSubCaptain: false, licenciaAFA: false, carnet: false,
      seguro: false, aptoFisico: false, esSocio: false, tutor: '', emergencyPhone: ''
    });
    setPlayerModal({ isOpen: true, editId: null });
  };

  const statusCounts = useMemo(() => {
    const counts = { ALL: players.length };
    Object.keys(STATUS_CONFIG).forEach(s => {
      counts[s] = players.filter(p => p.playerStatus === s).length;
    });
    return counts;
  }, [players]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Planteles</h2>
          <p className="text-sm text-gray-400 font-medium">
            {filtered.length} de {players.length} jugadores
            {filterCategory && filterCategory !== 'ALL' ? ` · ${filterCategory}` : ''}
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-jn-red text-white rounded-xl text-sm font-black hover:bg-red-700 transition-all hover:scale-105 shadow-lg shadow-red-500/30"
        >
          <Plus size={16} />
          Nuevo Jugador
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, apellido, DNI, posición..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-jn-red focus:ring-2 focus:ring-jn-red/20 outline-none transition-all"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          {/* Category Filter */}
          <select
            value={filterCategory || 'ALL'}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-jn-red outline-none"
          >
            <option value="ALL">Todas las categorías</option>
            {OFFICIAL_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex gap-1.5 flex-wrap">
            {[
              { key: 'ALL', label: 'Todos' },
              ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k, label: v.label }))
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${filterStatus === f.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {f.label}
                <span className="text-[9px] opacity-70">{statusCounts[f.key] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Player Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-black text-gray-500">Sin jugadores</h3>
          <p className="text-sm font-medium mt-1">
            {search || filterStatus !== 'ALL' || (filterCategory && filterCategory !== 'ALL')
              ? 'No hay resultados para los filtros aplicados'
              : 'Comenzá registrando el primer jugador del plantel'
            }
          </p>
          <button onClick={handleNew} className="mt-4 px-6 py-3 bg-jn-red text-white rounded-xl text-sm font-black hover:bg-red-700 transition-all">
            + Registrar Primer Jugador
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              onView={setSelectedPlayer}
              onEdit={handleEdit}
              onDelete={onDeletePlayer}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <PlayerFormModal
        isOpen={playerModal.isOpen}
        editId={playerModal.editId}
        form={playerForm}
        onChange={handleChange}
        onSave={handleSave}
        onClose={() => setPlayerModal({ isOpen: false, editId: null })}
        loading={loading}
      />
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
