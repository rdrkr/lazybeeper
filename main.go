// Copyright (c) 2026 lazybeeper by Ronen Druker.

// Package main is the entry point for lazybeeper, a TUI chat application
// powered by the Beeper Desktop API.
package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/rdrkr/lazybeeper/data"
	"github.com/rdrkr/lazybeeper/domain"
	"github.com/rdrkr/lazybeeper/domain/config"
	"github.com/rdrkr/lazybeeper/ui"

	tea "charm.land/bubbletea/v2"
)

func main() {
	token := flag.String("token", "", "Beeper API token (overrides BEEPER_TOKEN env)")
	baseURL := flag.String("url", "", "Beeper API base URL (default: http://localhost:23373)")

	flag.Parse()

	cfg := config.Load(*token, *baseURL)

	var repo domain.Repository = data.NewClient(cfg)

	app := ui.NewApp(repo)
	p := tea.NewProgram(app)

	if _, err := p.Run(); err != nil {
		_, _ = fmt.Fprintf(os.Stderr, "Error: %v\n", err)

		os.Exit(1)
	}
}
