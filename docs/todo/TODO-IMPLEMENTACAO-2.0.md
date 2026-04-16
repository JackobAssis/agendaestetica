# Plano de Implementação - Correção Cadastro de Cliente

## Referência
Documento base: `2.0.md` - Correção do Cadastro de Cliente – Backend / Firebase Auth

---

## 📋 Tarefas a Executar

### ✅ Tarefa 1: Tratar erros do Firebase Auth em `auth.js`
**Objetivo**: Capturar e mapear erros do Firebase Auth para mensagens legíveis

**Arquivo**: `modules/auth.js`

**Ações**:
- [x] 1.1 Adicionar função `getAuthErrorMessage(errorCode)` que mapeia códigos de erro do Firebase
- [x] 1.2 Aplicar tratamento de erro na função `cadastroCliente()`
- [x] 1.3 Aplicar tratamento de erro na função `cadastroProfissional()`
- [x] 1.4 Adicionar try-catch com console.log para debugging

**Mapeamento de erros**:
| Código Firebase | Mensagem ao usuário |
|----------------|--------------------|
| auth/email-already-in-use | Este email já está cadastrado |
| auth/weak-password | A senha deve conter no mínimo 6 caracteres |
| auth/invalid-email | Email inválido |
| auth/operation-not-allowed | Cadastro por email está desativado |
| default | Erro ao criar conta. Tente novamente |

---

### ✅ Tarefa 2: Validação preventiva antes do signup
**Objetivo**: Verificar se email já existe no Firestore ANTES de chamar Firebase Auth

**Arquivo**: `modules/auth.js`

**Ações**:
- [x] 2.1 Criar função `verificarEmailExistente(email)` que consulta Firestore
- [x] 2.2 Chamar `verificarEmailExistente()` em `cadastroCliente()` antes do signup
- [x] 2.3 Chamar `verificarEmailExistente()` em `cadastroProfissional()` antes do signup
- [x] 2.4 Retornar erro claro se email já existir (sem chamar Firebase Auth)

---

### ✅ Tarefa 3: Inicialização correta do Firebase
**Objetivo**: Garantir que Firebase seja inicializado uma única vez

**Arquivo**: `modules/firebase.js`

**Ações**:
- [x] 3.1 Verificar se já existe inicialização (app já configurado)
- [x] 3.2 Adicionar flag de inicialização para evitar múltiplos initializeApp
- [x] 3.3 Logar erro claro se Firebase não estiver inicializado

---

### ✅ Tarefa 4: Estrutura consistente de dados no Firestore
**Objetivo**: Garantir que documento do cliente seja criado corretamente após signup

**Arquivo**: `modules/auth.js`

**Ações**:
- [x] 4.1 Verificar se `criadoEm` usa timestamp correto
- [x] 4.2 Adicionar normalização de email (toLowerCase().trim())
- [x] 4.3 Garantir que UID do Auth seja o ID do documento
- [x] 4.4 Adicionar tratamento de erro se escrita no Firestore falhar

---

### ✅ Tarefa 5: Logging e Debug controlado
**Objetivo**: Adicionar logs claros para facilitar manutenção

**Arquivo**: `modules/auth.js`

**Ações**:
- [x] 5.1 Adicionar log: "🔧 Iniciando cadastro de cliente"
- [x] 5.2 Adicionar log: "❌ Validação local falhou"
- [x] 5.3 Adicionar log: "❌ Email já existe no Firestore"
- [x] 5.4 Adicionar log: "✅ Firebase Auth criado com sucesso"
- [x] 5.5 Adicionar log: "✅ Cliente salvo no Firestore"

---

## 🔄 Fluxo de Implementação

1. ✅ **Tarefa 3** → Inicialização do Firebase (pré-requisito)
2. ✅ **Tarefa 2** → Validação preventiva (evita erros 400)
3. ✅ **Tarefa 1** → Tratamento de erros (mensagens claras)
4. ✅ **Tarefa 4** → Estrutura de dados (consistência)
5. ✅ **Tarefa 5** → Logging (debugging)

---

## 📁 Arquivos Modificados

| Arquivo | Modificações |
|---------|--------------|
| `modules/auth.js` | Tarefas 1, 2, 4, 5 |
| `modules/firebase.js` | Tarefa 3 |
| `index.html` | Chamada para markFirebaseInitialized() |

---

## ⚠️ Fora de Escopo (conforme 2.0.md)

- Alterações visuais (UI/UX)
- Mudanças de layout
- Novas features

---

## ✅ Critérios de Conclusão

- [x] Cadastro de cliente funcionar em condições válidas
- [x] Emails duplicados não causarem erro 400
- [x] Senhas fracas serem barradas antes do Firebase
- [x] Firebase inicializado corretamente
- [x] Mensagens exibidas ao usuário serem claras
- [x] Nenhum erro 400 ocorrer silenciosamente
- [x] Firestore permanecer consistente

---

## 📝 Logs Adicionados para Debug

```
🔧 Iniciando cadastro de cliente
🔍 Verificando se email já existe: email@teste.com
✅ Email não encontrado - livre para cadastro
✅ Validação local passou
🔧 Criando usuário no Firebase Auth...
✅ Firebase Auth criado com sucesso - UID: xxxxxxxx
✅ Perfil atualizado com nome
🔧 Salvando cliente no Firestore...
✅ Cliente salvo no Firestore
```

---

**Data de criação**: Implementação baseada em 2.0.md
**Data de conclusão**: Implementação concluída

