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
    expect(isQuitKey({ name: "q" })).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isQuitKey({ name: "a" })).toBe(false);
  });

  it("returns false for 'c'", () => {
    expect(isQuitKey({ name: "c" })).toBe(false);
  });
});

describe("isInterruptKey", () => {
  it("returns true for ctrl+c", () => {
    expect(isInterruptKey({ name: "c", ctrl: true })).toBe(true);
  });

  it("returns false for 'c' without ctrl", () => {
    expect(isInterruptKey({ name: "c" })).toBe(false);
  });

  it("returns false for ctrl with non-c input", () => {
    expect(isInterruptKey({ name: "a", ctrl: true })).toBe(false);
  });
});

describe("isTabKey", () => {
  it("returns true for tab without shift", () => {
    expect(isTabKey({ name: "tab" })).toBe(true);
  });

  it("returns false for shift+tab", () => {
    expect(isTabKey({ name: "tab", shift: true })).toBe(false);
  });

  it("returns false when tab is not pressed", () => {
    expect(isTabKey(emptyKey)).toBe(false);
  });

  it("returns false when a different key is pressed", () => {
    expect(isTabKey({ name: "space" })).toBe(false);
  });
});

describe("isShiftTabKey", () => {
  it("returns true for shift+tab", () => {
    expect(isShiftTabKey({ name: "tab", shift: true })).toBe(true);
  });

  it("returns false for tab without shift", () => {
    expect(isShiftTabKey({ name: "tab" })).toBe(false);
  });

  it("returns false for shift without tab", () => {
    expect(isShiftTabKey({ shift: true })).toBe(false);
  });

  it("returns false when neither pressed", () => {
    expect(isShiftTabKey(emptyKey)).toBe(false);
  });

  it("returns false when shift is false and key is not tab", () => {
    expect(isShiftTabKey({ name: "space", shift: false })).toBe(false);
  });
});

describe("isLeftKey", () => {
  it("returns true for 'h'", () => {
    expect(isLeftKey({ name: "h" })).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isLeftKey({ name: "l" })).toBe(false);
    expect(isLeftKey({ name: "a" })).toBe(false);
  });
});

describe("isRightKey", () => {
  it("returns true for 'l'", () => {
    expect(isRightKey({ name: "l" })).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isRightKey({ name: "h" })).toBe(false);
    expect(isRightKey({ name: "a" })).toBe(false);
  });
});

describe("isUpKey", () => {
  it("returns true for 'k'", () => {
    expect(isUpKey({ name: "k" })).toBe(true);
  });

  it("returns true for up arrow", () => {
    expect(isUpKey({ name: "up" })).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isUpKey({ name: "j" })).toBe(false);
  });

  it("returns false for unrelated key", () => {
    expect(isUpKey({ name: "a" })).toBe(false);
  });
});

describe("isDownKey", () => {
  it("returns true for 'j'", () => {
    expect(isDownKey({ name: "j" })).toBe(true);
  });

  it("returns true for down arrow", () => {
    expect(isDownKey({ name: "down" })).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isDownKey({ name: "k" })).toBe(false);
  });

  it("returns false for unrelated key", () => {
    expect(isDownKey({ name: "a" })).toBe(false);
  });
});

describe("isEnterKey", () => {
  it("returns true for return key", () => {
    expect(isEnterKey({ name: "return" })).toBe(true);
  });

  it("returns false when return is not pressed", () => {
    expect(isEnterKey(emptyKey)).toBe(false);
  });

  it("returns false for a different key", () => {
    expect(isEnterKey({ name: "space" })).toBe(false);
  });
});

describe("isEscapeKey", () => {
  it("returns true for escape key", () => {
    expect(isEscapeKey({ name: "escape" })).toBe(true);
  });

  it("returns false when escape is not pressed", () => {
    expect(isEscapeKey(emptyKey)).toBe(false);
  });

  it("returns false for a different key", () => {
    expect(isEscapeKey({ name: "space" })).toBe(false);
  });
});

describe("isSearchKey", () => {
  it("returns true for '/'", () => {
    expect(isSearchKey({ name: "/" })).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isSearchKey({ name: "a" })).toBe(false);
    expect(isSearchKey({ name: "\\" })).toBe(false);
  });
});

