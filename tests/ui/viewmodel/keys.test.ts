// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import {
  isQuitKey,
  isInterruptKey,
  isTabKey,
  isShiftTabKey,
  isLeftKey,
  isRightKey,
  isUpKey,
  isDownKey,
  isEnterKey,
  isEscapeKey,
  isSearchKey,
  isHelpKey,
  getJumpPanel,
  isTopKey,
  isBottomKey,
  isArchiveKey,
  isMuteKey,
  isPinKey,
  isYesKey,
  isNoKey,
  isConfigKey,
  isReloadConfigKey,
  type KeyInfo,
} from "../../../src/ui/viewmodel/keys.js";

const emptyKey: KeyInfo = {};

describe("isQuitKey", () => {
  it("returns true for 'q'", () => {
    expect(isQuitKey("q")).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isQuitKey("a")).toBe(false);
  });

  it("returns false for 'c'", () => {
    expect(isQuitKey("c")).toBe(false);
  });
});

describe("isInterruptKey", () => {
  it("returns true for ctrl+c", () => {
    expect(isInterruptKey("c", { ctrl: true })).toBe(true);
  });

  it("returns false for 'c' without ctrl", () => {
    expect(isInterruptKey("c", emptyKey)).toBe(false);
  });

  it("returns false for ctrl with non-c input", () => {
    expect(isInterruptKey("a", { ctrl: true })).toBe(false);
  });
});

describe("isTabKey", () => {
  it("returns true for tab without shift", () => {
    expect(isTabKey("", { tab: true })).toBe(true);
  });

  it("returns false for shift+tab", () => {
    expect(isTabKey("", { tab: true, shift: true })).toBe(false);
  });

  it("returns false when tab is not pressed", () => {
    expect(isTabKey("", emptyKey)).toBe(false);
  });

  it("returns false when tab is false", () => {
    expect(isTabKey("", { tab: false })).toBe(false);
  });
});

describe("isShiftTabKey", () => {
  it("returns true for shift+tab", () => {
    expect(isShiftTabKey("", { shift: true, tab: true })).toBe(true);
  });

  it("returns false for tab without shift", () => {
    expect(isShiftTabKey("", { tab: true })).toBe(false);
  });

  it("returns false for shift without tab", () => {
    expect(isShiftTabKey("", { shift: true })).toBe(false);
  });

  it("returns false when neither pressed", () => {
    expect(isShiftTabKey("", emptyKey)).toBe(false);
  });

  it("returns false when shift is false and tab is false", () => {
    expect(isShiftTabKey("", { shift: false, tab: false })).toBe(false);
  });
});

describe("isLeftKey", () => {
  it("returns true for 'h'", () => {
    expect(isLeftKey("h")).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isLeftKey("l")).toBe(false);
    expect(isLeftKey("a")).toBe(false);
  });
});

describe("isRightKey", () => {
  it("returns true for 'l'", () => {
    expect(isRightKey("l")).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isRightKey("h")).toBe(false);
    expect(isRightKey("a")).toBe(false);
  });
});

describe("isUpKey", () => {
  it("returns true for 'k'", () => {
    expect(isUpKey("k", emptyKey)).toBe(true);
  });

  it("returns true for up arrow", () => {
    expect(isUpKey("", { upArrow: true })).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isUpKey("j", emptyKey)).toBe(false);
  });

  it("returns false when upArrow is false", () => {
    expect(isUpKey("a", { upArrow: false })).toBe(false);
  });
});

describe("isDownKey", () => {
  it("returns true for 'j'", () => {
    expect(isDownKey("j", emptyKey)).toBe(true);
  });

  it("returns true for down arrow", () => {
    expect(isDownKey("", { downArrow: true })).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isDownKey("k", emptyKey)).toBe(false);
  });

  it("returns false when downArrow is false", () => {
    expect(isDownKey("a", { downArrow: false })).toBe(false);
  });
});

