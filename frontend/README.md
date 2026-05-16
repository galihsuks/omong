# Omong Frontend

Frontend client for Omong, a real-time chat application.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- TanStack React Query
- Zustand
- React Router (`createBrowserRouter`)

## Environment Variables (`frontend/.env`)

Required:

- `VITE_API_URL` (example: `http://localhost:8083/backend`)
- `VITE_WS_URL` (public websocket endpoint)

Optional:

- `VITE_WS_APP_ID` (default: `omong`)

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Formatting

```bash
npm run format
npm run format:check
```

## Architecture Notes

- API modules: `src/api`
- React Query hooks: `src/hooks`
- Global stores: `src/store`
- Main rooms container state: `src/store/roomsMain.store.ts`
- WebSocket app-level lifecycle: `src/app/layouts/ProtectedAppLayout.tsx`

## Realtime Notes

- All rooms are subscribed while user is logged in.
- Room realtime events are merged into the main rooms store.
- Room list updates for create/add member/exit are announced through user channels: `__user__:{userId}`.
- WebSocket does not connect when user is not authenticated.
