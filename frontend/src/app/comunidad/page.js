import { Heart, MessageCircle, Share2, Image as ImageIcon, Video, Send } from "lucide-react";
import Link from "next/link";

export default function ComunidadHome() {
  const posts = [
    {
      id: 1,
      autor: "Marcos Pérez",
      rol: "Socio Vitalicio",
      avatar: "MP",
      tiempo: "Hace 2 horas",
      contenido: "¡Qué lindo ver a los chicos de la 5ta división entrenando con tanta pasión! Vamos Newbery querido 🔴⚪⚫",
      imagen: true,
      likes: 45,
      comentarios: 12,
    },
    {
      id: 2,
      autor: "Lucas González",
      rol: "Jugador - 1ra División",
      avatar: "LG",
      tiempo: "Hace 5 horas",
      contenido: "Preparando el partido del viernes. ¡Los esperamos a todos en la cancha! Necesitamos su apoyo.",
      imagen: false,
      likes: 128,
      comentarios: 34,
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-jn-black">
      {/* Header Comunidad */}
      <div className="bg-jn-black text-white pt-20 pb-12 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-black mb-2">Comunidad JN</h1>
          <p className="text-gray-400 text-sm">Conectate con otros socios, jugadores y familias del club.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid md:grid-cols-4 gap-8">
        
        {/* Sidebar Izquierdo: Perfil rápido */}
        <div className="hidden md:block col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-48">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-jn-red text-white rounded-full flex items-center justify-center font-black text-xl">
                TÚ
              </div>
              <div>
                <p className="font-bold">Mi Perfil</p>
                <Link href="/portal" className="text-xs text-jn-red hover:underline">Ver Carnet</Link>
              </div>
            </div>
            <div className="space-y-4 text-sm font-semibold text-gray-600">
              <Link href="#" className="block hover:text-jn-black">Mis Publicaciones</Link>
              <Link href="#" className="block hover:text-jn-black">Fotos Guardadas</Link>
              <Link href="/disciplinas/futsal" className="block hover:text-jn-black">Noticias del Club</Link>
            </div>
          </div>
        </div>

        {/* Feed Central */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          
          {/* Crear Post */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
              <textarea 
                className="w-full bg-gray-50 rounded-xl p-3 resize-none focus:outline-none focus:ring-1 focus:ring-jn-red" 
                rows="2" 
                placeholder="¿Qué querés compartir con el club?"
              ></textarea>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <div className="flex gap-2">
                <button className="flex items-center gap-2 text-gray-500 hover:text-jn-red px-3 py-1 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold">
                  <ImageIcon size={18} /> Foto
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-jn-red px-3 py-1 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold">
                  <Video size={18} /> Video
                </button>
              </div>
              <button className="bg-jn-black text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors">
                Publicar <Send size={16} />
              </button>
            </div>
          </div>

          {/* Posts */}
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-jn-red to-jn-darkred text-white rounded-full flex items-center justify-center font-bold">
                  {post.avatar}
                </div>
                <div>
                  <p className="font-bold leading-none">{post.autor}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>{post.rol}</span> • <span>{post.tiempo}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-4 pb-3">
                <p>{post.contenido}</p>
              </div>

              {post.imagen && (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">
                  [Imagen Adjunta]
                </div>
              )}

              <div className="px-4 py-3 border-t border-gray-100 flex justify-between">
                <button className="flex items-center gap-2 text-gray-500 hover:text-jn-red transition-colors font-semibold">
                  <Heart size={20} /> {post.likes}
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-jn-black transition-colors font-semibold">
                  <MessageCircle size={20} /> {post.comentarios}
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-jn-black transition-colors font-semibold">
                  <Share2 size={20} /> Compartir
                </button>
              </div>
            </div>
          ))}

        </div>

        {/* Sidebar Derecho: Sugerencias */}
        <div className="hidden md:block col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-48">
            <h3 className="font-bold mb-4 text-sm uppercase text-gray-500 tracking-wider">Perfiles Destacados</h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="text-sm">
                      <p className="font-bold leading-none">Jugador {i}</p>
                      <p className="text-xs text-gray-500">1ra División</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-jn-red bg-red-50 px-3 py-1 rounded-full hover:bg-jn-red hover:text-white transition-colors">Seguir</button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