describe("isEnterKey", () => {
  it("returns true for return key", () => {
    expect(isEnterKey("", { return: true })).toBe(true);
  });

  it("returns false when return is not pressed", () => {
    expect(isEnterKey("", emptyKey)).toBe(false);
  });

  it("returns false when return is false", () => {
    expect(isEnterKey("", { return: false })).toBe(false);
  });
});

describe("isEscapeKey", () => {
  it("returns true for escape key", () => {
    expect(isEscapeKey("", { escape: true })).toBe(true);
  });

  it("returns false when escape is not pressed", () => {
    expect(isEscapeKey("", emptyKey)).toBe(false);
  });

  it("returns false when escape is false", () => {
    expect(isEscapeKey("", { escape: false })).toBe(false);
  });
});

describe("isSearchKey", () => {
  it("returns true for '/'", () => {
    expect(isSearchKey("/")).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isSearchKey("a")).toBe(false);
    expect(isSearchKey("\\")).toBe(false);
  });
});

describe("isHelpKey", () => {
  it("returns true for '?'", () => {
    expect(isHelpKey("?")).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isHelpKey("/")).toBe(false);
    expect(isHelpKey("h")).toBe(false);
  });
});

describe("getJumpPanel", () => {
  it("returns 0 for '1'", () => {
    expect(getJumpPanel("1")).toBe(0);
  });

  it("returns 1 for '2'", () => {
    expect(getJumpPanel("2")).toBe(1);
  });

  it("returns 2 for '3'", () => {
    expect(getJumpPanel("3")).toBe(2);
  });

  it("returns 3 for '4'", () => {
    expect(getJumpPanel("4")).toBe(3);
  });

  it("returns null for '0'", () => {
    expect(getJumpPanel("0")).toBeNull();
  });

  it("returns null for '5'", () => {
    expect(getJumpPanel("5")).toBeNull();
  });

  it("returns null for non-numeric input", () => {
    expect(getJumpPanel("a")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getJumpPanel("")).toBeNull();
  });
});

describe("isTopKey", () => {
  it("returns true for 'g'", () => {
    expect(isTopKey("g")).toBe(true);
  });

  it("returns false for 'G'", () => {
    expect(isTopKey("G")).toBe(false);
  });

  it("returns false for other keys", () => {
    expect(isTopKey("a")).toBe(false);
  });
});

describe("isBottomKey", () => {
  it("returns true for 'G'", () => {
    expect(isBottomKey("G")).toBe(true);
  });

  it("returns false for 'g'", () => {
    expect(isBottomKey("g")).toBe(false);
  });

  it("returns false for other keys", () => {
    expect(isBottomKey("a")).toBe(false);
  });
});

describe("isArchiveKey", () => {
  it("returns true for 'a'", () => {
    expect(isArchiveKey("a")).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isArchiveKey("A")).toBe(false);
    expect(isArchiveKey("b")).toBe(false);
  });
});

describe("isMuteKey", () => {
  it("returns true for 'm'", () => {
    expect(isMuteKey("m")).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isMuteKey("M")).toBe(false);
    expect(isMuteKey("n")).toBe(false);
  });
});

describe("isPinKey", () => {
  it("returns true for 'p'", () => {
    expect(isPinKey("p")).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isPinKey("P")).toBe(false);
    expect(isPinKey("q")).toBe(false);
  });
});

describe("isYesKey", () => {
  it("returns true for 'y'", () => {
    expect(isYesKey("y")).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isYesKey("Y")).toBe(false);
    expect(isYesKey("n")).toBe(false);
  });
});

describe("isNoKey", () => {
  it("returns true for 'n'", () => {
    expect(isNoKey("n")).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isNoKey("N")).toBe(false);
    expect(isNoKey("y")).toBe(false);
  });
});

describe("isConfigKey", () => {
  it("returns true for 'c'", () => {
    expect(isConfigKey("c")).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isConfigKey("C")).toBe(false);
    expect(isConfigKey("t")).toBe(false);
  });
});

describe("isReloadConfigKey", () => {
  it("returns true for 'r'", () => {
    expect(isReloadConfigKey("r")).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isReloadConfigKey("R")).toBe(false);
    expect(isReloadConfigKey("a")).toBe(false);
  });
});
