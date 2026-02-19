# LBOT — Plataforma de Suscripción de Bot

## Arquitectura

```
lbot-demo/
├── frontend/          # Astro + Tailwind CSS (Cloudflare Pages)
└── backend/           # Node.js + Express.js (Cloudflare Workers)
```

## Stack

| Capa          | Tecnología                        |
|---------------|-----------------------------------|
| Frontend      | Astro, Tailwind CSS               |
| Backend       | Node.js, Express.js               |
| Despliegue    | Cloudflare Pages + Workers        |
| Base de datos | Cloudflare D1 (SQLite)            |
| Auth          | JWT httpOnly, Google OAuth 2.0    |
| Pagos         | Stripe, PayPal, Criptomonedas     |

## Fases

1. ✅ Estructura del proyecto
2. ⬜ Frontend (one-page pública)
3. ⬜ Backend (API REST)
4. ⬜ Autenticación
5. ⬜ Pagos
6. ⬜ Dashboard privado
7. ⬜ Seguridad y hardening

## Desarrollo local

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npm run dev
```

## Variables de entorno

Ver `frontend/.env.example` y `backend/.env.example`.
