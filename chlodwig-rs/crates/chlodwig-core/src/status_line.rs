//! Shared status line formatting for TUI and GTK frontends.

use crate::config::format_tokens;

/// Per-turn token tracking. Shared between TUI and GTK.
///
/// Values are set from `ConversationEvent::Usage` events. Only non-zero
/// values overwrite — this prevents `MessageStart` (all zeros) from
/// clobbering the real values that arrive later in `MessageDelta`.
#[derive(Debug, Clone, Default)]
pub struct TurnUsage {
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub cache_tokens: u64,
}

impl TurnUsage {
    /// Total context window size (input + output + cache tokens).
    pub fn context_window_size(&self) -> u64 {
        self.input_tokens + self.output_tokens + self.cache_tokens
    }

    /// Reset all counters (called at the start of each turn).
    pub fn reset(&mut self) {
        self.input_tokens = 0;
        self.output_tokens = 0;
        self.cache_tokens = 0;
    }

    /// Update from a Usage event. Only non-zero values overwrite.
    pub fn update(
        &mut self,
        input_tokens: u32,
        output_tokens: u32,
        cache_creation_input_tokens: u32,
        cache_read_input_tokens: u32,
    ) {
        if input_tokens > 0 {
            self.input_tokens = input_tokens as u64;
        }
        if output_tokens > 0 {
            self.output_tokens = output_tokens as u64;
        }
        let cache = cache_creation_input_tokens as u64 + cache_read_input_tokens as u64;
        if cache > 0 {
            self.cache_tokens = cache;
        }
    }
}

/// Input data for formatting a status line. Both TUI and GTK populate this
/// from their own state structs and then call [`format_status_left`] / [`format_status_right`].
pub struct StatusLineData<'a> {
    pub model: &'a str,
    pub turn_count: u32,
    pub request_count: u32,
    pub total_input_tokens: u64,
    pub total_output_tokens: u64,
    pub turn_usage: &'a TurnUsage,
    pub stream_chunks: u64,
    pub is_streaming: bool,
    /// Spinner/loading prefix shown while streaming (e.g. `"⠋"` for TUI, `"⏳"` for GTK).
    pub spinner: &'a str,
    pub build_id: &'a str,
    pub build_time: &'a str,
}

/// Format the left half of the status line (model, turns, context, totals).
///
/// `ctx:` shows the context window size from the **last** API response
/// via `TurnUsage::context_window_size()` (input + output + cache tokens),
/// not the cumulative sum of all turns.
pub fn format_status_left(d: &StatusLineData<'_>) -> String {
    let context = d.turn_usage.context_window_size();
    let cost_ind = cost_indicator(context);
    format!(
        "{} │ turns: {} │ reqs: {} │ ctx: {} [{}] │ tx:{} rx:{}",
        d.model,
        d.turn_count,
        d.request_count,
        format_tokens(context),
        cost_ind,
        format_tokens(d.total_input_tokens),
        format_tokens(d.total_output_tokens),
    )
}

/// Format the right half of the status line (turn tokens, streaming, build info, clock).
pub fn format_status_right(d: &StatusLineData<'_>) -> String {
    let now = chrono::Local::now().format("%H:%M").to_string();
    if d.is_streaming {
        format!(
            "{} turn ct:{} tx:{} rx:{} │ streaming({})… │ build #{} {} │ {}",
            d.spinner,
            format_tokens(d.turn_usage.cache_tokens),
            format_tokens(d.turn_usage.input_tokens),
            format_tokens(d.turn_usage.output_tokens),
            d.stream_chunks,
            d.build_id,
            d.build_time,
            now,
        )
    } else {
        format!(
            "last ct:{} tx:{} rx:{} │ build #{} {} │ {}",
            format_tokens(d.turn_usage.cache_tokens),
            format_tokens(d.turn_usage.input_tokens),
            format_tokens(d.turn_usage.output_tokens),
            d.build_id,
            d.build_time,
            now,
        )
    }
}

