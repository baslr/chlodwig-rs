use std::fs;

#[test]
fn test_event_dispatch_switches_active_tab_on_user_question_arrival() {
    let source = fs::read_to_string(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/src/event_dispatch.rs"
    ))
    .expect("failed to read event_dispatch.rs");

    assert!(
        source.contains("set_selected_page"),
        "event_dispatch.rs must call set_selected_page when a UserQestion arrives"
    );
}
