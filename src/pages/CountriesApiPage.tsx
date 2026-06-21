import { useState } from 'react'
import { Send, Clock, Hash, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { PageContainer } from '../components/layout/PageContainer'

// ── Types ─────────────────────────────────────────────────────────────────────

type EndpointKey = 'all' | 'name' | 'alpha' | 'region' | 'subregion' | 'lang' | 'currency'

interface Endpoint {
  key: EndpointKey
  label: string
  path: (q: string) => string
  placeholder: string
  hasQuery: boolean
}

const ENDPOINTS: Endpoint[] = [
  { key: 'all',       label: '/all',        path: ()  => '/all',                  placeholder: '',              hasQuery: false },
  { key: 'name',      label: '/name',       path: (q) => `/name/${q}`,            placeholder: 'Brazil',        hasQuery: true  },
  { key: 'alpha',     label: '/alpha',      path: (q) => `/alpha/${q}`,           placeholder: 'BR  or  BRA',   hasQuery: true  },
  { key: 'region',    label: '/region',     path: (q) => `/region/${q}`,          placeholder: 'Americas',      hasQuery: true  },
  { key: 'subregion', label: '/subregion',  path: (q) => `/subregion/${q}`,       placeholder: 'South America', hasQuery: true  },
  { key: 'lang',      label: '/lang',       path: (q) => `/lang/${q}`,            placeholder: 'portuguese',    hasQuery: true  },
  { key: 'currency',  label: '/currency',   path: (q) => `/currency/${q}`,        placeholder: 'usd',           hasQuery: true  },
]

const DEFAULT_FIELDS = 'name,cca2,cca3,capital,region,subregion,population,area,flags,languages,currencies'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString()
}

