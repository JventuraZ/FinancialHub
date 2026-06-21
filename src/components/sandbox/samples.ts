export interface Sample {
  label: string
  group: 'live' | 'mock'
  code: string
}

// ── Live (Finnhub) ────────────────────────────────────────────────────────────

const stockPrice: Sample = {
  label: 'Stock Price Chart',
  group: 'live',
  code: [
    '# Real AAPL data — last 90 trading days',
    'df = await get_candles("AAPL", days=90)',
    '',
    '# 20-day moving average',
    "df['MA20'] = df['close'].rolling(20).mean()",
    '',
    '# Render both lines',
    "chart(df, y=['close','MA20'], title='AAPL — Close & MA20')",
    '',
    '# Table: last 5 rows',
    "display(df.tail(5).round(2))",
  ].join('\n'),
}

const compareStocks: Sample = {
  label: 'Compare Stocks',
  group: 'live',
  code: [
    '# Normalized % return from first day (compare=True by default)',
    'df = await compare("AAPL", "MSFT", "GOOGL", "NVDA", days=120)',
    '',
    "chart(df, title='Normalized Return — last 120 days (%)')",
    "display(df.tail(5).round(2))",
  ].join('\n'),
}

const liveQuotes: Sample = {
  label: 'Live Quotes',
  group: 'live',
  code: [
    'import pandas as pd',
    '',
    'symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA"]',
    '',
    'rows = []',
    'for s in symbols:',
    '    q = await get_quote(s)',
    '    rows.append(q)',
    '',
    'quotes = pd.concat(rows, ignore_index=True)',
    "quotes = quotes.sort_values('change_pct', ascending=False)",
    '',
    "display(quotes[['symbol','price','change','change_pct','high','low']].round(2))",
    '',
    "chart(quotes, x='symbol', y='change_pct', kind='bar', title='Daily Change %')",
  ].join('\n'),
}

const volumeAnalysis: Sample = {
  label: 'Volume Analysis',
  group: 'live',
  code: [
    '# Fetch 60 days of candle data',
    'df = await get_candles("TSLA", days=60)',
    '',
    '# Volume rolling average',
    "df['vol_ma10'] = df['volume'].rolling(10).mean()",
    '',
    '# Price chart',
    "chart(df, y='close', title='TSLA — Close Price')",
    '',
    '# Volume chart',
    "chart(df, y='volume', kind='bar', title='TSLA — Daily Volume')",
  ].join('\n'),
}

const bollinger: Sample = {
  label: 'Bollinger Bands',
  group: 'live',
  code: [
    'import matplotlib.pyplot as plt',
    '',
    'df = await get_candles("MSFT", days=120)',
    "df['MA20']     = df['close'].rolling(20).mean()",
    "df['BB_upper'] = df['MA20'] + 2 * df['close'].rolling(20).std()",
    "df['BB_lower'] = df['MA20'] - 2 * df['close'].rolling(20).std()",
    '',
    'fig, ax = plt.subplots(figsize=(12, 5))',
    "ax.plot(df.index, df['close'],    color='#33c6dc', lw=1,   label='MSFT')",
    "ax.plot(df.index, df['MA20'],     color='#ffc857', lw=1.5, label='MA20')",
    "ax.fill_between(df.index, df['BB_upper'], df['BB_lower'],",
    "                alpha=0.12, color='#33c6dc', label='Bollinger')",
    "_dark(ax, fig, 'MSFT — MA20 & Bollinger Bands')",
    'plt.tight_layout()',
    'plt.show()',
  ].join('\n'),
}

// ── Mock (no API needed) ──────────────────────────────────────────────────────

const portfolio: Sample = {
  label: 'Portfolio Table',
  group: 'mock',
  code: [
    'import pandas as pd',
    '',
    'data = {',
    "    'Symbol':  ['AAPL','MSFT','GOOGL','AMZN','META','TSLA','NVDA'],",
    "    'Sector':  ['Tech','Tech','Tech','Consumer','Tech','Auto','Tech'],",
    "    'Price':   [185.5, 415.3, 176.8, 188.2, 514.0, 248.5, 875.4],",
    "    'Chg%':   [1.2, -0.8, 2.1, -1.5, 0.9, -3.2, 4.5],",
    "    'Shares':  [100, 50, 30, 25, 40, 80, 20],",
    '}',
    'df = pd.DataFrame(data)',
    "df['Value']  = (df['Price'] * df['Shares']).round(2)",
    "df['PnL']    = (df['Value'] * df['Chg%'] / 100).round(2)",
    '',
    "print(f\"Total Value : ${df['Value'].sum():,.2f}\")",
    "print(f\"Total P&L   : ${df['PnL'].sum():,.2f}\")",
    '',
    "display(df.sort_values('Value', ascending=False))",
    '',
    "chart(df, x='Symbol', y='Value', kind='bar', title='Portfolio Value by Stock')",
  ].join('\n'),
}

