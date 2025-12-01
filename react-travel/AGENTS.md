# Repository Guidelines

React 18 + TypeScript travel app built with Create React App. Follow these notes when adding features or fixing bugs to keep the repo consistent and shippable.

## Project Structure & Module Organization
- `src/pages` holds route-level screens (home, search, detail, auth, cart, order); `App.tsx` wires routing.
- `src/components` contains reusable UI (header/footer, product collections, filters, checkout/payment) with scoped styles in `*.module.css` and barrel exports via `index.ts`.
- `src/layouts` defines shared shells (`mainLayout`, `userLayout`); `src/assets/images` stores static media; `public` serves global HTML and static files.
- `src/redux` is feature-first: each folder has slice/thunks (via Redux Toolkit), and `redux/hooks.ts` provides typed hooks; async calls hit `http://123.56.149.216:8080/api` or `/auth`.
- `src/i18n` configures translations; `helpers` keeps small utilities. Co-locate new tests or story-like examples next to the component/page they cover.

## API Contract & Postman Collection
- The canonical REST contract lives in `postmanAPI/React旅游网api.postman_collection.json`. Read it before touching slices or backend mocks so you don’t regress required routes.
- All requests must include the `x-icode` header (value is in the collection). Protected routes additionally demand a `Bearer` JWT; keep axios defaults (`axios.defaults.headers["x-icode"]`) aligned with the Postman spec.
- Key endpoint groups from the collection:
  - **Tourist routes**: search (`GET /api/touristRoutes` with keyword/paging/sorting), detail (`GET /api/touristRoutes/:id`), and product collections (`GET /api/productCollections`).
  - **Auth**: registration (`POST /auth/register`) and login (`POST /auth/login`) returning the JWT consumed by `userSlice`.
  - **Shopping cart**: `GET /api/shoppingCart`, add/delete items (`POST /api/shoppingCart/items`, `DELETE /api/shoppingCart/items/:id`, bulk `DELETE /api/shoppingCart/items/(id1, id2)`), and checkout (`POST /api/shoppingCart/checkout`).
  - **Orders**: paginated history (`GET /api/orders?pagesize=&pagenumber=`), single order (`GET /api/orders/:orderId`), and place order (`POST /api/orders/:orderId/placeOrder`).
- When mocking or replacing the backend, mirror the response shapes (notably `shoppingCartItems` arrays and pagination metadata via `X-Pagination`) so existing Redux logic keeps working.

## Build, Test, and Development Commands
- `npm start` — run the dev server on port 3000 with hot reload.
- `npm test` — Jest + React Testing Library in watch mode; use `npm test -- --coverage` for coverage.
- `npm run build` — production bundle in `build/`.
- `npm run eject` — not reversible; coordinate with maintainers before using.

## Coding Style & Naming Conventions
- Use TypeScript for all new code; type component props, thunks, and Redux state. Stick to function components + hooks; keep side effects in `useEffect`.
- Follow CRA ESLint defaults; keep 2-space indentation, double quotes, and semicolons. Prefer `PascalCase` for components and files, `camelCase` for variables/functions, and `SCREAMING_SNAKE_CASE` for constants.
- Keep styles in module CSS alongside the component; avoid global selectors unless modifying `index.css`.
- When fetching data with axios, keep endpoints centralized in the relevant slice and handle `loading/error` consistently.

## Testing Guidelines
- Write `*.test.tsx` near the component/page; use `@testing-library/react` with queries by role/text and `userEvent` for interactions.
- Mock axios calls and avoid hitting the live API in tests. Cover reducers/thunks with state transition checks (loading → success/error).
- Run `npm test` before pushing; add coverage for new branches or edge cases (empty states, error states, loading spinners).

## Commit & Pull Request Guidelines
- Recent history is terse; prefer clearer, imperative subjects (e.g., `Add checkout loading guard`, `Fix search pagination`). Include scope or file hints when useful.
- For PRs, provide: a short summary of the change, testing performed (`npm test`, manual steps), related issue/ticket, and screenshots/GIFs for UI changes. Note any i18n updates or API contract touches.
- Ensure lint/test are clean and avoid committing `node_modules` or local build artifacts.
