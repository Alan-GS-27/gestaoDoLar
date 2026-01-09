# gestaoDoLar
- Segundo commit

## Visao do Produto
Sistema de gestao de tarefas domesticas com responsabilidade coletiva. Dentro de cada lar nao ha admin; decisoes importantes passam por aprovacao individual de todos os membros. Existe um super admin global do sistema para suporte e administracao de todos os lares.

## Objetivos do MVP
- Centralizar tarefas da casa (criar, acompanhar, concluir).
- Tornar visivel quem e responsavel e quando a tarefa vence.
- Garantir consenso para criar/editar/excluir tarefas.

## Modulos
- Autenticacao: login por email/senha e opcao de Google.
- Tarefas: lista, conclusao, detalhes e historico.
- Aprovacoes: fluxo de consenso para mudanças.
- Dashboard: resumo semanal, tarefas do dia/semana.
- Configuracoes: perfil, tema, preferencias.

## Telas
- Login: email/senha + Google.
- Dashboard: progresso da semana, tarefas de hoje, tarefas da semana.
- Tarefas:
  - Execucao: marcar como concluida (todos podem).
  - Gestao: criar/editar/excluir (exige aprovacao).
- Aprovacoes: lista de propostas pendentes para cada usuario aprovar.
- Configuracoes: perfil, foto, tema.

## Fluxo de Tarefas com Aprovacao
1) Proposta: qualquer membro cria uma tarefa.
2) Aprovacao: cada membro aprova individualmente.
3) Ativacao: com 100% de aprovacao, a tarefa vira ativa.
4) Execucao: responsavel marca como concluida com 2 fotos obrigatorias.
5) Historico: registro de quem concluiu e quando.

## Regras de Aprovacao
- Criar/editar/excluir tarefas exige aprovacao de todos.
- Concluir tarefa nao exige aprovacao, mas exige 2 fotos.
- Historico registra aprovacoes e conclusoes.

## Super Admin (global)
- Acesso a todos os lares e usuarios, para suporte e administracao do sistema.
- Pode criar, editar e apagar dados de qualquer lar.
- Nao participa do consenso interno dos lares.

## Diretriz de Uso
- Mobile-first: experiencia pensada primeiro para celular.

## Fases (sem codigo por enquanto)
Fase 1: detalhar telas e campos.
Fase 2: prototipo de UI (front).
Fase 3: backend e banco (Supabase).
