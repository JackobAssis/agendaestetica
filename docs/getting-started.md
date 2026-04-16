# 🚀 Getting Started

Bem-vindo ao **AgendaEstética**! Esta é uma plataforma SaaS de agenda online para profissionais do ramo estético.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ (recomendado: 20+)
- **npm** ou **yarn**
- **Git**
- Conta no **Firebase** (para backend)
- Conta no **Vercel** (para deploy)

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/agendaestetica.git
cd agendaestetica
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative Authentication, Firestore e Storage
3. Copie as configurações do SDK para `config.js`
4. Configure as regras de segurança em `firestore.rules`

### 4. Configure o ambiente de desenvolvimento

```bash
# Inicie o servidor local
npm run dev
```

A aplicação estará disponível em `http://localhost:8000`.

## 🧪 Testes

### Testes automatizados

```bash
# Todos os testes
npm test

# Testes específicos
npm run test:e2e
npm run test:smoke
```

### Testes manuais

Consulte `docs/testing.md` para os casos de teste manuais obrigatórios.

## 📁 Estrutura do Projeto

```
agendaestetica/
├── pages/           # Páginas da aplicação
├── modules/         # Módulos JavaScript
├── styles/          # CSS e estilos
├── tests/           # Testes automatizados
├── public/          # Assets estáticos
├── docs/            # Documentação
├── config.js        # Configurações Firebase
└── package.json     # Dependências
```

## 🎯 Próximos Passos

1. **Leia a documentação**: Comece com `docs/user-guide.md` ou `docs/developer-guide.md`
2. **Configure o Firebase**: Siga as instruções em `docs/deployment.md`
3. **Execute os testes**: Garanta que tudo está funcionando
4. **Faça deploy**: Use Vercel para produção

## 📞 Suporte

- **Documentação completa**: `docs/`
- **Issues**: Abra no GitHub
- **Wiki**: Em construção

---

Para mais detalhes, consulte os outros arquivos em `docs/`.