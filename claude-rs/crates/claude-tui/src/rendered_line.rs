//! Pre-rendered line type for the scrollback buffer.

use ratatui::style::Style;
use ratatui::text::{Line, Span};
use unicode_segmentation::UnicodeSegmentation;
use unicode_width::UnicodeWidthStr;

/// Pre-rendered line for the scrollback buffer.
#[derive(Clone)]
pub(crate) struct RenderedLine {
    pub(crate) spans: Vec<(String, Style)>,
    /// Optional prefix prepended to continuation lines when this line is wrapped.
    /// Used for blockquote `│ ` prefixes that must appear on every wrapped line.
    pub(crate) wrap_prefix: Option<(String, Style)>,
}

impl RenderedLine {
    pub(crate) fn plain(text: &str) -> Self {
        Self {
            spans: vec![(text.to_string(), Style::default())],
            wrap_prefix: None,
        }
    }

    pub(crate) fn styled(text: &str, style: Style) -> Self {
        Self {
            spans: vec![(text.to_string(), style)],
            wrap_prefix: None,
        }
    }

    pub(crate) fn multi(spans: Vec<(&str, Style)>) -> Self {
        Self {
            spans: spans.into_iter().map(|(t, s)| (t.to_string(), s)).collect(),
            wrap_prefix: None,
        }
    }

    pub(crate) fn to_line(&self) -> Line<'_> {
        Line::from(
            self.spans
                .iter()
                .map(|(text, style)| Span::styled(text.as_str(), *style))
                .collect::<Vec<_>>(),
        )
    }

    /// Display width in terminal columns (not char count!).
    /// Uses unicode-width on grapheme clusters for correct handling of
    /// combining characters, ZWJ sequences, flag emojis, etc.
    pub(crate) fn display_width(&self) -> usize {
        self.spans.iter().map(|(t, _)| t.width()).sum()
    }

    /// Wrap this line into multiple lines at the given width (in terminal columns).
    /// Prefers breaking at word boundaries (spaces). Falls back to grapheme-cluster
    /// level breaks when a single word exceeds the available width.
    /// If `wrap_prefix` is set, continuation lines get that prefix prepended.
    /// Returns 1 or more RenderedLines.
    pub(crate) fn wrap(&self, width: usize) -> Vec<RenderedLine> {
        if width == 0 || self.display_width() <= width {
            return vec![self.clone()];
        }

        // Flatten all spans into a single list of (grapheme, width, style, is_break_point)
        // Break points: spaces and hyphens (break AFTER them)
        let mut graphemes: Vec<(&str, usize, Style, bool)> = Vec::new();
        for (text, style) in &self.spans {
            for g in text.graphemes(true) {
                let w = g.width();
                let is_break = g == " " || g == "-";
                graphemes.push((g, w, *style, is_break));
            }
        }

        // Compute prefix width for continuation lines
        let prefix_width = self
            .wrap_prefix
            .as_ref()
            .map(|(t, _)| t.width())
            .unwrap_or(0);

        let mut result: Vec<RenderedLine> = Vec::new();
        let mut pos = 0; // current position in graphemes

        while pos < graphemes.len() {
            let line_width = if result.is_empty() {
                width
            } else {
                width.saturating_sub(prefix_width)
            };

            // Collect graphemes that fit in line_width
            let mut end = pos;
            let mut col = 0;
            while end < graphemes.len() {
                let g_w = graphemes[end].1;
                if col + g_w > line_width && end > pos {
                    break;
                }
                col += g_w;
                end += 1;
                if col >= line_width {
                    break;
                }
            }

            // If we're not at the end, try to find a word boundary to break at.
            // Search backwards from `end` for the last space or hyphen within the chunk.
            if end < graphemes.len() {
                let mut word_break = None;
                for i in (pos..end).rev() {
                    if graphemes[i].3 {
                        // Found a break point — break AFTER it (include space/hyphen in this line)
                        word_break = Some(i + 1);
                        break;
                    }
                }
                if let Some(wb) = word_break {
                    if wb > pos {
                        end = wb;
                    }
                }
            }

            if end == pos {
                // Safety: shouldn't happen, but avoid infinite loop
                break;
            }

            // Build spans for this line from graphemes[pos..end]
            let mut line_spans: Vec<(String, Style)> = Vec::new();
            if !result.is_empty() {
                // Prepend wrap_prefix to continuation lines
                if let Some((ref prefix_text, prefix_style)) = self.wrap_prefix {
                    line_spans.push((prefix_text.clone(), prefix_style));
                }
            }

            // Merge consecutive graphemes with the same style into single spans
            let mut current_text = String::new();
            let mut current_style = graphemes[pos].2;
            for i in pos..end {
                let (g, _, style, _) = graphemes[i];
                if style == current_style {
                    current_text.push_str(g);
                } else {
                    if !current_text.is_empty() {
                        line_spans.push((current_text, current_style));
                        current_text = String::new();
                    }
                    current_style = style;
                    current_text.push_str(g);
                }
            }
            if !current_text.is_empty() {
                line_spans.push((current_text, current_style));
            }

            result.push(RenderedLine {
                spans: line_spans,
                wrap_prefix: None,
            });
            pos = end;
        }

        if result.is_empty() {
            result.push(self.clone());
        }

        result
    }
}
