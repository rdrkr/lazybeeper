// Copyright (c) 2026 lazybeeper by Ronen Druker.

// Package ui implements the terminal user interface for lazybeeper.
package ui

import (
	"charm.land/bubbles/v2/key"
	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"

	"github.com/rdrkr/lazybeeper/data"
	"github.com/rdrkr/lazybeeper/domain"
	"github.com/rdrkr/lazybeeper/ui/panel"
	"github.com/rdrkr/lazybeeper/ui/popup"
	"github.com/rdrkr/lazybeeper/ui/shared"
	"github.com/rdrkr/lazybeeper/ui/viewmodel"
)

// App is the root Bubble Tea model. It is a thin routing shell that
// delegates business logic to the ViewModel and renders panels.
type App struct {
	vm     *viewmodel.AppViewModel
	styles shared.Styles
	keys   shared.KeyMap
	layout Layout

	focus     shared.PanelFocus
	prevFocus shared.PanelFocus

	accounts  *panel.AccountsPanel
	chats     *panel.ChatsPanel
	messages  *panel.MessagesPanel
	input     *panel.InputPanel
	statusBar *panel.StatusBar

	// Popups
	searchPopup  *popup.SearchPopup
	helpPopup    *popup.HelpPopup
	confirmPopup *popup.ConfirmPopup

	ready bool
}

// NewApp creates a new App with the given repository.
func NewApp(repo domain.Repository) *App {
	styles := shared.DefaultStyles()
	appVM := viewmodel.NewAppViewModel(repo)

	accounts := panel.NewAccountsPanel(nil, styles)
	chats := panel.NewChatsPanel(styles)
	messages := panel.NewMessagesPanel(styles)
	input := panel.NewInputPanel(styles)
	statusBar := panel.NewStatusBar(styles)

	app := &App{
		vm:           appVM,
		styles:       styles,
		keys:         shared.DefaultKeyMap(),
		focus:        shared.FocusAccounts,
		accounts:     accounts,
		chats:        chats,
		messages:     messages,
		input:        input,
		statusBar:    statusBar,
		searchPopup:  popup.NewSearchPopup(styles),
		helpPopup:    popup.NewHelpPopup(),
		confirmPopup: popup.NewConfirmPopup(),
	}

	app.updateFocus()

	if appVM.IsMock() {
		statusBar.SetMockMode(true)
		statusBar.SetError("No BEEPER_TOKEN — using mock data")
	}

	return app
}

// Init fetches the initial account list and starts polling timers.
func (a *App) Init() tea.Cmd {
	return tea.Batch(
		a.vm.FetchAccounts(),
		a.vm.Poller().ChatTickCmd(),
		a.vm.Poller().MessageTickCmd(),
	)
}

// activePopup returns the currently active popup, or nil.
func (a *App) activePopup() popup.Popup {
	if a.searchPopup.Active() {
		return a.searchPopup
	}

	if a.helpPopup.Active() {
		return a.helpPopup
	}

	if a.confirmPopup.Active() {
		return a.confirmPopup
	}

	return nil
}

// Update handles all incoming messages and routes them to the appropriate panel.
func (a *App) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		return a.handleWindowSize(msg)
	case tea.KeyPressMsg:
		return a.handleKeyPress(msg)
	case popup.ClosePopupMsg:
		a.setFocus(a.prevFocus)

		return a, nil
	case popup.SearchResultSelectedMsg:
		return a.handleSearchResult(msg)
	case popup.ConfirmResultMsg:
		return a.handleConfirmResultMsg(msg)
	case shared.ShowConfirmMsg:
		a.confirmPopup.Show(msg.Message, msg.Action, msg.Data)
		a.setFocus(shared.FocusPopup)

		return a, nil
	case shared.AccountsLoadedMsg:
		return a.handleAccountsLoaded(msg)
	case shared.AccountSelectedMsg:
		a.vm.ActiveAccountID = msg.Account.ID

		return a, a.vm.FetchChats(msg.Account.ID)
	case shared.ChatsLoadedMsg:
		return a.handleChatsLoaded(msg)
	case shared.ChatSelectedMsg:
		return a.handleChatSelected(msg)
	case shared.MessagesLoadedMsg:
		a.vm.Poller().NotifyMsgChange(len(msg.Messages))
		a.messages.SetMessages(msg.Messages, a.vm.ActiveChatName)

		return a, nil
	case shared.SendMessageMsg:
		return a, a.vm.SendMessage(msg.ChatID, msg.Body)
	case shared.MessageSentMsg:
		return a, a.vm.FetchMessages(msg.ChatID)
	case shared.ArchiveChatMsg:
		return a, a.vm.ArchiveChat(msg.ChatID, msg.Archive)
	case shared.ChatActionDoneMsg:
		return a, a.vm.FetchChats(msg.AccountID)
	case shared.ToggleMuteMsg:
		chats := a.vm.ToggleMute(msg.ChatID)
		a.chats.SetChats(chats)

		return a, nil
	case shared.TogglePinMsg:
		chats := a.vm.TogglePin(msg.ChatID)
		a.chats.SetChats(chats)

		return a, nil
	case shared.ErrorMsg:
		a.statusBar.SetError(msg.Err.Error())

		return a, nil
	case data.TickMsg:
		return a, a.vm.HandleTick(msg)
	case tea.MouseMsg:
		return a, a.handleMouse(msg)
	case panel.FocusInputMsg:
		a.setFocus(shared.FocusInput)

		return a, nil
	default:
		// No-op for unrecognised message types.
	}

	cmd := a.updateFocusedPanel(msg)

	return a, cmd
}

