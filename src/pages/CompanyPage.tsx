import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ProfileHeader } from '../components/company/ProfileHeader'
import { MetricsGrid } from '../components/company/MetricsGrid'
import { CompanyNewsFeed } from '../components/company/CompanyNewsFeed'
import { PeerList } from '../components/stock/PeerList'
import { QuoteCard } from '../components/stock/QuoteCard'
import { ChartContainer } from '../components/stock/ChartContainer'
import { Tabs } from '../components/ui/Tabs'
import { PageContainer } from '../components/layout/PageContainer'

const TABS = ['Overview', 'Stock', 'Metrics', 'News']

export function CompanyPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const [tab, setTab] = useState('Overview')

  if (!symbol) return null

  const sym = symbol.toUpperCase()

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link to="/stocks" className="hover:text-slate-300">Stocks</Link>
        <ChevronRight size={14} />
        <span className="text-slate-300 font-semibold">{sym}</span>
      </div>

      <div className="space-y-4">
        <ProfileHeader symbol={sym} />

        <Tabs tabs={TABS} active={tab} onChange={setTab} />

        <div>
          {tab === 'Overview' && <QuoteCard symbol={sym} />}
          {tab === 'Stock' && (
            <div className="space-y-4">
              <QuoteCard symbol={sym} />
              <ChartContainer symbol={sym} />
            </div>
          )}
          {tab === 'Metrics' && <MetricsGrid symbol={sym} />}
          {tab === 'News' && <CompanyNewsFeed symbol={sym} />}
        </div>

        {/* Peers */}
        <div>
          <p className="text-sm font-semibold text-slate-400 mb-2">Peer Companies</p>
          <PeerList symbol={sym} />
        </div>
      </div>
    </PageContainer>
  )
}
