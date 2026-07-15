"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plug, Wifi, WifiOff, RefreshCw, Save, Radio, Settings,
  Tv, Shield, AlertCircle, CheckCircle, Play, Square, Plus, Trash, Clock,
  Volume2, Camera
} from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { API_URL } from "@/config";

const fetch = apiFetch;

const SPONSOR_SPACES = [
  { id: "header", label: "Encabezado del partido" },
  { id: "between_stats", label: "Entre estadísticas" },
  { id: "below_player", label: "Debajo del reproductor" },
  { id: "footer", label: "Pie de página" },
];

function Notification({ type, message, onClose }) {
  if (!message) return null;
  const isSuccess = type === "success";
  return (
    <div
      style={{ minWidth: 320, maxWidth: 480 }}
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border transition-all duration-300 ${
        isSuccess
          ? "bg-green-950/90 border-green-600 text-green-200"
          : "bg-red-950/90 border-red-600 text-red-200"
      }`}
    >
      {isSuccess ? (
        <CheckCircle size={20} className="text-green-400 shrink-0" />
      ) : (
        <AlertCircle size={20} className="text-red-400 shrink-0" />
      )}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors ml-2 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

export default function LigaProStudioPage() {
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [activeTab, setActiveTab] = useState("studio"); // studio, events, highlights, settings
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Datos del Sistema
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [highlights, setHighlights] = useState([]);

  // Partido y transmisión seleccionada
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [activeBroadcast, setActiveBroadcast] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);

  // Cronómetro y período
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState("1T");
  const [timeInput, setTimeInput] = useState("00:00");

  // Selección de cámara
  const [selectedCamera, setSelectedCamera] = useState("MAIN"); // MAIN, GOAL_A, GOAL_B

  // Relato IA y TTS
  const [aiCommentary, setAiCommentary] = useState("");
  const [generatingCommentary, setGeneratingCommentary] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Modales rápidos de eventos
  const [showEventModal, setShowEventModal] = useState(null); // 'GOAL_HOME', 'GOAL_AWAY', 'CARD', 'SUBSTITUTION'
  const [quickEventForm, setQuickEventForm] = useState({
    playerId: "",
    playerName: "",
    cardColor: "YELLOW", // YELLOW, RED
    playerInId: "",
    playerInName: "",
    detail: ""
  });

  // Form de Transmisión
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    streamUrl: "",
    platform: "YouTube",
    status: "PROGRAMADO"
  });

  // Form de Evento en Vivo (Original)
  const [eventForm, setEventForm] = useState({
    minute: 0,
    type: "GOL",
    playerId: "",
    description: ""
  });

  // Form de Clip / Highlight
  const [highlightForm, setHighlightForm] = useState({
    title: "",
    startTime: 0,
    endTime: 10,
    generatedByAI: false,
    published: true
  });

  // Config y Sponsors (De la vista original)
  const [config, setConfig] = useState({
    apiUrl: "", apiKey: "", clubId: "", token: "", webhookUrl: "", mode: "test"
  });
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [sponsors, setSponsors] = useState(
    SPONSOR_SPACES.map((s) => ({
      id: s.id, label: s.label, imageUrl: "", linkUrl: "", active: false
    }))
  );
  const [savingSponsors, setSavingSponsors] = useState(false);

  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 5000);
  }, []);

  // Reactividad del Cronómetro
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          const nextVal = prev + 1;
          if (nextVal % 60 === 0 && selectedMatchId) {
            const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
            const min = Math.floor(nextVal / 60);
            fetch(`/api/live/${selectedMatchId}/status`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ liveMinute: min })
            }).catch(() => {});
          }
          return nextVal;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, selectedMatchId]);

  useEffect(() => {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    setTimeInput(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
  }, [timerSeconds]);

  const handleSetManualTime = () => {
    const parts = timeInput.split(":");
    if (parts.length === 2) {
      const m = parseInt(parts[0], 10);
      const s = parseInt(parts[1], 10);
      if (!isNaN(m) && !isNaN(s)) {
        setTimerSeconds(m * 60 + s);
        showNotification("success", `Tiempo ajustado a ${timeInput}`);
      }
    }
  };

  const fetchStatus = useCallback(async () => {
    try {
      setLoadingStatus(true);
      const res = await fetch(`/api/integrations/lps/status`);
      if (res.ok) setStatus(await res.json());
    } catch {
      setStatus({ connected: false, mode: "test", lastSync: null, syncCount: 0, hasCredentials: false });
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      setLoadingConfig(true);
      const res = await fetch(`/api/integrations/lps/full`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('jn-auth-token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setConfig({
            apiUrl: data.apiUrl || "",
            apiKey: data.apiKey || "",
            clubId: data.clubId || "",
            token: data.token || "",
            webhookUrl: data.webhookUrl || "",
            mode: data.mode || "test",
          });
          if (Array.isArray(data.sponsors) && data.sponsors.length > 0) {
            setSponsors(
              SPONSOR_SPACES.map((space) => {
                const found = data.sponsors.find((s) => s.id === space.id);
                return found
                  ? { ...found, label: space.label }
                  : { id: space.id, label: space.label, imageUrl: "", linkUrl: "", active: false };
              })
            );
          }
        }
      }
    } catch {} finally {
      setLoadingConfig(false);
    }
  }, []);

  const fetchStudioData = useCallback(async () => {
    try {
      const mRes = await fetch(`/api/matches`);
      if (mRes.ok) setMatches(await mRes.json());

      const pRes = await fetch(`/api/players`);
      if (pRes.ok) setPlayers(await pRes.json());

      const bRes = await fetch(`/api/liga-pro-studio/broadcasts`);
      if (bRes.ok) setBroadcasts(await bRes.json());

      const hRes = await fetch(`/api/liga-pro-studio/highlights`);
      if (hRes.ok) setHighlights(await hRes.json());
    } catch (e) {
      console.error("Error al cargar datos del Studio:", e);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchConfig();
    fetchStudioData();
  }, [fetchStatus, fetchConfig, fetchStudioData]);

  useEffect(() => {
    if (!selectedMatchId) {
      setActiveBroadcast(null);
      setLiveEvents([]);
      setTimerSeconds(0);
      setTimerActive(false);
      setAiCommentary("");
      return;
    }

    const loadMatchBroadcastAndEvents = async () => {
      try {
        const bRes = await fetch(`/api/liga-pro-studio/broadcasts/match/${selectedMatchId}`);
        if (bRes.ok) {
          const data = await bRes.json();
          setActiveBroadcast(data);
          setBroadcastForm({
            title: data.title || "",
            streamUrl: data.streamUrl || "",
            platform: data.platform || "YouTube",
            status: data.status || "PROGRAMADO"
          });
        } else {
          setActiveBroadcast(null);
          const selectedMatch = matches.find(m => m.id === parseInt(selectedMatchId, 10));
          setBroadcastForm({
            title: selectedMatch ? `Jorge Newbery vs ${selectedMatch.opponent}` : "",
            streamUrl: "",
            platform: "YouTube",
            status: "PROGRAMADO"
          });
        }

        const eRes = await fetch(`/api/liga-pro-studio/matches/${selectedMatchId}/events`);
        if (eRes.ok) setLiveEvents(await eRes.json());

        const mSelected = matches.find(m => m.id === parseInt(selectedMatchId, 10));
        if (mSelected) {
          setTimerSeconds((mSelected.liveMinute || 0) * 60);
          setAiCommentary(mSelected.aiCommentary || "");
        }
      } catch {}
    };

    loadMatchBroadcastAndEvents();
  }, [selectedMatchId, matches]);

  const handleSaveBroadcast = async (e) => {
    e.preventDefault();
    if (!selectedMatchId) return showNotification("error", "Selecciona un partido antes de guardar.");

    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    const method = activeBroadcast ? "PUT" : "POST";
    const url = activeBroadcast
      ? `/api/liga-pro-studio/broadcasts/${activeBroadcast.id}`
      : `/api/liga-pro-studio/broadcasts`;

    const body = {
      ...broadcastForm,
      matchId: parseInt(selectedMatchId, 10)
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        showNotification("success", activeBroadcast ? "Transmisión actualizada." : "Transmisión creada.");
        const data = await res.json();
        setActiveBroadcast(data);
        fetchStudioData();
      } else {
        const err = await res.json();
        showNotification("error", err.error || "Error al configurar transmisión.");
      }
    } catch {
      showNotification("error", "Error de red.");
    }
  };

  const handleStartLive = async () => {
    if (!activeBroadcast) return;
    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    try {
      const res = await fetch(`/api/liga-pro-studio/broadcasts/${activeBroadcast.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...broadcastForm, status: "EN_VIVO" })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveBroadcast(data);
        setBroadcastForm(prev => ({ ...prev, status: "EN_VIVO" }));
        setTimerActive(true);
        await fetch(`/api/live/${selectedMatchId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ status: "LIVE" })
        });
        showNotification("success", "¡Transmisión EN VIVO iniciada!");
        fetchStudioData();
      }
    } catch {}
  };

  const handleStopLive = async () => {
    if (!activeBroadcast) return;
    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    try {
      const res = await fetch(`/api/liga-pro-studio/broadcasts/${activeBroadcast.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...broadcastForm, status: "FINALIZADO" })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveBroadcast(data);
        setBroadcastForm(prev => ({ ...prev, status: "FINALIZADO" }));
        setTimerActive(false);
        await fetch(`/api/live/${selectedMatchId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ status: "FINISHED" })
        });
        showNotification("success", "Transmisión finalizada correctamente.");
        fetchStudioData();
      }
    } catch {}
  };

  const handleScoreChange = async (team, increment) => {
    if (!selectedMatchId) return;
    const selectedMatch = matches.find(m => m.id === parseInt(selectedMatchId, 10));
    if (!selectedMatch) return;

    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    let newScore;
    if (team === 'HOME') {
      newScore = Math.max(0, (selectedMatch.ourScore || 0) + increment);
    } else {
      newScore = Math.max(0, (selectedMatch.opponentScore || 0) + increment);
    }

    try {
      const res = await fetch(`/api/live/${selectedMatchId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          [team === 'HOME' ? 'ourScore' : 'opponentScore']: newScore
        })
      });
      if (res.ok) {
        setMatches(prev => prev.map(m => m.id === selectedMatch.id ? { ...m, [team === 'HOME' ? 'ourScore' : 'opponentScore']: newScore } : m));
        showNotification("success", `Marcador de ${team === 'HOME' ? 'Newbery' : 'Rival'} cambiado a ${newScore}.`);
      }
    } catch {}
  };

  const handleQuickEventSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMatchId) return;

    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    const min = Math.floor(timerSeconds / 60);

    let eventType = "GOL";
    let team = "HOME";
    let desc = "";
    let pId = null;
    let pName = "";

    if (showEventModal === "GOAL_HOME") {
      eventType = "GOL";
      team = "HOME";
      pId = quickEventForm.playerId ? parseInt(quickEventForm.playerId, 10) : null;
      const pl = players.find(p => p.id === pId);
      pName = pl ? `${pl.name} ${pl.lastName}` : "Jugador Local";
      desc = `¡GOL DE JORGE NEWBERY! Anotado por ${pName}.`;
    } else if (showEventModal === "GOAL_AWAY") {
      eventType = "GOL";
      team = "AWAY";
      pName = quickEventForm.playerName || "Delantero rival";
      desc = `Gol de la visita anotado por ${pName}.`;
    } else if (showEventModal === "CARD") {
      eventType = quickEventForm.cardColor === "YELLOW" ? "TARJETA_AMARILLA" : "TARJETA_ROJA";
      pId = quickEventForm.playerId ? parseInt(quickEventForm.playerId, 10) : null;
      const pl = players.find(p => p.id === pId);
      pName = pl ? `${pl.name} ${pl.lastName}` : "Jugador Local";
      desc = `${quickEventForm.cardColor === "YELLOW" ? "Tarjeta Amarilla" : "Expulsión / Tarjeta Roja"} para ${pName} del Club Jorge Newbery.`;
    } else if (showEventModal === "SUBSTITUTION") {
      eventType = "CAMBIO";
      const outPl = players.find(p => p.id === parseInt(quickEventForm.playerId, 10));
      const inPl = players.find(p => p.id === parseInt(quickEventForm.playerInId, 10));
      pName = outPl ? `${outPl.name} ${outPl.lastName}` : "Jugador";
      const pInName = inPl ? `${inPl.name} ${inPl.lastName}` : "Reemplazo";
      desc = `Modificación táctica. Sale: ${pName} (#${outPl?.dorsal || ''}) ↔ Entra: ${pInName} (#${inPl?.dorsal || ''}).`;
    }

    try {
      const res = await fetch(`/api/live/${selectedMatchId}/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          type: eventType === "CAMBIO" ? "SUBSTITUTION" : (eventType === "TARJETA_AMARILLA" ? "YELLOW_CARD" : (eventType === "TARJETA_ROJA" ? "RED_CARD" : eventType)),
          minute: min,
          playerName: pName,
          team,
          detail: desc
        })
      });

      if (res.ok) {
        showNotification("success", "Evento registrado en tiempo real.");
        setShowEventModal(null);
        setQuickEventForm({ playerId: "", playerName: "", cardColor: "YELLOW", playerInId: "", playerInName: "", detail: "" });

        const eRes = await fetch(`/api/liga-pro-studio/matches/${selectedMatchId}/events`);
        if (eRes.ok) setLiveEvents(await eRes.json());
        const mRes = await fetch(`/api/matches`);
        if (mRes.ok) setMatches(await mRes.json());
      } else {
        const err = await res.json();
        showNotification("error", err.error || "Error al registrar evento.");
      }
    } catch {
      showNotification("error", "Error de red.");
    }
  };

  const handlePeriodChange = async (p) => {
    if (!selectedMatchId) return;
    setCurrentPeriod(p);
    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    try {
      await fetch(`/api/live/${selectedMatchId}/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          type: p === "FINAL" ? "PERIOD_END" : "PERIOD_START",
          minute: Math.floor(timerSeconds / 60),
          detail: p === "1T" ? "Inicio del Primer Tiempo" : (p === "2T" ? "Inicio del Segundo Tiempo" : (p === "ET" ? "Entretiempo" : "Fin del Partido"))
        })
      });

      if (p === "FINAL") {
        setTimerActive(false);
      }

      const eRes = await fetch(`/api/liga-pro-studio/matches/${selectedMatchId}/events`);
      if (eRes.ok) setLiveEvents(await eRes.json());
      showNotification("success", `Período cambiado a ${p}`);
    } catch {}
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!selectedMatchId) return showNotification("error", "Selecciona un partido primero.");

    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    const pl = players.find(p => p.id === parseInt(eventForm.playerId, 10));
    const pName = pl ? `${pl.name} ${pl.lastName}` : "";

    try {
      const res = await fetch(`/api/live/${selectedMatchId}/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          type: eventForm.type === 'TARJETA' ? 'YELLOW_CARD' : (eventForm.type === 'CAMBIO' ? 'SUBSTITUTION' : eventForm.type),
          minute: parseInt(eventForm.minute, 10),
          playerName: pName,
          team: 'HOME',
          detail: eventForm.description
        })
      });

      if (res.ok) {
        showNotification("success", "Evento registrado correctamente.");
        setEventForm({ minute: 0, type: "GOL", playerId: "", description: "" });
        const eRes = await fetch(`/api/liga-pro-studio/matches/${selectedMatchId}/events`);
        if (eRes.ok) setLiveEvents(await eRes.json());
      } else {
        const err = await res.json();
        showNotification("error", err.error || "Error al guardar evento.");
      }
    } catch {
      showNotification("error", "Error de red.");
    }
  };

  const handleGenerateAICommentary = async () => {
    if (!selectedMatchId) return showNotification("error", "Selecciona un partido.");
    setGeneratingCommentary(true);
    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    try {
      const res = await fetch(`/api/live/${selectedMatchId}/ai-commentary`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAiCommentary(data.commentary);
        showNotification("success", "Relato narrativo generado con IA.");
      } else {
        showNotification("error", "Error al generar relato.");
      }
    } catch {
      showNotification("error", "Error de comunicación.");
    } finally {
      setGeneratingCommentary(false);
    }
  };

  const handleSpeakText = () => {
    if (!window.speechSynthesis) {
      return showNotification("error", "El sintetizador de voz no está soportado en este navegador.");
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    if (!aiCommentary) return showNotification("error", "No hay relato narrativo generado para locutar.");

    setSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(aiCommentary);
    utterance.lang = "es-AR"; 
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleCreateHighlight = async (e) => {
    e.preventDefault();
    if (!selectedMatchId) return showNotification("error", "Selecciona un partido primero.");

    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    try {
      const res = await fetch(`/api/liga-pro-studio/highlights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...highlightForm,
          matchId: parseInt(selectedMatchId, 10),
          startTime: parseInt(highlightForm.startTime, 10),
          endTime: parseInt(highlightForm.endTime, 10)
        })
      });

      if (res.ok) {
        showNotification("success", "Clip destacado creado y publicado en Newbery TV.");
        setHighlightForm({ title: "", startTime: 0, endTime: 10, generatedByAI: false, published: true });
        fetchStudioData();
      } else {
        const err = await res.json();
        showNotification("error", err.error || "Error al crear clip.");
      }
    } catch {
      showNotification("error", "Error de red.");
    }
  };

  const handleDeleteHighlight = async (id) => {
    if (!confirm("¿Deseas eliminar este clip de la producción?")) return;
    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    try {
      const res = await fetch(`/api/liga-pro-studio/highlights/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        showNotification("success", "Clip eliminado correctamente de Newbery TV.");
        fetchStudioData();
      }
    } catch {}
  };

  const handleImportEventToClip = (evt) => {
    const eventSec = evt.minute * 60;
    setHighlightForm({
      title: `Destacado: ${evt.playerName || evt.type} (${evt.minute}')`,
      startTime: Math.max(0, eventSec - 15),
      endTime: eventSec + 15,
      generatedByAI: false,
      published: true
    });
    setActiveTab("highlights");
    showNotification("success", "Datos cargados en el Editor de Clips.");
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    try {
      setSavingConfig(true);
      const res = await fetch(`/api/integrations/lps`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        await fetchStatus();
        showNotification("success", "Configuración guardada exitosamente.");
      }
    } catch {
      showNotification("error", "Error al guardar configuración.");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveSponsors = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    try {
      setSavingSponsors(true);
      const res = await fetch(`/api/integrations/lps/sponsors`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(sponsors),
      });
      if (res.ok) {
        showNotification("success", "Sponsors de publicidad guardados correctamente.");
      }
    } catch {
      showNotification("error", "Error al guardar publicidad.");
    } finally {
      setSavingSponsors(false);
    }
  };

  const updateSponsor = (id, field, value) => {
    setSponsors((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const selectedMatch = matches.find(m => m.id === parseInt(selectedMatchId, 10));

  return (
    <div className="min-h-screen bg-[#07070a] text-white p-6">
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: "", message: "" })}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-gray-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center shadow-lg shadow-red-950/20">
              <Radio size={28} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black uppercase tracking-tight">Liga Pro Studio</h1>
                <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">
                  PRO Mode
                </span>
              </div>
              <p className="text-xs text-gray-400 font-light">Cabina digital unificada para transmisiones en vivo, cronología y producción de clips.</p>
            </div>
          </div>

          {/* Selector de Partido Global */}
          <div className="flex items-center gap-3 bg-zinc-900/60 p-2 border border-zinc-800 rounded-xl">
            <span className="text-xs font-bold text-gray-400 uppercase pl-2">Partido de Producción:</span>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="bg-black border border-zinc-800 text-white text-xs font-bold uppercase rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-red-500 focus:outline-none"
            >
              <option value="">-- SELECCIONAR PARTIDO --</option>
              {matches.map(m => (
                <option key={m.id} value={m.id}>vs {m.opponent.toUpperCase()} ({new Date(m.date).toLocaleDateString('es-AR')})</option>
              ))}
            </select>
          </div>
        </div>

        {/* PESTAÑAS */}
        <div className="flex gap-2 border-b border-gray-800 pb-3 font-bold text-xs uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setActiveTab("studio")}
            className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 font-bold ${activeTab === 'studio' ? 'bg-red-600 text-white shadow shadow-red-950' : 'text-gray-400 hover:text-white hover:bg-gray-800/40'}`}
          >
            <Radio size={14} /> Consola Principal
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 font-bold ${activeTab === 'events' ? 'bg-red-600 text-white shadow shadow-red-950' : 'text-gray-400 hover:text-white hover:bg-gray-800/40'}`}
          >
            <Clock size={14} /> Cronología e Incidentes
          </button>
          <button
            onClick={() => setActiveTab("highlights")}
            className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 font-bold ${activeTab === 'highlights' ? 'bg-red-600 text-white shadow shadow-red-950' : 'text-gray-400 hover:text-white hover:bg-gray-800/40'}`}
          >
            <Tv size={14} /> Editor de Clips
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 font-bold ${activeTab === 'settings' ? 'bg-red-600 text-white shadow shadow-red-950' : 'text-gray-400 hover:text-white hover:bg-gray-800/40'}`}
          >
            <Settings size={14} /> Publicidad y Sponsors
          </button>
        </div>

        {/* ─── TAB 1: STUDIO (CONSOLA PRINCIPAL) ─── */}
        {activeTab === "studio" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* PANEL CENTRAL: MONITOR DE CÁMARAS */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* MONITOR PRINCIPAL */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative group">
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded tracking-widest flex items-center gap-1 animate-pulse">
                    🔴 CAM: {selectedCamera}
                  </span>
                  {activeBroadcast?.status === "EN_VIVO" ? (
                    <span className="bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded tracking-widest">
                      ON AIR (LIVE)
                    </span>
                  ) : (
                    <span className="bg-zinc-800 text-zinc-400 text-[8px] font-black px-2 py-0.5 rounded tracking-widest">
                      OFFLINE
                    </span>
                  )}
                </div>

                {/* Scoreboard Overlay */}
                {selectedMatch && (
                  <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur-md border border-zinc-800 rounded-xl px-4 py-2 flex items-center gap-4 text-xs font-black select-none">
                    <span className="text-white">JORGE NEWBERY</span>
                    <span className="bg-red-600 px-2 py-1 rounded text-lg font-black">{selectedMatch.ourScore ?? 0}</span>
                    <span className="text-zinc-600">vs</span>
                    <span className="bg-zinc-700 px-2 py-1 rounded text-lg font-black">{selectedMatch.opponentScore ?? 0}</span>
                    <span className="text-zinc-300">{selectedMatch.opponent.toUpperCase()}</span>
                    <div className="border-l border-zinc-800 pl-4 flex flex-col items-center">
                      <span className="text-red-500 text-[9px] tracking-wider uppercase font-black">{currentPeriod}</span>
                      <span className="text-[10px] text-zinc-400 font-mono tracking-tight">{timeInput}</span>
                    </div>
                  </div>
                )}

                <div className="aspect-video relative bg-[#0a0a0f] flex flex-col items-center justify-center border-b border-zinc-800">
                  
                  {selectedMatch && activeBroadcast?.status === "EN_VIVO" ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-br from-black via-zinc-950 to-red-950/10">
                      
                      <div className="flex gap-1 mb-4 h-16 items-center justify-center">
                        <div className="w-1.5 h-10 bg-red-600 rounded animate-bounce [animation-delay:0.1s]" />
                        <div className="w-1.5 h-16 bg-red-500 rounded animate-bounce [animation-delay:0.3s]" />
                        <div className="w-1.5 h-12 bg-red-600 rounded animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-6 bg-red-700 rounded animate-bounce [animation-delay:0.5s]" />
                        <div className="w-1.5 h-14 bg-red-500 rounded animate-bounce [animation-delay:0.4s]" />
                      </div>
                      
                      <p className="text-sm font-black uppercase text-zinc-300 tracking-wider">Flujo de video activo</p>
                      <p className="text-xs text-zinc-500 mt-1 max-w-xs truncate">Protocolo RTMP/YouTube Live transmitiendo en {activeBroadcast.platform}</p>
                      <span className="text-[9px] font-mono text-red-500/80 bg-red-950/20 border border-red-500/10 px-2 py-0.5 rounded mt-3">
                        {activeBroadcast.streamUrl}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center p-6 space-y-3 text-zinc-600 select-none">
                      <Tv size={48} className="mx-auto text-zinc-800" />
                      <p className="text-xs font-bold uppercase tracking-wider">Cabina Fuera de Línea</p>
                      <p className="text-[10px] text-zinc-500 max-w-xs mx-auto leading-relaxed">Selecciona un partido, configura la señal y haz click en "Iniciar Vivo" para activar los feeds dinámicos.</p>
                    </div>
                  )}

                  {selectedMatch && activeBroadcast?.status === "EN_VIVO" && sponsors.find(s => s.id === 'header' && s.active) && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/90 border border-zinc-800 p-2 rounded-xl flex items-center justify-between z-10">
                      <span className="text-[8px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded uppercase tracking-widest font-black">Publicidad</span>
                      <p className="text-[10px] text-zinc-400 truncate">Estudio Oficial auspiciado por nuestros sponsors oficiales.</p>
                    </div>
                  )}
                </div>

                <div className="bg-zinc-900/60 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/10 px-2.5 py-0.5 rounded font-black uppercase tracking-wider">Cabina de Locución AI</span>
                    <p className="text-xs text-zinc-400 max-w-md truncate">{aiCommentary || "Genera el relato del partido a partir de los eventos registrados..."}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={handleGenerateAICommentary}
                      disabled={!selectedMatchId || generatingCommentary}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-3.5 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <RefreshCw size={12} className={generatingCommentary ? "animate-spin" : ""} />
                      {generatingCommentary ? "Generando..." : "Redactar Relato"}
                    </button>
                    <button
                      onClick={handleSpeakText}
                      disabled={!aiCommentary}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 border transition-all ${speaking ? "bg-amber-600 text-white border-amber-500" : "bg-red-600 hover:bg-red-700 text-white border-red-500 disabled:opacity-40"}`}
                    >
                      <Volume2 size={12} />
                      {speaking ? "Locutando..." : "Relatar en Voz"}
                    </button>
                  </div>
                </div>

              </div>

              {/* SELECCIÓN DE CÁMARAS Y PREVISUALIZACIÓN */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-zinc-300">
                  <Camera size={16} className="text-red-500" /> Mezclador de Fuentes y Cámaras
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  
                  <div 
                    onClick={() => setSelectedCamera("MAIN")}
                    className={`cursor-pointer rounded-2xl overflow-hidden border p-3 bg-black transition-all flex flex-col justify-between aspect-[4/3] ${selectedCamera === 'MAIN' ? 'border-red-500 shadow shadow-red-950' : 'border-zinc-800 hover:border-zinc-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded tracking-wide">CAM 1</span>
                      <span className="text-[8px] text-zinc-500 uppercase font-black">Principal</span>
                    </div>
                    <div className="h-6 flex items-end justify-center gap-0.5 opacity-40">
                      <div className="w-1 bg-red-500 h-2 rounded animate-pulse" />
                      <div className="w-1 bg-red-500 h-4 rounded animate-pulse [animation-delay:0.2s]" />
                      <div className="w-1 bg-red-500 h-1.5 rounded animate-pulse [animation-delay:0.4s]" />
                    </div>
                    <span className="text-[9px] text-zinc-400 font-bold block text-center uppercase">Cámara Central</span>
                  </div>

                  <div 
                    onClick={() => setSelectedCamera("GOAL_A")}
                    className={`cursor-pointer rounded-2xl overflow-hidden border p-3 bg-black transition-all flex flex-col justify-between aspect-[4/3] ${selectedCamera === 'GOAL_A' ? 'border-red-500 shadow shadow-red-950' : 'border-zinc-800 hover:border-zinc-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] bg-zinc-800 text-zinc-400 font-black px-1.5 py-0.5 rounded tracking-wide">CAM 2</span>
                      <span className="text-[8px] text-zinc-500 uppercase font-black">Arco Local</span>
                    </div>
                    <div className="h-6 flex items-end justify-center gap-0.5 opacity-20">
                      <div className="w-1 bg-zinc-500 h-1 rounded" />
                      <div className="w-1 bg-zinc-500 h-3 rounded" />
                      <div className="w-1 bg-zinc-500 h-2 rounded" />
                    </div>
                    <span className="text-[9px] text-zinc-400 font-bold block text-center uppercase">Arco Jorge Newbery</span>
                  </div>

                  <div 
                    onClick={() => setSelectedCamera("GOAL_B")}
                    className={`cursor-pointer rounded-2xl overflow-hidden border p-3 bg-black transition-all flex flex-col justify-between aspect-[4/3] ${selectedCamera === 'GOAL_B' ? 'border-red-500 shadow shadow-red-950' : 'border-zinc-800 hover:border-zinc-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] bg-zinc-800 text-zinc-400 font-black px-1.5 py-0.5 rounded tracking-wide">CAM 3</span>
                      <span className="text-[8px] text-zinc-500 uppercase font-black">Arco Vis.</span>
                    </div>
                    <div className="h-6 flex items-end justify-center gap-0.5 opacity-20">
                      <div className="w-1 bg-zinc-500 h-2 rounded" />
                      <div className="w-1 bg-zinc-500 h-1 rounded" />
                      <div className="w-1 bg-zinc-500 h-3 rounded" />
                    </div>
                    <span className="text-[9px] text-zinc-400 font-bold block text-center uppercase">Arco Rival</span>
                  </div>

                </div>
              </div>

            </div>

            {/* PANEL DERECHO: CRONÓMETRO, MARCADOR Y TRANSMISIÓN */}
            <div className="space-y-6">
              
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 space-y-5">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-tight text-zinc-300">Cronómetro y Marcador</h3>
                  <span className="text-[9px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase tracking-widest">Controles directos</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4 text-center space-y-2">
                    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wide block">Goles Newbery</span>
                    <div className="text-4xl font-black text-white">{selectedMatch ? (selectedMatch.ourScore ?? 0) : 0}</div>
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleScoreChange('HOME', 1)}
                        className="bg-red-600 hover:bg-red-700 text-white w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-colors"
                      >
                        +1
                      </button>
                      <button 
                        onClick={() => handleScoreChange('HOME', -1)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-colors"
                      >
                        -1
                      </button>
                    </div>
                  </div>

                  <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4 text-center space-y-2">
                    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wide block">Goles Visita</span>
                    <div className="text-4xl font-black text-white">{selectedMatch ? (selectedMatch.opponentScore ?? 0) : 0}</div>
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleScoreChange('AWAY', 1)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-colors"
                      >
                        +1
                      </button>
                      <button 
                        onClick={() => handleScoreChange('AWAY', -1)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-colors"
                      >
                        -1
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1 bg-black p-1 rounded-xl border border-zinc-800 text-[10px] font-bold text-center">
                  {["1T", "2T", "ET", "FINAL"].map(p => (
                    <button
                      key={p}
                      onClick={() => handlePeriodChange(p)}
                      className={`py-1.5 rounded-lg transition-colors ${currentPeriod === p ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="bg-black/40 border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 uppercase font-black">Tiempo de juego</span>
                    <span className="font-mono text-lg font-black text-red-500 tracking-tight">{timeInput}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTimerActive(!timerActive)}
                      className={`flex-1 font-black uppercase text-[10px] py-2.5 rounded-xl text-center border transition-all ${timerActive ? 'bg-amber-600 text-white border-amber-500' : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'}`}
                    >
                      {timerActive ? "Pausar Tiempo" : "Iniciar Tiempo"}
                    </button>
                    <button
                      onClick={() => { setTimerActive(false); setTimerSeconds(0); }}
                      className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 font-bold uppercase text-[10px] px-3.5 py-2.5 rounded-xl"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="border-t border-zinc-800/80 pt-3 flex gap-2 items-center">
                    <input 
                      type="text" 
                      value={timeInput}
                      onChange={(e) => setTimeInput(e.target.value)}
                      placeholder="00:00"
                      className="w-20 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-center font-mono text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <button
                      onClick={handleSetManualTime}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 py-1 rounded-lg text-[10px] font-bold uppercase"
                    >
                      Ajustar
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-500 uppercase font-black block">Registrar Incidente</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setShowEventModal("GOAL_HOME")}
                      className="bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
                    >
                      <span className="text-lg">⚽</span>
                      <span className="text-[9px] font-black uppercase text-zinc-300">Gol Newbery</span>
                    </button>
                    <button 
                      onClick={() => setShowEventModal("GOAL_AWAY")}
                      className="bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
                    >
                      <span className="text-lg">⚽</span>
                      <span className="text-[9px] font-black uppercase text-zinc-300">Gol Rival</span>
                    </button>
                    <button 
                      onClick={() => setShowEventModal("CARD")}
                      className="bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
                    >
                      <span className="text-lg">🟨</span>
                      <span className="text-[9px] font-black uppercase text-zinc-300">Amonestar</span>
                    </button>
                    <button 
                      onClick={() => setShowEventModal("SUBSTITUTION")}
                      className="bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
                    >
                      <span className="text-lg">🔄</span>
                      <span className="text-[9px] font-black uppercase text-zinc-300">Realizar Cambio</span>
                    </button>
                  </div>
                </div>

              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-black uppercase text-zinc-300">Señal de Streaming</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={handleStartLive}
                    disabled={!activeBroadcast || activeBroadcast.status === 'EN_VIVO'}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase py-3 rounded-xl flex items-center justify-center gap-2 text-xs"
                  >
                    <Play size={14} /> Iniciar Vivo (On-Air)
                  </button>

                  <button
                    onClick={handleStopLive}
                    disabled={!activeBroadcast || activeBroadcast.status !== 'EN_VIVO'}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase py-3 rounded-xl flex items-center justify-center gap-2 text-xs"
                  >
                    <Square size={14} /> Finalizar Vivo (Off-Air)
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ─── TAB 2: CRONOLOGÍA E INCIDENTES ─── */}
        {activeTab === "events" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="bg-gray-800/40 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-black uppercase text-red-500 flex items-center gap-1.5">
                <Clock size={16} /> Registrar Suceso Manual
              </h3>

              <form onSubmit={handleCreateEvent} className="space-y-4 text-xs font-bold text-gray-400 uppercase">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Minuto</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="120"
                      value={eventForm.minute}
                      onChange={(e) => setEventForm({ ...eventForm, minute: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Tipo de Suceso</label>
                    <select
                      value={eventForm.type}
                      onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                    >
                      <option value="GOL">⚽ GOL DE JUEGO</option>
                      <option value="TARJETA">🟨 TARJETA / EXPULSIÓN</option>
                      <option value="CAMBIO">🔄 CAMBIO DE JUGADOR</option>
                      <option value="ATAQUE">🔥 ATAQUE DE PELIGRO</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Jugador del Club (Si aplica)</label>
                  <select
                    value={eventForm.playerId}
                    onChange={(e) => setEventForm({ ...eventForm, playerId: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                  >
                    <option value="">-- JUGADOR NO ESPECIFICADO --</option>
                    {players.map(p => (
                      <option key={p.id} value={p.id}>{p.name.toUpperCase()} {p.lastName.toUpperCase()} (#{p.dorsal})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Detalle del Suceso</label>
                  <textarea
                    required
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    rows="3"
                    placeholder="Descripción para la línea de tiempo oficial..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Añadir a Cronología
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-gray-800/40 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-black uppercase text-red-500 flex items-center gap-1.5">
                <Clock size={16} /> Cronología en Vivo del Partido
              </h3>

              <div className="relative border-l border-zinc-800 pl-6 ml-2 space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {liveEvents.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No hay incidentes registrados en el partido activo.</p>
                ) : (
                  liveEvents.map((evt) => (
                    <div key={evt.id} className="relative group">
                      <span className="absolute -left-[31px] top-0 w-4 h-4 bg-zinc-950 border border-red-500 rounded-full flex items-center justify-center text-[8px]">
                        ●
                      </span>
                      
                      <div className="bg-zinc-900/60 p-4 border border-zinc-800 rounded-xl flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-red-500 font-black">{evt.minute}'</span>
                            <span className="text-[9px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                              {evt.type}
                            </span>
                            {evt.playerName && (
                              <span className="text-[10px] text-zinc-400 font-bold">{evt.playerName}</span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-1 font-light leading-relaxed">{evt.detail || evt.description}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleImportEventToClip(evt)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded text-[9px] uppercase font-black flex items-center gap-1 transition-all"
                          >
                            🎬 Crear Clip
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB 3: EDITOR DE CLIPS ─── */}
        {activeTab === "highlights" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="bg-gray-800/40 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-black uppercase text-red-500 flex items-center gap-1.5">
                <Tv size={16} /> Crear Clip Destacado
              </h3>

              <form onSubmit={handleCreateHighlight} className="space-y-4 text-xs font-bold text-gray-400 uppercase">
                <div>
                  <label className="block mb-1">Título del Clip *</label>
                  <input
                    type="text"
                    required
                    value={highlightForm.title}
                    onChange={(e) => setHighlightForm({ ...highlightForm, title: e.target.value })}
                    placeholder="Ej. Golazo de Taco de Gómez"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Inicio (Segundos) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={highlightForm.startTime}
                      onChange={(e) => setHighlightForm({ ...highlightForm, startTime: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Fin (Segundos) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={highlightForm.endTime}
                      onChange={(e) => setHighlightForm({ ...highlightForm, endTime: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="published"
                      checked={highlightForm.published}
                      onChange={(e) => setHighlightForm({ ...highlightForm, published: e.target.checked })}
                      className="rounded bg-black border-gray-700 text-red-600 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="published" className="text-[10px] text-gray-400 font-bold block cursor-pointer select-none">PUBLICAR AL INSTANTE EN NEWBERY TV</label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Tv size={14} /> Guardar y Publicar
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-gray-800/40 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-black uppercase text-red-500 flex items-center gap-1.5">
                <Tv size={16} /> Clips Destacados en Producción
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                {highlights.length === 0 ? (
                  <p className="text-xs text-gray-500 italic col-span-2">No se han producido clips para el partido actual.</p>
                ) : (
                  highlights.map((h) => (
                    <div key={h.id} className="bg-zinc-900/60 p-4 border border-zinc-800 rounded-2xl flex flex-col justify-between gap-3 relative group">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                            Rango: {h.startTime}s - {h.endTime}s
                          </span>
                          <span className="text-[8px] text-zinc-500">ID: {h.id}</span>
                        </div>
                        <h4 className="font-bold text-xs uppercase text-white mt-2 leading-snug">{h.title}</h4>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3">
                        <span className={`text-[8px] px-2 py-0.5 rounded uppercase font-black tracking-wider ${h.published ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                          {h.published ? 'PUBLICADO EN TV' : 'BORRADOR'}
                        </span>
                        <button
                          onClick={() => handleDeleteHighlight(h.id)}
                          className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB 4: AJUSTES Y PUBLICIDAD (VISTA ORIGINAL LIGA PRO STUDIO) ─── */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            
            <div className="bg-gray-800/40 border border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase text-red-500 flex items-center gap-1.5">
                  <Plug size={16} /> Credenciales de Conexión Liga Pro Studio
                </h3>
                {status && status.connected ? (
                  <span className="bg-emerald-950 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                    API Conectada
                  </span>
                ) : (
                  <span className="bg-red-950 border border-red-500/20 text-red-400 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                    <WifiOff size={10} /> Fuera de línea
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-gray-400 uppercase">
                <div>
                  <label className="block mb-1">API URL *</label>
                  <input
                    type="text"
                    required
                    value={config.apiUrl}
                    onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1">API KEY *</label>
                  <input
                    type="password"
                    required
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1">ID del Club *</label>
                  <input
                    type="text"
                    required
                    value={config.clubId}
                    onChange={(e) => setConfig({ ...config, clubId: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1">Webhook URL</label>
                  <input
                    type="text"
                    value={config.webhookUrl}
                    onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm lowercase"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black uppercase py-2.5 px-6 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Save size={14} /> {savingConfig ? "Guardando..." : "Guardar Credenciales"}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-gray-800/40 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-black uppercase text-red-500 flex items-center gap-1.5">
                <ImageIcon size={16} /> Publicidad Dinámica y Auspicios
              </h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Asigna banners de sponsors que aparecerán en los reproductores y listados oficiales de Newbery TV.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sponsors.map((sp) => (
                  <div key={sp.id} className="bg-gray-900/60 border border-gray-800 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                      <span className="text-[10px] font-black uppercase text-white tracking-wider">{sp.label}</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id={`active-${sp.id}`}
                          checked={sp.active}
                          onChange={(e) => updateSponsor(sp.id, "active", e.target.checked)}
                          className="rounded bg-black border-gray-700 text-red-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                        />
                        <label htmlFor={`active-${sp.id}`} className="text-[9px] font-bold text-gray-400 block cursor-pointer select-none">ACTIVO</label>
                      </div>
                    </div>

                    <div className="text-[10px] font-bold text-gray-500 uppercase space-y-2.5">
                      <div>
                        <label className="block mb-1">Imagen URL (Banner)</label>
                        <input
                          type="text"
                          value={sp.imageUrl}
                          onChange={(e) => updateSponsor(sp.id, "imageUrl", e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Enlace de Sponsor</label>
                        <input
                          type="text"
                          value={sp.linkUrl}
                          onChange={(e) => updateSponsor(sp.id, "linkUrl", e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveSponsors}
                disabled={savingSponsors}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black uppercase py-2.5 px-6 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Save size={14} /> {savingSponsors ? "Guardando..." : "Guardar Sponsors"}
              </button>
            </div>

          </div>
        )}

      </div>

      {/* MODALES RÁPIDOS DE EVENTOS */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black uppercase text-red-500 flex items-center gap-2">
                <Clock size={16} /> 
                {showEventModal === "GOAL_HOME" && "Registrar Gol Club Local"}
                {showEventModal === "GOAL_AWAY" && "Registrar Gol Visitante"}
                {showEventModal === "CARD" && "Registrar Amonestación / Tarjeta"}
                {showEventModal === "SUBSTITUTION" && "Registrar Cambio"}
              </h3>
              <button 
                onClick={() => setShowEventModal(null)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickEventSubmit} className="space-y-4 text-xs font-bold text-gray-500 uppercase">
              
              {showEventModal === "GOAL_HOME" && (
                <div>
                  <label className="block mb-1.5">Goleador del Club *</label>
                  <select
                    required
                    value={quickEventForm.playerId}
                    onChange={(e) => setQuickEventForm({ ...quickEventForm, playerId: e.target.value })}
                    className="w-full bg-black border border-zinc-800 text-white px-3 py-2 rounded-xl text-xs"
                  >
                    <option value="">-- SELECCIONAR JUGADOR --</option>
                    {players.map(p => (
                      <option key={p.id} value={p.id}>{p.lastName.toUpperCase()}, {p.name} (#{p.dorsal})</option>
                    ))}
                  </select>
                </div>
              )}

              {showEventModal === "GOAL_AWAY" && (
                <div>
                  <label className="block mb-1.5">Nombre del Goleador Rival (Opcional)</label>
                  <input
                    type="text"
                    value={quickEventForm.playerName}
                    onChange={(e) => setQuickEventForm({ ...quickEventForm, playerName: e.target.value })}
                    placeholder="Ej. Delantero 9"
                    className="w-full bg-black border border-zinc-800 text-white px-3 py-2 rounded-xl text-xs font-normal font-sans"
                  />
                </div>
              )}

              {showEventModal === "CARD" && (
                <>
                  <div>
                    <label className="block mb-1.5">Jugador Amonestado *</label>
                    <select
                      required
                      value={quickEventForm.playerId}
                      onChange={(e) => setQuickEventForm({ ...quickEventForm, playerId: e.target.value })}
                      className="w-full bg-black border border-zinc-800 text-white px-3 py-2 rounded-xl text-xs"
                    >
                      <option value="">-- SELECCIONAR JUGADOR --</option>
                      {players.map(p => (
                        <option key={p.id} value={p.id}>{p.lastName.toUpperCase()}, {p.name} (#{p.dorsal})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5">Color de Tarjeta *</label>
                    <select
                      value={quickEventForm.cardColor}
                      onChange={(e) => setQuickEventForm({ ...quickEventForm, cardColor: e.target.value })}
                      className="w-full bg-black border border-zinc-800 text-white px-3 py-2 rounded-xl text-xs"
                    >
                      <option value="YELLOW">🟨 TARJETA AMARILLA</option>
                      <option value="RED">🟥 TARJETA ROJA (EXPULSIÓN)</option>
                    </select>
                  </div>
                </>
              )}

              {showEventModal === "SUBSTITUTION" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5">Sale (Jugador) *</label>
                    <select
                      required
                      value={quickEventForm.playerId}
                      onChange={(e) => setQuickEventForm({ ...quickEventForm, playerId: e.target.value })}
                      className="w-full bg-black border border-zinc-800 text-white px-3 py-2 rounded-xl text-xs"
                    >
                      <option value="">-- SELECCIONAR --</option>
                      {players.map(p => (
                        <option key={p.id} value={p.id}>{p.lastName.toUpperCase()} (#{p.dorsal})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5">Entra (Jugador) *</label>
                    <select
                      required
                      value={quickEventForm.playerInId}
                      onChange={(e) => setQuickEventForm({ ...quickEventForm, playerInId: e.target.value })}
                      className="w-full bg-black border border-zinc-800 text-white px-3 py-2 rounded-xl text-xs"
                    >
                      <option value="">-- SELECCIONAR --</option>
                      {players.map(p => (
                        <option key={p.id} value={p.id}>{p.lastName.toUpperCase()} (#{p.dorsal})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl text-xs transition-colors"
              >
                Confirmar Registro
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
