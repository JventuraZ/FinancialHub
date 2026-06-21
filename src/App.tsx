import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { StocksPage } from './pages/StocksPage'
import { CompanyPage } from './pages/CompanyPage'
import { NewsPage } from './pages/NewsPage'
import { SandboxPage } from './pages/SandboxPage'
import { GlobePage } from './pages/GlobePage'
import { CountriesApiPage } from './pages/CountriesApiPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="stocks" element={<StocksPage />} />
          <Route path="stocks/:symbol" element={<StocksPage />} />
          <Route path="company/:symbol" element={<CompanyPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="sandbox" element={<SandboxPage />} />
          <Route path="globe" element={<GlobePage />} />
          <Route path="countries-api" element={<CountriesApiPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
