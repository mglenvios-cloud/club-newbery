"use client";
import React, { useState, useEffect } from 'react';
import { Shield, Check, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';

const fetch = apiFetch;

export default function AdminModeracion() {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts/pending');
      if (res.ok) {
        const data = await res.json();
        setPendingPosts(data);
      } else {
        const local = localStorage.getItem('jn-posts');
        const posts = local ? JSON.parse(local) : [];
        setPendingPosts(posts.filter(p => !p.isApproved));
      }
    } catch (e) {
      console.warn("Backend offline, cargando moderación local");
      const local = localStorage.getItem('jn-posts');
      const posts = local ? JSON.parse(local) : [];
      setPendingPosts(posts.filter(p => !p.isApproved));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/posts/${id}/approve`, {
        method: 'PUT'
      });
      if (res.ok) {
        alert("Publicación aprobada.");
        fetchPending();
      } else {
        throw new Error("Server error");
      }
    } catch (e) {
      console.warn("Aprobación local offline");
      const local = localStorage.getItem('jn-posts');
      if (local) {
        const posts = JSON.parse(local);
        const updated = posts.map(p => p.id === id ? { ...p, isApproved: true } : p);
        localStorage.setItem('jn-posts', JSON.stringify(updated));
      }
      setPendingPosts(prev => prev.filter(p => p.id !== id));
      alert("Publicación aprobada localmente (Offline).");
    }
  };

  const handleReject = async (id) => {
    if (!confirm("¿Deseas rechazar y eliminar definitivamente esta publicación?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("Publicación rechazada y eliminada.");
        fetchPending();
      } else {
        throw new Error("Server error");
      }
    } catch (e) {
      console.warn("Rechazo local offline");
      const local = localStorage.getItem('jn-posts');
      if (local) {
        const posts = JSON.parse(local);
        const updated = posts.filter(p => p.id !== id);
        localStorage.setItem('jn-posts', JSON.stringify(updated));
      }
      setPendingPosts(prev => prev.filter(p => p.id !== id));
      alert("Publicación eliminada localmente (Offline).");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-jn-black">
      <div>
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <Shield className="text-jn-red" size={28} /> Moderación de Comunidad
        </h2>
        <p className="text-sm text-gray-500">Revisá y aprobá los dibujos, metas y comentarios cargados por los niños en 'Mi Vida'.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-55 border-b border-gray-100 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={14} /> Publicaciones Pendientes
          </span>
          <span className="bg-jn-red text-white text-xs font-bold px-3 py-0.5 rounded-full">
            {pendingPosts.length} pendientes
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="text-center py-10 font-bold text-gray-400">Cargando publicaciones pendientes...</div>
          ) : pendingPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-bold">
              ¡Excelente! No hay publicaciones pendientes de moderación en este momento.
            </div>
          ) : (
            pendingPosts.map(post => (
              <div key={post.id} className="p-5 flex flex-wrap justify-between items-start gap-4 hover:bg-gray-50 transition-colors">
                <div className="space-y-2 flex-1 max-w-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-jn-red/10 text-jn-red font-bold text-xs rounded-full flex items-center justify-center">
                      {post.authorName.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-none text-jn-black">{post.authorName} <span className="text-xs text-gray-400 font-bold">({post.authorAge} años)</span></p>
                      <span className="text-[9px] text-purple-600 font-bold uppercase">{post.category}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 font-light leading-relaxed">{post.content}</p>

                  {post.type === 'DRAWING' && post.drawingUrl && (
                    <div className="border border-gray-250 rounded-xl overflow-hidden max-w-xs bg-white mt-2">
                      {post.drawingUrl === 'MOCK_DRAWING_DATA' ? (
                        <div className="h-28 bg-jn-red/5 flex items-center justify-center text-jn-red font-black text-sm select-none">
                          🎨 [Dibujo Camiseta]
                        </div>
                      ) : (
                        <img src={post.drawingUrl} alt="Dibujo del socio" className="h-28 object-contain" />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 text-xs font-bold">
                  <button 
                    onClick={() => handleApprove(post.id)}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm"
                  >
                    <Check size={14} /> Aprobar
                  </button>
                  <button 
                    onClick={() => handleReject(post.id)}
                    className="flex items-center gap-1.5 bg-jn-black hover:bg-jn-red text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <Trash2 size={14} /> Rechazar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
