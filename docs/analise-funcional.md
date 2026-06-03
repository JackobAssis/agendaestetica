# Análise Funcional Completa — AgendaEstética

## 🔴 CRÍTICO — Impede funcionamento

### 1. Import quebrado em `notificacoes.js:15-16`
```js
import { 
import { setHTML } from '../modules/security.js';  // ← nested import, SYNTAX ERROR
    getFirebaseDB, 
```
**Impacto**: Página de notificações NÃO carrega. Syntax error no módulo.
**Correção**: Separar `setHTML` em um `import` distinto.

### 2. Import quebrado em `pagina-cliente.js:32-33`
```js
import { 
import { setHTML } from '../modules/security.js';  // ← mesmo bug
    getFirebaseDB, 
```
**Impacto**: Página do cliente NÃO carrega. Mesmo syntax error.
**Correção**: Separar `setHTML` em um `import` distinto.

### 3. Controle de acesso por papel (role) NÃO implementado
O router (`router.js`) define `role` em 5 rotas (`profissional`, `cliente`) mas **nunca verifica**. Qualquer client pode acessar `/dashboard`, `/relatorios`, `/solicitacoes-troca` e ver dados de profissionais.
**Correção**: Implementar `requireAuth(requiredRole)` no `navigate()` e `setupRouter()`.

### 4. `loginCliente` ignora Firebase Auth
`modules/auth.js:530` faz uma `getDocs` direta no Firestore e armazena em localStorage — **sem autenticar via Firebase Auth**. As Firestore Rules vão BLOQUEAR essa leitura (`request.auth != null`).
**Correção**: Usar `signInWithEmailAndPassword` com a senha gerada em `cadastroCliente`.

### 5. reCAPTCHA com chave de teste do Google
`index.html:41` carrega reCAPTCHA com chave pública de teste `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`. Em produção, o Google exibe warnings no console e pode falhar.
**Correção**: Substituir por chave real do projeto Firebase.

---

## 🟠 ALTO — Quebra parcial ou risco grave

### 6. Usuários órfãos no Firebase Auth
`auth.js` — Se `createUserWithEmailAndPassword` succeed mas `setDoc` (Firestore) falhar, o usuário existe no Auth mas não tem registro no Firestore. Vira um dead record.
**Correção**: Usar `runTransaction` ou `deleteUser()` no catch.

### 7. Promise `verificarSessao` sem timeout
`auth.js:556` — `onAuthStateChanged` pode nunca disparar se Firebase estiver lento ou offline. A Promise nunca resolve, bloqueando o boot do app.
**Correção**: Adicionar `Promise.race()` com timeout de 10s.

### 8. Condição de corrida em `addObservacao` e `addNota`
`clientes.js:88` e `agendamentos.js:341` — padrão read-then-write sem transaction. Duas chamadas concorrentes sobrescrevem uma à outra.
**Correção**: Usar `runTransaction` ou `arrayUnion`.

### 9. CDN import bloqueante no top-level
`modules/firebase.js:14` — `await import(...)` no top-level de um módulo ES6. Se o CDN falhar, TODOS os outros módulos que importam `firebase.js` quebram.
**Correção**: Lazy load via função, não no module scope.

### 10. Variáveis CSS que não existem
- `--spacing-3` e `--spacing-5` usados em `main.css` mas NÃO definidos em `tokens.css` (só `--spacing-xs/sm/md/lg/xl/2xl`)
- `--color-primary-bg` usado em `main.css:391,744` mas NÃO definido em nenhum arquivo
- `--spacing-*` corrigido recentemente para `--space-*` em parte do CSS, mas `main.css` ainda usa `--spacing-md`, `--spacing-lg` em outros lugares (que funcionam)
**Correção**: Substituir por `--space-3` e `--space-5`, e criar `--color-primary-bg`.

### 11. Cliente não consegue autenticar após cadastro
`cadastroCliente()` gera senha aleatória via `generateRandomPassword()` e **nunca retorna para o usuário**. Não envia email de verificação. O cliente criou uma conta mas não consegue fazer login.
**Correção**: Enviar email com senha temporária ou implementar magic link.

---

## 🟡 MÉDIO — Problemas de arquitetura e manutenção

### 12. Dois sistemas de feature flags inconsistentes
- `monetization.js` define `PLANS.free` com 4 features
- `permissions.js:temFeature()` define outro conjunto com 7 features para free
- `getFeaturesForPlan()` usa monetization.js, `temFeature()` usa o próprio — **divergem**
**Correção**: Unificar em `monetization.js`.