const sectorReturns: Sample = {
  label: 'Sector Returns',
  group: 'mock',
  code: [
    'import pandas as pd',
    '',
    'data = {',
    "    'Sector': ['Technology','Healthcare','Finance','Energy',",
    "               'Consumer Disc.','Materials','Utilities','Real Estate'],",
    "    'YTD':   [28.4, 12.1, 18.7, -3.2, 8.9, 5.3, -6.1, -9.4],",
    '}',
    "df = pd.DataFrame(data).sort_values('YTD')",
    '',
    "chart(df, x='Sector', y='YTD', kind='barh', title='YTD Returns by Sector (%)')",
    'display(df)',
  ].join('\n'),
}

const correlationMatrix: Sample = {
  label: 'Correlation Matrix',
  group: 'mock',
  code: [
    'import pandas as pd, numpy as np, matplotlib.pyplot as plt',
    '',
    'np.random.seed(7)',
    "symbols = ['AAPL','MSFT','GOOGL','AMZN','META','TSLA','NVDA','JPM']",
    'base = np.random.randn(252)',
    'returns = {s: base * np.random.uniform(0.5,0.9) + np.random.randn(252)*0.4',
    '           for s in symbols}',
    'corr = pd.DataFrame(returns).corr()',
    '',
    'display(corr.round(2))',
    '',
    'fig, ax = plt.subplots(figsize=(8, 7))',
    "im = ax.imshow(corr.values, cmap='RdYlGn', vmin=-1, vmax=1)",
    'ax.set_xticks(range(len(symbols))); ax.set_yticks(range(len(symbols)))',
    "ax.set_xticklabels(symbols, color='#cbd5e1', rotation=45, ha='right')",
    "ax.set_yticklabels(symbols, color='#cbd5e1')",
    'for i in range(len(symbols)):',
    '    for j in range(len(symbols)):',
    '        v = corr.values[i,j]',
    '        ax.text(j, i, f"{v:.2f}", ha="center", va="center", fontsize=8,',
    '                color="white" if abs(v)>0.7 else "black", fontweight="bold")',
    'plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)',
    "fig.patch.set_facecolor('#0d1320'); ax.set_facecolor('#161e2e')",
    "ax.set_title('Return Correlation Matrix', color='#eaf0f7', fontsize=13)",
    'plt.tight_layout(); plt.show()',
  ].join('\n'),
}

const riskReturn: Sample = {
  label: 'Risk / Return',
  group: 'mock',
  code: [
    'import pandas as pd, numpy as np',
    '',
    'np.random.seed(3)',
    "symbols = ['AAPL','MSFT','GOOGL','AMZN','META','TSLA','NVDA',",
    "           'JPM','BAC','GS','JNJ','PFE','XOM','CVX','WMT','KO']",
    'returns = np.random.normal(0.15, 0.12, len(symbols))',
    'risks   = np.abs(returns * np.random.uniform(0.8, 2.5, len(symbols))) + 0.05',
    "sectors = (['Tech']*7 + ['Finance']*3 + ['Health']*2 + ['Energy']*2 + ['Consumer']*2)",
    '',
    "df = pd.DataFrame({'Symbol':symbols,'Return':returns,'Risk':risks,'Sector':sectors})",
    '',
    '# One scatter per sector (matplotlib directly for per-group colors)',
    'import matplotlib.pyplot as plt',
    "cmap = {'Tech':'#33c6dc','Finance':'#ffc857','Health':'#2bd9a0','Energy':'#ff6b7a','Consumer':'#a78bfa'}",
    'fig, ax = plt.subplots(figsize=(10, 6))',
    'for sector, grp in df.groupby("Sector"):',
    '    ax.scatter(grp["Risk"], grp["Return"], color=cmap[sector], s=90, label=sector, edgecolors="#2a3650")',
    '    for _, row in grp.iterrows():',
    '        ax.annotate(row["Symbol"],(row["Risk"],row["Return"]),xytext=(4,4),textcoords="offset points",fontsize=7.5,color="#a3b0c2")',
    "ax.axhline(0, color='#3a4762', lw=0.8, ls='--')",
    "ax.set_xlabel('Risk', color='#a3b0c2'); ax.set_ylabel('Return', color='#a3b0c2')",
    "_dark(ax, fig, 'Risk / Return by Sector')",
    'plt.tight_layout(); plt.show()',
  ].join('\n'),
}

export const SAMPLES: Sample[] = [
  stockPrice,
  compareStocks,
  liveQuotes,
  volumeAnalysis,
  bollinger,
  portfolio,
  sectorReturns,
  correlationMatrix,
  riskReturn,
]
