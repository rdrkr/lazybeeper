# lazybeeper

A terminal user interface (TUI) chat client for the [Beeper](https://beeper.com) messaging platform,
built with [Ink](https://github.com/vadimdemedes/ink) (React for CLIs).

## Screenshots

_Coming soon._

## Installation

```bash
git clone https://github.com/rdrkr/lazybeeper.git
cd lazybeeper
bun install
```

## Usage

```bash
# Mock mode (no token required)
bunx tsx src/index.tsx --token ""

# With API token (live mode)
bunx tsx src/index.tsx --token <your-beeper-token>

# Custom API URL
bunx tsx src/index.tsx --token <token> --url http://localhost:23373

# Select a theme
bunx tsx src/index.tsx --token "" --theme dracula
```

### Environment Variables

| Variable           | Description                     | Default                     |
| ------------------ | ------------------------------- | --------------------------- |
| `BEEPER_TOKEN`     | Beeper API authentication token | _(none, enables mock mode)_ |
| `BEEPER_URL`       | Beeper Desktop API base URL     | `http://localhost:23373`    |
| `LAZYBEEPER_THEME` | Color theme name                | `catppuccin-mocha`          |

### CLI Flags

| Flag      | Description                              |
| --------- | ---------------------------------------- |
| `--token` | API token (overrides `BEEPER_TOKEN`)     |
| `--url`   | Base URL (overrides `BEEPER_URL`)        |
| `--theme` | Theme name (overrides `LAZYBEEPER_THEME`)|

### Themes

Built-in themes: `catppuccin-mocha` (default), `catppuccin-macchiato`, `catppuccin-frappe`,
`catppuccin-latte`, `tokyo-night`, `tokyo-night-storm`, `dracula`, `nord`, `gruvbox-dark`, `one-dark`.

Press `t` at runtime to open the theme selector. Changes are persisted to the config file.

### Configuration File

lazybeeper stores persistent settings in a TOML file at
`$XDG_CONFIG_HOME/lazybeeper/config.toml` (defaults to `~/.config/lazybeeper/config.toml`).
The file is created automatically on first run.

```toml
theme = "catppuccin-mocha"
```

Press `r` to reload the config file at runtime.

## Keybindings

### Global

| Key                 | Action             |
| ------------------- | ------------------ |
| `q` / `Ctrl+C`      | Quit               |
| `Tab` / `Shift+Tab` | Cycle panels       |
| `1`-`4`             | Jump to panel      |
| `h` / `l`           | Left / right panel |
| `/`                 | Search chats       |
| `?`                 | Help popup         |
| `t`                 | Theme selector     |
| `r`                 | Reload config      |

### Lists (Accounts / Chats)

| Key       | Action          |
| --------- | --------------- |
| `j` / `k` | Next / previous |
| `g` / `G` | Top / bottom    |
| `Enter`   | Select          |

### Chats Panel

| Key | Action              |
| --- | ------------------- |
| `a` | Archive / unarchive |
| `m` | Mute / unmute       |
| `p` | Pin / unpin         |

### Messages

| Key       | Action           |
| --------- | ---------------- |
| `j` / `k` | Scroll down / up |
| `g` / `G` | Top / bottom     |
| `Enter`   | Focus input      |

### Input

| Key     | Action           |
| ------- | ---------------- |
| `Enter` | Send message     |
| `Esc`   | Exit to messages |

## Architecture

```text
lazybeeper/
├── src/
│   ├── index.tsx           # Entry point
│   ├── domain/             # Pure types, config, text utilities
│   │   ├── types.ts        # Account, Chat, Message interfaces
│   │   ├── repository.ts   # Repository interface
│   │   ├── config.ts       # Configuration (env vars + CLI flags)
│   │   ├── config-file.ts  # TOML config file (XDG_CONFIG_HOME)
│   │   └── textutil.ts     # String utilities
│   ├── data/               # API client and mock data
│   │   ├── client.ts       # Beeper Desktop API client
│   │   ├── mock/           # Mock data for development
│   │   └── poller.ts       # Polling with idle backoff
│   └── ui/                 # Ink UI layer
│       ├── app.tsx          # Root component (keyboard routing)
│       ├── layout.ts        # Responsive layout calculation
│       ├── terminal.ts      # Synchronized output (anti-flicker)
│       ├── theme/           # Theme system (10 built-in themes)
│       ├── viewmodel/       # State, actions, keybindings, reducer
│       ├── panel/           # Panel components
│       └── popup/           # Popup dialogs
├── tests/                   # Test files (mirrors src structure)
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── vitest.config.ts
```

### Key Patterns

- **MVVM via useReducer**: UI delegates to reducer for state logic
- **Repository interface**: Decouples data access from UI
- **Discriminated unions**: Type-safe action dispatch (replaces Go's tea.Msg)
- **React.memo**: Prevents unnecessary re-renders for flicker-free tmux support
- **Synchronized output**: DEC 2026 markers for atomic terminal frame updates
- **Theme system**: 10 built-in themes with React context

## Prerequisites

Install [mise](https://github.com/jdx/mise) for task running:

```bash
brew install mise
```

## Development

```bash
# Run the application (mock mode by default)
mise run run

# Format code
mise run fmt

# Run linter
mise run lint

# Run tests
mise run test

# Build the project
mise run build

# Full check (format + lint + test + build)
mise run check

# Clean build artifacts
mise run clean

# Check for outdated packages
mise run outdated

# Upgrade all dependencies
mise run upgrade
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run `mise run check` before submitting
4. Open a pull request
