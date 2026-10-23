# Kognit — API

Backend API for **Kognit**, a task-collaboration workspace built for product managers and engineers. It provides authenticated, role-aware access to teams, workspaces ("spaces"), and tasks that carry the fields product work actually needs — acceptance criteria, priorities, assignees, due dates, tags and threaded comments.

**Frontend:** [kognit-frontend](https://github.com/muhammadatiq1/kognit-frontend)

## Features

- **Authentication & roles** — register/login with bcrypt-hashed passwords and JWT sessions; users carry a `PM` or `ENGINEER` role
- **Teams** — create teams and organise users within them
- **Spaces** — group work into spaces, public or private
- **Tasks** — full task model: status workflow (`BACKLOG → IN_PROGRESS → REVIEW → COMPLETED`), priority (`LOW / MEDIUM / HIGH / URGENT`), author & assignee, start/due dates, and acceptance criteria
- **Comments** — threaded discussion on tasks, cascade-deleted with the task
- **Tags** — colour-coded labels shared across tasks
- **Validation** — request payloads validated with Zod; consistent JSON error responses

## Tech stack

- **Runtime:** Node.js · Express 5 · TypeScript
- **Database:** MySQL via Prisma ORM (schema-first, UUID primary keys, indexed relations)
- **Auth:** JSON Web Tokens (jsonwebtoken) · bcryptjs
- **Tooling:** ts-node + nodemon (dev), Zod, dotenv, CORS

## Data model

`User` (role: PM / ENGINEER) · `Team` · `Space` · `Task` (status, priority, author, assignee, dates) · `Comment` · `Tag`

## API surface

| Route | Purpose |
| --- | --- |
| `POST /api/auth/*` | Register, log in, session |
| `/api/tasks` | Task CRUD, assignment, status & priority |
| `/api/spaces` | Space CRUD and privacy |
| `/api/comments` | Task comments |
| `/api/tags` | Tag management |
| `GET /api/health` | Health check → `{ "status": "ok" }` |

## Getting started

```bash
# 1. Install
npm install

# 2. Configure environment — create .env with:
#    DATABASE_URL="mysql://user:password@localhost:3306/kognit"
#    JWT_SECRET="your-secret"

# 3. Set up the database
npx prisma migrate dev
npx prisma db seed   # optional — seed.ts included

# 4. Run
npm run dev          # development (nodemon + ts-node)
npm run build && npm start   # production
```

The API listens on `PORT` (default `5000`).

## License

MIT
