"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Newspaper, Tag, AlertCircle, Calendar, Edit, X } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';
import MediaUploadUniversal from '@/components/MediaUploadUniversal';

const fetch = apiFetch;

export default function AdminNoticias() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [tag, setTag] = useState("INFO");
  const [imageUrl, setImageUrl] = useState("");
  const [author, setAuthor] = useState("Admin");
  const [status, setStatus] = useState("DRAFT");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        setNews(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || "No se pudieron obtener las novedades del servidor.");
      }
    } catch (e) {
      console.error("Error al cargar novedades:", e);
      setErrorMsg("Error de conexión al cargar las novedades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!title || !content) {
      setErrorMsg("Por favor, completá el título y el contenido de la novedad.");
      return;
    }

    const payload = { title, description, content, category, tag, imageUrl, author, status };
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/news/${editId}` : '/api/news';

    try {
      const res = await fetch(url, {
        method,
        body: payload
      });

      if (res.ok) {
        setSuccessMsg(isEditing ? "¡Novedad actualizada con éxito!" : "¡Novedad publicada con éxito!");
        setTitle("");
        setDescription("");
        setContent("");
        setCategory("GENERAL");
        setTag("INFO");
        setImageUrl("");
        setAuthor("Admin");
        setStatus("DRAFT");
        setIsEditing(false);
        setEditId(null);
        fetchNews();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar la novedad");
      }
    } catch (e) {
      console.error("Error al guardar novedad:", e);
      setErrorMsg(e.message || "Error de red: No se pudo guardar la novedad en el servidor.");
    }
  };

  const handleStartEdit = (item) => {
    setIsEditing(true);
    setEditId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setContent(item.content);
    setCategory(item.category);
    setTag(item.tag || "INFO");
    setImageUrl(item.imageUrl || "");
    setAuthor(item.author || "Admin");
    setStatus(item.status || "DRAFT");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setTitle("");
    setDescription("");
    setContent("");
    setCategory("GENERAL");
    setTag("INFO");
    setImageUrl("");
    setAuthor("Admin");
    setStatus("DRAFT");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta noticia?")) return;

    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchNews();
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo eliminar la novedad del servidor.");
      }
    } catch (e) {
      console.error("Error al eliminar novedad:", e);
      setErrorMsg(e.message || "Error de red: No se pudo eliminar la novedad.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-jn-black">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Administración de Novedades</h2>
        <p className="text-sm text-gray-500">Publicá noticias y novedades en cartelera que los socios verán en la página de inicio.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* FORMULARIO DE ALTA / EDICIÓN */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-150 h-fit">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-jn-red">
            {isEditing ? <Edit size={20} /> : <Plus size={20} />} {isEditing ? "Editar Novedad" : "Crear Nueva Novedad"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Título</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej. Inscripciones Abiertas Futsal 2026" 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jn-red/45 outline-none font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Disciplina</label>
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jn-red/45 outline-none font-bold bg-white"
                >
                  <option value="GENERAL">General</option>
                  <option value="FUTSAL">Futsal AFA</option>
                  <option value="PATIN">Patín Artístico</option>
                  <option value="VOLEY">Vóleibol</option>
                  <option value="ARTES_MARCIALES">Artes Marciales</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Etiqueta / Tag</label>
                <select 
                  value={tag}
                  onChange={e => setTag(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jn-red/45 outline-none font-bold bg-white"
                >
                  <option value="INFO">Información 🔵</option>
                  <option value="IMPORTANTE">Importante 🔴</option>
                  <option value="LOGRO">Logro/Medalla 🏆</option>
                  <option value="EVENTO">Evento 📅</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Autor</label>
                <input 
                  type="text" 
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Ej. Admin" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jn-red/45 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Estado</label>
                <select 
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jn-red/45 outline-none font-bold bg-white"
                >
                  <option value="DRAFT">Borrador 📁</option>
                  <option value="PUBLISHED">Publicado 🚀</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Resumen Breve</label>
              <input 
                type="text" 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Breve introducción de la noticia..." 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jn-red/45 outline-none font-bold"
              />
            </div>
 
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Imagen de Portada</label>
              <MediaUploadUniversal
                value={imageUrl}
                onChange={setImageUrl}
                category="noticias"
                allowedTypes={['image']}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contenido de la Noticia</label>
              <textarea 
                rows="4"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Detalles sobre horarios, aranceles, inscripciones, etc..." 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jn-red/45 outline-none resize-none font-bold"
                required
              ></textarea>
            </div>

            {errorMsg && <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>}
            {successMsg && <p className="text-xs text-green-600 font-semibold">{successMsg}</p>}

            <div className="flex gap-2">
              <button 
                type="submit" 
                className="flex-1 bg-jn-black hover:bg-jn-red text-white py-3 rounded-lg font-bold text-sm tracking-wider transition-colors shadow-md uppercase"
              >
                {isEditing ? "Guardar Cambios" : "Publicar Noticia"}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="bg-white border hover:bg-gray-100 text-gray-700 px-4 rounded-lg font-bold text-xs uppercase"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LISTADO DE NOTICIAS PUBLICADAS */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-jn-black">
            <Newspaper size={20} className="text-gray-400" /> Novedades en Cartelera
          </h3>

          {loading ? (
            <div className="text-center py-10 font-bold text-gray-500">Cargando cartelera...</div>
          ) : news.length === 0 ? (
            <div className="text-center bg-white border border-gray-150 py-12 rounded-xl text-gray-500 font-semibold">
              <AlertCircle className="mx-auto mb-2 text-gray-300" size={32} />
              No hay novedades publicadas. ¡Creá la primera a la izquierda!
            </div>
          ) : (
            <div className="space-y-4">
              {news.map(item => {
                const badgeColors = {
                  INFO: 'bg-blue-50 text-blue-600',
                  IMPORTANTE: 'bg-red-50 text-jn-red',
                  LOGRO: 'bg-yellow-50 text-yellow-600 border border-yellow-100',
                  EVENTO: 'bg-purple-50 text-purple-600'
                };
                return (
                  <div 
                    key={item.id}
                    className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                            {item.category}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badgeColors[item.tag] || 'bg-gray-100'}`}>
                            {item.tag}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleStartEdit(item)}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                            title="Editar Novedad"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Eliminar Novedad"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-black text-lg leading-tight mb-2 text-jn-black">{item.title}</h4>
                      {item.imageUrl && (
                        <div className="my-3 rounded-xl overflow-hidden max-h-48 border">
                          <img src={item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/') ? (item.imageUrl.startsWith('/') && !item.imageUrl.startsWith('/uploads') ? item.imageUrl : `${API_URL}${item.imageUrl}`) : item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-500 font-bold italic mb-2">{item.description}</p>
                      )}
                      <p className="text-sm text-gray-600 leading-relaxed font-light">{item.content}</p>
                    </div>

                    <div className="border-t border-gray-100 mt-4 pt-3 flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString('es-AR')} | Por: {item.author || 'Admin'}</span>
                      <span className={item.status === 'PUBLISHED' ? 'text-green-600' : 'text-yellow-600'}>
                        {item.status === 'PUBLISHED' ? 'Publicado 🚀' : 'Borrador 📁'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
