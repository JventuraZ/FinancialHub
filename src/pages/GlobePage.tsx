import { useEffect, useRef, useState } from 'react'
import ThreeGlobe from 'three-globe'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { X } from 'lucide-react'

// ── Injected CSS ──────────────────────────────────────────────────────────────

const GLOBE_CSS = `
  @keyframes statusPulse {
    0%   { transform: scale(0.8); opacity: 0.7; }
    100% { transform: scale(2.6); opacity: 0; }
  }
  @keyframes panelScan {
    0%   { top: -60px; }
    100% { top: calc(100% + 60px); }
  }
  @keyframes cardReveal {
    from { opacity: 0; transform: translateX(12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes borderBreath {
    0%, 100% { box-shadow: 0 0 12px rgba(42,111,255,0.06); }
    50%       { box-shadow: 0 0 24px rgba(42,111,255,0.14); }
  }
  .gp-status-pulse {
    animation: statusPulse 2.6s ease-out infinite;
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    border: 1px solid currentColor;
    pointer-events: none;
  }
  .gp-panel-scan {
    overflow: hidden;
    position: relative;
  }
  .gp-panel-scan::after {
    content: '';
    position: absolute;
    left: 0; right: 0; height: 60px;
    background: linear-gradient(180deg, transparent 0%, rgba(42,111,255,0.035) 50%, transparent 100%);
    animation: panelScan 9s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }
  .gp-card-reveal { animation: cardReveal 0.35s cubic-bezier(0.16,1,0.3,1) both; }
  .gp-breath { animation: borderBreath 3.5s ease-in-out infinite; }
`

// ── Sub-components ────────────────────────────────────────────────────────────

function Corners({ opacity = 0.55 }: { opacity?: number }) {
  const s: React.CSSProperties = {
    position: 'absolute',
    width: 10, height: 10,
    borderColor: `rgba(42,111,255,${opacity})`,
    borderStyle: 'solid',
    pointerEvents: 'none',
  }
  return (
    <>
      <span style={{ ...s, top: 0, left: 0,  borderWidth: '1.5px 0 0 1.5px' }} />
      <span style={{ ...s, top: 0, right: 0, borderWidth: '1.5px 1.5px 0 0' }} />
      <span style={{ ...s, bottom: 0, left: 0,  borderWidth: '0 0 1.5px 1.5px' }} />
      <span style={{ ...s, bottom: 0, right: 0, borderWidth: '0 1.5px 1.5px 0' }} />
    </>
  )
}

