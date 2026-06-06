# Padrão de Integração Frontend ↔ Backend — SASF

## Visão Geral

Cada formulário do sistema segue um único padrão de integração REST. O mesmo componente React lida com criação (POST) e edição (PUT), distinguidos pela presença ou não de um ID na URL.

---

## Estrutura de Rotas

```
/rota/:familiaId            → Novo registro   (POST)
/rota/:familiaId/:fichaId   → Editar registro  (PUT, pré-preenche o form)
```

**Exemplo real:**
```
/novo-cadastro/:id            → Nova ficha cadastral
/novo-cadastro/:id/:fichaId   → Editar ficha existente

/ficha-atualizacao/:id        → Nova ficha de atualização
/ficha-atualizacao/:id/:fichaId → Editar ficha existente
```

---

## Padrão do Componente

### 1. Parâmetros de URL
```jsx
const { id, fichaId } = useParams();
```
- `id` → ID da família (sempre presente)
- `fichaId` → ID do registro específico (presente só no modo edição)

### 2. useEffect — Decisão POST vs PUT
```js
useEffect(() => {
  // Sempre busca dados da família (breadcrumb / nome)
  fetch(`/familias/${id}`)

  // Sem fichaId → formulário vazio (POST)
  if (!fichaId) {
    resetForm();
    return;
  }

  // Com fichaId → pré-preenche o form (PUT)
  fetch(`/familias/${id}/recurso/${fichaId}`)
    .then(data => setForm(mapResponseToForm(data)))
}, [id, fichaId]);
```

### 3. handleSubmit — POST ou PUT
```js
const endpoint = fichaId
  ? `${API_URL}/familias/${id}/recurso/${fichaId}`
  : `${API_URL}/familias/${id}/recurso`;
const method = fichaId ? 'PUT' : 'POST';
```

---

## Endpoints por Formulário

| Formulário            | Base URL                              |
|-----------------------|---------------------------------------|
| Ficha Cadastral       | `/familias/:id/cadastro`              |
| Ficha de Atualização  | `/familias/:id/atualizacoes`          |
| Ficha de Visita       | `/familias/:id/visitas`               |
| Plano de Des. Familiar| `/familias/:id/desenvolvimentos`      |
| Áudio Atendimento     | `/familias/:id/audio-atendimento`     |

---

## DetalhesFamilia — Listagem

Cada seção de documentos na tela de detalhes da família:
1. Busca a lista via `GET /familias/:id/recurso`
2. Exibe os registros existentes
3. **"Novo"** navega para `/rota/:id` (sem fichaId)
4. **"Visualizar"** navega para `/rota/:id/:fichaId` (com fichaId → pré-preenche)

---

## Regras Gerais

- **Sem fichaId na URL** → form vazio, botão "Confirmar / Salvar novo"
- **Com fichaId na URL** → form pré-preenchido, botão "Salvar alterações"
- O estado é **sempre resetado** explicitamente quando `fichaId` é ausente para evitar que dados de uma edição anterior persistam entre navegações
- Técnicos são buscados uma única vez no mount e selecionados por `tecnicoId` (inteiro)
- Datas no frontend usam formato `dd/mm/aaaa`; a API recebe `yyyy-MM-dd` ou `yyyy-MM-ddTHH:mm:ss`
