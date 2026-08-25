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
