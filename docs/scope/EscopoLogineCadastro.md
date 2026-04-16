# AgendaEstética — Parte 1

## Sistema de Login, Cadastro e Isolamento de Dados

Este documento descreve **de forma completa e técnica** o funcionamento do sistema de acesso da plataforma **AgendaEstética**, incluindo login, cadastro automático, diferenciação de perfis e isolamento de dados entre empresas (multi-tenant).

---

## 1. Visão Geral

O sistema utiliza **login único** com decisão de papel (Cliente ou Profissional), permitindo:

* Entrada rápida para clientes
* Segurança reforçada para profissionais
* Cadastro automático quando o usuário ainda não existir
* Isolamento total de dados por empresa

Tecnologias-alvo:

* Frontend: HTML, CSS, JavaScript (Vanilla)
* Backend/BaaS: Firebase (Auth + Firestore)
* Hospedagem: Vercel

---

## 2. Conceito de Empresa (Isolamento de Dados)

Cada profissional possui uma **empresa** (instância isolada do sistema).

### 2.1 Identificador da Empresa

Cada empresa possui um identificador único (`empresaId`), usado como chave principal para separação de dados.

Exemplo:

```
empresaId: "barbearia-do-joao"
```

### 2.2 Acesso via URL

O acesso ao sistema ocorre sempre através da URL da empresa:

```
https://agendaestetica.vercel.app/barbearia-do-joao
```

O frontend extrai o `empresaId` da URL e utiliza este valor em todas as operações.

---

## 3. Tipos de Usuário

### 3.1 Profissional (Admin)

* Criador e administrador da empresa
* Acesso total ao sistema
* Pode:

  * Gerenciar agenda
  * Gerenciar clientes
  * Criar cursos
  * Alterar configurações

### 3.2 Cliente

* Acesso restrito
* Pode:

  * Visualizar horários disponíveis
  * Criar agendamentos
  * Solicitar troca de data
  * Visualizar histórico próprio

---

## 4. Tela de Login (Entrada Única)

### 4.1 Campos comuns

* Nome
* Contato (WhatsApp / telefone)

### 4.2 Seleção de papel

O usuário deve selecionar explicitamente:

* ( ) Sou Cliente
* ( ) Sou Profissional

Essa escolha define o fluxo de autenticação.

---

## 5. Fluxo de Login — Cliente

### 5.1 Comportamento

* Não utiliza senha
* Cadastro automático
* Entrada imediata

### 5.2 Fluxo lógico

1. Usuário informa nome e contato
2. Seleciona "Sou Cliente"
3. Sistema verifica no banco:

   * Existe cliente com esse contato nessa empresa?
4. Se não existir:

   * Cria novo cliente
5. Se existir:

   * Autentica
6. Redireciona para área do cliente

---

## 6. Fluxo de Login — Profissional

### 6.1 Segurança

O profissional deve possuir autenticação reforçada.

Campos adicionais:

* Email (opcional, recomendado)
* Senha

### 6.2 Fluxo de cadastro (primeiro acesso)

1. Profissional preenche dados
2. Seleciona "Sou Profissional"
3. Sistema verifica se a empresa já existe
4. Se não existir:

   * Cria empresa
   * Gera `empresaId`
   * Cria perfil do profissional como admin
5. Autentica usuário

### 6.3 Fluxo de login

1. Profissional informa credenciais
2. Firebase Auth valida
3. Sistema verifica:

   * usuário pertence à empresa da URL
4. Se válido:

   * acesso liberado
5. Caso contrário:

   * acesso negado

---

## 7. Estrutura de Dados (Firestore)

### 7.1 Estrutura principal

```
empresas
 └── empresaId
      ├── perfil
      ├── profissionais
      ├── clientes
      ├── agenda
      ├── cursos
      └── configuracoes
```

### 7.2 Exemplo de usuário

```json
{
  "uid": "abc123",
  "empresaId": "barbearia-do-joao",
  "role": "profissional"
}
```

---

## 8. Regras de Segurança (Firebase)

* Usuário só pode acessar dados da sua empresa
* Cliente só acessa:

  * seus próprios dados
  * agenda pública
* Profissional acessa todos os dados da empresa

Tentativas de acesso fora da empresa devem ser bloqueadas no banco, independentemente do frontend.

---

## 9. Tratamento de Erros

Casos previstos:

* Empresa inexistente
* Tentativa de login profissional sem permissão
* Senha inválida
* Conta suspensa

Todos os erros devem retornar mensagens claras e orientativas ao usuário.

---

## 10. Benefícios do Modelo

* Um único app → múltiplas empresas
* Dados totalmente isolados
* Escalável
* Compatível com plano gratuito
* Ideal para múltiplos nichos estéticos

---

## 11. Próxima Etapa

Com o sistema de acesso definido, o próximo passo é documentar:

**PARTE 2 — Fluxo funcional da plataforma**

* Agenda
* Agendamentos
* Trocas
* Cursos
* Configurações

---

Fim do documento — Parte 1