function CountryCard({ c }: { c: Record<string, unknown> }) {
  const [open, setOpen] = useState(false)
  const name    = (c.name as { common?: string })?.common ?? '—'
  const cca2    = c.cca2 as string ?? ''
  const capital = (c.capital as string[] | undefined)?.[0] ?? '—'
  const region  = c.region as string ?? ''
  const sub     = c.subregion as string ?? ''
  const pop     = c.population as number | undefined
  const area    = c.area as number | undefined
  const flagSvg = (c.flags as { svg?: string })?.svg
  const flagPng = (c.flags as { png?: string })?.png
  const langs   = c.languages ? Object.values(c.languages as Record<string, string>).join(', ') : ''
  const currs   = c.currencies
    ? Object.entries(c.currencies as Record<string, { name: string; symbol: string }>)
        .map(([, v]) => `${v.name} (${v.symbol})`)
        .join(', ')
    : ''

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors text-left"
      >
        {flagPng || flagSvg
          ? <img src={flagPng ?? flagSvg} alt={name} className="w-8 h-5 object-cover rounded-sm shrink-0" />
          : <span className="w-8 h-5 bg-surface rounded-sm shrink-0 text-xs flex items-center justify-center text-slate-600">{cca2}</span>
        }
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-slate-100 text-sm">{name}</span>
          {capital !== '—' && <span className="ml-2 text-slate-500 text-xs">{capital}</span>}
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500">
          {region && <span className="hidden sm:inline">{region}</span>}
          {pop     && <span>{fmt(pop)} pop</span>}
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-surface-border grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs">
          {[
            { label: 'Code',       value: `${cca2} / ${c.cca3 ?? ''}` },
            { label: 'Region',     value: `${region}${sub ? ' › ' + sub : ''}` },
            { label: 'Capital',    value: capital },
            { label: 'Population', value: pop   ? fmt(pop)              : '—' },
            { label: 'Area',       value: area  ? `${fmt(area)} km²`    : '—' },
            { label: 'Languages',  value: langs  || '—' },
            { label: 'Currencies', value: currs  || '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-slate-600 mb-0.5">{label}</p>
              <p className="text-slate-300 truncate">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function CountriesApiPage() {
  const [endpoint,   setEndpoint]   = useState<EndpointKey>('name')
  const [query,      setQuery]      = useState('')
  const [fields,     setFields]     = useState(DEFAULT_FIELDS)
  const [showFields, setShowFields] = useState(false)
  const [rawView,    setRawView]    = useState(false)

  const [results,   setResults]   = useState<Record<string, unknown>[] | null>(null)
  const [rawJson,   setRawJson]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [meta,      setMeta]      = useState<{ count: number; ms: number; url: string } | null>(null)

  const ep = ENDPOINTS.find(e => e.key === endpoint)!

  async function handleFetch() {
    if (ep.hasQuery && !query.trim()) return
    setLoading(true)
    setError(null)
    setResults(null)
    setRawJson('')
    setMeta(null)

    const path   = ep.path(query.trim())
    const qs     = fields.trim() ? `?fields=${encodeURIComponent(fields.trim())}` : ''
    const url    = `/api/countries${path}${qs}`
    const t0     = performance.now()

    try {
      const res = await fetch(url)
      const ms  = Math.round(performance.now() - t0)
      const text = await res.text()
      if (!res.ok) {
        setError(`${res.status} ${res.statusText}\n\n${text}`)
        return
      }
      const data = JSON.parse(text)
      const arr: Record<string, unknown>[] = Array.isArray(data) ? data : [data]
      setResults(arr)
      setRawJson(JSON.stringify(data, null, 2))
      setMeta({ count: arr.length, ms, url })
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleFetch()
  }

  return (
    <PageContainer fullWidth>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 mb-1">REST Countries API</h1>
          <p className="text-sm text-slate-500">
            Teste os endpoints da{' '}
            <a href="https://restcountries.com" target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">
              restcountries.com
            </a>
            {' '}diretamente pelo proxy do servidor.
          </p>
        </div>

        {/* Request builder */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5 mb-6 space-y-4">

          {/* Endpoint + query row */}
          <div className="flex gap-2 flex-wrap">
            {/* Method badge */}
            <span className="flex items-center px-3 py-2.5 rounded-xl bg-pos-soft border border-pos/30 text-pos text-xs font-bold shrink-0">
              GET
            </span>

            {/* Endpoint selector */}
            <select
              value={endpoint}
              onChange={e => { setEndpoint(e.target.value as EndpointKey); setQuery('') }}
              className="bg-surface border border-surface-border rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-brand-500 transition-colors shrink-0"
            >
              {ENDPOINTS.map(e => (
                <option key={e.key} value={e.key}>{e.label}</option>
              ))}
            </select>

            {/* Query input */}
            {ep.hasQuery && (
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKey}
                placeholder={ep.placeholder}
                className="flex-1 min-w-32 bg-surface border border-surface-border rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-brand-500 transition-colors font-mono"
              />
            )}

            {/* Send button */}
            <button
              onClick={handleFetch}
              disabled={loading || (ep.hasQuery && !query.trim())}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              style={{ background: 'linear-gradient(135deg,#159bb3,#33c6dc)', color: '#fff' }}
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send size={14} />
              }
              {loading ? 'Fetching…' : 'Send'}
            </button>
          </div>

          {/* URL preview */}
          {(ep.hasQuery ? query.trim() : true) && (
            <p className="text-xs font-mono text-slate-500 bg-surface rounded-lg px-3 py-2 break-all">
              <span className="text-slate-600">GET </span>
              <span className="text-brand-400">/api/countries</span>
              <span className="text-slate-300">{ep.path(query || '{query}')}</span>
              {fields.trim() && (
                <span className="text-slate-500">?fields={fields.trim()}</span>
              )}
            </p>
          )}

          {/* Fields toggle */}
          <div>
            <button
              onClick={() => setShowFields(o => !o)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showFields ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              Fields filter {fields.trim() ? `(${fields.split(',').length} selected)` : '(all)'}
            </button>
            {showFields && (
              <div className="mt-2">
                <input
                  value={fields}
                  onChange={e => setFields(e.target.value)}
                  placeholder="name,cca2,capital,region,population (blank = all fields)"
                  className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2.5 text-xs text-slate-300 placeholder:text-slate-600 outline-none focus:border-brand-500 transition-colors font-mono"
                />
                <p className="text-xs text-slate-600 mt-1">Separe por vírgula. Deixe em branco para retornar todos os campos.</p>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-neg/30 bg-neg-soft p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={14} className="text-neg shrink-0" />
              <span className="text-xs font-semibold text-neg uppercase tracking-wide">Erro</span>
            </div>
            <pre className="text-xs text-neg/80 whitespace-pre-wrap font-mono">{error}</pre>
          </div>
        )}

        {/* Response */}
        {results && meta && (
          <div className="space-y-4">

            {/* Meta bar */}
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-pos">
                <span className="w-2 h-2 rounded-full bg-pos animate-glow-pulse" />
                200 OK
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock size={11} /> {meta.ms} ms
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Hash size={11} /> {meta.count} {meta.count === 1 ? 'country' : 'countries'}
              </span>
              <button
                onClick={() => setRawView(v => !v)}
                className="ml-auto text-slate-500 hover:text-slate-200 transition-colors border border-surface-border rounded-lg px-3 py-1"
              >
                {rawView ? 'Cards' : 'JSON'}
              </button>
            </div>

            {/* Raw JSON */}
            {rawView ? (
              <pre className="bg-surface-card border border-surface-border rounded-xl p-4 text-xs text-slate-300 font-mono overflow-auto max-h-[600px] whitespace-pre-wrap">
                {rawJson}
              </pre>
            ) : (
              <div className="space-y-2">
                {results.map((c, i) => (
                  <CountryCard key={(c.cca2 as string) ?? i} c={c} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
