# API — Instrumentos do SASF-2

Documentação completa de todas as rotas dos 8 instrumentos do sistema. Para o padrão de integração React (POST vs PUT, useParams, useEffect), consulte [INTEGRACAO.md](./INTEGRACAO.md).

---

## Índice

1. [Informações Gerais](#1-informações-gerais)
2. [Ficha Cadastral](#2-ficha-cadastral)
3. [Ficha de Atualização](#3-ficha-de-atualização)
4. [Ficha de Visita Domiciliar](#4-ficha-de-visita-domiciliar)
5. [Plano de Desenvolvimento Familiar](#5-plano-de-desenvolvimento-familiar)
6. [Plano de Desenvolvimento PDU](#6-plano-de-desenvolvimento-pdu)
7. [Folha de Prosseguimento](#7-folha-de-prosseguimento)
8. [Termo de Autorização de Imagem](#8-termo-de-autorização-de-imagem)
9. [Áudio de Atendimento](#9-áudio-de-atendimento)
10. [Transcrição e Resumo por IA](#10-transcrição-e-resumo-por-ia)
11. [Referência de Enums](#11-referência-de-enums)
12. [Códigos de Resposta HTTP](#12-códigos-de-resposta-http)

---

## 1. Informações Gerais

**Base URL (desenvolvimento):** `http://localhost:8080`

**Autenticação:** JWT via header `Authorization: Bearer <token>`. O token é obtido no endpoint de login e deve ser enviado em todas as requisições.

**Content-Type:** `application/json` em todas as requisições POST/PUT.

**Formato de datas:** A API espera e retorna datas como `yyyy-MM-dd` (ex: `"2024-03-15"`) e timestamps como `yyyy-MM-ddTHH:mm:ss` (ex: `"2024-03-15T14:30:00"`). O frontend deve converter `dd/mm/yyyy` para `yyyy-MM-dd` antes de enviar.

**IDs de entidades relacionadas:** Técnicos e orientadores são referenciados por `Integer tecnicoId` / `Integer orientadorId`, não por objeto aninhado.

---

## 2. Ficha Cadastral

Documento principal de cadastro da família no serviço SASF. Contém dados pessoais, documentação, moradia, benefícios e composição familiar.

**Base path:** `/familias/{familiaId}/cadastro`

---

### `POST /familias/{familiaId}/cadastro`

Cria uma nova ficha cadastral para a família.

**Request Body:**
```json
{
  "nomeServicoSasf": "SASF Vila Madalena",
  "cas": "001",
  "cras": "CRAS Centro",
  "numeroMatricula": "2024/0001",
  "dataMatricula": "2024-01-15",
  "dataDesligamento": null,
  "nomeRepresentanteFamilia": "Maria Silva",
  "nomeSocialRepresentante": null,
  "sexo": "FEMININO",
  "nis": "12345678901",
  "rg": "12.345.678-9",
  "cpf": "123.456.789-00",
  "dataNascimento": "1980-05-20",
  "naturalidadeMunicipioEstado": "São Paulo - SP",
  "corRaca": "PARDA",
  "pessoaComDeficiencia": false,
  "certidaoNumero": null,
  "dataEmissao": null,
  "orgaoEmissor": null,
  "uf": "SP",
  "ctpsN": null,
  "serie": null,
  "mae": "Ana Silva",
  "pai": "João Silva",
  "estadoCivil": "CASADO",
  "analfabeto": false,
  "ensinoFundamental": "COMPLETO",
  "ensinoMedio": "COMPLETO",
  "ensinoSuperior": "INCOMPLETO",
  "profissao": "Auxiliar Administrativo",
  "ocupacao": "Empregada",
  "situacaoEmprego": "EMPREGADO",
  "renda": 1800.00,
  "endereco": "Rua das Flores",
  "numero": "123",
  "complemento": "Apto 2",
  "bairro": "Centro",
  "cep": "01234-567",
  "distrito": "Sé",
  "telefoneResidencial": "11 3333-4444",
  "telefoneCelular": "11 91234-5678",
  "telefoneRecado": null,
  "pontoReferencia": "Próximo ao mercado",
  "condicaoMoradia": "ALUGADA",
  "numeroComodos": 3,
  "valorAluguel": 900.00,
  "tipoConstrucao": "ALVENARIA",
  "situacaoHabitacional": "FAVELA",
  "recebeProgramaTransferenciaRenda": true,
  "programaRenda": "BOLSA_FAMILIA",
  "recebeBeneficioPrestacaoContinuada": false,
  "tipoBeneficioPrestacaoContinuada": null,
  "composicaoFamiliar": [
    {
      "nome": "Carlos Silva",
      "parentesco": "Filho",
      "dataNascimento": "2010-08-10",
      "cpf": "111.222.333-44",
      "nis": "98765432100",
      "rg": "11.111.111-1",
      "situacaoEmprego": "DESEMPREGADO",
      "renda": 0
    }
  ],
  "informacoesComplementares": [
    {
      "descricao": "Família em situação de vulnerabilidade alimentar"
    }
  ],
  "demandaApresentada": "Solicitação de acompanhamento familiar",
  "orientacoes": "Encaminhado ao CRAS para benefícios",
  "encaminhamentos": "CRAS - Bolsa Família",
  "tecnicoId": 3,
  "orientadorId": 1,
  "data": "2024-01-15"
}
```

**Response (201 Created):**
```json
{
  "id": 42,
  "familiaId": 7,
  "nomeServicoSasf": "SASF Vila Madalena",
  "cas": "001",
  "cras": "CRAS Centro",
  "numeroMatricula": "2024/0001",
  "dataMatricula": "2024-01-15",
  "nomeRepresentanteFamilia": "Maria Silva",
  "nomeTecnico": "Fernanda Costa",
  "situacaoEmprego": "EMPREGADO",
  "condicaoMoradia": "ALUGADA",
  "composicaoFamiliar": [ { "..." } ],
  "informacoesComplementares": [ { "..." } ]
}
```

> Todos os campos do request são espelhados na response, acrescidos de `id`, `familiaId` e `nomeTecnico`.

---

### `GET /familias/{familiaId}/cadastro`

Lista todas as fichas cadastrais de uma família.

**Response (200 OK):**
```json
[
  {
    "id": 42,
    "familiaId": 7,
    "nomeRepresentanteFamilia": "Maria Silva",
    "numeroMatricula": "2024/0001",
    "dataMatricula": "2024-01-15",
    "nomeTecnico": "Fernanda Costa"
  }
]
```

---

### `GET /familias/{familiaId}/cadastro/{fichaId}`

Retorna uma ficha cadastral específica com todos os campos.

**Response (200 OK):** objeto completo igual ao retorno do POST.

**Erro:** `404 Not Found` se a ficha não existir ou não pertencer a essa família.

---

### `PUT /familias/{familiaId}/cadastro/{fichaId}`

Atualiza uma ficha cadastral existente. O body segue o mesmo formato do POST.

**Response (200 OK):** objeto atualizado completo.

---

### `DELETE /familias/{familiaId}/cadastro/{fichaId}`

Remove uma ficha cadastral.

**Response (204 No Content)**

---

### `GET /familias/{familiaId}/cadastro/{fichaId}/latex`

Gera o template LaTeX da ficha para compilação manual.

**Response (200 OK):** `text/plain` com o código LaTeX.

---

### `GET /familias/{familiaId}/cadastro/{fichaId}/pdf`

Gera e retorna o PDF da ficha pronto para download.

**Response (200 OK):** `application/pdf` como stream de bytes.

**Uso no frontend:**
```js
const res = await fetch(`${API_URL}/familias/${id}/cadastro/${fichaId}/pdf`, {
  headers: { Authorization: `Bearer ${token}` }
});
const blob = await res.blob();
const url = URL.createObjectURL(blob);
window.open(url); // abre o PDF em nova aba
```

---

## 3. Ficha de Atualização

Registra a atualização periódica da situação familiar: composição, benefícios, escolaridade e demandas de proteção social.

**Base path:** `/familias/{familiaId}/atualizacoes`

Os endpoints seguem o mesmo padrão: `POST`, `GET` (lista), `GET /{fichaId}`, `PUT /{fichaId}`, `DELETE /{fichaId}`, `GET /{fichaId}/latex`, `GET /{fichaId}/pdf`.

---

### `POST /familias/{familiaId}/atualizacoes`

**Request Body:**
```json
{
  "numeroMatricula": "2024/0001",
  "nomeRepresentanteFamilia": "Maria Silva",
  "nomeSocialRepresentante": null,
  "nis": "12345678901",
  "cpf": "123.456.789-00",
  "dataNascimento": "1980-05-20",
  "membrosAtualizados": [
    {
      "nome": "Carlos Silva",
      "parentesco": "Filho",
      "dataNascimento": "2010-08-10",
      "cpf": "111.222.333-44",
      "nis": "98765432100"
    }
  ],
  "zeroACinco": 0,
  "seisAQuatorze": 1,
  "quinzeADezessete": 0,
  "dezoitoAVinteENove": 2,
  "trintaACinquentaENove": 1,
  "sessentaMais": 0,
  "pcd": 0,
  "bpcIdoso": 0,
  "bpcPcd": 0,
  "bolsaFamilia": 1,
  "condicionalidades": "Em dia",
  "status": "Ativo",
  "aguardandoVagaEmei": 0,
  "frequentaCei": 0,
  "frequentaEmei": 1,
  "foraEscola": 0,
  "aguardandoVagaEscola": 0,
  "ensinoFundamental": 1,
  "ensinoMedio": 0,
  "eja": 0,
  "pcdEscola": 0,
  "cursoSuperior": 0,
  "cca": 0,
  "cj": 0,
  "cedesp": 0,
  "nci": 0,
  "naispd": 0,
  "vacinaAtualizada": 1,
  "mulheresGestantes": 0,
  "gestantesPreNatal": 0,
  "situacaoRua": 0,
  "trabalhoInfantil": 0,
  "dependencia": 0,
  "adolescenteMse": 0,
  "adolescenteInternacao": 0,
  "adultoPrivado": 0,
  "criancasSaica": 0,
  "idosoAcolhimento": 0,
  "observacoes": "Família em acompanhamento regular",
  "pdf": false,
  "pdu": false,
  "dt": "2024-03-01",
  "tecnicoId": 3,
  "responsavel": "Fernanda Costa"
}
```

**Response (201 Created):** todos os campos acima + `id`, `familiaId`, `nomeTecnico`.

---

### `GET /familias/{familiaId}/atualizacoes`

Lista todas as fichas de atualização da família.

**Response (200 OK):** array de objetos com todos os campos.

---

### `GET /familias/{familiaId}/atualizacoes/{fichaId}`

Retorna uma ficha de atualização específica.

---

### `PUT /familias/{familiaId}/atualizacoes/{fichaId}`

Atualiza a ficha. Body igual ao POST.

---

### `DELETE /familias/{familiaId}/atualizacoes/{fichaId}`

**Response (204 No Content)**

---

### `GET /familias/{familiaId}/atualizacoes/{fichaId}/latex` e `.../pdf`

Mesma lógica da Ficha Cadastral.

---

## 4. Ficha de Visita Domiciliar

Registra visitas realizadas pela equipe técnica à residência da família.

**Base path:** `/familias/{familiaId}/visitas`

---

### `POST /familias/{familiaId}/visitas`

**Request Body:**
```json
{
  "nomeServicoSASF": "SASF Vila Madalena",
  "cras": "CRAS Centro",
  "tecnicoId": 3,
  "dataPreenchimento": "2024-03-10",
  "nomeRepresentanteFamilia": "Maria Silva",
  "numeroNIS_NIT_NB": "12345678901",
  "endereco": "Rua das Flores, 123 - Apto 2 - Centro",
  "objetivoVisita": "Verificar condições habitacionais e acompanhamento do PIA",
  "pessoasEntrevistadas": "Maria Silva (representante), Carlos Silva (filho)",
  "conteudoFolha": "Família recebeu a visita de forma receptiva. Condições de moradia apresentam..."
}
```

**Response (201 Created):**
```json
{
  "id": 15,
  "familiaId": 7,
  "nomeServicoSASF": "SASF Vila Madalena",
  "cras": "CRAS Centro",
  "nomeTecnico": "Fernanda Costa",
  "dataPreenchimento": "2024-03-10",
  "nomeRepresentanteFamilia": "Maria Silva",
  "numeroNIS_NIT_NB": "12345678901",
  "endereco": "Rua das Flores, 123 - Apto 2 - Centro",
  "objetivoVisita": "Verificar condições habitacionais...",
  "pessoasEntrevistadas": "Maria Silva (representante), Carlos Silva (filho)",
  "conteudoFolha": "Família recebeu a visita..."
}
```

---

### `GET /familias/{familiaId}/visitas`

Lista todas as visitas domiciliares da família.

---

### `GET /familias/{familiaId}/visitas/{fichaId}`

Retorna uma visita específica.

---

### `PUT /familias/{familiaId}/visitas/{fichaId}`

Atualiza uma visita. Body igual ao POST.

---

### `DELETE /familias/{familiaId}/visitas/{fichaId}`

**Response (204 No Content)**

---

### `GET /familias/{familiaId}/visitas/{fichaId}/latex` e `.../pdf`

Exportação em LaTeX e PDF.

---

## 5. Plano de Desenvolvimento Familiar

Plano estruturado com diagnóstico, objetivos e itens de intervenção junto à família.

**Base path:** `/familias/{familiaId}/desenvolvimentos`

---

### `POST /familias/{familiaId}/desenvolvimentos`

**Request Body:**
```json
{
  "nomeServicoSASF": "SASF Vila Madalena",
  "CAS": "001",
  "CRAS": "CRAS Centro",
  "nomeRepresentanteFamilia": "Maria Silva",
  "numeroMatricula": "2024/0001",
  "numeroNIS_BDC": "12345678901",
  "numeroRG": "12.345.678-9",
  "analiseDiagnostica": "Família em situação de vulnerabilidade com baixa renda e risco de rompimento de vínculos.",
  "objetivo": "Fortalecer vínculos familiares e promover autonomia financeira.",
  "itens": [
    {
      "estrategiasIntervencao": "Grupos socioeducativos semanais",
      "CRAS": "CRAS Centro",
      "familia": "Participação ativa nos grupos",
      "prazo": "6 meses",
      "resultadosEsperados": "Melhora na comunicação familiar"
    }
  ],
  "numeroPlano": "PDF-2024/001",
  "dataElaboracaoPlano": "2024-02-01",
  "dataValidadePlano": "2024-08-01",
  "dataReavaliacaoPlano": "2024-05-01",
  "dataDesligamento": null,
  "tecnico": "Fernanda Costa"
}
```

**Response (201 Created):** todos os campos + `id`, `familiaId`.

---

### `GET /familias/{familiaId}/desenvolvimentos`

Lista todos os planos da família.

---

### `GET /familias/{familiaId}/desenvolvimentos/{planoId}`

Retorna um plano específico com todos os itens.

---

### `PUT /familias/{familiaId}/desenvolvimentos/{planoId}`

Atualiza o plano. Body igual ao POST.

---

### `DELETE /familias/{familiaId}/desenvolvimentos/{planoId}`

**Response (204 No Content)**

---

### `GET /familias/{familiaId}/desenvolvimentos/{planoId}/latex` e `.../pdf`

Exportação em LaTeX e PDF.

---

## 6. Plano de Desenvolvimento PDU

Plano voltado a situações de agravo e alta complexidade, com análise de risco e ações intersetoriais.

**Base path:** `/familias/{familiaId}/pdus`

---

### `POST /familias/{familiaId}/pdus`

**Request Body:**
```json
{
  "nomeServicoSASF": "SASF Vila Madalena",
  "CAS": "001",
  "CRAS": "CRAS Centro",
  "nomeBeneficiario": "Carlos Silva",
  "faixaEtaria": "CRIANCA",
  "nomeRepresentanteFamilia": "Maria Silva",
  "numeroNIS_NIT_NB": "12345678901",
  "nomeCuidadorResponsavel": "Maria Silva",
  "nomeTecnico": "Fernanda Costa",
  "sinteseSituacao": "Criança com histórico de negligência e sinais de trabalho infantil.",
  "situacaoAgravo": {
    "fragilizacaoVinculosFamiliares": true,
    "rompimentoVinculosFamiliares": false,
    "confinamento": false,
    "isolamento": false,
    "ausenciaCuidador": true,
    "semAcessoEducacao": false,
    "semAcessoSaude": false,
    "semAcessoTransporte": false,
    "semAcessoRede": false,
    "violenciaDomestica": false,
    "outras": "Trabalho infantil identificado"
  },
  "acoesPropostas": "Inserção no CCA, encaminhamento ao Conselho Tutelar",
  "acoesPactuadas": "Família se compromete a manter criança na escola",
  "acoesIntersetorais": "Saúde: acompanhamento nutricional; Educação: vaga na escola",
  "itens": [
    {
      "situacoesDeAgravoIdentificadas": "Trabalho infantil",
      "CRAS": "Acompanhamento familiar",
      "CREAS": null,
      "saude": "Acompanhamento nutricional",
      "educacao": "Garantia de vaga escolar",
      "trabalho": null,
      "outros": "Conselho Tutelar notificado",
      "prazo": "30 dias",
      "resultadosEsperados": "Criança fora do trabalho infantil e frequentando escola"
    }
  ],
  "numeroPlano": "PDU-2024/001",
  "dataElaboracaoPlano": "2024-02-15",
  "dataValidadePlano": "2024-08-15",
  "dataReavaliacaoPlano": "2024-05-15",
  "dataDesligamento": null,
  "tecnico": "Fernanda Costa"
}
```

**Response (201 Created):** todos os campos + `id`, `familiaId`.

---

### `GET /familias/{familiaId}/pdus`

Lista todos os PDUs da família.

---

### `GET /familias/{familiaId}/pdus/{planoId}`

Retorna um PDU específico com itens e situação de agravo.

---

### `PUT /familias/{familiaId}/pdus/{planoId}`

Atualiza o PDU. Body igual ao POST.

---

### `DELETE /familias/{familiaId}/pdus/{planoId}`

**Response (204 No Content)**

---

### `GET /familias/{familiaId}/pdus/{planoId}/latex` e `.../pdf`

Exportação em LaTeX e PDF.

---

## 7. Folha de Prosseguimento

Registro contínuo de atendimentos e evolução do caso. Funciona como um diário do acompanhamento.

**Base path:** `/familias/{familiaId}/folhas-prosseguimento`

---

### `POST /familias/{familiaId}/folhas-prosseguimento`

**Request Body:**
```json
{
  "numeroFolha": 1,
  "nomeRepresentanteFamilia": "Maria Silva",
  "numeroMatricula": "2024/0001",
  "numeroNIS_BDC": "12345678901",
  "conteudoFolha": "15/03/2024 - Atendimento realizado. Família relatou melhora na situação financeira após inserção no Bolsa Família. Técnica orientou sobre condicionalidades..."
}
```

**Response (201 Created):**
```json
{
  "id": 8,
  "familiaId": 7,
  "numeroFolha": 1,
  "nomeRepresentanteFamilia": "Maria Silva",
  "numeroMatricula": "2024/0001",
  "numeroNIS_BDC": "12345678901",
  "conteudoFolha": "15/03/2024 - Atendimento realizado..."
}
```

---

### `GET /familias/{familiaId}/folhas-prosseguimento`

Lista todas as folhas de prosseguimento da família.

---

### `GET /familias/{familiaId}/folhas-prosseguimento/{folhaId}`

Retorna uma folha específica.

---

### `PUT /familias/{familiaId}/folhas-prosseguimento/{folhaId}`

Atualiza o conteúdo da folha.

---

### `DELETE /familias/{familiaId}/folhas-prosseguimento/{folhaId}`

**Response (204 No Content)**

---

### `GET /familias/{familiaId}/folhas-prosseguimento/{folhaId}/latex` e `.../pdf`

Exportação em LaTeX e PDF.

---

## 8. Termo de Autorização de Imagem

Registro do consentimento da família para uso de fotos e imagens.

**Base path:** `/familias/{familiaId}/termos-autorizacao`

---

### `POST /familias/{familiaId}/termos-autorizacao`

**Request Body:**
```json
{
  "nome": "Maria Silva",
  "rg": "12.345.678-9",
  "cpf": "123.456.789-00",
  "criancas": "Carlos Silva (13 anos), Ana Silva (8 anos)",
  "data": "2024-03-15"
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "familiaId": 7,
  "nome": "Maria Silva",
  "rg": "12.345.678-9",
  "cpf": "123.456.789-00",
  "criancas": "Carlos Silva (13 anos), Ana Silva (8 anos)",
  "data": "2024-03-15"
}
```

---

### `GET /familias/{familiaId}/termos-autorizacao`

Lista todos os termos da família.

---

### `GET /familias/{familiaId}/termos-autorizacao/{termoId}`

Retorna um termo específico.

---

### `PUT /familias/{familiaId}/termos-autorizacao/{termoId}`

Atualiza o termo.

---

### `DELETE /familias/{familiaId}/termos-autorizacao/{termoId}`

**Response (204 No Content)**

---

### `GET /familias/{familiaId}/termos-autorizacao/{termoId}/latex` e `.../pdf`

Exportação em LaTeX e PDF.

---

## 9. Áudio de Atendimento

Registra atendimentos presenciais ou por visita domiciliar com possibilidade de gravação de áudio para transcrição posterior.

**Base paths:**
- `/familias/{familiaId}/audio-atendimento` — operações por família
- `/audio-atendimento` — listagem global (todos as famílias)

---

### `POST /familias/{familiaId}/audio-atendimento`

**Request Body:**
```json
{
  "tipoAtendimento": "AtendimentoNaSede",
  "local": "Sala de atendimento 2",
  "relatorio": "Família compareceu para atendimento. Foram discutidos encaminhamentos para o CRAS...",
  "data": "2024-03-15T14:30:00",
  "tecnicoId": 3
}
```

**Valores aceitos para `tipoAtendimento`:** `VisitaDomiciliar` | `AtendimentoNaSede`

**Response (201 Created):**
```json
{
  "id": 20,
  "familiaId": 7,
  "tipoAtendimento": "AtendimentoNaSede",
  "local": "Sala de atendimento 2",
  "relatorio": "Família compareceu para atendimento...",
  "data": "2024-03-15T14:30:00",
  "tecnicoId": 3
}
```

---

### `GET /familias/{familiaId}/audio-atendimento`

Lista todos os atendimentos de uma família específica.

**Response (200 OK):** array de objetos AudioAtendimento.

---

### `GET /audio-atendimento`

Lista todos os atendimentos do sistema (todas as famílias).

**Response (200 OK):** array de objetos AudioAtendimento.

---

### `GET /familias/{familiaId}/audio-atendimento/{audioId}`

Retorna um atendimento específico.

---

### `PUT /familias/{familiaId}/audio-atendimento/{audioId}`

Atualiza um atendimento. Body igual ao POST.

---

### `DELETE /familias/{familiaId}/audio-atendimento/{audioId}`

**Response (204 No Content)**

> O Áudio de Atendimento **não possui** exportação PDF/LaTeX.

---

## 10. Transcrição e Resumo por IA

Serviços auxiliares para transcrever áudio e gerar resumo automático via IA.

---

### `POST /api/transcricao`

Recebe um arquivo de áudio e retorna a transcrição textual (integração com whisper.cpp).

**Content-Type:** `multipart/form-data`

**Request:**
```
file: <arquivo de áudio> (mp3, wav, m4a, etc.)
```

**Response (200 OK):**
```json
{
  "transcricao": "Boa tarde, estamos iniciando o atendimento com a família Silva. A representante relata..."
}
```

---

### `POST /resumo`

Recebe um texto de transcrição e retorna um resumo gerado por IA.

**Request Body:**
```json
{
  "texto": "Boa tarde, estamos iniciando o atendimento com a família Silva. A representante relata situação de desemprego do cônjuge desde janeiro..."
}
```

**Response (200 OK):**
```json
{
  "resumo": "Atendimento realizado com família Silva. Principal demanda: desemprego do cônjuge desde janeiro. Família solicita encaminhamento para programas de geração de renda."
}
```

---

## 11. Referência de Enums

### `TipoAtendimento`
| Valor | Descrição |
|---|---|
| `VisitaDomiciliar` | Visita realizada na residência da família |
| `AtendimentoNaSede` | Atendimento presencial na sede do serviço |

### `CondicaoMoradia`
| Valor | Descrição |
|---|---|
| `PROPRIA` | Imóvel próprio |
| `ALUGADA` | Imóvel alugado |
| `CEDIDA` | Imóvel cedido |

### `TipoConstrucao`
| Valor | Descrição |
|---|---|
| `ALVENARIA` | Construção em alvenaria |
| `MADEIRA` | Construção em madeira |
| `MISTA` | Construção mista |

### `SituacaoHabitacional`
| Valor | Descrição |
|---|---|
| `CORTICO` | Cortiço |
| `FAVELA` | Favela / comunidade |
| `LOTEAMENTO_IRREGULAR` | Loteamento irregular |

### `SituacaoEmprego`
| Valor | Descrição |
|---|---|
| `EMPREGADO` | Empregado formalmente |
| `DESEMPREGADO` | Desempregado |
| `APOSENTADO` | Aposentado |
| `PENSIONISTA` | Pensionista |

### `ProgramaTransferenciaRenda`
| Valor | Descrição |
|---|---|
| `RENDA_MINIMA` | Renda Mínima |
| `BOLSA_FAMILIA` | Bolsa Família |
| `RENDA_CIDADA` | Renda Cidadã |
| `ACAO_JOVEM` | Ação Jovem |
| `PETI` | PETI |

### `BeneficioPrestacaoContinuada`
| Valor | Descrição |
|---|---|
| `IDOSO` | BPC para idoso |
| `PESSOA_COM_DEFICIENCIA` | BPC para PCD |

### `FaixaEtaria` (PDU)
| Valor | Descrição |
|---|---|
| `CRIANCA` | Criança (0–12 anos) |
| `ADOLESCENTE` | Adolescente (13–17 anos) |
| `ADULTO` | Adulto (18–59 anos) |
| `IDOSO` | Idoso (60+ anos) |

---

## 12. Códigos de Resposta HTTP

| Código | Situação |
|---|---|
| `200 OK` | Requisição bem-sucedida (GET, PUT) |
| `201 Created` | Recurso criado com sucesso (POST) |
| `204 No Content` | Recurso deletado (DELETE) |
| `400 Bad Request` | Dados inválidos no body |
| `401 Unauthorized` | Token JWT ausente ou inválido |
| `403 Forbidden` | Sem permissão para o recurso |
| `404 Not Found` | Família ou instrumento não encontrado |
| `500 Internal Server Error` | Erro inesperado no servidor |

---

## Resumo dos Endpoints

| Instrumento | Base URL | PDF/LaTeX |
|---|---|---|
| Ficha Cadastral | `/familias/{id}/cadastro` | Sim |
| Ficha de Atualização | `/familias/{id}/atualizacoes` | Sim |
| Ficha de Visita Domiciliar | `/familias/{id}/visitas` | Sim |
| Plano de Desenvolvimento | `/familias/{id}/desenvolvimentos` | Sim |
| Plano PDU | `/familias/{id}/pdus` | Sim |
| Folha de Prosseguimento | `/familias/{id}/folhas-prosseguimento` | Sim |
| Termo de Autorização | `/familias/{id}/termos-autorizacao` | Sim |
| Áudio de Atendimento | `/familias/{id}/audio-atendimento` | Não |
| Transcrição de Áudio | `/api/transcricao` | — |
| Resumo por IA | `/resumo` | — |
