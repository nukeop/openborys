# OpenBorys

AI chatbot with multiple loadable personalities, deployed on Fly.io. Runs on Bun.

## Architecture

```
src/
├── agents/          # AI agent FSM (state machines per platform)
├── clients/         # Platform adapters (discord/, matrix/, tui/)
├── config/          # Static config
├── environment.ts   # Zod-validated env vars
├── main.ts          # Startup: services → tools → plugins → platform runner
├── plugins/         # Plugin loader + types (PluginFactory, PluginContext)
├── prompts/         # System prompt templates
├── services/        # Core services (AI, Redis, tools, embeddings, strings, skills)
├── tools/           # Built-in tools (bash, phone, web-search, recall, etc.)
├── utils/           # Helpers (error.ts, etc.)
└── web/             # Admin dashboard (React SPA + API server)
```

## Stack

- Runtime: Bun (native bundler, no Vite/webpack)
- Language: TypeScript, strict
- AI: Vercel AI SDK (`ai` package) with Anthropic/OpenAI providers
- Database: Redis (Bun native client), Qdrant (embeddings/vector search)
- Formatter/linter: Biome
- Frontend: React 19, Tailwind v4, wouter, TanStack Query v5
- No component library. Plain Tailwind, dark zinc/teal palette, Sora + JetBrains Mono fonts.

## Plugin system

Plugins are `.ts` files on S3 (`s3://openborys/plugins/`), loaded at startup via dynamic `import()`. A plugin is a function `(ctx: PluginContext) => void` that registers tools, scoped tool factories, and slash commands through the context.

Plugins cannot import from bot source with relative paths (they run from `/tmp`). Only `node_modules` packages work as direct imports. All bot services come through `PluginContext`.

`PluginContext` provides: `env`, `logger`, `toolService`, `scopedToolService`, `commandService`, `redis`, `friends`, `embeddings`, `strings`.

## Tool system

`ToolService` (static class in `src/services/tools.ts`) holds global tools. Each tool is a `ToolWithMeta<INPUT, OUTPUT>` with `id`, `name`, `emoji`, `isAlwaysAvailable`, `formatArgs`, `execute`, and `tool` (AI SDK Tool object).

`ScopedToolService` (static class in `src/services/scoped-tools.ts`) holds per-message tools. Scopes are keyed by Discord message ID. Scoped tool factories are registered per platform; `instantiateFactories(platform, context, scope)` runs them when a message arrives.

## StringsService

Per-bot text overrides live on S3 under a configurable prefix (`TOOL_STRINGS_PREFIX` env var).

Plugins carry their own default strings and fall back to them when no S3 override exists.

## Dashboard (`src/web/`)

React SPA served by Bun's HTTP server on port 3000.

### API routes (defined in `server.ts`)

| Method | Path | Handler file | Returns |
|--------|------|-------------|---------|
| GET | `/api/introspect` | `api/introspect.ts` | Bot name, env, runtime, CPU, memory, uptime, AI model |
| GET | `/api/skills` | `api/skills.ts` | All loaded skills |
| POST | `/api/skills` | `api/skills.ts` | Load skill from URL |
| GET | `/api/skills/:name` | `api/skills.ts` | Single skill by name |
| DELETE | `/api/skills/:name` | `api/skills.ts` | Unload skill |

### Frontend structure

```
src/web/
├── App.tsx              # Router (wouter) + QueryClientProvider
├── server.ts            # Bun HTTP server, API routing, static file serving
├── api/                 # API endpoint handlers (plain functions calling into services)
├── pages/               # Route-level components (Home, Skill)
├── components/          # UI components (Navbar, IntrospectCard, SkillsCard, etc.)
└── queries/             # TanStack Query definitions (queryKey + queryFn per endpoint)
```

### Patterns

- API handlers are plain functions in `src/web/api/`, called from `server.ts` route matching.
- Query definitions export `{ queryKey, queryFn }` objects. Components use `useQuery(someQuery)`.
- Mutations use `useMutation` with `onSuccess` invalidating relevant query keys.
- Type safety between API and frontend: query files import server-side return types with `import type`.

## Key conventions

- Static classes for singleton services (`ToolService`, `ScopedToolService`, `StringsService`).
- Scoped tool IDs include `_${message.id}` suffix.
- Redis keys namespaced per bot.
- S3 storage: Fly Tigris.
- AWS CLI pattern for S3: `export $(grep -E '^(AWS_)' .env | xargs) && aws s3 ...`

## Commands

- `bun run dev` — dev server with watch
- `bun run check` — biome check
- `bun run format` — biome format
- `bun run lint` — biome lint
