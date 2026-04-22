//! Chlodwig Core — shared types, traits, and the conversation loop.

pub mod auto_scroll;
pub mod input_state;
pub mod command;
pub mod config;
pub mod conversation;
pub mod highlight;
pub mod log_paths;
pub mod markdown;
pub mod messages;
pub mod permissions;
pub mod reducers;
pub mod restore;
pub mod session;
pub mod status_line;
pub mod subagent;
pub mod system_prompt;
pub mod tools;
pub mod window_state;

pub use auto_scroll::*;
pub use input_state::InputState;
pub use command::{Command, COMMANDS_HELP, execute_shell_pty, help_markdown_commands, help_markdown_keys_tui, help_markdown_keys_gtk};
pub use config::*;
pub use conversation::*;
pub use log_paths::*;
pub use markdown::{
    FontMetrics, MdColor, MdStyle, StyledLine, StyledSpan, TableData, WidthMode, extract_tables,
    render_markdown, render_markdown_with_options, render_markdown_with_table_overrides,
    render_markdown_with_width,
};
pub use messages::*;
pub use permissions::*;
pub use restore::*;
pub use session::*;
pub use status_line::*;
pub use subagent::*;
pub use system_prompt::*;
pub use tools::*;
pub use window_state::*;

/// Format `cat -n`-style output into `(gutter, code)` pairs with aligned line numbers.
///
/// Input lines are expected in the format `  <number>\t<code>`.
/// The gutter is right-aligned to the width of the largest line number,
/// formatted as ` <number> │ `.
///
/// Lines without a tab separator are returned with an empty gutter.
///
/// Returns `Vec<(String, String)>` — `(gutter, code_text)` per line.
pub fn format_numbered_lines(input: &str) -> Vec<(String, String)> {
    if input.is_empty() {
        return Vec::new();
    }

    // First pass: parse all lines and find the maximum line number width.
    let mut parsed: Vec<(Option<&str>, &str)> = Vec::new();
    let mut max_num_width: usize = 1;

    for line in input.lines() {
        if let Some(tab_pos) = line.find('\t') {
            let num_str = line[..tab_pos].trim();
            let code = &line[tab_pos + 1..];
            max_num_width = max_num_width.max(num_str.len());
            parsed.push((Some(num_str), code));
        } else {
            parsed.push((None, line));
        }
    }

    // Second pass: build formatted output with right-aligned numbers.
    parsed
        .into_iter()
        .map(|(num_opt, code)| match num_opt {
            Some(num) => {
                let gutter = format!(" {:>width$} │ ", num, width = max_num_width);
                (gutter, code.to_string())
            }
            None => (String::new(), code.to_string()),
        })
        .collect()
}

#[cfg(test)]
mod format_tests {
    use super::format_numbered_lines;

    #[test]
    fn test_line_numbers_single_digit_padded() {
        let input = "     1\tpub fn main() {\n     2\t    println!(\"hi\");\n     3\t}\n";
        let lines = format_numbered_lines(input);
        assert_eq!(lines.len(), 3);
        assert_eq!(lines[0].0, " 1 │ ");
        assert_eq!(lines[0].1, "pub fn main() {");
        assert_eq!(lines[1].0, " 2 │ ");
        assert_eq!(lines[1].1, "    println!(\"hi\");");
        assert_eq!(lines[2].0, " 3 │ ");
        assert_eq!(lines[2].1, "}");
    }

    #[test]
    fn test_line_numbers_double_digit_aligned() {
        let mut input = String::new();
        for i in 1..=12 {
            input.push_str(&format!("     {i}\tline {i}\n"));
        }
        let lines = format_numbered_lines(&input);
        assert_eq!(lines.len(), 12);
        assert_eq!(lines[0].0, "  1 │ ");
        assert_eq!(lines[8].0, "  9 │ ");
        assert_eq!(lines[9].0, " 10 │ ");
        assert_eq!(lines[11].0, " 12 │ ");
    }

    #[test]
    fn test_line_numbers_triple_digit_aligned() {
        let mut input = String::new();
        for i in 98..=102 {
            input.push_str(&format!("     {i}\tline {i}\n"));
        }
        let lines = format_numbered_lines(&input);
        assert_eq!(lines.len(), 5);
        assert_eq!(lines[0].0, "  98 │ ");
        assert_eq!(lines[1].0, "  99 │ ");
        assert_eq!(lines[2].0, " 100 │ ");
        assert_eq!(lines[4].0, " 102 │ ");
    }

    #[test]
    fn test_line_numbers_without_tab_passthrough() {
        let input = "no tab here\n";
        let lines = format_numbered_lines(input);
        assert_eq!(lines.len(), 1);
        assert_eq!(lines[0].0, "");
        assert_eq!(lines[0].1, "no tab here");
    }

    #[test]
    fn test_line_numbers_empty_input() {
        let lines = format_numbered_lines("");
        assert!(lines.is_empty());
    }

    #[test]
    fn test_line_numbers_empty_code_part() {
        let input = "     1\tcode\n     2\t\n     3\tmore\n";
        let lines = format_numbered_lines(input);
        assert_eq!(lines.len(), 3);
        assert_eq!(lines[1].0, " 2 │ ");
        assert_eq!(lines[1].1, "");
    }

    #[test]
    fn test_line_numbers_utf8_code() {
        let input = "     1\tfn grüße() { // 🎉\n     2\t    let ä = 42;\n";
        let lines = format_numbered_lines(input);
        assert_eq!(lines.len(), 2);
        assert_eq!(lines[0].1, "fn grüße() { // 🎉");
        assert_eq!(lines[1].1, "    let ä = 42;");
    }
}
