# TODO - Implementação da Página do Cliente

## ✅ Status: CONCLUÍDO

## 📋 Resumo do Projeto
Desenvolver a Página do Cliente integrada ao sistema AgendaEstética, seguindo as especificações de `paginadocliente.md` e `prompt_paginadocliente.md`.

## 📁 Arquivos Criados/Modificados

### ✅ Novos Arquivos Criados
1. `pages/pagina-cliente.html` - HTML da página do cliente ✅
2. `pages/pagina-cliente.js` - JavaScript da página do cliente ✅
3. `styles/pagina-cliente.css` - Estilos específicos da página ✅

### ✅ Arquivos Modificados
1. `router.js` - Adicionada rota `/pagina-cliente` ✅
2. `modules/agendamentos.js` - Corrigida função `listAgendamentosCliente` ✅

## ✅ Checklist de Funcionalidades

### 1. Identidade do Profissional (OBRIGATÓRIO)
- [ ] Exibir nome do profissional
- [ ] Exibir banner/foto (se disponível)
- [ ] Aplicar tema configurado pelo profissional (cores dinâmicas)
- [ ] Dados públicos apenas

### 2. Próximo Agendamento (OBRIGATÓRIO)
- [ ] Buscar próximo agendamento ativo do cliente no Firestore
- [ ] Exibir data e horário
- [ ] Exibir status (confirmado, pendente, remarcação solicitada)
- [ ] Mensagem clara se não existir agendamento

### 3. Solicitar Troca (OBRIGATÓRIO)
- [ ] Botão "Solicitar troca"
- [ ] Listar datas e horários disponíveis
- [ ] Cliente seleciona nova data/horário
- [ ] Enviar solicitação para o profissional
- [ ] Atualizar status para "Aguardando confirmação"

### 4. Cancelar Agendamento (OBRIGATÓRIO)
- [ ] Botão "Cancelar agendamento"
- [ ] Confirmação obrigatória ("Deseja realmente cancelar?")
- [ ] Atualizar status no Firestore
- [ ] Respeitar regras do profissional

### 5. Histórico (OBBRIGATÓRIO)
- [ ] Listar agendamentos passados
- [ ] Apenas leitura
- [ ] Ordenado por data
- [ ] Exibir status (concluído/cancelado)

### 6. Cursos (Condicional - Se existirem)
- [ ] Renderizar apenas se existirem cursos ativos
- [ ] Permitir solicitação de vaga
- [ ] Mostrar status da solicitação

### 7. Perfil do Cliente (OBRIGATÓRIO)
- [ ] Exibir nome
- [ ] Exibir contato (email/telefone)
- [ ] Preferências (opcional)
- [ ] Nenhuma edição sensível

## 🚫 Restrições (CRÍTICO)
- ❌ Cliente não pode criar horários
- ❌ Cliente não pode confirmar agendamento
- ❌ Cliente não pode editar agenda
- ❌ Cliente não pode ver dados de outros clientes
- ❌ Rewards NÃO devem ser implementados

## 📱 Requisitos Técnicos
- [ ] Mobile-first
- [ ] Código organizado
- [ ] Funções reutilizáveis
- [ ] Estados claros (loading / vazio / erro)
- [ ] Segurança baseada em regras do Firestore
- [ ] UI baseada em dados (renderização condicional)

## 🔧 Integrações Necessárias
- Firebase Auth (obter usuário atual)
- Firebase Firestore (buscar agendamentos, empresa)
- Módulos existentes (`agendamentos.js`, `agenda.js`, `auth.js`)

## 📄 Estrutura da Página HTML
```html
<main class="pagina-cliente-container">
  <!-- Identidade do Profissional -->
  <header class="profissional-header">
    <div class="banner"></div>
    <h1 class="nome-profissional"></h1>
    <span class="profissao"></span>
  </header>

  <!-- Próximo Agendamento -->
  <section class="proximo-agendamento">
    <h2>Próximo Agendamento</h2>
    <div class="agendamento-card">
      <p class="data-hora"></p>
      <p class="servico"></p>
      <span class="badge status"></span>
      <div class="acoes">
        <button class="btn-solicitar-troca">Solicitar troca</button>
        <button class="btn-cancelar">Cancelar</button>
      </div>
    </div>
  </section>

  <!-- Modal de Troca -->
  <div class="modal-troca hidden">
    <h3>Solicitar Troca</h3>
    <select id="troca-data"></select>
    <select id="troca-hora"></select>
    <button id="enviar-troca">Enviar</button>
  </div>

  <!-- Histórico -->
  <section class="historico">
    <h2>Histórico</h2>
    <ul class="lista-historico"></ul>
  </section>

  <!-- Cursos (Condicional) -->
  <section class="cursos hidden">
    <h2>Cursos Disponíveis</h2>
    <ul class="lista-cursos"></ul>
  </section>

  <!-- Mensagens -->
  <div id="mensagem" class="message hidden"></div>
</main>
```

## 🗺️ Fluxo de Navegação

```
┌─────────────────────────────────────┐
│         Página do Cliente          │
├─────────────────────────────────────┤
│  1. Verificar autenticação         │
│  2. Carregar dados do cliente      │
│  3. Carregar dados da empresa      │
│  4. Buscar agendamentos            │
│  5. Renderizar interface           │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      Ações do Cliente               │
├─────────────────────────────────────┤
│  • Solicitar troca → Modal          │
│  • Cancelar → Confirmação           │
│  • Ver histórico → Lista           │
│  • Solicitar curso → Envio          │
└─────────────────────────────────────┘
```

## 📝 Notas Técnicas

### Estrutura de Dados Firestore
```
/empresas/{empresaId}
  - nome: string
  - profissao: string
  - bannerUrl: string (opcional)
  - tema: object (cores personalizadas)

/empresas/{empresaId}/agendamentos/{agendamentoId}
  - inicio: timestamp
  - fim: timestamp
  - clienteUid: string
  - servico: string
  - status: 'solicitado' | 'confirmado' | 'cancelado' | 'remarcado' | 'concluido'
  - temPedidoRemarcacao: boolean
```

### Regras de Permissão (Firestore)
Já configuradas em `firestore.rules`:
- Cliente pode ler próprios agendamentos
- Cliente pode atualizar apenas próprios agendamentos (status)
- Cliente não pode criar/editar agenda

## 🎯 Critérios de Aceitação
1. [ ] Página carrega corretamente para cliente autenticado
2. [ ] Dados do profissional são exibidos com tema aplicado
3. [ ] Próximo agendamento é mostrado corretamente
4. [ ] Botões de troca e cancelamento funcionam
5. [ ] Modal de troca lista horários disponíveis
6. [ ] Histórico é exibido e ordenando por data
7. [ ] Cursos são renderizados condicionalmente
8. [ ] Sem quebra de funcionalidades existentes
9. [ ] Mobile-first e responsivo
10. [ ] Estados de loading/erro tratados

## 📅 Próximos Passos
1. Confirmar plano com usuário
2. Criar arquivos HTML/CSS/JS
3. Adicionar rota no router.js
4. Testar integrações
5. Validar funcionalidades

