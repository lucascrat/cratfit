# FitCrat — Fitness & Training App

Monorepo contendo o frontend web e a API backend do FitCrat.

## Estrutura

```
correcrat/
├── api/          → Backend Node.js/Express (VPS/Coolify)
└── app/          → Frontend React + Vite (VPS/Coolify)
```

## Deploy

O deploy é gerenciado via **Coolify** em servidor VPS próprio.
URLs de produção:
- **API**: https://api.fitcrat.pro
- **App**: https://fitcrat.pro

## Desenvolvimento local

```bash
# API
cd api && npm install && npm run dev

# App
cd app && npm install && npm run dev
```

## Variáveis de ambiente

Copie `.env.example` para `.env` em cada pasta e preencha os valores.
Nunca commite arquivos `.env` com valores reais.
