// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import { ChatAction } from "../../../src/ui/viewmodel/messages.js";

describe("ChatAction enum", () => {
  it("has 'archive' value for Archive", () => {
    expect(ChatAction.Archive).toBe("archive");
  });

  it("has 'unarchive' value for Unarchive", () => {
    expect(ChatAction.Unarchive).toBe("unarchive");
  });
});
