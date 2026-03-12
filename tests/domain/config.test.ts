// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig, DEFAULT_BASE_URL } from "../../src/domain/config.js";

describe("loadConfig", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.BEEPER_TOKEN;
    delete process.env.BEEPER_URL;
    delete process.env.LAZYBEEPER_THEME;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns defaults when no env vars and empty flags", () => {
    const cfg = loadConfig("", "", "");
    expect(cfg.token).toBe("");
    expect(cfg.baseUrl).toBe(DEFAULT_BASE_URL);
  });

  it("reads BEEPER_TOKEN from environment", () => {
    process.env.BEEPER_TOKEN = "env-token";
    const cfg = loadConfig("", "", "");
    expect(cfg.token).toBe("env-token");
  });

  it("reads BEEPER_URL from environment", () => {
    process.env.BEEPER_URL = "http://custom:9999";
    const cfg = loadConfig("", "", "");
    expect(cfg.baseUrl).toBe("http://custom:9999");
  });

  it("flag token overrides env token", () => {
    process.env.BEEPER_TOKEN = "env-token";
    const cfg = loadConfig("flag-token", "", "");
    expect(cfg.token).toBe("flag-token");
  });

  it("flag baseUrl overrides env baseUrl", () => {
    process.env.BEEPER_URL = "http://env-url:1234";
    const cfg = loadConfig("", "http://flag-url:5678", "");
    expect(cfg.baseUrl).toBe("http://flag-url:5678");
  });

  it("flag token overrides when no env token is set", () => {
    const cfg = loadConfig("flag-token", "", "");
    expect(cfg.token).toBe("flag-token");
  });

  it("flag baseUrl overrides default when no env url is set", () => {
    const cfg = loadConfig("", "http://flag-url:5678", "");
    expect(cfg.baseUrl).toBe("http://flag-url:5678");
  });

  it("both flags override both env vars", () => {
    process.env.BEEPER_TOKEN = "env-token";
    process.env.BEEPER_URL = "http://env-url:1234";
    const cfg = loadConfig("flag-token", "http://flag-url:5678", "");
    expect(cfg.token).toBe("flag-token");
    expect(cfg.baseUrl).toBe("http://flag-url:5678");
  });

  it("returns a readonly config object", () => {
    const cfg = loadConfig("tok", "http://url", "");
    expect(cfg.token).toBe("tok");
    expect(cfg.baseUrl).toBe("http://url");
  });

  it("flagTheme overrides env theme and default", () => {
    process.env.LAZYBEEPER_THEME = "dracula";
    const cfg = loadConfig("", "", "nord");
    expect(cfg.theme).toBe("nord");
  });
});

describe("DEFAULT_BASE_URL", () => {
  it("is the expected localhost address", () => {
    expect(DEFAULT_BASE_URL).toBe("http://localhost:23373");
  });
});
