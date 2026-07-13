"use client";
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, BookOpen, Trophy } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '@/config';

export default function FloatingIA() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "¡Hola! Soy Newbery IA 🔴⚪⚫. ¿En qué puedo ayudarte hoy? Podés consultarme horarios, reglas de deportes, pedirme ayuda con la escuela o jugar una trivia.", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const predefinedQuestions = [
    { label: "🕒 Horarios", query: "horarios" },
    { label: "📍 Ubicación", query: "ubicacion" },
    { label: "📚 Tarea Escolar", query: "tarea" },
    { label: "🎮 Jugar Trivia", query: "trivia" }
  ];

  const handleSend = async (text) => {
    if (!text.trim()) return;
 
    // Add user message
    setMessages(prev => [...prev, { text, isBot: false }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(API_URL + '/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, mode: 'club' })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { text: data.text, isBot: true }]);
        setIsTyping(false);
      } else {
        throw new Error("Error in API");
      }
    } catch (e) {
      console.warn("Utilizando respuesta local offline para FloatingIA");
      // Simulate bot response
      setTimeout(() => {
        let reply = "";
        const lower = text.toLowerCase();
 
        if (lower.includes("horario") || lower.includes("abren") || lower.includes("hora")) {
          reply = "🕒 El club está abierto de Lunes a Viernes de 17:00hs a 22:00hs para entrenamientos. La oficina de administración atiende de 18:00hs a 20:30hs.";
        } else if (lower.includes("ubicacion") || lower.includes("donde queda") || lower.includes("direccion") || lower.includes("sede")) {
          reply = "📍 Sede Central: Calle Alpatacal 3026, Villa Devoto. Contamos con estacionamiento seguro y buffet familiar.";
        } else if (lower.includes("tarea") || lower.includes("escuela") || lower.includes("matematica") || lower.includes("colegio")) {
          reply = "📚 ¡Claro! ¿Qué materia estamos estudiando? Decime un problema (ejemplo: '¿Cuánto es 8x7?' o '¿Cuáles son los colores secundarios?') y te lo explico de forma súper fácil.";
        } else if (lower.includes("trivia") || lower.includes("juego") || lower.includes("pregunta")) {
          reply = "🎮 ¡Trivia Express! A ver si sabés: ¿Qué colores tiene la camiseta oficial del Club Jorge Newbery? \n A) Azul y Amarillo \n B) Blanco, Rojo y Negro \n C) Verde y Blanco \n\n (Escribí la respuesta correcta para ganar 10 Newbery Coins!)";
        } else if (lower.includes("b") || lower.includes("blanco, rojo") || lower.includes("rojo y negro")) {
          reply = "🎉 ¡CORRECTO! Ganaste 10 Newbery Coins 🪙. La camiseta es blanca con detalles en rojo y negro en honor a nuestra gran historia.";
        } else if (lower.includes("ayuda") || lower.includes("como") || lower.includes("inscripcion")) {
          reply = "📝 Para inscribirte en cualquier actividad, podés ir a la sección 'Hacete Socio' en el menú, o acercarte a la administración general. ¡Te esperamos!";
        } else {
          reply = "🤖 ¡Interesante pregunta! Recordá que soy tu asistente digital. Podés preguntarme sobre reglas de Futsal, Patín, Vóley o pedirme un chiste deportivo.";
        }
 
        setMessages(prev => [...prev, { text: reply, isBot: true }]);
        setIsTyping(false);
      }, 1200);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Ventana de Chat */}
      {isOpen && (
        <div className="bg-white w-[320px] sm:w-[360px] h-[450px] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col mb-4 overflow-hidden animate-fade-in text-jn-black">
          {/* Header */}
          <div className="bg-gradient-to-r from-jn-black via-jn-red to-jn-darkred text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none">NEWBERY IA</h3>
                <span className="text-[10px] text-white/80">Asistente Virtual Activo</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 text-sm">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm whitespace-pre-line ${
                  msg.isBot 
                    ? 'bg-white text-jn-black rounded-tl-none border border-gray-100' 
                    : 'bg-jn-red text-white rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-400 rounded-2xl rounded-tl-none p-3 border border-gray-100 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Predefined Questions Bubble List */}
          <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 flex gap-2 overflow-x-auto hide-scrollbar">
            {predefinedQuestions.map((q, idx) => (
              <button 
                key={idx}
                onClick={() => handleSend(q.label)}
                className="whitespace-nowrap px-3 py-1 bg-white hover:bg-jn-red hover:text-white rounded-full text-xs font-semibold shadow-sm border border-gray-200 transition-colors flex-shrink-0"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="p-3 border-t border-gray-100 bg-white flex gap-2 items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Preguntale algo a Newbery IA..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-jn-red"
            />
            <button 
              onClick={() => handleSend(input)}
              className="bg-jn-red text-white p-2 rounded-full hover:bg-jn-darkred transition-colors shadow-md"
            >
              <Send size={14} />
            </button>
          </div>
          
          <div className="bg-gray-100 text-center py-1.5 border-t border-gray-200">
            <Link href="/newbery-ia" onClick={() => setIsOpen(false)} className="text-[10px] font-bold text-jn-red hover:underline flex items-center justify-center gap-1">
              <BookOpen size={10} /> Abrir Centro de Ayuda Completo
            </Link>
          </div>
        </div>
      )}

      {/* Botón flotante gatillador */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-jn-red to-jn-darkred text-white p-4 rounded-full shadow-[0_5px_20px_rgba(211,47,47,0.4)] hover:scale-105 transition-all flex items-center justify-center cursor-pointer border border-white/20"
      >
        <Sparkles size={24} className="animate-spin [animation-duration:8s] mr-1" />
        <span className="font-bold text-sm hidden sm:inline">NEWBERY IA</span>
      </button>
    </div>
  );
}
