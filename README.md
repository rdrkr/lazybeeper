# lazybeeper

A terminal user interface (TUI) chat client for the [Beeper](https://beeper.com) messaging platform,
built with [Bubble Tea](https://github.com/charmbracelet/bubbletea).

## Screenshots

_Coming soon._

## Installation

```bash
go install github.com/rdrkr/lazybeeper@latest
```

Or build from source:

```bash
git clone https://github.com/rdrkr/lazybeeper.git
cd lazybeeper
go build .
```

## Usage

```bash
# With API token (live mode)
lazybeeper --token <your-beeper-token>

# With environment variable
export BEEPER_TOKEN=<your-beeper-token>
lazybeeper

# Custom API URL
lazybeeper --url http://localhost:23373

# Mock mode (no token required)
lazybeeper
```

### Environment Variables

| Variable       | Description                     | Default                     |
| -------------- | ------------------------------- | --------------------------- |
| `BEEPER_TOKEN` | Beeper API authentication token | _(none, enables mock mode)_ |
| `BEEPER_URL`   | Beeper Desktop API base URL     | `http://localhost:23373`    |

### CLI Flags

| Flag      | Description                          |
| --------- | ------------------------------------ |
| `--token` | API token (overrides `BEEPER_TOKEN`) |
| `--url`   | Base URL (overrides `BEEPER_URL`)    |

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

```bash
lazybeeper/
├── main.go              # Entry point
├── data/                # Beeper Desktop API client and adapters
│   ├── mock/            # Mock data for development
│   └── poller.go        # Polling with idle backoff
├── domain/              # Pure domain types and Repository interface
│   ├── config/          # Configuration (env vars + CLI flags)
│   └── textutil/        # String utilities
└── ui/                  # Bubble Tea UI layer
    ├── app.go           # Root model (thin routing shell)
    ├── layout.go        # Responsive layout calculation
    ├── viewmodel/       # Business logic (data fetching, state)
    ├── shared/          # Shared types, styles, keybindings
    ├── panel/           # Panel components
    └── popup/           # Overlay dialogs
```

### Key Patterns

- **MVVM**: UI delegates to ViewModel for business logic
- **Repository interface**: Decouples data access from UI
- **Message-based state**: Panels emit messages instead of mutating state directly
- **Adaptive polling**: Backs off when no changes are detected

## Prerequisites

Install [mise](https://github.com/jdx/mise) for task running:

```bash
brew install mise
```

See the [mise documentation](https://mise.jdx.dev/getting-started.html) for other installation methods.

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
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run `mise run check` before submitting
4. Open a pull request
