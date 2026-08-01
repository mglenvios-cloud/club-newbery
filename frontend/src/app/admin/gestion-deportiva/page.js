"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  LayoutDashboard, Trophy, Users, Sprout, Calendar, UserCheck,
  FileText, BarChart2, RefreshCw, Wifi, WifiOff, Database,
  AlertCircle, CheckCircle, Zap, Activity, ChevronRight,
  Plus, Edit, Trash2, X, Save, Clock, Shield, Star,
  Search, Filter, Medal, Settings, Newspaper, Camera
} from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';

// ── Sub-Components ────────────────────────────────────────────────────────────
import DashboardTab from './_components/DashboardTab';
import CategoriasTab from './_components/CategoriasTab';
import PlantelTab from './_components/PlantelTab';
import SemilleroTab from './_components/SemilleroTab';
import CalendarioTab from './_components/CalendarioTab';
import ReportesTab from './_components/ReportesTab';
import GaleriaTab from './_components/GaleriaTab';
import MediaUploadUniversal from '@/components/MediaUploadUniversal';

// ── Official Categories ───────────────────────────────────────────────────────
const OFFICIAL_CATEGORIES = [
  'Primera', 'Reserva', '3ra', '4ta', '5ta', '6ta', '7ma', '8va',
  'Escuelita', 'Pre Infantil', 'Infantil'
];

