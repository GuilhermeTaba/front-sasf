import { useState } from 'react';
import { Link, useParams } from 'react-router';
import Layout from '../../Layout';
import './FichaAtualizacao.css';

/* ── dados mock famílias ── */
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

const emptyMembro = () => ({
  nome: '', escola: '', serie: '', nascimento: '', sexo: '',
});

const SectionTitle = ({ children }) => (
  <div className="fa-section-divider">
    <span className="fa-section-label">{children}</span>
  </div>
);

const FichaAtualizacao = () => {
  const { id } = useParams();
  const familia = FAMILIAS.find(f => f.id === Number(id)) || FAMILIAS[0];

  const [form, setForm] = useState({
    rf:          '',
    nascResp:    '',
    nis:         '',
    cpf:         '',
    matricula:   '',
    /* faixa etária */
    fx0a5:   '', fx6a14: '', fx15a17: '', fx18a29: '',
    fx30a59: '', fx60m:  '', nPcd:    '',
    /* benefícios */
    bpcIdoso: '', bpcPcd: '', bolsaFamilia: '',
    condicionalidades: '', statusBenef: '',
    /* situação escolar */
    agCei0a5: '', freCei: '', freEmei: '', fora6a17: '', agVaga6a17: '',
    ensFund: '', ensMedio: '', ejaOuSimilar: '', pcdEspecial: '', cursoSup: '',
    /* rede socioassistencial */
    cca: '', ci: '', cedesp: '', nci: '', naispd: '',
    /* saúde */
    vacinados: '', gestantes: '', gestantesPreNatal: '',
    /* vulnerabilidade */
    sitRua: '', trabInfantil: '', alcoolDrogas: '',
    adolMSEAberto: '', adolMSEInternacao: '',
    adultoPrivLiberdade: '', criancaSaica: '', idosoAcolhimento: '',
    /* obs e técnico */
    observacoes: '',
    tipoProntuario: '',
    dt:            '',
    tecnico:       '',
    local:         'São Paulo',
    dia:           '',
    mes:           '',
    ano:           new Date().getFullYear().toString(),
    orientador:    '',
    responsavel:   '',
  });

  const [membros, setMembros] = useState(Array.from({ length: 6 }, emptyMembro));

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleMembro = (idx, field, value) =>
    setMembros(m => m.map((mb, i) => i === idx ? { ...mb, [field]: value } : mb));

  const NumInput = ({ name, placeholder = '0' }) => (
    <input
      type="number" min="0" name={name} value={form[name]}
      onChange={handle} placeholder={placeholder}
      className="fa-num-input"
    />
  );

  return (
    <Layout>
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link to="/familias"                          className="bc-link">Famílias</Link>
        <span className="bc-sep">›</span>
        <Link to={`/detalhes-familia/${familia.id}`} className="bc-link">{familia.responsavel}</Link>
        <span className="bc-sep">›</span>
        <span className="bc-current">Ficha de Atualização</span>
      </div>

      {/* HEADER */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <p className="page-section" style={{ color: '#16a34a', fontWeight: 700 }}>🔄 Atualização</p>
          <h1 className="page-title">Ficha de Atualização — Quadro Situacional</h1>
          <p className="page-sub">Composição Familiar · UNAS / SASF Chico Mendes</p>
        </div>
      </div>

      <div className="form-card">

        {/* ── IDENTIFICAÇÃO ── */}
        <SectionTitle>Identificação da Família</SectionTitle>
        <div className="fa-grid-4">
          <div className="fa-field">
            <label>RF</label>
            <input name="rf" value={form.rf} onChange={handle} placeholder="Nº RF" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Data de Nasc. do Responsável</label>
            <input name="nascResp" value={form.nascResp} onChange={handle} placeholder="dd/mm/aaaa" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>NIS</label>
            <input name="nis" value={form.nis} onChange={handle} placeholder="Nº NIS" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>CPF</label>
            <input name="cpf" value={form.cpf} onChange={handle} placeholder="000.000.000-00" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Matrícula</label>
            <input name="matricula" value={form.matricula} onChange={handle} placeholder="Nº Matrícula" className="fa-input" />
          </div>
        </div>

        {/* ── COMPOSIÇÃO FAMILIAR ── */}
        <SectionTitle>Composição Familiar</SectionTitle>
        <p className="fa-hint">Preencha os dados de cada membro da família (até 6 membros).</p>

        <div className="fa-table-wrap">
          <table className="fa-table">
            <thead>
              <tr>
                <th className="fa-th-num">Nº</th>
                <th>Nome</th>
                <th>Escola</th>
                <th>Série</th>
                <th>Data de Nasc.</th>
                <th>Sexo</th>
              </tr>
            </thead>
            <tbody>
              {membros.map((m, i) => (
                <tr key={i} className={i % 2 === 0 ? 'fa-tr-even' : 'fa-tr-odd'}>
                  <td className="fa-td-num">{i + 1}.</td>
                  <td>
                    <input className="fa-tbl-input" value={m.nome}
                      onChange={e => handleMembro(i, 'nome', e.target.value)}
                      placeholder="Nome completo" />
                  </td>
                  <td>
                    <input className="fa-tbl-input fa-tbl-sm" value={m.escola}
                      onChange={e => handleMembro(i, 'escola', e.target.value)}
                      placeholder="Nome da escola" />
                  </td>
                  <td>
                    <input className="fa-tbl-input fa-tbl-xs" value={m.serie}
                      onChange={e => handleMembro(i, 'serie', e.target.value)}
                      placeholder="Ex: 5º" />
                  </td>
                  <td>
                    <input className="fa-tbl-input fa-tbl-xs" value={m.nascimento}
                      onChange={e => handleMembro(i, 'nascimento', e.target.value)}
                      placeholder="dd/mm/aaaa" />
                  </td>
                  <td>
                    <div className="fa-sexo-opts">
                      {['M','F','T','N'].map(s => (
                        <label key={s} className={`fa-sexo-opt${m.sexo === s ? ' fa-sexo-opt--on' : ''}`}>
                          <input type="radio" name={`sexo_${i}`} value={s}
                            checked={m.sexo === s}
                            onChange={e => handleMembro(i, 'sexo', e.target.value)} />
                          {s}
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── FAIXA ETÁRIA ── */}
        <SectionTitle>Faixa Etária dos Membros da Família (informar quantidade em cada faixa)</SectionTitle>
        <div className="fa-faixa-grid">
          {[
            { name: 'fx0a5',   label: '0 a 5 anos'     },
            { name: 'fx6a14',  label: '6 a 14 anos'    },
            { name: 'fx15a17', label: '15 a 17 anos'   },
            { name: 'fx18a29', label: '18 a 29 anos'   },
            { name: 'fx30a59', label: '30 a 59 anos'   },
            { name: 'fx60m',   label: '60 anos ou mais' },
            { name: 'nPcd',    label: 'Nº PCD'          },
          ].map(f => (
            <div key={f.name} className="fa-faixa-cell">
              <span className="fa-faixa-label">{f.label}</span>
              <NumInput name={f.name} />
            </div>
          ))}
        </div>

        {/* ── BENEFÍCIOS ── */}
        <SectionTitle>Benefícios (informar quantidade) e Situação dos Benefícios</SectionTitle>
        <div className="fa-grid-3">
          <div className="fa-beneficio-grupo">
            <p className="fa-sub-label">Benefícios (qtde)</p>
            <div className="fa-beneficio-row">
              <div className="fa-field fa-field--sm">
                <label>BPC — Idoso</label>
                <NumInput name="bpcIdoso" />
              </div>
              <div className="fa-field fa-field--sm">
                <label>BPC / PCD</label>
                <NumInput name="bpcPcd" />
              </div>
              <div className="fa-field fa-field--sm">
                <label>Bolsa Família</label>
                <NumInput name="bolsaFamilia" />
              </div>
            </div>
          </div>
          <div className="fa-field">
            <label>Condicionalidades</label>
            <input name="condicionalidades" value={form.condicionalidades}
              onChange={handle} placeholder="Descrever" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Status dos Benefícios</label>
            <select name="statusBenef" value={form.statusBenef} onChange={handle} className="fa-input">
              <option value="">Selecione...</option>
              <option>Regular</option>
              <option>Irregular</option>
              <option>Suspenso</option>
              <option>Cancelado</option>
            </select>
          </div>
        </div>

        {/* ── SITUAÇÃO ESCOLAR ── */}
        <SectionTitle>Situação Escolar — informar quantidade</SectionTitle>
        <div className="fa-faixa-grid fa-faixa-grid--big">
          {[
            { name: 'agCei0a5',   label: '00 a 05 anos aguardando vaga em CEI/EMEI' },
            { name: 'freCei',     label: 'Frequenta CEI'                              },
            { name: 'freEmei',    label: 'Frequenta EMEI'                             },
            { name: 'fora6a17',   label: '06 a 17 anos fora da escola'               },
            { name: 'agVaga6a17', label: '06 a 17 anos aguardando vaga na escola'    },
            { name: 'ensFund',    label: 'Ens. Fundamental'                           },
            { name: 'ensMedio',   label: 'Ensino Médio'                              },
            { name: 'ejaOuSimilar', label: 'EJA / MOVA / CIEJa ou similar'         },
            { name: 'pcdEspecial',  label: 'PCD escola/sala de ed. especial'        },
            { name: 'cursoSup',     label: 'Curso Superior'                         },
          ].map(f => (
            <div key={f.name} className="fa-faixa-cell">
              <span className="fa-faixa-label">{f.label}</span>
              <NumInput name={f.name} />
            </div>
          ))}
        </div>

        {/* ── REDE SOCIOASSISTENCIAL + SAÚDE ── */}
        <SectionTitle>Rede Socioassistencial e Saúde — informar quantidade</SectionTitle>
        <div className="fa-grid-2">
          <div>
            <p className="fa-sub-label">Rede Socioassistencial (qtde)</p>
            <div className="fa-faixa-grid">
              {[
                { name: 'cca',    label: 'CCA'    },
                { name: 'ci',     label: 'CI'     },
                { name: 'cedesp', label: 'CEDESP' },
                { name: 'nci',    label: 'NCI'    },
                { name: 'naispd', label: 'NAISPD' },
              ].map(f => (
                <div key={f.name} className="fa-faixa-cell">
                  <span className="fa-faixa-label">{f.label}</span>
                  <NumInput name={f.name} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="fa-sub-label">Saúde (qtde)</p>
            <div className="fa-faixa-grid">
              {[
                { name: 'vacinados',          label: 'Crianças até 07 anos com carteira de vacinação atualizada' },
                { name: 'gestantes',          label: 'Mulheres gestantes na família'                              },
                { name: 'gestantesPreNatal',  label: 'Gestantes com Pré-Natal'                                    },
              ].map(f => (
                <div key={f.name} className="fa-faixa-cell">
                  <span className="fa-faixa-label">{f.label}</span>
                  <NumInput name={f.name} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── VULNERABILIDADE SOCIAL ── */}
        <SectionTitle>Situações de Vulnerabilidade Social — informar quantidade</SectionTitle>
        <div className="fa-faixa-grid fa-faixa-grid--big">
          {[
            { name: 'sitRua',             label: 'Em Situação de Rua'                          },
            { name: 'trabInfantil',       label: 'Em Situação de Trabalho Infantil'             },
            { name: 'alcoolDrogas',       label: 'Dependência de Álcool/Drogas'                 },
            { name: 'adolMSEAberto',      label: 'Adolescente em MSE — Meio Aberto'             },
            { name: 'adolMSEInternacao',  label: 'Adolescente em MSE — Internação'              },
            { name: 'adultoPrivLiberdade',label: 'Adultos em Privação de Liberdade'             },
            { name: 'criancaSaica',       label: 'Criança/Adolescente em SAICA'                 },
            { name: 'idosoAcolhimento',   label: 'Idoso em situação de Acolhimento Institucional' },
          ].map(f => (
            <div key={f.name} className="fa-faixa-cell">
              <span className="fa-faixa-label">{f.label}</span>
              <NumInput name={f.name} />
            </div>
          ))}
        </div>

        {/* ── OBSERVAÇÕES ── */}
        <SectionTitle>Observações</SectionTitle>
        <div className="fa-field">
          <textarea
            name="observacoes" value={form.observacoes} onChange={handle}
            className="fa-textarea" rows={4}
            placeholder="Registre aqui observações relevantes sobre a situação da família..." />
        </div>

        {/* ── TÉCNICO / PRONTUÁRIO ── */}
        <SectionTitle>Técnico e Prontuário</SectionTitle>
        <div className="fa-grid-4">
          <div className="fa-field">
            <label>Tipo de Prontuário</label>
            <div className="fa-check-row">
              {['PDF','PDU'].map(t => (
                <label key={t} className={`fa-check-opt${form.tipoProntuario === t ? ' fa-check-opt--on' : ''}`}>
                  <input type="radio" name="tipoProntuario" value={t}
                    checked={form.tipoProntuario === t} onChange={handle} />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div className="fa-field">
            <label>DT</label>
            <input name="dt" value={form.dt} onChange={handle} placeholder="dd/mm/aaaa" className="fa-input" />
          </div>
          <div className="fa-field fa-field--span2">
            <label>Técnico Responsável</label>
            <input name="tecnico" value={form.tecnico} onChange={handle}
              placeholder={familia.tecnico || 'Nome do técnico'}
              className="fa-input" />
          </div>
        </div>

        {/* ── ASSINATURAS ── */}
        <SectionTitle>Data e Assinaturas</SectionTitle>
        <div className="fa-assin-wrap">
          <div className="fa-data-row">
            <span>São Paulo,</span>
            <input name="dia" value={form.dia} onChange={handle} placeholder="dia" className="fa-input fa-input--xs" />
            <span>de</span>
            <select name="mes" value={form.mes} onChange={handle} className="fa-input fa-input--mes">
              <option value="">mês</option>
              {['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <span>de</span>
            <input name="ano" value={form.ano} onChange={handle} placeholder="ano" className="fa-input fa-input--xs" />
          </div>

          <div className="fa-assin-grid">
            <div className="fa-assin-col">
              <input name="orientador" value={form.orientador} onChange={handle}
                placeholder="Nome do orientador" className="fa-input fa-assin-input" />
              <div className="fa-assin-line" />
              <p className="fa-assin-label">Orientador(a)</p>
            </div>
            <div className="fa-assin-col">
              <input name="responsavel" value={form.responsavel} onChange={handle}
                placeholder="Nome do responsável" className="fa-input fa-assin-input" />
              <div className="fa-assin-line" />
              <p className="fa-assin-label">Responsável</p>
            </div>
          </div>
        </div>

        {/* ── AÇÕES ── */}
        <div className="form-actions">
          <Link to={`/detalhes-familia/${familia.id}`} className="btn-secondary">← Voltar</Link>
          <button className="btn-secondary" onClick={() => {}}>Salvar rascunho</button>
          <button className="btn-primary btn-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Salvar ficha de atualização
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default FichaAtualizacao;
