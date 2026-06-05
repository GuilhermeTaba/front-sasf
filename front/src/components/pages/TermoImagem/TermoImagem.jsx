import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import Layout from '../../Layout';
import './TermoImagem.css';

const FAMILIAS = [
  { id: 1, responsavel: 'Carlos Oliveira',  tecnico: 'Ana Silva'     },
  { id: 2, responsavel: 'Marta Lima',        tecnico: 'Ana Silva'     },
  { id: 3, responsavel: 'João Ribeiro',      tecnico: 'Ana Silva'     },
  { id: 4, responsavel: 'Fernanda Souza',    tecnico: 'Carlos Mendes' },
  { id: 5, responsavel: 'Paulo Costa',       tecnico: 'Carlos Mendes' },
  { id: 6, responsavel: 'Lúcia Pereira',     tecnico: 'Beatriz Rocha' },
  { id: 7, responsavel: 'Ricardo Mendes',    tecnico: 'Beatriz Rocha' },
  { id: 8, responsavel: 'Sandra Almeida',    tecnico: 'Elisa Tavares' },
];

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const MESES_NUM = {
  'Janeiro': 1, 'Fevereiro': 2, 'Março': 3, 'Abril': 4,
  'Maio': 5, 'Junho': 6, 'Julho': 7, 'Agosto': 8,
  'Setembro': 9, 'Outubro': 10, 'Novembro': 11, 'Dezembro': 12,
};

