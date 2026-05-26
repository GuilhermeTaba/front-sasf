import { useNavigate } from 'react-router';
import Layout from '../components/Layout';
import './Dashboard.css';

const barData = [
  { month: 'Jan', value: 120 },
  { month: 'Fev', value: 142 },
  { month: 'Mar', value: 158 },
  { month: 'Abr', value: 168 },
  { month: 'Mai', value: 176 },
  { month: 'Jun', value: 187 },
];
const BAR_MAX = 220;

const faixas = [
  { label: '0-12',  value: 32, color: '#1d4ed8' },
  { label: '13-17', value: 22, color: '#3b82f6' },
  { label: '18-29', value: 28, color: '#22c55e' },
  { label: '30-59', value: 18, color: '#3b82f6' },
  { label: '60+',   value: 8,  color: '#93c5fd' },
];

const statCards = [
  {
    label: 'Famílias atendidas',
    value: '248',
    delta: '↑ +4 este mês',
    deltaClass: 'green',
    accent: 'green',
    iconClass: 'stat-icon--green',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Pessoas cadastradas',
    value: '1.024',
    delta: '↑ +22 este mês',
    deltaClass: 'green',
    accent: 'green',
    iconClass: 'stat-icon--green',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    label: 'Atendimentos no mês',
    value: '187',
    delta: 'meta: 200',
    deltaClass: 'gray',
    accent: 'blue',
    iconClass: 'stat-icon--blue',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    ),
  },
  {
    label: 'Documentos pendentes',
    value: '14',
    delta: 'requer ação',
    deltaClass: 'red',
    accent: 'red',
    iconClass: 'stat-icon--red',
    valueClass: 'red',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  return (
  <Layout>
    {/* ── HEADER ── */}
    <div className="dash-header">
      <div>
        <p className="page-section">Geral</p>
        <h1 className="dash-title">Dashboard</h1>
        <p className="dash-sub">Visão geral da unidade Chico Mendes — junho de 2026</p>
      </div>
      <button className="btn-primary" onClick={() => navigate('/novo-atendimento')}>+ Novo atendimento</button>
    </div>

    {/* ── STAT CARDS ── */}
    <div className="stats-grid">
      {statCards.map((s) => (
        <div key={s.label} className={`stat-card stat-card--${s.accent}`}>
          <div className="stat-card-top">
            <span className="stat-label">{s.label}</span>
            <div className={`stat-icon ${s.iconClass}`}>{s.icon}</div>
          </div>
          <span className={`stat-value${s.valueClass ? ` ${s.valueClass}` : ''}`}>{s.value}</span>
          <span className={`stat-delta ${s.deltaClass}`}>{s.delta}</span>
        </div>
      ))}
    </div>

    {/* ── CHARTS ROW ── */}
    <div className="charts-row">

      {/* BAR CHART */}
      <div className="chart-card chart-bar-card">
        <div className="chart-head">
          <div>
            <h3 className="chart-title">Atendimentos por mês</h3>
            <p className="chart-sub">últimos 6 meses · 2026</p>
          </div>
          <span className="chart-badge">187 total · <span className="green">+12% vs mês anterior</span></span>
        </div>

        <div className="bar-chart">
          <div className="bar-y-axis">
            {[220, 165, 110, 55, 0].map(v => (
              <span key={v}>{v}</span>
            ))}
          </div>
          <div className="bars-area">
            <div className="grid-lines">
              {[0,1,2,3,4].map(i => <div key={i} className="grid-line" />)}
            </div>
            {barData.map((d) => {
              const heightPct = (d.value / BAR_MAX) * 100;
              return (
                <div key={d.month} className="bar-col">
                  <span className="bar-top-label">{d.value}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ height: `${heightPct}%` }} />
                  </div>
                  <span className="bar-month">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="charts-right">

        {/* DONUT */}
        <div className="chart-card donut-card">
          <h3 className="chart-title">Perfil por gênero</h3>
          <p className="chart-sub">1.024 pessoas</p>
          <div className="donut-row">
            <div className="donut-wrap">
              <div className="donut-ring" />
              <div className="donut-center-text">
                <span className="dc-number">1.024</span>
                <span className="dc-label">pessoas</span>
              </div>
            </div>
            <div className="donut-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#1d4ed8' }} />
                <span className="legend-label">Feminino</span>
                <span className="legend-pct">58%</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#60a5fa' }} />
                <span className="legend-label">Masculino</span>
                <span className="legend-pct">39%</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#f59e0b' }} />
                <span className="legend-label">Outros</span>
                <span className="legend-pct">3%</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAIXA ETÁRIA */}
        <div className="chart-card faixa-card">
          <h3 className="chart-title">Faixa etária</h3>
          <p className="chart-sub">distribuição das pessoas atendidas</p>
          <div className="faixa-list">
            {faixas.map(f => (
              <div key={f.label} className="faixa-row">
                <span className="faixa-label">{f.label}</span>
                <div className="faixa-track">
                  <div
                    className="faixa-fill"
                    style={{ width: `${f.value * 3}%`, background: f.color }}
                  />
                </div>
                <span className="faixa-val">{f.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  </Layout>
  );
};

export default Dashboard;
