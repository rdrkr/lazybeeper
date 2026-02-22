// Copyright (c) 2026 lazybeeper by Ronen Druker.

package panel

import (
	"fmt"
	"strings"

	"charm.land/bubbles/v2/key"
	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"

	"github.com/rdrkr/lazybeeper/domain"
	"github.com/rdrkr/lazybeeper/ui/shared"
)

// AccountsPanel displays the list of messaging accounts.
type AccountsPanel struct {
	BasePanel

	accounts []domain.Account
	cursor   int
	offset   int // scroll offset for long lists
	styles   shared.Styles
	keys     shared.KeyMap
}

// NewAccountsPanel creates a new accounts panel with the given accounts.
func NewAccountsPanel(accounts []domain.Account, styles shared.Styles) *AccountsPanel {
	return &AccountsPanel{
		accounts: accounts,
		styles:   styles,
		keys:     shared.DefaultKeyMap(),
	}
}

// Init returns no initial commands.
func (p *AccountsPanel) Init() tea.Cmd {
	return nil
}

// Update handles key and mouse events for account navigation.
func (p *AccountsPanel) Update(msg tea.Msg) (Panel, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyPressMsg:
		return p.handleKey(msg)
	case tea.MouseClickMsg:
		return p.handleMouseClick(msg)
	default:
		// No-op for unrecognised message types.
	}

	return p, nil
}

// visibleSlots returns how many account entries can be shown at once.
func (p *AccountsPanel) visibleSlots() int {
	innerHeight := p.height - 2 // border

	usable := innerHeight - 1 // title line

	// Reserve a line for the scroll indicator when scrolling is needed.
	if len(p.accounts) > usable {
		usable--
	}

	if usable < 1 {
		return 1
	}

	return usable
}

// clampOffset ensures cursor is visible within the scroll window.
func (p *AccountsPanel) clampOffset() {
	slots := p.visibleSlots()

	if p.cursor < p.offset {
		p.offset = p.cursor
	}

	if p.cursor >= p.offset+slots {
		p.offset = p.cursor - slots + 1
	}

	if p.offset < 0 {
		p.offset = 0
	}
}

// handleKey processes key events for account navigation.
func (p *AccountsPanel) handleKey(msg tea.KeyPressMsg) (Panel, tea.Cmd) {
	if !p.focused {
		return p, nil
	}

	switch {
	case key.Matches(msg, p.keys.Down):
		if p.cursor < len(p.accounts)-1 {
			p.cursor++
			p.clampOffset()
		}
	case key.Matches(msg, p.keys.Up):
		if p.cursor > 0 {
			p.cursor--
			p.clampOffset()
		}
	case key.Matches(msg, p.keys.Enter):
		if len(p.accounts) > 0 {
			return p, func() tea.Msg {
				return shared.AccountSelectedMsg{Account: p.accounts[p.cursor]}
			}
		}
	case key.Matches(msg, p.keys.Top):
		p.cursor = 0
		p.clampOffset()
	case key.Matches(msg, p.keys.Bottom):
		if len(p.accounts) > 0 {
			p.cursor = len(p.accounts) - 1
			p.clampOffset()
		}
	default:
		// No matching keybinding.
	}

	return p, nil
}

// handleMouseClick processes mouse click events for account selection.
func (p *AccountsPanel) handleMouseClick(msg tea.MouseClickMsg) (Panel, tea.Cmd) {
	if msg.Button == tea.MouseLeft {
		// Title is line 0 inside border, accounts start at line 1.
		innerY := msg.Y - 1 // border

		idx := p.offset + innerY - 1 // title + scroll offset
		if idx >= 0 && idx < len(p.accounts) {
			p.cursor = idx

			return p, func() tea.Msg {
				return shared.AccountSelectedMsg{Account: p.accounts[p.cursor]}
			}
		}
	}

	return p, nil
}

// View renders the accounts list with scroll offset.
func (p *AccountsPanel) View() string {
	innerHeight := p.height - 2
	if innerHeight < 0 {
		innerHeight = 0
	}

	title := p.styles.Title.Render("Accounts [1]")

	var lines []string

	lines = append(lines, title)

	slots := p.visibleSlots()

	end := min(p.offset+slots, len(p.accounts))

	visible := p.accounts[p.offset:end]
	for visIdx, acct := range visible {
		idx := p.offset + visIdx

		line := p.renderAccountLine(idx, acct)
		lines = append(lines, line)
	}

	// Scroll indicator.
	if len(p.accounts) > slots {
		indicator := fmt.Sprintf(
			"   [%d-%d of %d]",
			p.offset+1, end, len(p.accounts),
		)
		lines = append(lines, p.styles.Timestamp.Render(indicator))
	}

	content := strings.Join(lines, "\n")

	contentLines := strings.Count(content, "\n") + 1

	var contentSb strings.Builder

	for contentLines < innerHeight {
		_, _ = contentSb.WriteString("\n")

		contentLines++
	}

	content += contentSb.String()

	borderStyle := p.styles.UnfocusedBorder
	if p.focused {
		borderStyle = p.styles.FocusedBorder
	}

	return borderStyle.
		Width(p.width).
		Height(p.height).
		Render(content)
}

// renderAccountLine renders a single account entry line.
func (p *AccountsPanel) renderAccountLine(idx int, acct domain.Account) string {
	dot := p.styles.ConnectedDot.Render("\u25cf")
	if !acct.Connected {
		dot = p.styles.DisconnectedDot.Render("\u25cf")
	}

	name := acct.Name

	switch {
	case idx == p.cursor && p.focused:
		return p.styles.SelectedItem.Render(fmt.Sprintf(" %s %s", dot, name))
	case idx == p.cursor:
		styledName := lipgloss.NewStyle().Bold(true).Foreground(shared.ColorDimWhite).Render(name)

		return fmt.Sprintf(" %s %s", dot, styledName)
	default:
		return fmt.Sprintf(" %s %s", dot, p.styles.NormalItem.Render(name))
	}
}

// SetAccounts updates the list of accounts.
func (p *AccountsPanel) SetAccounts(accounts []domain.Account) {
	p.accounts = accounts
	if p.cursor >= len(accounts) {
		p.cursor = max(0, len(accounts)-1)
	}

	p.clampOffset()
}

// SelectedAccount returns the currently highlighted account, if any.
func (p *AccountsPanel) SelectedAccount() *domain.Account {
	if len(p.accounts) == 0 {
		return nil
	}

	return &p.accounts[p.cursor]
}
