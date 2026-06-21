import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Play, Loader2, AlertCircle, CheckCircle, RefreshCw,
  X, Plus, Trash2, TrendingUp, BarChart3, BarChart2, ScatterChart, PieChart,
} from 'lucide-react'
import { usePyodideWorker, type PyodideStatus } from '../hooks/usePyodideWorker'

// ── Types ─────────────────────────────────────────────────────────────────────

type SourceType = 'candles' | 'compare' | 'quotes'
type ChartKind  = 'line' | 'bar' | 'barh' | 'scatter' | 'hist' | 'pie'
type Resolution = '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M'

// ── Constants ─────────────────────────────────────────────────────────────────

const RESOLUTIONS: { value: Resolution; label: string }[] = [
  { value: 'D', label: 'Daily' },
  { value: 'W', label: 'Weekly' },
  { value: 'M', label: 'Monthly' },
  { value: '60', label: '1 hour' },
  { value: '30', label: '30 min' },
  { value: '15', label: '15 min' },
  { value: '5',  label: '5 min' },
  { value: '1',  label: '1 min' },
]

const DAY_OPTIONS = [7, 14, 30, 60, 90, 180, 365]

const CHART_KINDS: { value: ChartKind; label: string; Icon: React.ElementType }[] = [
  { value: 'line',    label: 'Line',    Icon: TrendingUp   },
  { value: 'bar',     label: 'Bar',     Icon: BarChart3    },
  { value: 'barh',    label: 'H-Bar',   Icon: BarChart2    },
  { value: 'scatter', label: 'Scatter', Icon: ScatterChart },
  { value: 'hist',    label: 'Hist',    Icon: BarChart3    },
  { value: 'pie',     label: 'Pie',     Icon: PieChart     },
]

