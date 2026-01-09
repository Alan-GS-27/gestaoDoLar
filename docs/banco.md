# Modelo de Dados (Supabase)

Este esquema cobre o MVP e suporta o fluxo de aprovacao coletiva e fotos obrigatorias na conclusao.

## Entidades Principais

### users
Gerenciado pelo Supabase Auth. Usamos `auth.users` como base.

### profiles
Dados de perfil da pessoa.
- id (uuid, PK, FK -> auth.users.id)
- nome (text)
- avatar_url (text, opcional)
- criado_em (timestamptz)

### system_admins
Usuarios com acesso global ao sistema.
- id (uuid, PK)
- user_id (uuid, FK -> auth.users.id, unique)
- criado_em (timestamptz)

### households
Grupo/casa onde as pessoas colaboram.
- id (uuid, PK)
- nome (text)
- criado_em (timestamptz)

### household_members
Relacao N:N entre pessoas e casas.
- id (uuid, PK)
- household_id (uuid, FK -> households.id)
- user_id (uuid, FK -> auth.users.id)
- papel (text, default "membro")
- ativo (boolean, default true)
- criado_em (timestamptz)

### tasks
Tarefa principal (pode estar ativa ou pendente de aprovacao).
- id (uuid, PK)
- household_id (uuid, FK -> households.id)
- titulo (text)
- descricao (text, opcional)
- responsavel_id (uuid, FK -> auth.users.id)
- status (text: "pendente", "ativa", "concluida")
- proxima_execucao_em (date, opcional)
- criado_por (uuid, FK -> auth.users.id)
- criado_em (timestamptz)
- atualizado_em (timestamptz)

### task_recurrences
Recorrencia da tarefa.
- id (uuid, PK)
- task_id (uuid, FK -> tasks.id)
- tipo (text: "diaria", "semanal", "mensal")
- intervalo (int) ex: 1 = todo dia/semana/mes
- dias_semana (int[], opcional) ex: [1,3,5]
- criado_em (timestamptz)

### task_proposals
Propostas de criacao/edicao/exclusao que precisam de consenso.
- id (uuid, PK)
- household_id (uuid, FK -> households.id)
- tipo (text: "criacao", "edicao", "exclusao")
- task_id (uuid, FK -> tasks.id, opcional)
- payload (jsonb) dados propostos
- status (text: "pendente", "aprovada", "rejeitada")
- criado_por (uuid, FK -> auth.users.id)
- criado_em (timestamptz)

### task_approvals
Aprovacoes individuais por proposta.
- id (uuid, PK)
- proposal_id (uuid, FK -> task_proposals.id)
- user_id (uuid, FK -> auth.users.id)
- aprovado (boolean)
- criado_em (timestamptz)

### task_executions
Registro de conclusao da tarefa.
- id (uuid, PK)
- task_id (uuid, FK -> tasks.id)
- concluido_por (uuid, FK -> auth.users.id)
- concluido_em (timestamptz)

### task_execution_photos
Fotos obrigatorias da conclusao.
- id (uuid, PK)
- execution_id (uuid, FK -> task_executions.id)
- photo_url (text)
- criado_em (timestamptz)

## Regras de Negocio (MVP)
- Criar/editar/excluir tarefas gera `task_proposals`.
- Cada membro da casa precisa aprovar (registro em `task_approvals`).
- Ao atingir 100% de aprovacao: proposta vira "aprovada" e aplica alteracao na `tasks`.
- Concluir tarefa exige 2 fotos: criar `task_executions` + 2 registros em `task_execution_photos`.
- Apenas usuarios presentes em `system_admins` podem acessar telas e operacoes globais do sistema.

## Observacoes
- As fotos devem ser guardadas no Supabase Storage.
- O frontend valida o requisito de 2 fotos; o backend reforca.
