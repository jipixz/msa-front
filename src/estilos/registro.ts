// Registro de los 20 estilos de AgroMonitor (10 conservadores + 10 creativos).
// Cada estilo define sus variantes (paletas), fuentes, radio, efectos visuales y el acomodo
// del panel. Las paletas vienen del canvas "MSA Cacao: 20 propuestas de rediseño".

export type Paleta = {
  oscuro: boolean
  fondo: string
  superficie: string
  superficie2: string
  borde: string
  texto: string
  texto2: string
  acento: string
  textoSobreAcento: string
  ok: string
  warn: string
  bad: string
  info: string
  series: [string, string, string, string, string]
}

export type Variante = { id: string; nombre: string; paleta: Paleta }

export type Efecto =
  | "reticula" | "brillo" | "esquinas-cortadas" | "mayusculas" | "mono-total" | "scanlines"
  | "brutal" | "filetes" | "periodico" | "fosforo" | "reticula-plano" | "sin-color" | "pantallas"

export type Acomodo =
  | "senal" | "primer" | "tabla" | "mosaico" | "parcelas" | "suizo" | "bento" | "estado"
  | "instrumentos" | "pulgar" | "terminal" | "neon" | "plano" | "libreta" | "radar" | "boletin"
  | "brutal" | "control" | "lcd" | "heatmap"

export type Estilo = {
  id: string
  nombre: string
  grupo: "conservadora" | "creativa"
  descripcion: string
  fuentes: { sans: string; mono: string; display?: string }
  googleFonts: string // query de fonts.googleapis.com/css2
  radio: string
  efectos: Efecto[]
  acomodo: Acomodo
  variantes: Variante[]
}

const SERIES_AZUL: Paleta["series"] = ["#31adff", "#3ccf8e", "#ffab5c", "#e872ff", "#8A97A3"]

