import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import Layout from '../../Layout';
import '../FichaAtualizacao/FichaAtualizacao.css';
import '../NovoCadastro/NovosCadastro.css';
import './PlanoDesenvolvimentoPDU.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const SITUACOES_AGRAVO = [
  { key: 'fragVinculos',  label: 'Fragilização dos vínculos familiares' },
  { key: 'rompVinculos',  label: 'Rompimento dos vínculos familiares'   },
  { key: 'confinamento',  label: 'Confinamento'                         },
  { key: 'isolamento',    label: 'Isolamento'                           },
  { key: 'ausenciaCuid',  label: 'Ausência de cuidador'                 },
  { key: 'violDomestica', label: 'Violência doméstica'                  },
  { key: 'mausTratos',    label: 'Maus tratos / Negligência'            },
];

const ACESSO_ITENS = [
  { key: 'acessoEdu',    label: 'Educação'                 },
  { key: 'acessoSaude',  label: 'Saúde'                    },
  { key: 'acessoTransp', label: 'Transporte especializado' },
  { key: 'acessoRede',   label: 'Rede socioassistencial'   },
];

const FAIXA_ETARIA_MAP = {
  'Idoso':       'IDOSO',
  'Adulto':      'ADULTO',
  'Criança':     'CRIANCA',
  'Adolescente': 'ADOLESCENTE',
};
const FAIXA_ETARIA_REVERSE = Object.fromEntries(
  Object.entries(FAIXA_ETARIA_MAP).map(([k, v]) => [v, k])
);

