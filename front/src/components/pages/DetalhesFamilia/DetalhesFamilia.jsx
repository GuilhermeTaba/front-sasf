import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import Layout from '../../Layout';
import './DetalhesFamilia.css';
import '../lista-docs.css';

const FAMILIAS = [
  { id: 1, responsavel: 'Carlos Oliveira',  tecnico: 'Ana Silva',     regiao: 'Jd. Chico Mendes', membros: 5, tel: '(92) 99878-1234', status: 'urgente' },
  { id: 2, responsavel: 'Marta Lima',        tecnico: 'Ana Silva',     regiao: 'Vila São José',     membros: 6, tel: '(92) 98012-7799', status: 'ok'      },
  { id: 3, responsavel: 'João Ribeiro',      tecnico: 'Ana Silva',     regiao: 'Vila São José',     membros: 2, tel: '(92) 99387-0099', status: 'ok'      },
  { id: 4, responsavel: 'Fernanda Souza',    tecnico: 'Carlos Mendes', regiao: 'Jd. Chico Mendes', membros: 4, tel: '(92) 99129-4456', status: 'urgente' },
  { id: 5, responsavel: 'Paulo Costa',       tecnico: 'Carlos Mendes', regiao: 'Vila Esperança',    membros: 5, tel: '(92) 99001-3844', status: 'atencao' },
  { id: 6, responsavel: 'Lúcia Pereira',     tecnico: 'Beatriz Rocha', regiao: 'Centro',            membros: 3, tel: '(92) 99445-2210', status: 'ok'      },
  { id: 7, responsavel: 'Ricardo Mendes',    tecnico: 'Beatriz Rocha', regiao: 'Centro',            membros: 4, tel: '(92) 99332-7711', status: 'ok'      },
  { id: 8, responsavel: 'Sandra Almeida',    tecnico: 'Elisa Tavares', regiao: 'Jd. Chico Mendes', membros: 7, tel: '(92) 98785-1100', status: 'urgente' },
];

const STATUS_MAP = {
  ok:      { label: 'Ok',      bg: '#dcfce7', color: '#166534' },
  atencao: { label: 'Atenção', bg: '#fef3c7', color: '#92400e' },
  urgente: { label: 'Urgente', bg: '#fee2e2', color: '#991b1b' },
};

const STATUS_FICHA = {
  completo: { bg: '#dcfce7', color: '#166534', label: 'Completo' },
  rascunho: { bg: '#fef3c7', color: '#92400e', label: 'Rascunho' },
  assinado: { bg: '#dcfce7', color: '#166534', label: 'Assinado' },
};

const STATUS_ATENDIMENTO = {
  concluido: { bg: '#dcfce7', color: '#166534', label: 'Concluído' },
  andamento: { bg: '#dbeafe', color: '#1d4ed8', label: 'Em andamento' },
  pendente:  { bg: '#fef3c7', color: '#92400e', label: 'Pendente' },
};

const LISTAS = {
  atendimentos: [
    { id: 1, data: '12/05/2025', tecnico: 'Ana Silva',     tipo: 'Visita domiciliar', status: 'concluido' },
    { id: 2, data: '03/04/2025', tecnico: 'Ana Silva',     tipo: 'Acompanhamento',    status: 'concluido' },
    { id: 3, data: '15/02/2025', tecnico: 'Carlos Mendes', tipo: 'Entrevista social', status: 'concluido' },
    { id: 4, data: '07/01/2025', tecnico: 'Ana Silva',     tipo: 'Encaminhamento',    status: 'andamento' },
  ],
  cadastral: [
    { id: 1, data: '15/03/2024', tecnico: 'Ana Silva',     status: 'completo' },
    { id: 2, data: '08/11/2023', tecnico: 'Ana Silva',     status: 'completo' },
    { id: 3, data: '22/06/2023', tecnico: 'Carlos Mendes', status: 'rascunho' },
  ],
  atualizacao: [
    { id: 1, data: '10/04/2025', tecnico: 'Ana Silva', status: 'completo' },
    { id: 2, data: '05/01/2025', tecnico: 'Ana Silva', status: 'completo' },
    { id: 3, data: '18/08/2024', tecnico: 'Ana Silva', status: 'rascunho' },
  ],
  termo: [
    { id: 1, data: '20/02/2024', tecnico: 'Beatriz Rocha', status: 'assinado' },
    { id: 2, data: '11/09/2023', tecnico: 'Ana Silva',     status: 'assinado' },
  ],
  visita: [
    { id: 1, data: '10/05/2025', tecnico: 'Ana Silva', status: 'completo' },
    { id: 2, data: '15/02/2025', tecnico: 'Ana Silva', status: 'completo' },
  ],
  planoDesenvolvimento: [
    { id: 1, data: '20/01/2025', tecnico: 'Ana Silva', status: 'completo' },
  ],
  planoPDU: [
    { id: 1, data: '12/03/2025', tecnico: 'Carlos Mendes', status: 'completo' },
  ],
  folhaProsseguimento: [
    { id: 1, data: '01/04/2025', tecnico: 'Ana Silva', status: 'completo' },
    { id: 2, data: '15/03/2025', tecnico: 'Ana Silva', status: 'completo' },
    { id: 3, data: '01/03/2025', tecnico: 'Ana Silva', status: 'completo' },
  ],
};

