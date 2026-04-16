# 💬 Prompts - AgendaEstética

Esta pasta contém prompts e instruções para desenvolvimento de interfaces e funcionalidades.

## 📁 Arquivos

### Páginas Específicas
- [**prompt_paginadocliente.md**](prompt_paginadocliente.md) - Prompt para desenvolvimento da página do cliente
- [**promptdoprofissional.md**](promptdoprofissional.md) - Prompt para página do profissional
- [**promptvisual.md**](promptvisual.md) - Prompt para aspectos visuais

### Componentes e Funcionalidades
- [**visualdaplataforma.md**](visualdaplataforma.md) - Descrição visual da plataforma
- [**fluxo_usabilidade.md**](fluxo_usabilidade.md) - Fluxo de usabilidade

## 🎨 Diretrizes de Design

### Princípios
- **Simplicidade**: Interface intuitiva
- **Mobile-first**: Otimizado para mobile
- **Acessibilidade**: WCAG 2.1 AA
- **Performance**: Carregamento rápido

### Paleta de Cores
- **Primária**: Azul (#007bff)
- **Secundária**: Cinza (#6c757d)
- **Sucesso**: Verde (#28a745)
- **Erro**: Vermelho (#dc3545)

### Tipografia
- **Fonte**: Roboto/Sans-serif
- **Tamanhos**: 14px-24px
- **Pesos**: Regular, Medium, Bold

## 📱 Componentes Principais

### Layout
- **Header**: Navegação e branding
- **Sidebar**: Menu lateral (profissional)
- **Main**: Conteúdo principal
- **Footer**: Links e informações

### Formulários
- **Inputs**: Campos padronizados
- **Buttons**: Primário, secundário, outline
- **Validation**: Feedback visual
- **Loading**: Estados de carregamento

### Dashboard
- **Cards**: Métricas e resumos
- **Charts**: Visualização de dados
- **Tables**: Listas e dados tabulares
- **Modals**: Diálogos e confirmações

## 🔄 Fluxos de Usuário

### Cadastro Profissional
1. Landing → Cadastro
2. Formulário → Validação
3. Onboarding → Configuração
4. Dashboard → Primeiro uso

### Agendamento Cliente
1. Página pública → Serviços
2. Calendário → Seleção data
3. Horários → Seleção slot
4. Dados → Confirmação
5. Sucesso → Notificação

### Gestão Profissional
1. Dashboard → Visão geral
2. Agenda → Visualização
3. Agendamentos → Gestão
4. Clientes → CRM
5. Configurações → Personalização

## 📋 Requisitos Técnicos

### Frontend
- **Responsive**: Breakpoints móveis
- **Progressive**: Funciona sem JS
- **Accessible**: Screen readers
- **Fast**: < 3s first paint

### Backend
- **Real-time**: Atualizações live
- **Secure**: Autenticação obrigatória
- **Scalable**: Suporte multi-tenant
- **Reliable**: 99.9% uptime

## 🎯 Critérios de Aceitação

### Funcional
- [ ] Interface carrega em < 2s
- [ ] Navegação intuitiva
- [ ] Formulários validados
- [ ] Feedback visual claro

### Visual
- [ ] Design consistente
- [ ] Hierarquia visual clara
- [ ] Contraste adequado
- [ ] Mobile otimizado

### UX
- [ ] Fluxos lógicos
- [ ] Mensagens claras
- [ ] Estados de loading
- [ ] Tratamento de erros

## 🛠️ Ferramentas de Desenvolvimento

### Design
- **Figma**: Prototipagem
- **Adobe XD**: Alternativa
- **Sketch**: Mac only

### Desenvolvimento
- **VS Code**: Editor principal
- **Chrome DevTools**: Debugging
- **Lighthouse**: Performance

### Teste
- **BrowserStack**: Cross-browser
- **Mobile devices**: Teste real
- **User testing**: Feedback usuários

## 📈 Métricas de Qualidade

### Performance
- **Lighthouse**: > 90
- **Speed Index**: < 3s
- **First Paint**: < 1.5s

### Usabilidade
- **Task completion**: > 90%
- **Error rate**: < 5%
- **Satisfaction**: > 4.5/5

### Acessibilidade
- **WCAG Score**: AA
- **Screen reader**: 100%
- **Keyboard nav**: Completa

---

Para guia de usuário, consulte [`../user-guide.md`](../user-guide.md).