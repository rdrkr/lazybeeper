// Copyright (c) 2026 lazybeeper by Ronen Druker.
// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "../../../helpers/render.js";
import { useAppState } from "../../../../src/ui/viewmodel/use-app-state.js";
import type { UseAppStateReturn } from "../../../../src/ui/viewmodel/use-app-state.js";
import type { Repository } from "../../../../src/domain/repository.js";
import type { Account, Chat, Message } from "../../../../src/domain/types.js";
import { ALL_ACCOUNTS_ID } from "../../../../src/domain/types.js";
import { PanelFocus } from "../../../../src/ui/viewmodel/context.js";

/* ------------------------------------------------------------------ */
/*  Test data                                                          */
/* ------------------------------------------------------------------ */

const testAccount: Account = {
  id: "acc1",
  name: "Test Account",
  protocol: "test",
  connected: true,
};

const testChat: Chat = {
  id: "chat1",
  accountId: "acc1",
  name: "Alice",
  lastMessage: "Hello",
  lastMessageTime: new Date("2026-01-01"),
  unreadCount: 1,
  pinned: false,
  muted: false,
};

const testMessage: Message = {
  id: "msg1",
  chatId: "chat1",
  sender: "Alice",
  body: "Hey there",
  timestamp: new Date("2026-01-01"),
  isFromMe: false,
};

const testAccount2: Account = {
  id: "acc2",
  name: "Second Account",
  protocol: "test",
  connected: true,
};

/* ------------------------------------------------------------------ */
/*  Helper: create a mock repository                                   */
/* ------------------------------------------------------------------ */

/**
 * Creates a mock Repository with configurable behavior.
 * @param overrides - Optional overrides for mock behavior.
 * @returns A mock Repository instance.
 */
function createMockRepo(
  overrides: Partial<{
    useMock: boolean;
    accounts: Account[];
    chats: Chat[];
    messages: Message[];
    fetchAccountsError: Error;
    fetchChatsError: Error;
    fetchMessagesError: Error;
  }> = {},
): Repository {
  const {
    useMock: isMock = false,
    accounts = [testAccount],
    chats = [testChat],
    messages = [testMessage],
    fetchAccountsError,
    fetchChatsError,
    fetchMessagesError,
  } = overrides;

  return {
    useMock: vi.fn(() => isMock),
    fetchAccounts: fetchAccountsError
      ? vi.fn().mockRejectedValue(fetchAccountsError)
      : vi.fn().mockResolvedValue(accounts),
    fetchChats: fetchChatsError
      ? vi.fn().mockRejectedValue(fetchChatsError)
      : vi.fn().mockResolvedValue(chats),
    fetchMessages: fetchMessagesError
      ? vi.fn().mockRejectedValue(fetchMessagesError)
      : vi.fn().mockResolvedValue(messages),
    sendMessage: vi.fn().mockResolvedValue(undefined),
    archiveChat: vi.fn().mockResolvedValue(undefined),
  };
}

/* ------------------------------------------------------------------ */
/*  Helper: wrapper component that captures hook return value          */
/* ------------------------------------------------------------------ */

/** Holds the most recent hook return value. */
let hookResult: UseAppStateReturn;

/**
 * Wrapper component that renders the hook and exposes its return value.
 * @param props - Component props.
 * @param props.repo - The repository to pass to useAppState.
 * @returns A text element showing the current focus.
 */
function HookWrapper({ repo }: { readonly repo: Repository }): React.ReactNode {
  const result = useAppState(repo);
  hookResult = result;
  return <text>{result.state.focus.toString()}</text>;
}

/**
 * Flush microtasks and timers so React effects settle.
 * @returns A promise that resolves after flushing.
 */