// handleWindowSize processes a terminal resize event.
func (a *App) handleWindowSize(msg tea.WindowSizeMsg) (tea.Model, tea.Cmd) {
	a.layout = CalculateLayout(msg.Width, msg.Height)
	a.resizePanels()
	a.resizePopups()
	a.ready = true

	return a, nil
}

// handleKeyPress routes key events to popups, global handlers, or the input panel.
func (a *App) handleKeyPress(msg tea.KeyPressMsg) (tea.Model, tea.Cmd) {
	// If a popup is active, route all keys to it.
	if p := a.activePopup(); p != nil {
		updated, cmd := p.Update(msg)
		a.setPopup(updated)

		return a, cmd
	}

	if cmd := a.handleGlobalKeys(msg); cmd != nil {
		return a, cmd
	}

	if a.focus == shared.FocusInput {
		return a.handleInputKey(msg)
	}

	cmd := a.updateFocusedPanel(msg)

	return a, cmd
}

// handleInputKey processes keys when the input panel has focus.
func (a *App) handleInputKey(msg tea.KeyPressMsg) (tea.Model, tea.Cmd) {
	if key.Matches(msg, a.keys.Escape) {
		a.setFocus(shared.FocusMessages)

		return a, nil
	}

	p, cmd := a.input.Update(msg)

	updated, ok := p.(*panel.InputPanel)
	if ok {
		a.input = updated
	}

	return a, cmd
}

// handleSearchResult processes a search result selection.
func (a *App) handleSearchResult(msg popup.SearchResultSelectedMsg) (tea.Model, tea.Cmd) {
	a.vm.ActiveChatID = msg.Chat.ID
	a.vm.ActiveChatName = msg.Chat.Name
	a.input.SetChatID(msg.Chat.ID)
	a.statusBar.SetChatName(msg.Chat.Name)
	a.setFocus(shared.FocusMessages)

	return a, a.vm.FetchMessages(msg.Chat.ID)
}

// handleConfirmResultMsg processes a confirm dialog result.
func (a *App) handleConfirmResultMsg(msg popup.ConfirmResultMsg) (tea.Model, tea.Cmd) {
	if !msg.Confirmed {
		a.setFocus(a.prevFocus)

		return a, nil
	}

	return a, a.handleConfirmResult(msg)
}

// handleAccountsLoaded processes newly loaded accounts.
func (a *App) handleAccountsLoaded(msg shared.AccountsLoadedMsg) (tea.Model, tea.Cmd) {
	a.accounts.SetAccounts(msg.Accounts)

	if len(msg.Accounts) > 0 {
		first := msg.Accounts[0]
		a.vm.ActiveAccountID = first.ID

		return a, a.vm.FetchChats(first.ID)
	}

	return a, nil
}

// handleChatsLoaded processes newly loaded chats.
func (a *App) handleChatsLoaded(msg shared.ChatsLoadedMsg) (tea.Model, tea.Cmd) {
	a.vm.Poller().NotifyChatChange(len(msg.Chats))
	a.chats.SetChats(msg.Chats)

	a.vm.AllChats = msg.Chats
	if a.vm.ActiveChatID == "" && len(msg.Chats) > 0 {
		first := msg.Chats[0]
		a.vm.ActiveChatID = first.ID
		a.vm.ActiveChatName = first.Name
		a.input.SetChatID(first.ID)
		a.statusBar.SetChatName(first.Name)

		return a, a.vm.FetchMessages(first.ID)
	}

	return a, nil
}

// handleChatSelected processes a chat selection event.
func (a *App) handleChatSelected(msg shared.ChatSelectedMsg) (tea.Model, tea.Cmd) {
	a.vm.ActiveChatID = msg.Chat.ID
	a.vm.ActiveChatName = msg.Chat.Name
	a.input.SetChatID(msg.Chat.ID)
	a.statusBar.SetChatName(msg.Chat.Name)
	a.setFocus(shared.FocusMessages)

	return a, a.vm.FetchMessages(msg.Chat.ID)
}

