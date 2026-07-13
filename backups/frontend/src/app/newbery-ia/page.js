"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, BookOpen, Trophy, School, HelpCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, mode })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { text: data.text, isBot: true }]);
        setIsTyping(false);
      } else {
        throw new Error("Error in API");
      }
    } catch (e) {
      console.warn("Utilizando respuesta local offline para NewberyIAFull");
      // Simulate bot response
      setTimeout(() => {
        let reply = "";
        const lower = text.toLowerCase();

        // MODO: CONSULTAS CLUB
        if (mode === "club") {
          if (lower.includes("horario")) {
            reply = "El club abre de Lunes a Viernes de 17:00 a 22:00 hs. La oficina de secretaría atiende de 18:00 a 20:30 hs para trámites presenciales.";
          } else if (lower.includes("ubicacion") || lower.includes("donde") || lower.includes("direccion")) {
            reply = "Nuestra sede central queda en Alpatacal 3026, Villa Devoto. ¡Es un predio seguro con buffet familiar y canchas techadas!";
          } else if (lower.includes("cuota") || lower.includes("pagar") || lower.includes("asociarse")) {
            reply = "Podés asociarte online en la sección 'Hacete Socio' del menú principal. La cuota mensual varía según la categoría: \n- Infantil: $6.000\n- Cadete: $8.000\n- Activo: $12.000";
          } else {
            reply = "Esa información específica no la tengo al alcance inmediato, pero podés consultar en secretaría llamando al 4503-4567 o acercándote al club de 18 a 20:30 hs.";
          }
        } 
        // MODO: AYUDA ESCOLAR
        else if (mode === "school") {
          if (lower.includes("x") || lower.includes("multiplicar") || lower.includes("+") || lower.includes("cuenta")) {
            reply = "¡Las matemáticas son divertidas! 🧮 Por ejemplo, si tenés 8 pelotas y cada una vale 7 monedas, hacés 8 x 7 = 56 monedas en total. ¡Probá escribiéndome otra cuenta!";
          } else if (lower.includes("geografia") || lower.includes("pais") || lower.includes("capital")) {
            reply = "🌍 ¿Sabías que la capital de Argentina es Buenos Aires? Y que el monte más alto de América es el Aconcagua, situado en Mendoza. ¡La geografía es increíble!";
          } else {
            reply = "📚 ¡Excelente pregunta de estudio! Para aprenderlo rápido, recordá leer con atención, hacer un dibujo explicativo y explicárselo a un compañero. ¿Querés que hagamos otro ejercicio?";
          }
        } 
        // MODO: REGLAS Y EJERCICIOS
        else if (mode === "sports") {
          if (lower.includes("futsal") || lower.includes("futbol")) {
            reply = "⚽ En Futsal AFA juegan 5 contra 5 en una cancha de parquet o cemento de 40x20 metros. El partido dura 20 minutos netos por lado y los cambios son ilimitados. ¡Es súper dinámico!";
          } else if (lower.includes("ejercicio") || lower.includes("entrenar") || lower.includes("casa")) {
            reply = "🏃‍♂️ ¡Desafío de ejercicio en casa! Hagamos esto:\n1. 10 saltos de estrella (abriendo brazos y piernas).\n2. Mantener equilibrio en un solo pie por 15 segundos.\n3. 5 sentadillas lentas.\n¡Tomá agua y repetilo 2 veces para estar listo para el entrenamiento!";
          } else {
            reply = "Deportes en Newbery: Ofrecemos Futsal, Patín Artístico, Vóley y Artes Marciales. ¿De cuál querés aprender las reglas?";
          }
        } 
        // MODO: TRIVIAS Y DESAFÍOS
        else if (mode === "trivia" || lower.includes("empezar") || lower.includes("trivia")) {
          if (lower.includes("futsal") || lower.includes("pelota") || lower.includes("empezar")) {
            reply = "🏆 Pregunta de Trivia: ¿Cuántos jugadores de un mismo equipo entran a la cancha al inicio de un partido de Futsal? \n\nA) 11 jugadores \nB) 5 jugadores \nC) 7 jugadores \n\n¡Respondé A, B o C!";
          } else if (lower.includes("b") || lower.includes("5")) {
            reply = "🎉 ¡EXCELENTE! Respuesta correcta. Se juegan 5 vs 5. Sumaste 20 XP a tu perfil de la comunidad digital Jorge Newbery 🪙.";
          } else {
            reply = "¡Casi! La respuesta correcta era la B (5 jugadores). ¿Querés que probemos con otra pregunta? Escribí 'otra'.";
          }
        }

        setMessages(prev => [...prev, { text: reply, isBot: true }]);
        setIsTyping(false);
      }, 1000);
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
