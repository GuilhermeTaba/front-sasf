import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router';
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
  const location     = useLocation();
  const [selected, setSelected] = useState(location.state?.tab || 'cadastral');

  const [documentos, setDocumentos]     = useState([]);
  const [dragOver, setDragOver]         = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [familia, setFamilia]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [listas, setListas]     = useState(LISTAS_EMPTY);
  const [tecnicos, setTecnicos]         = useState([]);
  const [orientadores, setOrientadores] = useState([]);
  const [gestao, setGestao]             = useState({ urgencia: '', tecnicoId: '', orientadorId: '' });
  const [savingGestao, setSavingGestao] = useState(false);
  const [gestaoMsg, setGestaoMsg]       = useState('');

  const fetchDocumentos = async () => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    try {
      const url = `${API_URL}/familias/${id}/imagens`;
      console.log('[Docs] GET', url);
      const res = await fetch(url, { headers });
      const body = await res.text();
      console.log('[Docs] status:', res.status, '| body:', body);
      if (res.ok) {
        const data = JSON.parse(body);
        setDocumentos(Array.isArray(data) ? data.map(a => ({
          id:   a.id,
          name: a.nomeArquivo,
          size: a.tamanho,
          type: a.contentType,
        })) : []);
      }
    } catch (e) {
      console.error('[Docs] erro:', e);
    }
  };

  useEffect(() => {
    if (!id) return;
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

    fetch(`${API_URL}/familias/${id}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setFamilia({
          id:          data.id,
          responsavel: data.nomeRepresentante || data.nomeRepresentanteFamilia || '—',
          tecnico:     data.tecnicoNome || data.tecnico?.nome || '—',
          orientador:  data.orientadorNome || data.orientador?.nome || '—',
          regiao:      data.codigoFamilia || data.bairro || data.regiao || '—',
          membros:     data.totalMembros ?? data.composicaoFamiliar?.length ?? 0,
          tel:         data.telefoneCelular || data.telefoneResidencial || '—',
          status:      mapUrgencia(data.nivelUrgencia || data.status),
        });
        setGestao({
          urgencia:     data.nivelUrgencia || '',
          tecnicoId:    String(data.tecnico?.id ?? data.tecnicoId ?? ''),
          orientadorId: String(data.orientador?.id ?? data.orientadorId ?? ''),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch(`${API_URL}/tecnicos`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(d => setTecnicos(Array.isArray(d) ? d : []))
      .catch(() => {});

    fetch(`${API_URL}/orientadores`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(d => setOrientadores(Array.isArray(d) ? d : []))
      .catch(() => {});

    const toDateBR = iso => {
      if (!iso) return '';
      const p = iso.split('-');
      return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
    };

    fetch(`${API_URL}/familias/${id}/cadastro`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(list => {
        const items = Array.isArray(list) ? list : (list ? [list] : []);
        if (!items.length) return;
        setListas(prev => ({
          ...prev,
          cadastral: items.map((data, i) => ({
            id: data.id ?? i + 1,
            data: toDateBR(data.dataMatricula) || toDateBR(data.data) || '—',
            tecnico: data.tecnicoNome || '—',
          })),
        }));
      })
      .catch(() => {});

    fetch(`${API_URL}/familias/${id}/audio-atendimento`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(list => {
        const items = Array.isArray(list) ? list : (list ? [list] : []);
        if (!items.length) return;
        setListas(prev => ({
          ...prev,
          atendimentos: items.map(data => ({
            id: data.codigo || data.id,
            data: data.data ? new Date(data.data).toLocaleDateString('pt-BR') : '—',
            tecnico: data.nomeOrientador || '—',
            tipo: data.tipoAtendimento || '',
          })),
        }));
      })
      .catch(() => {});

    fetch(`${API_URL}/familias/${id}/atualizacoes`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(list => {
        const items = Array.isArray(list) ? list : (list ? [list] : []);
        if (!items.length) return;
        setListas(prev => ({
          ...prev,
          atualizacao: items.map(data => ({
            id:      data.id,
            data:    data.dt || '—',
            tecnico: data.tecnicoNome || '—',
          })),
        }));
      })
      .catch(() => {});

    fetch(`${API_URL}/familias/${id}/visitas`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(list => {
        const items = Array.isArray(list) ? list : (list ? [list] : []);
        if (!items.length) return;
        setListas(prev => ({
          ...prev,
          visita: items.map((data, i) => ({
            id: data.id ?? i + 1,
            data: toDateBR(data.dataPreenchimento) || '—',
            tecnico: data.tecnicoNome || '—',
          })),
        }));
      })
      .catch(() => {});

    fetch(`${API_URL}/familias/${id}/desenvolvimentos`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(list => {
        const items = Array.isArray(list) ? list : (list ? [list] : []);
        if (!items.length) return;
        setListas(prev => ({
          ...prev,
          planoDesenvolvimento: items.map(data => ({
            id:   data.id,
            data: toDateBR(data.dataElaboracaoPlano) || '—',
            tecnico: data.tecnico || '—',
          })),
        }));
      })
      .catch(() => {});

    fetch(`${API_URL}/familias/${id}/termos-autorizacao`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(list => {
        const items = Array.isArray(list) ? list : (list ? [list] : []);
        if (!items.length) return;
        setListas(prev => ({
          ...prev,
          termo: items.map(data => ({
            id:      data.id,
            data:    data.data ? toDateBR(data.data) : '—',
            tecnico: data.nome || '—',
          })),
        }));
      })
      .catch(() => {});

    fetch(`${API_URL}/familias/${id}/pdus`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(list => {
        const items = Array.isArray(list) ? list : (list ? [list] : []);
        if (!items.length) return;
        setListas(prev => ({
          ...prev,
          planoPDU: items.map(data => ({
            id:   data.id,
            data: toDateBR(data.dataElaboracaoPlano) || '—',
            tecnico: data.tecnico || data.nomeTecnico || '—',
          })),
        }));
      })
      .catch(() => {});

    fetch(`${API_URL}/familias/${id}/folhas-prosseguimento`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(list => {
        const items = Array.isArray(list) ? list : (list ? [list] : []);
        if (!items.length) return;
        setListas(prev => ({
          ...prev,
          folhaProsseguimento: items.map(data => ({
            id:      data.id,
            data:    data.numeroFolha != null ? `Folha ${data.numeroFolha}` : '—',
            tecnico: data.nomeRepresentanteFamilia || '—',
          })),
        }));
      })
      .catch(() => {});

    fetchDocumentos();
  }, [id]);

  const handleSaveGestao = async () => {
    setSavingGestao(true);
    setGestaoMsg('');
    const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const erros = [];

    try {
      const res = await fetch(`${API_URL}/familias/${id}/nivel-urgencia`, {
        method: 'PATCH',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ nivelUrgencia: gestao.urgencia || null }),
      });
      if (!res.ok) erros.push(`Urgência: erro ${res.status}`);
      else setFamilia(f => ({ ...f, status: mapUrgencia(gestao.urgencia) }));
    } catch { erros.push('Urgência: falha de rede'); }

    if (gestao.tecnicoId) {
      try {
        const res = await fetch(`${API_URL}/familias/${id}/tecnico/${gestao.tecnicoId}`, {
          method: 'PUT',
          headers: authHeader,
        });
        if (!res.ok) erros.push(`Técnico: erro ${res.status}`);
        else setFamilia(f => ({ ...f, tecnico: tecnicos.find(t => String(t.id) === gestao.tecnicoId)?.nome || f.tecnico }));
      } catch { erros.push('Técnico: falha de rede'); }
    }

    if (gestao.orientadorId) {
      try {
        const res = await fetch(`${API_URL}/familias/${id}/orientador/${gestao.orientadorId}`, {
          method: 'PUT',
          headers: authHeader,
        });
        if (!res.ok) erros.push(`Orientador: erro ${res.status}`);
        else setFamilia(f => ({ ...f, orientador: orientadores.find(o => String(o.id) === gestao.orientadorId)?.nome || f.orientador }));
      } catch { erros.push('Orientador: falha de rede'); }
    }

    if (erros.length === 0) {
      setGestaoMsg('Salvo!');
      setTimeout(() => setGestaoMsg(''), 2500);
    } else {
      setGestaoMsg(erros.join(' · '));
    }
    setSavingGestao(false);
  };

  const addFiles = async files => {
    if (!files || files.length === 0) return;
    setDocUploading(true);
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    try {
      for (const file of Array.from(files)) {
        console.log('[Upload] arquivo:', file.name, file.type, file.size);
        const formData = new FormData();
        formData.append('file', file);
        const url = `${API_URL}/familias/${id}/imagens`;
        console.log('[Upload] POST', url);
        const res = await fetch(url, { method: 'POST', headers, body: formData });
        const body = await res.text();
        console.log('[Upload] status:', res.status, '| body:', body);
      }
      await fetchDocumentos();
    } catch (e) {
      console.error('[Upload] erro:', e);
    }
    finally { setDocUploading(false); }
  };

  const removeFile = async docId => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const url = `${API_URL}/imagens/${docId}`;
    console.log('[Delete] DELETE', url);
    const res = await fetch(url, { method: 'DELETE', headers });
    const body = await res.text();
    console.log('[Delete] status:', res.status, '| body:', body);
    if (res.ok) setDocumentos(prev => prev.filter(d => d.id !== docId));
  };

  const openArquivo = async docId => {
    const res = await fetch(`${API_URL}/imagens/${docId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    const blob = await res.blob();
    window.open(URL.createObjectURL(blob), '_blank');
  };

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
      novaPath:     `/novo-atendimento/${id}`,
      itemPath:     (item) => `/novo-atendimento/${id}/${item.id}`,
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
      itemPath:     (item) => `/novo-cadastro/${id}/${item.id}`,
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
      itemPath:     (item) => `/ficha-atualizacao/${id}/${item.id}`,
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
      itemPath:     (item) => `/termo-imagem/${id}/${item.id}`,
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
      itemPath:     (item) => `/ficha-visita/${id}/${item.id}`,
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
      itemPath:     (item) => `/plano-desenvolvimento/${id}/${item.id}`,
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
      itemPath:     (item) => `/plano-pdu/${id}/${item.id}`,
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
      itemPath:     (item) => `/folha-prosseguimento/${id}/${item.id}`,
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

      {/* CABEÇALHO + GESTÃO */}
      <div className="det-header-card" style={{ borderTopColor: statusInfo.color }}>

        {/* Linha superior: identidade da família */}
        <div className="det-header-top">
          <div className="det-avatar" style={{ background: avatarBg }}>
            {familia.responsavel.charAt(0)}
          </div>
          <div className="det-header-info">
            <div className="det-header-info-row">
              <h1 className="det-nome">{familia.responsavel}</h1>
              <span className="status-chip" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                {statusInfo.label}
              </span>
            </div>
            <p className="det-sub">
              {familia.regiao}
              {familia.membros ? ` · ${familia.membros} membros` : ''}
              {familia.tel && familia.tel !== '—' ? ` · ${familia.tel}` : ''}
            </p>
          </div>
        </div>

        {/* Linha inferior: controles de gestão */}
        <div className="det-header-gestao">
          <div className="det-gestao-field">
            <label>Urgência</label>
            <select
              value={gestao.urgencia}
              onChange={e => setGestao(g => ({ ...g, urgencia: e.target.value }))}
              className="det-gestao-select"
            >
              <option value="">Normal</option>
              <option value="ATENCAO">Atenção</option>
              <option value="URGENCIA">Urgente</option>
            </select>
          </div>
          <div className="det-gestao-field">
            <label>Técnico</label>
            <select
              value={gestao.tecnicoId}
              onChange={e => setGestao(g => ({ ...g, tecnicoId: e.target.value }))}
              className="det-gestao-select"
            >
              <option value="">Selecionar técnico</option>
              {tecnicos.map(t => (
                <option key={t.id} value={String(t.id)}>{t.nome}</option>
              ))}
            </select>
          </div>
          <div className="det-gestao-field">
            <label>Orientador</label>
            <select
              value={gestao.orientadorId}
              onChange={e => setGestao(g => ({ ...g, orientadorId: e.target.value }))}
              className="det-gestao-select"
            >
              <option value="">Selecionar orientador</option>
              {orientadores.map(o => (
                <option key={o.id} value={String(o.id)}>{o.nome}</option>
              ))}
            </select>
          </div>
          <div className="det-gestao-save">
            <button className="btn-primary" onClick={handleSaveGestao} disabled={savingGestao}>
              {savingGestao ? 'Salvando…' : 'Salvar'}
            </button>
            {gestaoMsg && (
              <span className={`det-gestao-msg${gestaoMsg === 'Salvo!' ? ' det-gestao-msg--ok' : ' det-gestao-msg--err'}`}>
                {gestaoMsg}
              </span>
            )}
          </div>
        </div>

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
          const count    = op.key === 'documentos' ? documentos.length : (listas[op.key]?.length ?? 0);
          return (
            <button
              key={op.key}
              className={`det-opcao-card${isActive ? ' det-opcao-card--active' : ''}`}
              style={{
                background:  isActive ? op.bg : '#fff',
                borderColor: isActive ? op.color : op.border,
                borderWidth: isActive ? '2px' : '1.5px',
              }}
              onClick={() => setSelected(op.key)}
            >
              <div
                className="det-opcao-icon-wrap"
                style={{
                  background: isActive ? op.color : op.bg,
                  color:      isActive ? '#fff'    : op.color,
                }}
              >
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
                  {familia?.responsavel}&ensp;&middot;&ensp;{documentos.length} arquivo{documentos.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                className="lista-doc-nova-btn"
                style={{ background: op.color, opacity: docUploading ? 0.7 : 1 }}
                disabled={docUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5"  y1="12" x2="19" y2="12"/>
                </svg>
                {docUploading ? 'Enviando…' : 'Adicionar Documento'}
              </button>
            </div>

            <div
              className={`det-upload-zone${dragOver ? ' det-upload-zone--over' : ''}`}
              onClick={() => !docUploading && fileInputRef.current?.click()}
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
                onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
              />
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 10 }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#0369a1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17 8 12 3 7 8" stroke="#0369a1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" stroke="#0369a1" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <p className="det-upload-title">
                {docUploading ? 'Enviando arquivos…' : 'Arraste arquivos aqui ou clique para selecionar'}
              </p>
              <p className="det-upload-hint">PDF, PNG, JPG, DOC, XLS &mdash; até 10 MB cada</p>
            </div>

            <div className="lista-doc-card" style={{ marginTop: 16 }}>
              {documentos.length === 0 ? (
                <div className="lista-doc-empty">Nenhum documento anexado.</div>
              ) : (
                documentos.map(doc => {
                  const isPdf = doc.type === 'application/pdf';
                  const isImg = doc.type?.startsWith('image/');
                  const iconColor = isPdf ? '#ef4444' : isImg ? '#7c3aed' : '#6b7280';
                  return (
                    <div key={doc.id} className="lista-doc-item" style={{ cursor: 'default' }}>
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
                        <div className="lista-doc-item-titulo">{doc.name}</div>
                        <div className="lista-doc-item-meta">
                          <span>{doc.size < 1048576 ? `${(doc.size/1024).toFixed(1)} KB` : `${(doc.size/1048576).toFixed(1)} MB`}</span>
                        </div>
                      </div>
                      <button
                        className="lista-doc-ver-btn"
                        style={{ borderColor: op.border, color: op.color }}
                        onClick={e => { e.stopPropagation(); openArquivo(doc.id); }}
                      >
                        <span className="lista-doc-ver-label">Abrir</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </button>
                      <button
                        className="det-upload-remove"
                        onClick={e => { e.stopPropagation(); removeFile(doc.id); }}
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
                })
              )}
            </div>
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
                {familia?.responsavel}&ensp;&middot;&ensp;{itens.length} {itens.length === 1 ? 'registro' : 'registros'}
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
              itens.map((item, i) => (
                <div
                  key={item.id}
                  className="lista-doc-item"
                  onClick={() => navigate(opcaoAtiva.itemPath ? opcaoAtiva.itemPath(item) : opcaoAtiva.novaPath)}
                >
                  <div className="lista-doc-num-badge" style={{ background: opcaoAtiva.bg, color: opcaoAtiva.color, borderColor: opcaoAtiva.border }}>
                    #{String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="lista-doc-item-info">
                    <div className="lista-doc-item-titulo">{opcaoAtiva.itemLabel}</div>
                    {item.data && item.data !== '—' && (
                      <div className="lista-doc-item-date"><CalIcon /> {item.data}</div>
                    )}
                  </div>

                  {(selected === 'cadastral' || selected === 'termo' || selected === 'visita' || selected === 'atualizacao' || selected === 'planoDesenvolvimento' || selected === 'planoPDU' || selected === 'folhaProsseguimento') && (() => {
                    const pdfUrl = selected === 'cadastral'
                      ? `${API_URL}/familias/${id}/cadastro/${item.id}/pdf`
                      : selected === 'visita'
                        ? `${API_URL}/familias/${id}/visitas/${item.id}/pdf`
                        : selected === 'atualizacao'
                          ? `${API_URL}/familias/${id}/atualizacoes/${item.id}/pdf`
                          : selected === 'planoDesenvolvimento'
                            ? `${API_URL}/familias/${id}/desenvolvimentos/${item.id}/pdf`
                            : selected === 'planoPDU'
                              ? `${API_URL}/familias/${id}/pdus/${item.id}/pdf`
                              : selected === 'folhaProsseguimento'
                                ? `${API_URL}/familias/${id}/folhas-prosseguimento/${item.id}/pdf`
                                : `${API_URL}/familias/${id}/termos-autorizacao/${item.id}/pdf`;
                    return (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="lista-doc-ver-btn"
                        style={{ borderColor: opcaoAtiva.border, color: '#dc2626' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <span className="lista-doc-ver-label">PDF</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </a>
                    );
                  })()}

                  <button
                    className="lista-doc-ver-btn"
                    style={{ borderColor: opcaoAtiva.border, color: opcaoAtiva.color }}
                    onClick={e => { e.stopPropagation(); navigate(opcaoAtiva.itemPath ? opcaoAtiva.itemPath(item) : opcaoAtiva.novaPath); }}
                  >
                    <span className="lista-doc-ver-label">Visualizar</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default DetalhesFamilia;
