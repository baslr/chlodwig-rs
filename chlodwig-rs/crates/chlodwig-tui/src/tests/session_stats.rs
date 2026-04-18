//! Tests for `App::session_stats()` / `App::apply_session_stats()` —
//! the cumulative session counters (turns, requests, tx/rx tokens, ctx)
//! that must survive resume so the bottom-left status line keeps counting.
//!
//! See `chlodwig_core::SessionStats`.

use crate::app::App;

#[test]
fn test_session_stats_snapshots_all_counters() {
    let mut app = App::new("test-model".into());
    app.turn_count = 4;
    app.api_request_count = 7;
    app.total_input_tokens = 12_345;
    app.total_output_tokens = 6_789;
    app.turn_usage = chlodwig_core::TurnUsage {
        input_tokens: 1_500,
        output_tokens: 200,
        cache_tokens: 800,
    };

    let stats = app.session_stats();
    assert_eq!(stats.turn_count, 4);
    assert_eq!(stats.request_count, 7);
    assert_eq!(stats.total_input_tokens, 12_345);
    assert_eq!(stats.total_output_tokens, 6_789);
    assert_eq!(stats.last_input_tokens, 1_500);
    assert_eq!(stats.last_output_tokens, 200);
    assert_eq!(stats.last_cache_tokens, 800);
}

#[test]
fn test_apply_session_stats_restores_all_counters() {
    let mut app = App::new("test-model".into());
    let stats = chlodwig_core::SessionStats {
        turn_count: 9,
        request_count: 11,
        total_input_tokens: 1_000_000,
        total_output_tokens: 500_000,
        last_input_tokens: 80_000,
        last_output_tokens: 4_000,
        last_cache_tokens: 60_000,
    };
    app.apply_session_stats(&stats);

    assert_eq!(app.turn_count, 9);
    assert_eq!(app.api_request_count, 11);
    assert_eq!(app.total_input_tokens, 1_000_000);
    assert_eq!(app.total_output_tokens, 500_000);
    assert_eq!(app.turn_usage.input_tokens, 80_000);
    assert_eq!(app.turn_usage.output_tokens, 4_000);
    assert_eq!(app.turn_usage.cache_tokens, 60_000);
}

#[test]
fn test_session_stats_roundtrip_through_app() {
    // session_stats() and apply_session_stats() must be exact inverses.
    let mut a = App::new("m".into());
    a.turn_count = 3;
    a.api_request_count = 5;
    a.total_input_tokens = 100;
    a.total_output_tokens = 50;
    a.turn_usage = chlodwig_core::TurnUsage {
        input_tokens: 30,
        output_tokens: 10,
        cache_tokens: 20,
    };
    let stats = a.session_stats();

    let mut b = App::new("m".into());
    b.apply_session_stats(&stats);

    assert_eq!(b.turn_count, a.turn_count);
    assert_eq!(b.api_request_count, a.api_request_count);
    assert_eq!(b.total_input_tokens, a.total_input_tokens);
    assert_eq!(b.total_output_tokens, a.total_output_tokens);
    assert_eq!(b.turn_usage.input_tokens, a.turn_usage.input_tokens);
    assert_eq!(b.turn_usage.output_tokens, a.turn_usage.output_tokens);
    assert_eq!(b.turn_usage.cache_tokens, a.turn_usage.cache_tokens);
}

#[test]
fn test_apply_session_stats_restores_context_window_size() {
    // The `ctx:` indicator is computed from turn_usage; after restore
    // the context window must equal the persisted last_* values.
    let mut app = App::new("m".into());
    let stats = chlodwig_core::SessionStats {
        turn_count: 0,
        request_count: 0,
        total_input_tokens: 0,
        total_output_tokens: 0,
        last_input_tokens: 1_000,
        last_output_tokens: 500,
        last_cache_tokens: 250,
    };
    app.apply_session_stats(&stats);
    assert_eq!(app.context_window_size(), 1_000 + 500 + 250);
}
