import { useState } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../../Layout';
import './Atendimentos.css';

const ATENDIMENTOS = [
  { id: 'AT-2026-0187', familia: 'Família Oliveira', tecnico: 'Ana Silva',     tipo: 'Visita domiciliar',  data: '12/06/2026', status: 'concluido' },
  { id: 'AT-2026-0186', familia: 'Família Lima',     tecnico: 'Ana Silva',     tipo: 'Acompanhamento',     data: '12/06/2026', status: 'andamento' },
  { id: 'AT-2026-0185', familia: 'Família Souza',    tecnico: 'Carlos Mendes', tipo: 'Entrevista social',  data: '11/06/2026', status: 'concluido' },
  { id: 'AT-2026-0184', familia: 'Família Costa',    tecnico: 'Carlos Mendes', tipo: 'Encaminhamento',     data: '11/06/2026', status: 'pendente'  },
  { id: 'AT-2026-0183', familia: 'Família Pereira',  tecnico: 'Beatriz Rocha', tipo: 'Visita domiciliar',  data: '10/06/2026', status: 'concluido' },
  { id: 'AT-2026-0182', familia: 'Família Almeida',  tecnico: 'Elisa Tavares', tipo: 'Acompanhamento',     data: '10/06/2026', status: 'pendente'  },
  { id: 'AT-2026-0181', familia: 'Família Ribeiro',  tecnico: 'Ana Silva',     tipo: 'Entrevista social',  data: '09/06/2026', status: 'concluido' },
  { id: 'AT-2026-0180', familia: 'Família Mendes',   tecnico: 'Beatriz Rocha', tipo: 'Encaminhamento',     data: '09/06/2026', status: 'andamento' },
];

const STATUS = {
  concluido: { label: 'Concluído',    bg: '#dcfce7', color: '#166534' },
  andamento:  { label: 'Em andamento', bg: '#dbeafe', color: '#1d4ed8' },
  pendente:   { label: 'Pendente',    bg: '#fef3c7', color: '#92400e' },
};

const FILTROS = [
  { key: 'todos',    label: 'Todos' },
  { key: 'concluido',label: 'Concluídos' },
  { key: 'andamento',label: 'Em andamento' },
  { key: 'pendente', label: 'Pendentes' },
];

const statCards = [
  { label: 'Total no mês',  value: 187, delta: 'meta: 200',       deltaClass: 'gray', accent: '#1d4ed8',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    iconBg: '#dbeafe', iconColor: '#2563eb' },
  { label: 'Concluídos',    value: 142, delta: '75,9% do total',  deltaClass: 'green', accent: '#22c55e',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    iconBg: '#dcfce7', iconColor: '#16a34a' },
  { label: 'Em andamento',  value: 31,  delta: '16,6% do total',  deltaClass: 'gray', accent: '#3b82f6',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    iconBg: '#dbeafe', iconColor: '#2563eb' },
  { label: 'Pendentes',     value: 14,  delta: 'requer atenção',  deltaClass: 'red', accent: '#f59e0b',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    iconBg: '#fef3c7', iconColor: '#d97706' },
];

const Atendimentos = () => {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('todos');

  const lista = filtro === 'todos' ? ATENDIMENTOS : ATENDIMENTOS.filter(a => a.status === filtro);

  return (
    <Layout>
      {/* ── HEADER ── */}
      <div className="page-header">
        <div>
          <p className="page-section">Registros</p>
          <h1 className="page-title">Atendimentos</h1>
          <p className="page-sub">Unidade Chico Mendes · junho de 2026</p>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        {statCards.map(s => (
          <div key={s.label} className="stat-card" style={{ borderTopColor: s.accent }}>
            <div className="stat-card-top">
              <span className="stat-label">{s.label}</span>
              <div className="stat-icon" style={{ background: s.iconBg, color: s.iconColor }}>{s.icon}</div>
            </div>
            <span className="stat-value">{s.value}</span>
            <span className={`stat-delta ${s.deltaClass}`}>{s.delta}</span>
          </div>
        ))}
      </div>

      {/* ── TABLE ── */}
      <div className="table-card">

        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="at-filter-group">
            {FILTROS.map(f => (
              <button
                key={f.key}
                className={`at-filter-btn${filtro === f.key ? ' active' : ''}`}
                onClick={() => setFiltro(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="toolbar-spacer" />
          <button className="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Exportar
          </button>
        </div>

        <div className="at-table-wrap">
        <table className="at-table">
          <thead>
            <tr>
              <th>Nº atendimento</th>
              <th>Família</th>
              <th>Técnico</th>
              <th>Tipo</th>
              <th>Data</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(a => (
              <tr key={a.id} className="data-row">
                <td><span className="at-id">{a.id}</span></td>
                <td><span className="at-familia">{a.familia}</span></td>
                <td><span className="tecnico-badge">{a.tecnico}</span></td>
                <td className="muted">{a.tipo}</td>
                <td className="muted">{a.data}</td>
                <td>
                  <span
                    className="status-chip"
                    style={{ background: STATUS[a.status].bg, color: STATUS[a.status].color }}
                  >
                    {STATUS[a.status].label}
                  </span>
                </td>
                <td>
                  <button className="action-edit">Ver detalhes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">Exibindo {lista.length} de 187 atendimentos</span>
          <div className="pagination-btns">
            <button className="page-btn disabled">‹</button>
            <button className="page-btn page-btn--active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="page-ellipsis">...</span>
            <button className="page-btn">24</button>
            <button className="page-btn">›</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Atendimentos;
