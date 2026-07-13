"use client";

import React, { useState, useEffect } from 'react';
import { 
  Tv, Settings, Activity, Video, Award, Heart, BarChart2, 
  Megaphone, Plus, PlayCircle, Trash2, Edit3, Save, PlusCircle, 
  Volume2, VolumeX, Clock, Flag, Shield, List, Camera, RefreshCw, 
  Eye, Check, X, AlertTriangle, Calendar, FileText, Share2, DollarSign
} from 'lucide-react';
import { API_URL } from '@/config';

export default function NewberyTvAdmin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [channel, setChannel] = useState(null);
  const [livestreams, setLivestreams] = useState([]);
  const [videos, setVideos] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [youtubeAccount, setYoutubeAccount] = useState('');

  // Live Match Operator Panel state
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [eventMinute, setEventMinute] = useState(0);
  const [eventPlayer, setEventPlayer] = useState('');
  const [eventDetail, setEventDetail] = useState('');

  // Forms
  const [newStreamForm, setNewStreamForm] = useState({
    title: '', homeTeam: 'Jorge Newbery', awayTeam: '', competition: 'AFA Futsal',
    season: '2026', court: 'Sede Central Devoto', referee: '', date: '', timeSlot: ''
  });

  const [newVideoForm, setNewVideoForm] = useState({
    title: '', description: '', url: '', category: 'Partidos', season: '2026', tournament: 'AFA Futsal'
  });

  // Cookies helper
  const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const getAdminToken = () => {
    return getCookie('jn-auth-token') || getCookie('adminAuth') || '';
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const channelRes = await fetch(`${API_URL}/api/newberytv/channel`);
      if (channelRes.ok) {
        const data = await channelRes.json();
        setChannel(data);
      }

      const streamsRes = await fetch(`${API_URL}/api/newberytv/livestreams`);
      if (streamsRes.ok) {
        const data = await streamsRes.json();
        setLivestreams(data);
      }

      const videosRes = await fetch(`${API_URL}/api/newberytv/videos`);
      if (videosRes.ok) {
        const data = await videosRes.json();
        setVideos(data);
      }

      const statsRes = await fetch(`${API_URL}/api/newberytv/statistics`);
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStatistics(data);
      }

      // Fetch sponsors from general sponsors endpoint
      const sponsorsRes = await fetch(`${API_URL}/api/sponsors`);
      if (sponsorsRes.ok) {
        const data = await sponsorsRes.json();
        setSponsors(data);
      }
    } catch (err) {
      console.error("Error loading Newbery TV data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Channel update handler
  const handleUpdateChannel = async (e) => {
    e.preventDefault();
    const token = getAdminToken();
    try {
      const res = await fetch(`${API_URL}/api/newberytv/channel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(channel)
      });
      if (res.ok) {
        alert("Canal guardado exitosamente!");
        fetchData();
      }
    } catch {
      alert("Error al actualizar canal.");
    }
  };

  // Google OAuth stub
  const handleConnectYoutube = async () => {
    const token = getAdminToken();
    try {
      const res = await fetch(`${API_URL}/api/newberytv/youtube/connect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setYoutubeConnected(true);
        setYoutubeAccount(data.googleAccount);
        alert(`Conectado correctamente a YouTube: ${data.channelTitle}`);
      }
    } catch {
      alert("Error de red al conectar.");
    }
  };

  // Create stream handler
  const handleCreateStream = async (e) => {
    e.preventDefault();
    const token = getAdminToken();
    try {
      const res = await fetch(`${API_URL}/api/newberytv/livestreams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStreamForm)
      });
      if (res.ok) {
        alert("Transmisión programada con éxito!");
        setNewStreamForm({
          title: '', homeTeam: 'Jorge Newbery', awayTeam: '', competition: 'AFA Futsal',
          season: '2026', court: 'Sede Central Devoto', referee: '', date: '', timeSlot: ''
        });
        fetchData();
      }
    } catch {
      alert("Error al crear transmisión.");
    }
  };

  // Update livestream scoreboard/state helper
  const handleUpdateStreamState = async (broadcast, fields) => {
    const token = getAdminToken();
    try {
      const res = await fetch(`${API_URL}/api/newberytv/livestreams/${broadcast.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...broadcast, ...fields })
      });
      if (res.ok) {
        const updated = await res.json();
        if (selectedBroadcast && selectedBroadcast.id === broadcast.id) {
          setSelectedBroadcast(updated);
        }
        setLivestreams(prev => prev.map(s => s.id === broadcast.id ? updated : s));
      }
    } catch {
      alert("Error al actualizar estado.");
    }
  };

  // Delete stream
  const handleDeleteStream = async (id) => {
    if (!confirm("¿Seguro que desea eliminar esta transmisión?")) return;
    const token = getAdminToken();
    try {
      const res = await fetch(`${API_URL}/api/newberytv/livestreams/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      alert("Error al eliminar.");
    }
  };

  // Timeline Event log
  const handleLogEvent = async (type) => {
    if (!selectedBroadcast) return;
    const token = getAdminToken();
    
    let description = '';
    if (type === 'INICIO') description = 'Silbato inicial, comienza el partido.';
    else if (type === 'ENTRETIEMPO') description = 'Final del primer tiempo. Descanso.';
    else if (type === 'SEGUNDO_TIEMPO') description = 'Inicia el segundo tiempo.';
    else if (type === 'FINAL') description = 'Termina el encuentro.';
    else if (type === 'TIEMPO_MUERTO') description = 'Tiempo muerto solicitado.';
    else if (type === 'GOL') {
      description = `GOL de ${eventPlayer || 'Jugador'} (${eventDetail || 'Remate potente'}).`;
    } else {
      description = `${type}: ${eventPlayer} ${eventDetail}`;
    }

    try {
      const res = await fetch(`${API_URL}/api/newberytv/livestreams/${selectedBroadcast.id}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          minute: eventMinute,
          type,
          description,
          playerName: eventPlayer,
          detail: eventDetail,
          team: eventPlayer.includes('Newbery') || eventPlayer.startsWith('JN') ? 'LOCAL' : 'VISITANTE'
        })
      });

      if (res.ok) {
        // Clear inputs
        setEventPlayer('');
        setEventDetail('');
        // Refresh selected broadcast to show updated timeline/scorecard
        const refreshRes = await fetch(`${API_URL}/api/newberytv/livestreams`);
        if (refreshRes.ok) {
          const list = await refreshRes.json();
          setLivestreams(list);
          const current = list.find(s => s.id === selectedBroadcast.id);
          setSelectedBroadcast(current);
        }
      }
    } catch {
      alert("Error al registrar evento.");
    }
  };

  // Camera Toggle
  const handleToggleCamera = async (cameraName, currentStatus) => {
    if (!selectedBroadcast) return;
    const token = getAdminToken();
    const newStatus = currentStatus === 'ACTIVE' ? 'OFFLINE' : 'ACTIVE';
    try {
      const res = await fetch(`${API_URL}/api/newberytv/livestreams/${selectedBroadcast.id}/cameras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: cameraName, status: newStatus })
      });
      if (res.ok) {
        // Refresh list
        const refreshRes = await fetch(`${API_URL}/api/newberytv/livestreams`);
        if (refreshRes.ok) {
          const list = await refreshRes.json();
          setLivestreams(list);
          const current = list.find(s => s.id === selectedBroadcast.id);
          setSelectedBroadcast(current);
        }
      }
    } catch {
      alert("Error al cambiar estado de cámara.");
    }
  };

  // Replay Marker
  const handleLogReplay = async () => {
    if (!selectedBroadcast) return;
    const token = getAdminToken();
    const title = prompt("Título de la repetición (ej: Atajada del arquero local):");
    if (!title) return;
    try {
      const res = await fetch(`${API_URL}/api/newberytv/livestreams/${selectedBroadcast.id}/replays`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ minute: eventMinute, title })
      });
      if (res.ok) {
        const refreshRes = await fetch(`${API_URL}/api/newberytv/livestreams`);
        if (refreshRes.ok) {
          const list = await refreshRes.json();
          setLivestreams(list);
          const current = list.find(s => s.id === selectedBroadcast.id);
          setSelectedBroadcast(current);
        }
      }
    } catch {
      alert("Error al registrar repetición.");
    }
  };

  // Upload Video library
  const handleUploadVideo = async (e) => {
    e.preventDefault();
    const token = getAdminToken();
    try {
      const res = await fetch(`${API_URL}/api/newberytv/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newVideoForm)
      });
      if (res.ok) {
        alert("Video agregado a la biblioteca!");
        setNewVideoForm({
          title: '', description: '', url: '', category: 'Partidos', season: '2026', tournament: 'AFA Futsal'
        });
        fetchData();
      }
    } catch {
      alert("Error al guardar video.");
    }
  };

  return (
    <div className="bg-gray-150 min-h-screen text-gray-800 p-2 md:p-6 space-y-6">
      
      {/* Title Header */}
      <div className="bg-black text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between border-b-4 border-red-600 gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-3 rounded-xl text-white shadow-lg">
            <Tv size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">NEWBERY TV</h1>
            <p className="text-xs text-zinc-400 font-light">Centro Operativo Profesional de Transmisión Digital</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchData}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw size={14} /> Recargar Datos
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 border-b border-gray-300 pb-2">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: BarChart2 },
          { id: 'canal', name: 'Config. Canal', icon: Settings },
          { id: 'transmisiones', name: 'Transmisiones', icon: Video },
          { id: 'videos', name: 'Biblioteca Videos', icon: List },
          { id: 'estadisticas', name: 'Estadísticas Retención', icon: Activity },
          { id: 'configuracion', name: 'OBS / RTMP Settings', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-black text-white shadow-lg shadow-black/20 border-b-2 border-red-600' 
                  : 'bg-white text-gray-600 hover:bg-gray-250 border border-gray-200'
              }`}
            >
              <Icon size={16} /> {tab.name}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl shadow border border-gray-200 text-center text-sm font-semibold">
          Cargando consola Newbery TV...
        </div>
      ) : (
        <div className="space-y-6">

          {/* ═══════════════════════════ DASHBOARD TAB ═══════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Counters */}
              <div className="bg-white p-5 rounded-2xl shadow border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Suscriptores YouTube</span>
                  <span className="text-3xl font-black text-black">{channel?.subscribers || 0}</span>
                </div>
                <div className="bg-red-50 text-red-600 p-3 rounded-xl"><Tv size={24} /></div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Visualizaciones</span>
                  <span className="text-3xl font-black text-black">{channel?.views || 0}</span>
                </div>
                <div className="bg-zinc-100 text-black p-3 rounded-xl"><Eye size={24} /></div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Horas de Reproducción</span>
                  <span className="text-3xl font-black text-black">{channel?.watchHours || 0}h</span>
                </div>
                <div className="bg-red-50 text-red-600 p-3 rounded-xl"><Clock size={24} /></div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Canal YouTube</span>
                  <span className="text-sm font-black text-green-600 flex items-center gap-1 mt-1">
                    <Check size={16} /> CONECTADO
                  </span>
                </div>
                <div className="bg-zinc-900 text-white p-3 rounded-xl"><Settings size={24} /></div>
              </div>

              {/* Connected Streams list */}
              <div className="md:col-span-3 bg-white p-6 rounded-2xl shadow border border-gray-200 space-y-4 text-left">
                <h3 className="text-md font-black uppercase border-b border-gray-100 pb-2">Transmisiones Recientes y Planificadas</h3>
                {livestreams.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No hay transmisiones agendadas en el sistema.</p>
                ) : (
                  <div className="space-y-3">
                    {livestreams.map(b => (
                      <div key={b.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl gap-3">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <div className={`p-2.5 rounded-xl ${b.status === 'EN_VIVO' ? 'bg-red-650 text-white animate-pulse' : 'bg-zinc-800 text-zinc-300'}`}>
                            <Video size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-black leading-none">{b.title}</h4>
                            <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                              {b.competition} · {new Date(b.date).toLocaleDateString()} {b.timeSlot}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase ${
                            b.status === 'EN_VIVO' ? 'bg-red-100 text-red-600 border border-red-200' :
                            b.status === 'FINALIZADO' ? 'bg-gray-200 text-gray-600 border border-gray-300' :
                            'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {b.status}
                          </span>
                          <button
                            onClick={() => setSelectedBroadcast(b)}
                            className="bg-black hover:bg-zinc-800 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                          >
                            Operar Partido <PlayCircle size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick status OBS */}
              <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 space-y-4 text-left">
                <h3 className="text-md font-black uppercase border-b border-gray-100 pb-2">Status OBS / RTMP</h3>
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Servidor RTMP:</span>
                    <strong className="text-zinc-650 truncate max-w-[150px]">rtmp://a.rtmp.youtube.com/live2</strong>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Bitrate Promedio:</span>
                    <strong className="text-green-600">4850 Kbps</strong>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">FPS / Resolución:</span>
                    <strong className="text-black">60 fps · 1080p</strong>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Calidad Señal:</span>
                    <span className="text-green-600 font-bold">EXCELENTE</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════ CANAL CONFIG TAB ═══════════════════════════ */}
          {activeTab === 'canal' && channel && (
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 text-left max-w-3xl mx-auto space-y-6">
              <h3 className="text-lg font-black uppercase border-b border-gray-150 pb-2 text-zinc-800">
                Configuración del Canal Oficial
              </h3>
              
              <form onSubmit={handleUpdateChannel} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Nombre del Canal</label>
                    <input 
                      type="text" 
                      value={channel.name} 
                      onChange={e => setChannel({...channel, name: e.target.value})}
                      className="w-full border border-gray-300 p-2.5 rounded-xl text-xs bg-gray-50 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Email Público de Contacto</label>
                    <input 
                      type="email" 
                      value={channel.email || ''} 
                      onChange={e => setChannel({...channel, email: e.target.value})}
                      className="w-full border border-gray-300 p-2.5 rounded-xl text-xs bg-gray-50 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Logo del Canal URL</label>
                    <input 
                      type="text" 
                      value={channel.logoUrl || ''} 
                      onChange={e => setChannel({...channel, logoUrl: e.target.value})}
                      className="w-full border border-gray-300 p-2.5 rounded-xl text-xs bg-gray-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Banner del Canal URL</label>
                    <input 
                      type="text" 
                      value={channel.bannerUrl || ''} 
                      onChange={e => setChannel({...channel, bannerUrl: e.target.value})}
                      className="w-full border border-gray-300 p-2.5 rounded-xl text-xs bg-gray-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Enlace Canal YouTube</label>
                    <input 
                      type="text" 
                      value={channel.youtubeUrl || ''} 
                      onChange={e => setChannel({...channel, youtubeUrl: e.target.value})}
                      className="w-full border border-gray-300 p-2.5 rounded-xl text-xs bg-gray-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Sitio Web Club</label>
                    <input 
                      type="text" 
                      value={channel.website || ''} 
                      onChange={e => setChannel({...channel, website: e.target.value})}
                      className="w-full border border-gray-300 p-2.5 rounded-xl text-xs bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase">Descripción General del Canal</label>
                  <textarea 
                    value={channel.description || ''} 
                    onChange={e => setChannel({...channel, description: e.target.value})}
                    rows={4}
                    className="w-full border border-gray-300 p-2.5 rounded-xl text-xs bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Instagram</label>
                    <input type="text" value={channel.instagram || ''} onChange={e => setChannel({...channel, instagram: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-xl text-xs bg-gray-50"/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Facebook</label>
                    <input type="text" value={channel.facebook || ''} onChange={e => setChannel({...channel, facebook: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-xl text-xs bg-gray-50"/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Twitter / X</label>
                    <input type="text" value={channel.twitter || ''} onChange={e => setChannel({...channel, twitter: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-xl text-xs bg-gray-50"/>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-red-950/20"
                >
                  Guardar Cambios del Canal
                </button>
              </form>
            </div>
          )}

          {/* ═══════════════════════════ TRANSMISIONES TAB ═══════════════════════════ */}
          {activeTab === 'transmisiones' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form to Schedule stream */}
              <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 text-left h-fit space-y-4">
                <h3 className="text-md font-black uppercase border-b border-gray-100 pb-2">Programar Transmisión</h3>
                
                <form onSubmit={handleCreateStream} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase">Título del Evento</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Futsal: Jorge Newbery vs Atlanta" 
                      required 
                      value={newStreamForm.title} 
                      onChange={e => setNewStreamForm({...newStreamForm, title: e.target.value})}
                      className="w-full border border-gray-300 p-2 rounded-lg bg-gray-55"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase">Local</label>
                      <input type="text" value={newStreamForm.homeTeam} onChange={e => setNewStreamForm({...newStreamForm, homeTeam: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase">Visitante</label>
                      <input type="text" required value={newStreamForm.awayTeam} onChange={e => setNewStreamForm({...newStreamForm, awayTeam: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase">Competencia</label>
                      <input type="text" value={newStreamForm.competition} onChange={e => setNewStreamForm({...newStreamForm, competition: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase">Temporada</label>
                      <input type="text" value={newStreamForm.season} onChange={e => setNewStreamForm({...newStreamForm, season: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase">Fecha</label>
                      <input type="date" required value={newStreamForm.date} onChange={e => setNewStreamForm({...newStreamForm, date: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase">Hora</label>
                      <input type="text" placeholder="Ej: 21:00" required value={newStreamForm.timeSlot} onChange={e => setNewStreamForm({...newStreamForm, timeSlot: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase">Cancha</label>
                      <input type="text" value={newStreamForm.court} onChange={e => setNewStreamForm({...newStreamForm, court: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase">Árbitro</label>
                      <input type="text" value={newStreamForm.referee} onChange={e => setNewStreamForm({...newStreamForm, referee: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg"/>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase p-3 rounded-lg mt-2 cursor-pointer shadow shadow-red-950/20"
                  >
                    Programar Transmisión
                  </button>
                </form>
              </div>

              {/* List of existing streams */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow border border-gray-200 text-left space-y-4">
                <h3 className="text-md font-black uppercase border-b border-gray-100 pb-2">Programación Anual de Transmisiones</h3>
                
                {livestreams.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No hay transmisiones agendadas en la grilla anual.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {livestreams.map(b => (
                      <div key={b.id} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col justify-between gap-3 relative">
                        <button 
                          onClick={() => handleDeleteStream(b.id)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                        
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              b.status === 'EN_VIVO' ? 'bg-red-100 text-red-650' : 'bg-zinc-800 text-zinc-300'
                            }`}>
                              {b.status}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono">
                              {b.competition} · ID: {b.id}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-black mt-1 leading-tight">{b.title}</h4>
                          <p className="text-[10px] text-gray-500 mt-2 font-mono">
                            📅 {new Date(b.date).toLocaleDateString()} - ⏰ {b.timeSlot}
                          </p>
                          <p className="text-[10px] text-gray-550 mt-1">
                            🏟️ {b.court} | 👤 Ref: {b.referee || 'Sin designar'}
                          </p>
                        </div>
                        
                        <div className="flex gap-2 border-t border-gray-200/50 pt-2.5">
                          <button
                            onClick={() => setSelectedBroadcast(b)}
                            className="w-full bg-black hover:bg-zinc-800 text-white text-[10px] font-black uppercase px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            Operar Partido <PlayCircle size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════ OPERATOR LIVE MATCH PANEL (MODAL OVERLAY) ═══════════════════════════ */}
          {selectedBroadcast && (
            <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
              <div className="bg-white text-gray-900 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden border border-gray-300 my-8">
                
                {/* Header of Modal */}
                <div className="bg-black text-white p-5 flex items-center justify-between border-b-2 border-red-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black tracking-widest uppercase text-red-500">OPERADOR DE PARTIDO EN VIVO</span>
                  </div>
                  <h3 className="text-sm font-bold uppercase truncate max-w-md">{selectedBroadcast.title}</h3>
                  <button 
                    onClick={() => setSelectedBroadcast(null)}
                    className="text-zinc-400 hover:text-white hover:bg-white/10 p-2 rounded-full cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                  
                  {/* Left Column: Match Status & Scoreboard editing */}
                  <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl space-y-5 text-left">
                    <h4 className="text-xs font-black uppercase tracking-widest text-red-600 border-b border-gray-250 pb-1">
                      Marcador y Cronómetro
                    </h4>

                    {/* Stream State Toggle */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-gray-500 uppercase">Estado General de Transmisión</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['PROGRAMADO', 'EN_VIVO', 'FINALIZADO'].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleUpdateStreamState(selectedBroadcast, { status: s })}
                            className={`py-2 rounded-xl text-[9px] font-black uppercase cursor-pointer border ${
                              selectedBroadcast.status === s 
                                ? 'bg-red-600 border-red-600 text-white shadow-md' 
                                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {s === 'EN_VIVO' ? 'VIVO 🔴' : s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Local vs Visitante scores */}
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Goles Local</span>
                        <div className="flex items-center justify-center gap-3 mt-1.5">
                          <button 
                            onClick={() => handleUpdateStreamState(selectedBroadcast, { matchId: selectedBroadcast.matchId })} // Stub to verify
                            className="bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center font-black cursor-pointer"
                          >-</button>
                          <span className="text-xl font-black text-black">
                            {selectedBroadcast.liveStream?.viewerCount % 5 || 0} {/* Score simulator */}
                          </span>
                          <button 
                            onClick={() => handleLogEvent('GOL')}
                            className="bg-red-50 hover:bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center font-black cursor-pointer"
                          >+</button>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Goles Visita</span>
                        <div className="flex items-center justify-center gap-3 mt-1.5">
                          <button className="bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center font-black cursor-pointer">-</button>
                          <span className="text-xl font-black text-black">
                            {selectedBroadcast.liveStream?.peakViewers % 3 || 0} {/* Score simulator */}
                          </span>
                          <button className="bg-gray-150 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center font-black cursor-pointer">+</button>
                        </div>
                      </div>
                    </div>

                    {/* Added Time & Audio status */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase">Tiempo Adicional (min)</label>
                        <input 
                          type="number" 
                          min={0} 
                          value={selectedBroadcast.addedTime || 0} 
                          onChange={e => handleUpdateStreamState(selectedBroadcast, { addedTime: e.target.value })}
                          className="w-full border border-gray-300 p-2 rounded-lg bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase">Estado del Audio OBS</label>
                        <select
                          value={selectedBroadcast.audioStatus}
                          onChange={e => handleUpdateStreamState(selectedBroadcast, { audioStatus: e.target.value })}
                          className="w-full border border-gray-300 p-2 rounded-lg bg-white font-bold text-xs"
                        >
                          <option value="OK">OK 🔊</option>
                          <option value="MUTED">SILENCIADO 🔇</option>
                          <option value="NO_AUDIO">SIN AUDIO ❌</option>
                        </select>
                      </div>
                    </div>

                    {/* Camera connection states */}
                    <div className="space-y-2 border-t border-gray-200 pt-3">
                      <span className="text-[9px] font-black text-gray-500 uppercase block tracking-wider">Multi-Cámara Status</span>
                      <div className="space-y-1.5">
                        {selectedBroadcast.cameraStatuses?.map(cam => (
                          <div key={cam.id} className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-200 text-[10px]">
                            <span className="font-bold">{cam.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                cam.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                              }`}>
                                {cam.status === 'ACTIVE' ? 'ONLINE' : 'OFFLINE'}
                              </span>
                              <button
                                onClick={() => handleToggleCamera(cam.name, cam.status)}
                                className="bg-gray-150 hover:bg-gray-200 text-zinc-700 px-2 py-1 rounded-lg font-bold uppercase text-[8px] cursor-pointer"
                              >
                                Toggle
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Middle Column: Event logger (Goal, Cards, Sub, Timeout, Penalty) */}
                  <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl space-y-4 text-left">
                    <h4 className="text-xs font-black uppercase tracking-widest text-red-600 border-b border-gray-250 pb-1">
                      Registrador de Incidencias
                    </h4>

                    {/* Event Inputs */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1 space-y-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase">Minuto</label>
                        <input 
                          type="number" 
                          min={0}
                          max={120} 
                          value={eventMinute}
                          onChange={e => setEventMinute(parseInt(e.target.value))}
                          className="w-full border border-gray-300 p-2 rounded-lg bg-white font-mono text-center font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase">Jugador implicado</label>
                        <input 
                          type="text" 
                          placeholder="Ej: Ariel Ortega (JN)" 
                          value={eventPlayer}
                          onChange={e => setEventPlayer(e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-lg bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase">Detalle del suceso</label>
                      <input 
                        type="text" 
                        placeholder="Ej: Amonestación por falta táctica" 
                        value={eventDetail}
                        onChange={e => setEventDetail(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded-lg bg-white text-xs"
                      />
                    </div>

                    {/* Match events buttons grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button onClick={() => handleLogEvent('GOL')} className="bg-green-600 hover:bg-green-700 text-white font-black text-[10px] uppercase p-3 rounded-xl cursor-pointer">⚽ GOL</button>
                      <button onClick={() => handleLogEvent('TARJETA_AMARILLA')} className="bg-yellow-550 hover:bg-yellow-600 text-white font-black text-[10px] uppercase p-3 rounded-xl cursor-pointer">🟨 T. AMARILLA</button>
                      <button onClick={() => handleLogEvent('TARJETA_ROJA')} className="bg-red-650 hover:bg-red-700 text-white font-black text-[10px] uppercase p-3 rounded-xl cursor-pointer">🟥 T. ROJA</button>
                      <button onClick={() => handleLogEvent('PENAL')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase p-3 rounded-xl cursor-pointer">🥅 PENAL</button>
                      <button onClick={() => handleLogEvent('CAMBIO')} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase p-3 rounded-xl cursor-pointer">🔄 CAMBIO</button>
                      <button onClick={() => handleLogEvent('LESION')} className="bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase p-3 rounded-xl cursor-pointer">🚨 LESIÓN</button>
                      <button onClick={() => handleLogEvent('TIEMPO_MUERTO')} className="bg-zinc-800 hover:bg-black text-white font-black text-[10px] uppercase p-3 rounded-xl cursor-pointer">⏱️ T. MUERTO</button>
                      <button onClick={handleLogReplay} className="bg-purple-650 hover:bg-purple-700 text-white font-black text-[10px] uppercase p-3 rounded-xl cursor-pointer">📹 REP. JUGADA</button>
                    </div>

                    <div className="border-t border-gray-200 pt-3 space-y-1">
                      <span className="text-[9px] font-black text-gray-500 uppercase block tracking-wider">Acciones del Cronómetro</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleLogEvent('INICIO')} className="border border-gray-300 bg-white hover:bg-gray-100 text-zinc-800 p-2.5 rounded-xl font-bold uppercase text-[9px] cursor-pointer">Inicio 1T</button>
                        <button onClick={() => handleLogEvent('ENTRETIEMPO')} className="border border-gray-300 bg-white hover:bg-gray-100 text-zinc-800 p-2.5 rounded-xl font-bold uppercase text-[9px] cursor-pointer">Entretiempo</button>
                        <button onClick={() => handleLogEvent('SEGUNDO_TIEMPO')} className="border border-gray-300 bg-white hover:bg-gray-100 text-zinc-800 p-2.5 rounded-xl font-bold uppercase text-[9px] cursor-pointer">Inicio 2T</button>
                        <button onClick={() => handleLogEvent('FINAL')} className="border border-gray-300 bg-white hover:bg-gray-100 text-zinc-800 p-2.5 rounded-xl font-bold uppercase text-[9px] cursor-pointer">Final Partido</button>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Live events timeline list & Replay markers */}
                  <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl space-y-4 text-left flex flex-col h-[500px]">
                    <h4 className="text-xs font-black uppercase tracking-widest text-red-600 border-b border-gray-250 pb-1">
                      Línea de Tiempo del Encuentro
                    </h4>

                    {/* Timeline logs */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                      {selectedBroadcast.events?.length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-10">No se han registrado incidencias todavía.</p>
                      ) : (
                        selectedBroadcast.events?.map(evt => (
                          <div key={evt.id} className="p-3 bg-white border border-gray-200 rounded-xl space-y-1 relative shadow-sm">
                            <span className="text-[8px] bg-zinc-800 text-zinc-300 font-mono font-bold px-2 py-0.5 rounded absolute top-2 right-2">
                              {evt.type}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs">
                              <strong className="text-red-650 font-mono">{evt.minute}'</strong>
                              <span className="text-gray-400">·</span>
                              <span className="font-bold text-gray-800">{evt.playerName || 'Suceso'}</span>
                            </div>
                            <p className="text-[10px] text-gray-650 font-light leading-snug">{evt.description}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Replays marked */}
                    <div className="border-t border-gray-200 pt-3">
                      <span className="text-[9px] font-black text-gray-500 uppercase block tracking-wider">Repeticiones Guardadas ({selectedBroadcast.replayMarkers?.length || 0})</span>
                      <div className="flex gap-2 overflow-x-auto py-1.5 scrollbar-thin">
                        {selectedBroadcast.replayMarkers?.map(rep => (
                          <div key={rep.id} className="flex-shrink-0 bg-white border border-gray-200 p-2.5 rounded-xl text-[9px] w-[130px] shadow-sm select-none">
                            <div className="flex justify-between font-mono font-bold text-red-650">
                              <span>REP #{rep.id}</span>
                              <span>Min {rep.minute}'</span>
                            </div>
                            <h5 className="font-black text-gray-800 truncate mt-1 leading-none">{rep.title}</h5>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

                {/* Footer of modal */}
                <div className="bg-gray-100 border-t border-gray-250 p-4 flex justify-between items-center text-[10px] font-black uppercase text-gray-500">
                  <span>Match ID: {selectedBroadcast.matchId} · Broadcast ID: {selectedBroadcast.id}</span>
                  <button 
                    onClick={() => setSelectedBroadcast(null)}
                    className="bg-black hover:bg-zinc-800 text-white font-black px-6 py-2 rounded-xl cursor-pointer"
                  >
                    Finalizar Sesión Operador
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ═══════════════════════════ VIDEOS LIBRARY TAB ═══════════════════════════ */}
          {activeTab === 'videos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form to upload video */}
              <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 text-left h-fit space-y-4">
                <h3 className="text-md font-black uppercase border-b border-gray-100 pb-2">Subir Video a Biblioteca</h3>
                
                <form onSubmit={handleUploadVideo} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase">Título del Video</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Resumen: Newbery vs Hebraica" 
                      required 
                      value={newVideoForm.title} 
                      onChange={e => setNewVideoForm({...newVideoForm, title: e.target.value})}
                      className="w-full border border-gray-300 p-2 rounded-lg bg-gray-55"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase">Enlace del Video URL / Youtube ID</label>
                    <input 
                      type="text" 
                      placeholder="Ej: https://youtube.com/watch?v=xxxx" 
                      required 
                      value={newVideoForm.url} 
                      onChange={e => setNewVideoForm({...newVideoForm, url: e.target.value, youtubeId: e.target.value.split('v=')[1] || 'mock-id'})}
                      className="w-full border border-gray-300 p-2 rounded-lg bg-gray-55"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 col-span-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase">Temporada</label>
                      <input type="text" value={newVideoForm.season} onChange={e => setNewVideoForm({...newVideoForm, season: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg bg-white"/>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase">Campeonato</label>
                      <input type="text" value={newVideoForm.tournament} onChange={e => setNewVideoForm({...newVideoForm, tournament: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg bg-white"/>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase">Categoría</label>
                    <select
                      value={newVideoForm.category}
                      onChange={e => setNewVideoForm({...newVideoForm, category: e.target.value})}
                      className="w-full border border-gray-300 p-2 rounded-lg bg-white"
                    >
                      <option value="Partidos">Partidos Completos</option>
                      <option value="Resumenes">Resúmenes destacados</option>
                      <option value="Entrevistas">Entrevistas</option>
                      <option value="Historicos">Históricos / Retro</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase">Descripción Corta</label>
                    <textarea 
                      value={newVideoForm.description} 
                      onChange={e => setNewVideoForm({...newVideoForm, description: e.target.value})}
                      rows={3} 
                      className="w-full border border-gray-300 p-2 rounded-lg bg-white"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-black hover:bg-zinc-800 text-white font-black uppercase p-3 rounded-lg mt-2 cursor-pointer"
                  >
                    Agregar Video a Biblioteca
                  </button>
                </form>
              </div>

              {/* Grid of videos in library */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow border border-gray-200 text-left space-y-4">
                <h3 className="text-md font-black uppercase border-b border-gray-100 pb-2">Catálogo de Videos Guardados</h3>
                
                {videos.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No hay videos catalogados en la biblioteca multimedia.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.map(v => (
                      <div key={v.id} className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex gap-3 relative">
                        <div className="w-24 h-16 bg-black rounded-lg flex-shrink-0 overflow-hidden relative border border-gray-300">
                          <img src={v.thumbnailUrl || '/images/default-video.png'} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 text-left text-xs">
                          <span className="text-[8px] bg-red-100 text-red-650 px-1.5 py-0.5 rounded font-black uppercase block w-fit">
                            {v.category}
                          </span>
                          <h4 className="font-black text-black truncate mt-1">{v.title}</h4>
                          <p className="text-[10px] text-gray-500 mt-1 leading-tight line-clamp-2">{v.description}</p>
                          <span className="text-[9px] text-gray-400 font-mono mt-1 block">
                            Temporada: {v.season} · {v.tournament}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════ ESTADÍSTICAS TAB ═══════════════════════════ */}
          {activeTab === 'estadisticas' && statistics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              
              {/* Retention graph card */}
              <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow border border-gray-200 space-y-4">
                <h3 className="text-md font-black uppercase border-b border-gray-100 pb-2">Retención de Espectadores (minuto a minuto)</h3>
                
                {/* Simulated Chart Container */}
                <div className="bg-gray-900 text-green-400 p-6 rounded-2xl font-mono text-[10px] h-[300px] flex flex-col justify-between">
                  <div>
                    <span className="text-white block font-bold text-xs uppercase mb-1">PROMEDIO RETENCIÓN DE AUDIENCIA (90 MINUTOS)</span>
                    <span className="text-zinc-550 block">SIMULACIÓN POR INTERVALO DE MINUTO</span>
                  </div>
                  
                  {/* Ascii/Bar representation for stability */}
                  <div className="space-y-1.5 flex-1 flex flex-col justify-end mt-4">
                    {statistics.viewerRetention?.slice(0, 7).map(item => (
                      <div key={item.minute} className="flex items-center gap-3">
                        <span className="w-12 text-zinc-400">Min {item.minute}:</span>
                        <div className="flex-1 bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-red-600 h-full rounded-full" style={{ width: `${item.retention}%` }}></div>
                        </div>
                        <span className="w-8 font-black text-right text-white">{item.retention}%</span>
                      </div>
                    ))}
                  </div>

                  <span className="text-[9px] text-zinc-500 mt-3 block text-center uppercase tracking-widest">
                    Pico de audiencia retenida durante goles y penaltis
                  </span>
                </div>
              </div>

              {/* Device and Geographic metrics card */}
              <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 space-y-6">
                <h3 className="text-md font-black uppercase border-b border-gray-100 pb-2">Distribución de Audiencia</h3>
                
                {/* Device distribution */}
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider block">Dispositivo Utilizado</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-1.5">
                      <span className="font-bold">📱 Teléfonos Móviles:</span>
                      <strong className="text-red-650 text-sm">{statistics.deviceDistribution?.mobile}%</strong>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-50 pb-1.5">
                      <span className="font-bold">💻 Laptops y Computadoras:</span>
                      <strong className="text-black text-sm">{statistics.deviceDistribution?.desktop}%</strong>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-50 pb-1.5">
                      <span className="font-bold">📺 Smart TV y Tablets:</span>
                      <strong className="text-gray-600 text-sm">{statistics.deviceDistribution?.tablet}%</strong>
                    </div>
                  </div>
                </div>

                {/* Geography distribution */}
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider block">Ubicación Geográfica (IPs)</span>
                  <div className="space-y-2 text-xs">
                    {statistics.geographicRetention?.map(geo => (
                      <div key={geo.country} className="flex items-center justify-between border-b border-gray-50 pb-1.5">
                        <span className="font-bold">📍 {geo.country}:</span>
                        <strong className="text-black">{geo.viewers}% de espectadores</strong>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ═══════════════════════════ CONFIGURACION TAB ═══════════════════════════ */}
          {activeTab === 'configuracion' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
              
              {/* OBS Setup */}
              <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 space-y-4">
                <h3 className="text-md font-black uppercase border-b border-gray-100 pb-2">OBS Studio RTMP Config</h3>
                <p className="text-xs text-gray-500 font-light leading-relaxed">
                  Ingresa las siguientes credenciales en tu codificador (OBS Studio, vMix, Wirecast) en Ajustes &gt; Emisión:
                </p>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-gray-500 uppercase">Servidor RTMP</span>
                    <div className="flex bg-gray-100 p-2.5 rounded-xl border border-gray-300 font-mono font-bold select-all break-all">
                      rtmp://a.rtmp.youtube.com/live2
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-gray-500 uppercase">Clave de Transmisión (Stream Key)</span>
                    <div className="flex bg-gray-100 p-2.5 rounded-xl border border-gray-300 font-mono font-bold select-all">
                      jn-live-key-2026-v3-prod
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-250 p-4 rounded-xl flex gap-3 text-xs leading-relaxed text-yellow-800">
                  <AlertTriangle size={24} className="shrink-0 text-yellow-600" />
                  <div>
                    <strong className="block font-bold">ATENCIÓN: Clave de Stream Confidencial</strong>
                    Nunca reveles tu clave de emisión en la transmisión. Cualquier persona con esta clave puede transmitir a tu canal.
                  </div>
                </div>
              </div>

              {/* YouTube Integration connection status */}
              <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 space-y-5">
                <h3 className="text-md font-black uppercase border-b border-gray-100 pb-2">Integración YouTube API v3</h3>
                <p className="text-xs text-gray-500 font-light leading-relaxed">
                  Conecta la cuenta oficial de Google de la Secretaría de Prensa para sincronizar los streams directamente desde YouTube.
                </p>

                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-center space-y-3">
                  {youtubeConnected ? (
                    <>
                      <div className="inline-flex items-center gap-1 bg-green-100 text-green-600 border border-green-200 px-3 py-1.5 rounded-full text-xs font-black uppercase">
                        <Check size={14} /> Canal Sincronizado
                      </div>
                      <p className="text-xs font-bold text-black mt-2">
                        Cuenta conectada: <span className="font-mono">{youtubeAccount}</span>
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Detectado canal principal: <strong>Jorge Newbery TV Oficial</strong>
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full text-xs font-black uppercase">
                        Sin Conexión Google
                      </div>
                      <p className="text-xs text-gray-550 mt-2">
                        Haz clic abajo para iniciar el proceso de autorización OAuth.
                      </p>
                      <button 
                        onClick={handleConnectYoutube}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase px-6 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-red-950/20"
                      >
                        Conectar Cuenta Google
                      </button>
                    </>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <strong className="text-[9px] font-black text-gray-500 uppercase block tracking-wider">Permisos Concedidos:</strong>
                  <div className="space-y-1 font-mono text-[10px] text-zinc-550">
                    <div>✔ youtube.readonly (Leer canal y estadísticas)</div>
                    <div>✔ youtube.force-ssl (Crear transmisiones en vivo)</div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
