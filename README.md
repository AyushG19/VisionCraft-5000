# Draw App

A scalable, real-time collaborative drawing application built with a modern web stack. This project allows users to draw, collaborate, and leverage AI integrations on a shared canvas.

This project is set up as a monorepo using [Turborepo](https://turbo.build/repo) and utilizes `pnpm` as the package manager.

## 🚀 Features

- **Real-Time Collaboration**: Real-time websocket connections to sync drawings among multiple users.
- **Interactive Canvas**: Pan, zoom, and draw seamlessly with `react-zoom-pan-pinch` and custom canvas logic.
- **AI Integrations**: Incorporated Google GenAI and Groq SDK to assist with drawing parsing, generation, or text prompts.
- **Modern UI**: Clean, accessible, and animated interface using Radix UI, Tailwind CSS v4, and Framer Motion.
- **Background Processing**: BullMQ and Redis paired with a dedicated worker for heavy tasks and queueing.

## 🛠️ Tech Stack & Tools

### Core Architecture
- **Monorepo**: Turborepo
- **Package Manager**: pnpm

### Frontend (`apps/web`)
- **Framework**: Next.js 15 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI (shadcn-like approach), Framer Motion
- **State & Data Fetching**: React Server Components, `@tanstack/react-query`, `axios`
- **Canvas/Drawing Utilities**: Custom implementation with `react-zoom-pan-pinch`, `@excalidraw/mermaid-to-excalidraw`

### Backend Services
- **HTTP API (`apps/http-backend`)**: Node.js, Express, `bcrypt`, `cookie-parser`, REST endpoints.
- **WebSocket Server (`apps/ws-backend`)**: Node.js, `ws`, real-time canvas coordination and user states.
- **Worker (`apps/worker`)**: Queue consumer service using `bullmq` for background job processing.
- **AI Integration**: `@google/genai`, `groq-sdk` used for AI capabilities.

### Database & Infrastructure
- **Database ORM**: Prisma (`@prisma/client` v6.6.0)
- **Cache & Message Broker**: Redis (`ioredis`), `bullmq`

## 📁 Project Structure

```
draw-app/
├── apps/
│   ├── web/             # Next.js frontend application
│   ├── http-backend/    # Express REST API
│   ├── ws-backend/      # WebSocket Server for real-time sync
│   └── worker/          # Background job processor (BullMQ)
├── packages/
│   ├── db/              # Prisma schema and generated client
│   ├── ui/              # Shared React UI components
│   ├── queue/           # BullMQ queues configuration
│   ├── redis/           # Shared Redis setup
│   ├── common/          # Shared types, Zod schemas, etc.
│   ├── hooks/           # Shared React hooks
│   └── eslint-config, typescript-config, tailwind-config # Shared configs
```

## 💻 Prerequisites

Before running the project locally, ensure you have the following installed:

- **Node.js**: `v18` or `v20` (as specified by engines `<=21`)
- **pnpm**: `v9.0.0` or later (`npm install -g pnpm`)
- **PostgreSQL**: A running postgres instance for Prisma.
- **Redis**: A running Redis server for the websocket pub/sub and BullMQ worker.

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd draw-app
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Environment Setup:**
   Create `.env` files based on the example/provided `.env` formats in the respective apps and packages. Important variables include:
   - `DATABASE_URL` for `packages/db`
   - `REDIS_URL` for `packages/redis` and `packages/queue`
   - Authentication secrets and AI API Keys (Google GenAI / Groq)

4. **Initialize Database:**
   ```bash
   cd packages/db
   pnpm prisma generate
   pnpm prisma db push  # or pnpm prisma migrate dev
   cd ../..
   ```

## 🏃 Running the Application

To run the whole application simultaneously in development mode, use Turborepo's dev script from the project root:

```bash
# Start all apps (web, http-backend, ws-backend, worker) concurrently
pnpm run dev
```

Alternatively, you can run individual services:
- **Frontend only**: `pnpm --filter web dev`
- **HTTP Server only**: `pnpm --filter http-backend dev`
- **WebSocket Server only**: `pnpm --filter ws-backend dev`
- **Worker only**: `pnpm --filter worker dev`

## 🏗️ Building

To build the applications for production:

```bash
pnpm run build
```

Then, you can start the built apps using `pnpm run start`.

## 👨‍💻 About the Author

**Ayush**

I built this project independently from scratch to deeply understand complex system architecture, real-time synchronization, and building scalable full-stack applications. Through building Draw App, I gained hands-on experience and learned a lot about:
- Architecting and managing a monorepo with Turborepo and pnpm workspaces.
- Implementing low-latency real-time state synchronization using WebSockets and Redis.
- Orchestrating asynchronous background processing with BullMQ.
- Optimizing complex React applications and canvas-based interactions.
- Integrating AI capabilities into modern web applications safely and efficiently.