// handleGlobalKeys processes keys that work regardless of focus.
func (a *App) handleGlobalKeys(msg tea.KeyPressMsg) tea.Cmd {
	switch {
	case key.Matches(msg, a.keys.Quit):
		return a.handleQuitKey()
	case key.Matches(msg, a.keys.Search):
		return a.handleSearchKey()
	case key.Matches(msg, a.keys.Help):
		return a.handleHelpKey()
	case key.Matches(msg, a.keys.Tab):
		a.setFocus(a.focus.NextPanel())

		return nil
	case key.Matches(msg, a.keys.ShiftTab):
		a.setFocus(a.focus.PrevPanel())

		return nil
	case key.Matches(msg, a.keys.Left):
		if a.focus != shared.FocusInput {
			a.setFocus(a.focus.LeftPanel())
		}

		return nil
	case key.Matches(msg, a.keys.Right):
		if a.focus != shared.FocusInput {
			a.setFocus(a.focus.RightPanel())
		}

		return nil
	case key.Matches(msg, a.keys.Jump1):
		if a.focus != shared.FocusInput {
			a.setFocus(shared.FocusAccounts)
		}

		return nil
	case key.Matches(msg, a.keys.Jump2):
		if a.focus != shared.FocusInput {
			a.setFocus(shared.FocusChats)
		}

		return nil
	case key.Matches(msg, a.keys.Jump3):
		if a.focus != shared.FocusInput {
			a.setFocus(shared.FocusMessages)
		}

		return nil
	case key.Matches(msg, a.keys.Jump4):
		a.setFocus(shared.FocusInput)

		return nil
	default:
		return nil
	}
}

// handleQuitKey processes the quit keybinding.
func (a *App) handleQuitKey() tea.Cmd {
	if a.focus == shared.FocusInput {
		return nil
	}

	return tea.Quit
}

// handleSearchKey processes the search keybinding.
func (a *App) handleSearchKey() tea.Cmd {
	if a.focus != shared.FocusInput {
		a.searchPopup.Show(a.vm.AllChats)
		a.setFocus(shared.FocusPopup)
	}

	return nil
}

// handleHelpKey processes the help keybinding.
func (a *App) handleHelpKey() tea.Cmd {
	if a.focus != shared.FocusInput {
		a.helpPopup.Show()
		a.setFocus(shared.FocusPopup)
	}

	return nil
}

// handleMouse routes mouse events to the correct panel based on coordinates.
func (a *App) handleMouse(msg tea.MouseMsg) tea.Cmd {
	mouse := msg.Mouse()
	mouseX, mouseY := mouse.X, mouse.Y

	inStatusBar := mouseY >= a.layout.TotalHeight-a.layout.StatusBarHeight
	if inStatusBar {
		return nil
	}

	inSidebar := mouseX < a.layout.SidebarWidth
	if inSidebar {
		return a.handleSidebarMouse(msg, mouseY)
	}

	return a.handleMainMouse(msg, mouseY)
}

// handleSidebarMouse routes mouse events within the sidebar area.
func (a *App) handleSidebarMouse(msg tea.MouseMsg, y int) tea.Cmd {
	if y < a.layout.AccountsHeight {
		if a.focus != shared.FocusAccounts {
			a.setFocus(shared.FocusAccounts)
		}

		p, cmd := a.accounts.Update(msg)

		updated, ok := p.(*panel.AccountsPanel)
		if ok {
			a.accounts = updated
		}

		return cmd
	}

	if a.focus != shared.FocusChats {
		a.setFocus(shared.FocusChats)
	}

	adjusted := adjustMouseY(msg, a.layout.AccountsHeight)
	p, cmd := a.chats.Update(adjusted)

	updated, ok := p.(*panel.ChatsPanel)
	if ok {
		a.chats = updated
	}

	return cmd
}

// handleMainMouse routes mouse events within the main content area.
func (a *App) handleMainMouse(msg tea.MouseMsg, y int) tea.Cmd {
	if y < a.layout.MessagesHeight {
		if a.focus != shared.FocusMessages {
			a.setFocus(shared.FocusMessages)
		}

		p, cmd := a.messages.Update(msg)

		updated, ok := p.(*panel.MessagesPanel)
		if ok {
			a.messages = updated
		}

		return cmd
	}

	if a.focus != shared.FocusInput {
		a.setFocus(shared.FocusInput)
	}

	return nil
}

// adjustMouseY returns a copy of the mouse message with the Y coordinate offset by dy.
func adjustMouseY(msg tea.Msg, offsetY int) tea.Msg {
	switch mouseMsg := msg.(type) {
	case tea.MouseClickMsg:
		mouseMsg.Y -= offsetY

		return mouseMsg
	case tea.MouseReleaseMsg:
		mouseMsg.Y -= offsetY

		return mouseMsg
	case tea.MouseWheelMsg:
		mouseMsg.Y -= offsetY

		return mouseMsg
	case tea.MouseMotionMsg:
		mouseMsg.Y -= offsetY

		return mouseMsg
	default:
		return msg
	}
}

