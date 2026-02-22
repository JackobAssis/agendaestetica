# Auditoria Inicial - Frontend

Data: 22/02/2026
Projeto: AgendaEstética

Objetivo: gerar um relatório inicial automatizado com checagens básicas sobre referências, assets e estrutura do frontend e apontar próximos passos para auditoria completa.

1) Arquivos verificados automaticamente
- `public/pages/agenda.html` (atualizado para AppShell)
- `public/styles/main.css` (importa módulos v2)
- `public/styles/v2/app-shell.css` (novo tema dark neon)

2) Verificações automáticas realizadas
- Confirmação de existência dos arquivos importados por `main.css` (v2 modules)


Resultados (verificados automaticamente):

- `public/styles/v2/reset.css` => OK (found)
- `public/styles/v2/tokens.css` => OK (found)
- `public/styles/v2/base.css` => OK (found)
- `public/styles/v2/layout.css` => OK (found)
- `public/styles/v2/components.css` => OK (found)
- `public/styles/v2/utilities.css` => OK (found)

3) Checagem de scripts referenciados nas páginas
- `../pages/agenda.js` => presente
- Outros scripts de páginas (`dashboard.js`, `agendamentos.js`, `clientes.js`, `relatorios.js`, etc.) => presentes
- Scripts externos usados: Lucide CDN (adicionado), Chart.js (usado em `agendamentos.html`) — ambos externos

4) Uso de APIs sensíveis / possíveis riscos identificados (primeira varredura)
- Uso de `innerHTML` detectado em vários arquivos do frontend (potencial XSS se conteúdo não for sanitizado):
	- `pages/dashboard.js`
	- `pages/solicitacoes-troca.js`
	- `pages/clientes.js`
	- `pages/agenda.js`
	- `pages/notificacoes.js`
	- `pages/meus-agendamentos.js`
	- `pages/relatorios.js`
	- `pages/pagina-cliente.js`
	- `pages/pagina-publica.js`
	- `pages/agendamentos.js`
	- `pages/agendar-cliente.js`

- Uso de `localStorage` detectado em diversas áreas (sessão, preferências):
	- `index.html` (verificação de apiKey)
	- `pages/pagina-cliente.js` (limpa `usuarioAtual`)
	- `public/pages/agenda.html` (tema `ae_theme`)
	- Várias implementações documentadas em `FASE-2-AUTENTICACAO.md`

- Chave de API do Firebase aparece em `index.html` (presente como valor). Observação: chaves de frontend do Firebase são públicas por natureza — confirme regras de segurança do Firestore e Storage.

5) Recomendações iniciais (prioridade alta → baixa)
- Prioridade alta:
	- Sanitizar entradas antes de inserir com `innerHTML` ou migrar para `textContent` / `createElement` para evitar XSS.
	- Rever regras do Firebase (`firestore.rules`) para garantir que não há permissões abertas.
	- Evitar armazenar dados sensíveis em `localStorage` (usar tokens curtos; remover no logout).

- Prioridade média:
	- Extrair o JS inline para `public/scripts/ui-shell.js` e carregar via `<script src=...>` para facilitar testes e cache.
	- Padronizar ícones (já trocados para Lucide) e migrar para um sistema de componentes (Card, Button).

- Prioridade baixa:
	- Preparar testes automatizados (Puppeteer / Playwright) para validar fluxos críticos (login, criar agendamento, CRUD cliente).
	- Rodar Lighthouse para performance e PWA checks.

6) Próximos passos técnicos que posso executar agora
- (A) Executar escaneamento mais profundo dos arquivos `.js` para localizar exatamente usos perigosos de `innerHTML`, `eval`, `Function()` e gerar um patch sugerido para migrar para `createElement`.
- (B) Mover o JS inline (tema + handlers) para `public/scripts/ui-shell.js`.
- (C) Preparar um conjunto de scripts de teste automatizado (Headless browser) para validar login/agendamento/responsividade.

Para continuar com a auditoria completa, confirme se deseja que eu:
- 1) execute o escaneamento profundo e aplique correções automáticas seguras (quando trivial), ou
- 2) gere um checklist detalhado com prioridade e estimativa de esforço para cada item encontrado.


4) Recomendações iniciais
- Mover o JS inline (tema + nav + handlers) para `public/scripts/ui-shell.js` para melhor organização.
- Validar que `../pages/relatorios.html` e `../pages/agendar-cliente.html` existem; caso não existam, ajustar handlers.
- Rodar testes manuais de responsividade em 360x800, 768x1024 e 1440x900.
- Executar auditoria de segurança nas regras do Firebase (`firestore.rules`) e endpoints (se houver back-end).

5) Próximos passos descritivos
- Executar escaneamento completo dos arquivos .js para encontrar usos de `eval`, `innerHTML` e possíveis XSS.
- Verificar presença de variáveis sensíveis acopladas no front-end (chaves API em código).
- Gerar relatório de performance (PWA/ Lighthouse) em ambiente real.

