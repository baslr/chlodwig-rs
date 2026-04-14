use crossterm::{
    event::{self, Event, KeyCode, KeyEventKind, KeyModifiers, PushKeyboardEnhancementFlags, PopKeyboardEnhancementFlags, KeyboardEnhancementFlags},
    terminal::{disable_raw_mode, enable_raw_mode},
};

fn main() {
    enable_raw_mode().unwrap();

    // Try Kitty protocol
    let kitty = crossterm::execute!(
        std::io::stdout(),
        PushKeyboardEnhancementFlags(
            KeyboardEnhancementFlags::REPORT_EVENT_TYPES
                | KeyboardEnhancementFlags::DISAMBIGUATE_ESCAPE_CODES
        )
    ).is_ok();
    println!("Kitty keyboard protocol: {}\r", if kitty { "ENABLED" } else { "not supported" });
    println!("Press keys to see what crossterm receives. Ctrl+C to quit.\r");
    println!("Try: Enter, Shift+Enter, Alt+Enter, Fn+Enter, Option+Enter\r");
    println!("---\r");
    loop {
        if let Ok(event) = event::read() {
            match &event {
                Event::Key(key) if key.kind == KeyEventKind::Press => {
                    println!(
                        "PRESS:   code={:?}  modifiers={:?}\r",
                        key.code, key.modifiers
                    );
                    if key.code == KeyCode::Char('c')
                        && key.modifiers.contains(KeyModifiers::CONTROL)
                    {
                        break;
                    }
                }
                Event::Key(key) if key.kind == KeyEventKind::Release => {
                    println!(
                        "RELEASE: code={:?}  modifiers={:?}\r",
                        key.code, key.modifiers
                    );
                }
                Event::Key(key) => {
                    println!(
                        "OTHER:   code={:?}  modifiers={:?}  kind={:?}\r",
                        key.code, key.modifiers, key.kind
                    );
                }
                _ => {}
            }
        }
    }
    if kitty {
        let _ = crossterm::execute!(std::io::stdout(), PopKeyboardEnhancementFlags);
    }
    disable_raw_mode().unwrap();
    println!("\nDone.");
}
