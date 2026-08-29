# exam-web2-frontend

## Getting started

```bash
git clone git@github.com:isaacabderman-creator/exam-web2-frontend.git
cd exam-web2-frontend
npm install
cp .env.example .env
npm run dev
```

No backend running yet? Use `npm run mock` instead to serve a fake API from `docs/openapi.yaml`, and point `VITE_API_BASE_URL` in `.env` at `http://localhost:3000` (no `/api` suffix — Prism ignores the spec's base path).

## Deployment

Live at [examhub.aialab.tech](https://examhub.aialab.tech), hosted on Vercel. The backend runs separately on Render.

Deploying your own copy: set `VITE_API_BASE_URL` in the Vercel project's environment variables to your backend's URL (with a `/api` suffix), then deploy.