const COLORS = ['#1d4ed8','#ef4444','#22c55e','#f59e0b','#8b5cf6','#ec4899','#0ea5e9','#f97316'];

const CalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);

const UserIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const DetalhesFamilia = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [selected, setSelected] = useState('cadastral');

  const familia  = FAMILIAS.find(f => f.id === Number(id)) || FAMILIAS[0];
  const avatarBg = COLORS[familia.id % COLORS.length];

  const OPCOES = [
    {
      key:          'atendimentos',
      color:        '#0891b2',
      bg:           '#ecfeff',
      border:       '#a5f3fc',
      title:        'Histórico de Atendimentos',
      listTitle:    'Histórico de Atendimentos',
      itemLabel:    'Atendimento',
      novaLabel:    'Novo Atendimento',
      novaPath:     `/novo-atendimento`,
      statusMap:    STATUS_ATENDIMENTO,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      ),
    },
    {
      key:          'cadastral',
      color:        '#1d4ed8',
      bg:           '#eff6ff',
      border:       '#bfdbfe',
      badge:        'Gestão familiar',
      title:        'Ficha Cadastral',
      desc:         'Dados do representante, composição familiar, endereço e situação socioeconômica.',
      listTitle:    'Fichas Cadastrais',
      itemLabel:    'Ficha Cadastral',
      novaLabel:    'Nova Ficha Cadastral',
      novaPath:     `/novo-cadastro/${familia.id}`,
      statusMap:    STATUS_FICHA,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <line x1="9" y1="12" x2="15" y2="12"/>
          <line x1="9" y1="16" x2="13" y2="16"/>
        </svg>
      ),
    },
    {
      key:          'atualizacao',
      color:        '#16a34a',
      bg:           '#f0fdf4',
      border:       '#86efac',
      badge:        'Atualização periódica',
      title:        'Ficha de Atualização',
      desc:         'Quadro Situacional — Composição Familiar, situação escolar, benefícios e vulnerabilidade.',
      listTitle:    'Fichas de Atualização',
      itemLabel:    'Ficha de Atualização',
      novaLabel:    'Nova Ficha de Atualização',
      novaPath:     `/ficha-atualizacao/${familia.id}`,
      statusMap:    STATUS_FICHA,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
        </svg>
      ),
    },
    {
      key:          'termo',
      color:        '#7c3aed',
      bg:           '#faf5ff',
      border:       '#c4b5fd',
      title:        'Termo de Imagem',
      listTitle:    'Termos de Autorização de Imagem',
      itemLabel:    'Termo de Imagem',
      novaLabel:    'Novo Termo',
      novaPath:     `/termo-imagem/${familia.id}`,
      statusMap:    STATUS_FICHA,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      ),
    },
    {
      key:          'visita',
      color:        '#ea580c',
      bg:           '#fff7ed',
      border:       '#fed7aa',
      title:        'Visita Domiciliar',
      listTitle:    'Fichas de Visita Domiciliar',
      itemLabel:    'Ficha de Visita',
      novaLabel:    'Nova Visita Domiciliar',
      novaPath:     `/ficha-visita/${familia.id}`,
      statusMap:    STATUS_FICHA,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H14v-5h-4v5H4a1 1 0 01-1-1V9.5z"/>
        </svg>
      ),
    },
    {
      key:          'planoDesenvolvimento',
      color:        '#0d9488',
      bg:           '#f0fdfa',
      border:       '#99f6e4',
      title:        'Plano de Desenvolvimento',
      listTitle:    'Planos de Desenvolvimento Familiar',
      itemLabel:    'Plano de Desenvolvimento',
      novaLabel:    'Novo Plano de Desenvolvimento',
      novaPath:     `/plano-desenvolvimento/${familia.id}`,
      statusMap:    STATUS_FICHA,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
    },
    {
      key:          'planoPDU',
      color:        '#e11d48',
      bg:           '#fff1f2',
      border:       '#fecdd3',
      title:        'Plano de Desenvolvimento PDU',
      listTitle:    'Planos de Desenvolvimento do Usuário (PDU)',
      itemLabel:    'PDU',
      novaLabel:    'Novo PDU',
      novaPath:     `/plano-pdu/${familia.id}`,
      statusMap:    STATUS_FICHA,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
          <line x1="12" y1="11" x2="12" y2="16"/>
          <line x1="9.5" y1="14" x2="14.5" y2="14"/>
        </svg>
      ),
    },
    {
      key:          'folhaProsseguimento',
      color:        '#475569',
      bg:           '#f8fafc',
      border:       '#cbd5e1',
      title:        'Folha de Prosseguimento',
      listTitle:    'Folhas de Prosseguimento',
      itemLabel:    'Folha de Prosseguimento',
      novaLabel:    'Nova Folha de Prosseguimento',
      novaPath:     `/folha-prosseguimento/${familia.id}`,
      statusMap:    STATUS_FICHA,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <line x1="9" y1="12" x2="15" y2="12"/>
          <line x1="9" y1="16" x2="15" y2="16"/>
        </svg>
      ),
    },
  ];

  const opcaoAtiva = OPCOES.find(o => o.key === selected);
  const itens      = LISTAS[selected] || [];

  return (
    <Layout>
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link to="/familias" className="bc-link">Famílias</Link>
        <span className="bc-sep">›</span>
        <span className="bc-current">{familia.responsavel}</span>
      </div>

      {/* CABEÇALHO DA FAMÍLIA */}
      <div className="det-header-card">
        <div className="det-header-left">
          <div className="det-avatar" style={{ background: avatarBg }}>
            {familia.responsavel.charAt(0)}
          </div>
          <div>
            <h1 className="det-nome">{familia.responsavel}</h1>
            <p className="det-sub">
              {familia.regiao}&ensp;·&ensp;{familia.membros} membros&ensp;·&ensp;{familia.tel}
            </p>
            <p className="det-sub">Técnico responsável: <strong>{familia.tecnico}</strong></p>
          </div>
        </div>
        <span
          className="status-chip"
          style={{ background: STATUS_MAP[familia.status].bg, color: STATUS_MAP[familia.status].color }}
        >
          {STATUS_MAP[familia.status].label}
        </span>
      </div>

      {/* TÍTULO DA SEÇÃO */}
      <div className="det-hub-header">
        <h2 className="det-hub-title">Documentos e Fichas</h2>
        <p className="det-hub-sub">Selecione um tipo de documento para ver o histórico</p>
      </div>

      {/* ABAS DE SELEÇÃO */}
      <div className="det-opcoes-grid">
        {OPCOES.map(op => {
          const isActive = op.key === selected;
          const count    = LISTAS[op.key].length;
          return (
            <button
              key={op.key}
              className={`det-opcao-card${isActive ? ' det-opcao-card--active' : ''}`}
              style={{
                background:  op.bg,
                borderColor: isActive ? op.color : op.border,
                borderWidth: isActive ? '2px' : '1.5px',
              }}
              onClick={() => setSelected(op.key)}
            >
              <div className="det-opcao-icon-wrap" style={{ background: op.border, color: op.color }}>
                {op.icon}
              </div>
              <div>
                <div className="det-opcao-title" style={{ color: op.color }}>{op.title}</div>
                <div className="det-opcao-count">{count} {count === 1 ? 'registro' : 'registros'}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* LISTA DO DOCUMENTO SELECIONADO */}
      {opcaoAtiva && (
        <>
          <div className="lista-doc-section-header">
            <div>
              <h2 className="lista-doc-title">{opcaoAtiva.listTitle}</h2>
              <p className="lista-doc-sub">
                {familia.responsavel}&ensp;·&ensp;{itens.length} {itens.length === 1 ? 'registro' : 'registros'}
              </p>
            </div>
            <button
              className="lista-doc-nova-btn"
              style={{ background: opcaoAtiva.color }}
              onClick={() => navigate(opcaoAtiva.novaPath)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5"  y1="12" x2="19" y2="12"/>
              </svg>
              {opcaoAtiva.novaLabel}
            </button>
          </div>

          <div className="lista-doc-card">
            {itens.length === 0 ? (
              <div className="lista-doc-empty">Nenhum registro encontrado.</div>
            ) : (
              itens.map((item, i) => {
                const st = opcaoAtiva.statusMap[item.status];
                return (
                  <div
                    key={item.id}
                    className="lista-doc-item"
                    onClick={() => navigate(opcaoAtiva.novaPath)}
                  >
                    <div
                      className="lista-doc-item-icon"
                      style={{ background: opcaoAtiva.bg, color: opcaoAtiva.color }}
                    >
                      {opcaoAtiva.icon}
                    </div>

                    <div className="lista-doc-item-info">
                      <div className="lista-doc-item-titulo">
                        {item.tipo
                          ? `${opcaoAtiva.itemLabel} #${String(i + 1).padStart(2, '0')} — ${item.tipo}`
                          : `${opcaoAtiva.itemLabel} #${String(i + 1).padStart(2, '0')} — ${familia.responsavel}`
                        }
                      </div>
                      <div className="lista-doc-item-meta">
                        <span><CalIcon /> {item.data}</span>
                        <span><UserIcon /> {item.tecnico}</span>
                      </div>
                    </div>

                    <span className="lista-doc-status" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>

                    <button
                      className="lista-doc-ver-btn"
                      style={{ borderColor: opcaoAtiva.border, color: opcaoAtiva.color }}
                      onClick={e => { e.stopPropagation(); navigate(opcaoAtiva.novaPath); }}
                    >
                      <span className="lista-doc-ver-label">Visualizar</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default DetalhesFamilia;
