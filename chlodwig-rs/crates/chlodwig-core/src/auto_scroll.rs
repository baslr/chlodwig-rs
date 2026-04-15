//! Auto-scroll state — shared between TUI and GTK UI layers.
//!
//! Encapsulates the logic for automatic scroll-to-bottom behavior:
//! - New content follows the viewport when auto-scroll is active.
//! - When the user manually scrolls up, auto-scroll is disabled.
//! - When the user scrolls back to the bottom, auto-scroll is re-enabled.
//! - Explicit user actions (submit prompt, /compact) force auto-scroll on.

/// Manages auto-scroll state for a scrollable chat view.
///
/// Both the TUI and GTK frontends use this struct to share the same
/// auto-scroll semantics without duplicating the logic.
#[derive(Debug, Clone)]
pub struct AutoScroll {
    /// Whether the view should automatically follow new content.
    active: bool,
}

impl Default for AutoScroll {
    fn default() -> Self {
        Self { active: true }
    }
}

impl AutoScroll {
    /// Create a new `AutoScroll` with auto-scroll enabled.
    pub fn new() -> Self {
        Self::default()
    }

    /// Whether auto-scroll is currently active.
    pub fn is_active(&self) -> bool {
        self.active
    }

    /// Force auto-scroll on and follow new content.
    ///
    /// Use for explicit user actions: submitting a prompt, `/compact`,
    /// `/clear`, `!` shell command.
    pub fn scroll_to_bottom(&mut self) {
        self.active = true;
    }

    /// Scroll to bottom only if auto-scroll is already active.
    ///
    /// Use for incoming content events (TextDelta, ToolResult, etc.)
    /// so that a user who has manually scrolled up is not yanked back.
    /// This is a no-op when the user has scrolled up (`active == false`).
    pub fn scroll_to_bottom_if_auto(&mut self) {
        // If active, it stays active — the UI layer will follow.
        // If the user has scrolled up (active == false), do nothing.
    }

    /// The user has scrolled away from the bottom.
    ///
    /// Disables auto-scroll so incoming content does not yank the viewport.
    pub fn user_scrolled_away(&mut self) {
        self.active = false;
    }

    /// The user has scrolled back to the bottom (or close enough).
    ///
    /// Re-enables auto-scroll so the viewport follows new content again.
    pub fn user_reached_bottom(&mut self) {
        self.active = true;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_auto_scroll_default_is_active() {
        let s = AutoScroll::new();
        assert!(s.is_active());
    }

    #[test]
    fn test_scroll_to_bottom_forces_active() {
        let mut s = AutoScroll::new();
        s.user_scrolled_away();
        assert!(!s.is_active());
        s.scroll_to_bottom();
        assert!(s.is_active());
    }

    #[test]
    fn test_scroll_to_bottom_if_auto_noop_when_inactive() {
        let mut s = AutoScroll::new();
        s.user_scrolled_away();
        assert!(!s.is_active());
        s.scroll_to_bottom_if_auto();
        assert!(!s.is_active(), "should remain inactive when user has scrolled up");
    }

    #[test]
    fn test_scroll_to_bottom_if_auto_stays_active_when_active() {
        let mut s = AutoScroll::new();
        assert!(s.is_active());
        s.scroll_to_bottom_if_auto();
        assert!(s.is_active(), "should stay active");
    }

    #[test]
    fn test_user_scrolled_away_disables() {
        let mut s = AutoScroll::new();
        s.user_scrolled_away();
        assert!(!s.is_active());
    }

    #[test]
    fn test_user_reached_bottom_re_enables() {
        let mut s = AutoScroll::new();
        s.user_scrolled_away();
        assert!(!s.is_active());
        s.user_reached_bottom();
        assert!(s.is_active());
    }

    #[test]
    fn test_round_trip_scroll_away_and_back() {
        let mut s = AutoScroll::new();
        assert!(s.is_active());

        // User scrolls up
        s.user_scrolled_away();
        assert!(!s.is_active());

        // Incoming content should not re-enable
        s.scroll_to_bottom_if_auto();
        assert!(!s.is_active());

        // User scrolls back to bottom
        s.user_reached_bottom();
        assert!(s.is_active());

        // Incoming content follows again
        s.scroll_to_bottom_if_auto();
        assert!(s.is_active());
    }
}
