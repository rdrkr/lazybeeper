// Copyright (c) 2026 lazybeeper by Ronen Druker.

/** Minimum sidebar width in characters. */
const SIDEBAR_MIN_WIDTH = 25;

/** Maximum sidebar width in characters. */
const SIDEBAR_MAX_WIDTH = 40;

/** Sidebar width as a percentage of total width. */
const SIDEBAR_PCT = 30;

/** Fixed height for the input panel. */
const INPUT_HEIGHT = 6;

/** Fixed height for the status bar. */
const STATUS_BAR_HEIGHT = 1;

/**
 * Layout holds calculated panel dimensions based on the terminal size.
 */
export interface Layout {
  /** Total terminal width. */
  readonly totalWidth: number;
  /** Total terminal height. */
  readonly totalHeight: number;
  /** Width of the sidebar column. */
  readonly sidebarWidth: number;
  /** Width of the main content area. */
  readonly mainWidth: number;
  /** Height of the accounts panel. */
  readonly accountsHeight: number;
  /** Height of the chats panel. */
  readonly chatsHeight: number;
  /** Height of the message viewport. */
  readonly messagesHeight: number;
  /** Height of the input textarea. */
  readonly inputHeight: number;
  /** Height of the status bar (always 1). */
  readonly statusBarHeight: number;
}

/**
 * Computes panel dimensions from the total terminal size.
 * @param width - The total terminal width in characters.
 * @param height - The total terminal height in characters.
 * @returns The computed layout dimensions.
 */
export function calculateLayout(width: number, height: number): Layout {
  let sidebarWidth = Math.floor((width * SIDEBAR_PCT) / 100);
  sidebarWidth = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, sidebarWidth));

  const mainWidth = width - sidebarWidth;

  let usableHeight = height - STATUS_BAR_HEIGHT;
  if (usableHeight < 0) {
    usableHeight = 0;
  }

  let accountsHeight = Math.floor((usableHeight * 30) / 100);
  if (accountsHeight < 3) {
    accountsHeight = 3;
  }

  const chatsHeight = usableHeight - accountsHeight;

  let inputHeight = INPUT_HEIGHT;
  let messagesHeight = usableHeight - inputHeight;

  if (messagesHeight < 3) {
    messagesHeight = 3;
    inputHeight = usableHeight - messagesHeight;

    if (inputHeight < 3) {
      inputHeight = 3;
    }
  }

  return {
    totalWidth: width,
    totalHeight: height,
    sidebarWidth,
    mainWidth,
    accountsHeight,
    chatsHeight,
    messagesHeight,
    inputHeight,
    statusBarHeight: STATUS_BAR_HEIGHT,
  };
}
