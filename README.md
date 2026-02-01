# DevTrack

DevTrack is a modern, web-based ticket tracking and project management system designed for agile software development teams.

## Features

- **Multi-tenant Workspaces**: Organize teams with isolated workspaces
- **Project Management**: Create and manage multiple projects per workspace
- **Agile Boards**: Kanban and Scrum board support with drag-and-drop
- **Issue Tracking**: Full ticket lifecycle management (Epics, Stories, Tasks, Bugs, Subtasks)
- **Time Tracking**: Log work hours and generate timesheet reports
- **Real-time Collaboration**: Live updates via WebSocket
- **Rich Text Editing**: Markdown support with code highlighting
- **Custom Workflows**: Define custom state transitions
- **Advanced Search**: Full-text search with filters

## Tech Stack

- **Frontend**: React 18+, TypeScript, TailwindCSS, Redux Toolkit, Vite
- **Backend**: Node.js 20+, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL 15+, Redis
- **Real-time**: Socket.IO
- **File Storage**: AWS S3 or MinIO

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm 10+

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development environment:
   ```bash
   docker-compose up -d
   ```

5. Run database migrations:
   ```bash
   npm run db:migrate
   ```

6. Start the development servers:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Available Scripts

- `npm run dev` - Start all development servers
- `npm run build` - Build all applications
- `npm run test` - Run all tests
- `npm run lint` - Lint all applications
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run clean` - Clean all build outputs

## Project Structure

```
devtrack/
├── apps/
│   ├── web/          # React frontend
│   └── api/          # Node.js backend
├── packages/
│   └── shared/       # Shared types and utilities
├── docker/           # Docker configuration
└── .github/          # CI/CD workflows
```

## License

MIT
