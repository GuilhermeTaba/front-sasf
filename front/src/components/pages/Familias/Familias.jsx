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
  id:          f.id,
  responsavel: f.nomeRepresentante || f.nomeRepresentanteFamilia || '—',
  codigo:      f.codigoFamilia || '—',
  status:      mapUrgencia(f.nivelUrgencia),
  tecnico:     f.tecnicoNome || f.tecnico?.nome || '—',
  orientador:  f.orientadorNome || f.orientador?.nome || '—',
  _colorIdx:   i,
});

const PALETA = ['#1d4ed8','#f59e0b','#8b5cf6','#0891b2','#16a34a','#dc2626','#ec4899','#f97316'];

const Familias = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('todas');
  const [search, setSearch] = useState('');
  const [familias, setFamilias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [filtroTecnico, setFiltroTecnico] = useState(null);
  const [filtroOrientador, setFiltroOrientador] = useState(null);

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
    { key: 'todas',   label: 'Todas',   count: familias.length,          dot: null,      activeBg: '#0d2557', activeColor: '#fff',    activeBorder: '#0d2557', badgeBg: 'rgba(255,255,255,0.18)', badgeColor: '#fff'    },
    { key: 'ok',      label: 'Ok',      count: countByStatus('ok'),      dot: '#16a34a', activeBg: '#dcfce7', activeColor: '#166534', activeBorder: '#86efac', badgeBg: 'rgba(22,101,52,0.15)',   badgeColor: '#166534' },
    { key: 'atencao', label: 'Atenção', count: countByStatus('atencao'), dot: '#d97706', activeBg: '#fef3c7', activeColor: '#92400e', activeBorder: '#fcd34d', badgeBg: 'rgba(146,64,14,0.15)',   badgeColor: '#92400e' },
    { key: 'urgente', label: 'Urgente', count: countByStatus('urgente'), dot: '#dc2626', activeBg: '#fee2e2', activeColor: '#991b1b', activeBorder: '#fca5a5', badgeBg: 'rgba(153,27,27,0.15)',   badgeColor: '#991b1b' },
  ];

  const STATUS_ORDER = { urgente: 0, atencao: 1, ok: 2 };

  const tecnicos    = [...new Set(familias.map(f => f.tecnico).filter(t => t && t !== '—'))];
  const orientadores = [...new Set(familias.map(f => f.orientador).filter(o => o && o !== '—'))];

  const filtered = (tab === 'todas'
    ? familias
    : familias.filter(f => f.status === tab)
  ).filter(f =>
    !search ||
    f.responsavel.toLowerCase().includes(search.toLowerCase()) ||
    f.codigo.toLowerCase().includes(search.toLowerCase())
  ).filter(f => !filtroTecnico    || f.tecnico    === filtroTecnico)
   .filter(f => !filtroOrientador || f.orientador === filtroOrientador)
   .sort((a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3));

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
      <div className="fam-tabs">
        {TABS.map(t => {
          const ativo = tab === t.key;
          return (
            <button
              key={t.key}
              className={`fam-tab${ativo ? ' fam-tab--on' : ''}`}
              style={ativo ? { background: t.activeBg, color: t.activeColor, borderColor: t.activeBorder } : {}}
              onClick={() => setTab(t.key)}
            >
              {t.dot && <span className="fam-tab-dot" style={{ background: ativo ? t.activeColor : t.dot }} />}
              {t.label}
              <span
                className="fam-tab-count"
                style={ativo ? { background: t.badgeBg, color: t.badgeColor } : {}}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── TABLE + FILTROS ── */}
      <div className="table-card">

        {/* Filtros */}
        {!loading && !fetchError && (
          <div className="fam-filter-section">
            <div className="fam-filter-row">
              <span className="fam-filter-label">Técnico</span>
              <div className="fam-filter-btns">
                <button
                  className={`fam-filter-btn${filtroTecnico === null ? ' fam-filter-btn--on' : ''}`}
                  onClick={() => setFiltroTecnico(null)}
                >
                  Todos
                </button>
                {tecnicos.map((t, i) => {
                  const ativo = filtroTecnico === t;
                  return (
                    <button
                      key={t}
                      className={`fam-filter-btn${ativo ? ' fam-filter-btn--on' : ''}`}
                      style={ativo ? { background: PALETA[i % PALETA.length], borderColor: PALETA[i % PALETA.length], color: '#fff' } : {}}
                      onClick={() => setFiltroTecnico(ativo ? null : t)}
                    >
                      <span className="fam-filter-dot" style={{ background: ativo ? '#fff' : PALETA[i % PALETA.length] }} />
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="fam-filter-row">
              <span className="fam-filter-label">Orientador</span>
              <div className="fam-filter-btns">
                <button
                  className={`fam-filter-btn${filtroOrientador === null ? ' fam-filter-btn--on' : ''}`}
                  onClick={() => setFiltroOrientador(null)}
                >
                  Todos
                </button>
                {orientadores.map((o, i) => {
                  const ativo = filtroOrientador === o;
                  return (
                    <button
                      key={o}
                      className={`fam-filter-btn${ativo ? ' fam-filter-btn--on' : ''}`}
                      style={ativo ? { background: PALETA[i % PALETA.length], borderColor: PALETA[i % PALETA.length], color: '#fff' } : {}}
                      onClick={() => setFiltroOrientador(ativo ? null : o)}
                    >
                      <span className="fam-filter-dot" style={{ background: ativo ? '#fff' : PALETA[i % PALETA.length] }} />
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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
                  <th>Técnico</th>
                  <th>Orientador</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => {
                  const st = STATUS_MAP[f.status] || STATUS_MAP.ok;
                  return (
                    <tr key={f.id} className="data-row">
                      <td>
                        <div className="fam-name-cell">
                          <div
                            className="fam-avatar"
                            style={{ background: COLORS[f._colorIdx % COLORS.length] }}
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
                      <td className="muted">{f.tecnico}</td>
                      <td className="muted">{f.orientador}</td>
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
                    <td colSpan={6} className="empty-row">Nenhuma família encontrada.</td>
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