export const ESTILOS: Estilo[] = [
  {
    id: "c01-senal", nombre: "Señal", grupo: "conservadora", acomodo: "senal",
    descripcion: "La paleta de tu app Señal: slate frío, azul de marca y números en mono.",
    fuentes: { sans: "'Open Sans'", mono: "'JetBrains Mono'" },
    googleFonts: "family=Open+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600",
    radio: "8px", efectos: [],
    variantes: [
      { id: "oscuro", nombre: "Oscuro", paleta: { oscuro: true, fondo: "#070F14", superficie: "#0A141A", superficie2: "#16252F", borde: "#243440", texto: "#F0F4F7", texto2: "#A9B5C0", acento: "#31adff", textoSobreAcento: "#04111a", ok: "#3ccf8e", warn: "#ffab5c", bad: "#ff7b7b", info: "#5CBEFF", series: SERIES_AZUL } },
      { id: "negro", nombre: "Negro", paleta: { oscuro: true, fondo: "#050506", superficie: "#0C0C0E", superficie2: "#18181B", borde: "#26262B", texto: "#E9E9EC", texto2: "#B1B1B9", acento: "#31adff", textoSobreAcento: "#04111a", ok: "#3ccf8e", warn: "#ffab5c", bad: "#ff7b7b", info: "#5CBEFF", series: SERIES_AZUL } },
      { id: "claro", nombre: "Claro", paleta: { oscuro: false, fondo: "#EEF1F4", superficie: "#FFFFFF", superficie2: "#F6F8FA", borde: "#DFE3E8", texto: "#0F1B23", texto2: "#4A5763", acento: "#0068d6", textoSobreAcento: "#ffffff", ok: "#13794a", warn: "#a65400", bad: "#c62828", info: "#0052a8", series: ["#0068d6", "#13794a", "#a65400", "#a100cc", "#4A5763"] } },
    ],
  },
  {
    id: "c02-primer", nombre: "GitHub Primer", grupo: "conservadora", acomodo: "primer",
    descripcion: "Primer de GitHub: nodos como lista de archivos, alertas como issues con etiquetas.",
    fuentes: { sans: "'Noto Sans'", mono: "'JetBrains Mono'" },
    googleFonts: "family=Noto+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500",
    radio: "6px", efectos: [],
    variantes: [
      { id: "oscuro", nombre: "Oscuro", paleta: { oscuro: true, fondo: "#0d1117", superficie: "#161b22", superficie2: "#21262d", borde: "#30363d", texto: "#e6edf3", texto2: "#9198a1", acento: "#4493f8", textoSobreAcento: "#0d1117", ok: "#3fb950", warn: "#d29922", bad: "#f85149", info: "#4493f8", series: ["#4493f8", "#3fb950", "#d29922", "#ab7df8", "#f78166"] } },
      { id: "atenuado", nombre: "Atenuado", paleta: { oscuro: true, fondo: "#212830", superficie: "#262c36", superficie2: "#2f3742", borde: "#3d444d", texto: "#d1d7e0", texto2: "#9198a1", acento: "#478be6", textoSobreAcento: "#0d1117", ok: "#57ab5a", warn: "#c69026", bad: "#f47067", info: "#6cb6ff", series: ["#478be6", "#57ab5a", "#c69026", "#986ee2", "#e5534b"] } },
      { id: "claro", nombre: "Claro", paleta: { oscuro: false, fondo: "#ffffff", superficie: "#ffffff", superficie2: "#f6f8fa", borde: "#d1d9e0", texto: "#1f2328", texto2: "#59636e", acento: "#0969da", textoSobreAcento: "#ffffff", ok: "#1a7f37", warn: "#9a6700", bad: "#d1242f", info: "#0969da", series: ["#0969da", "#1a7f37", "#9a6700", "#8250df", "#bc4c00"] } },
    ],
  },
  {
    id: "c03-tabla", nombre: "Tabla primero", grupo: "conservadora", acomodo: "tabla",
    descripcion: "Densa y neutra, estilo Linear: la tabla de nodos con minigráficas manda.",
    fuentes: { sans: "Inter", mono: "'IBM Plex Mono'" },
    googleFonts: "family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500",
    radio: "6px", efectos: [],
    variantes: [
      { id: "oscuro", nombre: "Oscuro", paleta: { oscuro: true, fondo: "#0f1011", superficie: "#141516", superficie2: "#1d1d20", borde: "#2a2a2e", texto: "#ededef", texto2: "#a0a0a8", acento: "#7c86ff", textoSobreAcento: "#0f1011", ok: "#4cc38a", warn: "#f0a050", bad: "#ff6b6b", info: "#7c86ff", series: ["#7c86ff", "#4cc38a", "#f0a050", "#e879f9", "#a0a0a8"] } },
      { id: "claro", nombre: "Claro", paleta: { oscuro: false, fondo: "#ffffff", superficie: "#ffffff", superficie2: "#f4f4f5", borde: "#e4e4e7", texto: "#18181b", texto2: "#52525b", acento: "#4f5bd5", textoSobreAcento: "#ffffff", ok: "#1a7f4b", warn: "#a4530d", bad: "#c42b2b", info: "#4f5bd5", series: ["#4f5bd5", "#1a7f4b", "#a4530d", "#a21caf", "#52525b"] } },
    ],
  },
  {
    id: "c04-cacao", nombre: "Cacao nocturno", grupo: "conservadora", acomodo: "mosaico",
    descripcion: "El tema café de Señal: oscuro cálido, ámbar puntual, lotes en mosaico.",
    fuentes: { sans: "'IBM Plex Sans'", mono: "'IBM Plex Mono'" },
    googleFonts: "family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600",
    radio: "10px", efectos: [],
    variantes: [
      { id: "oscuro", nombre: "Oscuro", paleta: { oscuro: true, fondo: "#14100A", superficie: "#1B1610", superficie2: "#292218", borde: "#3A3020", texto: "#EDE3D0", texto2: "#C7B99D", acento: "#D99E4F", textoSobreAcento: "#14100A", ok: "#9cc970", warn: "#ef9a4a", bad: "#f07a6a", info: "#E9B77E", series: ["#D99E4F", "#9cc970", "#ef9a4a", "#c7b99d", "#f07a6a"] } },
      { id: "claro", nombre: "Claro", paleta: { oscuro: false, fondo: "#F3EEE4", superficie: "#FFFFFF", superficie2: "#EDE6D8", borde: "#D8CDB8", texto: "#2B2215", texto2: "#5A4B33", acento: "#8A520A", textoSobreAcento: "#ffffff", ok: "#3f7a1c", warn: "#a5500a", bad: "#b3261e", info: "#8A520A", series: ["#8A520A", "#3f7a1c", "#a5500a", "#5A4B33", "#b3261e"] } },
    ],
  },
  {
    id: "c05-parcelas", nombre: "Mapa de parcelas", grupo: "conservadora", acomodo: "parcelas",
    descripcion: "La finca como mapa: lotes coloreados por humedad y el lote elegido al lado.",
    fuentes: { sans: "Inter", mono: "'JetBrains Mono'" },
    googleFonts: "family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600",
    radio: "10px", efectos: [],
    variantes: [
      { id: "oscuro", nombre: "Oscuro", paleta: { oscuro: true, fondo: "#0d1117", superficie: "#11161d", superficie2: "#1c232c", borde: "#2a313b", texto: "#e6edf3", texto2: "#a8b1bb", acento: "#3b8eea", textoSobreAcento: "#0d1117", ok: "#3fb950", warn: "#f0883e", bad: "#ff7b72", info: "#58a6ff", series: ["#2f8ad6", "#1d6aa3", "#f0883e", "#a8b1bb", "#ff7b72"] } },
      { id: "claro", nombre: "Claro", paleta: { oscuro: false, fondo: "#f6f8fa", superficie: "#ffffff", superficie2: "#eaeef2", borde: "#d0d7de", texto: "#1f2328", texto2: "#4d5661", acento: "#0969da", textoSobreAcento: "#ffffff", ok: "#1a7f37", warn: "#bc4c00", bad: "#cf222e", info: "#0969da", series: ["#0969da", "#3d8ad1", "#bc4c00", "#4d5661", "#cf222e"] } },
    ],
  },
  {
    id: "c06-suizo", nombre: "Monocromo + 1 acento", grupo: "conservadora", acomodo: "suizo",
    descripcion: "Estilo suizo: negro y blanco, filetes en vez de tarjetas; el acento solo marca acciones.",
    fuentes: { sans: "'Space Grotesk'", mono: "'Space Mono'" },
    googleFonts: "family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700",
    radio: "0px", efectos: ["filetes"],
    variantes: [
      { id: "oscuro", nombre: "Oscuro", paleta: { oscuro: true, fondo: "#0a0a0a", superficie: "#0a0a0a", superficie2: "#171717", borde: "#2e2e2e", texto: "#f5f5f5", texto2: "#a3a3a3", acento: "#ff5f1f", textoSobreAcento: "#0a0a0a", ok: "#d4d4d4", warn: "#ff5f1f", bad: "#ff5f1f", info: "#f5f5f5", series: ["#f5f5f5", "#a3a3a3", "#ff5f1f", "#737373", "#d4d4d4"] } },
      { id: "claro", nombre: "Claro", paleta: { oscuro: false, fondo: "#ffffff", superficie: "#ffffff", superficie2: "#f5f5f5", borde: "#d4d4d4", texto: "#0a0a0a", texto2: "#5c5c5c", acento: "#c43c00", textoSobreAcento: "#ffffff", ok: "#262626", warn: "#c43c00", bad: "#c43c00", info: "#0a0a0a", series: ["#0a0a0a", "#5c5c5c", "#c43c00", "#737373", "#262626"] } },
    ],
  },
  {
    id: "c07-bento", nombre: "Bento sobrio", grupo: "conservadora", acomodo: "bento",
    descripcion: "Módulos de distinto tamaño sin adornos: zinc oscuro, acento lima, Geist.",
    fuentes: { sans: "Geist", mono: "'Geist Mono'" },
    googleFonts: "family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600",
    radio: "16px", efectos: [],
    variantes: [
      { id: "oscuro", nombre: "Oscuro", paleta: { oscuro: true, fondo: "#09090b", superficie: "#16161a", superficie2: "#1f1f24", borde: "#27272a", texto: "#fafafa", texto2: "#a1a1aa", acento: "#a3e635", textoSobreAcento: "#09090b", ok: "#a3e635", warn: "#fb923c", bad: "#f87171", info: "#7dd3fc", series: ["#a3e635", "#7dd3fc", "#fb923c", "#f0abfc", "#a1a1aa"] } },
      { id: "claro", nombre: "Claro", paleta: { oscuro: false, fondo: "#e9e9ec", superficie: "#ffffff", superficie2: "#f4f4f5", borde: "#e4e4e7", texto: "#09090b", texto2: "#52525b", acento: "#4d7c0f", textoSobreAcento: "#ffffff", ok: "#4d7c0f", warn: "#c2410c", bad: "#b91c1c", info: "#0369a1", series: ["#4d7c0f", "#0369a1", "#c2410c", "#a21caf", "#52525b"] } },
    ],
  },
  {
    id: "c08-estado", nombre: "Estado primero", grupo: "conservadora", acomodo: "estado",
    descripcion: "Una frase dice cómo está la finca; los pendientes son una lista con acciones.",
    fuentes: { sans: "Inter", mono: "'JetBrains Mono'" },
    googleFonts: "family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500",
    radio: "12px", efectos: [],
    variantes: [
      { id: "oscuro", nombre: "Oscuro", paleta: { oscuro: true, fondo: "#0C0C0E", superficie: "#141417", superficie2: "#1e1e23", borde: "#26262B", texto: "#E9E9EC", texto2: "#B1B1B9", acento: "#31adff", textoSobreAcento: "#04111a", ok: "#3ccf8e", warn: "#ffab5c", bad: "#ff7b7b", info: "#5CBEFF", series: SERIES_AZUL } },
      { id: "claro", nombre: "Claro", paleta: { oscuro: false, fondo: "#FBFCFD", superficie: "#FFFFFF", superficie2: "#F1F3F5", borde: "#DFE3E8", texto: "#0F1B23", texto2: "#4A5763", acento: "#0068d6", textoSobreAcento: "#ffffff", ok: "#13794a", warn: "#a65400", bad: "#c62828", info: "#0052a8", series: ["#0068d6", "#13794a", "#a65400", "#a100cc", "#4A5763"] } },
    ],
  },
  {
    id: "c09-instrumentos", nombre: "Instrumentación", grupo: "conservadora", acomodo: "instrumentos",
    descripcion: "Estilo Grafana: paneles con umbrales, todos los nodos en una gráfica y bitácora LoRa.",
    fuentes: { sans: "Inter", mono: "'Roboto Mono'" },
    googleFonts: "family=Inter:wght@400;500;600&family=Roboto+Mono:wght@400;500",
    radio: "4px", efectos: [],
    variantes: [
      { id: "oscuro", nombre: "Oscuro", paleta: { oscuro: true, fondo: "#111217", superficie: "#181b1f", superficie2: "#22252b", borde: "#2c3036", texto: "#d8d9da", texto2: "#9fa3a9", acento: "#5794f2", textoSobreAcento: "#111217", ok: "#73bf69", warn: "#ff9830", bad: "#f2495c", info: "#5794f2", series: ["#5794f2", "#73bf69", "#ff9830", "#b877d9", "#fade2a"] } },
      { id: "claro", nombre: "Claro", paleta: { oscuro: false, fondo: "#f4f5f5", superficie: "#ffffff", superficie2: "#eceef0", borde: "#dcdee1", texto: "#24292e", texto2: "#555b63", acento: "#1f60c4", textoSobreAcento: "#ffffff", ok: "#1b7e2f", warn: "#b35c00", bad: "#c4162a", info: "#1f60c4", series: ["#1f60c4", "#1b7e2f", "#b35c00", "#8f3bb8", "#8a6d00"] } },
    ],
  },
  {
    id: "c10-pulgar", nombre: "Pulgar primero", grupo: "conservadora", acomodo: "pulgar",
    descripcion: "Pensada para el celular: filas grandes, lo urgente arriba, pestañas abajo.",
    fuentes: { sans: "Figtree", mono: "'JetBrains Mono'" },
    googleFonts: "family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600",
    radio: "18px", efectos: [],
    variantes: [
      { id: "oscuro", nombre: "Oscuro", paleta: { oscuro: true, fondo: "#0b0f12", superficie: "#131a1f", superficie2: "#1a2329", borde: "#24313a", texto: "#eef3f6", texto2: "#b3c0c9", acento: "#4dd4c6", textoSobreAcento: "#06201d", ok: "#4dd4c6", warn: "#ffab5c", bad: "#ff7b7b", info: "#7dd3fc", series: ["#4dd4c6", "#7dd3fc", "#ffab5c", "#f0abfc", "#b3c0c9"] } },
      { id: "claro", nombre: "Claro", paleta: { oscuro: false, fondo: "#f2f5f7", superficie: "#ffffff", superficie2: "#eef2f4", borde: "#d8e0e5", texto: "#0f1a20", texto2: "#44535d", acento: "#00796b", textoSobreAcento: "#ffffff", ok: "#00796b", warn: "#a65400", bad: "#c62828", info: "#0369a1", series: ["#00796b", "#0369a1", "#a65400", "#a21caf", "#44535d"] } },
    ],
  },
  {
    id: "k01-termux", nombre: "Modo dev / Termux", grupo: "creativa", acomodo: "terminal",
    descripcion: "Todo es terminal: comandos, tablas ASCII y la línea cruda del gateway.",
    fuentes: { sans: "'JetBrains Mono'", mono: "'JetBrains Mono'" },
    googleFonts: "family=JetBrains+Mono:wght@400;500;700",
    radio: "0px", efectos: ["mono-total"],
    variantes: [
      { id: "termux", nombre: "Termux", paleta: { oscuro: true, fondo: "#000000", superficie: "#0a0a0a", superficie2: "#141414", borde: "#2a2a2a", texto: "#e8e8e8", texto2: "#9a9a9a", acento: "#4af626", textoSobreAcento: "#000000", ok: "#4af626", warn: "#ffd23f", bad: "#ff5c57", info: "#5fa8ff", series: ["#4af626", "#5fa8ff", "#ffd23f", "#ff5c57", "#e8e8e8"] } },
      { id: "github", nombre: "GitHub", paleta: { oscuro: true, fondo: "#0d1117", superficie: "#010409", superficie2: "#161b22", borde: "#30363d", texto: "#e6edf3", texto2: "#9198a1", acento: "#3fb950", textoSobreAcento: "#0d1117", ok: "#3fb950", warn: "#d29922", bad: "#f85149", info: "#58a6ff", series: ["#3fb950", "#58a6ff", "#d29922", "#f85149", "#e6edf3"] } },
      { id: "ambar", nombre: "Ámbar", paleta: { oscuro: true, fondo: "#0e0a03", superficie: "#070500", superficie2: "#1a1306", borde: "#3a2c10", texto: "#ffcc66", texto2: "#c9a04e", acento: "#ffcc66", textoSobreAcento: "#0e0a03", ok: "#ffcc66", warn: "#ff9933", bad: "#ff6644", info: "#ffd98a", series: ["#ffcc66", "#ffd98a", "#ff9933", "#ff6644", "#c9a04e"] } },
    ],
  },
  {
    id: "k02-neon", nombre: "Neón cyberpunk", grupo: "creativa", acomodo: "neon",
    descripcion: "Magenta y cian con brillo, esquinas cortadas, retícula de fondo y Chakra Petch.",
    fuentes: { sans: "'Chakra Petch'", mono: "'Share Tech Mono'" },
    googleFonts: "family=Chakra+Petch:wght@400;500;600;700&family=Share+Tech+Mono",
    radio: "0px", efectos: ["reticula", "brillo", "esquinas-cortadas", "mayusculas"],
    variantes: [
      { id: "magenta-cian", nombre: "Magenta / cian", paleta: { oscuro: true, fondo: "#07020f", superficie: "#10061e", superficie2: "#170a2b", borde: "#3a2160", texto: "#f4ecff", texto2: "#b9a6d9", acento: "#00f0ff", textoSobreAcento: "#07020f", ok: "#00f0ff", warn: "#f5ff3b", bad: "#ff2bd6", info: "#ff2bd6", series: ["#00f0ff", "#ff2bd6", "#f5ff3b", "#8f7bff", "#b9a6d9"] } },
      { id: "acido", nombre: "Ácido", paleta: { oscuro: true, fondo: "#020a04", superficie: "#04140a", superficie2: "#06210c", borde: "#1d4a25", texto: "#e8ffe0", texto2: "#9ccf92", acento: "#39ff14", textoSobreAcento: "#020a04", ok: "#39ff14", warn: "#f5ff3b", bad: "#ff3b3b", info: "#00e5ff", series: ["#39ff14", "#00e5ff", "#f5ff3b", "#ff3b3b", "#9ccf92"] } },
    ],
  },
  {
    id: "k03-plano", nombre: "Plano técnico", grupo: "creativa", acomodo: "plano",
    descripcion: "La finca como plano de ingeniería: cotas, símbolos, tablas y cajetín.",
    fuentes: { sans: "'IBM Plex Sans Condensed'", mono: "'IBM Plex Mono'", display: "'IBM Plex Sans Condensed'" },
    googleFonts: "family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Condensed:wght@400;500;600",
    radio: "0px", efectos: ["reticula-plano", "mayusculas"],
    variantes: [
      { id: "azul", nombre: "Azul", paleta: { oscuro: true, fondo: "#0b2e57", superficie: "#0d3563", superficie2: "#11407a", borde: "#6d93c4", texto: "#f2f7ff", texto2: "#bcd2ee", acento: "#f2f7ff", textoSobreAcento: "#0b2e57", ok: "#f2f7ff", warn: "#ffd166", bad: "#ff9a8a", info: "#bcd2ee", series: ["#f2f7ff", "#ffd166", "#bcd2ee", "#ff9a8a", "#8fb3df"] } },
      { id: "blanco", nombre: "Blanco", paleta: { oscuro: false, fondo: "#f7f9fc", superficie: "#f7f9fc", superficie2: "#e8eef7", borde: "#3f6496", texto: "#0f3a6e", texto2: "#34557f", acento: "#0f3a6e", textoSobreAcento: "#f7f9fc", ok: "#0f3a6e", warn: "#a0400a", bad: "#b42318", info: "#34557f", series: ["#0f3a6e", "#a0400a", "#34557f", "#b42318", "#6b8bb5"] } },
    ],
  },
  {
    id: "k04-libreta", nombre: "Libreta de campo", grupo: "creativa", acomodo: "libreta",
    descripcion: "E-ink para leer bajo el sol: solo tinta y papel; estados con rayado y peso.",
    fuentes: { sans: "Literata", mono: "'IBM Plex Mono'", display: "Literata" },
    googleFonts: "family=Literata:opsz,wght@7..72,400;7..72,600;7..72,700&family=IBM+Plex+Mono:wght@400;600",
    radio: "0px", efectos: ["sin-color"],
    variantes: [
      { id: "papel", nombre: "Papel", paleta: { oscuro: false, fondo: "#efefec", superficie: "#efefec", superficie2: "#e2e2de", borde: "#111111", texto: "#111111", texto2: "#333333", acento: "#111111", textoSobreAcento: "#efefec", ok: "#111111", warn: "#111111", bad: "#111111", info: "#111111", series: ["#111111", "#555555", "#333333", "#777777", "#222222"] } },
      { id: "noche", nombre: "Noche", paleta: { oscuro: true, fondo: "#111111", superficie: "#111111", superficie2: "#1e1e1e", borde: "#f2f2f2", texto: "#f2f2f2", texto2: "#cfcfcf", acento: "#f2f2f2", textoSobreAcento: "#111111", ok: "#f2f2f2", warn: "#f2f2f2", bad: "#f2f2f2", info: "#f2f2f2", series: ["#f2f2f2", "#bbbbbb", "#dddddd", "#999999", "#eeeeee"] } },
    ],
  },
  {
    id: "k05-radar", nombre: "Radar de nodos", grupo: "creativa", acomodo: "radar",
    descripcion: "Nodos ubicados por distancia y señal al gateway, en fósforo verde o ámbar.",
    fuentes: { sans: "'Share Tech Mono'", mono: "'Share Tech Mono'" },
    googleFonts: "family=Share+Tech+Mono",
    radio: "0px", efectos: ["mono-total", "fosforo"],
    variantes: [
      { id: "verde", nombre: "Fósforo verde", paleta: { oscuro: true, fondo: "#000d06", superficie: "#00140a", superficie2: "#032313", borde: "#0f4a2c", texto: "#33ff99", texto2: "#6fd3a0", acento: "#33ff99", textoSobreAcento: "#000d06", ok: "#33ff99", warn: "#ffd23f", bad: "#ff5c57", info: "#99ffcc", series: ["#33ff99", "#99ffcc", "#ffd23f", "#ff5c57", "#6fd3a0"] } },
      { id: "ambar", nombre: "Fósforo ámbar", paleta: { oscuro: true, fondo: "#0d0800", superficie: "#140d00", superficie2: "#1f1500", borde: "#4a3510", texto: "#ffb000", texto2: "#d9a547", acento: "#ffb000", textoSobreAcento: "#0d0800", ok: "#ffb000", warn: "#ff6a00", bad: "#ff3b30", info: "#ffd27a", series: ["#ffb000", "#ffd27a", "#ff6a00", "#ff3b30", "#d9a547"] } },
    ],
  },
  {
    id: "k06-boletin", nombre: "Boletín de la finca", grupo: "creativa", acomodo: "boletin",
    descripcion: "Los datos contados como periódico: titular, figura con pie, columnas y clima.",
    fuentes: { sans: "Inter", mono: "'IBM Plex Mono'", display: "Newsreader" },
    googleFonts: "family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500",
    radio: "0px", efectos: ["periodico"],
    variantes: [
      { id: "noche", nombre: "Edición nocturna", paleta: { oscuro: true, fondo: "#121212", superficie: "#121212", superficie2: "#1c1c1c", borde: "#3a3a3a", texto: "#efede8", texto2: "#b0aea8", acento: "#ff7a6b", textoSobreAcento: "#121212", ok: "#efede8", warn: "#ff7a6b", bad: "#ff7a6b", info: "#b0aea8", series: ["#efede8", "#ff7a6b", "#b0aea8", "#7a7a7a", "#d9d6cf"] } },
      { id: "dia", nombre: "Edición de día", paleta: { oscuro: false, fondo: "#f6f5f1", superficie: "#f6f5f1", superficie2: "#ebe9e3", borde: "#bdbdbd", texto: "#141414", texto2: "#4a4a4a", acento: "#b3261e", textoSobreAcento: "#ffffff", ok: "#141414", warn: "#b3261e", bad: "#b3261e", info: "#4a4a4a", series: ["#141414", "#b3261e", "#4a4a4a", "#8a8a8a", "#2e2e2e"] } },
    ],
  },
  {
    id: "k07-brutal", nombre: "Brutalista", grupo: "creativa", acomodo: "brutal",
    descripcion: "Bordes gruesos, tipografía enorme, amarillo puro y sombras duras.",
    fuentes: { sans: "Archivo", mono: "'Space Mono'", display: "'Archivo Black'" },
    googleFonts: "family=Archivo+Black&family=Archivo:wght@400;600;800&family=Space+Mono:wght@400;700",
    radio: "0px", efectos: ["brutal", "mayusculas"],
    variantes: [
      { id: "claro", nombre: "Claro", paleta: { oscuro: false, fondo: "#ffffff", superficie: "#ffffff", superficie2: "#f2f2f2", borde: "#000000", texto: "#000000", texto2: "#262626", acento: "#000000", textoSobreAcento: "#ffe600", ok: "#000000", warn: "#000000", bad: "#000000", info: "#000000", series: ["#000000", "#a68a00", "#555555", "#6b6b6b", "#222222"] } },
      { id: "oscuro", nombre: "Oscuro", paleta: { oscuro: true, fondo: "#000000", superficie: "#000000", superficie2: "#141414", borde: "#ffffff", texto: "#ffffff", texto2: "#e0e0e0", acento: "#ffe600", textoSobreAcento: "#000000", ok: "#ffffff", warn: "#ffe600", bad: "#ffe600", info: "#ffffff", series: ["#ffffff", "#ffe600", "#aaaaaa", "#777777", "#dddddd"] } },
    ],
  },
  {
    id: "k08-control", nombre: "Centro de control", grupo: "creativa", acomodo: "control",
    descripcion: "La recargada: indicadores, enlace LoRa, energía, bitácora y cinta de telemetría.",
    fuentes: { sans: "'IBM Plex Mono'", mono: "'IBM Plex Mono'", display: "Rajdhani" },
    googleFonts: "family=Rajdhani:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500",
    radio: "0px", efectos: ["scanlines", "mayusculas"],
    variantes: [
      { id: "mision", nombre: "Misión", paleta: { oscuro: true, fondo: "#050b14", superficie: "#08121f", superficie2: "#0c1a2c", borde: "#1f3a57", texto: "#cfe8ff", texto2: "#8fb0cf", acento: "#4fd8ff", textoSobreAcento: "#050b14", ok: "#7cf29c", warn: "#ffb547", bad: "#ff5c5c", info: "#b39cff", series: ["#4fd8ff", "#7cf29c", "#ffb547", "#b39cff", "#ff5c5c"] } },
      { id: "dia", nombre: "Turno de día", paleta: { oscuro: false, fondo: "#eef3f8", superficie: "#ffffff", superficie2: "#e3ebf3", borde: "#9fb3c8", texto: "#0b1a2b", texto2: "#3d5470", acento: "#006a9e", textoSobreAcento: "#ffffff", ok: "#157a3b", warn: "#9a5b00", bad: "#b3261e", info: "#5b3fbf", series: ["#006a9e", "#157a3b", "#9a5b00", "#5b3fbf", "#b3261e"] } },
    ],
  },
  {
    id: "k09-lcd", nombre: "Estación LCD", grupo: "creativa", acomodo: "lcd",
    descripcion: "Como un aparato: pantallas VFD o LCD, LEDs de estado y botones físicos.",
    fuentes: { sans: "'Barlow Condensed'", mono: "VT323", display: "VT323" },
    googleFonts: "family=VT323&family=Barlow+Condensed:wght@500;600;700",
    radio: "10px", efectos: ["pantallas"],
    variantes: [
      { id: "vfd", nombre: "VFD", paleta: { oscuro: true, fondo: "#161718", superficie: "#2a2c2e", superficie2: "#03100e", borde: "#44484c", texto: "#e6e8ea", texto2: "#a8acb0", acento: "#4dffe1", textoSobreAcento: "#03100e", ok: "#3dff8b", warn: "#ffb000", bad: "#ff5b52", info: "#4dffe1", series: ["#4dffe1", "#3dff8b", "#ffb000", "#ff5b52", "#a8acb0"] } },
      { id: "lcd", nombre: "LCD", paleta: { oscuro: true, fondo: "#161718", superficie: "#2a2c2e", superficie2: "#b7c49a", borde: "#44484c", texto: "#e6e8ea", texto2: "#a8acb0", acento: "#c9d6a8", textoSobreAcento: "#16200d", ok: "#3dff8b", warn: "#ffb000", bad: "#ff5b52", info: "#c9d6a8", series: ["#c9d6a8", "#3dff8b", "#ffb000", "#ff5b52", "#a8acb0"] } },
    ],
  },
  {
    id: "k10-heatmap", nombre: "Mapa de calor", grupo: "creativa", acomodo: "heatmap",
    descripcion: "Como las contribuciones de GitHub: nodos × horas y calendario de riegos.",
    fuentes: { sans: "'Noto Sans'", mono: "'JetBrains Mono'" },
    googleFonts: "family=Noto+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;500",
    radio: "6px", efectos: [],
    variantes: [
      { id: "oscuro", nombre: "Oscuro", paleta: { oscuro: true, fondo: "#0d1117", superficie: "#0d1117", superficie2: "#161b22", borde: "#30363d", texto: "#e6edf3", texto2: "#9198a1", acento: "#4493f8", textoSobreAcento: "#0d1117", ok: "#58a6ff", warn: "#f0883e", bad: "#f85149", info: "#4493f8", series: ["#4493f8", "#3fb950", "#f0883e", "#ab7df8", "#f85149"] } },
      { id: "claro", nombre: "Claro", paleta: { oscuro: false, fondo: "#ffffff", superficie: "#ffffff", superficie2: "#f6f8fa", borde: "#d1d9e0", texto: "#1f2328", texto2: "#59636e", acento: "#0969da", textoSobreAcento: "#ffffff", ok: "#0550ae", warn: "#bc4c00", bad: "#cf222e", info: "#0969da", series: ["#0969da", "#1a7f37", "#bc4c00", "#8250df", "#cf222e"] } },
    ],
  },
]

