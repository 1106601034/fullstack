# Repository Guidelines

## Project Structure & Module Organization
The repo splits the MERN stack by concern. `Backend/` hosts the Express API: `app.js` wires middleware, loads Mongo via `config/db.js`, and mounts route modules from `routes/api/`. Schemas stay in `models/` (for example `models/Book.js`), and helper utilities must follow the patterns in `Rules/file-organization.md`. `Frontend/` is a Vite powered React client; components live under `src/` and static assets in `public/`. Keep cross-cutting standards from `Rules/` close by, especially the backend, frontend, and deployment notes.

## Build, Test, and Development Commands
Run installs per package before first use: `cd Backend && npm install`, `cd Frontend && npm install`. Start the API with `npm start` for a production-like Node process on port 3000, or `npm run app` for nodemon hot reloads. Launch the client with `npm run dev` inside `Frontend/` to use Vite, and `npm run build` to produce optimized assets. `npm test` in `Backend/` currently fails intentionally - replace it with real Jest runs so CI surfaces regressions.

## Coding Style & Naming Conventions
Use 2 space indentation, single quotes for strings, and template literals only when interpolation is required. Keep model classes and schema files in PascalCase, while route modules remain camelCase (for example `routes/api/books.js`). Prefer early returns in controllers and move shared logic into utilities aligned with the rules directory. Follow the ESLint config under `Frontend/eslint.config.js` and any formatter directives cited in `Rules/frontend`.

## Testing Guidelines
Adopt Jest with Supertest for API behavior and Testing Library for React components. Place backend specs in `Backend/tests/api/` using the `*.spec.js` suffix, and mirror the frontend under `Frontend/src/__tests__/`. Aim for coverage across CRUD flows, schema validation, and edge cases like network failures. Always run `npm test` before pushing.

## Commit & Pull Request Guidelines
Write concise, present-tense commit subjects such as `Add pagination to book listing`, and keep bodies wrapped near 72 characters. Reference issue IDs when available and group related changes together. Pull requests should outline motivation, list manual or automated test evidence, and attach screenshots or sample API responses for visible changes.

## Security & Configuration Tips
Keep secrets out of the repo. Load Mongo URIs and API keys from environment variables via the `config` package, and document any new variables in the backend README. Review `Rules/backend/security.md` before modifying authentication, CORS, or data handling logic.
