import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import Layout from '../../Layout';
import './DetalhesFamilia.css';
import '../lista-docs.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const mapUrgencia = nivel => {
  if (nivel === 'URGENCIA') return 'urgente';
  if (nivel === 'ATENCAO')  return 'atencao';
  return 'ok';
};

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

const fmtSize = b => b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;

const LISTAS_EMPTY = {
  atendimentos: [], cadastral: [], atualizacao: [], termo: [],
  visita: [], planoDesenvolvimento: [], planoPDU: [], folhaProsseguimento: [], documentos: [],
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

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragOver, setDragOver]           = useState(false);
  const fileInputRef = useRef(null);

  const [familia, setFamilia]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [listas, setListas]     = useState(LISTAS_EMPTY);

  useEffect(() => {
    if (!id) return;
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

    fetch(`${API_URL}/familias/${id}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setFamilia({
          id:         data.id,
          responsavel: data.nomeRepresentante || data.nomeRepresentanteFamilia || '—',
          tecnico:    data.tecnicoNome || data.tecnico?.nome || data.tecnico || '—',
          regiao:     data.codigoFamilia || data.bairro || data.regiao || '—',
          membros:    data.totalMembros ?? data.composicaoFamiliar?.length ?? 0,
          tel:        data.telefoneCelular || data.telefoneResidencial || '—',
          status:     mapUrgencia(data.nivelUrgencia || data.status),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch(`${API_URL}/familias/${id}/cadastro`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const toDateBR = iso => {
          if (!iso) return '';
          const p = iso.split('-');
          return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
        };
        setListas(prev => ({
          ...prev,
          cadastral: [{
            id: data.id ?? 1,
            data: toDateBR(data.dataMatricula) || toDateBR(data.data) || '—',
            tecnico: data.tecnicoNome || '—',
            status: 'completo',
          }],
        }));
      })
      .catch(() => {});
  }, [id]);

  const addFiles = files => {
    const next = Array.from(files).map(f => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size: f.size,
      type: f.type,
      url:  URL.createObjectURL(f),
    }));
    setUploadedFiles(p => [...p, ...next]);
  };

  const removeFile = id =>
    setUploadedFiles(p => p.filter(f => f.id !== id));

  const avatarBg = COLORS[(Number(id) ?? 0) % COLORS.length];

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
      novaPath:     `/novo-cadastro/${id}`,
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
      novaPath:     `/ficha-atualizacao/${id}`,
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
      novaPath:     `/termo-imagem/${id}`,
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
      novaPath:     `/ficha-visita/${id}`,
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
      novaPath:     `/plano-desenvolvimento/${id}`,
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
      novaPath:     `/plano-pdu/${id}`,
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
      novaPath:     `/folha-prosseguimento/${id}`,
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
    {
      key:    'documentos',
      color:  '#0369a1',
      bg:     '#f0f9ff',
      border: '#bae6fd',
      title:  'Documentos',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      ),
    },
  ];

  const opcaoAtiva = OPCOES.find(o => o.key === selected);
  const itens      = listas[selected] || [];

  if (loading) {
    return <Layout><div style={{ padding: 40, color: '#6b7280' }}>Carregando...</div></Layout>;
  }

  if (!familia) {
    return <Layout><div style={{ padding: 40, color: '#dc2626' }}>Família não encontrada.</div></Layout>;
  }

  const statusInfo = STATUS_MAP[familia.status] || STATUS_MAP.ok;

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
              {familia.regiao}
              {familia.membros ? ` · ${familia.membros} membros` : ''}
              {familia.tel && familia.tel !== '—' ? ` · ${familia.tel}` : ''}
            </p>
            {familia.tecnico && familia.tecnico !== '—' && (
              <p className="det-sub">Técnico responsável: <strong>{familia.tecnico}</strong></p>
            )}
          </div>
        </div>
        <span className="status-chip" style={{ background: statusInfo.bg, color: statusInfo.color }}>
          {statusInfo.label}
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
          const count    = op.key === 'documentos' ? uploadedFiles.length : (listas[op.key]?.length ?? 0);
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
                <div className="det-opcao-count">
                  {op.key === 'documentos'
                    ? `${count} arquivo${count !== 1 ? 's' : ''}`
                    : `${count} ${count === 1 ? 'registro' : 'registros'}`}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ABA DOCUMENTOS */}
      {selected === 'documentos' && (() => {
        const op = OPCOES.find(o => o.key === 'documentos');
        return (
          <>
            <div className="lista-doc-section-header">
              <div>
                <h2 className="lista-doc-title">Documentos Anexados</h2>
                <p className="lista-doc-sub">
                  {familia?.responsavel}&ensp;·&ensp;{uploadedFiles.length} arquivo{uploadedFiles.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                className="lista-doc-nova-btn"
                style={{ background: op.color }}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5"  y1="12" x2="19" y2="12"/>
                </svg>
                Adicionar Documento
              </button>
            </div>

            {/* DROP ZONE */}
            <div
              className={`det-upload-zone${dragOver ? ' det-upload-zone--over' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                style={{ display: 'none' }}
                onChange={e => addFiles(e.target.files)}
              />
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 10 }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#0369a1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17 8 12 3 7 8" stroke="#0369a1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" stroke="#0369a1" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <p className="det-upload-title">Arraste arquivos aqui ou clique para selecionar</p>
              <p className="det-upload-hint">PDF, PNG, JPG, DOC, XLS — até 10 MB cada</p>
            </div>

            {/* LISTA DE ARQUIVOS */}
            {uploadedFiles.length > 0 && (
              <div className="lista-doc-card" style={{ marginTop: 16 }}>
                {uploadedFiles.map(f => {
                  const isPdf = f.type === 'application/pdf';
                  const isImg = f.type.startsWith('image/');
                  const iconColor = isPdf ? '#ef4444' : isImg ? '#7c3aed' : '#6b7280';
                  return (
                    <div key={f.id} className="lista-doc-item" style={{ cursor: 'default' }}>
                      <div className="lista-doc-item-icon" style={{ background: op.bg, color: iconColor }}>
                        {isPdf ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        ) : isImg ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                          </svg>
                        )}
                      </div>
                      <div className="lista-doc-item-info">
                        <div className="lista-doc-item-titulo">{f.name}</div>
                        <div className="lista-doc-item-meta">
                          <span>{fmtSize(f.size)}</span>
                        </div>
                      </div>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="lista-doc-ver-btn"
                        style={{ borderColor: op.border, color: op.color }}
                        onClick={e => e.stopPropagation()}
                      >
                        <span className="lista-doc-ver-label">Abrir</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </a>
                      <button
                        className="det-upload-remove"
                        onClick={() => removeFile(f.id)}
                        title="Remover"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2.2" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6"  y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );
      })()}

      {/* LISTA DOS OUTROS DOCUMENTOS */}
      {selected !== 'documentos' && opcaoAtiva && (
        <>
          <div className="lista-doc-section-header">
            <div>
              <h2 className="lista-doc-title">{opcaoAtiva.listTitle}</h2>
              <p className="lista-doc-sub">
                {familia?.responsavel}&ensp;·&ensp;{itens.length} {itens.length === 1 ? 'registro' : 'registros'}
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
                    <div className="lista-doc-item-icon" style={{ background: opcaoAtiva.bg, color: opcaoAtiva.color }}>
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
