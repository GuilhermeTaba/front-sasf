import { useEffect, useState } from 'react';
import Layout from '../../Layout';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const buildDonut = (slices, total) => {
  if (!total) return 'conic-gradient(#e2e8f0 0% 100%)';
  let cursor = 0;
  const stops = slices.map(s => {
    const pct = (s.value / total) * 100;
    const stop = `${s.color} ${cursor}% ${cursor + pct}%`;
    cursor += pct;
    return stop;
  });
  return `conic-gradient(${stops.join(', ')})`;
};

const FAIXAS_CONFIG = [
  { key: '0a5Anos',   label: '0-5',   color: '#1d4ed8' },
  { key: '6a14Anos',  label: '6-14',  color: '#3b82f6' },
  { key: '15a17Anos', label: '15-17', color: '#22c55e' },
  { key: '18a29Anos', label: '18-29', color: '#f59e0b' },
  { key: '30a59Anos', label: '30-59', color: '#8b5cf6' },
  { key: '60Mais',    label: '60+',   color: '#93c5fd' },
];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const faixaEtaria = data?.faixaEtaria ?? {};
  const faixaMax = Math.max(...FAIXAS_CONFIG.map(f => faixaEtaria[f.key] ?? 0), 1);

  const beneficiarios = data?.beneficiarios ?? {};
  const totalBeneficios =
    (beneficiarios.bpcDeficiente ?? 0) +
    (beneficiarios.bpcIdoso ?? 0) +
    (beneficiarios.bolsaFamilia ?? 0);

  const statCards = [
    {
      label: 'Famílias atendidas',
      value: data?.familiasAtendidas,
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
      value: data?.composicaoFamiliar,
      accent: 'green',
      iconClass: 'stat-icon--green',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      label: 'Pessoas c/ deficiência',
      value: data?.pessoasComDeficiencia,
      accent: 'blue',
      iconClass: 'stat-icon--blue',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0112 0v2"/>
          <path d="M18 14l2 4h-4"/>
        </svg>
      ),
    },
    {
      label: 'Total de beneficiários',
      value: loading ? null : totalBeneficios,
      accent: 'blue',
      iconClass: 'stat-icon--blue',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 00-4 0v2"/>
        </svg>
      ),
    },
  ];

  return (
    <Layout>
      {/* ── HEADER ── */}
      <div className="dash-header">
        <div>
          <p className="page-section">Geral</p>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-sub">Visão geral da unidade Chico Mendes</p>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="stats-grid">
        {statCards.map((s) => (
          <div key={s.label} className={`stat-card stat-card--${s.accent}`}>
            <div className="stat-card-top">
              <span className="stat-label">{s.label}</span>
              <div className={`stat-icon ${s.iconClass}`}>{s.icon}</div>
            </div>
            <span className="stat-value">{loading ? '—' : (s.value ?? '—')}</span>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="charts-row">

        {/* FAIXA ETÁRIA — barras horizontais */}
        <div className="chart-card chart-bar-card">
          <div className="chart-head">
            <div>
              <h3 className="chart-title">Faixa etária</h3>
              <p className="chart-sub">distribuição das pessoas atendidas</p>
            </div>
          </div>
          <div className="faixa-list" style={{ marginTop: '1rem' }}>
            {FAIXAS_CONFIG.map(f => {
              const val = faixaEtaria[f.key] ?? 0;
              const barWidth = faixaMax > 0 ? (val / faixaMax) * 100 : 0;
              return (
                <div key={f.key} className="faixa-row">
                  <span className="faixa-label">{f.label}</span>
                  <div className="faixa-track">
                    <div className="faixa-fill" style={{ width: `${barWidth}%`, background: f.color }} />
                  </div>
                  <span className="faixa-val">{loading ? '—' : val}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="charts-right">

          {/* DONUT — beneficiários */}
          <div className="chart-card donut-card">
            <h3 className="chart-title">Beneficiários</h3>
            <p className="chart-sub">{loading ? '—' : totalBeneficios} benefícios ativos</p>
            <div className="donut-row">
              <div className="donut-wrap">
                <div
                  className="donut-ring"
                  style={{ background: buildDonut([
                    { value: beneficiarios.bpcDeficiente ?? 0, color: '#1d4ed8' },
                    { value: beneficiarios.bpcIdoso ?? 0,      color: '#3b82f6' },
                    { value: beneficiarios.bolsaFamilia ?? 0,  color: '#22c55e' },
                  ], totalBeneficios) }}
                />
                <div className="donut-center-text">
                  <span className="dc-number">{loading ? '—' : totalBeneficios}</span>
                  <span className="dc-label">total</span>
                </div>
              </div>
              <div className="donut-legend">
                {[
                  { label: 'BPC Deficiente', value: beneficiarios.bpcDeficiente ?? 0, color: '#1d4ed8' },
                  { label: 'BPC Idoso',      value: beneficiarios.bpcIdoso ?? 0,      color: '#3b82f6' },
                  { label: 'Bolsa Família',  value: beneficiarios.bolsaFamilia ?? 0,  color: '#22c55e' },
                ].map(b => {
                  const pct = totalBeneficios > 0 ? Math.round((b.value / totalBeneficios) * 100) : 0;
                  return (
                    <div key={b.label} className="legend-item">
                      <span className="legend-dot" style={{ background: b.color }} />
                      <span className="legend-label">{b.label}</span>
                      <span className="legend-pct">{loading ? '—' : `${pct}%`}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>


</div>
      </div>
    </Layout>
  );
};

export default Dashboard;
