import { useState } from 'react';
import { Link, useParams } from 'react-router';
import Layout from '../../Layout';
import '../FichaAtualizacao/FichaAtualizacao.css';
import '../NovoCadastro/NovosCadastro.css';
import './PlanoDesenvolvimentoPDU.css';

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

const SITUACOES_AGRAVO = [
  { key: 'fragVinculos',   label: 'Fragilização dos vínculos familiares'   },
  { key: 'rompVinculos',   label: 'Rompimento dos vínculos familiares'     },
  { key: 'confinamento',   label: 'Confinamento'                           },
  { key: 'isolamento',     label: 'Isolamento'                             },
  { key: 'ausenciaCuid',   label: 'Ausência de cuidador'                   },
  { key: 'violDomestica',  label: 'Violência doméstica'                    },
  { key: 'mausTratos',     label: 'Maus tratos / Negligência'              },
];

const ACESSO_ITENS = [
  { key: 'acessoEdu',      label: 'Educação'                  },
  { key: 'acessoSaude',    label: 'Saúde'                     },
  { key: 'acessoTransp',   label: 'Transporte especializado'  },
  { key: 'acessoRede',     label: 'Rede socioassistencial'    },
];

const SectionTitle = ({ children }) => (
  <div className="fa-section-divider">
    <span className="fa-section-label">{children}</span>
  </div>
);

const NumRows = ({ label, count, prefix, values, onChange }) => (
  <div className="pdu-num-rows">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="pdu-num-row">
        <span className="pdu-num-label">{i + 1}.</span>
        <textarea
          className="fa-textarea pdu-num-textarea"
          rows={2}
          value={values[i] || ''}
          onChange={e => onChange(i, e.target.value)}
          placeholder={`${label} ${i + 1}...`}
        />
      </div>
    ))}
  </div>
);

