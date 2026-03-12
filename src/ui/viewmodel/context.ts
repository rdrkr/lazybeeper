// Copyright (c) 2026 lazybeeper by Ronen Druker.

/** Identifies which panel currently has keyboard focus. */
export enum PanelFocus {
  /** Accounts list panel. */
  Accounts = 0,
  /** Chats list panel. */
  Chats = 1,
  /** Message viewport panel. */
  Messages = 2,
  /** Message input textarea. */
  Input = 3,
  /** Active popup/overlay. */
  Popup = 4,
}

/** Number of navigable panels (excluding popup). */
const PANEL_COUNT = 4;

/**
 * Returns the human-readable name of the panel focus.
 * @param focus - The current panel focus value.
 * @returns The display name of the panel.
 */
export function panelFocusName(focus: PanelFocus): string {
  switch (focus) {
    case PanelFocus.Accounts:
      return "Accounts";
    case PanelFocus.Chats:
      return "Chats";
    case PanelFocus.Messages:
      return "Messages";
    case PanelFocus.Input:
      return "Input";
    case PanelFocus.Popup:
      return "Popup";
  }
}

/**
 * Returns the next panel in the Tab cycle order.
 * @param focus - The current panel focus.
 * @returns The next panel in the cycle.
 */
export function nextPanel(focus: PanelFocus): PanelFocus {
  if (focus === PanelFocus.Popup) {
    return PanelFocus.Accounts;
  }

  return ((focus + 1) % PANEL_COUNT) as PanelFocus;
}

/**
 * Returns the previous panel in the Shift+Tab cycle order.
 * @param focus - The current panel focus.
 * @returns The previous panel in the cycle.
 */
export function prevPanel(focus: PanelFocus): PanelFocus {
  if (focus === PanelFocus.Popup) {
    return PanelFocus.Input;
  }

  return ((focus + PANEL_COUNT - 1) % PANEL_COUNT) as PanelFocus;
}

/**
 * Returns the panel to the right. From sidebar, moves to messages.
 * @param focus - The current panel focus.
 * @returns The panel to the right, or the same panel if no right neighbor.
 */
export function rightPanel(focus: PanelFocus): PanelFocus {
  switch (focus) {
    case PanelFocus.Accounts:
    case PanelFocus.Chats:
      return PanelFocus.Messages;
    default:
      return focus;
  }
}

/**
 * Returns the panel to the left. From main area, moves to chats.
 * @param focus - The current panel focus.
 * @returns The panel to the left, or the same panel if no left neighbor.
 */
export function leftPanel(focus: PanelFocus): PanelFocus {
  switch (focus) {
    case PanelFocus.Messages:
    case PanelFocus.Input:
      return PanelFocus.Chats;
    default:
      return focus;
  }
}
