"use client";
import React, { useState } from 'react';
import { Camera, Plus, Image, Film, Folder, Trophy, Users, X, Eye } from 'lucide-react';
import MediaUploadUniversal from '@/components/MediaUploadUniversal';
import { apiFetch } from '@/lib/apiClient';

const OFFICIAL_CATEGORIES = [
  { name: 'Primera', color: '#CC0000' },
  { name: 'Reserva', color: '#991B1B' },
  { name: '3ra', color: '#1D4ED8' },
  { name: '4ta', color: '#1E40AF' },
  { name: '5ta', color: '#2563EB' },
  { name: '6ta', color: '#7C3AED' },
  { name: '7ma', color: '#6D28D9' },
  { name: '8va', color: '#5B21B6' },
  { name: 'Escuelita', color: '#D97706' },
  { name: 'Pre Infantil', color: '#B45309' },
  { name: 'Infantil', color: '#92400E' },
];

const MEDIA_TYPES = [
  { key: 'FOTO_OFICIAL', label: 'Foto Oficial', icon: Image },
  { key: 'FOTO_PLANTEL', label: 'Foto Plantel', icon: Users },
  { key: 'FOTO_ENTRENAMIENTO', label: 'Entrenamientos', icon: Camera },
  { key: 'FOTO_PARTIDO', label: 'Partidos', icon: Trophy },
  { key: 'VIDEO', label: 'Videos', icon: Film },
];

function ImageCard({ media, onDelete }) {
  const [showFull, setShowFull] = useState(false);

  return (
    <>
      <div className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer" onClick={() => setShowFull(true)}>
        {media.url && (media.type === 'VIDEO' || media.url.includes('youtube') || media.url.includes('vimeo')) ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <Film size={32} className="text-gray-400" />
            <span className="absolute bottom-2 left-2 text-[10px] font-black text-white bg-black/60 px-2 py-0.5 rounded">VIDEO</span>
          </div>
        ) : (
          <img
            src={media.url}
            alt={media.title || ''}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/40 transition-all">
            <Eye size={16} className="text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(media); }}
            className="p-2 bg-red-500/60 backdrop-blur-sm rounded-xl hover:bg-red-600 transition-all"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {media.title && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-[10px] font-black text-white truncate">{media.title}</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showFull && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowFull(false)}>
          <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-xl" onClick={() => setShowFull(false)}>
            <X size={20} className="text-white" />
          </button>
          <img src={media.url} alt={media.title || ''} className="max-w-full max-h-full object-contain rounded-xl" onClick={e => e.stopPropagation()} />
          {media.title && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full">
              <p className="text-xs font-bold text-white">{media.title}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function UploadModal({ isOpen, onClose, onUpload, category }) {
  const [form, setForm] = useState({ url: '', title: '', type: 'FOTO_PLANTEL', description: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.url) return;
    setLoading(true);
    await onUpload({ ...form, category });
    setForm({ url: '', title: '', type: 'FOTO_PLANTEL', description: '' });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900">Agregar Media</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex justify-center">
            <MediaUploadUniversal
              value={form.url}
              onChange={(url) => setForm(p => ({ ...p, url }))}
              label="Subir imagen o video"
              accept="image/*,video/*"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-700 mb-1 uppercase tracking-wider">Título</label>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none"
              placeholder="Descripción de la imagen"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-700 mb-1 uppercase tracking-wider">Tipo</label>
            <select
              value={form.type}
              onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-jn-red outline-none"
            >
              {MEDIA_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading || !form.url} className="flex-1 py-2.5 bg-jn-red text-white rounded-xl font-black text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : 'Agregar'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GaleriaTab() {
  const [selectedCategory, setSelectedCategory] = useState('Primera');
  const [selectedType, setSelectedType] = useState('ALL');
  const [gallery, setGallery] = useState([]); // Will be populated from API
  const [uploadModal, setUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load gallery from API
  const loadGallery = async (category) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/futsal-media?category=${encodeURIComponent(category)}`);
      if (res.ok) {
        const data = await res.json();
        setGallery(Array.isArray(data) ? data : []);
      }
    } catch {
      setGallery([]);
    }
    setLoading(false);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    loadGallery(cat);
  };

  const handleUpload = async (form) => {
    try {
      const res = await apiFetch('/api/futsal-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          title: form.title || '',
          url: form.url,
          category: selectedCategory,
          description: form.description || '',
          season: '2026',
          published: true,
        }),
      });
      if (res.ok) {
        loadGallery(selectedCategory);
      }
    } catch {}
  };

  const handleDelete = async (media) => {
    if (!window.confirm('¿Eliminar este archivo de la galería?')) return;
    try {
      await apiFetch(`/api/futsal-media/${media.id}`, { method: 'DELETE' });
      loadGallery(selectedCategory);
    } catch {}
  };

  const selectedCat = OFFICIAL_CATEGORIES.find(c => c.name === selectedCategory);

  const filteredGallery = selectedType === 'ALL'
    ? gallery
    : gallery.filter(m => m.type === selectedType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Galería Deportiva</h2>
          <p className="text-sm text-gray-400 font-medium">Fotos y videos de cada categoría</p>
        </div>
        <button
          onClick={() => setUploadModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-jn-red text-white rounded-xl text-sm font-black hover:bg-red-700 transition-all shadow-lg shadow-red-500/30"
        >
          <Plus size={16} />
          Agregar Media
        </button>
      </div>

      {/* Category Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {OFFICIAL_CATEGORIES.map(cat => (
          <button
            key={cat.name}
            onClick={() => handleCategorySelect(cat.name)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              selectedCategory === cat.name
                ? 'text-white shadow-lg scale-[1.02]'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            style={selectedCategory === cat.name ? { backgroundColor: cat.color } : {}}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedType('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${selectedType === 'ALL' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
        >
          Todos
        </button>
        {MEDIA_TYPES.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${selectedType === t.key ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
            >
              <Icon size={11} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Category Header */}
      <div
        className="rounded-2xl p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${selectedCat?.color || '#CC0000'}, ${selectedCat?.color || '#CC0000'}99)` }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black">{selectedCategory}</h3>
            <p className="text-sm text-white/70 font-bold">{filteredGallery.length} archivos</p>
          </div>
          <Camera size={32} className="text-white/40" />
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredGallery.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Camera size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-black text-gray-500">Sin archivos en la galería</h3>
          <p className="text-sm font-medium mt-1">
            {selectedType !== 'ALL'
              ? `No hay ${MEDIA_TYPES.find(t => t.key === selectedType)?.label || 'archivos'} para ${selectedCategory}`
              : `Comenzá agregando la primera foto o video de ${selectedCategory}`
            }
          </p>
          <button onClick={() => setUploadModal(true)} className="mt-4 px-6 py-3 bg-jn-red text-white rounded-xl text-sm font-black hover:bg-red-700 transition-all">
            + Agregar Primera Foto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredGallery.map(media => (
            <ImageCard key={media.id} media={media} onDelete={handleDelete} />
          ))}
          {/* Add Button */}
          <button
            onClick={() => setUploadModal(true)}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-jn-red hover:text-jn-red transition-all group"
          >
            <Plus size={24} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase">Agregar</span>
          </button>
        </div>
      )}

      <UploadModal
        isOpen={uploadModal}
        onClose={() => setUploadModal(false)}
        onUpload={handleUpload}
        category={selectedCategory}
      />
    </div>
  );
}
