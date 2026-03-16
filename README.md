<!-- Copyright (c) 2026 lazybeeper by Ronen Druker. -->

<h1 align="center">
  📟 lazybeeper
  <br>
  <img src="docs/assets/lazybeeper.webp" alt="lazybeeper" width="120" />
</h1>

<div align="center">

A chat client for the [Beeper](https://beeper.com) messaging platform that runs
in both the **terminal** (TUI via [OpenTUI](https://github.com/nichochar/opentui))
and the **browser** (React DOM). Same codebase, same React components, two renderers.

[![TypeScript](https://img.shields.io/badge/typescript-5.9%2B-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/react-19%2B-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![Bun](https://img.shields.io/badge/bun-runtime-F9F1E1?style=flat&logo=bun&logoColor=black)](https://bun.sh/)
[![Vitest](https://img.shields.io/badge/vitest-tested-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/playwright-e2e-2EAD33?style=flat&logo=playwright&logoColor=white)](https://playwright.dev/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-yellow.svg)](LICENSE)

<!-- prettier-ignore-start -->
<!-- markdownlint-disable-next-line MD013 -->
[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#%EF%B8%8F-architecture) • [Development](#%EF%B8%8F-development) • [Keybindings](#%EF%B8%8F-keybindings)
<!-- prettier-ignore-end -->

</div>

---

<div align="center">
  <img src="docs/assets/demo.gif" alt="Demo">
</div>

> **Note:** lazybeeper is still in very early development. Features and UI are subject to change.

## ✨ Features

- **🖥️ Dual Renderer**: Same React components render in terminal (OpenTUI) and browser (react-dom)
- **🎨 10 Built-in Themes**: Catppuccin, Tokyo Night, Dracula, Nord, Gruvbox, One Dark, and more
- **⌨️ Vim-style Navigation**: `j`/`k`, `g`/`G`, `h`/`l` for fast keyboard-driven workflow
- **🔄 Live Polling**: Automatic chat/message updates with idle backoff
- **📦 Mock Mode**: Full UI exploration without an API token
- **⚙️ Persistent Config**: TOML config file (terminal) or `localStorage` (browser)
- **🧩 MVVM Architecture**: Clean separation with `useReducer`, discriminated unions, and typed actions

---

## 📦 Installation

```bash
git clone https://github.com/rdrkr/lazybeeper.git
cd lazybeeper
bun install
```

---

## 🚀 Usage

### Terminal (TUI)

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

### Browser (Web)

```bash
# Build and serve the web version
mise run serve:web

# Or build only (output in dist-web/)
mise run build:web
```

Then open [http://localhost:3000](http://localhost:3000). The web version uses
mock data by default and persists settings to `localStorage`.

### Environment Variables

| Variable           | Description                     | Default                     |
| ------------------ | ------------------------------- | --------------------------- |
| `BEEPER_TOKEN`     | Beeper API authentication token | _(none, enables mock mode)_ |
| `BEEPER_URL`       | Beeper Desktop API base URL     | `http://localhost:23373`    |
| `LAZYBEEPER_THEME` | Color theme name                | `catppuccin-mocha`          |

### CLI Flags (terminal only)

| Flag      | Description                               |
| --------- | ----------------------------------------- |
| `--token` | API token (overrides `BEEPER_TOKEN`)      |
| `--url`   | Base URL (overrides `BEEPER_URL`)         |
| `--theme` | Theme name (overrides `LAZYBEEPER_THEME`) |

### 🎨 Themes

Built-in themes: `catppuccin-mocha` (default), `catppuccin-macchiato`, `catppuccin-frappe`,
`catppuccin-latte`, `tokyo-night`, `tokyo-night-storm`, `dracula`, `nord`, `gruvbox-dark`, `one-dark`.

Press `t` at runtime to open the theme selector. Changes are persisted to the config file
(terminal) or `localStorage` (browser).

### ⚙️ Configuration File

**Terminal:** lazybeeper stores persistent settings in a TOML file at
`$XDG_CONFIG_HOME/lazybeeper/config.toml` (defaults to `~/.config/lazybeeper/config.toml`).
The file is created automatically on first run.

```toml
theme = "catppuccin-mocha"
```

Press `r` to reload the config file at runtime.

**Browser:** Settings are stored in `localStorage` under the key `lazybeeper-config`.

---

## 🏗️ Architecture

```text
lazybeeper/
├── src/
│   ├── index.tsx           # Terminal entry point (OpenTUI renderer)
│   ├── web/                # Browser-specific modules
│   │   ├── entry.tsx        # Web entry point (react-dom)
│   │   ├── build.ts         # → scripts/build-web.ts (Bun build with shim plugins)
│   │   ├── jsx-runtime.ts   # Custom JSX runtime: TUI elements → HTML
│   │   ├── opentui-core.ts  # TextAttributes web shim
│   │   ├── opentui-react.ts # useKeyboard/useTerminalDimensions web shims
│   │   ├── config-file.ts   # localStorage-backed config persistence
│   │   └── kitty-stub.ts    # Browser avatar rendering via DOM overlays
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
│   └── ui/                 # Shared React UI layer
│       ├── app.tsx          # Root component (keyboard routing)
│       ├── layout.ts        # Responsive layout calculation
│       ├── terminal.ts      # Synchronized output (anti-flicker)
│       ├── theme/           # Theme system (10 built-in themes)
│       ├── viewmodel/       # State, actions, keybindings, reducer
│       ├── panel/           # Panel components
│       └── popup/           # Popup dialogs
├── public/
│   └── index.html           # HTML shell for web build
├── scripts/
│   └── build-web.ts         # Bun build script with module aliasing plugins
├── tests/                   # Unit tests (mirrors src structure)
├── e2e/                     # Playwright end-to-end tests
├── playwright.config.ts     # Playwright configuration
├── package.json
├── tsconfig.json            # Terminal build config
├── tsconfig.web.json        # Web build config
├── eslint.config.mjs
└── vitest.config.ts
```

### Key Patterns

- **Dual renderer**: Same React components render via OpenTUI (terminal) or react-dom (browser)
  using a custom JSX runtime that maps `<box>`, `<text>`, `<span>` to HTML `<div>`/`<span>`
- **Build-time aliasing**: Bun build plugin swaps `@opentui/*` imports for web shims
- **MVVM via useReducer**: UI delegates to reducer for state logic
- **Repository interface**: Decouples data access from UI
- **Discriminated unions**: Type-safe action dispatch
- **React.memo**: Prevents unnecessary re-renders for flicker-free tmux support
- **Synchronized output**: DEC 2026 markers for atomic terminal frame updates
- **Theme system**: 10 built-in themes with React context

---

## 🛠️ Development

### Prerequisites

Install [mise](https://github.com/jdx/mise) for task running:

```bash
brew install mise
```

### Quick Commands

```bash
# Run the terminal app (mock mode by default)
mise run run

# Build and serve the web version
mise run serve:web

# Build only the web version (output: dist-web/)
mise run build:web

# Format code
mise run fmt

# Run linter
mise run lint

# Run tests
mise run test

# Build the terminal version
mise run build

# Full check (format + lint + test + build)
mise run check

# Run Playwright end-to-end tests (headless)
mise run e2e

# Run e2e tests with visible browser
mise run e2e:headed

# Clean build artifacts (terminal + web)
mise run clean

# Check for outdated packages
mise run outdated

# Upgrade all dependencies
mise run upgrade
```

---

## ⌨️ Keybindings

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

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run `mise run check` before submitting
4. Open a pull request

---

<!-- markdownlint-disable-next-line MD033 -->
<div align="center">

Made with ❤️ by Ronen Druker

</div>
