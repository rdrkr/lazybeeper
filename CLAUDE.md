# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Build
bunx tsc

# Run (mock mode — no token required)
bun run src/index.tsx --token ""

# Run with live API
bun run src/index.tsx --token <token> --url http://localhost:23373

# Format (required before committing)
bunx prettier --write 'src/**/*.{ts,tsx}' 'tests/**/*.{ts,tsx}'

# Lint
bunx eslint 'src/**/*.{ts,tsx}' 'tests/**/*.{ts,tsx}'

# Test
bunx vitest run

# Full check (fmt + lint + test + build)
mise run check
```

Task runner: [mise](https://github.com/jdx/mise) — see `mise.toml` for available tasks
(`fmt`, `lint`, `test`, `build`, `check`, `run`, `clean`, `outdated`, `upgrade`).

## Architecture

**MVVM layered architecture (React + useReducer):**

```text
index.tsx → Repository → App → useAppState (reducer) → Repository
```

- **`domain/types.ts`** — Pure TypeScript interfaces (`Account`, `Chat`, `Message`) and the
  `Repository` interface. No framework imports. Everything else depends on this.
- **`domain/config.ts`** — Configuration loading from env vars and CLI flags.
- **`domain/config-file.ts`** — TOML config file management with XDG_CONFIG_HOME support.
- **`domain/textutil.ts`** — String manipulation and formatting utilities.
- **`ui/viewmodel/use-app-state.ts`** — All business logic: fetches data via `Repository`, manages
  polling via `useEffect`, state via `useReducer`. The `appReducer` handles all `AppAction` types.
- **`ui/viewmodel/context.ts`** — `PanelFocus` enum and panel navigation helpers.
- **`ui/viewmodel/messages.ts`** — `AppAction` discriminated union and `ChatAction` enum.
- **`ui/viewmodel/keys.ts`** — Keybinding detection functions.
- **`ui/app.tsx`** — Thin routing shell: receives keyboard input via `useInput`, delegates to reducer,
  renders panels and popups. Wraps everything in `ThemeProvider`.
- **`ui/theme/`** — Theme system with 10 built-in themes, React context, and `useTheme()` hook.
- **`ui/terminal.ts`** — Synchronized output (DEC 2026) + clear-to-home replacement for flicker-free
  rendering in tmux.
- **`data/client.ts`** — Beeper Desktop API client implementing `Repository`.
- **`data/mock/`** — Mock `Repository` implementation with hardcoded data;
  used when no `BEEPER_TOKEN` is set.

## Key Patterns

**Discriminated union actions:** Components never mutate shared state directly. Instead they dispatch typed
actions (e.g., `{ type: "toggle_mute", chatId }`) which the `appReducer` handles immutably.

**Typed enums over strings:** `ChatAction` enum for confirm dialog actions.
`PanelFocus` enum tracks which panel has focus.

**React.memo:** All panel components are memoized to prevent unnecessary re-renders when
sibling state changes (critical for flicker-free tmux support).

**Polling with idle backoff:** `Poller` class manages chat/message tick intervals.
`useAppState` sets up `setInterval` effects that clean up on dependency changes.

**Theme system:** 10 built-in themes via React context. Components use `useTheme()` hook.
Theme is selected via `--theme` flag, `LAZYBEEPER_THEME` env var, or config file.

## Code Style

All exported and unexported types, functions, methods, and constants require JSDoc comments.
Use Prettier for formatting. ESLint enforces strict TypeScript rules including
`strictTypeChecked` and `stylisticTypeChecked` configs. Explicit return types required on all functions.
