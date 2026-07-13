"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Newspaper, Tag, AlertCircle, Calendar } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';

const fetch = apiFetch;

export default function AdminNoticias() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [tag, setTag] = useState("INFO");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        setNews(data);
      } else {
        const local = localStorage.getItem('jn-news');
        setNews(local ? JSON.parse(local) : defaultMockNews);
      }
    } catch (e) {
      console.warn("Backend offline, cargando noticias locales");
      const local = localStorage.getItem('jn-news');
      setNews(local ? JSON.parse(local) : defaultMockNews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const defaultMockNews = [
    { id: 1, title: "Inauguración de la nueva cancha de Futsal", content: "Piso sintético de última generación ya está listo para todas las divisiones inferiores del club.", category: "FUTSAL", tag: "IMPORTANTE", createdAt: new Date().toISOString() },
    { id: 2, title: "Gran Medallero en el Festival Metropolitano", content: "Nuestras chicas de Patín Artístico se llevaron el Oro en la categoría grupal show.", category: "PATIN", tag: "LOGRO", createdAt: new Date().toISOString() }
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!title || !content) {
      setErrorMsg("Por favor, completá el título y el contenido de la novedad.");
      return;
    }

    const payload = { title, content, category, tag };

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg("¡Novedad publicada con éxito!");
        setTitle("");
        setContent("");
        setCategory("GENERAL");
        setTag("INFO");
        fetchNews();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Error al crear la noticia");
      }
    } catch (e) {
      console.warn("Utilizando guardado de noticias local (offline)");
      const newNewsItem = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...payload
      };
      const updated = [newNewsItem, ...news];
      setNews(updated);
      localStorage.setItem('jn-news', JSON.stringify(updated));
      setSuccessMsg("¡Novedad guardada localmente (Offline)!");
      setTitle("");
      setContent("");
      setCategory("GENERAL");
      setTag("INFO");
    }
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
        throw new Error("Error en servidor");
      }
    } catch (e) {
      console.warn("Eliminación local offline para ID de noticia:", id);
      const updated = news.filter(n => n.id !== id);
      setNews(updated);
      localStorage.setItem('jn-news', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-jn-black">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Administración de Novedades</h2>
        <p className="text-sm text-gray-500">Publicá noticias y novedades en cartelera que los socios verán en la página de inicio.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* FORMULARIO DE ALTA */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-150 h-fit">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-jn-red">
            <Plus size={20} /> Crear Nueva Novedad
          </h3>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Título</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej. Inscripciones Abiertas Futsal 2026" 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jn-red/45 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Disciplina</label>
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jn-red/45 outline-none"
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
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jn-red/45 outline-none"
                >
                  <option value="INFO">Información 🔵</option>
                  <option value="IMPORTANTE">Importante 🔴</option>
                  <option value="LOGRO">Logro/Medalla 🏆</option>
                  <option value="EVENTO">Evento 📅</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contenido de la Noticia</label>
              <textarea 
                rows="4"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Detalles sobre horarios, aranceles, inscripciones, etc..." 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jn-red/45 outline-none resize-none"
              ></textarea>
            </div>

            {errorMsg && <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>}
            {successMsg && <p className="text-xs text-green-600 font-semibold">{successMsg}</p>}

            <button 
              type="submit" 
              className="w-full bg-jn-black hover:bg-jn-red text-white py-3 rounded-lg font-bold text-sm tracking-wider transition-colors shadow-md uppercase"
            >
              Publicar Noticia
            </button>
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
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <h4 className="font-black text-lg leading-tight mb-2 text-jn-black">{item.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed font-light">{item.content}</p>
                    </div>

                    <div className="border-t border-gray-100 mt-4 pt-3 flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString('es-AR')}</span>
                      <span>Publicado</span>
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
