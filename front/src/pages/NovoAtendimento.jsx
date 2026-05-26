import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../components/Layout';
import './NovoAtendimento.css';

const RESPONSAVEIS = [
  'Carlos Oliveira', 'Marta Lima', 'João Ribeiro', 'Fernanda Souza',
  'Paulo Costa', 'Lúcia Pereira', 'Ricardo Mendes', 'Sandra Almeida',
];

const AI_SIMULATION =
  'Com base no áudio registrado, o atendimento indica situação de vulnerabilidade ' +
  'socioeconômica. Recomenda-se encaminhamento ao CRAS para inclusão no Programa ' +
  'Bolsa Família e verificação de acesso ao benefício de habitação. A família demonstra ' +
  'interesse em participação nos grupos de fortalecimento de vínculos comunitários.';

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const NovoAtendimento = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tipo: '',
    responsavel: '',
    tecnico: 'Ana Silva',
    data: new Date().toISOString().split('T')[0],
    local: '',
    observacoes: '',
  });

  /* ── gravação ── */
  const [recState, setRecState] = useState('idle'); // idle | recording | recorded | processing | done
  const [audioUrl, setAudioUrl] = useState(null);
  const [aiText, setAiText]     = useState('');
  const [recTime, setRecTime]   = useState(0);

  const mediaRef  = useRef(null);
  const chunksRef = useRef([]);
  const timerRef  = useRef(null);

  const startRecording = async () => {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        setRecState('recorded');
      };

      recorder.start();
      mediaRef.current = recorder;
      setRecState('recording');
      setRecTime(0);
      timerRef.current = setInterval(() => setRecTime((t) => t + 1), 1000);
    } catch {
      alert('Permita o acesso ao microfone para gravar.');
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    mediaRef.current?.stop();
  };

  const handleRecord = () => {
    if (recState === 'recording') {
      stopRecording();
    } else {
      setAudioUrl(null);
      setAiText('');
      startRecording();
    }
  };

  const sendToAI = () => {
    setRecState('processing');
    setTimeout(() => {
      setAiText(AI_SIMULATION);
      setRecState('done');
    }, 2400);
  };

  const useAiText = () =>
    setForm((f) => ({ ...f, observacoes: aiText }));

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <Layout>
      {/* ── HEADER ── */}
      <div className="page-header">
        <div>
          <p className="page-section">Atendimentos</p>
          <h1 className="page-title">Novo Atendimento</h1>
          <p className="page-sub">Preencha os dados e registre o atendimento</p>
        </div>
        <div className="na-header-actions">
          <button className="btn-secondary" onClick={() => navigate('/atendimentos')}>
            Cancelar
          </button>
          <button className="btn-primary">Salvar atendimento</button>
        </div>
      </div>

      {/* ── GRID 2 colunas ── */}
      <div className="na-grid">

        {/* ── COLUNA ESQUERDA: formulário ── */}
        <div className="na-card">
          <h2 className="na-card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
              <line x1="9" y1="16" x2="13" y2="16"/>
            </svg>
            Dados do atendimento
          </h2>

          <div className="na-field">
            <label className="na-label">Tipo de atendimento</label>
            <select className="na-select" value={form.tipo} onChange={set('tipo')}>
              <option value="">Selecione o tipo...</option>
              <option>Visita domiciliar</option>
              <option>Acompanhamento</option>
              <option>Entrevista social</option>
              <option>Encaminhamento</option>
              <option>Reunião de grupo</option>
            </select>
          </div>

          <div className="na-field">
            <label className="na-label">Responsável pela família</label>
            <select className="na-select" value={form.responsavel} onChange={set('responsavel')}>
              <option value="">Selecione o responsável...</option>
              {RESPONSAVEIS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div className="na-row2">
            <div className="na-field">
              <label className="na-label">Técnico responsável</label>
              <input
                className="na-input"
                value={form.tecnico}
                onChange={set('tecnico')}
                placeholder="Nome do técnico"
              />
            </div>
            <div className="na-field">
              <label className="na-label">Data do atendimento</label>
              <input
                type="date"
                className="na-input"
                value={form.data}
                onChange={set('data')}
              />
            </div>
          </div>

          <div className="na-field">
            <label className="na-label">Local</label>
            <input
              className="na-input"
              value={form.local}
              onChange={set('local')}
              placeholder="Ex: Residência, CRAS, SASF, UBS..."
            />
          </div>

          <div className="na-field">
            <label className="na-label">Observações / Relatório</label>
            <textarea
              className="na-textarea"
              rows={6}
              placeholder="Descreva o atendimento realizado..."
              value={form.observacoes}
              onChange={set('observacoes')}
            />
          </div>
        </div>

        {/* ── COLUNA DIREITA: gravação de voz ── */}
        <div className="na-card na-voice-card">
          <h2 className="na-card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
              <path d="M19 10v2a7 7 0 01-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            Registro em áudio
          </h2>
          <p className="na-voice-sub">
            Grave um relato verbal do atendimento — a IA irá transcrever e sugerir o relatório.
          </p>

          {/* Botão gravar */}
          <div className="na-rec-area">
            <button
              className={`na-rec-btn${recState === 'recording' ? ' na-rec-btn--on' : ''}`}
              onClick={handleRecord}
              aria-label={recState === 'recording' ? 'Parar gravação' : 'Iniciar gravação'}
            >
              {recState === 'recording' ? (
                /* Ícone parar */
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5" y="5" width="14" height="14" rx="3"/>
                </svg>
              ) : (
                /* Ícone microfone */
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                  <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              )}
            </button>

            {recState === 'recording' && (
              <div className="na-rec-status">
                <span className="na-rec-dot" />
                <span className="na-rec-time">{fmt(recTime)}</span>
                <span className="na-rec-hint">Gravando… clique para parar</span>
              </div>
            )}

            {recState === 'idle' && (
              <p className="na-rec-hint-idle">Clique no microfone para iniciar a gravação</p>
            )}
          </div>

          {/* Player + IA — aparece após gravar */}
          {audioUrl && recState !== 'idle' && recState !== 'recording' && (
            <div className="na-audio-section">
              {/* Cabeçalho do áudio */}
              <div className="na-audio-header">
                <span className="na-audio-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                    <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                  </svg>
                  Áudio salvo
                </span>
                <button className="na-regravar" onClick={handleRecord}>
                  ↺ Regravar
                </button>
              </div>

              {/* Player nativo */}
              <audio controls src={audioUrl} className="na-player" />

              {/* Botão enviar para IA */}
              {recState === 'recorded' && (
                <button className="na-ai-btn" onClick={sendToAI}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                  Enviar para IA
                </button>
              )}

              {/* Carregando */}
              {recState === 'processing' && (
                <div className="na-ai-loading">
                  <div className="na-spinner" />
                  <span>Analisando áudio com IA…</span>
                </div>
              )}

              {/* Resultado da IA */}
              {recState === 'done' && aiText && (
                <div className="na-ai-result">
                  <div className="na-ai-result-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                    Análise gerada pela IA
                  </div>
                  <p className="na-ai-text">{aiText}</p>
                  <button className="na-use-btn" onClick={useAiText}>
                    ✓ Usar no relatório
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NovoAtendimento;