const PlanoDesenvolvimentoPDU = () => {
  const { id }   = useParams();
  const familia  = FAMILIAS.find(f => f.id === Number(id)) || FAMILIAS[0];

  const [form, setForm] = useState({
    servico: 'SASF Chico Mendes',
    cas: '', cras: '',
    beneficiario: familia.responsavel,
    tipoBenef: '',
    representante: '', nis: '',
    responsavelCuidado: '', grauParentesco: '',
    tecnico: familia.tecnico,
    sintese: '',
    acessoOutras: '',
    situacoesAgravo: {},
    acessoItems: {},
  });

  const [acoesProposta,    setAcoesProposta]    = useState(Array(6).fill(''));
  const [acoesPactuadas,   setAcoesPactuadas]   = useState(Array(7).fill(''));
  const [acoesInterseto,   setAcoesInterseto]   = useState(Array(6).fill(''));

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const toggleAgravo = key =>
    setForm(f => ({
      ...f,
      situacoesAgravo: { ...f.situacoesAgravo, [key]: !f.situacoesAgravo[key] },
    }));

  const toggleAcesso = key =>
    setForm(f => ({
      ...f,
      acessoItems: { ...f.acessoItems, [key]: !f.acessoItems[key] },
    }));

  const updateArr = (setter, idx, val) =>
    setter(arr => arr.map((v, i) => i === idx ? val : v));

  return (
    <Layout>
      {/* breadcrumb */}
      <div className="breadcrumb">
        <Link to="/familias" className="bc-link">Famílias</Link>
        <span className="bc-sep">›</span>
        <Link to={`/detalhes-familia/${familia.id}`} className="bc-link">{familia.responsavel}</Link>
        <span className="bc-sep">›</span>
        <span className="bc-current">Plano de Desenvolvimento do Usuário — PDU</span>
      </div>

      {/* header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <p className="page-section" style={{ color: '#e11d48', fontWeight: 700 }}>PDU</p>
          <h1 className="page-title">Plano de Desenvolvimento do Usuário — PDU</h1>
          <p className="page-sub">UNAS / SASF Chico Mendes · Fl. 1/2</p>
        </div>
      </div>

      <div className="form-card">

        <SectionTitle>Identificação — Fl. 1/2</SectionTitle>
        <div className="fa-grid-3">
          <div className="fa-field">
            <label>Nome do Serviço SASF</label>
            <input name="servico" value={form.servico} onChange={handle} className="fa-input" />
          </div>
          <div className="fa-field">
            <label>CAS</label>
            <input name="cas" value={form.cas} onChange={handle} placeholder="Código CAS" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>CRAS</label>
            <input name="cras" value={form.cras} onChange={handle} placeholder="Nome do CRAS" className="fa-input" />
          </div>
        </div>

        <div className="fa-field" style={{ marginTop: 14 }}>
          <label>Nome do Beneficiário</label>
          <input name="beneficiario" value={form.beneficiario} onChange={handle} className="fa-input" />
        </div>

        <div className="pdu-tipo-row">
          <span className="pdu-tipo-label">Tipo:</span>
          {['Idoso', 'Deficiente Adulto', 'Criança', 'Adolescente'].map(t => (
            <label key={t} className={`pdu-tipo-opt${form.tipoBenef === t ? ' pdu-tipo-opt--on' : ''}`}>
              <input type="radio" name="tipoBenef" value={t}
                checked={form.tipoBenef === t} onChange={handle} />
              {t}
            </label>
          ))}
        </div>

        <div className="fa-grid-2" style={{ marginTop: 14 }}>
          <div className="fa-field">
            <label>Nome do Representante da Família</label>
            <input name="representante" value={form.representante} onChange={handle}
              placeholder="Nome do representante" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Nº do NIS / NIT / NB</label>
            <input name="nis" value={form.nis} onChange={handle} placeholder="Nº NIS" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Nome do Responsável pelo cuidado (se houver)</label>
            <input name="responsavelCuidado" value={form.responsavelCuidado} onChange={handle}
              placeholder="Nome do responsável" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Grau de Parentesco</label>
            <input name="grauParentesco" value={form.grauParentesco} onChange={handle}
              placeholder="Ex: Filho(a), cônjuge..." className="fa-input" />
          </div>
        </div>

        <div className="fa-field" style={{ marginTop: 14 }}>
          <label>Nome do Técnico que realizará o acompanhamento</label>
          <input name="tecnico" value={form.tecnico} onChange={handle} className="fa-input" />
        </div>

        <SectionTitle>Síntese da Situação Apresentada</SectionTitle>
        <div className="fa-field">
          <textarea name="sintese" value={form.sintese} onChange={handle}
            className="fa-textarea" rows={6}
            placeholder="Descreva a síntese da situação apresentada pelo usuário/família..." />
        </div>

        <SectionTitle>Situações de Agravo Identificadas</SectionTitle>
        <div className="pdu-agravo-grid">
          {SITUACOES_AGRAVO.map(s => (
            <label key={s.key} className={`pdu-check-opt${form.situacoesAgravo[s.key] ? ' pdu-check-opt--on' : ''}`}>
              <input type="checkbox" checked={!!form.situacoesAgravo[s.key]}
                onChange={() => toggleAgravo(s.key)} />
              {s.label}
            </label>
          ))}

          <div className="pdu-acesso-group">
            <span className="pdu-acesso-title">Impossibilidade de acesso a:</span>
            <div className="pdu-acesso-items">
              {ACESSO_ITENS.map(a => (
                <label key={a.key} className={`pdu-check-opt${form.acessoItems[a.key] ? ' pdu-check-opt--on' : ''}`}>
                  <input type="checkbox" checked={!!form.acessoItems[a.key]}
                    onChange={() => toggleAcesso(a.key)} />
                  {a.label}
                </label>
              ))}
            </div>
          </div>

          <div className="fa-field pdu-outras">
            <label>Outras situações — Explicar</label>
            <input name="acessoOutras" value={form.acessoOutras} onChange={handle}
              placeholder="Descreva..." className="fa-input" />
          </div>
        </div>

        <SectionTitle>Ações propostas — prevenção e garantia de acesso (por ordem de prioridade)</SectionTitle>
        <NumRows label="Ação proposta" count={6} values={acoesProposta}
          onChange={(i, v) => updateArr(setAcoesProposta, i, v)} />

        <SectionTitle>Ações pactuadas com o beneficiário / família / cuidador</SectionTitle>
        <NumRows label="Ação pactuada" count={7} values={acoesPactuadas}
          onChange={(i, v) => updateArr(setAcoesPactuadas, i, v)} />

        <SectionTitle>Ações intersetoriais e/ou socioassistenciais pactuadas</SectionTitle>
        <p className="fa-hint">Informar tipo (saúde, educação, assistência social, trabalho...), nome do serviço, forma de participação e período.</p>
        <NumRows label="Ação intersetorial" count={6} values={acoesInterseto}
          onChange={(i, v) => updateArr(setAcoesInterseto, i, v)} />

        <div className="form-actions">
          <Link to={`/detalhes-familia/${familia.id}`} className="btn-secondary">← Voltar</Link>
          <button className="btn-secondary" onClick={() => {}}>Salvar rascunho</button>
          <button className="btn-primary btn-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Salvar PDU
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default PlanoDesenvolvimentoPDU;
