import { useState } from 'react'
import type { ReactNode } from 'react'
import { CalendarDays, PanelLeftClose, PanelLeftOpen, UserRound } from 'lucide-react'
import { useMediaQuery } from 'react-responsive'
import './Layout.css'

type LayoutProps = {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  const isMobile = useMediaQuery({ maxWidth: 640 })
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean | null>(null)
  const isExpanded = sidebarExpanded ?? !isMobile
  const toggleLabel = isExpanded ? 'Collapse sidebar' : 'Expand sidebar'

  return (
    <div className="app-layout" data-sidebar-expanded={isExpanded}>
      <a className="app-skip-link" href="#main-content">Skip to main content</a>
      <header className="app-header">
        <a className="app-logo" href="/">Calendar-App</a>
        <button
          className="app-icon-button app-profile-button"
          type="button"
          aria-label="Profile (not available yet)"
          title="Profile (not available yet)"
          disabled
        >
          <UserRound size={22} aria-hidden="true" />
        </button>
      </header>

      <aside className="app-sidebar" aria-label="Sidebar">
        <button
          className="app-icon-button app-sidebar-toggle"
          type="button"
          aria-label={toggleLabel}
          title={toggleLabel}
          aria-expanded={isExpanded}
          aria-controls="sidebar-navigation"
          onClick={() => setSidebarExpanded(!isExpanded)}
        >
          {isExpanded
            ? <PanelLeftClose size={22} aria-hidden="true" />
            : <PanelLeftOpen size={22} aria-hidden="true" />}
        </button>
        <nav id="sidebar-navigation" aria-label="Main navigation">
          <a className="app-nav-link" href="/" aria-current="page" aria-label="Calendar" title="Calendar">
            <CalendarDays size={22} aria-hidden="true" />
            <span className="app-nav-label" hidden={!isExpanded}>Calendar</span>
          </a>
        </nav>
      </aside>

      <main className="app-main" id="main-content" tabIndex={-1} aria-label="Page content">
        {children}
      </main>

      <footer className="app-footer">
        <small>&copy; 2026 Calendar-App</small>
      </footer>
    </div>
  )
}

export default Layout
