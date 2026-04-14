//! Shared status line formatting for TUI and GTK frontends.

use crate::config::format_tokens;

/// Input data for formatting a status line. Both TUI and GTK populate this
/// from their own state structs and then call [`format_status_left`] / [`format_status_right`].
pub struct StatusLineData<'a> {
    pub model: &'a str,
    pub turn_count: u32,
    pub request_count: u32,
    pub total_input_tokens: u64,
    pub total_output_tokens: u64,
    pub turn_input_tokens: u64,
    pub turn_output_tokens: u64,
    pub stream_chunks: u64,
    pub is_streaming: bool,
    /// Spinner/loading prefix shown while streaming (e.g. `"⠋"` for TUI, `"⏳"` for GTK).
    pub spinner: &'a str,
    pub build_id: &'a str,
    pub build_time: &'a str,
}

/// Format the left half of the status line (model, turns, context, totals).
pub fn format_status_left(d: &StatusLineData<'_>) -> String {
    let context = d.total_input_tokens + d.total_output_tokens;
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
            "{} turn tx:{} rx:{} │ streaming({})… │ build #{} {} │ {}",
            d.spinner,
            format_tokens(d.turn_input_tokens),
            format_tokens(d.turn_output_tokens),
            d.stream_chunks,
            d.build_id,
            d.build_time,
            now,
        )
    } else {
        format!(
            "last tx:{} rx:{} │ build #{} {} │ {}",
            format_tokens(d.turn_input_tokens),
            format_tokens(d.turn_output_tokens),
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

    fn make_status_data<'a>(
        is_streaming: bool,
        turn_count: u32,
    ) -> StatusLineData<'a> {
        StatusLineData {
            model: "test-model",
            turn_count,
            request_count: 3,
            total_input_tokens: 1500,
            total_output_tokens: 800,
            turn_input_tokens: 500,
            turn_output_tokens: 200,
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
    fn test_format_status_left_contains_model_and_tokens() {
        let d = make_status_data(false, 2);
        let left = format_status_left(&d);
        assert!(left.contains("test-model"), "{left}");
        assert!(left.contains("turns: 2"), "{left}");
        assert!(left.contains("reqs: 3"), "{left}");
        assert!(left.contains("tx:1.5k"), "{left}");
        assert!(left.contains("rx:800"), "{left}");
        assert!(left.contains("░░░░"), "{left}"); // 2300 total < 10k
    }

    #[test]
    fn test_format_status_right_streaming() {
        let d = make_status_data(true, 1);
        let right = format_status_right(&d);
        assert!(right.contains("⏳"), "{right}");
        assert!(right.contains("streaming(42)"), "{right}");
        assert!(right.contains("build #99"), "{right}");
        assert!(right.contains("tx:500"), "{right}");
    }

    #[test]
    fn test_format_status_right_after_turn() {
        let d = make_status_data(false, 1);
        let right = format_status_right(&d);
        assert!(right.contains("last tx:500"), "{right}");
        assert!(right.contains("build #99"), "{right}");
        assert!(!right.contains("streaming"), "{right}");
    }

    #[test]
    fn test_format_status_right_no_turns() {
        let d = make_status_data(false, 0);
        let right = format_status_right(&d);
        assert!(right.contains("last tx:"), "{right}");
        assert!(right.contains("build #99"), "{right}");
        assert!(!right.contains("streaming"), "{right}");
    }
}
