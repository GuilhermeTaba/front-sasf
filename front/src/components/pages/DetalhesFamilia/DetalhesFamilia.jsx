import { useParams, useNavigate, Link } from 'react-router';
import Layout from '../../Layout';
import './DetalhesFamilia.css';

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

const COLORS = ['#1d4ed8','#ef4444','#22c55e','#f59e0b','#8b5cf6','#ec4899','#0ea5e9','#f97316'];

const DetalhesFamilia = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const familia  = FAMILIAS.find(f => f.id === Number(id)) || FAMILIAS[0];
  const avatarBg = COLORS[familia.id % COLORS.length];

  const OPCOES = [
    {
      key:    'cadastral',
      color:  '#1d4ed8',
      bg:     '#eff6ff',
      border: '#bfdbfe',
      badge:  'Gestão familiar',
      title:  'Ficha Cadastral',
      desc:   'Dados completos do representante, composição familiar, endereço, situação socioeconômica e benefícios.',
      path:   '/novo-cadastro',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <line x1="9" y1="12" x2="15" y2="12"/>
          <line x1="9" y1="16" x2="13" y2="16"/>
        </svg>
      ),
    },
    {
      key:    'atualizacao',
      color:  '#16a34a',
      bg:     '#f0fdf4',
      border: '#86efac',
      badge:  'Atualização periódica',
      title:  'Ficha de Atualização',
      desc:   'Atualização do Quadro Situacional — Composição Familiar. Situação escolar, benefícios e vulnerabilidade social.',
      path:   `/ficha-atualizacao/${familia.id}`,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
        </svg>
      ),
    },
    {
      key:    'termo',
      color:  '#7c3aed',
      bg:     '#faf5ff',
      border: '#c4b5fd',
      badge:  'Autorização legal',
      title:  'Termo de Autorização de Uso de Imagem',
      desc:   'Autorização para uso de imagem da família em fotos ou filmes pelo SASF Chico Mendes.',
      path:   `/termo-imagem/${familia.id}`,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      ),
    },
  ];

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
          style={{
            background: STATUS_MAP[familia.status].bg,
            color:      STATUS_MAP[familia.status].color,
          }}
        >
          {STATUS_MAP[familia.status].label}
        </span>
      </div>

      {/* TÍTULO DA SEÇÃO */}
      <div className="det-hub-header">
        <h2 className="det-hub-title">Documentos e Fichas</h2>
        <p className="det-hub-sub">Selecione um documento para visualizar, preencher ou atualizar</p>
      </div>

      {/* CARDS DE OPÇÕES */}
      <div className="det-opcoes-grid">
        {OPCOES.map((op, i) => (
          <button
            key={op.key}
            className="det-opcao-card"
            style={{ background: op.bg, borderColor: op.border }}
            onClick={() => navigate(op.path)}
          >
            {/* número */}
            <div className="det-opcao-num" style={{ background: op.border, color: op.color }}>
              {i + 1}
            </div>

            {/* ícone */}
            <div className="det-opcao-icon-wrap" style={{ background: op.border, color: op.color }}>
              {op.icon}
            </div>

            {/* texto */}
            <div className="det-opcao-body">
              <span className="det-opcao-badge" style={{ background: op.border, color: op.color }}>
                {op.badge}
              </span>
              <h3 className="det-opcao-title" style={{ color: op.color }}>{op.title}</h3>
              <p className="det-opcao-desc">{op.desc}</p>
            </div>

            {/* seta */}
            <div className="det-opcao-arrow" style={{ background: op.color }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </button>
        ))}
      </div>
    </Layout>
  );
};

export default DetalhesFamilia;