### 13. Redirecionamento inconsistente
- `setupRouter()` usa `history.replaceState` + `loadPage()` (soft)
- `navigate()` usa `window.location.href` (hard reload) — quebra SPA
**Correção**: Unificar para `history.pushState` + `loadPage()`.

### 14. Sessão localStorage sem expiração
`usuarioAtual` no localStorage nunca expira. Se o token Firebase Auth expirar ou o usuário for removido, o app ainda considera logado.
**Correção**: Verificar validade do token Firebase no `obterUsuarioAtual()`.

### 15. Duas definições de `isFirebaseConfigValid()`
`index.html:103` e `config.js:68` — mesma função com lógica diferente.
**Correção**: Unificar em `config.js`.

### 16. Inconsistência no fallback de página não encontrada
`router.js:91` — ambas as branches do ternário retornam `/pages/login.html`:
```js
const fallback = obterUsuarioAtual() ? '/pages/login.html' : '/pages/login.html';
```
**Correção**: Segunda branch deveria ser `/dashboard`.

### 17. CSS `theme.css` compete com `v2/tokens.css`
`theme.css` redefine todas as variáveis com tema Dark Neon (fundo `#0B0F0C`, primary `#00FF88`), enquanto `v2/tokens.css` usa tema claro com primary roxo. Páginas que carregam os dois têm conflito de identidade visual.
**Correção**: Remover `theme.css` e usar apenas temas via `data-theme`.

### 18. `document.write()` deprecated
`index.html:28` — usa `document.write()` para polyfills. Pode causar blank page em navegadores modernos.
**Correção**: Usar `createElement('script')` + `appendChild`.

### 19. Rate limiting em memória
`login.js:24` — `loginAttempts` é uma variável local. Refresh na página zera o contador.
**Correção**: Usar Firestore ou sessionStorage.

### 20. Nenhum tratamento offline
Nenhum `navigator.onLine`, `offline/online` listener, ou `disableNetwork/enableNetwork` do Firestore.
**Correção**: Adicionar detection e fallback com cache local.

---

## 🔵 BAIXO — Cosméticos e boas práticas

### 21. Caminho relativo frágil em `notifications.js:6`
`../modules/firebase.js` quando deveria ser `./firebase.js`.
**Correção**: `./firebase.js`.

### 22. Dynamic imports redundantes em `agendamentos.js:265,289`
Re-importa de `firebase.js` via `import('../modules/firebase.js')` apesar de já ter imports estáticos no topo.
**Correção**: Remover imports dinâmicos redundantes.

### 23. Catch vazios
`theme.js:16,35` e `agenda.js:179,192` — `catch(e){}` suprime erros silenciosamente.
**Correção**: Ao menos `console.warn`.

### 24. `toggleButtons` selector errado em `login.js:95`
```js
const toggleButtons = document.querySelectorAll('.toggle-buttons');
```
O HTML tem `class="toggle-btn"` (singular), não `toggle-buttons`. Query sempre retorna vazio.
**Correção**: `.toggle-btn`.

### 25. CSS `@import` sem build pipeline
`main.css` usa 6 `@import` para carregar v2/*.css. Isso gera 6+ HTTP requests sequenciais (não paralelos como `<link>`). Sem minificação, autoprefix, tree-shaking.
**Correção**: Consolidar em build step (ex: PostCSS, esbuild).

### 26. Páginas sem loading state consistente
Nenhuma página usa `showSkeleton` do `feedback.js`. A maioria depende de texto "Carregando..." ou nenhum indicador.
**Correção**: Usar `showSkeleton` em todas as listas/grids.

---

## 📊 Resumo

| Severidade | Total | Ação recomendada |
|-----------|-------|-----------------|
| 🔴 CRÍTICO | 5 | Corrigir antes do próximo deploy |
| 🟠 ALTO | 6 | Corrigir nessa sprint |
| 🟡 MÉDIO | 9 | Corrigir na próxima sprint |
| 🔵 BAIXO | 6 | Correções contínuas |

**Arquivos com mais problemas**:
- `modules/auth.js` — 7 issues (órfãos, timeout, loginCliente, sessão)
- `router.js` — 4 issues (role check, redirect inconsistente, fallback)
- `notificacoes.js` / `pagina-cliente.js` — syntax error que IMPEDE carregamento
- `styles/main.css` — variáveis que não existem, CSS `@import`