export const ESTILO_POR_DEFECTO = { estilo: "c01-senal", variante: "oscuro" }

export function buscarEstilo(id: string | null | undefined): Estilo {
  return ESTILOS.find((e) => e.id === id) ?? ESTILOS[0]
}

export function buscarVariante(estilo: Estilo, id: string | null | undefined): Variante {
  return estilo.variantes.find((v) => v.id === id) ?? estilo.variantes[0]
}

/** "#rrggbb" → "h s% l%" (formato de las variables de shadcn/Tailwind). */
export function hexAHsl(hex: string): string {
  const h = hex.replace("#", "")
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const r = parseInt(n.slice(0, 2), 16) / 255
  const g = parseInt(n.slice(2, 4), 16) / 255
  const b = parseInt(n.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let hue = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    hue = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
    hue *= 60
  }
  return `${hue.toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`
}

/** Variables CSS que aplica un estilo/variante sobre :root. */
export function variablesCss(estilo: Estilo, variante: Variante, personalizacion?: Personalizacion | null): Record<string, string> {
  const p = aplicarPersonalizacion(estilo, variante, personalizacion)
  const v: Record<string, string> = {
    "--background": hexAHsl(p.fondo),
    "--foreground": hexAHsl(p.texto),
    "--card": hexAHsl(p.superficie),
    "--card-foreground": hexAHsl(p.texto),
    "--popover": hexAHsl(p.superficie),
    "--popover-foreground": hexAHsl(p.texto),
    "--primary": hexAHsl(p.acento),
    "--primary-foreground": hexAHsl(p.textoSobreAcento),
    "--secondary": hexAHsl(p.superficie2),
    "--secondary-foreground": hexAHsl(p.texto),
    "--muted": hexAHsl(p.superficie2),
    "--muted-foreground": hexAHsl(p.texto2),
    "--accent": hexAHsl(p.superficie2),
    "--accent-foreground": hexAHsl(p.texto),
    "--destructive": hexAHsl(p.bad),
    "--destructive-foreground": hexAHsl(p.oscuro ? p.fondo : "#ffffff"),
    "--border": hexAHsl(p.borde),
    "--input": hexAHsl(p.borde),
    "--ring": hexAHsl(p.acento),
    "--ok": hexAHsl(p.ok),
    "--warn": hexAHsl(p.warn),
    "--bad": hexAHsl(p.bad),
    "--info": hexAHsl(p.info),
    "--radius": estilo.radio,
    "--font-sans": `${estilo.fuentes.sans}, system-ui, sans-serif`,
    "--font-mono": `${estilo.fuentes.mono}, ui-monospace, monospace`,
    "--font-display": `${estilo.fuentes.display ?? estilo.fuentes.sans}, system-ui, sans-serif`,
  }
  p.series.forEach((c, i) => { v[`--chart-${i + 1}`] = hexAHsl(c) })
  return v
}

