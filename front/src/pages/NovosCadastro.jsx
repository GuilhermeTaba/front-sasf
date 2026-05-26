import { useState } from 'react';
import { Link } from 'react-router';
import Layout from '../components/Layout';
import './NovosCadastro.css';

const STEPS = ['Dados do responsável', 'Membros da família', 'Documentos', 'Revisão'];

const NovosCadastro = () => {
  const [currentStep] = useState(0);
  const [form, setForm] = useState({
    nome: 'Maria Oliveira da Silva',
    cpf: '123.456.789-00',
    nascimento: '04/11/1987',
    telefone: '(92) 99878-1234',
    cep: '69050-040',
    endereco: 'Rua das Acácias, 142',
    bairro: 'Jardim Chico Mendes',
    membros: '5',
    renda: 'R$ 1.420,00',
    programas: 'Bolsa Família; BPC',
  });

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

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
          <h1 className="page-title">Cadastrar nova família</h1>
          <p className="page-sub">Preencha os dados do responsável familiar, integrantes e documentos.</p>
        </div>
      </div>

      {/* STEP PROGRESS */}
      <div className="step-progress">
        {STEPS.map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div className={`step-item${i === currentStep ? ' step-item--active' : i < currentStep ? ' step-item--done' : ''}`}>
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

      <div className="cadastro-grid">
        {/* FORM */}
        <div className="form-card">
          <div className="form-card-header">
            <h2 className="form-section-title">Dados do responsável familiar</h2>
            <span className="etapa-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Etapa 1 de 4
            </span>
          </div>

          <div className="fields-grid">
            {[
              { name: 'nome',      label: 'Nome do responsável',    span: 2 },
              { name: 'cpf',       label: 'CPF',                    span: 1 },
              { name: 'nascimento',label: 'Data de nascimento',     span: 1 },
              { name: 'telefone',  label: 'Telefone',               span: 1 },
              { name: 'cep',       label: 'CEP',                    span: 1 },
              { name: 'endereco',  label: 'Endereço completo',      span: 2 },
              { name: 'bairro',    label: 'Bairro / Região',        span: 1 },
              { name: 'membros',   label: 'Qtd. de membros',        span: 1 },
              { name: 'renda',     label: 'Renda familiar mensal',  span: 1 },
              { name: 'programas', label: 'Programas sociais',      span: 1 },
            ].map(({ name, label, span }) => (
              <div key={name} className="field-group" style={span === 2 ? { gridColumn: '1 / -1' } : {}}>
                <label>{label}</label>
                <input name={name} value={form[name]} onChange={handle} />
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button className="btn-secondary">Cancelar</button>
            <button className="btn-primary">Próxima etapa →</button>
          </div>
        </div>

        {/* DOCS */}
        <div className="docs-col">
          <div className="docs-card">
            <h3 className="docs-title">Documentos da família</h3>
            <p className="docs-sub">Você pode anexar agora ou na etapa 3</p>

            <div className="upload-area">
              <div className="upload-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                    stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="upload-text">Arraste ou clique para enviar</p>
              <p className="upload-hint">PDF, JPG, PNG — até 10 MB cada</p>
            </div>

            <div className="docs-sugest">
              <p className="sugest-title">Documentos sugeridos</p>
              {[
                'RG / CPF do responsável',
                'Comprovante de residência',
                'Certidão de nascimento',
              ].map(s => (
                <label key={s} className="sugest-item">
                  <input type="checkbox" />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="docs-info-card">
            <div className="info-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="info-text">
              Os documentos podem ser adicionados ou atualizados a qualquer momento no perfil da família.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NovosCadastro;
