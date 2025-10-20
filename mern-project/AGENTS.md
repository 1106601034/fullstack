# Repository Guidelines

## Project Structure & Module Organization
- `app.js` boots the Express server, wires middleware, and mounts the book routes under `/api/books`.
- Domain logic lives in `models/` (e.g., `models/Book.js` schema) and HTTP handlers in `routes/api/`.
- Database wiring is isolated in `config/db.js`; update connection helpers here.
- The `rules/` directory is mandatory reading for all contributors; align your changes with the backend, frontend, deployment, and general standards documented there.

## Build, Test, and Development Commands
- `npm install` — resolve dependencies before your first run or when package.json changes.
- `npm start` — launch the production-style server with Node on port `3000`.
- `npm run app` — start the hot-reloading development server via nodemon.
- `npm test` — currently a placeholder; replace with real tests and ensure the command exits non-zero on failures.

## Coding Style & Naming Conventions
- Use 2-space indentation and single quotes for strings to match existing files; reserve backticks for templates.
- Name model files and classes with PascalCase (`Book.js`, `BookSchema`); route modules stay camelCase (`books.js`).
- Prefer early returns and keep controllers slim—push shared helpers into `rules/file-organization.md`-compliant utilities when they grow.
- Run any formatter or linter configured in the `rules/` guidance; do not commit generated or IDE files.

## Testing Guidelines
- Adopt Jest with Supertest for the Express API; store specs under `tests/api/` using the `*.spec.js` suffix.
- Mock external services, but hit a real Mongo test database (or use an in-memory server) for persistence flows.
- Gate pull requests on `npm test`; aim for high coverage on CRUD paths, schema validation, and error branches.

## Commit & Pull Request Guidelines
- Write concise, present-tense commit subjects (e.g., `Add pagination to book listing`); keep bodies wrapped at ~72 chars.
- Group related changes per commit and reference issue IDs when available.
- Pull requests must describe motivation, testing evidence, and any follow-up tasks; include screenshots or sample responses for API-visible changes.

## Security & Configuration Tips
- Never commit live credentials—externalize the Mongo URI into environment variables (e.g., `.env` + `config` package) and document local setup steps.
- Review `rules/backend/security.md` before altering authentication, CORS, or data-handling logic.
