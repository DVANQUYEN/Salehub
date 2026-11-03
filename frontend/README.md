# SalesHub Frontend

React + Vite + TailwindCSS frontend for SalesHub B2B IT Sales Management Platform.

## Tech Stack
- React 18 + Vite
- TailwindCSS
- React Router
- React Hook Form
- Recharts
- Axios
- Socket.IO Client

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running at http://localhost:3000

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open http://localhost:5173

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure
```
frontend/src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API service layer
├── contexts/      # React contexts
├── hooks/         # Custom hooks
├── utils/         # Helpers, constants, formatters
└── routes/        # Route definitions
```

## Environment
Vite proxy is configured to forward `/api` and `/socket.io` requests to backend at `http://localhost:3000`.
