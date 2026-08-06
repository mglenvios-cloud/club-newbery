import React, { useState, useEffect } from 'react';
import { Clock, Bell, Calendar } from 'lucide-react';

export default function UpcomingMatches() {
  const [reminders, setReminders] = useState({});
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${API_URL}/api/matches?status=UPCOMING`)
      .then(res => res.ok && res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUpcoming(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleReminderToggle = (id) => {
    setReminders(prev => {
      const nextState = { ...prev, [id]: !prev[id] };
      if (nextState[id]) {
        alert("¡Recordatorio agendado! Te notificaremos al iniciar la transmisión.");
      }
      return nextState;
    });
  };

  const Countdown = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
      const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let remaining = {};

        if (difference > 0) {
          remaining = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          };
        } else {
          remaining = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        setTimeLeft(remaining);
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }, [targetDate]);

    return (
      <div className="flex gap-1.5 font-mono text-[9px] font-bold text-red-500 bg-red-955/20 border border-red-500/10 px-2 py-1 rounded">
        <span>{timeLeft.days}d</span>:
        <span>{timeLeft.hours}h</span>:
        <span>{timeLeft.minutes}m</span>:
        <span>{timeLeft.seconds}s</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 select-none text-center py-6">
        <span className="text-[10px] text-zinc-550 font-black uppercase tracking-widest bg-zinc-900 border border-white/5 px-3 py-1 rounded-full animate-pulse">
          Cargando Fixture...
        </span>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="text-red-500" size={18} />
          <h3 className="font-black text-base uppercase tracking-tight text-white">Próximos Partidos</h3>
        </div>
      </div>

      {upcoming.length === 0 ? (
        <div className="bg-[#111]/30 border border-white/5 rounded-3xl p-8 text-center text-zinc-500 text-xs italic select-none">
          Todavía no hay transmisiones programadas.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcoming.map((match) => {
            const isReminded = !!reminders[match.id];
            return (
              <div key={match.id} className="bg-zinc-900/60 border border-zinc-800/80 hover:border-red-500/30 p-4 rounded-xl transition-all space-y-3">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[8px] bg-red-950 text-red-400 border border-red-500/10 px-2.5 py-0.8 rounded font-black uppercase tracking-wider">
                      {match.competition || "Futsal AFA"}
                    </span>
                    <Countdown targetDate={match.date} />
                  </div>

                  <div className="flex items-center justify-between text-center py-2">
                    <div className="text-left">
                      <h5 className="font-black text-sm uppercase text-white leading-none">{match.homeTeam || defaultTeam}</h5>
                      <span className="text-[8px] text-zinc-500 font-bold uppercase mt-0.5 block">Local</span>
                    </div>
                    <span className="text-red-500 font-black text-xs">VS</span>
                    <div className="text-right">
                      <h5 className="font-black text-sm uppercase text-white leading-none">{match.opponent}</h5>
                      <span className="text-[8px] text-zinc-500 font-bold uppercase mt-0.5 block">Visita</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-4 mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-bold">
                    <Clock size={11} className="text-red-500" />
                    <span>{new Date(match.date).toLocaleDateString('es-AR')} · {new Date(match.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}hs</span>
                  </div>
                  <button
                    onClick={() => handleReminderToggle(match.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isReminded 
                        ? 'bg-zinc-800 text-green-500 border border-green-500/20' 
                        : 'bg-white hover:bg-zinc-200 text-black'
                    }`}
                  >
                    <Bell size={10} className={isReminded ? "fill-green-500 text-green-500" : ""} />
                    <span>{isReminded ? "Agendado" : "Recordarme"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
export { UpcomingMatches };