// ── Fetch with Retry ──────────────────────────────────────────────────────────
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await apiFetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
      }
    }
  }
  throw lastError;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warn: 'bg-yellow-600',
    info: 'bg-blue-600',
  };
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-black shadow-2xl transition-all ${colors[toast.type] || colors.info}`}>
      {toast.type === 'success' && <CheckCircle size={16} />}
      {toast.type === 'error' && <AlertCircle size={16} />}
      {toast.type === 'warn' && <AlertCircle size={16} />}
      {toast.message}
    </div>
  );
}

// ── Coach Form Modal ──────────────────────────────────────────────────────────
function CoachModal({ isOpen, editId, form, onChange, onSave, onClose, loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900">{editId ? 'Editar Cuerpo Técnico' : 'Nuevo Miembro'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
        </div>
        <form onSubmit={onSave} className="p-6 space-y-4">
          <div className="flex justify-center mb-2">
            <MediaUploadUniversal
              value={form.photoUrl}
              onChange={(url) => onChange({ target: { name: 'photoUrl', value: url } })}
              label="Foto"
              accept="image/*"
              compact
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase tracking-wider">Nombre completo *</label>
              <input name="name" value={form.name} onChange={onChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase tracking-wider">Rol</label>
              <select name="role" value={form.role} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none">
                <option value="ENTRENADOR">Entrenador</option>
                <option value="ASISTENTE">Asistente</option>
                <option value="PREPARADOR_FISICO">Preparador Físico</option>
                <option value="DELEGADO">Delegado</option>
                <option value="MEDICO">Médico</option>
                <option value="KINESIOLOGO">Kinesiólogo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase tracking-wider">Categorías</label>
              <input name="categories" value={form.categories} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" placeholder="Primera, Reserva..." />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase tracking-wider">Licencia</label>
              <input name="license" value={form.license} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase tracking-wider">Teléfono</label>
              <input name="phone" value={form.phone} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase tracking-wider">Email</label>
              <input type="email" name="email" value={form.email} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase tracking-wider">Biografía</label>
              <textarea name="biography" value={form.biography} onChange={onChange} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-jn-red text-white rounded-xl font-black text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : editId ? 'Actualizar' : 'Registrar'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Match Modal ───────────────────────────────────────────────────────────────
function MatchModal({ isOpen, editId, form, onChange, onSave, onClose, loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-black text-gray-900">{editId ? 'Editar Partido' : 'Nuevo Partido'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
        </div>
        <form onSubmit={onSave} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Categoría</label>
              <select name="category" value={form.category} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none">
                {OFFICIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Rival *</label>
              <input name="opponent" value={form.opponent} onChange={onChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" placeholder="Nombre del equipo rival" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Fecha</label>
              <input type="date" name="date" value={form.date} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Hora</label>
              <input name="timeSlot" value={form.timeSlot} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" placeholder="20:00" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Estado</label>
              <select name="status" value={form.status} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none">
                <option value="UPCOMING">Próximo</option>
                <option value="LIVE">En Vivo</option>
                <option value="COMPLETED">Finalizado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Competencia</label>
              <input name="competition" value={form.competition} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Goles Newbery</label>
              <input type="number" name="ourScore" value={form.ourScore} onChange={onChange} min="0" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Goles Rival</label>
              <input type="number" name="opponentScore" value={form.opponentScore} onChange={onChange} min="0" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Cancha</label>
              <input name="venue" value={form.venue} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-jn-red text-white rounded-xl font-black text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : editId ? 'Actualizar' : 'Registrar Partido'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Training Modal ────────────────────────────────────────────────────────────
function TrainingModal({ isOpen, editId, form, onChange, onSave, onClose, loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900">{editId ? 'Editar Entrenamiento' : 'Nuevo Entrenamiento'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
        </div>
        <form onSubmit={onSave} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Categoría</label>
              <select name="category" value={form.category} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none">
                {OFFICIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Fecha</label>
              <input type="date" name="date" value={form.date} onChange={onChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Horario</label>
              <input name="timeSlot" value={form.timeSlot} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" placeholder="19:00" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Cancha</label>
              <input name="court" value={form.court} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Entrenador</label>
              <input name="coach" value={form.coach} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Objetivo</label>
              <input name="objective" value={form.objective} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Notas</label>
              <textarea name="notes" value={form.notes} onChange={onChange} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-jn-red text-white rounded-xl font-black text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : editId ? 'Actualizar' : 'Registrar Entrenamiento'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Coaches Tab ───────────────────────────────────────────────────────────────
function CoachesTab({ coaches, onSaveCoach, onDeleteCoach, loading }) {
  const [coachModal, setCoachModal] = useState({ isOpen: false, editId: null });
  const [coachForm, setCoachForm] = useState({ photoUrl: '', name: '', role: 'ENTRENADOR', categories: '', license: '', phone: '', email: '', biography: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCoachForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (coach) => {
    setCoachForm({ ...coach });
    setCoachModal({ isOpen: true, editId: coach.id });
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveCoach(coachForm, coachModal.editId);
    setCoachModal({ isOpen: false, editId: null });
  };

  const ROLE_LABELS = {
    ENTRENADOR: 'Entrenador',
    ASISTENTE: 'Asistente',
    PREPARADOR_FISICO: 'Prep. Físico',
    DELEGADO: 'Delegado',
    MEDICO: 'Médico',
    KINESIOLOGO: 'Kinesiólogo',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Cuerpo Técnico</h2>
          <p className="text-sm text-gray-400 font-medium">{coaches.length} miembros registrados</p>
        </div>
        <button onClick={() => { setCoachForm({ photoUrl: '', name: '', role: 'ENTRENADOR', categories: '', license: '', phone: '', email: '', biography: '' }); setCoachModal({ isOpen: true, editId: null }); }} className="flex items-center gap-2 px-5 py-2.5 bg-jn-red text-white rounded-xl text-sm font-black hover:bg-red-700 transition-all shadow-lg shadow-red-500/30">
          <Plus size={16} />
          Nuevo Miembro
        </button>
      </div>

      {coaches.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <UserCheck size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-black text-gray-500">Sin cuerpo técnico registrado</h3>
          <p className="text-sm font-medium mt-1">Comenzá registrando el primer entrenador</p>
          <button onClick={() => { setCoachForm({ photoUrl: '', name: '', role: 'ENTRENADOR', categories: '', license: '', phone: '', email: '', biography: '' }); setCoachModal({ isOpen: true, editId: null }); }} className="mt-4 px-6 py-3 bg-jn-red text-white rounded-xl text-sm font-black">+ Registrar Entrenador</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {coaches.map(coach => (
            <div key={coach.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group">
              <div className="h-36 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                {coach.photoUrl ? (
                  <img src={coach.photoUrl} alt={coach.name} className="w-full h-full object-cover object-top opacity-80" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                      <UserCheck size={24} className="text-white/40" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="text-[9px] font-black bg-jn-red text-white px-2 py-0.5 rounded-full uppercase">
                    {ROLE_LABELS[coach.role] || coach.role}
                  </span>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(coach)} className="p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-lg">
                    <Edit size={12} className="text-white" />
                  </button>
                  <button onClick={() => onDeleteCoach(coach.id)} className="p-1.5 bg-red-500/60 hover:bg-red-500 backdrop-blur-sm rounded-lg">
                    <Trash2 size={12} className="text-white" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-black text-gray-900 text-sm">{coach.name}</h3>
                {coach.categories && <p className="text-[10px] text-gray-400 font-bold mt-0.5">{coach.categories}</p>}
                {coach.license && (
                  <div className="flex items-center gap-1 mt-2">
                    <Shield size={10} className="text-jn-red" />
                    <span className="text-[10px] font-bold text-gray-500">{coach.license}</span>
                  </div>
                )}
                {coach.biography && (
                  <p className="text-[10px] text-gray-400 mt-2 line-clamp-2 leading-relaxed">{coach.biography}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CoachModal isOpen={coachModal.isOpen} editId={coachModal.editId} form={coachForm} onChange={handleChange} onSave={handleSave} onClose={() => setCoachModal({ isOpen: false, editId: null })} loading={loading} />
    </div>
  );
}

// ── Matches Tab ───────────────────────────────────────────────────────────────
function MatchesTab({ matches, onSaveMatch, onDeleteMatch, loading }) {
  const [matchModal, setMatchModal] = useState({ isOpen: false, editId: null });
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [matchForm, setMatchForm] = useState({
    category: 'Primera', opponent: '', homeTeam: 'Jorge Newbery', awayTeam: '',
    referee: '', attendance: 0, date: '', timeSlot: '', ourScore: 0, opponentScore: 0,
    status: 'UPCOMING', competition: 'AFA Futsal', venue: 'Cancha Jorge Newbery', season: '2026', isFeatured: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMatchForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveMatch(matchForm, matchModal.editId);
    setMatchModal({ isOpen: false, editId: null });
  };

  const handleEdit = (match) => {
    setMatchForm({
      ...match,
      date: match.date ? new Date(match.date).toISOString().split('T')[0] : '',
    });
    setMatchModal({ isOpen: true, editId: match.id });
  };

  const STATUS_LABELS = { UPCOMING: 'Próximo', LIVE: 'En Vivo', COMPLETED: 'Finalizado', CANCELLED: 'Cancelado' };
  const STATUS_COLORS = {
    UPCOMING: 'bg-blue-100 text-blue-700',
    LIVE: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-gray-100 text-gray-600',
    CANCELLED: 'bg-yellow-100 text-yellow-700',
  };

  const filtered = matches.filter(m => {
    const matchCat = filterCat === 'ALL' || (m.category || '').toLowerCase().includes(filterCat.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || m.status === filterStatus;
    return matchCat && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Partidos</h2>
          <p className="text-sm text-gray-400 font-medium">{filtered.length} partidos</p>
        </div>
        <button onClick={() => { setMatchForm({ category: 'Primera', opponent: '', homeTeam: 'Jorge Newbery', awayTeam: '', referee: '', attendance: 0, date: '', timeSlot: '', ourScore: 0, opponentScore: 0, status: 'UPCOMING', competition: 'AFA Futsal', venue: 'Cancha Jorge Newbery', season: '2026', isFeatured: false }); setMatchModal({ isOpen: true, editId: null }); }} className="flex items-center gap-2 px-5 py-2.5 bg-jn-red text-white rounded-xl text-sm font-black hover:bg-red-700 transition-all shadow-lg shadow-red-500/30">
          <Plus size={16} />
          Nuevo Partido
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:border-jn-red outline-none shadow-sm">
          <option value="ALL">Todas las categorías</option>
          {OFFICIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {['ALL', 'UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${filterStatus === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s === 'ALL' ? 'Todos' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Matches List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Trophy size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-black text-gray-500">Sin partidos</h3>
          <button onClick={() => { setMatchForm({ category: 'Primera', opponent: '', homeTeam: 'Jorge Newbery', awayTeam: '', date: '', timeSlot: '', ourScore: 0, opponentScore: 0, status: 'UPCOMING', competition: 'AFA Futsal', venue: 'Cancha Jorge Newbery', season: '2026', isFeatured: false, referee: '', attendance: 0 }); setMatchModal({ isOpen: true, editId: null }); }} className="mt-4 px-6 py-3 bg-jn-red text-white rounded-xl text-sm font-black">+ Cargar Primer Partido</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(m => {
            const won = m.status === 'COMPLETED' && m.ourScore > m.opponentScore;
            const draw = m.status === 'COMPLETED' && m.ourScore === m.opponentScore;
            const lost = m.status === 'COMPLETED' && m.ourScore < m.opponentScore;
            return (
              <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${m.status === 'LIVE' ? 'bg-red-100' : m.status === 'UPCOMING' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {m.status === 'LIVE' ? <Activity size={18} className="text-red-600 animate-pulse" /> : <Trophy size={18} className="text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-black text-gray-900 text-sm">Jorge Newbery vs {m.opponent}</p>
                      {m.isFeatured && <Star size={12} className="text-yellow-500" fill="#EAB308" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-bold">{m.category}</span>
                      <span>·</span>
                      <span>{m.competition}</span>
                      {m.date && <><span>·</span><span>{new Date(m.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</span></>}
                      {m.timeSlot && <span>{m.timeSlot}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {m.status === 'COMPLETED' && (
                      <div className="text-center">
                        <span className={`text-2xl font-black ${won ? 'text-green-600' : draw ? 'text-yellow-600' : 'text-red-600'}`}>
                          {m.ourScore} - {m.opponentScore}
                        </span>
                        <p className={`text-[9px] font-black ${won ? 'text-green-600' : draw ? 'text-yellow-600' : 'text-red-600'}`}>
                          {won ? 'VICTORIA' : draw ? 'EMPATE' : 'DERROTA'}
                        </p>
                      </div>
                    )}
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${STATUS_COLORS[m.status] || STATUS_COLORS.UPCOMING}`}>
                      {STATUS_LABELS[m.status] || m.status}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(m)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Edit size={14} className="text-gray-500" /></button>
                      <button onClick={() => onDeleteMatch(m.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} className="text-red-500" /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MatchModal isOpen={matchModal.isOpen} editId={matchModal.editId} form={matchForm} onChange={handleChange} onSave={handleSave} onClose={() => setMatchModal({ isOpen: false, editId: null })} loading={loading} />
    </div>
  );
}

