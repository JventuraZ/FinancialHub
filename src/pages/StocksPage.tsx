import { useParams, useNavigate, Link } from 'react-router-dom'
import { Building2, ChevronRight } from 'lucide-react'
import { SymbolSearch } from '../components/stock/SymbolSearch'
import { QuoteCard } from '../components/stock/QuoteCard'
import { ChartContainer } from '../components/stock/ChartContainer'
import { PageContainer } from '../components/layout/PageContainer'
import { EmptyState } from '../components/ui/EmptyState'

const POPULAR = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC']

export function StocksPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const navigate = useNavigate()

  return (
    <PageContainer>
      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <SymbolSearch onSelect={(s) => navigate(`/stocks/${s}`)} />
      </div>

      {!symbol ? (
        <div>
          <p className="text-slate-400 text-sm mb-4">Popular symbols:</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {POPULAR.map((s) => (
              <button
                key={s}
                onClick={() => navigate(`/stocks/${s}`)}
                className="px-3 py-1.5 bg-surface-card border border-surface-border rounded-lg text-sm font-semibold text-slate-300 hover:border-brand-500 hover:text-brand-300 hover:shadow-glow-sm transition-all"
              >
                {s}
              </button>
            ))}
          </div>
          <EmptyState
            title="Search for a stock"
            description="Type a ticker symbol or company name above to view real-time quotes and charts."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Stocks</span>
            <ChevronRight size={14} />
            <span className="text-slate-300 font-semibold">{symbol.toUpperCase()}</span>
          </div>

          <QuoteCard symbol={symbol.toUpperCase()} />
          <ChartContainer symbol={symbol.toUpperCase()} />

          {/* Link to company */}
          <Link
            to={`/company/${symbol.toUpperCase()}`}
            className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
          >
            <Building2 size={14} />
            View company profile →
          </Link>
        </div>
      )}
    </PageContainer>
  )
}
