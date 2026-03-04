# 🫧 Laundry Machine Tracker

A retro-styled real-time laundry machine tracker for apartment buildings. See which machines are in use, claim them, and track time remaining — all in real time via WebSockets.

## Features

- **3 washing machines** with live status (available / in use)
- **Retro 90s design**: dark navy with pixel fonts (Press Start 2P + VT323), neon accents, scanline overlay
- **Shaking animation** for in-use machines
- **Real-time updates** via WebSocket — all open browser tabs sync instantly
- **Server-side countdown timer** — timer runs even after browser closes; machine auto-releases when done
- **QR code support** — post QR codes linking to `/?claim=1` so residents can claim directly
- **Claim dialog** — name, apartment, wash time, optional phone number

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite, CSS Modules |
| Backend | Go 1.22 (stdlib + gorilla/websocket) |
| Real-time | WebSockets (hub/client pattern) |
| Unit tests | Jest + React Testing Library (43 tests) |
| E2E tests | Playwright (17 tests) |

## Project Structure

```
laundry-app/
├── backend/          # Go server
│   ├── main.go
│   ├── models/       # Machine, ClaimRequest types
│   ├── store/        # In-memory state with RWMutex
│   ├── handlers/     # HTTP handlers
│   ├── websocket/    # Hub, client, messages
│   └── timer/        # Auto-release timer
├── frontend/         # React app
│   ├── src/
│   │   ├── components/   # MachineRow, MachineDisplay, UserCard, ClaimDialog, QRCodePanel
│   │   ├── hooks/        # useMachines, useWebSocket, useQRParam
│   │   └── styles/       # global.css, animations.css
│   └── public/
│       └── machine.svg   # Retro washing machine SVG
└── e2e/              # Playwright E2E tests
```

## Running Locally

### Prerequisites
- Go 1.22+
- Node.js 18+

### Backend
```bash
cd backend
go mod tidy
go run .
# Runs on http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Run Tests
```bash
# Backend unit tests (with race detector)
cd backend && go test ./... -race

# Frontend unit tests
cd frontend && npm test

# E2E tests (requires both servers running)
# From project root:
npx playwright test
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/machines` | Get all 3 machine states |
| POST | `/api/machines/{id}/claim` | Claim a machine |
| POST | `/api/machines/{id}/release` | Release a machine |
| GET | `/ws` | WebSocket connection |

### Claim Request Body
```json
{
  "name": "Alice Smith",
  "apartment": "3B",
  "duration_min": 60,
  "phone": "555-1234"
}
```

## WebSocket Messages

```json
// Server → Client: full state on connect
{ "type": "init", "machines": [...] }

// Server → Client: machine state change
{ "type": "machine_update", "machine": {...} }

// Server → Client: timer expired
{ "type": "machine_released", "machine_id": 2, "reason": "timer_expired" }
```

## QR Code Deep Links

Visit `http://your-host/?claim=1` (or `2` or `3`) to open the claim dialog for a specific machine. The app renders QR codes for all 3 machines at the bottom of the page — print them and post them in the laundry room!
