/// Tests for spawn robustness: error logging, TurnComplete after Error,
/// JoinHandle monitoring, and Arc<dyn ApiClient> safety.

#[allow(unused_imports)]
use super::*;

/// Verify that run_tui_with_permissions accepts Arc<dyn ApiClient> (not Box).
/// This is a compile-time check — if the signature uses Box, this won't compile.
#[test]
fn test_api_client_is_arc_not_box() {
    // The function signature should be:
    //   pub async fn run_tui_with_permissions(
    //       initial_state: ConversationState,
    //       api_client: Arc<dyn ApiClient>,
    //       bypass_permissions: bool,
    //       initial_constants: Option<chlodwig_core::ConstantsSnapshot>,
    //   ) -> anyhow::Result<()>
    //
    // We can't call it without a terminal, but we can verify the type compiles.
    fn _assert_arc_signature() {
        use std::sync::Arc;
        use chlodwig_core::{ApiClient, ConversationState, ConstantsSnapshot};

        fn _check(
            _f: impl FnOnce(ConversationState, Arc<dyn ApiClient>, bool, Option<ConstantsSnapshot>)
        ) {}
        // This compile-time check validates the signature accepts Arc.
        // We don't actually call it — we just need it to compile.
        _check(|state, client, bypass, constants| {
            let _ = crate::run_tui_with_permissions(state, client, bypass, constants);
        });
    }
}

/// Verify that run_tui also accepts Arc<dyn ApiClient>.
#[test]
fn test_run_tui_is_arc_not_box() {
    fn _assert_arc_signature() {
        use std::sync::Arc;
        use chlodwig_core::{ApiClient, ConversationState};

        fn _check(
            _f: impl FnOnce(ConversationState, Arc<dyn ApiClient>)
        ) {}
        _check(|state, client| {
            let _ = crate::run_tui(state, client);
        });
    }
}