// handleConfirmResult processes the result of a confirmation dialog.
func (a *App) handleConfirmResult(msg popup.ConfirmResultMsg) tea.Cmd {
	a.setFocus(a.prevFocus)

	switch msg.Action {
	case shared.ChatActionArchive:
		return func() tea.Msg {
			return shared.ArchiveChatMsg{ChatID: msg.Data, Archive: true}
		}
	case shared.ChatActionUnarchive:
		return func() tea.Msg {
			return shared.ArchiveChatMsg{ChatID: msg.Data, Archive: false}
		}
	default:
		return nil
	}
}

// setPopup updates the stored popup reference after an Update call.
func (a *App) setPopup(p popup.Popup) {
	switch pop := p.(type) {
	case *popup.SearchPopup:
		a.searchPopup = pop
	case *popup.HelpPopup:
		a.helpPopup = pop
	case *popup.ConfirmPopup:
		a.confirmPopup = pop
	default:
		// Unknown popup type; no-op.
	}
}

// updateFocusedPanel routes a message to whichever panel has focus.
func (a *App) updateFocusedPanel(msg tea.Msg) tea.Cmd {
	switch a.focus {
	case shared.FocusAccounts:
		p, cmd := a.accounts.Update(msg)

		updated, ok := p.(*panel.AccountsPanel)
		if ok {
			a.accounts = updated
		}

		return cmd
	case shared.FocusChats:
		p, cmd := a.chats.Update(msg)

		updated, ok := p.(*panel.ChatsPanel)
		if ok {
			a.chats = updated
		}

		return cmd
	case shared.FocusMessages:
		p, cmd := a.messages.Update(msg)

		updated, ok := p.(*panel.MessagesPanel)
		if ok {
			a.messages = updated
		}

		return cmd
	case shared.FocusInput:
		p, cmd := a.input.Update(msg)

		updated, ok := p.(*panel.InputPanel)
		if ok {
			a.input = updated
		}

		return cmd
	case shared.FocusPopup:
		// Popup messages are handled elsewhere; nothing to route.
		return nil
	}

	return nil
}

// setFocus changes the focused panel and updates all panels.
func (a *App) setFocus(f shared.PanelFocus) {
	a.prevFocus = a.focus
	a.focus = f
	a.updateFocus()
}

// updateFocus syncs the focused state across all panels.
func (a *App) updateFocus() {
	a.accounts.SetFocused(a.focus == shared.FocusAccounts)
	a.chats.SetFocused(a.focus == shared.FocusChats)
	a.messages.SetFocused(a.focus == shared.FocusMessages)
	a.input.SetFocused(a.focus == shared.FocusInput)
	a.statusBar.SetFocus(a.focus)
}

// resizePanels distributes the calculated layout to all panels.
func (a *App) resizePanels() {
	a.accounts.SetSize(a.layout.SidebarWidth, a.layout.AccountsHeight)
	a.chats.SetSize(a.layout.SidebarWidth, a.layout.ChatsHeight)
	a.messages.SetSize(a.layout.MainWidth, a.layout.MessagesHeight)
	a.input.SetSize(a.layout.MainWidth, a.layout.InputHeight)
	a.statusBar.SetWidth(a.layout.TotalWidth)
}

// resizePopups updates popup dimensions when the terminal resizes.
func (a *App) resizePopups() {
	w, h := a.layout.TotalWidth, a.layout.TotalHeight
	a.searchPopup.SetSize(w, h)
	a.helpPopup.SetSize(w, h)
	a.confirmPopup.SetSize(w, h)
}

// View renders the complete application UI.
func (a *App) View() tea.View {
	var view tea.View

	view.AltScreen = true
	view.MouseMode = tea.MouseModeCellMotion

	if !a.ready {
		view.SetContent("Loading lazybeeper...")

		return view
	}

	sidebar := lipgloss.JoinVertical(lipgloss.Left,
		a.accounts.View(),
		a.chats.View(),
	)

	main := lipgloss.JoinVertical(lipgloss.Left,
		a.messages.View(),
		a.input.View(),
	)

	body := lipgloss.JoinHorizontal(lipgloss.Top,
		sidebar,
		main,
	)

	base := lipgloss.JoinVertical(lipgloss.Left,
		body,
		a.statusBar.View(),
	)

	// Overlay active popup on top, replacing the base view.
	if pop := a.activePopup(); pop != nil {
		view.SetContent(pop.View())

		return view
	}

	view.SetContent(base)

	return view
}
