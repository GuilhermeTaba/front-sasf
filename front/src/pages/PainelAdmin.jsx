import { useState } from 'react';
import Layout from '../components/Layout';
import './PainelAdmin.css';

/* ── Usuários ativos ── */
const USUARIOS = [
  { id: '#1000', nome: 'Ana Silva',      email: 'ana.silva@sasf.org.br',      tipo: 'Técnica',    acesso: 'hoje, 09:12',  inicial: 'A', color: '#1d4ed8' },
  { id: '#1001', nome: 'Carlos Mendes',  email: 'carlos.mendes@sasf.org.br',  tipo: 'Admin',      acesso: 'hoje, 07:40',  inicial: 'C', color: '#f59e0b' },
  { id: '#1002', nome: 'Beatriz Rocha',  email: 'beatriz.rocha@sasf.org.br',  tipo: 'Técnica',    acesso: 'ontem, 17:55', inicial: 'B', color: '#3b82f6' },
  { id: '#1003', nome: 'Diego Farias',   email: 'diego.farias@sasf.org.br',   tipo: 'Orientador', acesso: 'ontem, 18:10', inicial: 'D', color: '#8b5cf6' },
  { id: '#1004', nome: 'Elisa Tavares',  email: 'elisa.tavares@sasf.org.br',  tipo: 'Técnica',    acesso: '10/06, 09:22', inicial: 'E', color: '#06b6d4' },
  { id: '#1005', nome: 'Fábio Nunes',    email: 'fabio.nunes@sasf.org.br',    tipo: 'Técnico',    acesso: '02/06, 14:00', inicial: 'F', color: '#22c55e' },
  { id: '#1006', nome: 'Gabriela Lopes', email: 'gabriela.lopes@sasf.org.br', tipo: 'Orientador', acesso: '09/06, 11:30', inicial: 'G', color: '#f97316' },
  { id: '#1007', nome: 'Hugo Almeida',   email: 'hugo.almeida@sasf.org.br',   tipo: 'Admin',      acesso: '11/06, 18:45', inicial: 'H', color: '#ef4444' },
];

/* ── Solicitações de conta (Permissões) ── */
const SOLICITACOES_INICIAL = [
  { id: 's1', nome: 'Mariana Fontes',   email: 'mariana.fontes@sasf.org.br',   cargo: 'Técnica Social',    data: '25/05/2026', inicial: 'M', color: '#8b5cf6' },
  { id: 's2', nome: 'Rafael Teixeira',  email: 'rafael.teixeira@sasf.org.br',  cargo: 'Orientador',        data: '24/05/2026', inicial: 'R', color: '#f97316' },
  { id: 's3', nome: 'Simone Barbosa',   email: 'simone.barbosa@sasf.org.br',   cargo: 'Técnica Social',    data: '23/05/2026', inicial: 'S', color: '#ec4899' },
  { id: 's4', nome: 'Thiago Monteiro',  email: 'thiago.monteiro@sasf.org.br',  cargo: 'Técnico Social',    data: '22/05/2026', inicial: 'T', color: '#0ea5e9' },
  { id: 's5', nome: 'Viviane Castro',   email: 'viviane.castro@sasf.org.br',   cargo: 'Orientador',        data: '20/05/2026', inicial: 'V', color: '#22c55e' },
];

const TIPO_COLOR = {
  'Técnica':    { bg: '#dbeafe', color: '#1d4ed8' },
  'Técnico':    { bg: '#dbeafe', color: '#1d4ed8' },
  'Admin':      { bg: '#fef3c7', color: '#92400e' },
  'Orientador': { bg: '#dcfce7', color: '#166534' },
};

