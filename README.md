# FitCrat — Fitness & Training App

Monorepo contendo o frontend web e a API backend do FitCrat.

## Estrutura

```
cratfit/
├── api/          → Backend Node.js/Express (Vercel Serverless)
└── app/          → Frontend React + Vite (Vercel SPA)
```

## Deploy automático

| Branch | Projeto | URL |
|--------|---------|-----|
| `main` | fitcrat-api | https://fitcrat-api.vercel.app |
| `main` | fitcrat-app | https://fitcrat-app.vercel.app |

Qualquer push para `main` dispara deploy automático nos dois projetos via Vercel GitHub Integration.

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
