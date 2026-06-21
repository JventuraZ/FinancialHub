import { useEffect, useRef, useState, useCallback } from 'react'

const CDN = 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/'

// All Python lines use JSON.stringify for safe embedding in JS strings
const INIT_PY = [
  'import sys, io, json as _json',
  'import matplotlib',
  "matplotlib.use('Agg')",
  'import matplotlib.pyplot as plt',
  'import pandas as pd',
  'import numpy as np',
  '',
  '# ── figure capture (overrides plt.show) ───────────────',
  '_figs = []',
  'def _capture_show(*a, **kw):',
  '    buf = io.StringIO()',
  "    plt.savefig(buf, format='svg', bbox_inches='tight', facecolor='#0d1320', edgecolor='none')",
  '    buf.seek(0)',
  '    _figs.append(buf.read())',
  "    plt.close('all')",
  'plt.show = _capture_show',
  '',
  '# ── dark theme palette & helper ────────────────────────',
  '_C = ["#33c6dc","#ffc857","#2bd9a0","#ff6b7a","#a78bfa","#fb923c","#e879f9"]',
  'def _dark(ax, fig, title="", legend=True):',
  '    ax.set_facecolor("#161e2e")',
  '    fig.patch.set_facecolor("#0d1320")',
  '    ax.tick_params(colors="#a3b0c2")',
  '    for sp in ax.spines.values(): sp.set_color("#2a3650")',
  '    if title: ax.set_title(title, color="#eaf0f7", fontsize=13)',
  '    h, _ = ax.get_legend_handles_labels()',
  '    if h and legend: ax.legend(facecolor="#161e2e", edgecolor="#2a3650", labelcolor="#eaf0f7")',
  '',
  '# ── chart() ────────────────────────────────────────────',
  'def chart(data, x=None, y=None, kind="line", title="", color=None, **kw):',
  '    """Simple chart helper. kind: line | bar | barh | scatter | hist | pie"""',
  '    fig, ax = plt.subplots(figsize=(12, 5))',
  '    if isinstance(data, pd.Series):',
  '        s = data',
  '        if kind == "hist": ax.hist(s.dropna(), bins=kw.get("bins",30), color=color or _C[0], edgecolor="#2a3650", alpha=0.85)',
  '        else: ax.plot(s.index, s.values, color=color or _C[0], lw=1.5, label=s.name)',
  '        _dark(ax, fig, title or (s.name or ""))',
  '        plt.tight_layout(); plt.show(); return',
  '    x_data = data[x] if x else data.index',
  '    if kind == "line":',
  '        cols = ([y] if isinstance(y,str) else list(y)) if y else [c for c in data.columns if c != x]',
  '        for i,col in enumerate(cols): ax.plot(x_data, data[col], label=col, color=_C[i%len(_C)], lw=1.5)',
  '    elif kind in ("bar","barh"):',
  '        vals = data[y] if y else data.iloc[:,0]',
  '        bc = [_C[0] if v>=0 else "#ff6b7a" for v in vals] if not color else color',
  '        if kind=="bar": ax.bar(x_data, vals, color=bc, edgecolor="#2a3650", width=0.7); ax.axhline(0,color="#3a4762",lw=0.8); plt.xticks(rotation=30,ha="right")',
  '        else: ax.barh(x_data, vals, color=bc, edgecolor="#2a3650", height=0.7); ax.axvline(0,color="#3a4762",lw=0.8)',
  '    elif kind == "scatter":',
  '        y_data = data[y] if y else data.iloc[:,1]',
  '        ax.scatter(x_data, y_data, color=color or _C[0], edgecolors="#2a3650", s=80, alpha=0.85)',
  '        if x: ax.set_xlabel(x, color="#a3b0c2")',
  '        if y: ax.set_ylabel(y, color="#a3b0c2")',
  '    elif kind == "hist":',
  '        col = y if y else data.columns[0]',
  '        ax.hist(data[col].dropna(), bins=kw.get("bins",30), color=color or _C[0], edgecolor="#2a3650", alpha=0.85)',
  '        ax.set_xlabel(col, color="#a3b0c2")',
  '    elif kind == "pie":',
  '        vals = data[y] if y else data.iloc[:,0]',
  '        labs = data[x] if x else data.index',
  '        ax.pie(vals, labels=labs, colors=_C[:len(vals)], textprops={"color":"#eaf0f7"}, wedgeprops={"edgecolor":"#2a3650"})',
  '        fig.patch.set_facecolor("#0d1320")',
  '        if title: ax.set_title(title, color="#eaf0f7", fontsize=13)',
  '        plt.tight_layout(); plt.show(); return',
  '    if x and kind not in ("scatter",): ax.set_xlabel(x, color="#a3b0c2")',
  '    _dark(ax, fig, title)',
  '    plt.tight_layout(); plt.show()',
  '',
  '# ── display() ──────────────────────────────────────────',
  'def display(obj):',
  '    """Pretty-print a DataFrame or Series as HTML table."""',
  '    if isinstance(obj, (pd.DataFrame, pd.Series)):',
  "        print(obj.to_html(classes='sandbox-df', border=0, max_rows=100))",
  '    else:',
  '        print(repr(obj))',
  '',
  '# ── Finnhub helpers (require await) ────────────────────',
  '# _BASE_URL is injected from JS before this code runs',
  '',
  'async def get_quote(symbol):',
  '    """Fetch real-time quote → DataFrame with price, change, change_pct, high, low"""',
  '    import pyodide.http as _ph',
  '    r = await _ph.pyfetch(f"{_BASE_URL}/api/finnhub/quote?symbol={symbol.upper()}")',
  '    d = await r.json()',
  '    if hasattr(d, "to_py"): d = d.to_py()',
  '    return pd.DataFrame([{',
  '        "symbol": symbol.upper(), "price": d["c"], "change": d["d"],',
  '        "change_pct": d["dp"], "high": d["h"], "low": d["l"],',
  '        "open": d["o"], "prev_close": d["pc"]',
  '    }])',
  '',
  'async def get_candles(symbol, days=90, resolution="D"):',
  '    """Fetch OHLCV candles → DataFrame indexed by date.',
  '    resolution: 1 5 15 30 60 D W M"""',
  '    import pyodide.http as _ph, time as _t',
  '    to  = int(_t.time())',
  '    frm = to - int(days) * 86400',
  '    url = (f"{_BASE_URL}/api/finnhub/stock/candle"',
  '           f"?symbol={symbol.upper()}&resolution={resolution}"',
  '           f"&from={frm}&to={to}")',
  '    r   = await _ph.pyfetch(url)',
  '    raw = await r.json()',
  '    if hasattr(raw, "to_py"): raw = raw.to_py()',
  '    if raw.get("s") != "ok" or not raw.get("t"):',
  '        _hint = " (intraday resolutions only work during US market hours Mon-Fri 9:30-16:00 ET)" if resolution not in ("D","W","M") else ""',
  '        raise ValueError(f"No data returned for {symbol!r} at resolution={resolution!r}.{_hint}")',
  '    return pd.DataFrame({',
  '        "open": raw["o"], "high": raw["h"], "low": raw["l"],',
  '        "close": raw["c"], "volume": raw["v"]',
  '    }, index=pd.to_datetime(raw["t"], unit="s"))',
  '',
  'async def compare(*symbols, days=90, resolution="D", normalize=True):',
  '    """Fetch close prices for multiple symbols into one DataFrame.',
  '    normalize=True → returns % return from first data point."""',
  '    frames = {}',
  '    for s in symbols:',
  '        df = await get_candles(s, days=days, resolution=resolution)',
  '        frames[s.upper()] = df["close"]',
  '    result = pd.DataFrame(frames).dropna()',
  '    if result.empty:',
  '        raise ValueError("No overlapping trading days found for the selected symbols and period. Try a longer period or check the symbols.")',
  '    if normalize:',
  '        result = (result / result.iloc[0] - 1) * 100',
  '    return result',
].join('\n')