const parseDateBR = (str) => {
  if (!str) return null;
  const p = str.split('/');
  if (p.length === 3 && p[2].length === 4) {
    const d = parseInt(p[0]), m = parseInt(p[1]), y = parseInt(p[2]);
    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return null;
    return `${p[2]}-${p[1]}-${p[0]}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  return null;
};

const formatDateBR = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const maskDate = (val) => {
  const d = val.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

const emptyItem = () => ({
  situacoesDeAgravoIdentificadas: '',
  CRAS: '', CREAS: '', saude: '', educacao: '',
  trabalho: '', outros: '', prazo: '', resultadosEsperados: '',
});

const SectionTitle = ({ children }) => (
  <div className="fa-section-divider">
    <span className="fa-section-label">{children}</span>
  </div>
);

const NumRows = ({ label, count, values, onChange }) => (
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
  const { id, planoId } = useParams();
  const navigate = useNavigate();

  const emptyForm = () => ({
    servico: '', cas: '', cras: '',
    beneficiario: '', tipoBenef: '',
    representante: '', nis: '',
    responsavelCuidado: '',
    tecnico: '',
    sintese: '', acessoOutras: '',
    situacoesAgravo: {},
    acessoItems: {},
    numeroPlano: '',
    dataElaboracao: '', dataValidade: '',
    dataReavaliacao: '', dataDesligamento: '',
  });

  const [form, setForm]                     = useState(emptyForm());
  const [acoesProposta, setAcoesProposta]   = useState(Array(6).fill(''));
  const [acoesPactuadas, setAcoesPactuadas] = useState(Array(7).fill(''));
  const [acoesInterseto, setAcoesInterseto] = useState(Array(6).fill(''));
  const [itens, setItens]                   = useState([emptyItem()]);
  const [familiaName, setFamiliaName]       = useState('');
  const [tecnicos, setTecnicos]             = useState([]);
  const [saving, setSaving]                 = useState(false);
  const [error, setError]                   = useState('');

  useEffect(() => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    fetch(`${API_URL}/familias/${id}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setFamiliaName(d.nomeRepresentante || d.nomeRepresentanteFamilia || ''); })
      .catch(() => {});
    fetch(`${API_URL}/tecnicos`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(d => setTecnicos(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!planoId) return;
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    fetch(`${API_URL}/familias/${id}/pdus/${planoId}`, { headers })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const ag = d.situacaoAgravo || {};
        const pad = (arr, min) => { const a = [...(arr || [])]; while (a.length < min) a.push(''); return a; };
        setForm({
          servico:           d.nomeServicoSASF || '',
          cas:               d.CAS || '',
          cras:              d.CRAS || '',
          beneficiario:      d.nomeBeneficiario || '',
          tipoBenef:         FAIXA_ETARIA_REVERSE[d.faixaEtaria] || '',
          representante:     d.nomeRepresentanteFamilia || '',
          nis:               d.numeroNIS_NIT_NB || '',
          responsavelCuidado:d.nomeCuidadorResponsavel || '',
          tecnico:           d.tecnico || d.nomeTecnico || '',
          sintese:           d.sinteseSituacao || '',
          acessoOutras:      ag.outras || '',
          situacoesAgravo: {
            fragVinculos:  !!ag.fragilizacaoVinculosFamiliares,
            rompVinculos:  !!ag.rompimentoVinculosFamiliares,
            confinamento:  !!ag.confinamento,
            isolamento:    !!ag.isolamento,
            ausenciaCuid:  !!ag.ausenciaCuidador,
            violDomestica: !!ag.violenciaDomestica,
            mausTratos:    !!ag.mausTratosNegligencia,
          },
          acessoItems: {
            acessoEdu:    !!ag.semAcessoEducacao,
            acessoSaude:  !!ag.semAcessoSaude,
            acessoTransp: !!ag.semAcessoTransporte,
            acessoRede:   !!ag.semAcessoRede,
          },
          numeroPlano:      d.numeroPlano || '',
          dataElaboracao:   formatDateBR(d.dataElaboracaoPlano),
          dataValidade:     formatDateBR(d.dataValidadePlano),
          dataReavaliacao:  formatDateBR(d.dataReavaliacaoPlano),
          dataDesligamento: formatDateBR(d.dataDesligamento),
        });
        setAcoesProposta(pad(d.acoesPropostas?.split('\n'), 6));
        setAcoesPactuadas(pad(d.acoesPactuadas?.split('\n'), 7));
        setAcoesInterseto(pad(d.acoesIntersetoriais?.split('\n'), 6));
        if (d.itens?.length) {
          setItens(d.itens.map(it => ({
            situacoesDeAgravoIdentificadas: it.situacoesDeAgravoIdentificadas || '',
            CRAS: it.CRAS || '', CREAS: it.CREAS || '',
            saude: it.saude || '', educacao: it.educacao || '',
            trabalho: it.trabalho || '', outros: it.outros || '',
            prazo: it.prazo || '', resultadosEsperados: it.resultadosEsperados || '',
          })));
        }
      })
      .catch(() => setError('Erro ao carregar dados'));
  }, [id, planoId]);

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleDate = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: maskDate(value) }));
  };

  const toggleAgravo = key =>
    setForm(f => ({ ...f, situacoesAgravo: { ...f.situacoesAgravo, [key]: !f.situacoesAgravo[key] } }));

  const toggleAcesso = key =>
    setForm(f => ({ ...f, acessoItems: { ...f.acessoItems, [key]: !f.acessoItems[key] } }));

  const updateArr = (setter, idx, val) =>
    setter(arr => arr.map((v, i) => i === idx ? val : v));

  const addItem    = () => setItens(arr => [...arr, emptyItem()]);
  const removeItem = idx => setItens(arr => arr.filter((_, i) => i !== idx));
  const handleItem = (idx, field, val) =>
    setItens(arr => arr.map((it, i) => i === idx ? { ...it, [field]: val } : it));

  const handleSubmit = async () => {
    setSaving(true);
    setError('');

    try {
    const ag = form.situacoesAgravo;
    const ac = form.acessoItems;
    const situacaoAgravo = {
      fragilizacaoVinculosFamiliares: !!ag.fragVinculos,
      rompimentoVinculosFamiliares:   !!ag.rompVinculos,
      confinamento:                   !!ag.confinamento,
      isolamento:                     !!ag.isolamento,
      ausenciaCuidador:               !!ag.ausenciaCuid,
      violenciaDomestica:             !!ag.violDomestica,
      mausTratosNegligencia:          !!ag.mausTratos,
      semAcessoEducacao:              !!ac.acessoEdu,
      semAcessoSaude:                 !!ac.acessoSaude,
      semAcessoTransporte:            !!ac.acessoTransp,
      semAcessoRede:                  !!ac.acessoRede,
      outras:                         form.acessoOutras || null,
    };

    const itensFiltered = itens
      .map(it => ({
        situacoesDeAgravoIdentificadas: it.situacoesDeAgravoIdentificadas || null,
        CRAS:               it.CRAS || null,
        CREAS:              it.CREAS || null,
        saude:              it.saude || null,
        educacao:           it.educacao || null,
        trabalho:           it.trabalho || null,
        outros:             it.outros || null,
        prazo:              it.prazo || null,
        resultadosEsperados:it.resultadosEsperados || null,
      }))
      .filter(it => Object.values(it).some(v => v !== null));

    const payload = {
      nomeServicoSASF:         form.servico || null,
      CAS:                     form.cas || null,
      CRAS:                    form.cras || null,
      nomeBeneficiario:        form.beneficiario || null,
      faixaEtaria:             FAIXA_ETARIA_MAP[form.tipoBenef] || null,
      nomeRepresentanteFamilia:form.representante || null,
      numeroNIS_NIT_NB:        form.nis || null,
      nomeCuidadorResponsavel: form.responsavelCuidado || null,
      nomeTecnico:             form.tecnico || null,
      sinteseSituacao:         form.sintese || null,
      situacaoAgravo,
      acoesPropostas:          acoesProposta.filter(Boolean).join('\n') || null,
      acoesPactuadas:          acoesPactuadas.filter(Boolean).join('\n') || null,
      acoesIntersetoriais:     acoesInterseto.filter(Boolean).join('\n') || null,
      itens:                   itensFiltered.length > 0 ? itensFiltered : null,
      numeroPlano:             form.numeroPlano || null,
      dataElaboracaoPlano:     parseDateBR(form.dataElaboracao),
      dataValidadePlano:       parseDateBR(form.dataValidade),
      dataReavaliacaoPlano:    parseDateBR(form.dataReavaliacao),
      dataDesligamento:        parseDateBR(form.dataDesligamento),
      tecnico:                 form.tecnico || null,
    };

    const endpoint = planoId
      ? `${API_URL}/familias/${id}/pdus/${planoId}`
      : `${API_URL}/familias/${id}/pdus`;
    const method = planoId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Erro ${res.status}`);
      }
      navigate(`/detalhes-familia/${id}`, { state: { tab: 'planoPDU' } });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const ITEM_COLS = [
    { field: 'situacoesDeAgravoIdentificadas', label: 'Situações de Agravo' },
    { field: 'CRAS',               label: 'CRAS'               },
    { field: 'CREAS',              label: 'CREAS'              },
    { field: 'saude',              label: 'Saúde'              },
    { field: 'educacao',           label: 'Educação'           },
    { field: 'trabalho',           label: 'Trabalho'           },
    { field: 'outros',             label: 'Outros'             },
    { field: 'prazo',              label: 'Prazo'              },
    { field: 'resultadosEsperados',label: 'Resultados Esperados'},
  ];

  return (
    <Layout>
      <div className="breadcrumb">
        <Link to="/familias" className="bc-link">Famílias</Link>
        <span className="bc-sep">›</span>
        <Link to={`/detalhes-familia/${id}`} className="bc-link">
          {familiaName || `Família ${id}`}
        </Link>
        <span className="bc-sep">›</span>
        <span className="bc-current">Plano de Desenvolvimento do Usuário — PDU</span>
      </div>

      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <p className="page-section" style={{ color: '#e11d48', fontWeight: 700 }}>PDU</p>
          <h1 className="page-title">Plano de Desenvolvimento do Usuário — PDU</h1>
          <p className="page-sub">UNAS / SASF Chico Mendes</p>
        </div>
      </div>

      <div className="form-card">

        <SectionTitle>Identificação</SectionTitle>
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

        <div className="fa-grid-2" style={{ marginTop: 14 }}>
          <div className="fa-field">
            <label>Nome do Beneficiário</label>
            <input name="beneficiario" value={form.beneficiario} onChange={handle} className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Nº do Plano</label>
            <input name="numeroPlano" value={form.numeroPlano} onChange={handle}
              placeholder="Ex: 001/2026" className="fa-input" />
          </div>
        </div>

        <div className="pdu-tipo-row">
          <span className="pdu-tipo-label">Faixa etária:</span>
          {['Idoso', 'Adulto', 'Criança', 'Adolescente'].map(t => (
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
            <label>Técnico responsável</label>
            <select name="tecnico" value={form.tecnico} onChange={handle} className="fa-input">
              <option value="">Selecionar técnico</option>
              {tecnicos.map(t => (
                <option key={t.id || t.nome} value={t.nome}>{t.nome}</option>
              ))}
            </select>
          </div>
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
            <label key={s.key}
              className={`pdu-check-opt${form.situacoesAgravo[s.key] ? ' pdu-check-opt--on' : ''}`}>
              <input type="checkbox" checked={!!form.situacoesAgravo[s.key]}
                onChange={() => toggleAgravo(s.key)} />
              {s.label}
            </label>
          ))}

          <div className="pdu-acesso-group">
            <span className="pdu-acesso-title">Impossibilidade de acesso a:</span>
            <div className="pdu-acesso-items">
              {ACESSO_ITENS.map(a => (
                <label key={a.key}
                  className={`pdu-check-opt${form.acessoItems[a.key] ? ' pdu-check-opt--on' : ''}`}>
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
        <p className="fa-hint">
          Informar tipo (saúde, educação, assistência social, trabalho...), nome do serviço,
          forma de participação e período.
        </p>
        <NumRows label="Ação intersetorial" count={6} values={acoesInterseto}
          onChange={(i, v) => updateArr(setAcoesInterseto, i, v)} />

        <SectionTitle>Itens do Plano</SectionTitle>
        <div className="pd-itens-table-wrap">
          <table className="pd-itens-table">
            <thead>
              <tr>
                {ITEM_COLS.map(c => <th key={c.field}>{c.label}</th>)}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itens.map((it, idx) => (
                <tr key={idx}>
                  {ITEM_COLS.map(c => (
                    <td key={c.field}>
                      <input
                        className="fa-input pd-item-input"
                        value={it[c.field]}
                        onChange={e => handleItem(idx, c.field, e.target.value)}
                      />
                    </td>
                  ))}
                  <td>
                    {itens.length > 1 && (
                      <button type="button" className="pd-remove-row"
                        onClick={() => removeItem(idx)}>✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="btn-secondary pd-add-row" onClick={addItem}>
          + Adicionar linha
        </button>

        <SectionTitle>Datas do Plano</SectionTitle>
        <div className="fa-grid-2">
          <div className="fa-field">
            <label>Elaboração</label>
            <input name="dataElaboracao" value={form.dataElaboracao}
              onChange={handleDate} placeholder="DD/MM/AAAA" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Validade</label>
            <input name="dataValidade" value={form.dataValidade}
              onChange={handleDate} placeholder="DD/MM/AAAA" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Reavaliação</label>
            <input name="dataReavaliacao" value={form.dataReavaliacao}
              onChange={handleDate} placeholder="DD/MM/AAAA" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Desligamento</label>
            <input name="dataDesligamento" value={form.dataDesligamento}
              onChange={handleDate} placeholder="DD/MM/AAAA" className="fa-input" />
          </div>
        </div>

        {error && <p style={{ color: '#dc2626', margin: '8px 0' }}>{error}</p>}
        <div className="form-actions">
          <Link to={`/detalhes-familia/${id}`} className="btn-secondary">← Voltar</Link>
          <button className="btn-primary btn-success" onClick={handleSubmit} disabled={saving}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {saving ? 'Salvando…' : 'Salvar PDU'}
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default PlanoDesenvolvimentoPDU;
