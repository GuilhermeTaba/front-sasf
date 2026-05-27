import { useState, useRef } from 'react';
import { Link } from 'react-router';
import Layout from '../../Layout';
import './NovosCadastro.css';

/* ─── Constantes ─── */
const STEPS = [
  'Dados do Representante',
  'Composição Familiar',
  'Inf. Complementares',
  'Documentos',
  'Revisão',
];

const FATORES_RISCO = [
  '1. Alcoolismo', '2. Def. auditiva', '3. Def. física', '4. Def. mental',
  '5. Def. visual', '6. Desemprego', '7. Drogadição', '8. HIV+',
  '9. Prob. psiquiátricos', '10. Situação de rua', '11. Trabalho infantil',
  '12. Violência doméstica', '13. Med. Socioeducativa', '14. Privação de liberdade',
  '15. Acolhimento Institucional', '16. Outro',
];

const emptyMembro = () => ({
  nome: '', nascimento: '', parentesco: '', profissao: '',
  ocupacao: '', renda: '', fatoresRisco: '',
});

const emptyComplementar = () => ({
  nome: '', estuda: '', grauInstrucao: '', cca: false,
  cj: false, cedesp: false, nci: false, outros: '',
});

/* ─── Helpers de UI ─── */
const SectionTitle = ({ children }) => (
  <div className="section-divider">
    <span className="section-divider-label">{children}</span>
  </div>
);

const Field = ({ label, children, span, className = '' }) => (
  <div className={`field-group${span === 2 ? ' field-span2' : span === 3 ? ' field-span3' : ''}${className ? ` ${className}` : ''}`}>
    <label className="field-label">{label}</label>
    {children}
  </div>
);

const Input = ({ name, value, onChange, placeholder = '', type = 'text', ...rest }) => (
  <input
    name={name} value={value} onChange={onChange}
    placeholder={placeholder} type={type}
    className="field-input" {...rest}
  />
);

const Select = ({ name, value, onChange, options, placeholder = 'Selecione...' }) => (
  <select name={name} value={value} onChange={onChange} className="field-input">
    <option value="">{placeholder}</option>
    {options.map(o => (
      <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
    ))}
  </select>
);

const RadioGroup = ({ name, value, onChange, options }) => (
  <div className="radio-group">
    {options.map(o => (
      <label key={o.value} className={`radio-option${value === o.value ? ' radio-option--active' : ''}`}>
        <input type="radio" name={name} value={o.value}
          checked={value === o.value} onChange={onChange} />
        {o.label}
      </label>
    ))}
  </div>
);

const CheckGroup = ({ name, checked, onChange, options }) => (
  <div className="check-group">
    {options.map(o => (
      <label key={o.value} className={`check-option${(checked || []).includes(o.value) ? ' check-option--active' : ''}`}>
        <input type="checkbox" name={name} value={o.value}
          checked={(checked || []).includes(o.value)} onChange={onChange} />
        {o.label}
      </label>
    ))}
  </div>
);

/* ─── Review Row (fora do componente para evitar recriação) ─── */
const ReviewRow = ({ label, value }) => (
  <div className="review-row">
    <span className="review-label">{label}</span>
    <span className="review-value">{value || <em className="review-empty">—</em>}</span>
  </div>
);

