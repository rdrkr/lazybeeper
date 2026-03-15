// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import {
  configDir,
  configFilePath,
  readConfigFile,
  writeConfigFile,
  updateConfigFileKey,
  resetConfigFile,
  SelectionMode,
  ChatListStyle,
  Style,
  DEFAULT_CONFIG,
} from "../../src/domain/config-file.js";

describe("config-file", () => {
  const originalEnv = { ...process.env };
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "lazybeeper-test-"));
    process.env.XDG_CONFIG_HOME = tmpDir;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("configDir", () => {
    it("uses XDG_CONFIG_HOME when set", () => {
      process.env.XDG_CONFIG_HOME = "/custom/xdg";
      expect(configDir()).toBe("/custom/xdg/lazybeeper");
    });

    it("falls back to HOME/.config when XDG_CONFIG_HOME is not set", () => {
      delete process.env.XDG_CONFIG_HOME;
      process.env.HOME = "/home/testuser";
      expect(configDir()).toBe("/home/testuser/.config/lazybeeper");
    });

    it("falls back to ~/ when neither XDG_CONFIG_HOME nor HOME is set", () => {
      delete process.env.XDG_CONFIG_HOME;
      delete process.env.HOME;
      expect(configDir()).toBe(path.join("~", ".config", "lazybeeper"));
    });
  });

  describe("configFilePath", () => {
    it("returns config.toml inside the config directory", () => {
      process.env.XDG_CONFIG_HOME = "/custom/xdg";
      expect(configFilePath()).toBe("/custom/xdg/lazybeeper/config.toml");
    });
  });

  describe("readConfigFile", () => {
    it("creates a default config file when none exists", () => {
      const result = readConfigFile();
      expect(result).toEqual(DEFAULT_CONFIG);
      expect(fs.existsSync(configFilePath())).toBe(true);
    });

    it("returns defaults from newly created file", () => {
      const result = readConfigFile();
      expect(result.theme).toBe("catppuccin-mocha");
    });

    it("reads a valid TOML config file", () => {
      const dir = configDir();
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(configFilePath(), 'theme = "dracula"\n', "utf-8");

      const result = readConfigFile();
      expect(result.theme).toBe("dracula");
    });

    it("returns defaults when TOML is invalid", () => {
      const dir = configDir();
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(configFilePath(), "{{{{invalid toml!!", "utf-8");

      const result = readConfigFile();
      expect(result).toEqual(DEFAULT_CONFIG);
    });

    it("returns default theme when theme value is not a string", () => {
      const dir = configDir();
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(configFilePath(), "theme = 42\n", "utf-8");

      const result = readConfigFile();
      expect(result.theme).toBe("catppuccin-mocha");
    });

    it("reads selection_mode from config file", () => {
      const dir = configDir();
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(configFilePath(), 'theme = "nord"\nselection_mode = "navigate"\n', "utf-8");

      const result = readConfigFile();
      expect(result.selectionMode).toBe(SelectionMode.Navigate);
    });

    it("defaults selection_mode when value is invalid", () => {
      const dir = configDir();
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(configFilePath(), 'theme = "nord"\nselection_mode = "bogus"\n', "utf-8");

      const result = readConfigFile();
      expect(result.selectionMode).toBe(SelectionMode.Enter);
    });

    it("defaults selection_mode when value is not a string", () => {
      const dir = configDir();
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(configFilePath(), 'theme = "nord"\nselection_mode = 99\n', "utf-8");

      const result = readConfigFile();
      expect(result.selectionMode).toBe(SelectionMode.Enter);
    });
  });

  describe("writeConfigFile", () => {
    it("writes TOML content to the config file", () => {
      writeConfigFile({ ...DEFAULT_CONFIG, theme: "nord" });

      const content = fs.readFileSync(configFilePath(), "utf-8");
      expect(content).toContain("nord");
    });

    it("creates the config directory if it does not exist", () => {
      const dir = configDir();
      expect(fs.existsSync(dir)).toBe(false);

      writeConfigFile({ ...DEFAULT_CONFIG, theme: "solarized" });

      expect(fs.existsSync(dir)).toBe(true);
      expect(fs.existsSync(configFilePath())).toBe(true);
    });

    it("overwrites an existing config file", () => {
      writeConfigFile({ ...DEFAULT_CONFIG, theme: "nord" });
      writeConfigFile({ ...DEFAULT_CONFIG, theme: "dracula" });

      const content = fs.readFileSync(configFilePath(), "utf-8");
      expect(content).toContain("dracula");
      expect(content).not.toContain("nord");
    });
  });

  describe("readConfigFile chat_list_style", () => {
    it("reads chat_list_style from config file", () => {
      const dir = configDir();
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        configFilePath(),
        'theme = "nord"\nselection_mode = "enter"\nchat_list_style = "compact"\nstyle = "modern"\n',
        "utf-8",
      );
      const result = readConfigFile();
      expect(result.chatListStyle).toBe(ChatListStyle.Compact);
    });

    it("defaults chat_list_style when value is invalid", () => {
      const dir = configDir();
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        configFilePath(),
        'theme = "nord"\nselection_mode = "enter"\nchat_list_style = "bogus"\nstyle = "modern"\n',
        "utf-8",
      );
      const result = readConfigFile();
      expect(result.chatListStyle).toBe(ChatListStyle.Comfortable);
    });

    it("defaults chat_list_style when value is not a string", () => {
      const dir = configDir();
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        configFilePath(),
        'theme = "nord"\nselection_mode = "enter"\nchat_list_style = 42\nstyle = "modern"\n',
        "utf-8",
      );
      const result = readConfigFile();
      expect(result.chatListStyle).toBe(ChatListStyle.Comfortable);
    });
  });

  describe("readConfigFile style", () => {
    it("reads style from config file", () => {
      const dir = configDir();
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        configFilePath(),
        'theme = "nord"\nselection_mode = "enter"\nchat_list_style = "comfortable"\nstyle = "retro"\n',
        "utf-8",
      );
      const result = readConfigFile();
      expect(result.style).toBe(Style.Retro);
    });

    it("defaults style when value is invalid", () => {
      const dir = configDir();
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        configFilePath(),
        'theme = "nord"\nselection_mode = "enter"\nchat_list_style = "comfortable"\nstyle = "bogus"\n',
        "utf-8",
      );
      const result = readConfigFile();
      expect(result.style).toBe(Style.Modern);
    });

    it("defaults style when value is not a string", () => {
      const dir = configDir();
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        configFilePath(),
        'theme = "nord"\nselection_mode = "enter"\nchat_list_style = "comfortable"\nstyle = 99\n',
        "utf-8",
      );
      const result = readConfigFile();
      expect(result.style).toBe(Style.Modern);
    });
  });

  describe("resetConfigFile", () => {
    it("resets config to defaults", () => {
      writeConfigFile({ ...DEFAULT_CONFIG, theme: "dracula" });
      resetConfigFile();
      const result = readConfigFile();
      expect(result).toEqual(DEFAULT_CONFIG);
    });
  });

  describe("updateConfigFileKey", () => {
    it("updates the theme key in the config file", () => {
      writeConfigFile({ ...DEFAULT_CONFIG, theme: "nord" });

      updateConfigFileKey("theme", "dracula");

      const result = readConfigFile();
      expect(result.theme).toBe("dracula");
    });

    it("creates a config file if none exists before updating", () => {
      updateConfigFileKey("theme", "solarized");

      const result = readConfigFile();
      expect(result.theme).toBe("solarized");
    });
  });
});