// ── Trainings Tab ─────────────────────────────────────────────────────────────
function TrainingsTab({ trainings, onSaveTraining, onDeleteTraining, loading }) {
  const [trainingModal, setTrainingModal] = useState({ isOpen: false, editId: null });
  const [filterCat, setFilterCat] = useState('ALL');
  const [trainingForm, setTrainingForm] = useState({
    date: '', timeSlot: '', category: 'Primera', team: '', coach: '',
    court: 'Cancha Parquet', objective: '', notes: '', status: 'SCHEDULED'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrainingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveTraining(trainingForm, trainingModal.editId);
    setTrainingModal({ isOpen: false, editId: null });
  };

  const handleEdit = (t) => {
    setTrainingForm({ ...t, date: t.date ? new Date(t.date).toISOString().split('T')[0] : '' });
    setTrainingModal({ isOpen: true, editId: t.id });
  };

  const filtered = filterCat === 'ALL' ? trainings : trainings.filter(t => (t.category || '').toLowerCase().includes(filterCat.toLowerCase()));

  const today = new Date().toDateString();
  const todayTrainings = filtered.filter(t => new Date(t.date).toDateString() === today);
  const upcoming = filtered.filter(t => new Date(t.date) > new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = filtered.filter(t => new Date(t.date) < new Date()).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Entrenamientos</h2>
          <p className="text-sm text-gray-400 font-medium">{todayTrainings.length} hoy · {upcoming.length} próximos</p>
        </div>
        <button onClick={() => { setTrainingForm({ date: '', timeSlot: '', category: 'Primera', team: '', coach: '', court: 'Cancha Parquet', objective: '', notes: '', status: 'SCHEDULED' }); setTrainingModal({ isOpen: true, editId: null }); }} className="flex items-center gap-2 px-5 py-2.5 bg-jn-red text-white rounded-xl text-sm font-black hover:bg-red-700 transition-all shadow-lg shadow-red-500/30">
          <Plus size={16} />
          Nuevo Entrenamiento
        </button>
      </div>

      <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:border-jn-red outline-none shadow-sm">
        <option value="ALL">Todas las categorías</option>
        {OFFICIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {todayTrainings.length > 0 && (
        <div>
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            HOY
          </h3>
          <div className="space-y-2">
            {todayTrainings.map(t => (
              <TrainingItem key={t.id} training={t} onEdit={handleEdit} onDelete={onDeleteTraining} highlight />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">PRÓXIMOS</h3>
          <div className="space-y-2">
            {upcoming.slice(0, 10).map(t => (
              <TrainingItem key={t.id} training={t} onEdit={handleEdit} onDelete={onDeleteTraining} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">HISTORIAL</h3>
          <div className="space-y-2">
            {past.slice(0, 10).map(t => (
              <TrainingItem key={t.id} training={t} onEdit={handleEdit} onDelete={onDeleteTraining} past />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Calendar size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-black text-gray-500">Sin entrenamientos</h3>
          <button onClick={() => { setTrainingForm({ date: '', timeSlot: '', category: 'Primera', team: '', coach: '', court: 'Cancha Parquet', objective: '', notes: '', status: 'SCHEDULED' }); setTrainingModal({ isOpen: true, editId: null }); }} className="mt-4 px-6 py-3 bg-jn-red text-white rounded-xl text-sm font-black">+ Cargar Entrenamiento</button>
        </div>
      )}

      <TrainingModal isOpen={trainingModal.isOpen} editId={trainingModal.editId} form={trainingForm} onChange={handleChange} onSave={handleSave} onClose={() => setTrainingModal({ isOpen: false, editId: null })} loading={loading} />
    </div>
  );
}

function TrainingItem({ training, onEdit, onDelete, highlight, past }) {
  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:shadow-sm ${highlight ? 'bg-red-50 border-jn-red/20' : past ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-gray-100'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-jn-red/10' : 'bg-gray-100'}`}>
        <Calendar size={16} className={highlight ? 'text-jn-red' : 'text-gray-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-gray-900 text-sm">{training.category} {training.coach ? `· ${training.coach}` : ''}</p>
        <p className="text-[11px] text-gray-400 font-bold">
          {new Date(training.date).toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })}
          {training.timeSlot ? ` · ${training.timeSlot}` : ''}
          {training.court ? ` · ${training.court}` : ''}
        </p>
        {training.objective && <p className="text-[10px] text-gray-400 truncate">{training.objective}</p>}
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button onClick={() => onEdit(training)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit size={13} className="text-gray-500" /></button>
        <button onClick={() => onDelete(training.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-500" /></button>
      </div>
    </div>
  );
}

// ── Sidebar Nav ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'categorias', label: 'Categorías', icon: Trophy },
  { key: 'planteles', label: 'Planteles', icon: Users },
  { key: 'semillero', label: 'El Semillero', icon: Sprout },
  { key: 'matches', label: 'Partidos', icon: Activity },
  { key: 'trainings', label: 'Entrenamientos', icon: Calendar },
  { key: 'coaches', label: 'Cuerpo Técnico', icon: UserCheck },
  { key: 'galeria', label: 'Galería', icon: Camera },
  { key: 'calendario', label: 'Calendario', icon: Calendar },
  { key: 'reportes', label: 'Reportes', icon: BarChart2 },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GestionDeportivaPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [players, setPlayers] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [matches, setMatches] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [apiStatus, setApiStatus] = useState({ api: null });
  const [filterCategory, setFilterCategory] = useState('ALL');
  const autoRefreshRef = useRef(null);
  const CACHE_KEY = 'jn_gestion_v2_cache';

  const saveCache = (data) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, cachedAt: Date.now() })); } catch {}
  };
  const loadCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (Date.now() - d.cachedAt > 30 * 60 * 1000) return null;
      return d;
    } catch { return null; }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllData = useCallback(async (silent = false) => {
    if (!silent) setSkeletonLoading(true);

    const tryFetch = async (url) => {
      try {
        const res = await fetchWithRetry(url);
        if (!res.ok) return null;
        return await res.json();
      } catch { return null; }
    };

    let apiOnline = false;
    try {
      const healthRes = await fetchWithRetry(`${API_URL}/`, {}, 2);
      apiOnline = healthRes.ok;
    } catch { apiOnline = false; }

    setApiStatus({ api: apiOnline });

    if (!apiOnline) {
      const cached = loadCache();
      if (cached) {
        setStats(cached.stats || null);
        setPlayers(cached.players || []);
        setTrainings(cached.trainings || []);
        setTeams(cached.teams || []);
        setCoaches(cached.coaches || []);
        setMatches(cached.matches || []);
        if (!silent) showToast('⚠️ Usando datos en caché', 'warn');
      }
      setSkeletonLoading(false);
      return;
    }

    const [statsData, playersData, trainingsData, teamsData, coachesData, matchesData] = await Promise.all([
      tryFetch(`/api/gestion-deportiva/stats`),
      tryFetch(`/api/players`),
      tryFetch(`/api/gestion-deportiva/trainings`),
      tryFetch(`/api/teams`),
      tryFetch(`/api/gestion-deportiva/coaches`),
      tryFetch(`/api/matches`),
    ]);

    const newStats = statsData || null;
    const newPlayers = Array.isArray(playersData) ? playersData : [];
    const newTrainings = Array.isArray(trainingsData) ? trainingsData : [];
    const newTeams = Array.isArray(teamsData) ? teamsData : [];
    const newCoaches = Array.isArray(coachesData) ? coachesData : [];
    const newMatches = Array.isArray(matchesData) ? matchesData : [];

    setStats(newStats);
    setPlayers(newPlayers);
    setTrainings(newTrainings);
    setTeams(newTeams);
    setCoaches(newCoaches);
    setMatches(newMatches);

    saveCache({ stats: newStats, players: newPlayers, trainings: newTrainings, teams: newTeams, coaches: newCoaches, matches: newMatches });
    setSkeletonLoading(false);
    setUsingDemoData(false);
  }, []);

  useEffect(() => {
    fetchAllData();
    autoRefreshRef.current = setInterval(() => fetchAllData(true), 30000);
    return () => clearInterval(autoRefreshRef.current);
  }, [fetchAllData]);

  // ── CRUD: Players ──────────────────────────────────────────────────────────
  const handleSavePlayer = async (form, editId) => {
    setLoading(true);
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/players/${editId}` : `/api/players`;
    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast(editId ? '✅ Jugador actualizado' : '✅ Jugador registrado');
        fetchAllData(true);
      } else {
        showToast('Error al guardar jugador', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    }
    setLoading(false);
  };

  const handleDeletePlayer = async (id) => {
    if (!window.confirm('¿Eliminar este jugador del plantel?')) return;
    try {
      const res = await apiFetch(`/api/players/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Jugador eliminado');
        fetchAllData(true);
      }
    } catch {}
  };

  // ── CRUD: Coaches ──────────────────────────────────────────────────────────
  const handleSaveCoach = async (form, editId) => {
    setLoading(true);
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/gestion-deportiva/coaches/${editId}` : `/api/gestion-deportiva/coaches`;
    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast(editId ? '✅ Miembro actualizado' : '✅ Miembro registrado');
        fetchAllData(true);
      } else {
        showToast('Error al guardar', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    }
    setLoading(false);
  };

  const handleDeleteCoach = async (id) => {
    if (!window.confirm('¿Eliminar este miembro del cuerpo técnico?')) return;
    try {
      const res = await apiFetch(`/api/gestion-deportiva/coaches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Miembro eliminado');
        fetchAllData(true);
      }
    } catch {}
  };

  // ── CRUD: Matches ──────────────────────────────────────────────────────────
  const handleSaveMatch = async (form, editId) => {
    setLoading(true);
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/matches/${editId}` : `/api/matches`;
    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast(editId ? '✅ Partido actualizado' : '✅ Partido registrado');
        fetchAllData(true);
      } else {
        showToast('Error al guardar', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    }
    setLoading(false);
  };

  const handleDeleteMatch = async (id) => {
    if (!window.confirm('¿Eliminar este partido?')) return;
    try {
      const res = await apiFetch(`/api/matches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Partido eliminado');
        fetchAllData(true);
      }
    } catch {}
  };

  // ── CRUD: Trainings ────────────────────────────────────────────────────────
  const handleSaveTraining = async (form, editId) => {
    setLoading(true);
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/gestion-deportiva/trainings/${editId}` : `/api/gestion-deportiva/trainings`;
    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast(editId ? '✅ Entrenamiento actualizado' : '✅ Entrenamiento registrado');
        fetchAllData(true);
      } else {
        showToast('Error al guardar', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    }
    setLoading(false);
  };

  const handleDeleteTraining = async (id) => {
    if (!window.confirm('¿Eliminar este entrenamiento?')) return;
    try {
      const res = await apiFetch(`/api/gestion-deportiva/trainings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Entrenamiento eliminado');
        fetchAllData(true);
      }
    } catch {}
  };

  // Navigate to plantel with category filter
  const handleViewPlantel = (category) => {
    setFilterCategory(category);
    setActiveTab('planteles');
  };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
  };

  const currentNav = NAV_ITEMS.find(n => n.key === activeTab);

  return (
    <div className="flex h-full -m-6">
      {/* Vertical Tab Nav */}
      <aside className="w-52 flex-shrink-0 bg-gray-950 flex flex-col py-4 px-2 gap-1">
        <div className="px-3 py-2 mb-2">
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Gestión Deportiva</p>
          <p className="text-xs font-black text-white mt-0.5">Futsal AFA</p>
        </div>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left w-full ${isActive ? 'bg-jn-red text-white shadow-lg shadow-red-900/50' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-gray-500'} />
              {item.label}
            </button>
          );
        })}

        {/* API Status */}
        <div className="mt-auto px-3 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            {apiStatus.api ? (
              <><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-[9px] font-bold text-green-400">API Conectada</span></>
            ) : (
              <><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-[9px] font-bold text-red-400">API Offline</span></>
            )}
          </div>
          <button onClick={() => fetchAllData()} className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-gray-500 hover:text-white transition-colors">
            <RefreshCw size={10} className={skeletonLoading ? 'animate-spin' : ''} />
            Actualizar datos
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            stats={stats}
            players={players}
            teams={teams}
            coaches={coaches}
            matches={matches}
            trainings={trainings}
            onRefresh={() => fetchAllData()}
            loading={loading}
            skeletonLoading={skeletonLoading}
            usingDemoData={usingDemoData}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'categorias' && (
          <CategoriasTab
            teams={teams}
            players={players}
            onViewPlantel={handleViewPlantel}
            loading={loading}
          />
        )}

        {activeTab === 'planteles' && (
          <PlantelTab
            players={players}
            teams={teams}
            onSavePlayer={handleSavePlayer}
            onDeletePlayer={handleDeletePlayer}
            loading={loading}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
          />
        )}

        {activeTab === 'semillero' && (
          <SemilleroTab
            players={players}
            teams={teams}
            trainings={trainings}
            matches={matches}
            onViewPlantel={handleViewPlantel}
          />
        )}

        {activeTab === 'matches' && (
          <MatchesTab
            matches={matches}
            onSaveMatch={handleSaveMatch}
            onDeleteMatch={handleDeleteMatch}
            loading={loading}
          />
        )}

        {activeTab === 'trainings' && (
          <TrainingsTab
            trainings={trainings}
            onSaveTraining={handleSaveTraining}
            onDeleteTraining={handleDeleteTraining}
            loading={loading}
          />
        )}

        {activeTab === 'coaches' && (
          <CoachesTab
            coaches={coaches}
            onSaveCoach={handleSaveCoach}
            onDeleteCoach={handleDeleteCoach}
            loading={loading}
          />
        )}

        {activeTab === 'galeria' && (
          <GaleriaTab />
        )}

        {activeTab === 'calendario' && (
          <CalendarioTab
            trainings={trainings}
            matches={matches}
            onRefresh={() => fetchAllData(true)}
          />
        )}

        {activeTab === 'reportes' && (
          <ReportesTab
            players={players}
            matches={matches}
            trainings={trainings}
            coaches={coaches}
          />
        )}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
