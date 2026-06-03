# Plano de Correções e Melhorias - AgendaEstética

## Diagnóstico da Estrutura

O projeto possui **duas árvores de código**:

- **Root (ativo)**: `index.html`, `config.js`, `router.js`, `pages/`, `styles/`, `modules/`
- **`src/` (não utilizado)**: `src/index.html`, `src/config.js`, `src/pages/`, `src/styles/`

O root é o que roda. `src/` é uma versão anterior/incompleta (referencia `src/modules/` que não existe).

---

## Etapa 1 - Correções Críticas

### 1.1 `signInAnonymously` sem import
**Arquivo**: `modules/auth.js:455`

**Problema**: Fluxo de login por telefone chama `signInAnonymously()` não importada.

**Correção**: Importar `signInAnonymously` de `./firebase.js` ou remover o fluxo de telefone (já que é experimental e lança erro logo depois).

### 1.2 innerHTML sem sanitização
**Arquivos**: Todas as páginas em `pages/*.js`

**Problema**: 88 ocorrências de `innerHTML` com dados dinâmicos. Nenhuma usa `sanitizeHTML()` do `security.js`.

**Correção**: Substituir por `textContent` + `createElement()` ou usar `sanitizeHTML()` do módulo `security.js`.

### 1.3 Índices Firestore vazios
**Arquivo**: `firestore.indexes.json`

**Problema**: Array vazio. Queries `collectionGroup` em `agendamentos.js:267` e `clientes.js:110` falham.

**Correção**: Adicionar índices compostos necessários.

---

## Etapa 2 - Unificação de Estrutura

### 2.1 Remover `src/` obsoleto
**Problema**: `src/` contém versão anterior incompleta. Causa confusão.

**Correção**: Mover arquivos úteis de `src/` (se houverem diferenças) e remover a pasta.

### 2.2 CSS duplicado
**Problema**: `styles/` (ativo) e `src/styles/` (cópia). Manter apenas `styles/`.

**Correção**: Verificar se `src/styles/` tem algo único; se não, remover.

---

## Etapa 3 - Segurança

### 3.1 Aplicar DOMPurify em todas as páginas
**Arquivos**: `pages/*.js`

**Problema**: Módulo `security.js` existe com DOMPurify mas nunca é usado.

**Correção**: Importar e usar `sanitizeHTML()`/`sanitizeText()` em todos os `innerHTML`.

### 3.2 Proteger Firebase Config
**Problema**: API Key hardcoded em `index.html`.

**Correção**: Manter apenas como fallback, priorizar variáveis de ambiente Vercel.

---

## Etapa 4 - Infraestrutura

### 4.1 CI/CD
**Arquivo**: `.github/workflows/deploy.yml`

**Problema**: `continue-on-error: true` nos testes permite deploy mesmo com falha.

**Correção**: Remover `continue-on-error` ou separar job de teste do job de deploy.

### 4.2 Error Handling Global
**Problema**: Sem handler global para erros não capturados.

**Correção**: Adicionar `window.addEventListener('unhandledrejection', ...)` no `index.html`.

---

## Etapa 5 - Refatoração de Código

### 5.1 Consolidar `feedback.js` + `ui.js`
**Problema**: Ambos implementam toast, loading, skeleton. Sobreposição de responsabilidades.

**Correção**: Unificar em `feedback.js`, remover `ui.js`.

### 5.2 Cache server-side para slots
**Problema**: Cache apenas em localStorage (volátil).

**Correção**: Adicionar campo `slotsCache` no documento da empresa no Firestore.

---

## Etapa 6 - Limpeza e Documentação

### 6.1 `.gitignore`
**Problema**: `*.local.new` não é coberto. Arquivo `.env.local.new` existe no projeto.

**Correção**: Adicionar `*.local.*` ao `.gitignore`.

### 6.2 Docs desatualizadas
**Problema**: `docs/` tem ~80 arquivos, muitos redundantes ou desatualizados.

**Correção**: Revisar e limpar.

---

## Ordem de Execução

```
Etapa 1 ─► Etapa 2 ─► Etapa 3 ─► Etapa 4 ─► Etapa 5 ─► Etapa 6
(CRÍTICO)   (ESTRUTURA) (SEGURANÇA) (INFRA)    (REFATORAÇÃO) (LIMPEZA)
```

Cada etapa será implementada e verificada antes de prosseguir.