function StatusDot({ color = '#1db87a' }: { color?: string }) {
  return (
    <span className="relative inline-flex items-center justify-center shrink-0" style={{ width: 7, height: 7 }}>
      <span className="rounded-full w-full h-full" style={{ background: color }} />
      <span className="gp-status-pulse" style={{ color }} />
    </span>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Exchange {
  name: string; short: string; lat: number; lng: number
  region: string; color: string; timezone: string; founded: string
}
interface Arc {
  startLat: number; startLng: number; endLat: number; endLng: number
}

// ── Data ──────────────────────────────────────────────────────────────────────

const REGION_COLOR: Record<string, string> = {
  Americas:      '#2a6fff',
  Europe:        '#1db87a',
  Asia:          '#c8922a',
  Pacific:       '#0ea5e9',
  Africa:        '#8b5cf6',
  'Middle East': '#e879f9',
}

const EXCHANGES: Exchange[] = [
  { name: 'New York Stock Exchange',  short: 'NYSE',    lat: 40.71,  lng: -74.01, region: 'Americas',    color: REGION_COLOR['Americas'],    timezone: 'UTC-5',    founded: '1792' },
  { name: 'NASDAQ',                   short: 'NASDAQ',  lat: 40.76,  lng: -73.89, region: 'Americas',    color: REGION_COLOR['Americas'],    timezone: 'UTC-5',    founded: '1971' },
  { name: 'Toronto Stock Exchange',   short: 'TSX',     lat: 43.65,  lng: -79.38, region: 'Americas',    color: REGION_COLOR['Americas'],    timezone: 'UTC-5',    founded: '1861' },
  { name: 'B3 São Paulo',             short: 'B3',      lat: -23.55, lng: -46.63, region: 'Americas',    color: REGION_COLOR['Americas'],    timezone: 'UTC-3',    founded: '1890' },
  { name: 'London Stock Exchange',    short: 'LSE',     lat: 51.51,  lng: -0.09,  region: 'Europe',      color: REGION_COLOR['Europe'],      timezone: 'UTC+0',    founded: '1801' },
  { name: 'Euronext Paris',           short: 'ENX',     lat: 48.86,  lng: 2.35,   region: 'Europe',      color: REGION_COLOR['Europe'],      timezone: 'UTC+1',    founded: '1724' },
  { name: 'Deutsche Börse',           short: 'XETRA',   lat: 50.11,  lng: 8.68,   region: 'Europe',      color: REGION_COLOR['Europe'],      timezone: 'UTC+1',    founded: '1585' },
  { name: 'SIX Swiss Exchange',       short: 'SIX',     lat: 47.37,  lng: 8.54,   region: 'Europe',      color: REGION_COLOR['Europe'],      timezone: 'UTC+1',    founded: '1850' },
  { name: 'Borsa Italiana',           short: 'MIL',     lat: 45.46,  lng: 9.19,   region: 'Europe',      color: REGION_COLOR['Europe'],      timezone: 'UTC+1',    founded: '1808' },
  { name: 'Tokyo Stock Exchange',     short: 'TSE',     lat: 35.68,  lng: 139.65, region: 'Asia',        color: REGION_COLOR['Asia'],        timezone: 'UTC+9',    founded: '1878' },
  { name: 'Shanghai Stock Exchange',  short: 'SSE',     lat: 31.23,  lng: 121.47, region: 'Asia',        color: REGION_COLOR['Asia'],        timezone: 'UTC+8',    founded: '1990' },
  { name: 'Hong Kong Exchanges',      short: 'HKEX',    lat: 22.28,  lng: 114.17, region: 'Asia',        color: REGION_COLOR['Asia'],        timezone: 'UTC+8',    founded: '1891' },
  { name: 'Shenzhen Stock Exchange',  short: 'SZSE',    lat: 22.54,  lng: 114.06, region: 'Asia',        color: REGION_COLOR['Asia'],        timezone: 'UTC+8',    founded: '1990' },
  { name: 'BSE India',                short: 'BSE',     lat: 18.93,  lng: 72.83,  region: 'Asia',        color: REGION_COLOR['Asia'],        timezone: 'UTC+5:30', founded: '1875' },
  { name: 'Korea Exchange',           short: 'KRX',     lat: 37.57,  lng: 126.98, region: 'Asia',        color: REGION_COLOR['Asia'],        timezone: 'UTC+9',    founded: '1956' },
  { name: 'Singapore Exchange',       short: 'SGX',     lat: 1.28,   lng: 103.85, region: 'Asia',        color: REGION_COLOR['Asia'],        timezone: 'UTC+8',    founded: '1999' },
  { name: 'Australian Sec. Exchange', short: 'ASX',     lat: -33.87, lng: 151.21, region: 'Pacific',     color: REGION_COLOR['Pacific'],     timezone: 'UTC+10',   founded: '1987' },
  { name: 'New Zealand Exchange',     short: 'NZX',     lat: -41.29, lng: 174.78, region: 'Pacific',     color: REGION_COLOR['Pacific'],     timezone: 'UTC+12',   founded: '1974' },
  { name: 'Johannesburg SE',          short: 'JSE',     lat: -26.20, lng: 28.05,  region: 'Africa',      color: REGION_COLOR['Africa'],      timezone: 'UTC+2',    founded: '1887' },
  { name: 'Egyptian Exchange',        short: 'EGX',     lat: 30.06,  lng: 31.24,  region: 'Africa',      color: REGION_COLOR['Africa'],      timezone: 'UTC+2',    founded: '1883' },
  { name: 'Saudi Exchange',           short: 'TADAWUL', lat: 24.67,  lng: 46.69,  region: 'Middle East', color: REGION_COLOR['Middle East'], timezone: 'UTC+3',    founded: '1984' },
  { name: 'Nasdaq Dubai',             short: 'DIFC',    lat: 25.20,  lng: 55.27,  region: 'Middle East', color: REGION_COLOR['Middle East'], timezone: 'UTC+4',    founded: '2005' },
]

const ARCS: Arc[] = [
  { startLat: 40.71,  startLng: -74.01, endLat: 43.65,  endLng: -79.38 },
  { startLat: 40.71,  startLng: -74.01, endLat: -23.55, endLng: -46.63 },
  { startLat: 40.71,  startLng: -74.01, endLat: 51.51,  endLng: -0.09  },
  { startLat: 40.76,  startLng: -73.89, endLat: 48.86,  endLng: 2.35   },
  { startLat: 43.65,  startLng: -79.38, endLat: 51.51,  endLng: -0.09  },
  { startLat: 51.51,  startLng: -0.09,  endLat: 48.86,  endLng: 2.35   },
  { startLat: 48.86,  startLng: 2.35,   endLat: 50.11,  endLng: 8.68   },
  { startLat: 50.11,  startLng: 8.68,   endLat: 47.37,  endLng: 8.54   },
  { startLat: 47.37,  startLng: 8.54,   endLat: 45.46,  endLng: 9.19   },
  { startLat: 51.51,  startLng: -0.09,  endLat: 18.93,  endLng: 72.83  },
  { startLat: 50.11,  startLng: 8.68,   endLat: 22.28,  endLng: 114.17 },
  { startLat: 48.86,  startLng: 2.35,   endLat: 24.67,  endLng: 46.69  },
  { startLat: 51.51,  startLng: -0.09,  endLat: -26.20, endLng: 28.05  },
  { startLat: 50.11,  startLng: 8.68,   endLat: 30.06,  endLng: 31.24  },
  { startLat: 35.68,  startLng: 139.65, endLat: 37.57,  endLng: 126.98 },
  { startLat: 35.68,  startLng: 139.65, endLat: 31.23,  endLng: 121.47 },
  { startLat: 31.23,  startLng: 121.47, endLat: 22.54,  endLng: 114.06 },
  { startLat: 31.23,  startLng: 121.47, endLat: 22.28,  endLng: 114.17 },
  { startLat: 22.28,  startLng: 114.17, endLat: 1.28,   endLng: 103.85 },
  { startLat: 22.28,  startLng: 114.17, endLat: 18.93,  endLng: 72.83  },
  { startLat: 18.93,  startLng: 72.83,  endLat: 24.67,  endLng: 46.69  },
  { startLat: 1.28,   startLng: 103.85, endLat: -33.87, endLng: 151.21 },
  { startLat: 35.68,  startLng: 139.65, endLat: -33.87, endLng: 151.21 },
  { startLat: -33.87, startLng: 151.21, endLat: -41.29, endLng: 174.78 },
  { startLat: 24.67,  startLng: 46.69,  endLat: 25.20,  endLng: 55.27  },
  { startLat: 24.67,  startLng: 46.69,  endLat: -26.20, endLng: 28.05  },
  { startLat: -26.20, startLng: 28.05,  endLat: 30.06,  endLng: 31.24  },
]

// ── Style presets ─────────────────────────────────────────────────────────────

type GlobeStyle = 'dark' | 'bluemarble' | 'day' | 'night'
type ArcStyle   = 'intel' | 'neon' | 'pulse' | 'region'

const GLOBE_PRESETS: { id: GlobeStyle; label: string; url: string; atmo: string }[] = [
  { id: 'dark',       label: 'Dark',        url: '//unpkg.com/three-globe/example/img/earth-dark.jpg',        atmo: '#1e3a6e' },
  { id: 'bluemarble', label: 'Blue Marble', url: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg', atmo: '#1a4fcc' },
  { id: 'day',        label: 'Day',         url: '//unpkg.com/three-globe/example/img/earth-day.jpg',         atmo: '#2a6fff' },
  { id: 'night',      label: 'Night',       url: '//unpkg.com/three-globe/example/img/earth-night.jpg',       atmo: '#4c1d95' },
]

const ARC_GRAD = {
  intel:  ['rgba(42,111,255,0)',   'rgba(42,111,255,0.8)',  'rgba(42,111,255,0)'  ] as string[],
  neon:   ['rgba(232,121,249,0)', 'rgba(232,121,249,0.9)', 'rgba(232,121,249,0)' ] as string[],
  pulse:  ['rgba(29,184,122,0)',  'rgba(29,184,122,0.85)', 'rgba(29,184,122,0)'  ] as string[],
}

const ARC_PRESETS: {
  id: ArcStyle; label: string
  animTime: number; stroke: number; altitude: number; dashLength: number; dashGap: number
  color: (() => string[]) | null
}[] = [
  { id: 'intel',  label: 'Intel',    animTime: 2200, stroke: 0.4,  altitude: 0.38, dashLength: 0.4,  dashGap: 0.10, color: () => ARC_GRAD.intel  },
  { id: 'neon',   label: 'Neon',     animTime: 800,  stroke: 1.1,  altitude: 0.52, dashLength: 0.55, dashGap: 0.06, color: () => ARC_GRAD.neon   },
  { id: 'pulse',  label: 'Pulse',    animTime: 4000, stroke: 0.5,  altitude: 0.28, dashLength: 0.04, dashGap: 0.96, color: () => ARC_GRAD.pulse  },
  { id: 'region', label: 'Regional', animTime: 2800, stroke: 0.35, altitude: 0.35, dashLength: 0.35, dashGap: 0.15, color: null },
]

// Regional arc colors (used when arcStyle = 'region')
const REGION_ARC: Record<string, string> = {
  Americas: '#2a6fff80', Europe: '#1db87a80', Asia: '#c8922a80',
  Pacific: '#0ea5e980', Africa: '#8b5cf680', 'Middle East': '#e879f980',
}

// Country polygon fill per continent
const CONTINENT_CAP: Record<string, string> = {
  'Africa':        'rgba(139,92,246,0.06)',
  'Asia':          'rgba(200,146,42,0.06)',
  'Europe':        'rgba(29,184,122,0.06)',
  'North America': 'rgba(42,111,255,0.06)',
  'South America': 'rgba(42,111,255,0.05)',
  'Oceania':       'rgba(14,165,233,0.06)',
  'Antarctica':    'rgba(148,163,184,0.03)',
}

// ── Shared panel className ────────────────────────────────────────────────────

const PANEL = [
  'bg-gradient-to-br from-[#0a0c12ee] to-[#07090fe8]',
  'backdrop-blur-xl',
  'border border-[rgba(42,111,255,0.2)]',
  'rounded-[4px]',
].join(' ')

const LABEL = 'font-mono text-[9px] font-medium tracking-[0.2em] uppercase text-[#5e6880]'
const CODE  = 'font-mono text-[11px] font-semibold tracking-[0.08em] text-[#d8dde8]'
const META  = 'font-mono text-[9px] tracking-[0.06em] text-[#363d4f]'

// ── Component ─────────────────────────────────────────────────────────────────

export function GlobePage() {
  const mountRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<ThreeGlobe | null>(null)

  const [selected,      setSelected]      = useState<Exchange | null>(null)
  const [globeStyle,    setGlobeStyle]    = useState<GlobeStyle>('dark')
  const [arcStyle,      setArcStyle]      = useState<ArcStyle>('intel')
  const [showCountries, setShowCountries] = useState(false)
  const [countries,     setCountries]     = useState<object[]>([])

  // Inject keyframe CSS once
  useEffect(() => {
    const el = document.createElement('style')
    el.id = 'gp-styles'
    el.textContent = GLOBE_CSS
    document.head.appendChild(el)
    return () => { document.getElementById('gp-styles')?.remove() }
  }, [])

  // Fetch country GeoJSON once
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/gh/vasturiano/three-globe@master/example/country-polygons/ne_110m_admin_0_countries.geojson')
      .then(r => r.json())
      .then((d: { features: object[] }) => setCountries(d.features ?? []))
      .catch(() => {})
  }, [])

  // ── Three.js mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const globe = new ThreeGlobe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .atmosphereColor('#1e3a6e')
      .atmosphereAltitude(0.18)
      // Exchange points
      .pointsData(EXCHANGES)
      .pointLat((d: object) => (d as Exchange).lat)
      .pointLng((d: object) => (d as Exchange).lng)
      .pointColor((d: object) => (d as Exchange).color)
      .pointRadius(0.5)
      .pointAltitude(0.015)
      .pointResolution(12)
      // Arcs — blue gradient by default
      .arcsData(ARCS)
      .arcStartLat((d: object) => (d as Arc).startLat)
      .arcStartLng((d: object) => (d as Arc).startLng)
      .arcEndLat((d: object) => (d as Arc).endLat)
      .arcEndLng((d: object) => (d as Arc).endLng)
      .arcColor(() => ARC_GRAD.intel as any)
      .arcAltitude(0.38)
      .arcStroke(0.4)
      .arcDashLength(0.4)
      .arcDashGap(0.10)
      .arcDashAnimateTime(2200)
      .arcDashInitialGap(() => Math.random())
      // Labels — muted
      .labelsData(EXCHANGES)
      .labelLat((d: object) => (d as Exchange).lat)
      .labelLng((d: object) => (d as Exchange).lng)
      .labelText((d: object) => (d as Exchange).short)
      .labelSize(1.0)
      .labelDotRadius(0.3)
      .labelColor(() => '#5e6880')
      .labelResolution(3)

    globeRef.current = globe

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setClearColor(0x0d1320, 1)
    el.appendChild(renderer.domElement)

    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 1, 2000)
    camera.position.z = 300

    const scene = new THREE.Scene()
    scene.add(globe)

    // Intel-tuned lighting — blue-shifted, dramatic
    const ambient = new THREE.AmbientLight(0x1a2a4a, 0.6)
    scene.add(ambient)
    const dl1 = new THREE.DirectionalLight(0x3a6aff, 0.75)
    dl1.position.set(-1, 1.5, 0.5)
    scene.add(dl1)
    const dl2 = new THREE.DirectionalLight(0x0a1a3a, 0.4)
    dl2.position.set(1, -0.5, -1)
    scene.add(dl2)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping   = true
    controls.dampingFactor   = 0.08
    controls.enablePan       = false
    controls.minDistance     = 160
    controls.maxDistance     = 480
    controls.rotateSpeed     = 0.35
    controls.autoRotate      = true
    controls.autoRotateSpeed = 0.12   // very slow — tactical display

    let resumeTimer: ReturnType<typeof setTimeout>
    controls.addEventListener('start', () => { controls.autoRotate = false; clearTimeout(resumeTimer) })
    controls.addEventListener('end',   () => { resumeTimer = setTimeout(() => { controls.autoRotate = true }, 5000) })

    const ro = new ResizeObserver(() => {
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    })
    ro.observe(el)

    let rafId: number
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(resumeTimer)
      ro.disconnect()
      controls.dispose()
      renderer.dispose()
      globeRef.current = null
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  // ── Globe texture ───────────────────────────────────────────────────────────
  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    const p = GLOBE_PRESETS.find(x => x.id === globeStyle)!
    g.globeImageUrl(p.url).atmosphereColor(p.atmo)
  }, [globeStyle])

  // ── Arc style ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    const p = ARC_PRESETS.find(x => x.id === arcStyle)!
    const colorFn = p.color
      ? p.color
      : (d: object) => {
          // regional: find region by coordinates match
          const arc = d as Arc
          const ex = EXCHANGES.find(e =>
            Math.abs(e.lat - arc.startLat) < 2 && Math.abs(e.lng - arc.startLng) < 2
          )
          return ex ? REGION_ARC[ex.region] ?? '#2a6fff60' : '#2a6fff60'
        }
    g
      .arcDashAnimateTime(p.animTime)
      .arcStroke(p.stroke)
      .arcAltitude(p.altitude)
      .arcDashLength(p.dashLength)
      .arcDashGap(p.dashGap)
      .arcColor(colorFn as any)
  }, [arcStyle])

  // ── Selected exchange highlight ─────────────────────────────────────────────
  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    g
      .pointRadius((d: object)   => (d as Exchange).short === selected?.short ? 1.8 : 0.5)
      .pointAltitude((d: object) => (d as Exchange).short === selected?.short ? 0.12 : 0.015)
      .labelColor((d: object) =>
        (d as Exchange).short === selected?.short ? '#d8dde8' : '#5e6880'
      )
  }, [selected])

  // ── Country polygons ────────────────────────────────────────────────────────
  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    if (showCountries && countries.length > 0) {
      g
        .polygonsData(countries)
        .polygonCapColor((d: object) => {
          const c = ((d as any).properties?.CONTINENT as string) ?? ''
          return CONTINENT_CAP[c] ?? 'rgba(255,255,255,0.03)'
        })
        .polygonSideColor(() => 'rgba(255,255,255,0.02)')
        .polygonStrokeColor(() => 'rgba(42,111,255,0.22)')
        .polygonAltitude(0.003)
    } else {
      g.polygonsData([])
    }
  }, [showCountries, countries])

  // ── UI helpers ──────────────────────────────────────────────────────────────
  const byRegion = Array.from(new Set(EXCHANGES.map(e => e.region))).map(r => ({
    region: r, color: REGION_COLOR[r], exchanges: EXCHANGES.filter(e => e.region === r),
  }))

  const now = new Date()
  const utcStr = now.toUTCString().slice(17, 25)

  const btnBase = 'px-2.5 py-[5px] rounded-[3px] text-[10px] font-mono font-medium tracking-[0.06em] transition-all border'
  const btnOn   = 'bg-[rgba(42,111,255,0.18)] border-[rgba(42,111,255,0.5)] text-[#7aa8ff]'
  const btnOff  = 'bg-transparent border-[rgba(255,255,255,0.06)] text-[#5e6880] hover:text-[#a8b8d0] hover:border-[rgba(42,111,255,0.3)]'
  const btnGrn  = 'bg-[rgba(29,184,122,0.15)] border-[rgba(29,184,122,0.4)] text-[#1db87a]'

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#050508' }}>

      {/* ── Globe canvas ────────────────────────────────────────────────── */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* ── Vignette ────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 78% 78% at 50% 50%, transparent 38%, rgba(5,5,8,0.5) 70%, rgba(5,5,8,0.9) 100%)',
          zIndex: 1,
        }}
      />

      {/* ── Grid (masked to edges) ───────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          opacity: 0.055,
          backgroundImage: 'linear-gradient(rgba(42,111,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(42,111,255,0.5) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          WebkitMaskImage: 'radial-gradient(ellipse 82% 82% at 50% 50%, transparent 38%, black 88%)',
          maskImage: 'radial-gradient(ellipse 82% 82% at 50% 50%, transparent 38%, black 88%)',
        }}
      />

      {/* ── Scanlines ───────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)',
        }}
      />

      {/* ── Exchange list — left ─────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 w-52 flex flex-col gap-1.5 max-h-[calc(100vh-7rem)] overflow-y-auto pr-0.5 pointer-events-auto" style={{ zIndex: 10 }}>
        {byRegion.map(({ region, color, exchanges }) => (
          <div key={region} className={`${PANEL} gp-panel-scan overflow-hidden relative`}>
            <Corners />
            <div className="px-3 py-2 flex items-center gap-2 border-b border-[rgba(255,255,255,0.04)] relative z-10">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
              <span className={LABEL}>{region}</span>
              <span className="ml-auto font-mono text-[9px] text-[#363d4f]">{exchanges.length.toString().padStart(2,'0')}</span>
            </div>
            <div className="py-1 relative z-10">
              {exchanges.map(ex => (
                <button
                  key={ex.short}
                  onClick={() => setSelected(s => s?.short === ex.short ? null : ex)}
                  className={`w-full flex items-center gap-2 px-3 py-[7px] text-left transition-colors ${
                    selected?.short === ex.short
                      ? 'bg-[rgba(42,111,255,0.1)]'
                      : 'hover:bg-[rgba(42,111,255,0.05)]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ex.color }} />
                  <span className={CODE}>{ex.short}</span>
                  <span className="text-[10px] text-[#363d4f] truncate ml-auto font-mono">{ex.founded}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Selected exchange card — top right ──────────────────────────── */}
      {selected && (
        <div
          className={`absolute top-4 right-4 w-64 ${PANEL} p-0 overflow-hidden gp-card-reveal gp-breath pointer-events-auto`}
          style={{ zIndex: 10 }}
        >
          <Corners opacity={0.7} />

          {/* Header */}
          <div className="px-4 pt-4 pb-3 flex items-start justify-between border-b border-[rgba(255,255,255,0.04)]">
            <div className="flex items-start gap-2.5">
              <StatusDot color={selected.color} />
              <div>
                <p className="font-mono font-bold text-lg leading-none tracking-[0.06em]" style={{ color: selected.color }}>
                  {selected.short}
                </p>
                <p className="text-[10px] text-[#5e6880] mt-1 font-mono">{selected.name}</p>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-[#363d4f] hover:text-[#5e6880] transition-colors mt-0.5"
            >
              <X size={13} />
            </button>
          </div>

          {/* Data rows */}
          <div className="px-4 py-3 space-y-2.5">
            {[
              { label: 'REGION',    value: selected.region },
              { label: 'TIMEZONE',  value: selected.timezone },
              { label: 'FOUNDED',   value: selected.founded },
              { label: 'COORD',     value: `${selected.lat.toFixed(2)}° ${selected.lng.toFixed(2)}°` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className={LABEL}>{label}</span>
                <span className="font-mono text-[11px] text-[#a8b8d0]">{value}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between">
            <span className={META}>SYS: ACTIVE</span>
            <span className={META}>UTC {utcStr}</span>
          </div>
        </div>
      )}

      {/* ── Bottom controls ──────────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end gap-2.5 flex-wrap pointer-events-auto" style={{ zIndex: 10 }}>

        {/* Globe texture */}
        <div className={`${PANEL} p-3 relative`}>
          <Corners />
          <p className={`${LABEL} mb-2`}>Globe</p>
          <div className="flex gap-1.5">
            {GLOBE_PRESETS.map(p => (
              <button key={p.id} onClick={() => setGlobeStyle(p.id)} className={`${btnBase} ${globeStyle === p.id ? btnOn : btnOff}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Arc style */}
        <div className={`${PANEL} p-3 relative`}>
          <Corners />
          <p className={`${LABEL} mb-2`}>Arcos</p>
          <div className="flex gap-1.5">
            {ARC_PRESETS.map(p => (
              <button key={p.id} onClick={() => setArcStyle(p.id)} className={`${btnBase} ${arcStyle === p.id ? btnOn : btnOff}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Countries toggle */}
        <div className={`${PANEL} p-3 relative`}>
          <Corners />
          <p className={`${LABEL} mb-2`}>Países</p>
          <button
            onClick={() => setShowCountries(v => !v)}
            className={`${btnBase} ${showCountries ? btnGrn : btnOff}`}
          >
            {showCountries ? 'Ocultar bordas' : 'Mostrar bordas'}
          </button>
        </div>

        {/* Stats */}
        <div className={`${PANEL} px-5 py-3 flex items-center gap-6 ml-auto relative pointer-events-none`}>
          <Corners />
          {[
            { n: EXCHANGES.length,                 label: 'NODES'  },
            { n: Object.keys(REGION_COLOR).length, label: 'REGIÕES' },
            { n: ARCS.length,                      label: 'LINKS'  },
          ].map(({ n, label }, i) => (
            <div key={label} className="flex items-center gap-6">
              {i > 0 && <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.06)' }} />}
              <div className="text-center">
                <p className="font-mono text-base font-bold text-[#d8dde8] leading-none tracking-[0.04em]">{n}</p>
                <p className={`${LABEL} mt-1`}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Watermark ───────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none select-none"
        style={{
          zIndex: 3,
          fontFamily: 'monospace',
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: 'rgba(42,111,255,0.07)',
          whiteSpace: 'nowrap',
        }}
      >
        RESTRICTED // FINANCIAL INTELLIGENCE SYSTEM // LIVE FEED
      </div>
    </div>
  )
}
