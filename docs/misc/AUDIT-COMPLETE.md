# Auditoria Completa - AgendaEstética

Data: 22/02/2026
Escopo: Frontend, regras Firestore, Cloud Functions e riscos comuns (XSS, exposição de chaves, permissões).

Resumo executivo
----------------
Projeto está em formato SPA / static pages com lógica em `public/pages/*.js` e Cloud Functions no diretório `functions/`.
Aparente maturidade média — código organizado, porém com pontos de atenção de segurança (uso de `innerHTML` em muitas views) e endpoints não protegidos para operações públicas.

Achados principais
------------------
1) Uso de `innerHTML` (potencial XSS) — arquivos identificados:
- pages/dashboard.js
- pages/solicitacoes-troca.js
- pages/clientes.js
- pages/notificacoes.js
- pages/meus-agendamentos.js
- pages/relatorios.js
- pages/pagina-cliente.js
- pages/pagina-publica.js
- pages/agendamentos.js
- pages/agendar-cliente.js
- pages/agenda.js

Recomendação: migrar para `textContent`/`createElement` quando inserir texto; quando inserir HTML gerado externamente, sanitize com DOMPurify ou equivalente.

2) `localStorage` usado para persistência de preferências e sessão. Arquivo `index.html` contém verificação de apiKey e a própria chave aparece no repo.
- Observação: API Keys do Firebase para frontend são públicas por design; entretanto, as regras do Firestore devem garantir proteção (veja abaixo).
- Remediar: não armazenar dados sensíveis em localStorage; usar session e limpar no logout.

3) Regras do Firestore (`firestore.rules`)
- `match /empresas/{empresaId} { allow read: if true; }` — isso permite leitura pública de empresas (provavelmente não desejado). Recomendo restringir para proprietarioUid ou apenas campos públicos via sub-collection / document específico.
- `match /empresas/{empresaId}/notificacoes/{notifId} { allow create: if true; }` — permite criação pública (útil para booking flow), porém abusos podem ocorrer. Considere usar recaptcha ou Cloud Function validadora.
- `agendamentos` permite leitura pública e criação pública com status 'solicitado' — ok para fluxo de booking, mas verifique rate-limiting e validação lógica no backend.

4) Cloud Functions (`functions/index.js`)
- `confirmAgendamento`: bom — exige idToken e verifica proprietarioUid antes de confirmar. Usa transaction — OK.
- `createCliente`: público (HTTP) e permite criar clientes sem proteção — comentário no código já recomenda recaptcha/rate-limiting. Recomendo proteger com recaptcha or apiKey check or allowlist.

5) Referências a bibliotecas externas
- Lucide foi adicionado via CDN (ok).
- Chart.js é utilizado em `agendamentos.html`.
- Tests: adicionei um script Puppeteer mas a instalação do pacote é necessária por `npm install`.

Correções automáticas aplicadas agora
------------------------------------
- Extraí o JS inline da `public/pages/agenda.html` para `public/scripts/ui-shell.js` e ajustei a importação da página.
- Adicionei Theme toggle persistente e inicialização de ícones em `ui-shell.js` (não alterei lógica de negócio existente).
- Implementei componentes visuais (KPI cards / Actions grid) na `agenda.html` e ajustes CSS no `public/styles/v2/app-shell.css`.

Correções recomendadas (não aplicadas automaticamente)
-----------------------------------------------------
- Migrar usos críticos de `innerHTML` para DOM seguro ou aplicar sanitização com DOMPurify. Posso oferecer patches automáticos para locais triviais (ex.: mensagens de erro simples) — peça quais arquivos quer que eu fixe primeiro.
- Ajustar `firestore.rules`: remover `allow read: if true` em empresas e restringir notificacoes create, ou adicionar validação/recaptcha.
- Proteger `functions/createCliente` com recaptcha / rate-limit / allowlist.

Checklist de segurança e qualidade (próximos passos)
---------------------------------------------------
- [ ] Escanear e mitigar todos usos de `innerHTML` (priorizar endpoints públicos)
- [ ] Revisar e endurecer `firestore.rules`
- [ ] Adicionar recaptcha nas rotas públicas (criar endpoint de verificação)
- [ ] Implementar testes E2E para fluxos críticos (login, criar agendamento, CRUD cliente)
- [ ] Automatizar Lighthouse/Perf checks em CI

Como eu procedo agora (opções)
-----------------------------
Eu já adicionei um script E2E (Puppeteer) em `tests/e2e/run-tests.js` e um script `npm run e2e` no `package.json`.
Para executar localmente:

1. Instale dependências de teste:

```bash
npm install
```

2. Inicie um servidor estático na raiz do projeto (ex.: http-server):

```bash
npx http-server . -p 8000 --spa index.html
```

3. Execute os testes E2E:

```bash
npm run e2e
```

Se quiser que eu aplique correções automáticas para `innerHTML` em arquivos específicos, diga quais eu devo priorizar (recomendo começar por `pages/clientes.js` e `pages/agenda.js`).

---
Relatório gerado automaticamente; posso detalhar cada item com patches sugeridos e/ou aplicar as correções que você aprovar.
