import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import Layout from '../../Layout';
import '../FichaAtualizacao/FichaAtualizacao.css';
import '../NovoCadastro/NovosCadastro.css';

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

const SectionTitle = ({ children }) => (
  <div className="fa-section-divider">
    <span className="fa-section-label">{children}</span>
  </div>
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const parseDateBR = (str) => {
  if (!str) return null;
  const p = str.split('/');
  if (p.length === 3) return `${p[2]}-${p[1]}-${p[0]}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  return null;
};

const FichaVisitaDomiciliar = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const familia  = FAMILIAS.find(f => f.id === Number(id)) || FAMILIAS[0];

  const [form, setForm] = useState({
    servico: 'SASF Chico Mendes',
    cras: '',
    tecnico: familia.tecnico,
    data: '',
    nome: familia.responsavel,
    nis: '',
    endereco: '',
    objetivo: '',
    pessoasPresentes: '',
    demandas: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const maskDate = v => {
    const d = v.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  };

  const DATE_FIELDS = new Set(['data']);

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: DATE_FIELDS.has(name) ? maskDate(value) : value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    const userId = Number(localStorage.getItem('userId')) || null;
    try {
      const res = await fetch(`${API_URL}/familias/${id}/visitas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          nomeServicoSASF: form.servico,
          cras: form.cras,
          tecnicoId: userId,
          dataPreenchimento: parseDateBR(form.data),
          nomeRepresentanteFamilia: form.nome,
          numeroNIS_NIT_NB: form.nis,
          endereco: form.endereco,
          objetivoVisita: form.objetivo,
          pessoasEntrevistadas: form.pessoasPresentes,
          conteudoFolha: form.demandas,
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
      {/* breadcrumb */}
      <div className="breadcrumb">
        <Link to="/familias" className="bc-link">Famílias</Link>
        <span className="bc-sep">›</span>
        <Link to={`/detalhes-familia/${familia.id}`} className="bc-link">{familia.responsavel}</Link>
        <span className="bc-sep">›</span>
        <span className="bc-current">Ficha de Visita Domiciliar</span>
      </div>

      {/* header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <p className="page-section" style={{ color: '#ea580c', fontWeight: 700 }}>Visita domiciliar</p>
          <h1 className="page-title">Ficha de Visita Domiciliar</h1>
          <p className="page-sub">UNAS / SASF Chico Mendes · Fl. 1/2</p>
        </div>
      </div>

      <div className="form-card">

        <SectionTitle>Identificação</SectionTitle>
        <div className="fa-grid-2">
          <div className="fa-field">
            <label>Nome do Serviço SASF</label>
            <input name="servico" value={form.servico} onChange={handle} className="fa-input" />
          </div>
          <div className="fa-field">
            <label>CRAS</label>
            <input name="cras" value={form.cras} onChange={handle} placeholder="Nome do CRAS" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Nome do Técnico que realizou a visita</label>
            <input name="tecnico" value={form.tecnico} onChange={handle} className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Data</label>
            <input name="data" value={form.data} onChange={handle} placeholder="dd/mm/aaaa" className="fa-input" />
          </div>
        </div>

        <SectionTitle>Dados da Família</SectionTitle>
        <div className="fa-grid-2">
          <div className="fa-field">
            <label>Nome</label>
            <input name="nome" value={form.nome} onChange={handle} className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Nº NIS / NIT / NB</label>
            <input name="nis" value={form.nis} onChange={handle} placeholder="Nº NIS" className="fa-input" />
          </div>
        </div>
        <div className="fa-field" style={{ marginTop: 14 }}>
          <label>Endereço</label>
          <input name="endereco" value={form.endereco} onChange={handle} placeholder="Rua, número, complemento" className="fa-input" />
        </div>

        <SectionTitle>Objetivo da Visita</SectionTitle>
        <div className="fa-field">
          <textarea name="objetivo" value={form.objetivo} onChange={handle}
            className="fa-textarea" rows={4}
            placeholder="Descreva o objetivo da visita domiciliar..." />
        </div>

        <SectionTitle>Pessoa(s) da Família que conversou(aram) com o técnico</SectionTitle>
        <div className="fa-field">
          <textarea name="pessoasPresentes" value={form.pessoasPresentes} onChange={handle}
            className="fa-textarea" rows={3}
            placeholder="Nome(s) das pessoas presentes..." />
        </div>

        <SectionTitle>Demandas Apresentadas / Orientações / Encaminhamentos</SectionTitle>
        <div className="fa-field">
          <textarea name="demandas" value={form.demandas} onChange={handle}
            className="fa-textarea" rows={14}
            placeholder="Registre aqui as demandas apresentadas, orientações dadas e encaminhamentos realizados..." />
        </div>

        {error && <p style={{ color: '#dc2626', margin: '8px 0' }}>{error}</p>}
        <div className="form-actions">
          <Link to={`/detalhes-familia/${familia.id}`} className="btn-secondary">← Voltar</Link>
          <button className="btn-secondary" onClick={() => {}}>Salvar rascunho</button>
          <button className="btn-primary btn-success" onClick={handleSubmit} disabled={saving}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {saving ? 'Salvando…' : 'Salvar ficha de visita'}
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default FichaVisitaDomiciliar;