const TermoImagem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const familia = FAMILIAS.find(f => f.id === Number(id)) || FAMILIAS[0];

  const [form, setForm] = useState({
    nome:       familia.responsavel,
    rg:         '',
    cpf:        '',
    criancas:   '',
    dia:        '',
    mes:        '',
    ano:        new Date().getFullYear().toString(),
    assinatura: familia.responsavel,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    const mesNum = MESES_NUM[form.mes];
    const data = (form.dia && form.mes && form.ano && mesNum)
      ? `${form.ano}-${String(mesNum).padStart(2, '0')}-${String(form.dia).padStart(2, '0')}`
      : null;
    try {
      const res = await fetch(`${API_URL}/familias/${id}/termos-autorizacao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          nome: form.nome,
          rg: form.rg,
          cpf: form.cpf,
          criancas: form.criancas,
          data,
        }),
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      navigate(`/detalhes-familia/${id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link to="/familias"                          className="bc-link">Famílias</Link>
        <span className="bc-sep">›</span>
        <Link to={`/detalhes-familia/${familia.id}`} className="bc-link">{familia.responsavel}</Link>
        <span className="bc-sep">›</span>
        <span className="bc-current">Termo de Autorização de Uso de Imagem</span>
      </div>

      {/* HEADER */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <p className="page-section" style={{ color: '#7c3aed', fontWeight: 700 }}>🖼️ Autorização</p>
          <h1 className="page-title">Termo de Autorização de Uso de Imagem</h1>
          <p className="page-sub">UNAS — União de Núcleos, Associações dos Moradores de Heliópolis e Região</p>
        </div>
      </div>

      <div className="form-card">

        {/* ── CABEÇALHO VISUAL DO TERMO ── */}
        <div className="ti-doc-header">
          <div className="ti-doc-logo">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="17" stroke="#7c3aed" strokeWidth="1.5"/>
              <path d="M10 18c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="3" fill="#7c3aed"/>
            </svg>
            <div>
              <p className="ti-org-name">União de Núcleos, Associações dos Moradores de Heliópolis e Região</p>
              <p className="ti-org-missao">Missão: Contribuir para transformar Heliópolis e região num bairro educador, promovendo a cidadania e o desenvolvimento integral da comunidade.</p>
            </div>
          </div>
          <h2 className="ti-doc-title">TERMO DE AUTORIZAÇÃO DE USO DE IMAGEM</h2>
        </div>

        {/* ── CAMPOS EDITÁVEIS ── */}
        <div className="ti-form-body">

          {/* linha 1 — nome */}
          <div className="ti-inline-row">
            <span className="ti-text">Eu,</span>
            <input
              name="nome" value={form.nome} onChange={handle}
              placeholder="Nome completo do autorizante"
              className="ti-input ti-input--grow"
            />
            <span className="ti-text">,</span>
          </div>

          {/* linha 2 — RG */}
          <div className="ti-inline-row">
            <span className="ti-text">portador(a) da Cédula de Identidade nº</span>
            <input
              name="rg" value={form.rg} onChange={handle}
              placeholder="Nº do RG"
              className="ti-input ti-input--md"
            />
            <span className="ti-text">,</span>
          </div>

          {/* linha 3 — CPF */}
          <div className="ti-inline-row">
            <span className="ti-text">inscrito(a) no CPF sob nº</span>
            <input
              name="cpf" value={form.cpf} onChange={handle}
              placeholder="000.000.000-00"
              className="ti-input ti-input--md"
            />
            <span className="ti-text">,</span>
          </div>

          {/* parágrafo autorização */}
          <div className="ti-paragrafo">
            <span className="ti-keyword">AUTORIZO</span>
            {' '}o uso de minha imagem (ou da(s) criança(s)){' '}
            <input
              name="criancas" value={form.criancas} onChange={handle}
              placeholder="Nome(s) da(s) criança(s), se aplicável"
              className="ti-input ti-input--grow"
            />
            {' '}sob minha responsabilidade) em fotos ou filme, sem finalidade comercial, para ser utilizada pelo{' '}
            <strong>Serviço de Assistência Social à Família – SASF CHICO MENDES.</strong>
          </div>

          {/* parágrafo legal */}
          <div className="ti-paragrafo ti-paragrafo--legal">
            A presente autorização é concedida a título gratuito, abrangendo o uso da imagem acima mencionada
            em todo território nacional e no exterior, em todas as suas modalidades e, em destaque, das
            seguintes formas: (I) home page; (II) cartazes; (III) divulgação em geral. Por esta ser a
            expressão da minha vontade declaro que autorizo o uso acima descrito sem que nada haja a ser
            reclamado a título de direitos conexos à minha imagem ou a qualquer outro.
          </div>

          {/* data */}
          <div className="ti-data-wrap">
            <div className="ti-inline-row ti-inline-row--center">
              <span className="ti-text">São Paulo,</span>
              <input
                name="dia" value={form.dia} onChange={handle}
                placeholder="dd"
                className="ti-input ti-input--xs"
              />
              <span className="ti-text">de</span>
              <select name="mes" value={form.mes} onChange={handle} className="ti-input ti-input--mes">
                <option value="">mês</option>
                {MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <span className="ti-text">de</span>
              <input
                name="ano" value={form.ano} onChange={handle}
                placeholder="aaaa"
                className="ti-input ti-input--xs"
              />
              <span className="ti-text">.</span>
            </div>
          </div>

          {/* assinatura */}
          <div className="ti-assin-area">
            <input
              name="assinatura" value={form.assinatura} onChange={handle}
              placeholder="Nome completo para assinatura"
              className="ti-input ti-assin-input"
            />
            <div className="ti-assin-line" />
            <p className="ti-assin-label">ASSINATURA</p>
          </div>

        </div>

        {/* ── AVISO ── */}
        <div className="ti-aviso">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>
            Ao salvar, este termo ficará registrado no sistema vinculado à família{' '}
            <strong>{familia.responsavel}</strong>. A assinatura física deve ser obtida em documento impresso.
          </span>
        </div>

        {/* ── AÇÕES ── */}
        {error && <p style={{ color: '#dc2626', margin: '8px 0' }}>{error}</p>}
        <div className="form-actions">
          <Link to={`/detalhes-familia/${familia.id}`} className="btn-secondary">← Voltar</Link>
          <button className="btn-secondary" onClick={() => {}}>Salvar rascunho</button>
          <button className="btn-primary" style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
            onClick={handleSubmit} disabled={saving}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {saving ? 'Salvando…' : 'Salvar termo de autorização'}
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default TermoImagem;
