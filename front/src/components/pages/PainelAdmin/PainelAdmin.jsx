import { useState, useEffect } from 'react';
import Layout from '../../Layout';
import './PainelAdmin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const CARGO_COLOR = {
  ADMIN:      { bg: '#fef3c7', color: '#92400e' },
  TECNICO:    { bg: '#dbeafe', color: '#1d4ed8' },
  ORIENTADOR: { bg: '#dcfce7', color: '#166534' },
};

const CARGO_LABEL = {
  ADMIN:      'Admin',
  TECNICO:    'Técnico',
  ORIENTADOR: 'Orientador',
};

const AVATAR_COLORS = ['#1d4ed8', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#f97316', '#ef4444'];
const avatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const inicial = (nome) => (nome ? nome[0].toUpperCase() : '?');

const PainelAdmin = () => {
  const [tab, setTab]           = useState('Usuários');
  const [search, setSearch]     = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]         = useState('');
  const [confirmar, setConfirmar] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/usuarios`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setUsuarios)
      .catch(() => setErro('Erro ao carregar usuários.'))
      .finally(() => setCarregando(false));
  }, []);

  const aprovados = usuarios.filter(u => u.aprovado  && u.ativo !== false);
  const pendentes = usuarios.filter(u => !u.aprovado && u.ativo !== false);

  const usuariosFiltrados = aprovados.filter(u =>
    !search ||
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.cargo.toLowerCase().includes(search.toLowerCase())
  );

  const buildHeaders = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    return {
      ...(token  ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'User-Id': userId }                : {}),
    };
  };

  const aprovar = async (u) => {
    setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, aprovado: true } : x));
    try {
      const res = await fetch(`${API_URL}/usuarios/${u.id}/aprovar`, {
        method: 'PUT',
        headers: buildHeaders(),
      });
      if (!res.ok) throw new Error();
    } catch {
      setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, aprovado: false } : x));
      setErro('Erro ao aprovar usuário.');
    }
  };

  const rejeitar = async (u) => {
    setUsuarios(prev => prev.filter(x => x.id !== u.id));
    try {
      const res = await fetch(`${API_URL}/usuarios/${u.id}`, {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      if (!res.ok) throw new Error();
    } catch {
      setUsuarios(prev => [...prev, u]);
      setErro('Erro ao rejeitar usuário.');
    }
  };

  const remover = async (u) => {
    setConfirmar(null);
    setUsuarios(prev => prev.filter(x => x.id !== u.id));
    try {
      const res = await fetch(`${API_URL}/usuarios/${u.id}`, {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      if (!res.ok) throw new Error();
    } catch {
      setUsuarios(prev => [...prev, u]);
      setErro('Erro ao remover usuário.');
    }
  };

  const statCards = [
    {
      label: 'Total de usuários', value: aprovados.length, accent: '#3b82f6', iconBg: '#dbeafe', iconColor: '#2563eb',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    },
    {
      label: 'Administradores', value: aprovados.filter(u => u.cargo === 'ADMIN').length, accent: '#f59e0b', iconBg: '#fef3c7', iconColor: '#d97706',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    },
    {
      label: 'Técnicos', value: aprovados.filter(u => u.cargo === 'TECNICO').length, accent: '#3b82f6', iconBg: '#dbeafe', iconColor: '#2563eb',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
    {
      label: 'Pendentes', value: pendentes.length, accent: '#ef4444', iconBg: '#fee2e2', iconColor: '#dc2626',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    },
  ];

  return (
    <Layout>
      {/* ── HEADER ── */}
      <div className="page-header">
        <div>
          <p className="page-section">Administração</p>
          <h1 className="page-title">Painel de admin</h1>
          <p className="page-sub">Gerencie usuários e permissões de acesso ao sistema</p>
        </div>
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
            {t === 'Permissões' && pendentes.length > 0 && (
              <span className="pa-tab-badge">{pendentes.length}</span>
            )}
          </button>
        ))}
      </div>

      {carregando && <p className="muted" style={{ padding: '1.5rem' }}>Carregando...</p>}
      {erro && <p className="msg-erro" style={{ padding: '1rem' }}>{erro}</p>}

      {/* ════ ABA: USUÁRIOS ════ */}
      {!carregando && tab === 'Usuários' && (
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
          </div>

          <table className="pa-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>E-mail / login</th>
                <th>Cargo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={4} className="muted" style={{ textAlign: 'center', padding: '2rem' }}>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
              {usuariosFiltrados.map(u => (
                <tr key={u.id} className="data-row">
                  <td>
                    <div className="pa-user-cell">
                      <div className="pa-avatar" style={{ background: avatarColor(u.id) }}>{inicial(u.nome)}</div>
                      <div className="pa-user-info">
                        <span className="pa-user-name">{u.nome}</span>
                        <span className="pa-user-id">#{u.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="muted">{u.email}</td>
                  <td>
                    <span
                      className="status-chip"
                      style={{
                        background: CARGO_COLOR[u.cargo]?.bg ?? '#f3f4f6',
                        color: CARGO_COLOR[u.cargo]?.color ?? '#374151',
                      }}
                    >
                      {CARGO_LABEL[u.cargo] ?? u.cargo}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-remove" onClick={() => setConfirmar(u)}>Remover</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <span className="pagination-info">
              Exibindo {usuariosFiltrados.length} de {aprovados.length} usuários
            </span>
          </div>
        </div>
      )}

      {/* ════ ABA: PERMISSÕES ════ */}
      {!carregando && tab === 'Permissões' && (
        <div className="pa-perm-wrap">
          <div className="pa-perm-banner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Solicitações de criação de conta aguardando aprovação do administrador.</span>
            {pendentes.length > 0 && (
              <span className="pa-perm-badge">{pendentes.length} pendente{pendentes.length > 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="pa-solicit-list">
            {pendentes.map(u => (
              <div key={u.id} className="pa-solicit-card">
                <div className="pa-solicit-left">
                  <div className="pa-avatar" style={{ background: avatarColor(u.id) }}>{inicial(u.nome)}</div>
                  <div className="pa-solicit-info">
                    <span className="pa-user-name">{u.nome}</span>
                    <span className="pa-solicit-email">{u.email}</span>
                    <div className="pa-solicit-meta">
                      <span className="pa-solicit-cargo">{CARGO_LABEL[u.cargo] ?? u.cargo}</span>
                    </div>
                  </div>
                </div>

                <div className="pa-solicit-right">
                  <button className="pa-btn-aprovar" onClick={() => aprovar(u)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Aprovar
                  </button>
                  <button className="pa-btn-rejeitar" onClick={() => rejeitar(u)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pendentes.length === 0 && (
            <div className="pa-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Todas as solicitações foram processadas</span>
            </div>
          )}
        </div>
      )}
      {/* ── MODAL DE CONFIRMAÇÃO ── */}
      {confirmar && (
        <div className="pa-modal-overlay" onClick={() => setConfirmar(null)}>
          <div className="pa-modal" onClick={e => e.stopPropagation()}>
            <div className="pa-modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3 className="pa-modal-title">Remover usuário</h3>
            <p className="pa-modal-text">
              Tem certeza que deseja remover <strong>{confirmar.nome}</strong>?
              O acesso do usuário ao sistema será desativado.
            </p>
            <div className="pa-modal-actions">
              <button className="pa-modal-cancelar" onClick={() => setConfirmar(null)}>Cancelar</button>
              <button className="pa-modal-confirmar" onClick={() => remover(confirmar)}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PainelAdmin;