/// Context window cost indicator bar.
pub fn cost_indicator(context: u64) -> &'static str {
    if context > 180_000 {
        "▓▓▓▓"
    } else if context > 120_000 {
        "▓▓▓░"
    } else if context > 60_000 {
        "▓▓░░"
    } else if context > 10_000 {
        "▓░░░"
    } else {
        "░░░░"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_turn_usage(input: u64, output: u64, cache: u64) -> TurnUsage {
        TurnUsage { input_tokens: input, output_tokens: output, cache_tokens: cache }
    }

    fn make_status_data(
        is_streaming: bool,
        turn_count: u32,
    ) -> StatusLineData<'static> {
        // We leak a Box to get a &'static TurnUsage for test convenience.
        // This is fine in tests — a few bytes per test.
        let tu: &'static TurnUsage =
            Box::leak(Box::new(make_turn_usage(500, 200, 0)));
        StatusLineData {
            model: "test-model",
            turn_count,
            request_count: 3,
            total_input_tokens: 1500,
            total_output_tokens: 800,
            turn_usage: tu,
            stream_chunks: 42,
            is_streaming,
            spinner: "⏳",
            build_id: "99",
            build_time: "2026-04-13 14:00",
        }
    }

    #[test]
    fn test_cost_indicator_thresholds() {
        assert_eq!(cost_indicator(0), "░░░░");
        assert_eq!(cost_indicator(10_000), "░░░░");
        assert_eq!(cost_indicator(10_001), "▓░░░");
        assert_eq!(cost_indicator(60_001), "▓▓░░");
        assert_eq!(cost_indicator(120_001), "▓▓▓░");
        assert_eq!(cost_indicator(180_001), "▓▓▓▓");
    }

    #[test]
    fn test_format_status_left_contains_model_and_context() {
        let d = make_status_data(false, 2);
        let left = format_status_left(&d);
        assert!(left.contains("test-model"), "{left}");
        assert!(left.contains("turns: 2"), "{left}");
        assert!(left.contains("reqs: 3"), "{left}");
        // ctx: should show turn context (500 + 200 + 0 = 700), not cumulative (1500 + 800 = 2300)
        assert!(left.contains("ctx: 700"), "{left}");
        assert!(left.contains("░░░░"), "{left}"); // 700 total < 10k
        // tx:/rx: show cumulative totals
        assert!(left.contains("tx:1.5k"), "{left}");
        assert!(left.contains("rx:800"), "{left}");
    }

    #[test]
    fn test_format_status_right_streaming() {
        let d = make_status_data(true, 1);
        let right = format_status_right(&d);
        assert!(right.contains("⏳"), "{right}");
        assert!(right.contains("streaming(42)"), "{right}");
        assert!(right.contains("build #99"), "{right}");
        assert!(right.contains("ct:0"), "{right}");
        assert!(right.contains("tx:500"), "{right}");
    }

    #[test]
    fn test_format_status_right_after_turn() {
        let d = make_status_data(false, 1);
        let right = format_status_right(&d);
        assert!(right.contains("last ct:0 tx:500"), "{right}");
        assert!(right.contains("build #99"), "{right}");
        assert!(!right.contains("streaming"), "{right}");
    }

    #[test]
    fn test_format_status_right_no_turns() {
        let d = make_status_data(false, 0);
        let right = format_status_right(&d);
        assert!(right.contains("last ct:0 tx:"), "{right}");
        assert!(right.contains("build #99"), "{right}");
        assert!(!right.contains("streaming"), "{right}");
    }

    #[test]
    fn test_format_status_right_shows_cache_tokens() {
        let tu = make_turn_usage(4783, 1028, 22350);
        let d = StatusLineData {
            model: "test-model",
            turn_count: 1,
            request_count: 1,
            total_input_tokens: 5000,
            total_output_tokens: 1000,
            turn_usage: &tu,
            stream_chunks: 0,
            is_streaming: false,
            spinner: "⏳",
            build_id: "99",
            build_time: "2026-04-13 14:00",
        };
        let right = format_status_right(&d);
        assert!(right.contains("ct:22.4k"), "should contain ct:22.4k, got: {right}");
        assert!(right.contains("tx:4.8k"), "should contain tx:4.8k, got: {right}");
        assert!(right.contains("rx:1.0k"), "should contain rx:1.0k, got: {right}");
    }

    #[test]
    fn test_format_status_right_streaming_shows_cache_tokens() {
        let tu = make_turn_usage(4783, 1028, 22350);
        let d = StatusLineData {
            model: "test-model",
            turn_count: 1,
            request_count: 1,
            total_input_tokens: 5000,
            total_output_tokens: 1000,
            turn_usage: &tu,
            stream_chunks: 10,
            is_streaming: true,
            spinner: "⏳",
            build_id: "99",
            build_time: "2026-04-13 14:00",
        };
        let right = format_status_right(&d);
        assert!(right.contains("ct:22.4k"), "should contain ct:22.4k, got: {right}");
        assert!(right.contains("tx:4.8k"), "should contain tx:4.8k, got: {right}");
        assert!(right.contains("rx:1.0k"), "should contain rx:1.0k, got: {right}");
    }

    #[test]
    fn test_ctx_shows_last_turn_context_not_cumulative_total() {
        // ctx: should show the context window size from the LAST API response
        // (turn_input_tokens + turn_output_tokens + turn_cache_tokens),
        // NOT the cumulative sum of all turns.
        let tu = make_turn_usage(8_000, 2_000, 6_000);
        let d = StatusLineData {
            model: "test-model",
            turn_count: 5,
            request_count: 10,
            total_input_tokens: 50_000,
            total_output_tokens: 20_000,
            turn_usage: &tu,
            stream_chunks: 0,
            is_streaming: false,
            spinner: "⏳",
            build_id: "99",
            build_time: "2026-04-13 14:00",
        };
        let left = format_status_left(&d);
        // ctx: should be 16k (8000 + 2000 + 6000)
        assert!(left.contains("ctx: 16.0k"), "ctx should show turn context (16.0k), got: {left}");
    }

    #[test]
    fn test_ctx_cost_indicator_uses_turn_context() {
        // The cost indicator bar should reflect the turn context, not cumulative.
        let tu = make_turn_usage(5_000, 1_000, 0);
        let d = StatusLineData {
            model: "m",
            turn_count: 1,
            request_count: 1,
            total_input_tokens: 200_000,
            total_output_tokens: 50_000,
            turn_usage: &tu,
            stream_chunks: 0,
            is_streaming: false,
            spinner: "⏳",
            build_id: "1",
            build_time: "now",
        };
        let left = format_status_left(&d);
        // 6000 < 10000 → should be "░░░░"
        assert!(left.contains("░░░░"), "cost indicator should reflect turn context (6k), got: {left}");
    }

    #[test]
    fn test_format_status_right_zero_cache_tokens() {
        let tu = make_turn_usage(500, 200, 0);
        let d = StatusLineData {
            model: "test-model",
            turn_count: 1,
            request_count: 1,
            total_input_tokens: 500,
            total_output_tokens: 200,
            turn_usage: &tu,
            stream_chunks: 0,
            is_streaming: false,
            spinner: "⏳",
            build_id: "99",
            build_time: "2026-04-13 14:00",
        };
        let right = format_status_right(&d);
        assert!(right.contains("ct:0"), "should contain ct:0, got: {right}");
        assert!(right.contains("tx:500"), "should contain tx:500, got: {right}");
        assert!(right.contains("rx:200"), "should contain rx:200, got: {right}");
    }
}