describe("isHelpKey", () => {
  it("returns true for '?'", () => {
    expect(isHelpKey({ name: "?" })).toBe(true);
  });

  it("returns true for shift+'/'", () => {
    expect(isHelpKey({ name: "/", shift: true })).toBe(true);
  });

  it("returns false for '/' without shift", () => {
    expect(isHelpKey({ name: "/" })).toBe(false);
  });

  it("returns false for other keys", () => {
    expect(isHelpKey({ name: "h" })).toBe(false);
  });
});

describe("getJumpPanel", () => {
  it("returns 0 for '1'", () => {
    expect(getJumpPanel({ name: "1" })).toBe(0);
  });

  it("returns 1 for '2'", () => {
    expect(getJumpPanel({ name: "2" })).toBe(1);
  });

  it("returns 2 for '3'", () => {
    expect(getJumpPanel({ name: "3" })).toBe(2);
  });

  it("returns 3 for '4'", () => {
    expect(getJumpPanel({ name: "4" })).toBe(3);
  });

  it("returns null for '0'", () => {
    expect(getJumpPanel({ name: "0" })).toBeNull();
  });

  it("returns null for '5'", () => {
    expect(getJumpPanel({ name: "5" })).toBeNull();
  });

  it("returns null for non-numeric input", () => {
    expect(getJumpPanel({ name: "a" })).toBeNull();
  });

  it("returns null for empty key", () => {
    expect(getJumpPanel(emptyKey)).toBeNull();
  });
});

describe("isTopKey", () => {
  it("returns true for 'g'", () => {
    expect(isTopKey({ name: "g" })).toBe(true);
  });

  it("returns false for 'G'", () => {
    expect(isTopKey({ name: "G" })).toBe(false);
  });

  it("returns false for other keys", () => {
    expect(isTopKey({ name: "a" })).toBe(false);
  });
});

describe("isBottomKey", () => {
  it("returns true for 'G'", () => {
    expect(isBottomKey({ name: "G" })).toBe(true);
  });

  it("returns true for shift+'g'", () => {
    expect(isBottomKey({ name: "g", shift: true })).toBe(true);
  });

  it("returns false for 'g' without shift", () => {
    expect(isBottomKey({ name: "g" })).toBe(false);
  });

  it("returns false for other keys", () => {
    expect(isBottomKey({ name: "a" })).toBe(false);
  });
});

describe("isArchiveKey", () => {
  it("returns true for 'a'", () => {
    expect(isArchiveKey({ name: "a" })).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isArchiveKey({ name: "A" })).toBe(false);
    expect(isArchiveKey({ name: "b" })).toBe(false);
  });
});

describe("isMuteKey", () => {
  it("returns true for 'm'", () => {
    expect(isMuteKey({ name: "m" })).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isMuteKey({ name: "M" })).toBe(false);
    expect(isMuteKey({ name: "n" })).toBe(false);
  });
});

describe("isPinKey", () => {
  it("returns true for 'p'", () => {
    expect(isPinKey({ name: "p" })).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isPinKey({ name: "P" })).toBe(false);
    expect(isPinKey({ name: "q" })).toBe(false);
  });
});

describe("isYesKey", () => {
  it("returns true for 'y'", () => {
    expect(isYesKey({ name: "y" })).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isYesKey({ name: "Y" })).toBe(false);
    expect(isYesKey({ name: "n" })).toBe(false);
  });
});

describe("isNoKey", () => {
  it("returns true for 'n'", () => {
    expect(isNoKey({ name: "n" })).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isNoKey({ name: "N" })).toBe(false);
    expect(isNoKey({ name: "y" })).toBe(false);
  });
});

describe("isConfigKey", () => {
  it("returns true for 'c'", () => {
    expect(isConfigKey({ name: "c" })).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isConfigKey({ name: "C" })).toBe(false);
    expect(isConfigKey({ name: "t" })).toBe(false);
  });
});

describe("isReloadConfigKey", () => {
  it("returns true for 'r'", () => {
    expect(isReloadConfigKey({ name: "r" })).toBe(true);
  });

  it("returns false for other keys", () => {
    expect(isReloadConfigKey({ name: "R" })).toBe(false);
    expect(isReloadConfigKey({ name: "a" })).toBe(false);
  });
});
