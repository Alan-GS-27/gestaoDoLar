# Etapas do Projeto

Este arquivo registra o que ja foi definido e o que ainda falta em cada fase.

## Etapa 1: Produto (em andamento)
### Feito
- Visao do produto e objetivos do MVP definidos.
- Modulos e telas iniciais definidos.
- Fluxo de aprovacao individual definido.
- Regra: concluir tarefa exige 2 fotos obrigatorias (mobile-first).
- Definicao de super admin global do sistema (acesso a todos os lares para suporte).

### A Fazer
- Detalhar campos por tela (tarefas, aprovacoes, dashboard).
- Definir regras finais de aprovacao (100% ou maioria).
- Priorizar funcionalidades do MVP.
- Detalhar regras e acessos do super admin (perfis, permissoes e telas).

## Etapa 2: UI/Front (futura)
### Feito
- Tela de login com Supabase (email/senha).
- Dashboard mockado (progresso semanal, tarefas e aprovacoes).
- Tela de tarefas mockada (lista, pendencias, regras e fluxo de fotos).
- Tela de aprovacoes mockada (lista, fluxo e atividade).
- Tela de configuracoes mockada (perfil, preferencias e seguranca).
- Tela de calendario mockada (visao semanal e reunioes).
- Tela de convites (envio por email).

### A Fazer
- Criar wireframes simples.
- Definir layout e navegacao.
- Montar componentes principais.

## Etapa 3: Backend e Banco (futura)
### Feito
- Modelar entidades (usuarios, tarefas, aprovacoes, execucoes).
- Configurar Supabase (auth + banco).
- Edge Function para limpeza de fotos (5 dias).
- Edge Function para convites por email.

### A Fazer
- Integrar frontend com o backend.

## Etapa 4: Deploy (futura)
### A Fazer
- Configurar variaveis de ambiente na Vercel.
- Ajustar build e deploy.