// ---------------------------------------------------------------------------------------
// Personalización por estilo (como los temas de Pixel): fondo y colores de acento.

export type FondoId = "estilo" | "oled" | "oscuro-gris" | "oscuro-azulino" | "oscuro-sepia" | "sepia-claro" | "claro"

type Fondo = Pick<Paleta, "oscuro" | "fondo" | "superficie" | "superficie2" | "borde" | "texto" | "texto2">

export const FONDOS: { id: Exclude<FondoId, "estilo">; nombre: string; colores: Fondo }[] = [
  { id: "oled", nombre: "OLED", colores: { oscuro: true, fondo: "#000000", superficie: "#0a0a0a", superficie2: "#161616", borde: "#262626", texto: "#f5f5f5", texto2: "#a8a8a8" } },
  { id: "oscuro-gris", nombre: "Oscuro", colores: { oscuro: true, fondo: "#0f1011", superficie: "#17181a", superficie2: "#202124", borde: "#2e3033", texto: "#ededef", texto2: "#a0a0a8" } },
  { id: "oscuro-azulino", nombre: "Oscuro azulino", colores: { oscuro: true, fondo: "#070F14", superficie: "#0A141A", superficie2: "#16252F", borde: "#243440", texto: "#F0F4F7", texto2: "#A9B5C0" } },
  { id: "oscuro-sepia", nombre: "Oscuro sepia", colores: { oscuro: true, fondo: "#14100A", superficie: "#1B1610", superficie2: "#292218", borde: "#3A3020", texto: "#EDE3D0", texto2: "#C7B99D" } },
  { id: "sepia-claro", nombre: "Sepia claro", colores: { oscuro: false, fondo: "#E7DECB", superficie: "#EFE8D8", superficie2: "#DAD0B9", borde: "#C4B79C", texto: "#2B2215", texto2: "#584B31" } },
  { id: "claro", nombre: "Claro", colores: { oscuro: false, fondo: "#F2F4F6", superficie: "#FFFFFF", superficie2: "#F1F3F5", borde: "#DCE1E6", texto: "#0F1B23", texto2: "#4A5763" } },
]

