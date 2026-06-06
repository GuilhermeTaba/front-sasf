import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../../Layout';
import './Atendimentos.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const TIPO_LABEL = {
  VisitaDomiciliar:  'Visita Domiciliar',
  AtendimentoNaSede: 'Atendimento na Sede',
};

const Atendimentos = () => {
  const navigate = useNavigate();
  const [atendimentos, setAtendimentos] = useState([]);
  const [tecnicos, setTecnicos]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_URL}/audio-atendimento`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${API_URL}/tecnicos`,           { headers }).then(r => r.ok ? r.json() : []),
    ])
      .then(([ats, tecs]) => {
        setAtendimentos(Array.isArray(ats)  ? ats  : []);
        setTecnicos(    Array.isArray(tecs) ? tecs : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tecnicoNome = id => tecnicos.find(t => t.id === id)?.nome || '—';

  const fmtData = iso => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR');
  };

  const filtered = atendimentos
    .filter(a =>
      !search ||
      (a.tipoAtendimento || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.local || '').toLowerCase().includes(search.toLowerCase()) ||
      tecnicoNome(a.tecnicoId).toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  return (
    <Layout>
      {/* ── HEADER ── */}
      <div className="page-header">
        <div>
          <p className="page-section">Registros</p>
          <h1 className="page-title">Atendimentos</h1>
          <p className="page-sub">
            {loading ? 'Carregando...' : `${atendimentos.length} atendimento${atendimentos.length !== 1 ? 's' : ''} registrado${atendimentos.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="table-card">
        <div className="table-toolbar">
          <div className="toolbar-search">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="#9ca3af" strokeWidth="1.6"/>
              <path d="M13 13l3.5 3.5" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por tipo, local ou técnico..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            Carregando atendimentos...
          </div>
        )}

        {!loading && (
          <div className="at-table-wrap">
            <table className="at-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Local</th>
                  <th>Técnico</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-row">Nenhum atendimento encontrado.</td>
                  </tr>
                ) : (
                  filtered.map(a => (
                    <tr key={a.id} className="data-row">
                      <td>{TIPO_LABEL[a.tipoAtendimento] || a.tipoAtendimento || '—'}</td>
                      <td className="muted">{a.local || '—'}</td>
                      <td><span className="tecnico-badge">{tecnicoNome(a.tecnicoId)}</span></td>
                      <td className="muted">{fmtData(a.data)}</td>
                      <td>
                        <button
                          className="action-edit"
                          onClick={() => navigate(`/detalhes-familia/${a.familiaId}`)}
                        >
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <div className="pagination">
            <span className="pagination-info">
              Exibindo {filtered.length} de {atendimentos.length} atendimentos
            </span>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Atendimentos;
