import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function AppShell() {
  return (
    <div className="flex flex-col h-screen app-bg text-slate-100">
      <Navbar />
      <main className="flex-1 overflow-auto min-h-0">
        <Outlet />
      </main>
    </div>
  )
}
