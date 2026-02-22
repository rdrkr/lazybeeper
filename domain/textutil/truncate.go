// Copyright (c) 2026 lazybeeper by Ronen Druker.

// Package textutil provides string manipulation and formatting utilities.
package textutil

import (
	"fmt"
	"strings"
	"time"
)

// Truncate shortens str to maxLen characters, appending "…" if truncated.
func Truncate(str string, maxLen int) string {
	if maxLen <= 0 {
		return ""
	}

	runes := []rune(str)
	if len(runes) <= maxLen {
		return str
	}

	if maxLen <= 1 {
		return "…"
	}

	return string(runes[:maxLen-1]) + "…"
}

// RelativeTime returns a human-readable relative time string.
func RelativeTime(when time.Time) string {
	elapsed := time.Since(when)

	switch {
	case elapsed < time.Minute:
		return "now"
	case elapsed < time.Hour:
		return formatMinutes(elapsed)
	case elapsed < 24*time.Hour:
		return formatHours(elapsed)
	default:
		return formatDays(when, elapsed)
	}
}

// formatMinutes returns a relative time string for durations under one hour.
func formatMinutes(dur time.Duration) string {
	mins := int(dur.Minutes())
	if mins == 1 {
		return "1m ago"
	}

	return fmt.Sprintf("%dm ago", mins)
}

// formatHours returns a relative time string for durations under one day.
func formatHours(dur time.Duration) string {
	hrs := int(dur.Hours())
	if hrs == 1 {
		return "1h ago"
	}

	return fmt.Sprintf("%dh ago", hrs)
}

// formatDays returns a relative time string for durations of one day or more.
func formatDays(when time.Time, elapsed time.Duration) string {
	days := int(elapsed.Hours() / 24)
	if days == 1 {
		return "yesterday"
	}

	if days < 7 {
		return fmt.Sprintf("%dd ago", days)
	}

	return when.Format("Jan 2")
}

// FormatTime returns a short HH:MM formatted time string.
func FormatTime(when time.Time) string {
	return when.Format("15:04")
}

// DateLabel returns a human-readable date label for grouping messages.
func DateLabel(when time.Time) string {
	now := time.Now()
	nowYear, nowMonth, nowDay := now.Date()
	year, month, day := when.Date()

	if nowYear == year && nowMonth == month && nowDay == day {
		return "Today"
	}

	yesterday := now.AddDate(0, 0, -1)

	yestYear, yestMonth, yestDay := yesterday.Date()
	if year == yestYear && month == yestMonth && day == yestDay {
		return "Yesterday"
	}

	if nowYear == year {
		return when.Format("Mon, Jan 2")
	}

	return when.Format("Jan 2, 2006")
}

// SameDay returns true if two timestamps fall on the same calendar day.
func SameDay(first, second time.Time) bool {
	year1, month1, day1 := first.Date()
	year2, month2, day2 := second.Date()

	return year1 == year2 && month1 == month2 && day1 == day2
}

// WrapText wraps a string to fit within maxWidth characters,
// breaking at word boundaries where possible.
func WrapText(text string, maxWidth int) string {
	if maxWidth <= 0 {
		return text
	}

	words := strings.Fields(text)
	if len(words) == 0 {
		return ""
	}

	var lines []string

	current := words[0]

	for _, word := range words[1:] {
		if len(current)+1+len(word) <= maxWidth {
			current += " " + word
		} else {
			lines = append(lines, current)
			current = word
		}
	}

	lines = append(lines, current)

	return strings.Join(lines, "\n")
}
