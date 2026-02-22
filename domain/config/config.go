// Copyright (c) 2026 lazybeeper by Ronen Druker.

// Package config handles application configuration loading from environment
// variables and CLI flags.
package config

import "os"

// DefaultBaseURL is the default address for the Beeper Desktop local API.
const DefaultBaseURL = "http://localhost:23373"

// Config holds application-level configuration.
type Config struct {
	// Token is the Beeper API authentication token.
	Token string
	// BaseURL is the base URL for the Beeper Desktop API.
	BaseURL string
}

// Load creates a Config by merging CLI flags with environment variables.
// CLI flags take precedence over environment variables.
func Load(flagToken, flagBaseURL string) Config {
	cfg := Config{
		Token:   os.Getenv("BEEPER_TOKEN"),
		BaseURL: DefaultBaseURL,
	}

	if envURL := os.Getenv("BEEPER_URL"); envURL != "" {
		cfg.BaseURL = envURL
	}

	if flagToken != "" {
		cfg.Token = flagToken
	}

	if flagBaseURL != "" {
		cfg.BaseURL = flagBaseURL
	}

	return cfg
}
