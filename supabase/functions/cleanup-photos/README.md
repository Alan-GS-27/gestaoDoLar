# Cleanup Photos Function

Remove fotos antigas do bucket `task-photos` e limpar registros em
`task_execution_photos` com mais de 5 dias.

## Deploy
```bash
supabase functions deploy cleanup-photos
```

## Schedule (cron)
No dashboard do Supabase:
1) Edge Functions -> Scheduled
2) Nova schedule para `cleanup-photos`
3) Cron: `0 3 * * *` (todos os dias as 03:00)

## Observacoes
- Usa `SERVICE_ROLE_KEY` para remover arquivos e limpar dados.
- Assume bucket privado `task-photos`.
