// Configuración centralizada de marca para Club TV (Multi-club ready)
export const config = {
  channelName: "CLUB TV",
  subTitle: "Todo el contenido oficial audiovisual y fotográfico de nuestro club unificado en un solo canal premium.",
  clubName: "Club Social y Deportivo Jorge Newbery",
  logoText: "JORGE NEWBERY",
  shieldUrl: "/images/escudo.png",
  colors: {
    primary: "bg-jn-red text-white hover:bg-jn-darkred",
    primaryText: "text-jn-red",
    primaryBorder: "border-jn-red/20 hover:border-jn-red/35",
    primaryGlow: "shadow-[0_0_20px_rgba(211,47,47,0.4)]",
    primaryGlowLg: "shadow-[0_0_30px_rgba(211,47,47,0.5)]",
    accent: "text-red-500",
    bgDark: "bg-[#070707]",
    bgCard: "bg-[#111111]",
    bgInput: "bg-black/40",
    borderCard: "border-white/5",
    bgPlayer: "bg-black",
  },
  heroHeight: "h-[80vh]",
  modules: {
    liveStreaming: true,
    aiAnalysis: true,
    upcomingSchedule: true,
    continueWatching: true,
    mostViewed: true,
    sponsors: true
  },
  sponsors: [
    { name: "DEPORTES DEVOTO", logoText: "DEPORTES DEVOTO" },
    { name: "PINTURAS SUR", logoText: "PINTURAS SUR" },
    { name: "EMPANADAS ALPATACAL", logoText: "EMPANADAS ALPATACAL" },
    { name: "DEPORTIVO NET", logoText: "DEPORTIVO NET" }
  ],
  defaultFallbackImage: "/images/futsal_hero.png"
};