async function flush(): Promise<void> {
  for (let i = 0; i < 15; i++) {
    await new Promise<void>((r) => {
      setTimeout(r, 5);
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Tests with real timers (initialization, fetching, navigation)      */
/* ------------------------------------------------------------------ */

describe("useAppState hook", () => {
  describe("initialization", () => {
    it("initializes state and creates a Poller", async () => {
      const repo = createMockRepo();
      const inst = await render(<HookWrapper repo={repo} />);
      expect(hookResult.state.isMock).toBe(false);
      expect(hookResult.poller).toBeDefined();
      expect(hookResult.dispatch).toBeTypeOf("function");
      await flush();
      inst.unmount();
    });

    it("passes useMock result to createInitialState", async () => {
      const repo = createMockRepo({ useMock: true });
      const inst = await render(<HookWrapper repo={repo} />);
      expect(hookResult.state.isMock).toBe(true);
      expect(hookResult.state.errorMessage).toContain("mock data");
      await flush();
      inst.unmount();
    });
  });

  describe("fetch accounts on mount", () => {
    it("calls fetchAccounts and dispatches accounts_loaded", async () => {
      const repo = createMockRepo({ accounts: [testAccount] });
      const inst = await render(<HookWrapper repo={repo} />);
      await flush();
      expect(repo.fetchAccounts).toHaveBeenCalledTimes(1);
      expect(hookResult.state.accounts).toHaveLength(2);
      expect(hookResult.state.accounts[0]?.id).toBe(ALL_ACCOUNTS_ID);
      expect(hookResult.state.accounts[1]?.id).toBe("acc1");
      expect(hookResult.state.activeAccountId).toBe(ALL_ACCOUNTS_ID);
      inst.unmount();
    });

    it("dispatches error when fetchAccounts rejects", async () => {
      const repo = createMockRepo({ fetchAccountsError: new Error("net fail") });
      const inst = await render(<HookWrapper repo={repo} />);
      await flush();
      expect(hookResult.state.errorMessage).toContain("net fail");
      inst.unmount();
    });
  });

  describe("fetch chats when activeAccountId changes", () => {
    it("calls fetchChats after accounts loaded", async () => {
      const repo = createMockRepo({ accounts: [testAccount], chats: [testChat] });
      const inst = await render(<HookWrapper repo={repo} />);
      await flush();
      expect(repo.fetchChats).toHaveBeenCalledWith(ALL_ACCOUNTS_ID);
      expect(hookResult.state.chats).toEqual([testChat]);
      inst.unmount();
    });

    it("fetches chats for All account even with empty real accounts", async () => {
      const repo = createMockRepo({ accounts: [], chats: [] });
      const inst = await render(<HookWrapper repo={repo} />);
      await flush();
      expect(repo.fetchChats).toHaveBeenCalledWith(ALL_ACCOUNTS_ID);
      inst.unmount();
    });

    it("dispatches error when fetchChats rejects", async () => {
      const repo = createMockRepo({
        accounts: [testAccount],
        fetchChatsError: new Error("chat fail"),
      });
      const inst = await render(<HookWrapper repo={repo} />);
      await flush();
      expect(hookResult.state.errorMessage).toContain("chat fail");
      inst.unmount();
    });
  });

  describe("fetch messages when activeChatId changes", () => {
    it("calls fetchMessages after chats loaded", async () => {
      const repo = createMockRepo({
        accounts: [testAccount],
        chats: [testChat],
        messages: [testMessage],
      });
      const inst = await render(<HookWrapper repo={repo} />);
      await flush();
      expect(repo.fetchMessages).toHaveBeenCalledWith("chat1");
      expect(hookResult.state.messages).toEqual([testMessage]);
      inst.unmount();
    });

    it("skips fetchMessages when no active chat", async () => {
      const repo = createMockRepo({ accounts: [testAccount], chats: [] });
      const inst = await render(<HookWrapper repo={repo} />);
      await flush();
      expect(repo.fetchMessages).not.toHaveBeenCalled();
      inst.unmount();
    });

    it("dispatches error when fetchMessages rejects", async () => {
      const repo = createMockRepo({
        accounts: [testAccount],
        chats: [testChat],
        fetchMessagesError: new Error("msg fail"),
      });
      const inst = await render(<HookWrapper repo={repo} />);
      await flush();
      expect(hookResult.state.errorMessage).toContain("msg fail");
      inst.unmount();
    });
  });

  describe("navigation callbacks", () => {
    it("goNextPanel moves to next panel", async () => {
      const repo = createMockRepo();
      const inst = await render(<HookWrapper repo={repo} />);
      await flush();
      hookResult.goNextPanel();
      await flush();
      expect(hookResult.state.focus).toBe(PanelFocus.Chats);
      inst.unmount();
    });

    it("goPrevPanel moves to previous panel", async () => {
      const repo = createMockRepo();
      const inst = await render(<HookWrapper repo={repo} />);
      await flush();
      hookResult.goNextPanel();
      await flush();
      hookResult.goPrevPanel();
      await flush();
      expect(hookResult.state.focus).toBe(PanelFocus.Accounts);
      inst.unmount();
    });

    it("goLeftPanel moves left", async () => {
      const repo = createMockRepo({
        accounts: [testAccount],
        chats: [testChat],
        messages: [testMessage],
      });
      const inst = await render(<HookWrapper repo={repo} />);
      await flush();
      hookResult.dispatch({ type: "set_focus", focus: PanelFocus.Messages });
      await flush();
      hookResult.goLeftPanel();
      await flush();
      expect(hookResult.state.focus).toBe(PanelFocus.Chats);
      inst.unmount();
    });

    it("goRightPanel moves right", async () => {
      const repo = createMockRepo({
        accounts: [testAccount],
        chats: [testChat],
        messages: [testMessage],
      });
      const inst = await render(<HookWrapper repo={repo} />);
      await flush();
      hookResult.dispatch({ type: "set_focus", focus: PanelFocus.Chats });
      await flush();
      hookResult.goRightPanel();
      await flush();
      expect(hookResult.state.focus).toBe(PanelFocus.Messages);
      inst.unmount();
    });
  });

  describe("return value", () => {
    it("returns all expected fields", async () => {
      const repo = createMockRepo();
      const inst = await render(<HookWrapper repo={repo} />);
      await flush();
      expect(hookResult.state).toBeDefined();
      expect(hookResult.dispatch).toBeTypeOf("function");
      expect(hookResult.goNextPanel).toBeTypeOf("function");
      expect(hookResult.goPrevPanel).toBeTypeOf("function");
      expect(hookResult.goLeftPanel).toBeTypeOf("function");
      expect(hookResult.goRightPanel).toBeTypeOf("function");
      expect(hookResult.poller).toBeDefined();
      inst.unmount();
    });
  });
});

/* ------------------------------------------------------------------ */
/*  Tests with fake timers (polling)                                   */
/* ------------------------------------------------------------------ */

describe("useAppState polling", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Let the async effect chain settle under fake timers.
   * Each small advance gives microtasks a chance to flush.
   * @returns A promise that resolves after settling.
   */
  async function settle(): Promise<void> {
    for (let i = 0; i < 20; i++) {
      await vi.advanceTimersByTimeAsync(50);
    }
  }

  it("sets up chat polling when activeAccountId is set", async () => {
    const repo = createMockRepo({
      accounts: [testAccount],
      chats: [testChat],
      messages: [testMessage],
    });
    const inst = await render(<HookWrapper repo={repo} />);
    await settle();

    const before = (repo.fetchChats as ReturnType<typeof vi.fn>).mock.calls.length;
    await vi.advanceTimersByTimeAsync(5_500);
    const after = (repo.fetchChats as ReturnType<typeof vi.fn>).mock.calls.length;

    expect(after).toBeGreaterThan(before);
    inst.unmount();
  });

  it("sets up message polling when activeChatId is set", async () => {
    const repo = createMockRepo({
      accounts: [testAccount],
      chats: [testChat],
      messages: [testMessage],
    });
    const inst = await render(<HookWrapper repo={repo} />);
    await settle();

    const before = (repo.fetchMessages as ReturnType<typeof vi.fn>).mock.calls.length;
    await vi.advanceTimersByTimeAsync(3_500);
    const after = (repo.fetchMessages as ReturnType<typeof vi.fn>).mock.calls.length;

    expect(after).toBeGreaterThan(before);
    inst.unmount();
  });

  it("polls chats for All account even with no real accounts", async () => {
    const repo = createMockRepo({ accounts: [], chats: [] });
    const inst = await render(<HookWrapper repo={repo} />);
    await settle();
    expect(repo.fetchChats).toHaveBeenCalledWith(ALL_ACCOUNTS_ID);
    inst.unmount();
  });

  it("skips message polling when no active chat", async () => {
    const repo = createMockRepo({ accounts: [testAccount], chats: [] });
    const inst = await render(<HookWrapper repo={repo} />);
    await settle();
    expect(repo.fetchMessages).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(repo.fetchMessages).not.toHaveBeenCalled();
    inst.unmount();
  });

  it("handles chat polling fetch error", async () => {
    let callCount = 0;
    const repo = createMockRepo({
      accounts: [testAccount],
      chats: [testChat],
      messages: [testMessage],
    });
    vi.mocked(repo.fetchChats).mockImplementation(() => {
      callCount++;
      if (callCount > 1) {
        return Promise.reject(new Error("poll err"));
      }
      return Promise.resolve([testChat]);
    });
    const inst = await render(<HookWrapper repo={repo} />);
    await settle();
    await vi.advanceTimersByTimeAsync(5_500);
    expect(hookResult.state.errorMessage).toContain("poll err");
    inst.unmount();
  });

  it("handles message polling fetch error", async () => {
    let callCount = 0;
    const repo = createMockRepo({
      accounts: [testAccount],
      chats: [testChat],
      messages: [testMessage],
    });
    vi.mocked(repo.fetchMessages).mockImplementation(() => {
      callCount++;
      if (callCount > 1) {
        return Promise.reject(new Error("msg poll err"));
      }
      return Promise.resolve([testMessage]);
    });
    const inst = await render(<HookWrapper repo={repo} />);
    await settle();
    await vi.advanceTimersByTimeAsync(5_500);
    expect(hookResult.state.errorMessage).toContain("msg poll err");
    inst.unmount();
  });

  it("skips chat polling when poller is disabled (interval 0)", async () => {
    const chat2: Chat = { ...testChat, id: "chat2", accountId: "acc2" };
    const repo = createMockRepo({
      accounts: [testAccount],
      chats: [testChat],
      messages: [testMessage],
    });
    const inst = await render(<HookWrapper repo={repo} />);
    await settle();

    hookResult.poller.setEnabled(false);
    /* Change activeAccountId so the polling effect re-runs. */
    (repo.fetchChats as ReturnType<typeof vi.fn>).mockResolvedValue([chat2]);
    hookResult.dispatch({ type: "account_selected", account: testAccount2 });
    await settle();

    const before = (repo.fetchChats as ReturnType<typeof vi.fn>).mock.calls.length;
    await vi.advanceTimersByTimeAsync(20_000);
    const after = (repo.fetchChats as ReturnType<typeof vi.fn>).mock.calls.length;

    expect(after).toBe(before);
    inst.unmount();
  });

  it("skips message polling when poller is disabled (interval 0)", async () => {
    const chat2: Chat = { ...testChat, id: "chat2", accountId: "acc1" };
    const repo = createMockRepo({
      accounts: [testAccount],
      chats: [testChat],
      messages: [testMessage],
    });
    const inst = await render(<HookWrapper repo={repo} />);
    await settle();

    hookResult.poller.setEnabled(false);
    /* Change activeChatId so the polling effect re-runs. */
    hookResult.dispatch({ type: "chat_selected", chat: chat2 });
    await settle();

    const before = (repo.fetchMessages as ReturnType<typeof vi.fn>).mock.calls.length;
    await vi.advanceTimersByTimeAsync(20_000);
    const after = (repo.fetchMessages as ReturnType<typeof vi.fn>).mock.calls.length;

    expect(after).toBe(before);
    inst.unmount();
  });

  it("cleans up polling on unmount (no extra fetches)", async () => {
    const repo = createMockRepo({
      accounts: [testAccount],
      chats: [testChat],
      messages: [testMessage],
    });
    const inst = await render(<HookWrapper repo={repo} />);
    await settle();

    inst.unmount();

    const chatsAfterUnmount = (repo.fetchChats as ReturnType<typeof vi.fn>).mock.calls.length;
    const msgsAfterUnmount = (repo.fetchMessages as ReturnType<typeof vi.fn>).mock.calls.length;

    await vi.advanceTimersByTimeAsync(20_000);

    expect((repo.fetchChats as ReturnType<typeof vi.fn>).mock.calls.length).toBe(chatsAfterUnmount);
    expect((repo.fetchMessages as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
      msgsAfterUnmount,
    );
  });
});
