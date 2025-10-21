# Repository Guidelines

## Project Structure & Module Organization
`Backend/` houses the Express API. `app.js` loads middleware, connects Mongo via `config/db.js`, and mounts route modules from `routes/api/`. Schemas and domain helpers live under `models/`, and shared utilities must follow `Rules/file-organization.md`. Place backend tests in `Backend/tests/api/`. `Frontend/` is a Vite-powered React client: source lives in `src/`, components in `src/components/`, and static files in `public/`. Keep the guidance in `Rules/` close by - backend, frontend, deployment, and general standards set the baseline.

## Build, Test, and Development Commands
Install dependencies separately: `cd Backend && npm install`, `cd Frontend && npm install`. Start the API with `npm start` for a production-style process on port 3000, or `npm run app` for nodemon reloads. Run the client with `npm run dev` inside `Frontend/`, build static assets via `npm run build`, and preview the bundle with `npm run preview`. `npm test` in `Backend/` is a placeholder - replace it with Jest once tests exist so CI can fail on regressions.

## Coding Style & Naming Conventions
Use 2-space indentation and single quotes; reserve template literals for interpolated strings. Name models and schema files in PascalCase (for example `Book.js`, `BookSchema`), keep route modules camelCase (`routes/api/books.js`), and prefer early returns in controllers. On the frontend, React components stay PascalCase while hooks remain camelCase. Follow `Frontend/eslint.config.js` and the formatting expectations documented in `Rules/frontend/`.

## Testing Guidelines
Adopt Jest with Supertest for backend HTTP flows and target placement in `Backend/tests/api/*.spec.js`. For the client, use Vitest or Jest with Testing Library under `Frontend/src/__tests__/`. Mock external integrations but hit either a Mongo test database or an in-memory server for persistence scenarios. Run `npm test` (and `npm run lint` on the frontend) before each push, aiming for coverage of CRUD paths, validation errors, and unhappy network cases.

## Commit & Pull Request Guidelines
Write concise, present-tense commit subjects such as `Add pagination to book listing`, and keep body lines wrapped near 72 characters. Reference issue IDs when available and group related changes together. Pull requests must state motivation, list automated or manual test evidence, and attach screenshots or sample API responses for user-facing updates.

## Security & Configuration Tips
Never commit secrets. Load Mongo URIs and API keys from environment variables via the `config` package, and document new variables in the backend README. Review `Rules/backend/security.md` before touching authentication, CORS, or data-handling logic, and confirm .env files stay out of version control.