/** Acentos sugeridos (al estilo de la paleta de Pixel). */
export const ACENTOS_SUGERIDOS = [
  "#31adff", "#4493f8", "#7c86ff", "#b388ff", "#e872ff", "#ff2bd6", "#ff5f6d",
  "#ff5f1f", "#ffb000", "#ffe600", "#a3e635", "#3ccf8e", "#00f0ff", "#4dd4c6",
]

export type Personalizacion = { fondo: FondoId; acento: string | null; acento2: string | null }
export const SIN_PERSONALIZAR: Personalizacion = { fondo: "estilo", acento: null, acento2: null }

const ESTADOS_OSCURO = { ok: "#3ccf8e", warn: "#ffab5c", bad: "#ff7b7b", info: "#5CBEFF" }
const ESTADOS_CLARO = { ok: "#13794a", warn: "#a65400", bad: "#b3261e", info: "#0052a8" }

function luminanciaHex(hex: string) {
  const c = hex.replace("#", "").match(/.{2}/g)!.map((x) => parseInt(x, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

export function contraste(a: string, b: string) {
  const [x, y] = [luminanciaHex(a), luminanciaHex(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

function mezclar(hex: string, hacia: string, t: number) {
  const a = hex.replace("#", "").match(/.{2}/g)!.map((x) => parseInt(x, 16))
  const b = hacia.replace("#", "").match(/.{2}/g)!.map((x) => parseInt(x, 16))
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("")
}

/** Aclara u oscurece un color (mezclándolo con blanco o negro) hasta que contraste lo pedido con el fondo. */
export function ajustarContraste(color: string, fondo: string, minimo: number) {
  if (contraste(color, fondo) >= minimo) return color
  const hacia = luminanciaHex(fondo) < 0.18 ? "#ffffff" : "#000000"
  for (let t = 0.05; t <= 1; t += 0.05) {
    const c = mezclar(color, hacia, t)
    if (contraste(c, fondo) >= minimo) return c
  }
  return hacia
}

const esHex = (c: string | null | undefined): c is string => !!c && /^#[0-9a-fA-F]{6}$/.test(c)

/** Paleta final de un estilo/variante con la personalización del usuario aplicada. */
export function aplicarPersonalizacion(estilo: Estilo, variante: Variante, per?: Personalizacion | null): Paleta {
  const base = variante.paleta
  if (!per || (per.fondo === "estilo" && !esHex(per.acento) && !esHex(per.acento2))) return base
  const p: Paleta = { ...base, series: [...base.series] as Paleta["series"] }

  const fondo = FONDOS.find((f) => f.id === per.fondo)
  if (fondo) {
    Object.assign(p, fondo.colores)
    if (fondo.colores.oscuro !== base.oscuro) {
      // Cambió el brillo: los estados salen de la variante del estilo con ese brillo (o los genéricos)
      const otra = estilo.variantes.find((v) => v.paleta.oscuro === fondo.colores.oscuro)?.paleta
      const estados = otra ?? (fondo.colores.oscuro ? ESTADOS_OSCURO : ESTADOS_CLARO)
      Object.assign(p, { ok: estados.ok, warn: estados.warn, bad: estados.bad, info: estados.info })
      if (otra) { p.acento = otra.acento; p.textoSobreAcento = otra.textoSobreAcento; p.series = [...otra.series] as Paleta["series"] }
    }
    // Garantiza que los estados se lean sobre el fondo nuevo
    for (const k of ["ok", "warn", "bad", "info"] as const) p[k] = ajustarContraste(p[k], p.superficie, 4.5)
    p.series = p.series.map((c) => ajustarContraste(c, p.superficie, 3)) as Paleta["series"]
    if (contraste(p.acento, p.superficie) < 3) p.acento = ajustarContraste(p.acento, p.superficie, 3)
  }

  if (esHex(per.acento)) {
    p.acento = ajustarContraste(per.acento, p.superficie, 3)
    p.series[0] = p.acento
  }
  if (esHex(per.acento2)) {
    p.info = ajustarContraste(per.acento2, p.superficie, 4.5)
    p.series[1] = p.info
  }
  // Texto sobre el acento: negro o blanco, el que más contraste
  p.textoSobreAcento = contraste(p.acento, "#000000") >= contraste(p.acento, "#ffffff") ? "#000000" : "#ffffff"
  return p
}
