"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, Star, Gamepad2, Coins, RefreshCw, ChevronLeft, Zap, Shield, Target, HelpCircle, Award, Lock, CheckCircle, XCircle, Timer, Swords } from 'lucide-react';

// ======================== DATOS ========================
const GAMES_CATALOG = [
  {
    id: "memotest",
    title: "Memotest del Semillero",
    desc: "Encontrá las parejas de deportes del club antes de que se acabe el tiempo.",
    emoji: "🧠",
    level: "Nivel 1",
    age: "5 a 7 años",
    xp: 200,
    coins: 30,
    color: "red",
    difficulty: "Fácil",
  },
  {
    id: "paint",
    title: "Colorear el Escudo",
    desc: "Pintá el escudo oficial del club con los colores de Newbery.",
    emoji: "🎨",
    level: "Nivel 1",
    age: "5 a 7 años",
    xp: 150,
    coins: 20,
    color: "red",
    difficulty: "Fácil",
  },
  {
    id: "quiz",
    title: "Quiz Histórico",
    desc: "10 preguntas sobre la historia del Club Jorge Newbery. ¿Cuánto sabés?",
    emoji: "❓",
    level: "Nivel 2",
    age: "8 a 10 años",
    xp: 300,
    coins: 50,
    color: "black",
    difficulty: "Medio",
  },
  {
    id: "maze",
    title: "Laberinto Futbolero",
    desc: "Guiá la pelota al arco sorteando todos los obstáculos.",
    emoji: "🏃",
    level: "Nivel 2",
    age: "8 a 10 años",
    xp: 250,
    coins: 40,
    color: "black",
    difficulty: "Medio",
  },
  {
    id: "penalty",
    title: "Penalty Kick Arcade",
    desc: "5 penales, 9 zonas del arco. ¡El arquero IA te va a leer la mente!",
    emoji: "⚽",
    level: "Nivel 3",
    age: "11 a 12 años",
    xp: 350,
    coins: 60,
    color: "darkred",
    difficulty: "Difícil",
  },
  {
    id: "manager",
    title: "Futsal Manager",
    desc: "Armá la formación de inferiores, elegí tácticas y ganá la copa.",
    emoji: "🏆",
    level: "Nivel 3",
    age: "11 a 12 años",
    xp: 400,
    coins: 70,
    color: "darkred",
    difficulty: "Difícil",
  },
];

const LEVEL_COLORS = {
  "Nivel 1": { bg: "bg-red-50", border: "border-red-200", badge: "bg-jn-red text-white", title: "text-jn-red" },
  "Nivel 2": { bg: "bg-gray-50", border: "border-gray-300", badge: "bg-jn-black text-white", title: "text-jn-black" },
  "Nivel 3": { bg: "bg-red-950/5", border: "border-red-900/30", badge: "bg-jn-darkred text-white", title: "text-jn-darkred" },
};

