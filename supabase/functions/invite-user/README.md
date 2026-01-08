# Invite User Function

Convite de usuarios via Supabase Auth (invite nativo).

## Payload (POST)
```json
{
  "email": "pessoa@exemplo.com",
  "household_id": "uuid",
  "redirect_to": "https://gestao-do-lar.vercel.app"
}
```

## Requisitos
- Secrets na Edge Function:
  - `PROJECT_URL`
  - `SERVICE_ROLE_KEY`

## Deploy
```bash
supabase functions deploy invite-user
```

## Observacoes
- So permite convidar se o solicitante for membro ativo da casa.
- Cria registro em `household_members` com `ativo = false`.