const STATUS_CFG: Record<PyodideStatus, { label: string; color: string; dot: string }> = {
  idle:    { label: 'Idle',    color: '#64748b', dot: '#475569' },
  loading: { label: 'Loading Python…', color: '#ffc857', dot: '#ffc857' },
  ready:   { label: 'Ready',   color: '#2bd9a0', dot: '#2bd9a0' },
  running: { label: 'Running', color: '#33c6dc', dot: '#33c6dc' },
  error:   { label: 'Error',   color: '#ff6b7a', dot: '#ff6b7a' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface DfMeta { cols: string[]; rows: number; index: string }

function parseMeta(stdout: string): DfMeta | null {
  const m = stdout.match(/__META__:(.+)/)
  if (!m) return null
  try { return JSON.parse(m[1]) } catch { return null }
}

function parseTableHtml(stdout: string): string {
  const m = stdout.match(/<table[\s\S]*?<\/table>/)
  return m ? m[0] : ''
}

// ── Symbol tag input ──────────────────────────────────────────────────────────

function SymbolTags({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('')

  function add() {
    const s = input.trim().toUpperCase()
    if (s && !value.includes(s)) onChange([...value, s])
    setInput('')
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2.5 bg-surface border border-surface-border rounded-xl min-h-11">
      {value.map(s => (
        <span key={s} className="flex items-center gap-1 px-2.5 py-1 bg-brand-900 text-brand-300 text-xs rounded-full font-mono font-bold">
          {s}
          <button onClick={() => onChange(value.filter(x => x !== s))} className="text-brand-500 hover:text-white ml-0.5">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value.toUpperCase())}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }}
        placeholder="Add symbol + Enter…"
        className="flex-1 min-w-24 bg-transparent text-xs text-slate-300 placeholder:text-slate-600 outline-none font-mono"
      />
    </div>
  )
}

// ── Select / input helpers ────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-slate-500 mb-1.5 font-medium">{children}</p>
}

function Sel({ value, onChange, children, className = '' }: {
  value: string | number
  onChange: (v: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-surface border border-surface-border rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-brand-500 transition-colors ${className}`}
    >
      {children}
    </select>
  )
}

function Inp({ value, onChange, placeholder, onEnter, large }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  onEnter?: () => void
  large?: boolean
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value.toUpperCase())}
      onKeyDown={e => e.key === 'Enter' && onEnter?.()}
      placeholder={placeholder}
      className={`w-full bg-surface border border-surface-border rounded-xl px-3 outline-none focus:border-brand-500 transition-colors text-slate-100 font-mono font-bold placeholder:text-slate-600 placeholder:font-normal ${large ? 'py-3 text-2xl' : 'py-2.5 text-sm'}`}
    />
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function SandboxPage() {
  const { status, statusText, result, error, run } = usePyodideWorker()

  // Source config
  const [sourceType, setSourceType]   = useState<SourceType>('candles')
  const [symbol,     setSymbol]       = useState('AAPL')
  const [symbols,    setSymbols]      = useState<string[]>(['AAPL', 'MSFT', 'GOOGL'])
  const [days,       setDays]         = useState(90)
  const [resolution, setResolution]   = useState<Resolution>('D')
  const [normalize,  setNormalize]    = useState(true)

  // Loaded data
  const [meta,         setMeta]         = useState<DfMeta | null>(null)
  const [dataLabel,    setDataLabel]    = useState('')
  const [dataTableHtml,setDataTableHtml]= useState('')
  const [tableOpen,    setTableOpen]    = useState(true)
  const [isLoaded,     setIsLoaded]     = useState(false)

  // Chart builder
  const [chartKind,  setChartKind]  = useState<ChartKind>('line')
  const [xCol,       setXCol]       = useState('__index__')
  const [yCols,      setYCols]      = useState<string[]>([])
  const [chartTitle, setChartTitle] = useState('')

  // Output
  const [charts, setCharts] = useState<string[]>([])

  // Phase tracking (which run just completed)
  const phaseRef = useRef<'data' | 'chart'>('data')

  const sc         = STATUS_CFG[status]
  const pyReady    = status === 'ready' || status === 'running' || status === 'error'
  const codeRunning = status === 'running'

  // ── React to worker results ───────────────────────────────────────────────

  useEffect(() => {
    if (!result) return

    if (phaseRef.current === 'data') {
      const m = parseMeta(result.stdout)
      if (m) {
        setMeta(m)
        const firstCol = m.cols[0] ?? ''
        setXCol(m.index ? '__index__' : firstCol)
        setYCols([firstCol])
        setChartTitle('')
        setCharts([])
        setIsLoaded(true)
      }
      setDataTableHtml(parseTableHtml(result.stdout))
    } else {
      if (result.figures.length > 0) setCharts(prev => [...prev, ...result.figures])
    }
  }, [result])

  // ── Code builders ──────────────────────────────────────────────────────────

  const buildLabel = useCallback((): string => {
    if (sourceType === 'candles') return `${symbol.toUpperCase()} · ${days}d · ${resolution}`
    if (sourceType === 'compare') return symbols.join(' vs ')
    return symbols.join(', ') + ' quotes'
  }, [sourceType, symbol, symbols, days, resolution])

  const buildLoadCode = useCallback((): string => {
    const META = [
      'import json as _j',
      'print("__META__:" + _j.dumps({"cols": list(_df.columns.astype(str)), "rows": int(len(_df)), "index": str(_df.index.name or "")}))',
      'display(_df.head(10))',
    ].join('\n')

    if (sourceType === 'candles') {
      return `_df = await get_candles("${symbol.toUpperCase()}", days=${days}, resolution="${resolution}")\n${META}`
    }
    if (sourceType === 'compare') {
      const s = symbols.map(x => `"${x}"`).join(', ')
      return `_df = await compare(${s}, days=${days}, normalize=${normalize ? 'True' : 'False'})\n${META}`
    }
    const s = symbols.map(x => `"${x}"`).join(', ')
    return [
      'import pandas as _pd',
      `_rows = [await get_quote(_s) for _s in [${s}]]`,
      '_df = _pd.concat(_rows, ignore_index=True)',
      META,
    ].join('\n')
  }, [sourceType, symbol, symbols, days, resolution, normalize])

  const buildChartCode = useCallback((): string => {
    const xArg  = xCol === '__index__' ? '' : `x='${xCol}', `
    const yArg  = yCols.length === 0 ? ''
                : yCols.length === 1 ? `y='${yCols[0]}', `
                : `y=[${yCols.map(c => `'${c}'`).join(', ')}], `
    const tArg  = chartTitle ? `, title='${chartTitle.replace(/'/g, "\\'")}'` : ''
    return `chart(_df, ${xArg}${yArg}kind='${chartKind}'${tArg})`
  }, [xCol, yCols, chartKind, chartTitle])

  function handleLoadData() {
    phaseRef.current = 'data'
    setDataLabel(buildLabel())
    run(buildLoadCode())
  }

  function handleAddChart() {
    if (!meta) return
    phaseRef.current = 'chart'
    run(buildChartCode())
  }

  // Column options (with index as first option)
  const xOptions = meta?.index
    ? [{ value: '__index__', label: `${meta.index || 'index'} ← index` }, ...(meta?.cols ?? []).map(c => ({ value: c, label: c }))]
    : (meta?.cols ?? []).map(c => ({ value: c, label: c }))

  const cols = meta?.cols ?? []

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden bg-surface">

      {/* Status bar */}
      <div className="flex items-center gap-2.5 px-4 h-10 border-b border-surface-border bg-surface-card shrink-0 text-xs">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sc.dot }} />
        <span style={{ color: sc.color }}>{sc.label}</span>
        {statusText && <span className="text-slate-600 truncate">{statusText}</span>}
        {isLoaded && (
          <button
            onClick={() => { setIsLoaded(false); setCharts([]); setMeta(null) }}
            className="ml-auto flex items-center gap-1 text-slate-500 hover:text-slate-200 transition-colors"
          >
            <RefreshCw size={11} /> New data
          </button>
        )}
      </div>

      {/* ── Pyodide init screen ── */}
      {!pyReady && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-brand-900 flex items-center justify-center">
              <TrendingUp size={28} className="text-brand-400" />
            </div>
            <Loader2 size={18} className="animate-spin text-brand-400 absolute -bottom-1 -right-1 bg-surface rounded-full" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-slate-300 font-medium">{statusText || 'Starting Python environment…'}</p>
            <p className="text-xs text-slate-600">Pyodide + pandas + matplotlib — first load ~30 MB, cached afterwards</p>
          </div>
        </div>
      )}

      {/* ── Data source form ── */}
      {pyReady && !isLoaded && (
        <div className="flex-1 overflow-auto flex items-start justify-center pt-12 pb-6 px-4">
          <div className="w-full max-w-md space-y-6">

            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-100">Load Market Data</h2>
              <p className="text-xs text-slate-500 mt-1">Choose a source, then build charts with one click</p>
            </div>

            {/* Source type toggle */}
            <div className="flex rounded-2xl overflow-hidden border border-surface-border bg-surface-card p-1 gap-1">
              {([
                { v: 'candles', label: 'Price Chart' },
                { v: 'compare', label: 'Compare' },
                { v: 'quotes',  label: 'Live Quotes' },
              ] as const).map(({ v, label }) => (
                <button
                  key={v}
                  onClick={() => setSourceType(v)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                    sourceType === v
                      ? 'bg-brand-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Candles */}
            {sourceType === 'candles' && (
              <div className="space-y-4">
                <div>
                  <Label>Symbol</Label>
                  <Inp value={symbol} onChange={setSymbol} placeholder="AAPL" onEnter={handleLoadData} large />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Period</Label>
                    <Sel value={days} onChange={v => setDays(Number(v))}>
                      {DAY_OPTIONS.map(d => <option key={d} value={d}>{d} days</option>)}
                    </Sel>
                  </div>
                  <div>
                    <Label>Resolution</Label>
                    <Sel value={resolution} onChange={v => setResolution(v as Resolution)}>
                      {RESOLUTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </Sel>
                  </div>
                </div>
              </div>
            )}

            {/* Compare */}
            {sourceType === 'compare' && (
              <div className="space-y-4">
                <div>
                  <Label>Symbols — press Enter to add</Label>
                  <SymbolTags value={symbols} onChange={setSymbols} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Period</Label>
                    <Sel value={days} onChange={v => setDays(Number(v))}>
                      {DAY_OPTIONS.map(d => <option key={d} value={d}>{d} days</option>)}
                    </Sel>
                  </div>
                  <div>
                    <Label>Mode</Label>
                    <div className="flex rounded-xl overflow-hidden border border-surface-border h-[42px]">
                      {[{ v: true, l: '% Return' }, { v: false, l: 'Price' }].map(({ v, l }) => (
                        <button
                          key={String(v)}
                          onClick={() => setNormalize(v)}
                          className={`flex-1 text-xs font-medium transition-colors ${normalize === v ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quotes */}
            {sourceType === 'quotes' && (
              <div>
                <Label>Symbols — press Enter to add</Label>
                <SymbolTags value={symbols} onChange={setSymbols} />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-neg/30 bg-neg-soft p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={13} className="text-neg shrink-0" />
                  <span className="text-xs font-semibold text-neg">Error loading data</span>
                </div>
                <pre className="text-xs text-neg/80 whitespace-pre-wrap font-mono">{error}</pre>
              </div>
            )}

            <button
              onClick={handleLoadData}
              disabled={codeRunning || (sourceType === 'candles' && !symbol) || (sourceType !== 'candles' && symbols.length === 0)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
              style={{ background: 'linear-gradient(135deg,#159bb3,#33c6dc)', color: '#fff' }}
            >
              {codeRunning
                ? <><Loader2 size={16} className="animate-spin" /> Fetching data…</>
                : <><Play size={16} /> Load Data</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Main layout (data loaded) ── */}
      {pyReady && isLoaded && (
        <div className="flex-1 flex overflow-hidden">

          {/* ── Left: Chart Builder ── */}
          <div className="w-64 shrink-0 border-r border-surface-border bg-surface-card flex flex-col overflow-y-auto">

            {/* Data info header */}
            <div className="p-4 border-b border-surface-border">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-100 truncate">{dataLabel}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{meta?.rows ?? 0} rows · {cols.length} columns</p>
                </div>
                <button
                  onClick={() => { setIsLoaded(false); setCharts([]); setMeta(null) }}
                  className="shrink-0 p-1.5 text-slate-500 hover:text-slate-200 hover:bg-surface-hover rounded-lg transition-colors"
                  title="Change data source"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>

            {/* Builder form */}
            <div className="flex-1 p-4 space-y-5">

              {/* Chart type */}
              <div>
                <Label>Chart type</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CHART_KINDS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      onClick={() => setChartKind(value)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                        chartKind === value
                          ? 'border-brand-500 bg-brand-900/60 text-brand-300 shadow-sm'
                          : 'border-surface-border text-slate-500 hover:border-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Icon size={15} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* X axis */}
              {chartKind !== 'hist' && (
                <div>
                  <Label>{chartKind === 'pie' ? 'Labels' : 'X axis'}</Label>
                  <Sel value={xCol} onChange={setXCol}>
                    {xOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Sel>
                </div>
              )}

              {/* Y axis */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label>{chartKind === 'pie' ? 'Values' : chartKind === 'hist' ? 'Column' : 'Y axis'}</Label>
                  {chartKind === 'line' && yCols.length < cols.length && (
                    <button
                      onClick={() => {
                        const unused = cols.find(c => !yCols.includes(c))
                        if (unused) setYCols(p => [...p, unused])
                      }}
                      className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-0.5 mb-1.5"
                    >
                      <Plus size={10} /> Add line
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {yCols.map((col, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Sel
                        value={col}
                        onChange={v => { const n=[...yCols]; n[i]=v; setYCols(n) }}
                        className="flex-1 text-xs"
                      >
                        {cols.map(c => <option key={c} value={c}>{c}</option>)}
                      </Sel>
                      {yCols.length > 1 && (
                        <button onClick={() => setYCols(p => p.filter((_,j) => j!==i))} className="text-slate-600 hover:text-neg shrink-0">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <Label>Title (optional)</Label>
                <input
                  value={chartTitle}
                  onChange={e => setChartTitle(e.target.value)}
                  placeholder="My Chart"
                  className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-brand-500 placeholder:text-slate-600 transition-colors"
                />
              </div>

              {/* Generate */}
              <button
                onClick={handleAddChart}
                disabled={codeRunning || yCols.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#159bb3,#33c6dc)', color: '#fff' }}
              >
                {codeRunning
                  ? <Loader2 size={13} className="animate-spin" />
                  : <Play size={13} />
                }
                Add Chart
              </button>

              {charts.length > 0 && (
                <button
                  onClick={() => setCharts([])}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-slate-500 hover:text-neg hover:bg-neg-soft/50 border border-surface-border transition-colors"
                >
                  <Trash2 size={11} /> Clear all charts
                </button>
              )}
            </div>
          </div>

          {/* ── Right: Output ── */}
          <div className="flex-1 overflow-auto min-w-0">

            {/* Error */}
            {error && (
              <div className="m-4 rounded-xl border border-neg/30 bg-neg-soft p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={14} className="text-neg shrink-0" />
                  <span className="text-xs font-semibold text-neg uppercase tracking-wide">Error</span>
                </div>
                <pre className="text-xs text-neg/80 whitespace-pre-wrap font-mono">{error}</pre>
              </div>
            )}

            {/* Data preview */}
            {dataTableHtml && (
              <div className="m-4 mb-0 rounded-xl border border-surface-border overflow-hidden">
                <button
                  onClick={() => setTableOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-surface-card hover:bg-surface-hover transition-colors text-left"
                >
                  <span className="text-xs font-semibold text-slate-300">
                    Preview — {dataLabel}
                    <span className="ml-2 text-slate-500 font-normal">{meta?.rows ?? 0} rows</span>
                  </span>
                  <span className="text-slate-500 text-xs">{tableOpen ? '▲ Hide' : '▼ Show'}</span>
                </button>
                {tableOpen && (
                  <div className="overflow-x-auto border-t border-surface-border">
                    <div dangerouslySetInnerHTML={{ __html: dataTableHtml }} />
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {charts.length === 0 && !codeRunning && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-3">
                <CheckCircle size={28} className="text-pos/40" />
                <div className="text-center">
                  <p className="text-sm text-slate-400">Data ready</p>
                  <p className="text-xs text-slate-600 mt-1">Configure a chart on the left and click "Add Chart"</p>
                </div>
              </div>
            )}

            {/* Generating placeholder */}
            {codeRunning && charts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 size={24} className="animate-spin text-brand-500" />
                <p className="text-sm text-slate-400">Generating chart…</p>
              </div>
            )}

            {/* Charts */}
            <div className="p-4 space-y-4">
              {charts.map((svg, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden border border-surface-border group shadow-lg">
                  <button
                    onClick={() => setCharts(p => p.filter((_,j) => j!==i))}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-surface-card/80 backdrop-blur text-slate-500 hover:text-neg opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove chart"
                  >
                    <X size={13} />
                  </button>
                  <div dangerouslySetInnerHTML={{ __html: svg }} />
                </div>
              ))}

              {/* Spinner at the bottom while generating additional chart */}
              {codeRunning && charts.length > 0 && (
                <div className="flex items-center justify-center py-8 gap-2 text-slate-500">
                  <Loader2 size={18} className="animate-spin text-brand-500" />
                  <span className="text-sm">Generating…</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
