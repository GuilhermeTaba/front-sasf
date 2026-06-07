import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import sasfLogo from '../assets/sasf_logo.jpg'
import './Layout.css';

/* ── SVG Icon helper ── */
const Icon = ({ children, viewBox = '0 0 24 24' }) => (
  <svg width="17" height="17" viewBox={viewBox} fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const navItems = [
  {
    label: 'Menu', path: '/menu',
    icon: <Icon><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>,
  },
  {
    label: 'Dashboard', path: '/dashboard',
    icon: <Icon><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H14v-5h-4v5H4a1 1 0 01-1-1V9.5z"/></Icon>,
  },
  {
    label: 'Famílias', path: '/familias',
    icon: <Icon><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></Icon>,
  },
  {
    label: 'Novo cadastro', path: '/novo-cadastro',
    icon: <Icon><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></Icon>,
  },
  {
    label: 'Atendimentos', path: '/atendimentos',
    icon: <Icon><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></Icon>,
  },
  {
    label: 'Agenda', path: '/agenda',
    icon: <Icon><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Icon>,
  },
  {
    label: 'Painel de admin', path: '/painel-admin', adminOnly: true,
    icon: <Icon><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></Icon>,
  },
];

const Layout = ({ children }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const cargo = localStorage.getItem("cargo");

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className={`app-layout${collapsed ? ' sidebar-collapsed' : ''}`}>

      {/* ── Overlay móvel ── */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={closeMobile} aria-hidden="true" />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}${mobileOpen ? ' sidebar--open' : ''}`}>

        {/* Brand / Logo */}
        <div className="sidebar-brand">
          <div className="brand-logo-wrap">
            <img src={sasfLogo} alt="SASF" className="brand-logo" />
          </div>

          {/* Toggle — só desktop */}
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              className={`toggle-icon${collapsed ? ' toggle-icon--rotated' : ''}`}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Fechar — só mobile */}
          <button className="sidebar-close-btn" onClick={closeMobile} aria-label="Fechar menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.filter((item) => !item.adminOnly || cargo === "ADMIN").map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link${active ? ' nav-link--active' : ''}`}
                title={collapsed ? item.label : undefined}
                onClick={closeMobile}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    <span className={`nav-dot${active ? ' nav-dot--active' : ''}`} />
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">

          {/* Recolher/Expandir — acima do sair quando collapsed */}
          {collapsed && (
            <button className="sair-btn expand-btn" onClick={() => setCollapsed(c => !c)}
              title="Expandir menu" aria-label="Expandir menu">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          )}

          <button
            className={`sair-btn${collapsed ? ' expand-btn' : ''}`}
            onClick={() => navigate('/')}
            title={collapsed ? 'Sair' : undefined}
            aria-label="Sair"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main-wrapper">
        <header className="topbar">

          {/* Hamburger — só mobile */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Abrir menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

        </header>

        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
