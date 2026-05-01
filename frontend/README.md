## Mini Voting Frontend

### Run locally

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

### Build

```bash
cd frontend
pnpm build
pnpm preview
```

### Deploy on Netlify

This repo already includes `netlify.toml` at the root:

- **Base directory**: `frontend`
- **Build command**: `pnpm run build`
- **Publish directory**: `dist`

### Notes

- Default mode is **mock** (votes stored locally in your browser).
- Wallet connect is wired via `@mysten/dapp-kit` so you can upgrade to on-chain voting once your Move module is ready.

