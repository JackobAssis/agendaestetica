# 🤝 Guia de Contribuição - AgendaEstética

Bem-vindo! Este documento explica como contribuir para o projeto AgendaEstética.

## 🚀 Como Começar

### 1. Fork e Clone

```bash
# Fork no GitHub
# Clone seu fork
git clone https://github.com/SEU_USERNAME/agendaestetica.git
cd agendaestetica

# Adicionar upstream
git remote add upstream https://github.com/original/agendaestetica.git
```

### 2. Configurar Ambiente

```bash
# Instalar dependências
npm install

# Configurar Firebase (para desenvolvimento)
cp config.example.js config.js
# Editar config.js com suas credenciais
```

### 3. Criar Branch

```bash
# Para novas features
git checkout -b feature/nome-da-feature

# Para correções
git checkout -b fix/nome-do-bug

# Para documentação
git checkout -b docs/melhoria-documentacao
```

## 🛠️ Desenvolvimento

### Estrutura de Commits

Usamos [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

[body]

[footer]
```

**Tipos permitidos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, sem mudança funcional
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Mudanças em ferramentas, config

**Exemplos:**
```
feat(auth): adicionar login com Google
fix(agenda): corrigir cálculo de slots disponíveis
docs(readme): atualizar guia de instalação
```

### Code Style

- **JavaScript**: ESLint configurado
- **CSS**: CSS Variables para temas
- **HTML**: Semântico, acessível
- **Firebase**: Regras de segurança obrigatórias

```bash
# Verificar linting
npm run lint

# Corrigir automaticamente
npm run lint:fix
```

### Testes

```bash
# Executar todos os testes
npm test

# Testes com emulador
npm run test:emulator

# Cobertura
npm run test:coverage
```

**Regra**: Todos os PRs devem manter/passar todos os testes.

## 📝 Pull Requests

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Testes passando
- [ ] Linting OK
- [ ] Documentação atualizada
- [ ] Manual testing realizado

## Screenshots (se aplicável)
```

### Processo de Review

1. **Criar PR** contra branch `develop`
2. **Auto-review**: Verificar código próprio
3. **CI Checks**: Aguardar testes e lint
4. **Review**: Aguardar aprovação de maintainers
5. **Merge**: Squash merge com mensagem clara

## 🐛 Reportando Bugs

### Template de Issue

```markdown
**Descrição do Bug**
Descrição clara e concisa

**Para Reproduzir**
Passos para reproduzir:
1. Ir para '...'
2. Clicar em '...'
3. Ver erro

**Comportamento Esperado**
O que deveria acontecer

**Screenshots**
Se aplicável

**Ambiente**
- OS: [Windows/Linux/Mac]
- Browser: [Chrome/Firefox/Safari]
- Versão: [1.0.0]
```

## 💡 Sugerindo Features

### Template de Feature Request

```markdown
**Problema que Resolve**
Descrição do problema atual

**Solução Proposta**
Descrição da feature

**Alternativas Consideradas**
Outras soluções avaliadas

**Impacto**
Como afeta usuários/desenvolvedores
```

## 📚 Documentação

### Atualizando Docs

- Manter `docs/` atualizado
- README.md deve refletir mudanças
- Comentários em código em português

### Novos Arquivos

- Seguir estrutura existente
- Adicionar à documentação relevante
- Incluir exemplos de uso

## 🎨 Design Guidelines

### UI/UX

- **Mobile-first**: Design responsivo
- **Acessibilidade**: WCAG 2.1 AA
- **Performance**: Lighthouse > 90
- **Consistência**: Design system

### Tema

- Usar CSS Variables
- Suporte a temas escuros
- Personalização por profissional

## 🔒 Segurança

### Regras Importantes

- Nunca commit credenciais
- Validar input do usuário
- Firebase rules atualizadas
- HTTPS obrigatório

### Reporting Security Issues

- Email: security@agendaestetica.com
- Não criar issues públicas
- PGP encryption para detalhes sensíveis

## 📊 Métricas de Qualidade

### Code Quality

- **Coverage**: > 80%
- **Complexity**: Baixa/média
- **Duplication**: < 5%
- **Technical Debt**: Monitorado

### Performance

- **Lighthouse**: > 90
- **Bundle Size**: < 500KB
- **First Paint**: < 2s
- **Time to Interactive**: < 3s

## 🌍 Comunidade

### Código de Conduta

- Respeito mútuo
- Inclusividade
- Construir juntos
- Aprender continuamente

### Comunicação

- **Issues**: Para bugs/features
- **Discussions**: Para ideias gerais
- **Discord/Slack**: Para chat rápido

## 📄 Licença

Contribuições são sob a licença MIT. Ao contribuir, você concorda com os termos.

---

Obrigado por contribuir com AgendaEstética! 🚀