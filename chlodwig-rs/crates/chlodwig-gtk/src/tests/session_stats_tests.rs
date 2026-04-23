//! Tests for `AppState::session_stats()` / `AppState::apply_session_stats()`
//! and the integration via `apply_session_snapshot()`.
//!
//! The cumulative session counters (turns, requests, tx/rx tokens, ctx)
//! must survive resume so the bottom-left status line keeps counting.

use crate::app_state::AppState;

#[test]
fn test_session_stats_snapshots_all_counters() {
    let mut state = AppState::new("m".into());
    state.turn_count = 4;
    state.request_count = 7;
    state.input_tokens = 12_345;
    state.output_tokens = 6_789;
    state.turn_usage = chlodwig_core::TurnUsage {
        input_tokens: 1_500,
        output_tokens: 200,
        cache_tokens: 800,
    };

    let stats = state.session_stats();
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
    let mut state = AppState::new("m".into());
    let stats = chlodwig_core::SessionStats {
        turn_count: 9,
        request_count: 11,
        total_input_tokens: 1_000_000,
        total_output_tokens: 500_000,
        last_input_tokens: 80_000,
        last_output_tokens: 4_000,
        last_cache_tokens: 60_000,
    };
    state.apply_session_stats(&stats);

    assert_eq!(state.turn_count, 9);
    assert_eq!(state.request_count, 11);
    assert_eq!(state.input_tokens, 1_000_000);
    assert_eq!(state.output_tokens, 500_000);
    assert_eq!(state.turn_usage.input_tokens, 80_000);
    assert_eq!(state.turn_usage.output_tokens, 4_000);
    assert_eq!(state.turn_usage.cache_tokens, 60_000);
    assert_eq!(state.context_window_size(), 80_000 + 4_000 + 60_000);
}

#[test]
fn test_apply_session_snapshot_restores_stats() {
    // The full resume path goes through apply_session_snapshot — it must
    // pull stats out of the snapshot and apply them.
    let mut state = AppState::new("m".into());
    let snap = chlodwig_core::SessionSnapshot {
        saved_at: "2026-04-18T12:00:00+02:00".into(),
        started_at: "2026-04-18T11:00:00+02:00".into(),
        model: "m".into(),
        messages: vec![],
        system_prompt: vec![],
        constants: None,
        table_sorts: vec![],
        name: None,
        stats: Some(chlodwig_core::SessionStats {
            turn_count: 2,
            request_count: 3,
            total_input_tokens: 555,
            total_output_tokens: 222,
            last_input_tokens: 100,
            last_output_tokens: 50,
            last_cache_tokens: 25,
        }),
        cwd: None,
    };
    state.apply_session_snapshot(&snap);

    assert_eq!(state.turn_count, 2);
    assert_eq!(state.request_count, 3);
    assert_eq!(state.input_tokens, 555);
    assert_eq!(state.output_tokens, 222);
    assert_eq!(state.turn_usage.input_tokens, 100);
    assert_eq!(state.turn_usage.output_tokens, 50);
    assert_eq!(state.turn_usage.cache_tokens, 25);
}

#[test]
fn test_apply_session_snapshot_without_stats_keeps_defaults() {
    // Old session files (stats = None) must not blow up; counters stay at
    // their initial zeros after restore.
    let mut state = AppState::new("m".into());
    let snap = chlodwig_core::SessionSnapshot {
        saved_at: "2026-04-18T12:00:00+02:00".into(),
        started_at: "2026-04-18T11:00:00+02:00".into(),
        model: "m".into(),
        messages: vec![],
        system_prompt: vec![],
        constants: None,
        table_sorts: vec![],
        name: None,
        stats: None, cwd: None,
    };
    state.apply_session_snapshot(&snap);
    assert_eq!(state.turn_count, 0);
    assert_eq!(state.request_count, 0);
    assert_eq!(state.input_tokens, 0);
    assert_eq!(state.output_tokens, 0);
    assert_eq!(state.context_window_size(), 0);
}

#[test]
fn test_session_stats_roundtrip_through_apply_snapshot() {
    // session_stats() and apply_session_snapshot() must be inverses for
    // the stats portion: take snapshot from a fully-populated state,
    // apply it to a fresh state, end up with identical counters.
    let mut a = AppState::new("m".into());
    a.turn_count = 7;
    a.request_count = 13;
    a.input_tokens = 999;
    a.output_tokens = 333;
    a.turn_usage = chlodwig_core::TurnUsage {
        input_tokens: 50,
        output_tokens: 25,
        cache_tokens: 10,
    };
    let snap = chlodwig_core::SessionSnapshot {
        saved_at: "x".into(),
        started_at: "y".into(),
        model: "m".into(),
        messages: vec![],
        system_prompt: vec![],
        constants: None,
        table_sorts: vec![],
        name: None,
        stats: Some(a.session_stats()),
        cwd: None,
    };

    let mut b = AppState::new("m".into());
    b.apply_session_snapshot(&snap);

    assert_eq!(b.turn_count, a.turn_count);
    assert_eq!(b.request_count, a.request_count);
    assert_eq!(b.input_tokens, a.input_tokens);
    assert_eq!(b.output_tokens, a.output_tokens);
    assert_eq!(b.context_window_size(), a.context_window_size());
}
