//! Syntax highlighting — shared between TUI and GTK backends.
//!
//! Uses `syntect` for tokenization and produces UI-independent output:
//! `Vec<HighlightSpan>` per line, where each span has text, optional
//! RGB foreground color, and a bold flag.
//!
//! Both backends convert these spans into their native types:
//! - TUI: `ratatui::style::Style`
//! - GTK: `GtkTextTag` with foreground color

use std::sync::OnceLock;
use syntect::easy::HighlightLines;
use syntect::highlighting::{FontStyle, ThemeSet};
use syntect::parsing::SyntaxSet;

// ── Global resources (loaded once) ───────────────────────────────────

fn syntax_set() -> &'static SyntaxSet {
    static SS: OnceLock<SyntaxSet> = OnceLock::new();
    SS.get_or_init(SyntaxSet::load_defaults_newlines)
}

fn theme() -> &'static syntect::highlighting::Theme {
    static T: OnceLock<syntect::highlighting::Theme> = OnceLock::new();
    T.get_or_init(|| {
        let ts = ThemeSet::load_defaults();
        ts.themes["base16-eighties.dark"].clone()
    })
}

// ── Public types ────────────────────────────────────────────────────

/// A single highlighted text span with optional styling.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HighlightSpan {
    pub text: String,
    /// Foreground color as RGB, or None for default.
    pub fg: Option<(u8, u8, u8)>,
    pub bold: bool,
    pub italic: bool,
}

// ── Language resolution ─────────────────────────────────────────────

/// Map common language aliases to tokens that syntect's default bundle knows.
pub fn resolve_lang_alias(lang: &str) -> &str {
    match lang {
        "typescript" | "ts" | "tsx" | "jsx" => "javascript",
        "shell" | "zsh" | "fish" => "bash",
        "yml" => "yaml",
        "dockerfile" => "bash",
        "toml" => "yaml",
        "jsonc" => "json",
        "cxx" | "cpp" | "cc" | "c++" | "hpp" => "c++",
        "cs" | "csharp" => "c#",
        "kt" | "kotlin" => "java",
        "swift" => "objective-c",
        other => other,
    }
}

/// Derive a syntax-highlighting language token from a file path's extension.
///
/// Returns an empty string if the extension is not recognized.
pub fn lang_from_path(path: &str) -> &'static str {
    let ext = match std::path::Path::new(path).extension().and_then(|e| e.to_str()) {
        Some(e) => e,
        None => return "",
    };

    let ss = syntax_set();

    if let Some(syn) = ss.find_syntax_by_extension(ext) {
        return match syn.name.as_str() {
            "Rust" => "rust",
            "Python" => "python",
            "JavaScript" | "JavaScript (Babel)" => "javascript",
            "JSON" => "json",
            "YAML" => "yaml",
            "HTML" => "html",
            "CSS" => "css",
            "C" => "c",
            "C++" => "c++",
            "C#" => "c#",
            "Java" => "java",
            "Go" => "go",
            "Ruby" => "ruby",
            "Shell-Unix-Generic" | "Bourne Again Shell (bash)" => "bash",
            "SQL" => "sql",
            "Markdown" => "markdown",
            "XML" => "xml",
            "Perl" => "perl",
            "PHP" => "php",
            "Lua" => "lua",
            "Scala" => "scala",
            "Haskell" => "haskell",
            "Erlang" => "erlang",
            "Clojure" => "clojure",
            "R" => "r",
            "Makefile" => "makefile",
            "Objective-C" => "objective-c",
            _ => "plain",
        };
    }

    match ext {
        "ts" | "tsx" | "jsx" => "javascript",
        "toml" => "yaml",
        "dockerfile" | "zsh" | "fish" => "bash",
        "kt" | "kotlin" => "java",
        "swift" => "objective-c",
        "jsonc" => "json",
        "cxx" | "cc" | "hpp" => "c++",
        "cs" | "csharp" => "c#",
        _ => "",
    }
}

// ── Highlighting ────────────────────────────────────────────────────

/// Highlight a single line of code, returning a list of styled spans.
///
/// `lang` should be a syntect-compatible language token (e.g. "rust",
/// "python", "bash"). Use `resolve_lang_alias()` first if needed.
///
/// Returns `None` if the language is not recognized (caller should
/// render as plain text).
pub fn highlight_line(lang: &str, line: &str) -> Option<Vec<HighlightSpan>> {
    let ss = syntax_set();
    let th = theme();
    let resolved = if lang.is_empty() { return None } else { resolve_lang_alias(lang) };
    let syntax = ss.find_syntax_by_token(resolved)?;
    let mut h = HighlightLines::new(syntax, th);

    match h.highlight_line(line, ss) {
        Ok(ranges) => {
            let spans = ranges
                .iter()
                .map(|(style, text)| {
                    let fg = Some((style.foreground.r, style.foreground.g, style.foreground.b));
                    let bold = style.font_style.contains(FontStyle::BOLD);
                    let italic = style.font_style.contains(FontStyle::ITALIC);
                    HighlightSpan {
                        text: text.to_string(),
                        fg,
                        bold,
                        italic,
                    }
                })
                .collect();
            Some(spans)
        }
        Err(_) => None,
    }
}

