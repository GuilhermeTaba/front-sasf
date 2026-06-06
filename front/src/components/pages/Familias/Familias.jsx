import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../../Layout';
import './Familias.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const STATUS_MAP = {
  ok:      { label: 'Ok',      bg: '#dcfce7', color: '#166534' },
  atencao: { label: 'Atenção', bg: '#fef3c7', color: '#92400e' },
  urgente: { label: 'Urgente', bg: '#fee2e2', color: '#991b1b' },
};

const COLORS = ['#1d4ed8','#ef4444','#22c55e','#f59e0b','#8b5cf6','#ec4899','#0ea5e9','#f97316'];

const mapUrgencia = nivel => {
  if (nivel === 'URGENCIA') return 'urgente';
  if (nivel === 'ATENCAO')  return 'atencao';
  return 'ok';
};

const mapFamilia = (f, i) => ({
  id: f.id,
  responsavel: f.nomeRepresentante || '—',
  codigo: f.codigoFamilia || '—',
  status: mapUrgencia(f.nivelUrgencia),
  _colorIdx: i,
});

const Familias = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('todas');
  const [search, setSearch] = useState('');
  const [familias, setFamilias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/familias`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        return r.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : (data.content || data.familias || []);
        setFamilias(list.map(mapFamilia));
      })
      .catch(e => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const countByStatus = s => familias.filter(f => f.status === s).length;

  const TABS = [
    { key: 'todas',   label: 'Todas',   count: familias.length          },
    { key: 'ok',      label: 'Ok',      count: countByStatus('ok')      },
    { key: 'atencao', label: 'Atenção', count: countByStatus('atencao') },
    { key: 'urgente', label: 'Urgente', count: countByStatus('urgente') },
  ];

  const filtered = (tab === 'todas'
    ? familias
    : familias.filter(f => f.status === tab)
  ).filter(f =>
    !search ||
    f.responsavel.toLowerCase().includes(search.toLowerCase()) ||
    f.codigo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      {/* ── HEADER ── */}
      <div className="page-header">
        <div>
          <p className="page-section">Gestão</p>
          <h1 className="page-title">Famílias</h1>
          <p className="page-sub">
            {loading
              ? 'Carregando...'
              : `${familias.length} famíli${familias.length === 1 ? 'a' : 'as'} cadastrada${familias.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/novo-cadastro')}>+ Cadastrar família</button>
      </div>

      {/* ── TABS ── */}
      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab${tab === t.key ? ' tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}<span className="tab-count">({t.count})</span>
          </button>
        ))}
      </div>

      {/* ── TABLE ── */}
      <div className="table-card">

        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="toolbar-search">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="#9ca3af" strokeWidth="1.6"/>
              <path d="M13 13l3.5 3.5" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar responsável ou código..."
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

        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            Carregando famílias...
          </div>
        )}

        {fetchError && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
            {fetchError}
          </div>
        )}

        {!loading && !fetchError && (
          <div className="fam-table-wrap">
            <table className="fam-table">
              <thead>
                <tr>
                  <th>Responsável</th>
                  <th>Código</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, i) => {
                  const st = STATUS_MAP[f.status] || STATUS_MAP.ok;
                  return (
                    <tr key={f.id} className="data-row">
                      <td>
                        <div className="fam-name-cell">
                          <div
                            className="fam-avatar"
                            style={{ background: COLORS[i % COLORS.length] }}
                          >
                            {f.responsavel.charAt(0)}
                          </div>
                          <span className="fam-nome">{f.responsavel}</span>
                        </div>
                      </td>
                      <td className="muted">{f.codigo}</td>
                      <td>
                        <span
                          className="status-chip"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-edit"
                          onClick={() => navigate(`/detalhes-familia/${f.id}`)}
                        >
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-row">Nenhuma família encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !fetchError && (
          <div className="pagination">
            <span className="pagination-info">
              Exibindo {filtered.length} de {familias.length} famílias
            </span>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Familias;
