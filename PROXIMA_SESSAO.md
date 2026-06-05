# Observações e Conselhos — Próxima Sessão

## O que foi aprendido nesta sessão

### Padrão dos Instrumentos (fichas)
Todos os instrumentos seguem o mesmo padrão de controller REST no backend:
- `GET /familias/{familiaId}/{recurso}` → lista (retorna `List<DTO>`)
- `GET /familias/{familiaId}/{recurso}/{fichaId}` → busca uma específica
- `POST /familias/{familiaId}/{recurso}` → criar nova
- `PUT /familias/{familiaId}/{recurso}/{fichaId}` → editar existente

### Mapeamento de endpoints dos instrumentos
| Instrumento            | Endpoint backend           | Componente frontend              |
|------------------------|----------------------------|----------------------------------|
| Ficha Cadastral        | `/familias/:id/cadastro`   | `NovoCadastro/NovosCadastro.jsx` |
| Visita Domiciliar      | `/familias/:id/visitas`    | `FichaVisitaDomiciliar/`         |
| Ficha de Atualização   | `/familias/:id/atualizacoes` | `FichaAtualizacao/`            |
| Plano de Desenvolvimento | `/familias/:id/planos-desenvolvimento` (verificar) | `PlanoDesenvolvimento/` |
| Plano PDU              | (verificar endpoint)       | `PlanoDesenvolvimentoPDU/`       |
| Folha de Prosseguimento | `/familias/:id/folhas-prosseguimento` | `FolhaProsseguimento/` |
| Termo de Imagem        | (verificar endpoint)       | `TermoImagem/`                   |

### Bugs encontrados e corrigidos
1. **parseDateBR com datas incompletas** — causava 400 no backend porque enviava anos com 2 dígitos (ex: "20-06-05"). Corrigido em todos os formulários com `p[2].length === 4`.
2. **GET lista vs objeto único** — o backend retorna `List<DTO>` no endpoint de listagem, mas o frontend tratava como objeto único. Corrigido em `DetalhesFamilia` e `NovosCadastro`.

---

## O que falta fazer (instrumentos nos Detalhes)

Para cada instrumento abaixo, aplicar o **mesmo padrão** já implementado em Ficha Cadastral e Visita Domiciliar:

### Para cada instrumento, fazer:
1. **Rota nova** em `main.jsx`: adicionar `/:id/:fichaId` além do `/:id`
2. **Componente** (o JSX do instrumento):
   - Trocar `useParams()` para incluir `fichaId`
   - Substituir dados mockados por fetch da API
   - `useEffect` que busca família (`GET /familias/:id`) e, se `fichaId` presente, busca ficha específica
   - `handleSubmit` usa `PUT /:fichaId` quando editando, `POST` quando criando
   - Botão: "Salvar alterações" vs "Salvar ficha"
   - Corrigir `parseDateBR` com validação `p[2].length === 4`
3. **DetalhesFamilia.jsx**:
   - Adicionar `fetch` da lista do instrumento na API (no `useEffect`)
   - Adicionar `itemPath: (item) => \`/rota/:id/${item.id}\`` no config do OPCOES

### Instrumentos pendentes
- [ ] `FichaAtualizacao` — endpoint: `/familias/:id/atualizacoes`
- [ ] `TermoImagem` — endpoint: verificar no backend
- [ ] `PlanoDesenvolvimento` — endpoint: verificar no backend
- [ ] `PlanoDesenvolvimentoPDU` — endpoint: verificar no backend
- [ ] `FolhaProsseguimento` — endpoint: `/familias/:id/folhas-prosseguimento`

### Como verificar o endpoint correto
Olhar os arquivos do backend em:
`C:\Users\guilh\Desktop\Insper_3semestre\Sprint\back\backend-sasf-2\src\main\java\br\insper\sasf_2\instrumentos\controller\`

Ou usar o Postman: `front/sasf-backend-postman-collection.json`

---

## Campos de resposta úteis por instrumento

### Visita Domiciliar (ResponseDTO — ver mapper)
- `id`, `familiaId`, `tecnicoId`, `nomeTecnico`, `dataPreenchimento`, `nomeRepresentanteFamilia`

### Ficha Cadastral (ResponseDTO — ver GET /familias/1/cadastro)
- `id`, `familiaId`, `tecnicoNome`, `dataMatricula`, `data`

> Para os demais instrumentos: antes de implementar, abrir o ResponseDTO do backend para saber quais campos usar no mapeamento da lista.

---

## Dicas para a próxima sessão

1. **Compartilhe o controller E o ResponseDTO** de cada instrumento — o controller mostra o endpoint, o ResponseDTO mostra o que o GET retorna para popular a lista em `DetalhesFamilia`.
2. **Verifique o `tecnicoId`** — o usuário logado pode ser ORIENTADOR (não TECNICO), então o serviço pode falhar se tentar buscar um Tecnico pelo ID do ORIENTADOR. Considere enviar `tecnicoId: null` caso o cargo não seja TECNICO.
3. **Ordem recomendada** — fazer um instrumento por vez, testando criação + visualização + edição antes de passar para o próximo.