/* ─── Componente Principal ─── */
const NovosCadastro = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    /* Identificação SASF */
    nomeSASF: '', cas: '', cras: '',
    /* Representante */
    nomeRepresentante: '', genero: '',
    dataMatricula: '', nMatricula: '',
    dataDesligamento: '', nNIS: '', nascimento: '',
    naturalidade: '', corRaca: '', deficiencia: '',
    cpf: '', rg: '', emissao: '', orgaoEmissor: '', uf: '',
    ctps: '', serie: '', mae: '', pai: '',
    /* Estado civil e instrução */
    estadoCivil: '', grauInstrucao: '',
    /* Emprego */
    profissao: '', ocupacao: '', situacaoEmprego: '', renda: '',
    /* Endereço */
    endereco: '', numEnd: '', complemento: '', cep: '',
    bairro: '', distrito: '', telResid: '', telCel: '', telefone: '',
    pontoReferencia: '',
    /* Moradia */
    condicoesMoradia: '', numCommodores: '', valorAluguel: '',
    tipoConstrucao: '', situacaoHabitacional: '',
    /* Benefícios */
    recebeTransferencia: '', transferenciasQuais: [],
    recebeBPC: '', bpcQuais: [],
    /* Demanda / Técnico */
    demanda: '', tecnico: '', dataTecnico: '',
  });

  const [membros, setMembros] = useState(Array.from({ length: 12 }, emptyMembro));
  const [complementares, setComplementares] = useState(Array.from({ length: 12 }, emptyComplementar));

  /* ─── Handlers ─── */
  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(f => {
        const arr = f[name] || [];
        return { ...f, [name]: checked ? [...arr, value] : arr.filter(v => v !== value) };
      });
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleMembro = (idx, field, value) =>
    setMembros(m => m.map((mb, i) => i === idx ? { ...mb, [field]: value } : mb));

  const handleComplementar = (idx, field, value) =>
    setComplementares(c => c.map((cp, i) => i === idx ? { ...cp, [field]: value } : cp));

  /* ─── Upload ─── */
  const addFiles = (files) => {
    const next = Array.from(files).map(f => ({
      id: Date.now() + Math.random(),
      originalName: f.name,
      label: f.name.replace(/\.[^/.]+$/, ''), // nome sem extensão como padrão
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f),
    }));
    setUploadedFiles(p => [...p, ...next]);
  };

  const renameFile = (id, label) =>
    setUploadedFiles(p => p.map(f => f.id === id ? { ...f, label } : f));

  const fmtSize = (b) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const fileIcon = (type) => {
    if (type === 'application/pdf') return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>
      </svg>
    );
    if (type.startsWith('image/')) return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    );
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
    );
  };

  /* ─── Navegação ─── */
  const goNext = () => setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
  const goPrev = () => setCurrentStep(s => Math.max(s - 1, 0));

  /* ─── Renderiza cada etapa ─── */
  const renderStep0 = () => (
    <>
      {/* Identificação */}
      <SectionTitle>Identificação do Serviço</SectionTitle>
      <div className="fields-grid fields-grid--3">
        <Field label="Nome do Serviço SASF" span={2}>
          <Input name="nomeSASF" value={form.nomeSASF} onChange={handle} placeholder="Nome do serviço SASF" />
        </Field>
        <Field label="CAS">
          <Input name="cas" value={form.cas} onChange={handle} placeholder="Código CAS" />
        </Field>
        <Field label="CRAS">
          <Input name="cras" value={form.cras} onChange={handle} placeholder="Código CRAS" />
        </Field>
        <Field label="Nº de Matrícula">
          <Input name="nMatricula" value={form.nMatricula} onChange={handle} placeholder="Ex: 001234" />
        </Field>
        <Field label="Data de Matrícula">
          <Input name="dataMatricula" value={form.dataMatricula} onChange={handle} placeholder="dd/mm/aaaa" />
        </Field>
        <Field label="Data de Desligamento">
          <Input name="dataDesligamento" value={form.dataDesligamento} onChange={handle} placeholder="dd/mm/aaaa" />
        </Field>
      </div>

      {/* Representante */}
      <SectionTitle>Dados do Representante da Família</SectionTitle>
      <div className="fields-grid fields-grid--3">
        <Field label="Nome completo do representante" span={2}>
          <Input name="nomeRepresentante" value={form.nomeRepresentante} onChange={handle} placeholder="Nome completo" />
        </Field>
        <Field label="Gênero">
          <RadioGroup name="genero" value={form.genero} onChange={handle}
            options={[
              { value: 'masculino', label: 'Masculino' },
              { value: 'feminino', label: 'Feminino' },
              { value: 'nao_binario', label: 'Não-binário' },
            ]} />
        </Field>
        <Field label="Data de Nascimento">
          <Input name="nascimento" value={form.nascimento} onChange={handle} placeholder="dd/mm/aaaa" />
        </Field>
        <Field label="Nº NIS/NIT/NB">
          <Input name="nNIS" value={form.nNIS} onChange={handle} placeholder="Número NIS/NIT/NB" />
        </Field>
        <Field label="Naturalidade (Município/Estado)">
          <Input name="naturalidade" value={form.naturalidade} onChange={handle} placeholder="Ex: São Paulo/SP" />
        </Field>
        <Field label="Cor / Raça">
          <Select name="corRaca" value={form.corRaca} onChange={handle}
            options={['Branca', 'Preta', 'Amarela', 'Parda', 'Indígena', 'Sem declaração'].map(v => ({ value: v, label: v }))} />
        </Field>
        <Field label="Pessoa com Deficiência">
          <RadioGroup name="deficiencia" value={form.deficiencia} onChange={handle}
            options={[{ value: 'sim', label: 'Sim' }, { value: 'nao', label: 'Não' }]} />
        </Field>
        <Field label="CPF">
          <Input name="cpf" value={form.cpf} onChange={handle} placeholder="000.000.000-00" />
        </Field>
        <Field label="RG">
          <Input name="rg" value={form.rg} onChange={handle} placeholder="Número do RG" />
        </Field>
        <Field label="Data de Emissão (RG)">
          <Input name="emissao" value={form.emissao} onChange={handle} placeholder="dd/mm/aaaa" />
        </Field>
        <Field label="Órgão Emissor">
          <Input name="orgaoEmissor" value={form.orgaoEmissor} onChange={handle} placeholder="Ex: SSP" />
        </Field>
        <Field label="UF">
          <Input name="uf" value={form.uf} onChange={handle} placeholder="Ex: SP" />
        </Field>
        <Field label="CTPS Nº">
          <Input name="ctps" value={form.ctps} onChange={handle} placeholder="Número CTPS" />
        </Field>
        <Field label="Série">
          <Input name="serie" value={form.serie} onChange={handle} placeholder="Série" />
        </Field>
        <Field label="Nome da Mãe" span={2}>
          <Input name="mae" value={form.mae} onChange={handle} placeholder="Nome completo da mãe" />
        </Field>
        <Field label="Nome do Pai" span={2}>
          <Input name="pai" value={form.pai} onChange={handle} placeholder="Nome completo do pai" />
        </Field>
      </div>

      {/* Estado civil e instrução */}
      <SectionTitle>Estado Civil e Grau de Instrução</SectionTitle>
      <div className="fields-grid fields-grid--1">
        <Field label="Estado Civil">
          <RadioGroup name="estadoCivil" value={form.estadoCivil} onChange={handle}
            options={[
              { value: 'solteiro', label: 'Solteiro(a)' },
              { value: 'casado', label: 'Casado(a)' },
              { value: 'separado', label: 'Separado(a)' },
              { value: 'divorciado', label: 'Divorciado(a)' },
              { value: 'viuvo', label: 'Viúvo(a)' },
            ]} />
        </Field>
        <Field label="Grau de Instrução">
          <RadioGroup name="grauInstrucao" value={form.grauInstrucao} onChange={handle}
            options={[
              { value: 'analfabeto', label: 'Analfabeto' },
              { value: 'fund_incompleto', label: 'Fund. Incompleto' },
              { value: 'fund_completo', label: 'Fund. Completo' },
              { value: 'medio_incompleto', label: 'Médio Incompleto' },
              { value: 'medio_completo', label: 'Médio Completo' },
              { value: 'superior_incompleto', label: 'Superior Incompleto' },
              { value: 'superior_completo', label: 'Superior Completo' },
            ]} />
        </Field>
      </div>

      {/* Profissão / Emprego */}
      <SectionTitle>Profissão e Situação de Emprego</SectionTitle>
      <div className="fields-grid fields-grid--3">
        <Field label="Profissão">
          <Input name="profissao" value={form.profissao} onChange={handle} placeholder="Ex: Auxiliar de serviços" />
        </Field>
        <Field label="Ocupação">
          <Input name="ocupacao" value={form.ocupacao} onChange={handle} placeholder="Ex: Doméstica" />
        </Field>
        <Field label="Situação de Emprego">
          <RadioGroup name="situacaoEmprego" value={form.situacaoEmprego} onChange={handle}
            options={[
              { value: 'empregado', label: 'Empregado' },
              { value: 'desempregado', label: 'Desempregado' },
              { value: 'aposentado', label: 'Aposentado' },
              { value: 'pensionista', label: 'Pensionista' },
            ]} />
        </Field>
        <Field label="Renda (R$)">
          <Input name="renda" value={form.renda} onChange={handle} placeholder="Ex: 1.412,00" />
        </Field>
      </div>

      {/* Endereço */}
      <SectionTitle>Endereço e Contato</SectionTitle>
      <div className="fields-grid fields-grid--3">
        <Field label="Endereço" span={2}>
          <Input name="endereco" value={form.endereco} onChange={handle} placeholder="Rua, Avenida..." />
        </Field>
        <Field label="Nº">
          <Input name="numEnd" value={form.numEnd} onChange={handle} placeholder="Nº" />
        </Field>
        <Field label="Complemento">
          <Input name="complemento" value={form.complemento} onChange={handle} placeholder="Apto, Bloco..." />
        </Field>
        <Field label="CEP">
          <Input name="cep" value={form.cep} onChange={handle} placeholder="00000-000" />
        </Field>
        <Field label="Bairro">
          <Input name="bairro" value={form.bairro} onChange={handle} placeholder="Bairro" />
        </Field>
        <Field label="Distrito">
          <Input name="distrito" value={form.distrito} onChange={handle} placeholder="Distrito" />
        </Field>
        <Field label="Telefone Residencial">
          <Input name="telResid" value={form.telResid} onChange={handle} placeholder="(00) 0000-0000" />
        </Field>
        <Field label="Telefone Celular">
          <Input name="telCel" value={form.telCel} onChange={handle} placeholder="(00) 00000-0000" />
        </Field>
        <Field label="Outro Telefone">
          <Input name="telefone" value={form.telefone} onChange={handle} placeholder="(00) 00000-0000" />
        </Field>
        <Field label="Ponto de Referência" span={2}>
          <Input name="pontoReferencia" value={form.pontoReferencia} onChange={handle} placeholder="Próximo a..." />
        </Field>
      </div>

      {/* Moradia */}
      <SectionTitle>Condições de Moradia</SectionTitle>
      <div className="fields-grid fields-grid--3">
        <Field label="Condições de Moradia">
          <RadioGroup name="condicoesMoradia" value={form.condicoesMoradia} onChange={handle}
            options={[
              { value: 'propria', label: 'Própria' },
              { value: 'alugada', label: 'Alugada' },
              { value: 'cedida', label: 'Cedida' },
            ]} />
        </Field>
        <Field label="Nº de Cômodos">
          <Input name="numCommodores" value={form.numCommodores} onChange={handle} placeholder="Ex: 3" type="number" />
        </Field>
        <Field label="Valor Aluguel / Financiamento (R$)">
          <Input name="valorAluguel" value={form.valorAluguel} onChange={handle} placeholder="Ex: 800,00" />
        </Field>
        <Field label="Tipo de Construção">
          <RadioGroup name="tipoConstrucao" value={form.tipoConstrucao} onChange={handle}
            options={[
              { value: 'alvenaria', label: 'Alvenaria' },
              { value: 'madeira', label: 'Madeira' },
              { value: 'mista', label: 'Mista' },
            ]} />
        </Field>
        <Field label="Situação Habitacional">
          <RadioGroup name="situacaoHabitacional" value={form.situacaoHabitacional} onChange={handle}
            options={[
              { value: 'cortico', label: 'Cortiço' },
              { value: 'favela', label: 'Favela' },
              { value: 'loteamento', label: 'Loteamento Irregular' },
            ]} />
        </Field>
      </div>

      {/* Benefícios */}
      <SectionTitle>Benefícios e Programas Sociais</SectionTitle>
      <div className="fields-grid fields-grid--1">
        <Field label="Recebe Programa de Transferência de Renda?">
          <div className="benefit-row">
            <RadioGroup name="recebeTransferencia" value={form.recebeTransferencia} onChange={handle}
              options={[{ value: 'nao', label: 'Não recebe' }, { value: 'sim', label: 'Sim, qual?' }]} />
            {form.recebeTransferencia === 'sim' && (
              <CheckGroup name="transferenciasQuais" checked={form.transferenciasQuais} onChange={handle}
                options={[
                  { value: 'renda_minima', label: 'Renda Mínima' },
                  { value: 'bolsa_familia', label: 'Bolsa Família' },
                  { value: 'renda_cidada', label: 'Renda Cidadã' },
                  { value: 'acao_jovem', label: 'Ação Jovem' },
                  { value: 'peti', label: 'PETI' },
                ]} />
            )}
          </div>
        </Field>
        <Field label="Recebe Benefício de Prestação Continuada (BPC)?">
          <div className="benefit-row">
            <RadioGroup name="recebeBPC" value={form.recebeBPC} onChange={handle}
              options={[{ value: 'nao', label: 'Não recebe' }, { value: 'sim', label: 'Sim, qual?' }]} />
            {form.recebeBPC === 'sim' && (
              <CheckGroup name="bpcQuais" checked={form.bpcQuais} onChange={handle}
                options={[
                  { value: 'idoso', label: 'Idoso' },
                  { value: 'deficiencia', label: 'Pessoa com deficiência' },
                ]} />
            )}
          </div>
        </Field>
      </div>
    </>
  );

  const renderStep1 = () => (
    <>
      <SectionTitle>Composição Familiar (até 12 membros)</SectionTitle>
      <p className="step-desc">
        Preencha os dados de cada membro da família. Os campos vazios podem ser preenchidos depois.
      </p>

      <div className="table-scroll">
        <table className="membros-table">
          <thead>
            <tr>
              <th className="col-num">Nº</th>
              <th className="col-nome">Nome</th>
              <th className="col-nasc">Nascimento</th>
              <th className="col-parent">Parentesco / Vínculo</th>
              <th className="col-prof">Profissão</th>
              <th className="col-ocup">Ocupação</th>
              <th className="col-renda">Renda (R$)</th>
              <th className="col-risco">Fator de Risco Social (b)</th>
            </tr>
          </thead>
          <tbody>
            {membros.map((m, i) => (
              <tr key={i} className={i % 2 === 0 ? 'tr-even' : 'tr-odd'}>
                <td className="col-num td-num">{i + 1}.</td>
                <td>
                  <input className="tbl-input" value={m.nome}
                    onChange={e => handleMembro(i, 'nome', e.target.value)}
                    placeholder="Nome completo" />
                </td>
                <td>
                  <input className="tbl-input tbl-input--sm" value={m.nascimento}
                    onChange={e => handleMembro(i, 'nascimento', e.target.value)}
                    placeholder="dd/mm/aaaa" />
                </td>
                <td>
                  <input className="tbl-input tbl-input--sm" value={m.parentesco}
                    onChange={e => handleMembro(i, 'parentesco', e.target.value)}
                    placeholder="Ex: Filho(a)" />
                </td>
                <td>
                  <input className="tbl-input tbl-input--sm" value={m.profissao}
                    onChange={e => handleMembro(i, 'profissao', e.target.value)}
                    placeholder="Profissão" />
                </td>
                <td>
                  <input className="tbl-input tbl-input--sm" value={m.ocupacao}
                    onChange={e => handleMembro(i, 'ocupacao', e.target.value)}
                    placeholder="Ocupação" />
                </td>
                <td>
                  <input className="tbl-input tbl-input--sm" value={m.renda}
                    onChange={e => handleMembro(i, 'renda', e.target.value)}
                    placeholder="0,00" />
                </td>
                <td>
                  <select className="tbl-input tbl-input--sm"
                    value={m.fatoresRisco}
                    onChange={e => handleMembro(i, 'fatoresRisco', e.target.value)}>
                    <option value="">—</option>
                    {FATORES_RISCO.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="legend-box">
        <p className="legend-title">Legenda — Fator de Risco Social (b):</p>
        <p className="legend-text">
          1. Alcoolismo; 2. Def. auditiva; 3. Def. física; 4. Def. mental; 5. Def. visual;
          6. Desemprego; 7. Drogadição; 8. HIV+; 9. Prob. psiquiátricos; 10. Situação de rua;
          11. Trabalho infantil; 12. Violência doméstica; 13. Med. Socioeducativa;
          14. Privação de liberdade; 15. Acolhimento Institucional; 16. Outro.
        </p>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <SectionTitle>Informações Complementares da Família (FL. 2/2)</SectionTitle>
      <p className="step-desc">Registre informações sobre inserção em serviços e grau de instrução de cada membro.</p>

      <div className="table-scroll">
        <table className="membros-table">
          <thead>
            <tr>
              <th className="col-num">Nº</th>
              <th className="col-nome">Nome</th>
              <th>Estuda</th>
              <th>Grau de Instrução</th>
              <th>CCA</th>
              <th>CJ</th>
              <th>CEDESP</th>
              <th>NCI</th>
              <th className="col-outros">Outros serviços (especificar)</th>
            </tr>
          </thead>
          <tbody>
            {complementares.map((c, i) => (
              <tr key={i} className={i % 2 === 0 ? 'tr-even' : 'tr-odd'}>
                <td className="col-num td-num">{i + 1}.</td>
                <td>
                  <input className="tbl-input" value={c.nome}
                    onChange={e => handleComplementar(i, 'nome', e.target.value)}
                    placeholder="Nome" />
                </td>
                <td>
                  <select className="tbl-input tbl-input--xs"
                    value={c.estuda}
                    onChange={e => handleComplementar(i, 'estuda', e.target.value)}>
                    <option value="">—</option>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>
                </td>
                <td>
                  <select className="tbl-input tbl-input--sm"
                    value={c.grauInstrucao}
                    onChange={e => handleComplementar(i, 'grauInstrucao', e.target.value)}>
                    <option value="">—</option>
                    <option>Analfabeto</option>
                    <option>Fund. Incompleto</option>
                    <option>Fund. Completo</option>
                    <option>Médio Incompleto</option>
                    <option>Médio Completo</option>
                    <option>Superior Incompleto</option>
                    <option>Superior Completo</option>
                  </select>
                </td>
                {['cca', 'cj', 'cedesp', 'nci'].map(field => (
                  <td key={field} className="td-center">
                    <input type="checkbox" className="tbl-check"
                      checked={c[field]}
                      onChange={e => handleComplementar(i, field, e.target.checked)} />
                  </td>
                ))}
                <td>
                  <input className="tbl-input" value={c.outros}
                    onChange={e => handleComplementar(i, 'outros', e.target.value)}
                    placeholder="Especificar..." />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionTitle>Demanda Apresentada / Orientações / Encaminhamentos</SectionTitle>
      <div className="fields-grid fields-grid--1">
        <Field label="Descreva a demanda, orientações e encaminhamentos realizados">
          <textarea name="demanda" value={form.demanda} onChange={handle}
            className="field-textarea"
            rows={8}
            placeholder="Descreva aqui a demanda apresentada pela família, as orientações fornecidas e os encaminhamentos realizados..." />
        </Field>
      </div>

      <SectionTitle>Técnico Responsável</SectionTitle>
      <div className="fields-grid fields-grid--3">
        <Field label="Técnico de Referência do Atendimento" span={2}>
          <Input name="tecnico" value={form.tecnico} onChange={handle} placeholder="Nome do técnico responsável" />
        </Field>
        <Field label="Data">
          <Input name="dataTecnico" value={form.dataTecnico} onChange={handle} placeholder="dd/mm/aaaa" />
        </Field>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <SectionTitle>Documentos da Família</SectionTitle>
      <p className="step-desc">
        Anexe documentos em PDF, PNG, JPG, JPEG ou outros formatos (máx. 10 MB por arquivo).
      </p>

      {/* Drop zone */}
      <div
        className={`upload-zone${dragOver ? ' upload-zone--over' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.webp,.doc,.docx,.xls,.xlsx"
          style={{ display: 'none' }}
          onChange={e => addFiles(e.target.files)}
        />
        <div className="upload-zone-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="17 8 12 3 7 8" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="3" x2="12" y2="15" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="upload-zone-title">Arraste arquivos aqui ou clique para selecionar</p>
        <p className="upload-zone-hint">PDF, PNG, JPG, JPEG, DOC, XLS — até 10 MB cada</p>
        <button className="upload-zone-btn" type="button" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
          Selecionar arquivos
        </button>
      </div>

      {/* Documentos sugeridos */}
      <div className="docs-sugest-grid">
        <div className="docs-sugest-card">
          <p className="sugest-card-title">📋 Documentos sugeridos</p>
          {[
            'RG / CPF do responsável',
            'Comprovante de residência',
            'Certidão de nascimento (membros)',
            'Cartão do Bolsa Família / BPC',
            'CTPS — Carteira de Trabalho',
            'Laudo médico (se houver deficiência)',
          ].map(s => (
            <p key={s} className="sugest-item-txt">• {s}</p>
          ))}
        </div>
      </div>

      {/* Lista de arquivos */}
      {uploadedFiles.length > 0 && (
        <div className="files-list">
          <p className="files-list-title">Arquivos anexados ({uploadedFiles.length})</p>
          {uploadedFiles.map(f => (
            <div key={f.id} className="file-row">
              <div className="file-icon">{fileIcon(f.type)}</div>
              <div className="file-info">
                <input
                  className="file-label-input"
                  value={f.label}
                  onChange={e => renameFile(f.id, e.target.value)}
                  placeholder="Nome do documento..."
                  title="Clique para nomear o documento"
                />
                <span className="file-original">{f.originalName} · {fmtSize(f.size)}</span>
              </div>
              <button className="file-remove" onClick={() => setUploadedFiles(p => p.filter(x => x.id !== f.id))} title="Remover">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderStep4 = () => {
    const membrosFilled = membros.filter(m => m.nome.trim());
    return (
      <>
        <SectionTitle>Revisão do Cadastro</SectionTitle>
        <p className="step-desc">Confira os dados antes de finalizar o cadastro da família.</p>

        <div className="review-grid">
          <div className="review-card">
            <p className="review-card-title">👤 Representante</p>
            <ReviewRow label="Nome" value={form.nomeRepresentante} />
            <ReviewRow label="CPF" value={form.cpf} />
            <ReviewRow label="Nascimento" value={form.nascimento} />
            <ReviewRow label="Gênero" value={form.genero?.replace('_', '-')} />
            <ReviewRow label="Estado Civil" value={form.estadoCivil} />
            <ReviewRow label="Grau de Instrução" value={form.grauInstrucao?.replace(/_/g, ' ')} />
          </div>
          <div className="review-card">
            <p className="review-card-title">🏠 Endereço e Moradia</p>
            <ReviewRow label="Endereço" value={`${form.endereco}${form.numEnd ? `, ${form.numEnd}` : ''}${form.complemento ? ` - ${form.complemento}` : ''}`} />
            <ReviewRow label="Bairro" value={form.bairro} />
            <ReviewRow label="CEP" value={form.cep} />
            <ReviewRow label="Moradia" value={form.condicoesMoradia} />
            <ReviewRow label="Tipo" value={form.tipoConstrucao} />
          </div>
          <div className="review-card">
            <p className="review-card-title">👨‍👩‍👧‍👦 Composição Familiar</p>
            <ReviewRow label="Membros preenchidos" value={`${membrosFilled.length} de 12`} />
            {membrosFilled.slice(0, 5).map((m, i) => (
              <ReviewRow key={i} label={`#${membros.indexOf(m) + 1}`} value={`${m.nome}${m.parentesco ? ` — ${m.parentesco}` : ''}`} />
            ))}
            {membrosFilled.length > 5 && <p className="review-more">+ {membrosFilled.length - 5} mais...</p>}
          </div>
          <div className="review-card">
            <p className="review-card-title">📁 Documentos</p>
            <ReviewRow label="Arquivos anexados" value={`${uploadedFiles.length} arquivo(s)`} />
            {uploadedFiles.slice(0, 4).map(f => (
              <ReviewRow key={f.id} label="•" value={f.label || f.originalName} />
            ))}
          </div>
        </div>

        <div className="review-final">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <p>Ao confirmar, o cadastro será salvo e ficará disponível na lista de famílias.</p>
        </div>
      </>
    );
  };

  const stepContent = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4];

  return (
    <Layout>
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link to="/familias" className="bc-link">Famílias</Link>
        <span className="bc-sep">›</span>
        <span className="bc-current">Nova família</span>
      </div>

      {/* HEADER */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Ficha Cadastral da Família</h1>
          <p className="page-sub">SMADS/CPSB — Serviço de Assistência Social à Família e Proteção Social Básica no Domicílio</p>
        </div>
      </div>

      {/* STEP PROGRESS */}
      <div className="step-progress">
        {STEPS.map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div
              className={`step-item${i === currentStep ? ' step-item--active' : i < currentStep ? ' step-item--done' : ''}`}
              style={{ cursor: i < currentStep ? 'pointer' : 'default' }}
              onClick={() => i < currentStep && setCurrentStep(i)}
            >
              <div className="step-num">
                {i < currentStep
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : i + 1
                }
              </div>
              <span className="step-label">{step}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-connector${i < currentStep ? ' step-connector--done' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* FORM CARD */}
      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-section-title">{STEPS[currentStep]}</h2>
          <span className="etapa-badge">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Etapa {currentStep + 1} de {STEPS.length}
          </span>
        </div>

        {stepContent[currentStep]()}

        <div className="form-actions">
          {currentStep > 0 && (
            <button className="btn-secondary" onClick={goPrev}>← Voltar</button>
          )}
          <button className="btn-secondary" onClick={() => {}}>Salvar rascunho</button>
          {currentStep < STEPS.length - 1 ? (
            <button className="btn-primary" onClick={goNext}>Próxima etapa →</button>
          ) : (
            <button className="btn-primary btn-success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Confirmar cadastro
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NovosCadastro;
