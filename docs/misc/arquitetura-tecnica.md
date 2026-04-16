# 🏗️ AgendaEstética — Arquitetura Técnica

Este documento define **como o AgendaEstética será implementado tecnicamente**, transformando todo o escopo funcional em uma arquitetura simples, segura e escalável, usando tecnologias gratuitas.

---

## 🎯 Objetivos da Arquitetura

* Simplicidade (HTML, CSS, JS)
* Escalabilidade (multi-profissionais)
* Isolamento total de dados
* Baixo custo (Firebase + Vercel)
* Fácil manutenção

---

## 🧱 Stack Tecnológica

### Frontend

* HTML5
* CSS3 (CSS Variables para temas)
* JavaScript Vanilla

### Backend (BaaS)

* Firebase Authentication
* Firestore Database
* Firebase Storage

### Deploy

* Vercel

---

## 🗂️ Estrutura de Pastas (Frontend)

```
/src
 ├── index.html
 ├── login.html
 ├── dashboard.html
 ├── agenda.html
 ├── clientes.html
 ├── config.html
 ├── public.html
 ├── /css
 │   └── main.css
 ├── /js
 │   ├── auth.js
 │   ├── firestore.js
 │   ├── agenda.js
 │   ├── clientes.js
 │   ├── theme.js
 │   └── permissions.js
```

---

## 🔐 Autenticação (Firebase Auth)

### Tipos

* E-mail e senha
* Telefone (opcional)

### Fluxo

1. Login
2. Verificação de tipo (cliente/profissional)
3. Redirecionamento baseado em permissão

---

## 🧩 Modelo de Dados (Firestore)

### Profissionais

```
professionals/{professionalId}
  - name
  - niche
  - plan
  - theme
  - settings
```

### Clientes

```
clients/{clientId}
  - name
  - contact
```

### Agendamentos

```
appointments/{appointmentId}
  - professionalId
  - clientId
  - date
  - time
  - status
```

---

## 🔒 Isolamento de Dados

* Todas as queries filtradas por `professionalId`
* Regras do Firestore impedem acesso cruzado

---

## 🔐 Regras de Segurança (Exemplo)

```js
match /appointments/{id} {
  allow read, write: if request.auth != null
    && request.auth.uid == resource.data.professionalId;
}
```

---

## 🎨 Sistema de Temas

* CSS Variables
* Configuração salva no Firestore
* Aplicação dinâmica no carregamento

---

## 🚀 Deploy

* Repositório GitHub
* Vercel conectado ao repositório
* Build automático

---

## 🧠 Boas Práticas

* Separação de responsabilidades
* Validação no frontend e backend
* Logs básicos

---

## 📌 Conclusão

Esta arquitetura permite:

* Lançar rápido
* Evoluir sem reescrever
* Monetizar no futuro

---

**AgendaEstética — Arquitetura simples, produto sério.**
