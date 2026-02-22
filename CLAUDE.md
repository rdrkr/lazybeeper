# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Build
go build ./...

# Run (mock mode — no token required)
go run . --token ""

# Run with live API
go run . --token <token> --url http://localhost:23373

# Format (required before committing)
go tool gofumpt -w .

# Lint
go tool golangci-lint run ./...

# Full check (fmt + lint + test + build)
mise run check
```

Tools (`gofumpt`, `golangci-lint`) are declared as `tool` directives in `go.mod` and invoked via `go tool`.
No separate installation needed; `go mod download` fetches them automatically.

Task runner: [mise](https://github.com/jdx/mise) — see `mise.toml` for available tasks
(`fmt`, `lint`, `test`, `build`, `check`, `run`, `clean`).

## Architecture

**MVVM layered architecture:**

```bash
main.go → domain.Repository → ui.App → ui/viewmodel.AppViewModel → domain.Repository
```

- **`domain/types.go`** — Pure Go structs (`Account`, `Chat`, `Message`) and the `Repository` interface.
  No SDK imports. Everything else depends on this.
- **`domain/config/`** — Application configuration loading from env vars and CLI flags.
- **`domain/textutil/`** — String manipulation and formatting utilities.
- **`ui/viewmodel/app.go`** — All business logic: fetches data via `Repository`, manages polling,
  returns `tea.Cmd` values. Holds `ActiveAccountID`, `ActiveChatID`, `AllChats`.
- **`ui/app.go`** — Thin routing shell: receives `tea.Msg`, delegates commands to `viewmodel.AppViewModel`,
  updates panels with results.
- **`data/`** — Beeper Desktop API client implementing `domain.Repository`. `adapter.go`
  converts SDK types → domain types.
- **`data/mock/`** — Mock `domain.Repository` implementation with hardcoded data;
  used when no `BEEPER_TOKEN` is set.

## Key Patterns

**Message-based state (immutability):** Panels never mutate shared state directly. Instead they emit typed
messages (e.g., `ToggleMuteMsg{ChatID}`, `TogglePinMsg{ChatID}`), which `ui/app.go` handles by producing new
slices via `vm.ToggleMute()` / `vm.TogglePin()`.

**Typed enums over strings:** `shared.ChatAction` (not strings) is used for confirm dialog actions.
`shared.PanelFocus` (not ints) tracks which panel has focus.

**Cached keymaps:** All panels and popups store `keys shared.KeyMap` (set once in the constructor via
`shared.DefaultKeyMap()`). Never call `shared.DefaultKeyMap()` inside `Update()`.

**Polling:** `data.Poller` in `ui/viewmodel.AppViewModel` manages chat/message tick intervals with idle
backoff. `ui/app.go` dispatches `data.TickMsg` to `vm.HandleTick()`.

**Mock send message:** When `repo.UseMock()` is true, `ui/viewmodel.SendMessage()` appends to
`mock.Messages()` locally rather than calling the API.

## Module

`github.com/rdrkr/lazybeeper` (Go 1.25)

## Code Style

All exported and unexported types, functions, methods, and constants require doc comments (enforced by
`revive` and `godoclint`). Doc comments must start with the symbol name. Use `gofumpt` for formatting
(stricter than `gofmt`). Variable names must be at least 3 characters — no single-letter or two-letter
names (enforced by `varnamelen`).
