import { useNavigate } from 'react-router';
import Layout from '../../Layout';
import './Menu.css';

const cargo = () => localStorage.getItem('cargo');

const OPCOES = [
  {
    label: 'Dashboard',
    desc:  'Visão geral e indicadores do sistema',
    path:  '/dashboard',
    color: '#1d4ed8',
    bg:    '#eff6ff',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H14v-5h-4v5H4a1 1 0 01-1-1V9.5z"/>
      </svg>
    ),
  },
  {
    label: 'Famílias',
    desc:  'Consultar e gerenciar famílias cadastradas',
    path:  '/familias',
    color: '#16a34a',
    bg:    '#f0fdf4',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Novo Cadastro',
    desc:  'Registrar uma nova família no sistema',
    path:  '/novo-cadastro',
    color: '#0891b2',
    bg:    '#ecfeff',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
  },
  {
    label: 'Atendimentos',
    desc:  'Histórico de atendimentos realizados',
    path:  '/atendimentos',
    color: '#7c3aed',
    bg:    '#faf5ff',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    ),
  },
  {
    label: 'Agenda',
    desc:  'Agendamentos e compromissos',
    path:  '/agenda',
    color: '#ea580c',
    bg:    '#fff7ed',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8"  y1="2" x2="8"  y2="6"/>
        <line x1="3"  y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label:     'Painel Admin',
    desc:      'Gerenciar usuários e configurações',
    path:      '/painel-admin',
    color:     '#dc2626',
    bg:        '#fff1f2',
    adminOnly: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3"  y="3"  width="7" height="7" rx="1"/>
        <rect x="14" y="3"  width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
        <rect x="3"  y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
];

const Menu = () => {
  const navigate = useNavigate();
  const isAdmin  = cargo() === 'ADMIN';

  const visiveis = OPCOES.filter(op => !op.adminOnly || isAdmin);

  return (
    <Layout>
      <div className="menu-header">
        <h1 className="menu-title">Menu</h1>
        <p className="menu-subtitle">Selecione uma seção para começar a trabalhar.</p>
      </div>

      <div className="menu-grid">
        {visiveis.map(op => (
          <button
            key={op.path}
            className="menu-card"
            style={{ '--card-color': op.color, '--card-bg': op.bg }}
            onClick={() => navigate(op.path)}
          >
            <div className="menu-card-icon">
              {op.icon}
            </div>
            <div className="menu-card-body">
              <div className="menu-card-label">{op.label}</div>
              <div className="menu-card-desc">{op.desc}</div>
            </div>
            <svg className="menu-card-arrow" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        ))}
      </div>
    </Layout>
  );
};

export default Menu;