/// Highlight a multi-line code block, returning styled spans per line.
///
/// Each inner `Vec<HighlightSpan>` represents one line. If the language
/// is not recognized, returns `None`.
pub fn highlight_code(lang: &str, code: &str) -> Option<Vec<Vec<HighlightSpan>>> {
    let ss = syntax_set();
    let th = theme();
    let resolved = if lang.is_empty() { return None } else { resolve_lang_alias(lang) };
    let syntax = ss.find_syntax_by_token(resolved)?;
    let mut h = HighlightLines::new(syntax, th);

    let mut result = Vec::new();
    for line in code.lines() {
        match h.highlight_line(line, ss) {
            Ok(ranges) => {
                let spans: Vec<HighlightSpan> = ranges
                    .iter()
                    .map(|(style, text)| {
                        let fg = Some((style.foreground.r, style.foreground.g, style.foreground.b));
                        let bold = style.font_style.contains(FontStyle::BOLD);
                        let italic = style.font_style.contains(FontStyle::ITALIC);
                        HighlightSpan {
                            text: text.to_string(),
                            fg,
                            bold,
                            italic,
                        }
                    })
                    .collect();
                result.push(spans);
            }
            Err(_) => {
                result.push(vec![HighlightSpan {
                    text: line.to_string(),
                    fg: None,
                    bold: false,
                    italic: false,
                }]);
            }
        }
    }

    Some(result)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_resolve_lang_alias_typescript() {
        assert_eq!(resolve_lang_alias("ts"), "javascript");
        assert_eq!(resolve_lang_alias("tsx"), "javascript");
        assert_eq!(resolve_lang_alias("typescript"), "javascript");
    }

    #[test]
    fn test_resolve_lang_alias_shell() {
        assert_eq!(resolve_lang_alias("shell"), "bash");
        assert_eq!(resolve_lang_alias("zsh"), "bash");
    }

    #[test]
    fn test_resolve_lang_alias_passthrough() {
        assert_eq!(resolve_lang_alias("rust"), "rust");
        assert_eq!(resolve_lang_alias("python"), "python");
    }

    #[test]
    fn test_lang_from_path_rs() {
        assert_eq!(lang_from_path("src/main.rs"), "rust");
    }

    #[test]
    fn test_lang_from_path_py() {
        assert_eq!(lang_from_path("script.py"), "python");
    }

    #[test]
    fn test_lang_from_path_js() {
        assert_eq!(lang_from_path("app.js"), "javascript");
    }

    #[test]
    fn test_lang_from_path_ts() {
        assert_eq!(lang_from_path("app.ts"), "javascript");
    }

    #[test]
    fn test_lang_from_path_unknown() {
        assert_eq!(lang_from_path("file.xyzzy"), "");
    }

    #[test]
    fn test_lang_from_path_no_extension() {
        assert_eq!(lang_from_path("Makefile"), "");
    }

    #[test]
    fn test_lang_from_path_toml() {
        assert_eq!(lang_from_path("Cargo.toml"), "yaml");
    }

    #[test]
    fn test_highlight_code_rust() {
        let code = "fn main() {\n    println!(\"hello\");\n}";
        let result = highlight_code("rust", code);
        assert!(result.is_some(), "rust should be recognized");
        let lines = result.unwrap();
        assert_eq!(lines.len(), 3);
        // Each line should have at least one span
        for line in &lines {
            assert!(!line.is_empty());
        }
        // "fn" should be highlighted with some color
        let first_span = &lines[0][0];
        assert!(first_span.fg.is_some());
    }

    #[test]
    fn test_highlight_code_unknown_lang() {
        let result = highlight_code("nonexistent_language_xyz", "hello");
        assert!(result.is_none());
    }

    #[test]
    fn test_highlight_code_empty_lang() {
        let result = highlight_code("", "hello");
        assert!(result.is_none());
    }

    #[test]
    fn test_highlight_line_python() {
        let result = highlight_line("python", "def foo():");
        assert!(result.is_some());
        let spans = result.unwrap();
        assert!(!spans.is_empty());
        // "def" keyword should have a color
        assert!(spans[0].fg.is_some());
    }
}
