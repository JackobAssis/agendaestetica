# AgendaEstética — Parte 3

## Requisitos de Dados, Modelagem e Governança

Este documento define **o modelo de dados**, **regras de acesso**, **consistência**, **prevenção de erros** e **estratégias de evolução** da plataforma **AgendaEstética**, usando Firebase (Auth + Firestore) como base.

---

## 1. Princípios de Modelagem

* Isolamento total por empresa (`empresaId`)
* Leitura simples e escrita controlada
* Evitar joins complexos (NoSQL-friendly)
* Dados suficientes para auditoria
* Preparado para escalar (SaaS)

---

## 2. Identidades e Autenticação

### 2.1 Usuário (Auth)

Campos gerenciados pelo Firebase Auth:

* uid
* email (opcional)
* telefone (opcional)

### 2.2 Perfil do Usuário (Firestore)

```
usuarios/{uid}
```

Campos:

* uid
* empresaId
* role: "profissional" | "cliente"
* nome
* contato
* ativo (boolean)
* criadoEm
* ultimoAcesso

---

## 3. Empresa (Tenant)

```
empresas/{empresaId}
```

Campos:

* empresaId
* nome
* nicho (texto livre)
* slug
* status: ativa | suspensa
* criadaEm
* plano (free | futuro)

Subcoleções:

* perfil
* configuracoes
* profissionais
* clientes
* agenda
* cursos
* rewards

---

## 4. Perfil da Empresa

```
empresas/{empresaId}/perfil
```

Campos:

* nomePublico
* descricao
* fotoPerfil
* banner
* redesSociais
* tema
* paletaCores
* fonte

---

## 5. Configurações da Empresa

```
empresas/{empresaId}/configuracoes
```

Campos:

* agendamentoOnlineAtivo (boolean)
* tempoMinimoRemarcacao (horas)
* limiteSolicitacoesTroca
* politicaCancelamento
* horariosTrabalho
* diasAtivos
* excecoes

---

## 6. Profissionais

```
empresas/{empresaId}/profissionais/{profissionalId}
```

Campos:

* uid
* nome
* role: admin | colaborador
* ativo
* criadoEm

---

## 7. Clientes

```
empresas/{empresaId}/clientes/{clienteId}
```

Campos:

* nome
* contato
* preferencias
* criadoEm
* status

---

## 8. Agenda (Horários Base)

```
empresas/{empresaId}/agenda/{data}
```

Campos:

* data
* horariosDisponiveis[]
* horariosBloqueados[]
* excecao (boolean)

---

## 9. Agendamentos

```
empresas/{empresaId}/agendamentos/{agendamentoId}
```

Campos:

* clienteId
* profissionalId
* data
* horario
* duracao
* status: pendente | confirmado | cancelado | concluido | remarcado
* observacoes
* criadoEm
* atualizadoEm

---

## 10. Trocas de Data

```
empresas/{empresaId}/trocas/{trocaId}
```

Campos:

* agendamentoId
* clienteId
* datasSugeridas[]
* status: pendente | aceita | recusada
* criadoEm

---

## 11. Cursos

```
empresas/{empresaId}/cursos/{cursoId}
```

Campos:

* titulo
* tipo: iniciante | aperfeicoamento
* descricao
* datas
* vagas
* valor
* ativo

Subcoleção:

* inscritos

---

## 12. Rewards e Benefícios

```
empresas/{empresaId}/rewards/{clienteId}
```

Campos:

* pontos
* nivel
* totalGasto
* beneficiosAtivos

---

## 13. Notificações

```
empresas/{empresaId}/notificacoes/{notificacaoId}
```

Campos:

* tipo
* destinatarioId
* mensagem
* lida
* criadoEm

---

## 14. Regras de Segurança (Resumo)

* Usuário só acessa sua empresa
* Cliente só acessa seus dados
* Profissional acessa toda a empresa
* Escritas críticas validadas por regra

---

## 15. Prevenção de Erros e Consistência

* Verificar conflito de horários antes de criar agendamento
* Transações para evitar duplicidade
* Flags de status para histórico
* Logs básicos de ações críticas

---

## 16. Evolução Futura

Preparado para:

* Pagamentos
* Assinaturas
* Lista de espera
* Avaliações
* Multi-profissionais

---

## 17. Encerramento

Com esta modelagem, o **AgendaEstética** está pronto para implementação segura, escalável e flexível.

---

Fim do documento — Parte 3
