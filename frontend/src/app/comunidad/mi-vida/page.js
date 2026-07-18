"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Heart, Send, Sparkles, Smile, PenTool, CheckCircle, ShieldAlert, Award } from 'lucide-react';
import ClubShield from '@/components/ClubShield';
import { API_URL } from '@/config';
import { apiFetch } from '@/lib/apiClient';

export default function MiVidaSocial() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [authorName, setAuthorName] = useState("");
  const [authorAge, setAuthorAge] = useState("");
  const [category, setCategory] = useState("COLEGIO"); // COLEGIO, CLUB, DIBUJO, METAS
  const [content, setContent] = useState("");
  const [drawingUrl, setDrawingUrl] = useState(null);
  
  // Canvas State
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#D32F2F"); // Red

  // Moderation Warning State
  const [modWarning, setModWarning] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        console.error("Error al obtener publicaciones del servidor");
      }
    } catch (e) {
      console.error("Error de conexión al cargar publicaciones:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    initCanvas();
  }, []);



  // DRAWING CANVAS ACTIONS
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
  };

  const startDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    ctx.strokeStyle = brushColor;
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    initCanvas();
  };

  // POST SUBMISSION
  const handlePost = async (e) => {
    e.preventDefault();
    setModWarning("");
    setSuccessMsg("");

    if (!authorName || !authorAge || !content) {
      setModWarning("Completá todos los datos obligatorios.");
      return;
    }

    let finalDrawingUrl = null;
    let type = "TEXT";

    if (category === "DIBUJO") {
      const canvas = canvasRef.current;
      if (canvas) {
        finalDrawingUrl = canvas.toDataURL(); // Base64 dataUrl
        type = "DRAWING";
      }
    }

    const payload = {
      authorName,
      authorAge: parseInt(authorAge),
      category,
      content,
      drawingUrl: finalDrawingUrl,
      type
    };

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.moderated) {
          setModWarning(`⚠️ Newbery IA retuvo tu publicación: ${data.reason}. Quedará pendiente de aprobación parental.`);
        } else {
          setSuccessMsg("🎉 ¡Tu publicación se subió con éxito!");
          setContent("");
          setAuthorName("");
          setAuthorAge("");
          clearCanvas();
          fetchPosts();
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setModWarning(err.error || "No se pudo guardar la publicación en el servidor.");
      }
    } catch (err) {
      console.error("Error al publicar:", err);
      setModWarning("Error de conexión con el servidor. No se pudo guardar la publicación.");
    }
  };

  const handleLike = async (id) => {
    try {
      const res = await apiFetch(`/api/posts/${id}/like`, { method: 'POST' });
      if (res.ok) {
        fetchPosts();
      } else {
        console.error(`[MiVida] Error al registrar me gusta: ${res.status}`);
      }
    } catch (e) {
      console.error('[MiVida] Error de red al registrar me gusta:', e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-jn-black">
      {/* Header */}
      <div className="bg-jn-black text-white py-12">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center">
            <ClubShield className="w-14 h-16" animate={false} />
          </div>
          <span className="inline-flex items-center gap-1.5 bg-jn-red text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Mi Vida 🌟
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tight">MI VIDA EN EL CLUB</h1>
          <p className="text-sm text-gray-400 max-w-md mx-auto">Espacio seguro para compartir tus dibujos, tareas, metas y vivencias deportivas.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl grid lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO DE NUEVA PUBLICACIÓN */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm h-fit space-y-4">
          <h3 className="font-black text-lg text-jn-black uppercase flex items-center gap-2">
            <Smile className="text-jn-red" size={20} /> ¿Qué querés compartir?
          </h3>
          
          <form onSubmit={handlePost} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-bold uppercase mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  placeholder="Tu nombre" 
                  className="w-full px-4 py-2 border border-gray-250 rounded-lg text-xs outline-none focus:ring-1 focus:ring-jn-red"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold uppercase mb-1">Edad</label>
                <input 
                  type="number" 
                  value={authorAge}
                  onChange={e => setAuthorAge(e.target.value)}
                  placeholder="Tu edad" 
                  className="w-full px-4 py-2 border border-gray-250 rounded-lg text-xs outline-none focus:ring-1 focus:ring-jn-red"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-bold uppercase mb-1">Categoría</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-250 rounded-lg text-xs outline-none focus:ring-1 focus:ring-jn-red font-bold"
              >
                <option value="COLEGIO">Colegio / Tareas 📚</option>
                <option value="CLUB">Club / Deporte ⚽</option>
                <option value="DIBUJO">Dibujar / Arte 🎨</option>
                <option value="METAS">Mis Metas 🎯</option>
              </select>
            </div>

            {/* Canvas de dibujo interactivo si la categoría es DIBUJO */}
            {category === "DIBUJO" && (
              <div className="space-y-3 bg-gray-55 p-3 rounded-2xl border border-gray-200">
                <p className="font-bold text-[10px] text-gray-400 uppercase">Dibujar Jersey o Escudo</p>
                
                {/* Colores de Pincel */}
                <div className="flex gap-2">
                  {["#D32F2F", "#111111", "#F8F9FA", "#D4AF37"].map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setBrushColor(col)}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        brushColor === col ? 'scale-110 border-jn-red shadow-sm' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                  <button 
                    type="button" 
                    onClick={clearCanvas}
                    className="ml-auto text-[9px] font-bold text-jn-red border border-jn-red/35 px-2 py-0.5 rounded"
                  >
                    Borrar todo
                  </button>
                </div>

                <canvas 
                  ref={canvasRef}
                  width={240}
                  height={180}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                  className="w-full h-[180px] bg-white border border-gray-200 rounded-xl cursor-crosshair touch-none shadow-inner"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-400 font-bold uppercase mb-1">Tu Mensaje</label>
              <textarea 
                rows="3"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="¡Escribí sobre tu dibujo, notas del colegio o tus metas!" 
                className="w-full px-4 py-2 border border-gray-250 rounded-lg text-xs outline-none focus:ring-1 focus:ring-jn-red resize-none"
                required
              ></textarea>
            </div>

            {modWarning && (
              <p className="text-[10px] text-red-600 font-bold leading-snug flex items-start gap-1 bg-red-50 p-2.5 rounded-lg border border-red-100">
                <ShieldAlert size={14} className="flex-shrink-0" /> {modWarning}
              </p>
            )}
            {successMsg && (
              <p className="text-[10px] text-green-600 font-bold leading-snug flex items-start gap-1 bg-green-50 p-2.5 rounded-lg border border-green-100">
                <CheckCircle size={14} className="flex-shrink-0" /> {successMsg}
              </p>
            )}

            <button 
              type="submit" 
              className="w-full bg-jn-black text-white hover:bg-jn-red py-3 rounded-lg font-black uppercase text-xs tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              Publicar en mi Muro <Send size={12} />
            </button>
          </form>
        </div>

        {/* FEED SOCIAL DE PUBLICACIONES */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-black text-lg text-jn-black uppercase tracking-wider flex items-center gap-2">
            ✨ Muro del Semillero
          </h3>

          {loading ? (
            <div className="text-center py-8 font-bold text-gray-400">Cargando publicaciones...</div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-gray-150 py-16 text-center text-gray-500 rounded-3xl font-semibold">
              El muro está vacío. ¡Compartí el primer post!
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <div key={post.id} className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm relative">
                  {/* Cabecera Publicación */}
                  <div className="p-4 bg-gray-55 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-jn-red to-jn-darkred text-white font-black text-sm rounded-full flex items-center justify-center">
                        {post.authorName.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-black text-sm text-jn-black">{post.authorName} <span className="text-xs text-gray-400 font-bold">({post.authorAge} años)</span></p>
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          post.category === 'COLEGIO' ? 'bg-blue-50 text-blue-600' :
                          post.category === 'CLUB' ? 'bg-green-50 text-green-700' :
                          post.category === 'DIBUJO' ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-jn-red'
                        }`}>
                          {post.category === 'COLEGIO' ? 'Colegio' :
                           post.category === 'CLUB' ? 'Deporte' :
                           post.category === 'DIBUJO' ? 'Dibujo' : 'Meta'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(post.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>

                  {/* Cuerpo Publicación */}
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-gray-700 font-light leading-relaxed">{post.content}</p>
                    
                    {/* Renderizado de Dibujo Canvas */}
                    {post.type === 'DRAWING' && post.drawingUrl && (
                      <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-inner max-w-sm mx-auto bg-white flex justify-center items-center">
                        {post.drawingUrl === 'MOCK_DRAWING_DATA' ? (
                          <div className="w-full h-44 bg-jn-red/5 flex items-center justify-center text-jn-red font-black text-xl select-none">
                            🎨 [Camiseta del Club]
                          </div>
                        ) : (
                          <img src={post.drawingUrl} alt="Dibujo del socio" className="w-full object-contain h-44" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="p-3 bg-gray-55 border-t border-gray-100 flex justify-between items-center text-xs">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1.5 font-bold text-gray-500 hover:text-jn-red transition-colors cursor-pointer px-3 py-1 bg-white rounded-full shadow-sm border border-gray-200"
                    >
                      <Heart size={14} className="text-jn-red animate-pulse" /> {post.likes} Me gusta
                    </button>
                    
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Award size={12} className="text-yellow-500" /> Moderado por Newbery IA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
