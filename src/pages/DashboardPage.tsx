import { Link } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import { useMarketNews } from '../hooks/finnhub/useMarketNews'
import { TrendingCard } from '../components/stock/TrendingCard'
import { NewsFeed } from '../components/news/NewsFeed'
import { NewsTicker } from '../components/ui/NewsTicker'
import { PageContainer } from '../components/layout/PageContainer'
import { Spinner } from '../components/ui/Spinner'

const TRENDING_SYMBOLS = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'AMZN', 'NVDA', 'META', 'BRK.B']

export function DashboardPage() {
  const { data: news, isLoading: newsLoading } = useMarketNews('general')

  return (
    <PageContainer>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
          <span className="text-gradient-brand">FinGlobe</span>
        </h1>
        <p className="text-slate-400 text-lg">Real-time market data, global news, and geographic market intelligence.</p>
      </div>

      {/* Ticker */}
      {news && !newsLoading && (
        <div className="mb-6">
          <NewsTicker items={news} />
        </div>
      )}

      {/* Trending */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">Trending Stocks</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TRENDING_SYMBOLS.map((s) => (
            <TrendingCard key={s} symbol={s} />
          ))}
        </div>
      </section>

      {/* News + CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* News feed */}
        <section className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper size={16} className="text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-200">Market News</h2>
          </div>
          {newsLoading && <div className="flex justify-center py-8"><Spinner /></div>}
          {news && <NewsFeed items={news.slice(0, 8)} />}
        </section>

        {/* Sidebar CTAs */}
        <aside className="flex flex-col gap-4">
          <Link
            to="/news"
            className="block bg-surface-card border border-surface-border rounded-xl p-6 shadow-card hover:border-brand-600 hover:shadow-glow-sm transition-all group"
          >
            <Newspaper size={28} className="text-slate-400 mb-3 group-hover:text-brand-300 transition-colors" />
            <h3 className="font-bold text-slate-100 mb-1">All News</h3>
            <p className="text-sm text-slate-400">Browse all categories: Forex, Crypto, M&A, General.</p>
          </Link>
        </aside>
      </div>
    </PageContainer>
  )
}
