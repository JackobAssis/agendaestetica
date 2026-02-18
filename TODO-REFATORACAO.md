# TODO - Refatoração Frontend AgendaEstética

## STATUS: EM ANDAMENTO

---

## 1. UNIFICAR DESIGN TOKENS ✅ (v2/tokens.css já existe)
- Manter v2/tokens.css como fonte única de verdade
- theme.css tem redundâncias - será removido

## 2. ATUALIZAR IMPORTS CSS NOS HTMLs 🔄 (Em progresso)
- [x] pages/login.html
- [x] pages/dashboard.html
- [ ] pages/agenda.html
- [ ] pages/agendamentos.html
- [ ] pages/clientes.html
- [ ] pages/perfil.html
- [ ] pages/notificacoes.html
- [ ] pages/relatorios.html
- [ ] pages/onboarding.html
- [ ] pages/meus-agendamentos.html
- [ ] pages/pagina-cliente.html
- [ ] pages/pagina-publica.html
- [ ] pages/agendar-cliente.html
- [ ] pages/confirmacao.html
- [ ] pages/recuperar-senha.html
- [ ] pages/solicitacoes-troca.html

## 3. REMOVER CSS ANTIGO / CÓDIGO MORTO 🔄
- [ ] Remover styles/theme.css (duplicado em v2/)
- [ ] Remover styles/global.css (substituído por v2/)
- [ ] Remover styles/login.css (substituído por v2/)
- [ ] Remover styles/dashboard.css
- [ ] Remover styles/agenda.css
- [ ] Remover styles/agendamentos.css
- [ ] Remover styles/agendar-cliente.css
- [ ] Remover styles/clientes.css
- [ ] Remover styles/meus-agendamentos.css
- [ ] Remover styles/notificacoes.css
- [ ] Remover styles/onboarding.css
- [ ] Remover styles/pagina-cliente.css
- [ ] Remover styles/perfil.css
- [ ] Remover styles/relatorios.css
- [ ] Remover styles/solicitacoes.css
- [ ] Remover styles/main.css (substituído por v2/)

## 4. MELHORAR SEMÂNTICA HTML 🔄
- [ ] Adicionar tags semânticas (header, main, nav, section, footer)
- [ ] Corrigir hierarquia de títulos (h1 único por página)
- [ ] Adicionar aria-labels onde necessário
- [ ] Melhorar acessibilidade em formulários

## 5. VERIFICAR CONSISTÊNCIA DE IMPORTS 🔄
- [ ] Garantir que todos os HTMLs importam apenas main.css
- [ ] Verificar se router.js injeta CSS corretamente

---

## CLASSIFICAÇÃO DAS MELHORIAS

### CRÍTICO 🔴
1. Conflito entre tokens (v2/tokens.css vs theme.css) - UNIFICAR
2. CSS duplicado causando inconsistência visual
3. HTMLs referenciando arquivos CSS diferentes

### MÉDIO 🟡
1. Código morto em styles/
2. Estrutura de pastas inconsistente

### MELHORIA 🟢
1. Semântica HTML
2. Acessibilidade
3. Documentação

---

## ARQUIVOS A REMOVER APÓS REFATORAÇÃO
- styles/theme.css
- styles/global.css
- styles/login.css
- styles/dashboard.css
- styles/agenda.css
- styles/agendamentos.css
- styles/agendar-cliente.css
- styles/clientes.css
- styles/meus-agendamentos.css
- styles/notificacoes.css
- styles/onboarding.css
- styles/pagina-cliente.css
- styles/perfil.css
- styles/relatorios.css
- styles/solicitacoes.css

