// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import {
  PanelFocus,
  panelFocusName,
  nextPanel,
  prevPanel,
  rightPanel,
  leftPanel,
} from "../../../src/ui/viewmodel/context.js";

describe("PanelFocus enum", () => {
  it("has correct numeric values", () => {
    expect(PanelFocus.Accounts).toBe(0);
    expect(PanelFocus.Chats).toBe(1);
    expect(PanelFocus.Messages).toBe(2);
    expect(PanelFocus.Input).toBe(3);
    expect(PanelFocus.Popup).toBe(4);
  });
});

describe("panelFocusName", () => {
  it("returns 'Accounts' for PanelFocus.Accounts", () => {
    expect(panelFocusName(PanelFocus.Accounts)).toBe("Accounts");
  });

  it("returns 'Chats' for PanelFocus.Chats", () => {
    expect(panelFocusName(PanelFocus.Chats)).toBe("Chats");
  });

  it("returns 'Messages' for PanelFocus.Messages", () => {
    expect(panelFocusName(PanelFocus.Messages)).toBe("Messages");
  });

  it("returns 'Input' for PanelFocus.Input", () => {
    expect(panelFocusName(PanelFocus.Input)).toBe("Input");
  });

  it("returns 'Popup' for PanelFocus.Popup", () => {
    expect(panelFocusName(PanelFocus.Popup)).toBe("Popup");
  });
});

describe("nextPanel", () => {
  it("cycles Accounts -> Chats", () => {
    expect(nextPanel(PanelFocus.Accounts)).toBe(PanelFocus.Chats);
  });

  it("cycles Chats -> Messages", () => {
    expect(nextPanel(PanelFocus.Chats)).toBe(PanelFocus.Messages);
  });

  it("cycles Messages -> Input", () => {
    expect(nextPanel(PanelFocus.Messages)).toBe(PanelFocus.Input);
  });

  it("cycles Input -> Accounts (wraps around)", () => {
    expect(nextPanel(PanelFocus.Input)).toBe(PanelFocus.Accounts);
  });

  it("returns Accounts when focus is Popup", () => {
    expect(nextPanel(PanelFocus.Popup)).toBe(PanelFocus.Accounts);
  });
});

describe("prevPanel", () => {
  it("cycles Accounts -> Input (wraps around)", () => {
    expect(prevPanel(PanelFocus.Accounts)).toBe(PanelFocus.Input);
  });

  it("cycles Chats -> Accounts", () => {
    expect(prevPanel(PanelFocus.Chats)).toBe(PanelFocus.Accounts);
  });

  it("cycles Messages -> Chats", () => {
    expect(prevPanel(PanelFocus.Messages)).toBe(PanelFocus.Chats);
  });

  it("cycles Input -> Messages", () => {
    expect(prevPanel(PanelFocus.Input)).toBe(PanelFocus.Messages);
  });

  it("returns Input when focus is Popup", () => {
    expect(prevPanel(PanelFocus.Popup)).toBe(PanelFocus.Input);
  });
});

describe("rightPanel", () => {
  it("moves from Accounts to Messages", () => {
    expect(rightPanel(PanelFocus.Accounts)).toBe(PanelFocus.Messages);
  });

  it("moves from Chats to Messages", () => {
    expect(rightPanel(PanelFocus.Chats)).toBe(PanelFocus.Messages);
  });

  it("stays on Messages when already there", () => {
    expect(rightPanel(PanelFocus.Messages)).toBe(PanelFocus.Messages);
  });

  it("stays on Input when already there", () => {
    expect(rightPanel(PanelFocus.Input)).toBe(PanelFocus.Input);
  });

  it("stays on Popup when already there", () => {
    expect(rightPanel(PanelFocus.Popup)).toBe(PanelFocus.Popup);
  });
});

describe("leftPanel", () => {
  it("moves from Messages to Chats", () => {
    expect(leftPanel(PanelFocus.Messages)).toBe(PanelFocus.Chats);
  });

  it("moves from Input to Chats", () => {
    expect(leftPanel(PanelFocus.Input)).toBe(PanelFocus.Chats);
  });

  it("stays on Accounts when already there", () => {
    expect(leftPanel(PanelFocus.Accounts)).toBe(PanelFocus.Accounts);
  });

  it("stays on Chats when already there", () => {
    expect(leftPanel(PanelFocus.Chats)).toBe(PanelFocus.Chats);
  });

  it("stays on Popup when already there", () => {
    expect(leftPanel(PanelFocus.Popup)).toBe(PanelFocus.Popup);
  });
});