const statCards = [
  { label: 'Total de usuários', value: 18, accent: '#3b82f6', iconBg: '#dbeafe', iconColor: '#2563eb',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
  { label: 'Administradores',   value: 2,  accent: '#f59e0b', iconBg: '#fef3c7', iconColor: '#d97706',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { label: 'Técnicos',          value: 12, accent: '#3b82f6', iconBg: '#dbeafe', iconColor: '#2563eb',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { label: 'Pendentes',         value: 5,  accent: '#ef4444', iconBg: '#fee2e2', iconColor: '#dc2626',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
];

const PainelAdmin = () => {
  const [tab, setTab]           = useState('Usuários');
  const [search, setSearch]     = useState('');
  const [solicit, setSolicit]   = useState(
    SOLICITACOES_INICIAL.map(s => ({ ...s, status: 'pendente' })) // pendente | aprovado | rejeitado
  );

  const usuarios = USUARIOS.filter(u =>
    !search ||
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.tipo.toLowerCase().includes(search.toLowerCase())
  );

  const aprovar  = (id) => setSolicit(s => s.map(x => x.id === id ? { ...x, status: 'aprovado'  } : x));
  const rejeitar = (id) => setSolicit(s => s.map(x => x.id === id ? { ...x, status: 'rejeitado' } : x));

  const pendentes = solicit.filter(s => s.status === 'pendente').length;

  return (
    <Layout>
      {/* ── HEADER ── */}
      <div className="page-header">
        <div>
          <p className="page-section">Administração</p>
          <h1 className="page-title">Painel de admin</h1>
          <p className="page-sub">Gerencie usuários e permissões de acesso ao sistema</p>
        </div>
        {/* botão removido */}
      </div>

      {/* ── STAT CARDS ── */}
      <div className="pa-stats-row">
        {statCards.map(s => (
          <div key={s.label} className="pa-stat-card" style={{ borderTopColor: s.accent }}>
            <div className="stat-card-top">
              <span className="pa-stat-label">{s.label}</span>
              <div className="stat-icon" style={{ background: s.iconBg, color: s.iconColor }}>{s.icon}</div>
            </div>
            <span className="pa-stat-value" style={{ color: s.accent }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div className="tabs">
        {['Usuários', 'Permissões'].map(t => (
          <button
            key={t}
            className={`tab${tab === t ? ' tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'Permissões' && pendentes > 0 && (
              <span className="pa-tab-badge">{pendentes}</span>
            )}
          </button>
        ))}
      </div>

      {/* ════ ABA: USUÁRIOS ════ */}
      {tab === 'Usuários' && (
        <div className="table-card">
          <div className="table-toolbar">
            <div className="toolbar-search">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="#9ca3af" strokeWidth="1.6"/>
                <path d="M13 13l3.5 3.5" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar usuário..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="toolbar-spacer" />
            <button className="btn-secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              Exportar
            </button>
          </div>

          <table className="pa-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>E-mail / login</th>
                <th>Tipo</th>
                <th>Último acesso</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} className="data-row">
                  <td>
                    <div className="pa-user-cell">
                      <div className="pa-avatar" style={{ background: u.color }}>{u.inicial}</div>
                      <div className="pa-user-info">
                        <span className="pa-user-name">{u.nome}</span>
                        <span className="pa-user-id">{u.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="muted">{u.email}</td>
                  <td>
                    <span
                      className="status-chip"
                      style={{ background: TIPO_COLOR[u.tipo].bg, color: TIPO_COLOR[u.tipo].color }}
                    >
                      {u.tipo}
                    </span>
                  </td>
                  <td className="muted">{u.acesso}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-edit">Editar</button>
                      <button className="action-remove">Remover</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <span className="pagination-info">Exibindo {usuarios.length} de 18 usuários</span>
            <div className="pagination-btns">
              <button className="page-btn disabled">‹</button>
              <button className="page-btn page-btn--active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">›</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ ABA: PERMISSÕES ════ */}
      {tab === 'Permissões' && (
        <div className="pa-perm-wrap">

          {/* Faixa de aviso */}
          <div className="pa-perm-banner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Solicitações de criação de conta aguardando aprovação do administrador.</span>
            {pendentes > 0 && (
              <span className="pa-perm-badge">{pendentes} pendente{pendentes > 1 ? 's' : ''}</span>
            )}
          </div>

          {/* Cards de solicitação */}
          <div className="pa-solicit-list">
            {solicit.map(s => (
              <div
                key={s.id}
                className={`pa-solicit-card${s.status !== 'pendente' ? ' pa-solicit-card--done' : ''}`}
              >
                {/* Lado esquerdo: info */}
                <div className="pa-solicit-left">
                  <div className="pa-avatar" style={{ background: s.color }}>{s.inicial}</div>
                  <div className="pa-solicit-info">
                    <span className="pa-user-name">{s.nome}</span>
                    <span className="pa-solicit-email">{s.email}</span>
                    <div className="pa-solicit-meta">
                      <span className="pa-solicit-cargo">{s.cargo}</span>
                      <span className="pa-solicit-sep">·</span>
                      <span className="pa-solicit-data">Pedido em {s.data}</span>
                    </div>
                  </div>
                </div>

                {/* Lado direito: ações ou status */}
                <div className="pa-solicit-right">
                  {s.status === 'pendente' && (
                    <>
                      <button className="pa-btn-aprovar" onClick={() => aprovar(s.id)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Aprovar
                      </button>
                      <button className="pa-btn-rejeitar" onClick={() => rejeitar(s.id)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Rejeitar
                      </button>
                    </>
                  )}
                  {s.status === 'aprovado'  && <span className="pa-status pa-status--aprovado">✓ Aprovado</span>}
                  {s.status === 'rejeitado' && <span className="pa-status pa-status--rejeitado">✕ Rejeitado</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Estado vazio */}
          {pendentes === 0 && (
            <div className="pa-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Todas as solicitações foram processadas</span>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default PainelAdmin;