const RESET_PY = [
  'import sys, io',
  'sys.stdout = io.StringIO()',
  'sys.stderr = io.StringIO()',
  '_figs.clear()',
].join('\n')

function makeWorkerSrc(): string {
  return `
importScripts('${CDN}pyodide.js');
var _py = null;
var _baseUrl = '';

async function init(baseUrl) {
  _baseUrl = baseUrl || '';
  self.postMessage({type:'status', text:'Downloading Pyodide (~30 MB)...'});
  _py = await loadPyodide({ indexURL: '${CDN}' });
  self.postMessage({type:'status', text:'Installing pandas, numpy, matplotlib...'});
  await _py.loadPackage(['pandas','numpy','matplotlib'], {
    messageCallback: function(m){ self.postMessage({type:'status', text: m}); }
  });
  _py.globals.set('_BASE_URL', _baseUrl);
  _py.runPython(${JSON.stringify(INIT_PY)});
  self.postMessage({type:'ready'});
}

self.onmessage = async function(e) {
  var msg = e.data;
  if (msg.type === 'init') {
    try { await init(msg.baseUrl); }
    catch(err) { self.postMessage({type:'error', error: String(err)}); }
    return;
  }
  if (msg.type === 'run') {
    if (!_py) { self.postMessage({type:'error', error:'Pyodide not ready.'}); return; }
    try {
      _py.runPython(${JSON.stringify(RESET_PY)});
      await _py.runPythonAsync(msg.code);
      var stdout = _py.runPython('sys.stdout.getvalue()');
      var stderr = _py.runPython('sys.stderr.getvalue()');
      var figs   = JSON.parse(_py.runPython('_json.dumps(_figs)'));
      self.postMessage({type:'result', stdout, stderr, figures: figs});
    } catch(err) {
      self.postMessage({type:'error', error: String(err)});
    }
  }
};
`
}

export type PyodideStatus = 'idle' | 'loading' | 'ready' | 'running' | 'error'

export interface RunResult {
  stdout: string
  stderr: string
  figures: string[]
}

export function usePyodideWorker() {
  const workerRef = useRef<Worker | null>(null)
  const [status, setStatus] = useState<PyodideStatus>('idle')
  const [statusText, setStatusText] = useState('')
  const [result, setResult] = useState<RunResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const blob = new Blob([makeWorkerSrc()], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    const worker = new Worker(url)
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data
      if (msg.type === 'status') { setStatus('loading'); setStatusText(msg.text) }
      else if (msg.type === 'ready') { setStatus('ready'); setStatusText('') }
      else if (msg.type === 'result') { setStatus('ready'); setResult(msg); setError(null) }
      else if (msg.type === 'error') { setStatus('error'); setError(msg.error) }
    }
    worker.onerror = (e: ErrorEvent) => { setStatus('error'); setError(e.message) }

    setStatus('loading')
    worker.postMessage({ type: 'init', baseUrl: window.location.origin })

    return () => { worker.terminate(); URL.revokeObjectURL(url) }
  }, [])

  const run = useCallback(
    (code: string) => {
      if (!workerRef.current || (status !== 'ready' && status !== 'error')) return
      setStatus('running')
      setResult(null)
      setError(null)
      workerRef.current.postMessage({ type: 'run', code })
    },
    [status],
  )

  return { status, statusText, result, error, run }
}