// ======================== MAIN PAGE ========================
export default function JuegosCenter() {
  const [xp, setXp] = useState(1200);
  const [coins, setCoins] = useState(150);
  const [level, setLevel] = useState(3);
  const [activeGame, setActiveGame] = useState(null);
  const [completedGames, setCompletedGames] = useState([]);
  const [celebrating, setCelebrating] = useState(false);

  const awardPoints = useCallback((newXp, newCoins, gameId) => {
    setXp(prev => {
      const next = prev + newXp;
      if (next >= level * 1000) setLevel(l => l + 1);
      return next;
    });
    setCoins(prev => prev + newCoins);
    if (gameId) setCompletedGames(prev => prev.includes(gameId) ? prev : [...prev, gameId]);
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 2500);
  }, [level]);

  const xpInLevel = xp % 1000;
  const xpPercent = (xpInLevel / 1000) * 100;

  const levels = [
    { label: "Nivel 1", games: GAMES_CATALOG.filter(g => g.level === "Nivel 1"), emoji: "🎨", age: "5 a 7 años" },
    { label: "Nivel 2", games: GAMES_CATALOG.filter(g => g.level === "Nivel 2"), emoji: "🏃‍♂️", age: "8 a 10 años" },
    { label: "Nivel 3", games: GAMES_CATALOG.filter(g => g.level === "Nivel 3"), emoji: "🏆", age: "11 a 12 años" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-jn-black">
      {/* Celebration confetti overlay */}
      {celebrating && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-sm animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                backgroundColor: i % 3 === 0 ? '#D32F2F' : i % 3 === 1 ? '#111111' : '#FFD700',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto max-w-5xl py-8 px-4 space-y-8">

        {/* ── HEADER GAMIFICATION ── */}
        <div className="relative bg-jn-black text-white p-6 rounded-3xl shadow-2xl overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="absolute text-6xl select-none" style={{ left: `${(i % 4) * 28}%`, top: `${Math.floor(i / 4) * 40}%` }}>
                ⚽
              </div>
            ))}
          </div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-jn-red/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-jn-red/10 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-wrap justify-between items-center gap-6">
            {/* Left: Level + XP */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-jn-red rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-jn-red/40 border border-red-400/20">
                <span className="text-[10px] text-red-200 font-bold uppercase tracking-widest">Lvl</span>
                <span className="text-2xl font-black leading-none">{level}</span>
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Gamepad2 size={20} className="text-jn-red" />
                  Zona de Juegos
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">Jugá, aprendé y ganá Newbery Coins</p>
                <div className="mt-2 w-52">
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>{xpInLevel} XP</span>
                    <span>1000 XP → Nivel {level + 1}</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden border border-gray-700">
                    <div
                      className="bg-gradient-to-r from-jn-red to-red-400 h-full rounded-full transition-all duration-700 shadow-sm shadow-red-500/50"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Coins + Logros */}
            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 px-5 py-3 rounded-2xl text-center min-w-[110px]">
                <Coins size={18} className="text-yellow-400 mx-auto mb-1" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Monedas</p>
                <p className="text-xl font-black text-yellow-300">{coins} 🪙</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 px-5 py-3 rounded-2xl text-center min-w-[110px]">
                <Trophy size={18} className="text-yellow-500 mx-auto mb-1" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Logros</p>
                <p className="text-xl font-black">{completedGames.length} / {GAMES_CATALOG.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── GAME ACTIVE ── */}
        {activeGame ? (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden animate-fade-in">
            {/* Game header */}
            <div className="bg-jn-black px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{GAMES_CATALOG.find(g => g.id === activeGame)?.emoji}</span>
                <div>
                  <h2 className="text-white font-black text-sm uppercase tracking-wider">
                    {GAMES_CATALOG.find(g => g.id === activeGame)?.title}
                  </h2>
                  <p className="text-gray-400 text-[10px]">{GAMES_CATALOG.find(g => g.id === activeGame)?.difficulty} · {GAMES_CATALOG.find(g => g.id === activeGame)?.age}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveGame(null)}
                className="flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-colors cursor-pointer border border-white/10"
              >
                <ChevronLeft size={14} /> Volver al Hub
              </button>
            </div>

            <div className="p-6 md:p-10">
              {activeGame === "memotest" && <MemotestGame onWin={() => awardPoints(200, 30, "memotest")} />}
              {activeGame === "paint"    && <PaintShieldGame onSave={() => awardPoints(150, 20, "paint")} />}
              {activeGame === "maze"     && <MazeGame onWin={() => awardPoints(250, 40, "maze")} />}
              {activeGame === "manager"  && <FutsalManagerGame onWin={() => awardPoints(400, 70, "manager")} />}
              {activeGame === "quiz"     && <QuizGame onWin={() => awardPoints(300, 50, "quiz")} />}
              {activeGame === "penalty"  && <PenaltyGame onWin={() => awardPoints(350, 60, "penalty")} />}
            </div>
          </div>
        ) : (
          /* ── GAME CATALOG ── */
          <div className="space-y-10 animate-fade-in">
            {levels.map(({ label, games, emoji, age }) => {
              const colors = LEVEL_COLORS[label];
              return (
                <div key={label} className="space-y-4">
                  <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-3">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <h3 className={`text-lg font-black tracking-tight ${colors.title}`}>{label}</h3>
                      <p className="text-xs text-gray-400 font-medium">{age}</p>
                    </div>
                    <div className={`ml-auto text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${colors.badge}`}>
                      {games.length} juegos
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    {games.map(game => {
                      const done = completedGames.includes(game.id);
                      return (
                        <div
                          key={game.id}
                          className={`group relative bg-white rounded-2xl border-2 p-6 flex flex-col gap-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 overflow-hidden ${colors.border}`}
                        >
                          {done && (
                            <div className="absolute top-3 right-3 bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle size={10} /> COMPLETADO
                            </div>
                          )}
                          {/* Glow effect on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-jn-red/0 to-jn-red/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner flex-shrink-0 ${colors.bg} border ${colors.border}`}>
                              {game.emoji}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-black text-base text-jn-black leading-tight">{game.title}</h4>
                              <p className="text-xs text-gray-500 mt-1 leading-snug">{game.desc}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex gap-3 text-xs text-gray-400 font-semibold">
                              <span className="flex items-center gap-1"><Zap size={11} className="text-jn-red" /> {game.xp} XP</span>
                              <span className="flex items-center gap-1"><Coins size={11} className="text-yellow-500" /> {game.coins} 🪙</span>
                              <span className="flex items-center gap-1"><Star size={11} className="text-gray-400" /> {game.difficulty}</span>
                            </div>
                            <button
                              onClick={() => setActiveGame(game.id)}
                              className="bg-jn-black text-white text-xs font-black uppercase tracking-wider px-5 py-2 rounded-xl hover:bg-jn-red transition-colors duration-200 cursor-pointer shadow-sm"
                            >
                              {done ? "Rejugar" : "Jugar"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ================================================================
// 1. MEMOTEST — Flip 3D + Timer + 8 pares
// ================================================================
function MemotestGame({ onWin }) {
  const ICONS = ["⚽", "🏆", "👕", "🥇", "🥅", "📢", "🏊", "🥊"];
  const TIME_LIMIT = 90;

  const [board, setBoard] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [gameOver, setGameOver] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const timerRef = useRef(null);

  const initGame = useCallback(() => {
    const shuffled = [...ICONS, ...ICONS]
      .map((icon, idx) => ({ id: idx, icon }))
      .sort(() => Math.random() - 0.5);
    setBoard(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setWon(false);
    setGameOver(false);
    setTimeLeft(TIME_LIMIT);
    setBlocking(false);
  }, []);

  useEffect(() => { initGame(); }, []);

  useEffect(() => {
    if (won || gameOver) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setGameOver(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [won, gameOver]);

  const handleCardClick = (id) => {
    if (blocking || flipped.length === 2 || matched.includes(id) || flipped.includes(id) || won || gameOver) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (board[a].icon === board[b].icon) {
        setMatched(prev => {
          const next = [...prev, a, b];
          if (next.length === board.length) { setWon(true); onWin(); }
          return next;
        });
        setFlipped([]);
      } else {
        setBlocking(true);
        setTimeout(() => { setFlipped([]); setBlocking(false); }, 900);
      }
    }
  };

  const timerColor = timeLeft > 30 ? "text-green-500" : timeLeft > 10 ? "text-yellow-500" : "text-red-500 animate-pulse";

  return (
    <div className="text-center space-y-6 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-jn-red">Memotest del Semillero</h3>
          <p className="text-xs text-gray-500">Movimientos: {moves} · Parejas: {matched.length / 2} / {ICONS.length}</p>
        </div>
        <div className={`flex items-center gap-1.5 font-black text-lg ${timerColor}`}>
          <Timer size={18} />
          {timeLeft}s
        </div>
      </div>

      {!won && !gameOver ? (
        <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
          {board.map((card) => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
            const isMatched = matched.includes(card.id);
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-2xl cursor-pointer select-none transition-all duration-300 border-2 font-black shadow-sm
                  ${isMatched ? 'bg-green-50 border-green-400 scale-95 shadow-green-200' :
                    isFlipped ? 'bg-jn-red border-jn-red text-white scale-105 shadow-lg shadow-red-300' :
                    'bg-white border-gray-200 hover:border-jn-red hover:shadow-md hover:scale-105 text-jn-black text-xs'}
                `}
              >
                {isFlipped ? card.icon : <span className="text-jn-black font-black text-xs">JN</span>}
              </div>
            );
          })}
        </div>
      ) : won ? (
        <div className="space-y-4 py-8">
          <p className="text-5xl">🎉🏆🎉</p>
          <h4 className="text-2xl font-black text-jn-black">¡Felicitaciones, Ganaste!</h4>
          <p className="text-sm text-gray-500">Completaste el Memotest en <b>{moves} movimientos</b> con <b>{timeLeft}s restantes</b>.</p>
          <p className="text-sm font-black text-yellow-600">+30 Newbery Coins 🪙 · +200 XP ⚡</p>
          <button onClick={initGame} className="bg-jn-red text-white font-bold px-8 py-2.5 rounded-full hover:bg-jn-darkred transition-colors text-xs shadow-lg shadow-red-300 cursor-pointer">
            <RefreshCw size={13} className="inline mr-1.5" /> Jugar de Nuevo
          </button>
        </div>
      ) : (
        <div className="space-y-4 py-8">
          <p className="text-5xl">⏰😓</p>
          <h4 className="text-2xl font-black text-jn-red">¡Se acabó el tiempo!</h4>
          <p className="text-sm text-gray-500">Encontraste {matched.length / 2} de {ICONS.length} parejas.</p>
          <button onClick={initGame} className="bg-jn-black text-white font-bold px-8 py-2.5 rounded-full hover:bg-jn-red transition-colors text-xs cursor-pointer">
            Intentar de Nuevo
          </button>
        </div>
      )}
    </div>
  );
}

// ================================================================
// 2. COLOREAR EL ESCUDO — Paleta extendida + reset + indicador oficial
// ================================================================
function PaintShieldGame({ onSave }) {
  const OFFICIAL = { background: "#F8F9FA", leftStripe: "#D32F2F", rightStripe: "#D32F2F", border: "#111111" };
  const [currentColor, setCurrentColor] = useState("#D32F2F");
  const [fillState, setFillState] = useState({ background: "#F8F9FA", leftStripe: "#F8F9FA", rightStripe: "#F8F9FA", border: "#111111" });
  const [saved, setSaved] = useState(false);

  const colors = [
    { value: "#D32F2F", name: "Rojo Newbery" },
    { value: "#B71C1C", name: "Rojo Oscuro" },
    { value: "#111111", name: "Negro Oficial" },
    { value: "#333333", name: "Gris Carbón" },
    { value: "#F8F9FA", name: "Blanco" },
    { value: "#D4AF37", name: "Oro Campeón" },
    { value: "#1565C0", name: "Azul Rival" },
    { value: "#2E7D32", name: "Verde Cancha" },
  ];

  const isOfficial = JSON.stringify(fillState) === JSON.stringify(OFFICIAL);

  const handleSave = () => {
    setSaved(true);
    onSave();
    setTimeout(() => setSaved(false), 3000);
  };

  const reset = () => setFillState({ background: "#F8F9FA", leftStripe: "#F8F9FA", rightStripe: "#F8F9FA", border: "#111111" });

  const PARTS = [
    { key: "border", label: "Borde exterior" },
    { key: "background", label: "Fondo central" },
    { key: "leftStripe", label: "Franja izquierda" },
    { key: "rightStripe", label: "Franja derecha" },
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h3 className="text-xl font-black text-jn-red">Lienzo: Colorear el Escudo</h3>
        <p className="text-xs text-gray-500">Seleccioná un color y hacé clic en las partes del escudo.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Shield SVG */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-52 h-60 relative drop-shadow-xl">
            <svg viewBox="0 0 100 120" className="w-full h-full">
              <path onClick={() => setFillState(p => ({...p, border: currentColor}))}
                d="M10 10 C10 10 50 2 50 2 C50 2 90 10 90 10 C90 35 90 75 50 115 C10 75 10 35 10 10 Z"
                fill={fillState.border} className="cursor-pointer hover:brightness-90 transition-all stroke-gray-400 stroke-1" />
              <path onClick={() => setFillState(p => ({...p, background: currentColor}))}
                d="M14 13 C14 13 50 5 50 5 C50 5 86 13 86 13 C86 36 86 73 50 110 C14 73 14 36 14 13 Z"
                fill={fillState.background} className="cursor-pointer hover:brightness-90 transition-all" />
              <path onClick={() => setFillState(p => ({...p, leftStripe: currentColor}))}
                d="M26 15 L26 95 C33 100 41 105 50 108 L50 6 Z"
                fill={fillState.leftStripe} className="cursor-pointer hover:brightness-90 transition-all" />
              <path onClick={() => setFillState(p => ({...p, rightStripe: currentColor}))}
                d="M62 15 L62 95 C55 100 49 105 50 108 L50 6 Z"
                fill={fillState.rightStripe} className="cursor-pointer hover:brightness-90 transition-all" />
              <path d="M80 20 L20 80 L23 85 L83 25 Z" fill="#111111" opacity="0.8" />
              <text x="50" y="65" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="900" style={{ pointerEvents: 'none', fontFamily: 'sans-serif' }}>JN</text>
            </svg>
          </div>

          {isOfficial && (
            <div className="flex items-center gap-1.5 text-xs font-black text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <CheckCircle size={13} /> ¡Colores oficiales correctos!
            </div>
          )}
        </div>

        {/* Controls panel */}
        <div className="space-y-5">
          {/* Color palette */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Paleta de Colores</p>
            <div className="grid grid-cols-4 gap-2">
              {colors.map(col => (
                <button
                  key={col.value}
                  onClick={() => setCurrentColor(col.value)}
                  title={col.name}
                  className={`w-full aspect-square rounded-xl border-2 transition-all ${currentColor === col.value ? 'border-jn-red scale-110 shadow-lg' : 'border-gray-200 hover:scale-105'}`}
                  style={{ backgroundColor: col.value }}
                />
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">Color seleccionado: <b>{colors.find(c => c.value === currentColor)?.name}</b></p>
          </div>

          {/* Part labels */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Zonas del Escudo</p>
            <div className="space-y-1.5">
              {PARTS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFillState(p => ({...p, [key]: currentColor}))}
                  className="w-full flex items-center gap-2.5 text-xs font-semibold py-1.5 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer text-left"
                >
                  <span className="w-5 h-5 rounded border border-gray-300 inline-block flex-shrink-0" style={{ backgroundColor: fillState[key] }} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={reset} className="flex-1 bg-gray-100 hover:bg-gray-200 text-jn-black text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer">
              Resetear
            </button>
            <button onClick={handleSave} disabled={saved} className="flex-1 bg-jn-black text-white hover:bg-jn-red text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-70">
              {saved ? "💾 ¡Guardado!" : "Guardar Escudo"}
            </button>
          </div>
          {saved && <p className="text-[10px] text-green-600 font-bold text-center">Ganaste 20 Newbery Coins 🪙 y +150 XP ⚡</p>}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// 3. LABERINTO — 3 niveles + teclado + timer
// ================================================================
const MAZES = [
  {
    label: "Nivel Fácil",
    map: [
      [1,1,1,1,1,1,1],
      [1,2,0,0,0,0,1],
      [1,1,1,0,1,0,1],
      [1,0,0,0,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,3,1],
      [1,1,1,1,1,1,1],
    ],
    startX: 1, startY: 1,
  },
  {
    label: "Nivel Medio",
    map: [
      [1,1,1,1,1,1,1,1,1],
      [1,2,0,1,0,0,0,0,1],
      [1,1,0,1,0,1,1,0,1],
      [1,0,0,0,0,0,1,0,1],
      [1,0,1,1,1,0,1,0,1],
      [1,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,3,1],
      [1,1,1,1,1,1,1,1,1],
    ],
    startX: 1, startY: 1,
  },
  {
    label: "Nivel Difícil",
    map: [
      [1,1,1,1,1,1,1,1,1,1,1],
      [1,2,0,0,1,0,0,0,1,0,1],
      [1,1,1,0,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,1],
      [1,0,1,1,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,1,0,1],
      [1,1,1,0,1,1,1,0,1,0,1],
      [1,0,0,0,1,0,0,0,1,0,1],
      [1,0,1,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,3,1],
      [1,1,1,1,1,1,1,1,1,1,1],
    ],
    startX: 1, startY: 1,
  },
];

function MazeGame({ onWin }) {
  const [mazeIndex, setMazeIndex] = useState(0);
  const [posX, setPosX] = useState(MAZES[0].startX);
  const [posY, setPosY] = useState(MAZES[0].startY);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const maze = MAZES[mazeIndex];

  const reset = useCallback((idx = mazeIndex) => {
    const m = MAZES[idx];
    setPosX(m.startX); setPosY(m.startY);
    setMoves(0); setWon(false); setGameOver(false);
    setTimeLeft(120 + idx * 30);
  }, [mazeIndex]);

  useEffect(() => { reset(mazeIndex); }, [mazeIndex]);

  useEffect(() => {
    if (won || gameOver) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); setGameOver(true); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [won, gameOver, mazeIndex]);

  const move = useCallback((dx, dy) => {
    if (won || gameOver) return;
    const tx = posX + dx, ty = posY + dy;
    if (maze.map[ty]?.[tx] !== 1) {
      setPosX(tx); setPosY(ty);
      setMoves(m => m + 1);
      if (maze.map[ty][tx] === 3) { setWon(true); if (mazeIndex === MAZES.length - 1) onWin(); }
    }
  }, [posX, posY, won, gameOver, maze, mazeIndex, onWin]);

  useEffect(() => {
    const handler = (e) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "ArrowUp")    move(0, -1);
        if (e.key === "ArrowDown")  move(0, 1);
        if (e.key === "ArrowLeft")  move(-1, 0);
        if (e.key === "ArrowRight") move(1, 0);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [move]);

  const cols = maze.map[0].length;
  const timerColor = timeLeft > 60 ? "text-green-500" : timeLeft > 20 ? "text-yellow-500" : "text-red-500 animate-pulse";

  return (
    <div className="text-center space-y-5 max-w-md mx-auto" ref={containerRef} tabIndex={0}>
      {/* Level selector */}
      <div>
        <h3 className="text-xl font-black text-jn-black">Laberinto Futbolero</h3>
        <div className="flex justify-center gap-2 mt-2">
          {MAZES.map((m, i) => (
            <button key={i} onClick={() => { setMazeIndex(i); }} className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors cursor-pointer ${mazeIndex === i ? 'bg-jn-red text-white border-jn-red' : 'bg-white border-gray-300 text-gray-600 hover:border-jn-red'}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-gray-500">Movimientos: <b>{moves}</b> · Llevá ⚽ al arco 🥅</p>
        <span className={`font-black text-sm flex items-center gap-1 ${timerColor}`}><Timer size={14} />{timeLeft}s</span>
      </div>
      <p className="text-[10px] text-gray-400">Usá las teclas ⬆️⬇️⬅️➡️ o los botones</p>

      {!won && !gameOver ? (
        <div className="space-y-4">
          <div
            className="mx-auto border-2 border-jn-black p-1 bg-green-900/10 rounded-xl overflow-hidden inline-grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: `${cols * 30}px` }}
          >
            {maze.map.map((row, y) =>
              row.map((cell, x) => {
                const isPlayer = posX === x && posY === y;
                return (
                  <div
                    key={`${x}-${y}`}
                    className={`w-7 h-7 flex items-center justify-center text-sm rounded-sm transition-all
                      ${cell === 1 ? 'bg-jn-black' : cell === 3 ? 'bg-green-100 border border-dashed border-green-500' : 'bg-white/80'}`}
                  >
                    {isPlayer ? "⚽" : cell === 3 ? "🥅" : ""}
                  </div>
                );
              })
            )}
          </div>

          {/* D-pad */}
          <div className="grid grid-cols-3 gap-1.5 w-28 mx-auto">
            <div />
            <button onClick={() => move(0,-1)} className="bg-jn-black text-white hover:bg-jn-red h-9 rounded-lg font-bold text-sm transition-colors cursor-pointer">▲</button>
            <div />
            <button onClick={() => move(-1,0)} className="bg-jn-black text-white hover:bg-jn-red h-9 rounded-lg font-bold text-sm transition-colors cursor-pointer">◀</button>
            <button onClick={() => reset()} className="bg-gray-200 hover:bg-gray-300 text-jn-black h-9 rounded-lg font-bold text-[10px] transition-colors cursor-pointer">↻</button>
            <button onClick={() => move(1,0)} className="bg-jn-black text-white hover:bg-jn-red h-9 rounded-lg font-bold text-sm transition-colors cursor-pointer">▶</button>
            <div />
            <button onClick={() => move(0,1)} className="bg-jn-black text-white hover:bg-jn-red h-9 rounded-lg font-bold text-sm transition-colors cursor-pointer">▼</button>
            <div />
          </div>
        </div>
      ) : won ? (
        <div className="space-y-4 py-6">
          <p className="text-5xl">🥅🎉⚽</p>
          <h4 className="text-2xl font-black text-green-600">¡GOL DE JORGE NEWBERY!</h4>
          <p className="text-sm text-gray-500">Completaste <b>{maze.label}</b> en {moves} movimientos.</p>
          {mazeIndex < MAZES.length - 1 ? (
            <button onClick={() => { setMazeIndex(i => i + 1); }} className="bg-jn-red text-white font-bold px-8 py-2.5 rounded-full hover:bg-jn-darkred text-xs cursor-pointer">
              Siguiente Nivel ➡️
            </button>
          ) : (
            <div>
              <p className="text-sm font-black text-yellow-600">🏆 ¡Completaste todos los niveles! +40 Newbery Coins 🪙</p>
              <button onClick={() => { setMazeIndex(0); reset(0); }} className="mt-3 bg-jn-black text-white font-bold px-8 py-2.5 rounded-full hover:bg-jn-red text-xs cursor-pointer">
                Jugar de Nuevo
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 py-6">
          <p className="text-5xl">⏰😓</p>
          <h4 className="text-2xl font-black text-jn-red">¡Tiempo Agotado!</h4>
          <button onClick={() => reset()} className="bg-jn-black text-white font-bold px-8 py-2.5 rounded-full hover:bg-jn-red text-xs cursor-pointer">Intentar de Nuevo</button>
        </div>
      )}
    </div>
  );
}

// ================================================================
// 4. QUIZ HISTÓRICO — 10 preguntas + timer 15s
// ================================================================
const QUIZ_QUESTIONS = [
  { q: "¿En qué año fue fundado nuestro Club Social y Deportivo?", opts: ["1908", "1920", "1935", "1945"], ans: 0 },
  { q: "¿Cuáles son los colores oficiales de nuestro club?", opts: ["Azul y blanco", "Rojo, negro y blanco", "Verde y amarillo", "Naranja y negro"], ans: 1 },
  { q: "¿Qué deporte es el más tradicional del semillero de nuestro club?", opts: ["Vóley", "Natación", "Futsal", "Tenis"], ans: 2 },
  { q: "¿Qué significa 'Fair Play' en el deporte?", opts: ["Juego sucio", "Juego limpio y respeto", "Juego rápido", "Juego colectivo"], ans: 1 },
  { q: "¿Cuántos jugadores tiene un equipo de Futsal en la cancha?", opts: ["6", "7", "5", "4"], ans: 2 },
  { q: "¿Qué representa la pasión deportiva en la comunidad?", opts: ["Un jugador de fútbol", "Un pionero y deportista argentino", "Un entrenador de atletismo", "Un presidente de la AFA"], ans: 1 },
  { q: "¿Qué disciplina incluye el Patín Artístico?", opts: ["Velocidad y resistencia", "Figuras y coreografía sobre ruedas", "Saltos en trampolín", "Natación sincronizada"], ans: 1 },
  { q: "¿Cuántos minutos dura un partido de Futsal oficial?", opts: ["90 minutos", "60 minutos", "40 minutos", "2 tiempos de 20 minutos"], ans: 3 },
  { q: "¿Qué valor es fundamental en el deporte para los más chicos?", opts: ["Ganar siempre", "El individualismo", "El trabajo en equipo", "La velocidad"], ans: 2 },
  { q: "¿Cómo se llaman los chicos que recién empiezan en el club?", opts: ["Veteranos", "Semillero", "Titulares", "Reserva"], ans: 1 },
];

function QuizGame({ onWin }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [expired, setExpired] = useState(false);
  const timerRef = useRef(null);

  const question = QUIZ_QUESTIONS[current];

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimeLeft(15); setExpired(false);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setExpired(true);
          setSelected(-1); // mark as expired
          setTimeout(next, 1500);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, [current]);

  const next = useCallback(() => {
    clearInterval(timerRef.current);
    if (current >= QUIZ_QUESTIONS.length - 1) {
      setFinished(true);
      if (score >= 7) onWin();
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  }, [current, score, onWin]);

  const handleAnswer = (idx) => {
    if (selected !== null || expired) return;
    clearInterval(timerRef.current);
    setSelected(idx);
    if (idx === question.ans) setScore(s => s + 1);
    setTimeout(next, 1200);
  };

  const restart = () => { setCurrent(0); setSelected(null); setScore(0); setFinished(false); startTimer(); };

  const timerColor = timeLeft > 8 ? "bg-green-500" : timeLeft > 3 ? "bg-yellow-500" : "bg-red-500";

  if (finished) return (
    <div className="text-center space-y-5 max-w-sm mx-auto py-6">
      <p className="text-5xl">{score >= 8 ? "🏆🌟" : score >= 5 ? "⭐🎉" : "📚😊"}</p>
      <h4 className="text-2xl font-black text-jn-black">
        {score >= 8 ? "¡Experto en Newbery!" : score >= 5 ? "¡Buen resultado!" : "¡Seguí aprendiendo!"}
      </h4>
      <p className="text-sm text-gray-600">Respondiste correctamente <b>{score} de {QUIZ_QUESTIONS.length}</b> preguntas.</p>
      {score >= 7 && <p className="text-sm font-black text-yellow-600">+50 Newbery Coins 🪙 · +300 XP ⚡</p>}
      <button onClick={restart} className="bg-jn-red text-white font-bold px-8 py-2.5 rounded-full hover:bg-jn-darkred text-xs cursor-pointer">
        <RefreshCw size={13} className="inline mr-1.5" /> Jugar de Nuevo
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pregunta {current + 1} / {QUIZ_QUESTIONS.length}</span>
          <div className="flex items-center gap-1.5 font-black text-sm">
            <Timer size={14} className={timeLeft <= 5 ? "text-red-500" : "text-gray-400"} />
            <span className={timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-gray-600"}>{timeLeft}s</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-1000 rounded-full ${timerColor}`} style={{ width: `${(timeLeft / 15) * 100}%` }} />
        </div>
        {/* XP bar for progress */}
        <div className="mt-2 w-full bg-gray-100 h-1 rounded-full overflow-hidden">
          <div className="h-full bg-jn-red transition-all duration-500 rounded-full" style={{ width: `${((current) / QUIZ_QUESTIONS.length) * 100}%` }} />
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
        <p className="font-black text-base text-jn-black leading-snug">{question.q}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {question.opts.map((opt, i) => {
          let style = "bg-white border-gray-200 hover:border-jn-red hover:bg-red-50 cursor-pointer";
          if (selected !== null || expired) {
            if (i === question.ans) style = "bg-green-50 border-green-400 text-green-700";
            else if (i === selected) style = "bg-red-50 border-red-400 text-red-600";
            else style = "bg-white border-gray-200 opacity-60";
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selected !== null || expired}
              className={`w-full text-left px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 flex items-center justify-between ${style}`}
            >
              <span>{opt}</span>
              {(selected !== null || expired) && i === question.ans && <CheckCircle size={16} className="text-green-500 flex-shrink-0" />}
              {selected === i && i !== question.ans && <XCircle size={16} className="text-red-500 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Correctas: <b className="text-green-600">{score}</b></span>
        <span>Necesitás 7+ para ganar monedas</span>
      </div>
    </div>
  );
}

// ================================================================
// 5. PENALTY KICK — 9 zonas + arquero IA
// ================================================================
function PenaltyGame({ onWin }) {
  const TOTAL = 5;
  const [kicks, setKicks] = useState(0);
  const [goals, setGoals] = useState(0);
  const [history, setHistory] = useState([]); // { zone, saved, gk }
  const [animating, setAnimating] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [finished, setFinished] = useState(false);

  const ZONES = [
    "↖️ Arriba Izq", "⬆️ Arriba Ctr", "↗️ Arriba Der",
    "⬅️ Medio Izq",  "⏺️ Centro",     "➡️ Medio Der",
    "↙️ Abajo Izq",  "⬇️ Abajo Ctr",  "↘️ Abajo Der",
  ];

  const kick = (zoneIdx) => {
    if (animating || finished) return;
    setAnimating(true);
    const gkZone = Math.floor(Math.random() * 9);
    const saved = gkZone === zoneIdx;
    const newGoals = goals + (saved ? 0 : 1);
    const newKicks = kicks + 1;

    setLastResult({ zone: zoneIdx, saved, gk: gkZone });
    setTimeout(() => {
      setGoals(newGoals);
      setKicks(newKicks);
      setHistory(h => [...h, { zone: zoneIdx, saved, gk: gkZone }]);
      if (newKicks >= TOTAL) {
        setFinished(true);
        if (newGoals >= 3) onWin();
      }
      setLastResult(null);
      setAnimating(false);
    }, 1200);
  };

  const restart = () => { setKicks(0); setGoals(0); setHistory([]); setFinished(false); setLastResult(null); setAnimating(false); };

  const ZONE_LABELS_SHORT = ["⬉","⬆","⬈","⬅","●","➡","⬋","⬇","⬊"];

  return (
    <div className="text-center space-y-6 max-w-md mx-auto">
      <div>
        <h3 className="text-xl font-black text-jn-red">Penalty Kick Arcade</h3>
        <p className="text-xs text-gray-500">Elegí la zona del arco donde querés patear</p>
      </div>

      {/* Marcador */}
      <div className="bg-jn-black text-white rounded-2xl px-8 py-4 flex justify-around items-center max-w-xs mx-auto shadow-lg">
        <div className="text-center">
          <p className="text-[10px] text-jn-red font-black tracking-widest">NEWBERY</p>
          <p className="text-4xl font-black">{goals}</p>
        </div>
        <div className="text-gray-500 text-sm font-bold">vs</div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-black tracking-widest">ARQUERO IA</p>
          <p className="text-4xl font-black">{kicks - goals}</p>
        </div>
      </div>

      {/* Arco visual */}
      <div className="max-w-xs mx-auto">
        <div className="relative bg-gradient-to-b from-sky-100 to-green-100 border-4 border-white rounded-t-xl h-32 shadow-inner overflow-hidden">
          {/* Arco */}
          <div className="absolute inset-x-0 top-0 h-1 bg-white" />
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white" />

          {/* Grid 3x3 visual */}
          <div className="absolute inset-2 grid grid-cols-3 grid-rows-3 gap-0.5">
            {Array.from({length:9}).map((_,i) => {
              const isShot = lastResult?.zone === i;
              const isGk = lastResult?.gk === i;
              return (
                <div key={i} className={`rounded-sm transition-all duration-300 flex items-center justify-center text-lg
                  ${isShot && !lastResult?.saved ? 'bg-green-400/80 scale-110' : ''}
                  ${isGk ? 'bg-jn-red/40' : ''}
                  ${isShot && lastResult?.saved ? 'bg-yellow-300/80' : ''}
                `}>
                  {isShot && <span className={lastResult?.saved ? '' : 'animate-bounce'}>⚽</span>}
                  {isGk && <span>🧤</span>}
                </div>
              );
            })}
          </div>
        </div>
        {/* Result flash */}
        {lastResult && (
          <div className={`text-center py-1.5 font-black text-sm rounded-b-xl animate-pulse ${lastResult.saved ? 'bg-red-100 text-jn-red' : 'bg-green-100 text-green-700'}`}>
            {lastResult.saved ? "🧤 ¡ATAJADA! El arquero te leyó la mente." : "⚽ ¡GOLAZO DE JORGE NEWBERY!"}
          </div>
        )}
      </div>

      {!finished ? (
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Penal {kicks + 1} de {TOTAL} — Elegí dónde patear:
          </p>
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {ZONES.map((zone, i) => (
              <button
                key={i}
                onClick={() => kick(i)}
                disabled={animating}
                className="bg-white border-2 border-gray-200 hover:border-jn-red hover:bg-red-50 text-jn-black font-bold text-xs py-3 rounded-xl transition-all cursor-pointer disabled:opacity-40 hover:scale-105 active:scale-95 shadow-sm"
              >
                {zone}
              </button>
            ))}
          </div>

          {/* History dots */}
          {history.length > 0 && (
            <div className="flex justify-center gap-2 pt-1">
              {history.map((h, i) => (
                <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black ${h.saved ? 'bg-red-400' : 'bg-green-500'}`}>
                  {h.saved ? "✕" : "⚽"}
                </div>
              ))}
              {Array.from({length: TOTAL - history.length}).map((_, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-dashed border-gray-300" />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 py-4">
          <p className="text-5xl">{goals >= 4 ? "🏆🎉🌟" : goals >= 3 ? "🎉⚽" : "😓👏"}</p>
          <h4 className={`text-2xl font-black ${goals >= 3 ? 'text-green-600' : 'text-jn-red'}`}>
            {goals >= 4 ? "¡CAMPEÓN DE PENALES!" : goals >= 3 ? "¡Victoria!" : "Derrota por penales"}
          </h4>
          <p className="text-sm text-gray-500">Convertiste <b>{goals} de {TOTAL}</b> penales.</p>
          {goals >= 3 && <p className="text-sm font-black text-yellow-600">+60 Newbery Coins 🪙 · +350 XP ⚡</p>}
          <button onClick={restart} className="bg-jn-black text-white font-bold px-8 py-2.5 rounded-full hover:bg-jn-red text-xs cursor-pointer">
            <RefreshCw size={13} className="inline mr-1.5" /> Jugar de Nuevo
          </button>
        </div>
      )}
    </div>
  );
}

// ================================================================
// 6. FUTSAL MANAGER — Copa + más eventos + visual de cancha
// ================================================================
const MATCH_EVENTS = (tactic, formation) => {
  const offensive = tactic === 'OFFENSIVE';
  const defensive = tactic === 'DEFENSIVE';
  const counter   = tactic === 'COUNTER';
  const rhombus   = formation === '1-2-1';

  return [
    {
      time: "Min 3",
      log: "El árbitro pita el inicio. Newbery presiona desde el inicio con energía.",
      us: offensive ? 1 : 0,
      them: 0,
      detail: offensive ? "¡Golazo de arco a arco del pivote! ⚽" : "Se abre el juego con cautela.",
    },
    {
      time: "Min 8",
      log: "El rival ataca por la banda izquierda con velocidad.",
      us: 0,
      them: defensive ? 0 : 1,
      detail: defensive ? "¡El cierre lo para en seco! Gran cobertura." : "Gol del rival. Falta de atención defensiva.",
    },
    {
      time: "Min 12",
      log: rhombus ? "Jugada ensayada de pizarrón. El rombo funciona a la perfección." : "Cuadrado defensivo sólido, buscando el momento.",
      us: rhombus ? 1 : 0,
      them: 0,
      detail: rhombus ? "¡El ala queda solo y mete un gol olímpico! 🔴⚫" : "Pelota controlada, sin riesgos.",
    },
    {
      time: "Min 16",
      log: counter ? "Newbery roba la pelota y sale en contragolpe rapidísimo." : "Los minutos finales con mucha intensidad.",
      us: counter ? 1 : 0,
      them: counter ? 0 : 1,
      detail: counter ? "¡3 contra 1 y gol del contragolpe! Imparable. ⚡" : "Otro gol rival aprovechando el espacio.",
    },
    {
      time: "Min 20",
      log: "El árbitro hace sonar el silbato. Fin del partido.",
      us: 0,
      them: 0,
      detail: "⏱️ Final del encuentro.",
    },
  ];
};

function FutsalManagerGame({ onWin }) {
  const [stage, setStage] = useState("setup"); // setup, playing, result, cup
  const [formation, setFormation] = useState("1-2-1");
  const [tactic, setTactic] = useState("OFFENSIVE");
  const [score, setScore] = useState({ us: 0, them: 0 });
  const [ticker, setTicker] = useState([]);
  const [cupWins, setCupWins] = useState(0);
  const [matchNum, setMatchNum] = useState(1);
  const [eventIndex, setEventIndex] = useState(0);

  const RIVALS = ["Escuela Técnica", "Club Rivadavia", "AFA Infantil", "Final de Copa"];
  const rival = RIVALS[Math.min(matchNum - 1, RIVALS.length - 1)];

  const startMatch = () => {
    const events = MATCH_EVENTS(tactic, formation);
    let us = 0, them = 0;
    events.forEach(e => { us += e.us; them += e.them; });
    setScore({ us, them });
    setTicker([]);
    setEventIndex(0);
    setStage("playing");

    let idx = 0;
    const events_ = MATCH_EVENTS(tactic, formation);
    const interval = setInterval(() => {
      if (idx >= events_.length) { clearInterval(interval); setStage("result"); return; }
      const ev = events_[idx];
      setTicker(prev => [...prev, `${ev.time}: ${ev.log} → ${ev.detail}`]);
      idx++;
    }, 1800);
  };

  const nextMatch = (won) => {
    const newWins = won ? cupWins + 1 : 0;
    setCupWins(newWins);
    if (newWins >= 3) { setStage("cup"); onWin(); return; }
    setMatchNum(m => m + 1);
    setScore({ us: 0, them: 0 });
    setTicker([]);
    setStage("setup");
  };

  const restart = () => { setCupWins(0); setMatchNum(1); setScore({ us: 0, them: 0 }); setTicker([]); setStage("setup"); };

  const won = score.us > score.them;
  const draw = score.us === score.them;

  const FORMATIONS_VISUAL = {
    "1-2-1": [
      { label: "Pivote", x: 50, y: 15 },
      { label: "Ala I", x: 20, y: 50 },
      { label: "Ala D", x: 80, y: 50 },
      { label: "Cierre", x: 50, y: 80 },
    ],
    "2-2": [
      { label: "Del I", x: 30, y: 20 },
      { label: "Del D", x: 70, y: 20 },
      { label: "Def I", x: 30, y: 70 },
      { label: "Def D", x: 70, y: 70 },
    ],
  };

  if (stage === "cup") return (
    <div className="text-center space-y-5 py-8 max-w-sm mx-auto">
      <p className="text-6xl">🏆🥇🎊</p>
      <h4 className="text-3xl font-black text-yellow-600">¡CAMPEÓN DE LA COPA NEWBERY!</h4>
      <p className="text-sm text-gray-500">Ganaste los 3 partidos y te llevaste la copa del club.</p>
      <p className="text-sm font-black text-yellow-600">+70 Newbery Coins 🪙 · +400 XP ⚡</p>
      <button onClick={restart} className="bg-jn-red text-white font-bold px-8 py-3 rounded-full hover:bg-jn-darkred text-xs cursor-pointer shadow-lg">
        Nueva Temporada
      </button>
    </div>
  );

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <div className="text-center">
        <h3 className="text-xl font-black text-jn-red">Futsal Manager Infantil</h3>
        <p className="text-xs text-gray-500">Partido {matchNum} · vs {rival} · Copa del Club</p>
        <div className="flex justify-center gap-1.5 mt-2">
          {[0,1,2].map(i => (
            <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i < cupWins ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-400'}`}>
              {i < cupWins ? "★" : "☆"}
            </div>
          ))}
          <span className="text-xs text-gray-400 ml-1">Ganás 3 para la Copa</span>
        </div>
      </div>

      {stage === "setup" && (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Formation visual */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Vista Táctica</p>
            <div className="relative bg-gradient-to-b from-green-700 to-green-600 rounded-2xl h-44 border-4 border-white/20 shadow-inner overflow-hidden">
              {/* Lines */}
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-white/30" />
              <div className="absolute left-1/2 top-1/4 w-0.5 h-1/2 bg-white/30" style={{transform:'translateX(-50%)'}}>
                <div className="absolute top-0 left-1/2 w-12 h-12 border border-white/30 rounded-full" style={{transform:'translate(-50%,-50%)'}} />
              </div>
              {FORMATIONS_VISUAL[formation].map((p, i) => (
                <div
                  key={i}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <div className="w-7 h-7 bg-jn-red border-2 border-white rounded-full flex items-center justify-center text-white text-[9px] font-black shadow-lg">JN</div>
                  <span className="text-[7px] text-white font-bold mt-0.5 bg-black/40 px-1 rounded">{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selectors */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Formación</label>
              <select value={formation} onChange={e => setFormation(e.target.value)} className="w-full p-2.5 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-jn-red">
                <option value="1-2-1">1-2-1 Rombo (Ataque)</option>
                <option value="2-2">2-2 Cuadrado (Defensa)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Táctica</label>
              <select value={tactic} onChange={e => setTactic(e.target.value)} className="w-full p-2.5 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-jn-red">
                <option value="OFFENSIVE">Presión Ofensiva 🔥</option>
                <option value="DEFENSIVE">Muro Defensivo 🛡️</option>
                <option value="COUNTER">Contragolpe ⚡</option>
              </select>
            </div>
            <button onClick={startMatch} className="w-full bg-jn-black text-white hover:bg-jn-red py-3 rounded-xl font-black uppercase text-xs tracking-wider transition-colors cursor-pointer shadow-md">
              ▶ Jugar vs {rival}
            </button>
          </div>
        </div>
      )}

      {(stage === "playing" || stage === "result") && (
        <div className="space-y-4">
          {/* Scoreboard */}
          <div className="bg-jn-black text-white p-5 rounded-2xl flex justify-around items-center shadow-xl">
            <div className="text-center">
              <p className="text-[10px] text-jn-red font-black tracking-widest">NEWBERY</p>
              <p className="text-4xl font-black">{stage === "result" ? score.us : "—"}</p>
            </div>
            <div className="text-gray-500 font-bold">
              {stage === "playing" ? <span className="animate-pulse text-red-500 text-xs font-black">EN VIVO</span> : "vs"}
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-400 font-black tracking-widest">{rival.toUpperCase()}</p>
              <p className="text-4xl font-black">{stage === "result" ? score.them : "—"}</p>
            </div>
          </div>

          {/* Ticker */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 h-40 overflow-y-auto space-y-2 text-left">
            {ticker.map((log, i) => (
              <p key={i} className="text-xs text-gray-700 leading-relaxed border-l-2 border-jn-red pl-2">{log}</p>
            ))}
            {stage === "playing" && (
              <p className="text-[10px] text-jn-red animate-pulse font-mono">Simulando jugadas...</p>
            )}
          </div>

          {stage === "result" && (
            <div className="text-center space-y-3 pt-2">
              <h4 className={`text-xl font-black ${won ? 'text-green-600' : draw ? 'text-yellow-600' : 'text-jn-red'}`}>
                {won ? "🏆 ¡VICTORIA DE NEWBERY!" : draw ? "🤝 Empate" : "😓 Derrota — Intentá otra táctica"}
              </h4>
              <div className="flex justify-center gap-3">
                <button onClick={() => nextMatch(won)} className="bg-jn-red text-white font-bold px-6 py-2.5 rounded-full hover:bg-jn-darkred text-xs cursor-pointer">
                  {won ? "Siguiente Partido →" : "Volver al Vestuario"}
                </button>
                {!won && (
                  <button onClick={() => setStage("setup")} className="bg-gray-100 text-jn-black font-bold px-6 py-2.5 rounded-full hover:bg-gray-200 text-xs cursor-pointer">
                    Cambiar Táctica
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
