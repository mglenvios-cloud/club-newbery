"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, BookOpen, Trophy, School, HelpCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/apiClient';

export default function NewberyIAFull() {
  const [mode, setMode] = useState("club"); // club, school, sports, trivia
  const [messages, setMessages] = useState([
    { text: "¡Hola! Soy Newbery IA 🔴⚪⚫. Estoy configurado en modo **Consultas del Club**. ¿Qué te gustaría saber hoy? (Ubicación, horarios, cómo asociarte, etc.)", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const changeMode = (newMode) => {
    setMode(newMode);
    let introText = "";
    if (newMode === "club") {
      introText = "¡Perfecto! Estoy listo para cualquier consulta del Club Jorge Newbery. Preguntame por horarios, cuotas, buffet, o inscripciones.";
    } else if (newMode === "school") {
      introText = "📚 ¡Modo Ayuda Escolar activado! ¿Qué tarea estamos haciendo? Puedo ayudarte con matemáticas, ciencias, geografía o lengua. ¡Preguntame lo que quieras!";
    } else if (newMode === "sports") {
      introText = "⚽ ¡Modo Reglas Deportivas y Ejercicios! ¿Querés saber cómo se juega al Futsal AFA o al Vóley? ¿O preferís que te recomiende un ejercicio divertido para hacer en casa?";
    } else if (newMode === "trivia") {
      introText = "🏆 ¡Modo Desafíos y Trivias! Voy a poner a prueba tu conocimiento. Decime: 'Empezar trivia' y te haré preguntas deportivas y del club.";
    }
    setMessages([{ text: introText, isBot: true }]);
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { text, isBot: false }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await apiFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, mode })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { text: data.text, isBot: true }]);
      } else {
        throw new Error(`Error ${res.status} en API de IA`);
      }
    } catch (e) {
      console.error('[NewberyIA] Error al obtener respuesta de IA:', e.message);
      setMessages(prev => [...prev, { text: '⚠️ No se pudo obtener respuesta de la IA. Por favor, verifica tu conexión con el servidor.', isBot: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-jn-black flex flex-col">
      {/* Header Premium */}
      <div className="bg-jn-black text-white py-6 shadow-md border-b border-white/10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="w-10 h-10 bg-gradient-to-br from-jn-red to-jn-darkred rounded-full flex items-center justify-center shadow-md animate-pulse">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight">NEWBERY IA</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Asistente Virtual Educativo y Deportivo</p>
            </div>
          </div>
          <span className="text-xs bg-jn-red text-white font-black px-3 py-1 rounded-full uppercase tracking-wider">Modo Activo</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1 grid lg:grid-cols-4 gap-8 overflow-hidden max-h-[80vh]">
        {/* Selector de Modo Lateral */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Seleccionar Modo</h3>
          
          <button 
            onClick={() => changeMode("club")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl font-bold text-sm transition-all text-left ${
              mode === 'club' ? 'bg-jn-red text-white shadow-md shadow-jn-red/10' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-150'
            }`}
          >
            <HelpCircle size={18} /> Consultas del Club
          </button>
          
          <button 
            onClick={() => changeMode("school")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl font-bold text-sm transition-all text-left ${
              mode === 'school' ? 'bg-jn-red text-white shadow-md shadow-jn-red/10' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-150'
            }`}
          >
            <School size={18} /> Ayuda Escolar 📚
          </button>

          <button 
            onClick={() => changeMode("sports")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl font-bold text-sm transition-all text-left ${
              mode === 'sports' ? 'bg-jn-red text-white shadow-md shadow-jn-red/10' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-150'
            }`}
          >
            <BookOpen size={18} /> Reglas y Deporte ⚽
          </button>

          <button 
            onClick={() => changeMode("trivia")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl font-bold text-sm transition-all text-left ${
              mode === 'trivia' ? 'bg-jn-red text-white shadow-md shadow-jn-red/10' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-150'
            }`}
          >
            <Trophy size={18} /> Trivias y Desafíos 🏆
          </button>
        </div>

        {/* Ventana de Conversación Principal */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-[60vh] lg:h-[70vh]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm text-sm whitespace-pre-line leading-relaxed ${
                  msg.isBot 
                    ? 'bg-white text-jn-black rounded-tl-none border border-gray-150' 
                    : 'bg-jn-red text-white rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-400 rounded-2xl rounded-tl-none p-4 border border-gray-150 flex gap-1 items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-150 bg-white flex gap-3 items-center">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend(input)}
              placeholder="Escribile un mensaje a la IA..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-6 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-jn-red outline-none"
            />
            <button 
              onClick={() => handleSend(input)}
              className="bg-jn-red text-white p-3 rounded-full hover:bg-jn-darkred transition-colors shadow-md shadow-jn-red/10 cursor-pointer"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
