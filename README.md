# Omong

Omong is a full-stack real-time chat application.

## Project Structure

- `backend/` - Express + TypeScript + MongoDB API server
- `frontend/` - React + Vite + TypeScript client app (Tailwind + TanStack Query + Zustand)

## Tech Stack

### Backend

- Express
- TypeScript
- Mongoose (MongoDB)
- JWT authentication
- bcrypt

### Frontend

- React (Vite)
- TypeScript
- Tailwind CSS
- TanStack React Query
- Zustand
- React Router (`createBrowserRouter`)

## Prerequisites

- Node.js 18+
- npm
- MongoDB database
- Public WebSocket server URL (already deployed in your setup)

## Environment Variables

### Backend (`backend/.env`)

Required:

- `MONGODB_URI`
- `ACCESS_TOKEN_SECRET`
- `PORT` (optional, defaults to `8083`)

### Frontend (`frontend/.env`)

Required:

- `VITE_API_URL` (example: `http://localhost:8083/backend`)
- `VITE_WS_URL` (your public WebSocket endpoint)

## Installation

Install dependencies for both apps:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run in Development

Start backend:

```bash
cd backend
npm run dev
```

Start frontend:

```bash
cd frontend
npm run dev
```

## Build

Backend:

```bash
cd backend
npm run build
```

Frontend:

```bash
cd frontend
npm run build
```

## Formatting

Both projects are configured with Prettier.

Backend:

```bash
cd backend
npm run format
npm run format:check
```

Frontend:

```bash
cd frontend
npm run format
npm run format:check
```

## Notes

- Frontend environment access is centralized in `frontend/src/config/env.ts`.
- API calls are centralized in `frontend/src/api`.
- TanStack Query hooks are organized in `frontend/src/hooks`.
- Zustand stores are in `frontend/src/store`.

## License

Private/Internal project.
