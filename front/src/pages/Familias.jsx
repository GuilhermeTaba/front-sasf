import { useState } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../components/Layout';
import './Familias.css';

const FAMILIAS = [
  { id: 1,  responsavel: 'Carlos Oliveira',  tecnico: 'Ana Silva',     regiao: 'Jd. Chico Mendes', membros: 5, tel: '(92) 99878-1234', status: 'urgente' },
  { id: 2,  responsavel: 'Marta Lima',        tecnico: 'Ana Silva',     regiao: 'Vila São José',     membros: 6, tel: '(92) 98012-7799', status: 'ok'      },
  { id: 3,  responsavel: 'João Ribeiro',      tecnico: 'Ana Silva',     regiao: 'Vila São José',     membros: 2, tel: '(92) 99387-0099', status: 'ok'      },
  { id: 4,  responsavel: 'Fernanda Souza',    tecnico: 'Carlos Mendes', regiao: 'Jd. Chico Mendes', membros: 4, tel: '(92) 99129-4456', status: 'urgente' },
  { id: 5,  responsavel: 'Paulo Costa',       tecnico: 'Carlos Mendes', regiao: 'Vila Esperança',    membros: 5, tel: '(92) 99001-3844', status: 'atencao' },
  { id: 6,  responsavel: 'Lúcia Pereira',     tecnico: 'Beatriz Rocha', regiao: 'Centro',            membros: 3, tel: '(92) 99445-2210', status: 'ok'      },
  { id: 7,  responsavel: 'Ricardo Mendes',    tecnico: 'Beatriz Rocha', regiao: 'Centro',            membros: 4, tel: '(92) 99332-7711', status: 'ok'      },
  { id: 8,  responsavel: 'Sandra Almeida',    tecnico: 'Elisa Tavares', regiao: 'Jd. Chico Mendes', membros: 7, tel: '(92) 98785-1100', status: 'urgente' },
];

const STATUS_MAP = {
  ok:      { label: 'Ok',      bg: '#dcfce7', color: '#166534' },
  atencao: { label: 'Atenção', bg: '#fef3c7', color: '#92400e' },
  urgente: { label: 'Urgente', bg: '#fee2e2', color: '#991b1b' },
};

const TABS = [
  { key: 'todas',   label: 'Todas',   count: 248 },
  { key: 'ok',      label: 'Ok',      count: 212 },
  { key: 'atencao', label: 'Atenção', count: 84  },
  { key: 'urgente', label: 'Urgente', count: 36  },
];

const COLORS = ['#1d4ed8','#ef4444','#22c55e','#f59e0b','#8b5cf6','#ec4899','#0ea5e9','#f97316'];

const groupByTecnico = (list) => {
  const map = {};
  list.forEach(f => {
    if (!map[f.tecnico]) map[f.tecnico] = [];
    map[f.tecnico].push(f);
  });
  return map;
};

const Familias = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('todas');
  const [search, setSearch] = useState('');

  const filtered = (tab === 'todas'
    ? FAMILIAS
    : FAMILIAS.filter(f => f.status === tab)
  ).filter(f =>
    !search || f.responsavel.toLowerCase().includes(search.toLowerCase()) ||
    f.tecnico.toLowerCase().includes(search.toLowerCase()) ||
    f.regiao.toLowerCase().includes(search.toLowerCase())
  );

  const groups = groupByTecnico(filtered);

  return (
    <Layout>
      {/* ── HEADER ── */}
      <div className="page-header">
        <div>
          <p className="page-section">Gestão</p>
          <h1 className="page-title">Famílias</h1>
          <p className="page-sub">Unidade Chico Mendes · 248 famílias cadastradas</p>
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
              placeholder="Buscar responsável, técnico ou região..."
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

        <div className="fam-table-wrap">
        <table className="fam-table">
          <thead>
            <tr>
              <th>Responsável</th>
              <th>Técnico responsável</th>
              <th>Região</th>
              <th>Membros</th>
              <th>Telefone</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groups).map(([tecnico, lista], gi) => (
              <>
                <tr key={`group-${tecnico}`} className="group-row">
                  <td colSpan={7}>
                    <div className="group-row-inner">
                      <span className="group-label">Responsável</span>
                      {tecnico}
                      <span className="group-count">{lista.length} famílias</span>
                    </div>
                  </td>
                </tr>
                {lista.map((f, fi) => (
                  <tr key={f.id} className="data-row">
                    <td>
                      <div className="fam-name-cell">
                        <div
                          className="fam-avatar"
                          style={{ background: COLORS[(gi * 3 + fi) % COLORS.length] }}
                        >
                          {f.responsavel.charAt(0)}
                        </div>
                        <span className="fam-nome">{f.responsavel}</span>
                      </div>
                    </td>
                    <td><span className="tecnico-badge">{f.tecnico}</span></td>
                    <td className="muted">{f.regiao}</td>
                    <td className="muted center">{f.membros} pessoas</td>
                    <td className="muted">{f.tel}</td>
                    <td>
                      <span
                        className="status-chip"
                        style={{ background: STATUS_MAP[f.status].bg, color: STATUS_MAP[f.status].color }}
                      >
                        {STATUS_MAP[f.status].label}
                      </span>
                    </td>
                    <td>
                      <button className="action-edit">Ver detalhes</button>
                    </td>
                  </tr>
                ))}
              </>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-row">Nenhuma família encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        {/* PAGINATION */}
        <div className="pagination">
          <span className="pagination-info">Exibindo 1–8 de 248 famílias</span>
          <div className="pagination-btns">
            <button className="page-btn disabled">‹</button>
            {[1,2,3].map(n => (
              <button key={n} className={`page-btn${n === 1 ? ' page-btn--active' : ''}`}>{n}</button>
            ))}
            <span className="page-ellipsis">...</span>
            <button className="page-btn">31</button>
            <button className="page-btn">›</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Familias;
