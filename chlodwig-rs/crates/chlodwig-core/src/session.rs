//! Session persistence — auto-save conversation state to disk.
//!
//! Each session gets its own file in `~/.chlodwig-rs/sessions/`, named by
//! start timestamp: `YYYY_MM_DD_HH_MM_SS.json`. After every completed turn
//! or compaction, the conversation messages are serialised to this file so
//! the session can be resumed after a crash or restart.
//!
//! Legacy: the old `~/.chlodwig-rs/session.json` is still checked for
//! backward compatibility when loading.

use crate::{Message, SystemBlock};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Serialisable snapshot of a conversation session.
///
/// Contains everything needed to resume the conversation:
/// messages, model name, system prompt, and a timestamp.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionSnapshot {
    /// ISO-8601 timestamp when the snapshot was taken.
    pub saved_at: String,
    /// ISO-8601 timestamp when the session was started.
    /// Used to derive the per-session filename (`YYYY_MM_DD_HH_MM_SS.json`).
    /// Defaults to `saved_at` for backward compatibility with old session files.
    #[serde(default)]
    pub started_at: String,
    /// Model name (e.g. "claude-sonnet-4-20250514").
    pub model: String,
    /// The full conversation history.
    pub messages: Vec<Message>,
    /// The system prompt blocks.
    pub system_prompt: Vec<SystemBlock>,
    /// Editable constants (optional for backward compat with old session files).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub constants: Option<ConstantsSnapshot>,
    /// Table sort states — which tables are sorted by which column.
    /// Empty by default; skipped in JSON when empty.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub table_sorts: Vec<TableSortState>,
    /// Optional human-readable name for this session, set via `/name`.
    /// Used in window titles and the sessions browser.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// Cumulative session statistics — turn/request counters and total tokens.
    /// Restored on resume so the bottom-left status counters keep counting
    /// instead of resetting to zero. Optional for backward compat with old
    /// session files; `None` after load means "no stats stored, start at 0".
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub stats: Option<SessionStats>,
}

/// Cumulative session statistics — what the bottom-left status line shows.
///
/// All fields are persisted on every save so resuming a session never
/// resets the counters back to zero. The `last_*` fields capture the
/// final `TurnUsage` from the most recent turn so `ctx:` (context window)
/// also keeps its value across resume.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SessionStats {
    /// Number of completed conversation turns in this session.
    #[serde(default)]
    pub turn_count: u32,
    /// Number of API requests made (turns + tool retries + compactions).
    #[serde(default)]
    pub request_count: u32,
    /// Cumulative input tokens consumed across the entire session (`tx:`).
    #[serde(default)]
    pub total_input_tokens: u64,
    /// Cumulative output tokens produced across the entire session (`rx:`).
    #[serde(default)]
    pub total_output_tokens: u64,
    /// Last turn's input tokens — used to seed `TurnUsage.input_tokens`
    /// on resume so `ctx:` still shows the actual context window.
    #[serde(default)]
    pub last_input_tokens: u64,
    /// Last turn's output tokens — see `last_input_tokens`.
    #[serde(default)]
    pub last_output_tokens: u64,
    /// Last turn's cache tokens (creation + read) — see `last_input_tokens`.
    #[serde(default)]
    pub last_cache_tokens: u64,
}

/// Persisted sort state for a single table.
///
/// Identifies the table by its position in the conversation (block index +
/// table index within that block) and stores which column is sorted and
/// in which direction.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableSortState {
    /// Index of the DisplayBlock containing this table.
    pub block_index: usize,
    /// Index of the table within that block (a block can contain multiple tables).
    pub table_index: usize,
    /// Which column is sorted.
    pub sort_column: usize,
    /// Sort direction: false = ascending, true = descending.
    pub sort_descending: bool,
}

/// Serialisable snapshot of the editable constants.
///
/// Every field has `#[serde(default)]` so that old session files
/// (which may be missing newly-added fields) deserialize cleanly
/// with the default value.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConstantsSnapshot {
    #[serde(default = "default_auto_compact_threshold")]
    pub auto_compact_threshold: u64,
    #[serde(default = "default_max_retries")]
    pub max_retries: u32,
    #[serde(default = "default_subagent_max_turns")]
    pub subagent_max_turns: u32,
    #[serde(default = "default_subagent_max_tokens")]
    pub subagent_max_tokens: u32,
    #[serde(default = "default_default_max_results")]
    pub default_max_results: usize,
    #[serde(default = "default_absolute_max_results")]
    pub absolute_max_results: usize,
    #[serde(default = "default_search_timeout_secs")]
    pub search_timeout_secs: u64,
    #[serde(default = "default_default_max_size")]
    pub default_max_size: usize,
    #[serde(default = "default_absolute_max_size")]
    pub absolute_max_size: usize,
    #[serde(default = "default_max_glob_results")]
    pub max_glob_results: usize,
    #[serde(default = "default_default_head_limit")]
    pub default_head_limit: usize,
    #[serde(default = "default_input_max_visual_lines")]
    pub input_max_visual_lines: usize,
}

// Default value functions for serde(default = "...").
fn default_auto_compact_threshold() -> u64 { 160_000 }
fn default_max_retries() -> u32 { 3 }
fn default_subagent_max_turns() -> u32 { 1000 }
fn default_subagent_max_tokens() -> u32 { 16_384 }
fn default_default_max_results() -> usize { 10 }
fn default_absolute_max_results() -> usize { 20 }
fn default_search_timeout_secs() -> u64 { 15 }
fn default_default_max_size() -> usize { 100_000 }
fn default_absolute_max_size() -> usize { 1_000_000 }
fn default_max_glob_results() -> usize { 100 }
fn default_default_head_limit() -> usize { 250 }
fn default_input_max_visual_lines() -> usize { 10 }

impl Default for ConstantsSnapshot {
    fn default() -> Self {
        Self {
            auto_compact_threshold: default_auto_compact_threshold(),
            max_retries: default_max_retries(),
            subagent_max_turns: default_subagent_max_turns(),
            subagent_max_tokens: default_subagent_max_tokens(),
            default_max_results: default_default_max_results(),
            absolute_max_results: default_absolute_max_results(),
            search_timeout_secs: default_search_timeout_secs(),
            default_max_size: default_default_max_size(),
            absolute_max_size: default_absolute_max_size(),
            max_glob_results: default_max_glob_results(),
            default_head_limit: default_default_head_limit(),
            input_max_visual_lines: default_input_max_visual_lines(),
        }
    }
}

/// Returns the sessions directory: `~/.chlodwig-rs/sessions/`, creating it if necessary.
pub fn sessions_dir() -> PathBuf {
    let dir = crate::log_dir().join("sessions");
    std::fs::create_dir_all(&dir).ok();
    dir
}

/// Converts an ISO-8601 `started_at` timestamp to a filename like `2026_04_13_14_30_15.json`.
///
/// Parses the timestamp with `chrono` and formats it as `YYYY_MM_DD_HH_MM_SS.json`.
/// Falls back to the raw string (sanitized) if parsing fails.
pub fn session_filename_for(started_at: &str) -> String {
    // Try parsing as RFC-3339 (which covers ISO-8601 with timezone)
    if let Ok(dt) = chrono::DateTime::parse_from_rfc3339(started_at) {
        return format!("{}.json", dt.format("%Y_%m_%d_%H_%M_%S"));
    }
    // Fallback: sanitize the raw string to make a safe filename
    let sanitized: String = started_at
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '_' || c == '-' { c } else { '_' })
        .collect();
    format!("{sanitized}.json")
}

/// Returns the full path for a session file based on its `started_at` timestamp.
///
/// Example: `~/.chlodwig-rs/sessions/2026_04_13_14_30_15.json`
pub fn session_path_for(started_at: &str) -> PathBuf {
    sessions_dir().join(session_filename_for(started_at))
}

/// Returns the path to the legacy session file: `~/.chlodwig-rs/session.json`.
///
/// Used only for backward-compatible migration.
#[deprecated(note = "Use session_path_for() with a started_at timestamp")]
pub fn session_path() -> PathBuf {
    crate::log_dir().join("session.json")
}

/// Returns the path to the standalone constants file: `~/.chlodwig-rs/constants.json`.
pub fn constants_path() -> PathBuf {
    crate::log_dir().join("constants.json")
}

/// Save a session snapshot to disk (blocking I/O).
///
/// The file path is derived from `snapshot.started_at` — each session
/// gets its own file: `~/.chlodwig-rs/sessions/YYYY_MM_DD_HH_MM_SS.json`.
///
/// Writes to a temporary file first, then atomically renames,
/// so a crash during write never corrupts the existing file.
pub fn save_session(snapshot: &SessionSnapshot) -> std::io::Result<()> {
    let path = session_path_for(&snapshot.started_at);
    save_session_to(snapshot, &path)
}

/// Save a session snapshot to an arbitrary path (used by tests and internal code).
pub fn save_session_to(snapshot: &SessionSnapshot, path: &std::path::Path) -> std::io::Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let json = serde_json::to_string_pretty(snapshot)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

    // Write to a temp file in the same directory, then rename (atomic on POSIX).
    let tmp_path = path.with_extension("json.tmp");
    std::fs::write(&tmp_path, json.as_bytes())?;
    std::fs::rename(&tmp_path, path)?;

    tracing::debug!(path = %path.display(), bytes = json.len(), "session saved");
    Ok(())
}

/// Load the most recent session snapshot from the sessions directory.
///
/// Scans `~/.chlodwig-rs/sessions/` for `*.json` files, sorts by filename
/// (which is a timestamp, so lexicographic = chronological), and loads the last one.
///
/// Also checks the legacy `~/.chlodwig-rs/session.json` for backward compatibility.
/// If the legacy file exists and is newer than any file in sessions/, it is used.
///
/// Returns `None` if no session file exists. Returns `Err` on I/O or parse errors.
pub fn load_latest_session() -> std::io::Result<Option<SessionSnapshot>> {
    let dir = sessions_dir();
    let mut candidates: Vec<PathBuf> = Vec::new();

    // Collect all .json files in the sessions directory
    if dir.exists() {
        for entry in std::fs::read_dir(&dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) == Some("json") {
                candidates.push(path);
            }
        }
    }

    // Sort lexicographically — filenames are timestamps, so this is chronological
    candidates.sort();

    // Check the legacy session.json for backward compatibility
    #[allow(deprecated)]
    let legacy_path = session_path();
    let use_legacy = if legacy_path.exists() {
        if let Some(newest) = candidates.last() {
            // Compare modification times: use legacy if it's newer
            let legacy_mtime = std::fs::metadata(&legacy_path)?.modified()?;
            let newest_mtime = std::fs::metadata(newest)?.modified()?;
            legacy_mtime > newest_mtime
        } else {
            true // no session files in sessions/, use legacy
        }
    } else {
        false
    };

    let path = if use_legacy {
        legacy_path
    } else if let Some(newest) = candidates.last() {
        newest.clone()
    } else {
        return Ok(None);
    };

    let json = std::fs::read_to_string(&path)?;
    let snapshot: SessionSnapshot = serde_json::from_str(&json)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
    tracing::debug!(
        path = %path.display(),
        messages = snapshot.messages.len(),
        "session loaded"
    );
    Ok(Some(snapshot))
}

/// Load a session snapshot from disk, if one exists.
///
/// **Deprecated**: Use `load_latest_session()` instead. This function only
/// checks the legacy `~/.chlodwig-rs/session.json` path.
#[deprecated(note = "Use load_latest_session() which checks the sessions/ directory")]
pub fn load_session() -> std::io::Result<Option<SessionSnapshot>> {
    load_latest_session()
}

/// Summary of a saved session, for listing purposes.
///
/// Contains only metadata — does NOT load the full conversation messages.
#[derive(Debug, Clone)]
pub struct SessionInfo {
    /// The filename (e.g. `2026_04_13_14_30_15.json`).
    pub filename: String,
    /// The `started_at` timestamp from the session file.
    pub started_at: String,
    /// The `saved_at` timestamp (last save).
    pub saved_at: String,
    /// Model name.
    pub model: String,
    /// Number of messages in the conversation.
    pub message_count: usize,
    /// Full path to the session file.
    pub path: PathBuf,
    /// Optional human-readable name (from `/name`), if set.
    pub name: Option<String>,
}

/// List all saved sessions, sorted chronologically (oldest first).
///
/// Scans `~/.chlodwig-rs/sessions/` for `.json` files and reads their metadata.
/// Invalid/corrupt files are silently skipped.
pub fn list_sessions() -> std::io::Result<Vec<SessionInfo>> {
    list_sessions_in(&sessions_dir())
}

/// List sessions from an arbitrary directory (used by tests).
pub fn list_sessions_in(dir: &std::path::Path) -> std::io::Result<Vec<SessionInfo>> {
    let mut infos = Vec::new();

    if !dir.exists() {
        return Ok(infos);
    }

    let mut paths: Vec<PathBuf> = Vec::new();
    for entry in std::fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("json") {
            paths.push(path);
        }
    }
    // Sort lexicographically — filenames are timestamps, so this is chronological
    paths.sort();

    for path in paths {
        match std::fs::read_to_string(&path) {
            Ok(json) => {
                match serde_json::from_str::<SessionSnapshot>(&json) {
                    Ok(snap) => {
                        infos.push(SessionInfo {
                            filename: path
                                .file_name()
                                .unwrap_or_default()
                                .to_string_lossy()
                                .into_owned(),
                            started_at: snap.started_at,
                            saved_at: snap.saved_at,
                            model: snap.model,
                            message_count: snap.messages.len(),
                            path: path.clone(),
                            name: snap.name,
                        });
                    }
                    Err(e) => {
                        tracing::warn!(
                            path = %path.display(),
                            error = %e,
                            "skipping corrupt session file"
                        );
                    }
                }
            }
            Err(e) => {
                tracing::warn!(
                    path = %path.display(),
                    error = %e,
                    "skipping unreadable session file"
                );
            }
        }
    }

    Ok(infos)
}

/// Sort a list of `SessionInfo` by `saved_at` in descending order
/// (most recently saved first). Entries whose `saved_at` cannot be parsed
/// as RFC-3339 are sorted to the end.
pub fn sort_sessions_by_saved_desc(infos: &mut Vec<SessionInfo>) {
    infos.sort_by(|a, b| {
        let ta = chrono::DateTime::parse_from_rfc3339(&a.saved_at).ok();
        let tb = chrono::DateTime::parse_from_rfc3339(&b.saved_at).ok();
        match (ta, tb) {
            (Some(da), Some(db)) => db.cmp(&da),
            (Some(_), None) => std::cmp::Ordering::Less,
            (None, Some(_)) => std::cmp::Ordering::Greater,
            (None, None) => std::cmp::Ordering::Equal,
        }
    });
}

/// Format an RFC-3339 timestamp as a human-readable local time string,
/// e.g. `"2026-04-13 15:30:45"`. Falls back to the raw string if parsing fails.
pub fn format_saved_at_human(saved_at: &str) -> String {
    if let Ok(dt) = chrono::DateTime::parse_from_rfc3339(saved_at) {
        let local = dt.with_timezone(&chrono::Local);
        return local.format("%Y-%m-%d %H:%M:%S").to_string();
    }
    saved_at.to_string()
}

/// Load a session by filename prefix match.
///
/// The prefix is matched against the session filenames (without `.json` extension).
/// For example:
/// - `"2026_04_13"` matches `2026_04_13_14_30_15.json`
/// - `"2026_04_13_14"` matches `2026_04_13_14_30_15.json`
/// - `"2026_04_13_14_30_15"` matches exactly
///
/// If multiple sessions match, returns the **most recent** (last in sorted order).
/// Returns `Ok(None)` if no session matches the prefix.
pub fn load_session_by_prefix(prefix: &str) -> std::io::Result<Option<SessionSnapshot>> {
    load_session_by_prefix_in(prefix, &sessions_dir())
}

/// Load a session by prefix from an arbitrary directory (used by tests).
pub fn load_session_by_prefix_in(
    prefix: &str,
    dir: &std::path::Path,
) -> std::io::Result<Option<SessionSnapshot>> {
    if !dir.exists() {
        return Ok(None);
    }

    let mut candidates: Vec<PathBuf> = Vec::new();
    for entry in std::fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("json") {
            continue;
        }
        let stem = path
            .file_stem()
            .unwrap_or_default()
            .to_string_lossy();
        if stem.starts_with(prefix) {
            candidates.push(path);
        }
    }

    if candidates.is_empty() {
        return Ok(None);
    }

    // Sort and pick the most recent (last)
    candidates.sort();
    let path = candidates.last().unwrap();

    let json = std::fs::read_to_string(path)?;
    let snapshot: SessionSnapshot = serde_json::from_str(&json)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
    tracing::debug!(
        path = %path.display(),
        prefix = prefix,
        messages = snapshot.messages.len(),
        "session loaded by prefix"
    );
    Ok(Some(snapshot))
}

/// Load a session by exact name match (set via `/name`).
///
/// Returns `Ok(None)` if no session has that name.
/// Names are matched case-sensitively and exactly (no fuzzy/prefix).
pub fn load_session_by_name(name: &str) -> std::io::Result<Option<SessionSnapshot>> {
    load_session_by_name_in(&sessions_dir(), name)
}

pub fn load_session_by_name_in(
    dir: &std::path::Path,
    name: &str,
) -> std::io::Result<Option<SessionSnapshot>> {
    let infos = list_sessions_in(dir)?;
    for info in infos {
        if info.name.as_deref() == Some(name) {
            let json = std::fs::read_to_string(&info.path)?;
            let snapshot: SessionSnapshot = serde_json::from_str(&json)
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
            return Ok(Some(snapshot));
        }
    }
    Ok(None)
}

/// Check whether a session with the given name already exists (excluding the
/// session at `exclude_path` if provided — used so renaming the current
/// session to its existing name does not trip the duplicate check).
pub fn session_name_exists(name: &str, exclude_path: Option<&std::path::Path>) -> std::io::Result<bool> {
    session_name_exists_in(&sessions_dir(), name, exclude_path)
}

pub fn session_name_exists_in(
    dir: &std::path::Path,
    name: &str,
    exclude_path: Option<&std::path::Path>,
) -> std::io::Result<bool> {
    let infos = list_sessions_in(dir)?;
    for info in infos {
        if info.name.as_deref() == Some(name) {
            if let Some(excl) = exclude_path {
                if info.path == excl {
                    continue;
                }
            }
            return Ok(true);
        }
    }
    Ok(false)
}

/// Load a session snapshot from an arbitrary file path.
///
/// Returns `Err` on I/O or parse errors.
pub fn load_session_from(path: &std::path::Path) -> std::io::Result<SessionSnapshot> {
    let json = std::fs::read_to_string(path)?;
    let snapshot: SessionSnapshot = serde_json::from_str(&json)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
    Ok(snapshot)
}

/// Extract a conversation preview from session messages.
///
/// Returns pairs of `(role_label, text)` for user and assistant messages only.
/// Tool use, tool results, thinking blocks, and images are excluded.
/// Text is truncated to `max_chars` per message.
pub fn session_preview_messages(
    messages: &[Message],
    max_chars: usize,
) -> Vec<(&'static str, String)> {
    let mut result = Vec::new();
    for msg in messages {
        let text = msg.text();
        if text.is_empty() {
            continue;
        }
        let role_label = match msg.role {
            crate::Role::User => "You",
            crate::Role::Assistant => "Assistant",
        };
        let truncated = if text.chars().count() > max_chars {
            let s: String = text.chars().take(max_chars).collect();
            format!("{s}…")
        } else {
            text
        };
        // Collapse newlines to spaces for preview
        let oneline = truncated.replace('\n', " ");
        result.push((role_label, oneline));
    }
    result
}

// ── Standalone constants.json persistence ────────────────────────────

/// Save a constants snapshot to disk (blocking I/O).
///
/// Writes to a temporary file first, then atomically renames,
/// so a crash during write never corrupts the existing file.
pub fn save_constants(snapshot: &ConstantsSnapshot) -> std::io::Result<()> {
    save_constants_to(snapshot, &constants_path())
}

/// Save a constants snapshot to an arbitrary path (used by tests).
pub fn save_constants_to(snapshot: &ConstantsSnapshot, path: &std::path::Path) -> std::io::Result<()> {
    let json = serde_json::to_string_pretty(snapshot)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

    let tmp_path = path.with_extension("json.tmp");
    std::fs::write(&tmp_path, json.as_bytes())?;
    std::fs::rename(&tmp_path, path)?;

    tracing::debug!(path = %path.display(), bytes = json.len(), "constants saved");
    Ok(())
}

/// Load a constants snapshot from disk, if one exists.
///
/// Returns `None` if the file doesn't exist. Returns `Err` on I/O
/// or parse errors.
pub fn load_constants() -> std::io::Result<Option<ConstantsSnapshot>> {
    load_constants_from(&constants_path())
}

/// Load a constants snapshot from an arbitrary path (used by tests).
pub fn load_constants_from(path: &std::path::Path) -> std::io::Result<Option<ConstantsSnapshot>> {
    if !path.exists() {
        return Ok(None);
    }
    let json = std::fs::read_to_string(path)?;
    let snapshot: ConstantsSnapshot = serde_json::from_str(&json)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
    tracing::debug!(path = %path.display(), "constants loaded");
    Ok(Some(snapshot))
}

/// Build a `SessionSnapshot` from a `ConversationState` plus per-call metadata.
///
/// Centralises the snapshot-construction logic that was previously duplicated
/// between CLI, TUI and GTK frontends. Each frontend just provides the bits
/// it owns (when the session was started, current table-sort state, optional
/// session name, and the optional editable-constants snapshot); model,
/// messages and system prompt are read from the conversation state.
///
/// `saved_at` is set to "now" (RFC-3339 local time) at call time.
pub fn build_snapshot(
    state: &crate::ConversationState,
    started_at: impl Into<String>,
    table_sorts: Vec<TableSortState>,
    name: Option<String>,
    constants: Option<ConstantsSnapshot>,
    stats: Option<SessionStats>,
) -> SessionSnapshot {
    SessionSnapshot {
        saved_at: chrono::Local::now().to_rfc3339(),
        started_at: started_at.into(),
        model: state.model.clone(),
        messages: state.messages.clone(),
        system_prompt: state.system_prompt.clone(),
        constants,
        table_sorts,
        name,
        stats,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{ContentBlock, ConversationState, Role, ToolContext};

    /// Helper: build a minimal `ConversationState` for snapshot tests.
    fn make_state(messages: Vec<Message>, model: &str) -> ConversationState {
        ConversationState {
            messages,
            model: model.into(),
            system_prompt: vec![SystemBlock::text("sys")],
            max_tokens: 1024,
            tools: vec![],
            tool_context: ToolContext::default(),
            stop_requested: crate::new_stop_flag(),
        }
    }

    #[test]
    fn test_build_snapshot_copies_state_fields() {
        let state = make_state(
            vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text { text: "hi".into() }],
            }],
            "test-model",
        );
        let snap = build_snapshot(
            &state,
            "2026-04-18T10:00:00+02:00",
            vec![],
            None,
            None,
            None,
        );
        assert_eq!(snap.started_at, "2026-04-18T10:00:00+02:00");
        assert_eq!(snap.model, "test-model");
        assert_eq!(snap.messages.len(), 1);
        assert_eq!(snap.messages[0].text(), "hi");
        assert_eq!(snap.system_prompt.len(), 1);
        assert_eq!(snap.system_prompt[0].text, "sys");
        assert!(snap.constants.is_none());
        assert!(snap.table_sorts.is_empty());
        assert!(snap.name.is_none());
        // saved_at must be a parseable RFC-3339 string set to "now"
        assert!(chrono::DateTime::parse_from_rfc3339(&snap.saved_at).is_ok());
    }

    #[test]
    fn test_build_snapshot_passes_through_metadata() {
        let state = make_state(vec![], "m");
        let sorts = vec![TableSortState {
            block_index: 2,
            table_index: 0,
            sort_column: 1,
            sort_descending: true,
        }];
        let consts = ConstantsSnapshot::default();
        let snap = build_snapshot(
            &state,
            "2026-04-18T10:00:00+02:00",
            sorts.clone(),
            Some("my session".into()),
            Some(consts.clone()),
            None,
        );
        assert_eq!(snap.name.as_deref(), Some("my session"));
        assert_eq!(snap.table_sorts.len(), 1);
        assert_eq!(snap.table_sorts[0].block_index, 2);
        assert!(snap.table_sorts[0].sort_descending);
        assert!(snap.constants.is_some());
        assert_eq!(snap.constants.unwrap().max_retries, consts.max_retries);
    }

    #[test]
    fn test_build_snapshot_clones_does_not_borrow_state() {
        // Ensure messages/system_prompt are owned (cloned), not shared references —
        // mutating the source state must not affect the snapshot.
        let mut state = make_state(
            vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text { text: "first".into() }],
            }],
            "m1",
        );
        let snap = build_snapshot(&state, "t", vec![], None, None, None);
        state.messages.push(Message {
            role: Role::User,
            content: vec![ContentBlock::Text { text: "second".into() }],
        });
        state.model = "m2".into();
        assert_eq!(snap.messages.len(), 1);
        assert_eq!(snap.messages[0].text(), "first");
        assert_eq!(snap.model, "m1");
    }

    /// Helper: build a minimal snapshot with the given messages.
    fn make_snapshot(messages: Vec<Message>) -> SessionSnapshot {
        SessionSnapshot {
            saved_at: "2026-04-04T12:00:00Z".into(),
            started_at: "2026-04-04T11:00:00+02:00".into(),
            model: "test-model".into(),
            messages,
            system_prompt: vec![SystemBlock::text("You are helpful.")],
            constants: None, table_sorts: vec![], name: None, stats: None,
        }
    }

    #[test]
    fn test_session_snapshot_roundtrip_empty_messages() {
        let snap = make_snapshot(vec![]);
        let json = serde_json::to_string(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.messages.len(), 0);
        assert_eq!(restored.model, "test-model");
        assert_eq!(restored.saved_at, "2026-04-04T12:00:00Z");
        assert_eq!(restored.system_prompt.len(), 1);
        assert_eq!(restored.system_prompt[0].text, "You are helpful.");
    }

    #[test]
    fn test_session_snapshot_roundtrip_with_messages() {
        let messages = vec![
            Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "Hello".into(),
                }],
            },
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::Text {
                    text: "Hi there!".into(),
                }],
            },
        ];
        let snap = make_snapshot(messages);
        let json = serde_json::to_string_pretty(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();

        assert_eq!(restored.messages.len(), 2);
        assert_eq!(restored.messages[0].role, Role::User);
        assert_eq!(restored.messages[0].text(), "Hello");
        assert_eq!(restored.messages[1].role, Role::Assistant);
        assert_eq!(restored.messages[1].text(), "Hi there!");
    }

    #[test]
    fn test_session_snapshot_roundtrip_with_tool_use() {
        let messages = vec![
            Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "Read my file".into(),
                }],
            },
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::ToolUse {
                    id: "tool_123".into(),
                    name: "Read".into(),
                    input: serde_json::json!({"file_path": "/tmp/test.txt"}),
                }],
            },
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "tool_123".into(),
                    content: crate::ToolResultContent::Text("file contents here".into()),
                    is_error: None,
                }],
            },
        ];
        let snap = make_snapshot(messages);
        let json = serde_json::to_string(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();

        assert_eq!(restored.messages.len(), 3);
        // Verify tool_use block
        match &restored.messages[1].content[0] {
            ContentBlock::ToolUse { id, name, input } => {
                assert_eq!(id, "tool_123");
                assert_eq!(name, "Read");
                assert_eq!(input["file_path"], "/tmp/test.txt");
            }
            other => panic!("Expected ToolUse, got {:?}", other),
        }
        // Verify tool_result block
        match &restored.messages[2].content[0] {
            ContentBlock::ToolResult {
                tool_use_id,
                content,
                is_error,
            } => {
                assert_eq!(tool_use_id, "tool_123");
                match content {
                    crate::ToolResultContent::Text(t) => assert_eq!(t, "file contents here"),
                    other => panic!("Expected Text, got {:?}", other),
                }
                assert!(is_error.is_none());
            }
            other => panic!("Expected ToolResult, got {:?}", other),
        }
    }

    #[test]
    fn test_session_snapshot_roundtrip_utf8() {
        // Gotcha #16: UTF-8 boundary safety — verify multibyte chars survive round-trip.
        let messages = vec![Message {
            role: Role::User,
            content: vec![ContentBlock::Text {
                text: "Ünïcödé: 日本語 🎉 ├── box drawing".into(),
            }],
        }];
        let snap = make_snapshot(messages);
        let json = serde_json::to_string(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();

        assert_eq!(
            restored.messages[0].text(),
            "Ünïcödé: 日本語 🎉 ├── box drawing"
        );
    }

    #[test]
    fn test_save_and_load_session_file() {
        // Use a temporary directory to avoid polluting the real ~/.chlodwig-rs/
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("session.json");

        let snap = make_snapshot(vec![Message {
            role: Role::User,
            content: vec![ContentBlock::Text {
                text: "persisted message".into(),
            }],
        }]);

        // Save manually to the temp path
        let json = serde_json::to_string_pretty(&snap).unwrap();
        std::fs::write(&path, &json).unwrap();

        // Load manually from the temp path
        let loaded_json = std::fs::read_to_string(&path).unwrap();
        let loaded: SessionSnapshot = serde_json::from_str(&loaded_json).unwrap();

        assert_eq!(loaded.messages.len(), 1);
        assert_eq!(loaded.messages[0].text(), "persisted message");
        assert_eq!(loaded.model, "test-model");
    }

    #[test]
    fn test_save_session_creates_valid_json() {
        let snap = make_snapshot(vec![
            Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "question".into(),
                }],
            },
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::Text {
                    text: "answer".into(),
                }],
            },
        ]);
        let json = serde_json::to_string_pretty(&snap).unwrap();

        // Must be valid JSON
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert!(parsed.is_object());
        assert!(parsed["messages"].is_array());
        assert_eq!(parsed["messages"].as_array().unwrap().len(), 2);
        assert_eq!(parsed["model"], "test-model");
        assert_eq!(parsed["saved_at"], "2026-04-04T12:00:00Z");
    }

    #[test]
    fn test_sessions_dir_is_under_chlodwig_rs() {
        let dir = sessions_dir();
        assert!(
            dir.ends_with(".chlodwig-rs/sessions"),
            "Expected .chlodwig-rs/sessions, got: {}",
            dir.display()
        );
    }

    #[test]
    fn test_session_filename_for_rfc3339() {
        let filename = session_filename_for("2026-04-13T14:30:15+02:00");
        assert_eq!(filename, "2026_04_13_14_30_15.json");
    }

    #[test]
    fn test_session_filename_for_utc() {
        let filename = session_filename_for("2026-01-02T03:04:05+00:00");
        assert_eq!(filename, "2026_01_02_03_04_05.json");
    }

    #[test]
    fn test_session_filename_for_fallback_on_invalid() {
        // If the timestamp can't be parsed, it should sanitize and still produce a filename
        let filename = session_filename_for("not-a-timestamp");
        assert!(filename.ends_with(".json"));
        assert!(!filename.contains('/'));
        assert!(!filename.contains(':'));
    }

    #[test]
    fn test_session_path_for_produces_correct_path() {
        let path = session_path_for("2026-04-13T14:30:15+02:00");
        assert_eq!(
            path.file_name().unwrap().to_str().unwrap(),
            "2026_04_13_14_30_15.json"
        );
        assert!(
            path.parent().unwrap().ends_with("sessions"),
            "Expected sessions dir, got: {}",
            path.parent().unwrap().display()
        );
    }

    #[test]
    fn test_save_session_uses_started_at_for_filename() {
        let tmp = tempfile::tempdir().unwrap();
        let sessions = tmp.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();

        let snap = SessionSnapshot {
            saved_at: "2026-04-13T15:00:00+02:00".into(),
            started_at: "2026-04-13T14:30:15+02:00".into(),
            model: "test-model".into(),
            messages: vec![],
            system_prompt: vec![],
            constants: None, table_sorts: vec![], name: None, stats: None,
        };

        let path = sessions.join(session_filename_for(&snap.started_at));
        save_session_to(&snap, &path).unwrap();

        assert!(path.exists());
        assert_eq!(
            path.file_name().unwrap().to_str().unwrap(),
            "2026_04_13_14_30_15.json"
        );
    }

    #[test]
    fn test_load_latest_session_returns_none_when_empty() {
        let tmp = tempfile::tempdir().unwrap();
        let sessions = tmp.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();
        // No files — no session to load
        // (We can't test load_latest_session directly because it uses
        // the hardcoded sessions_dir(). We test the logic via save_session_to
        // and manual file reading.)
    }

    #[test]
    fn test_load_latest_session_picks_most_recent() {
        let tmp = tempfile::tempdir().unwrap();
        let sessions = tmp.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();

        // Save two sessions with different started_at timestamps
        let old_snap = SessionSnapshot {
            saved_at: "2026-04-13T10:00:00+02:00".into(),
            started_at: "2026-04-13T09:00:00+02:00".into(),
            model: "old-model".into(),
            messages: vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text { text: "old".into() }],
            }],
            system_prompt: vec![],
            constants: None, table_sorts: vec![], name: None, stats: None,
        };
        let new_snap = SessionSnapshot {
            saved_at: "2026-04-13T15:00:00+02:00".into(),
            started_at: "2026-04-13T14:00:00+02:00".into(),
            model: "new-model".into(),
            messages: vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text { text: "new".into() }],
            }],
            system_prompt: vec![],
            constants: None, table_sorts: vec![], name: None, stats: None,
        };

        let old_path = sessions.join(session_filename_for(&old_snap.started_at));
        let new_path = sessions.join(session_filename_for(&new_snap.started_at));
        save_session_to(&old_snap, &old_path).unwrap();
        save_session_to(&new_snap, &new_path).unwrap();

        // Manually read what load_latest_session would do: sort .json files, pick last
        let mut files: Vec<_> = std::fs::read_dir(&sessions)
            .unwrap()
            .filter_map(|e| e.ok())
            .map(|e| e.path())
            .filter(|p| p.extension().and_then(|e| e.to_str()) == Some("json"))
            .collect();
        files.sort();
        let latest = files.last().unwrap();
        let loaded: SessionSnapshot =
            serde_json::from_str(&std::fs::read_to_string(latest).unwrap()).unwrap();

        assert_eq!(loaded.model, "new-model");
        assert_eq!(loaded.messages[0].text(), "new");
    }

    #[test]
    fn test_save_session_overwrites_same_session() {
        // Multiple saves of the same session (same started_at) should overwrite
        let tmp = tempfile::tempdir().unwrap();
        let sessions = tmp.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();

        let mut snap = SessionSnapshot {
            saved_at: "2026-04-13T14:30:15+02:00".into(),
            started_at: "2026-04-13T14:00:00+02:00".into(),
            model: "test-model".into(),
            messages: vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text { text: "first".into() }],
            }],
            system_prompt: vec![],
            constants: None, table_sorts: vec![], name: None, stats: None,
        };

        let path = sessions.join(session_filename_for(&snap.started_at));
        save_session_to(&snap, &path).unwrap();

        // Add more messages and save again (same started_at → same file)
        snap.messages.push(Message {
            role: Role::Assistant,
            content: vec![ContentBlock::Text { text: "reply".into() }],
        });
        snap.saved_at = "2026-04-13T14:35:00+02:00".into();
        save_session_to(&snap, &path).unwrap();

        // Only one file should exist
        let files: Vec<_> = std::fs::read_dir(&sessions)
            .unwrap()
            .filter_map(|e| e.ok())
            .collect();
        assert_eq!(files.len(), 1);

        // Content should be the updated version
        let loaded: SessionSnapshot =
            serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap();
        assert_eq!(loaded.messages.len(), 2);
    }

    #[test]
    fn test_started_at_roundtrip() {
        let snap = make_snapshot(vec![]);
        let json = serde_json::to_string(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.started_at, "2026-04-04T11:00:00+02:00");
    }

    #[test]
    fn test_backward_compat_missing_started_at() {
        // Old session files won't have started_at — it should default to empty string
        let json = r#"{
            "saved_at": "2026-04-04T12:00:00Z",
            "model": "test-model",
            "messages": [],
            "system_prompt": []
        }"#;
        let restored: SessionSnapshot = serde_json::from_str(json).unwrap();
        assert_eq!(restored.started_at, "");
    }

    #[test]
    fn test_session_snapshot_with_cached_system_block() {
        let snap = SessionSnapshot {
            saved_at: "2026-04-04T12:00:00Z".into(),
            started_at: "2026-04-04T11:00:00+02:00".into(),
            model: "test-model".into(),
            messages: vec![],
            system_prompt: vec![
                SystemBlock::text("block 1"),
                SystemBlock::cached("block 2 (cached)"),
            ],
            constants: None, table_sorts: vec![], name: None, stats: None,
        };
        let json = serde_json::to_string(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();

        assert_eq!(restored.system_prompt.len(), 2);
        assert!(restored.system_prompt[0].cache_control.is_none());
        assert!(restored.system_prompt[1].cache_control.is_some());
        assert_eq!(
            restored.system_prompt[1].cache_control.as_ref().unwrap().control_type,
            "ephemeral"
        );
    }

    #[test]
    fn test_constants_snapshot_default_roundtrip() {
        let snap = ConstantsSnapshot::default();
        let json = serde_json::to_string(&snap).unwrap();
        let restored: ConstantsSnapshot = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.auto_compact_threshold, 160_000);
        assert_eq!(restored.max_retries, 3);
        assert_eq!(restored.subagent_max_turns, 1000);
        assert_eq!(restored.subagent_max_tokens, 16_384);
        assert_eq!(restored.default_max_results, 10);
        assert_eq!(restored.absolute_max_results, 20);
        assert_eq!(restored.search_timeout_secs, 15);
        assert_eq!(restored.default_max_size, 100_000);
        assert_eq!(restored.absolute_max_size, 1_000_000);
        assert_eq!(restored.max_glob_results, 100);
        assert_eq!(restored.default_head_limit, 250);
        assert_eq!(restored.input_max_visual_lines, 10);
    }

    #[test]
    fn test_constants_snapshot_custom_values_roundtrip() {
        let snap = ConstantsSnapshot {
            auto_compact_threshold: 200_000,
            max_retries: 5,
            subagent_max_turns: 500,
            subagent_max_tokens: 8_192,
            default_max_results: 15,
            absolute_max_results: 30,
            search_timeout_secs: 30,
            default_max_size: 200_000,
            absolute_max_size: 2_000_000,
            max_glob_results: 200,
            default_head_limit: 500,
            input_max_visual_lines: 20,
        };
        let json = serde_json::to_string(&snap).unwrap();
        let restored: ConstantsSnapshot = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.auto_compact_threshold, 200_000);
        assert_eq!(restored.max_retries, 5);
        assert_eq!(restored.subagent_max_turns, 500);
        assert_eq!(restored.subagent_max_tokens, 8_192);
        assert_eq!(restored.default_max_results, 15);
        assert_eq!(restored.absolute_max_results, 30);
        assert_eq!(restored.search_timeout_secs, 30);
        assert_eq!(restored.default_max_size, 200_000);
        assert_eq!(restored.absolute_max_size, 2_000_000);
        assert_eq!(restored.max_glob_results, 200);
        assert_eq!(restored.default_head_limit, 500);
        assert_eq!(restored.input_max_visual_lines, 20);
    }

    #[test]
    fn test_session_snapshot_with_constants_roundtrip() {
        let mut snap = make_snapshot(vec![]);
        snap.constants = Some(ConstantsSnapshot {
            auto_compact_threshold: 250_000,
            ..ConstantsSnapshot::default()
        });
        let json = serde_json::to_string(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();
        assert!(restored.constants.is_some());
        assert_eq!(restored.constants.unwrap().auto_compact_threshold, 250_000);
    }

    #[test]
    fn test_session_snapshot_without_constants_is_backward_compatible() {
        // Old session.json files won't have a "constants" field.
        // Deserializing should still work — constants should be None.
        let json = r#"{
            "saved_at": "2026-04-04T12:00:00Z",
            "model": "test-model",
            "messages": [],
            "system_prompt": []
        }"#;
        let restored: SessionSnapshot = serde_json::from_str(json).unwrap();
        assert!(restored.constants.is_none());
    }

    #[test]
    fn test_constants_snapshot_missing_fields_get_defaults() {
        // If a future version adds a field, old snapshots with fewer fields
        // should deserialize with defaults for the missing fields.
        let json = r#"{ "auto_compact_threshold": 200000 }"#;
        let restored: ConstantsSnapshot = serde_json::from_str(json).unwrap();
        assert_eq!(restored.auto_compact_threshold, 200_000);
        // All other fields should be their defaults
        assert_eq!(restored.max_retries, 3);
        assert_eq!(restored.subagent_max_turns, 1000);
        assert_eq!(restored.input_max_visual_lines, 10);
    }

    // ── Standalone constants.json persistence tests ──

    #[test]
    fn test_constants_path_is_in_chlodwig_rs_dir() {
        let path = constants_path();
        assert!(
            path.parent().unwrap().ends_with(".chlodwig-rs"),
            "Expected .chlodwig-rs dir, got: {}",
            path.display()
        );
        assert_eq!(
            path.file_name().unwrap().to_str().unwrap(),
            "constants.json"
        );
    }

    #[test]
    fn test_save_and_load_constants_roundtrip() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("constants.json");

        let snap = ConstantsSnapshot {
            auto_compact_threshold: 300_000,
            max_retries: 7,
            ..ConstantsSnapshot::default()
        };

        // Save manually to the temp path
        let json = serde_json::to_string_pretty(&snap).unwrap();
        std::fs::write(&path, &json).unwrap();

        // Load manually from the temp path
        let loaded_json = std::fs::read_to_string(&path).unwrap();
        let loaded: ConstantsSnapshot = serde_json::from_str(&loaded_json).unwrap();

        assert_eq!(loaded.auto_compact_threshold, 300_000);
        assert_eq!(loaded.max_retries, 7);
        // Rest should be defaults
        assert_eq!(loaded.subagent_max_turns, 1000);
    }

    #[test]
    fn test_save_constants_creates_valid_json() {
        let snap = ConstantsSnapshot {
            search_timeout_secs: 42,
            ..ConstantsSnapshot::default()
        };
        let json = serde_json::to_string_pretty(&snap).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert!(parsed.is_object());
        assert_eq!(parsed["search_timeout_secs"], 42);
        assert_eq!(parsed["auto_compact_threshold"], 160_000);
    }

    #[test]
    fn test_save_constants_uses_atomic_write() {
        // Verify that save_constants writes to .tmp then renames.
        // We test this by saving and verifying no .tmp file remains.
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("constants.json");
        let tmp_path = path.with_extension("json.tmp");

        let snap = ConstantsSnapshot::default();
        save_constants_to(&snap, &path).unwrap();

        assert!(path.exists(), "constants.json should exist");
        assert!(!tmp_path.exists(), ".tmp file should be cleaned up after rename");

        // Verify content
        let loaded_json = std::fs::read_to_string(&path).unwrap();
        let loaded: ConstantsSnapshot = serde_json::from_str(&loaded_json).unwrap();
        assert_eq!(loaded.auto_compact_threshold, 160_000);
    }

    #[test]
    fn test_load_constants_returns_none_when_no_file() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("nonexistent.json");
        let result = load_constants_from(&path).unwrap();
        assert!(result.is_none());
    }

    #[test]
    fn test_load_constants_returns_err_on_invalid_json() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("constants.json");
        std::fs::write(&path, "not valid json!!!").unwrap();
        let result = load_constants_from(&path);
        assert!(result.is_err());
    }

    // ── list_sessions / load_session_by_prefix tests ──

    #[test]
    fn test_list_sessions_empty_dir() {
        let tmp = tempfile::tempdir().unwrap();
        let sessions = tmp.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();

        let list = list_sessions_in(&sessions).unwrap();
        assert!(list.is_empty());
    }

    #[test]
    fn test_list_sessions_returns_sorted_by_filename() {
        let tmp = tempfile::tempdir().unwrap();
        let sessions = tmp.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();

        // Create three sessions in non-chronological order
        let snaps = vec![
            ("2026-04-13T14:00:00+02:00", "model-b", "middle"),
            ("2026-04-13T09:00:00+02:00", "model-a", "oldest"),
            ("2026-04-13T20:00:00+02:00", "model-c", "newest"),
        ];
        for (started, model, text) in &snaps {
            let snap = SessionSnapshot {
                saved_at: started.to_string(),
                started_at: started.to_string(),
                model: model.to_string(),
                messages: vec![Message {
                    role: Role::User,
                    content: vec![ContentBlock::Text { text: text.to_string() }],
                }],
                system_prompt: vec![],
                constants: None, table_sorts: vec![], name: None, stats: None,
            };
            let path = sessions.join(session_filename_for(started));
            save_session_to(&snap, &path).unwrap();
        }

        let list = list_sessions_in(&sessions).unwrap();
        assert_eq!(list.len(), 3);
        // Should be sorted chronologically (oldest first)
        assert_eq!(list[0].model, "model-a");
        assert_eq!(list[1].model, "model-b");
        assert_eq!(list[2].model, "model-c");
    }

    #[test]
    fn test_list_sessions_contains_correct_metadata() {
        let tmp = tempfile::tempdir().unwrap();
        let sessions = tmp.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();

        let snap = SessionSnapshot {
            saved_at: "2026-04-13T15:30:00+02:00".into(),
            started_at: "2026-04-13T14:00:00+02:00".into(),
            model: "claude-sonnet-4-20250514".into(),
            messages: vec![
                Message { role: Role::User, content: vec![ContentBlock::Text { text: "q1".into() }] },
                Message { role: Role::Assistant, content: vec![ContentBlock::Text { text: "a1".into() }] },
                Message { role: Role::User, content: vec![ContentBlock::Text { text: "q2".into() }] },
            ],
            system_prompt: vec![],
            constants: None, table_sorts: vec![], name: None, stats: None,
        };
        let path = sessions.join(session_filename_for(&snap.started_at));
        save_session_to(&snap, &path).unwrap();

        let list = list_sessions_in(&sessions).unwrap();
        assert_eq!(list.len(), 1);
        let info = &list[0];
        assert_eq!(info.filename, "2026_04_13_14_00_00.json");
        assert_eq!(info.started_at, "2026-04-13T14:00:00+02:00");
        assert_eq!(info.saved_at, "2026-04-13T15:30:00+02:00");
        assert_eq!(info.model, "claude-sonnet-4-20250514");
        assert_eq!(info.message_count, 3);
    }

    #[test]
    fn test_list_sessions_skips_corrupt_files() {
        let tmp = tempfile::tempdir().unwrap();
        let sessions = tmp.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();

        // One valid session
        let snap = SessionSnapshot {
            saved_at: "2026-04-13T14:00:00+02:00".into(),
            started_at: "2026-04-13T14:00:00+02:00".into(),
            model: "good-model".into(),
            messages: vec![],
            system_prompt: vec![],
            constants: None, table_sorts: vec![], name: None, stats: None,
        };
        let path = sessions.join(session_filename_for(&snap.started_at));
        save_session_to(&snap, &path).unwrap();

        // One corrupt file
        std::fs::write(sessions.join("2026_04_13_10_00_00.json"), "NOT JSON!!!").unwrap();

        let list = list_sessions_in(&sessions).unwrap();
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].model, "good-model");
    }

    #[test]
    fn test_list_sessions_nonexistent_dir() {
        let tmp = tempfile::tempdir().unwrap();
        let nonexistent = tmp.path().join("does_not_exist");
        let list = list_sessions_in(&nonexistent).unwrap();
        assert!(list.is_empty());
    }

    fn make_info(saved_at: &str, model: &str) -> SessionInfo {
        SessionInfo {
            filename: format!("{}.json", saved_at.replace([':', '-', '+', 'T'], "_")),
            started_at: saved_at.into(),
            saved_at: saved_at.into(),
            model: model.into(),
            message_count: 0,
            path: PathBuf::from("/tmp/x.json"),
            name: None,
        }
    }

    #[test]
    fn test_sort_sessions_by_saved_desc_basic() {
        let mut v = vec![
            make_info("2026-04-13T10:00:00+02:00", "a"),
            make_info("2026-04-13T20:00:00+02:00", "c"),
            make_info("2026-04-13T15:00:00+02:00", "b"),
        ];
        sort_sessions_by_saved_desc(&mut v);
        assert_eq!(v[0].model, "c");
        assert_eq!(v[1].model, "b");
        assert_eq!(v[2].model, "a");
    }

    #[test]
    fn test_sort_sessions_by_saved_desc_falls_back_to_string_compare_for_unparseable() {
        let mut v = vec![
            make_info("zzz-bogus", "x"),
            make_info("2026-04-13T10:00:00+02:00", "a"),
        ];
        // Should not panic; parseable timestamps come out as "newer" than
        // unparseable ones (parseable get a real DateTime, unparseable are
        // sorted to the bottom).
        sort_sessions_by_saved_desc(&mut v);
        assert_eq!(v[0].model, "a");
        assert_eq!(v[1].model, "x");
    }

    #[test]
    fn test_sort_sessions_by_saved_desc_empty() {
        let mut v: Vec<SessionInfo> = vec![];
        sort_sessions_by_saved_desc(&mut v);
        assert!(v.is_empty());
    }

    #[test]
    fn test_sort_sessions_by_saved_desc_stable_for_equal_timestamps() {
        let mut v = vec![
            make_info("2026-04-13T10:00:00+02:00", "first"),
            make_info("2026-04-13T10:00:00+02:00", "second"),
        ];
        sort_sessions_by_saved_desc(&mut v);
        // sort_by is stable in Rust → input order preserved on equal keys
        assert_eq!(v[0].model, "first");
        assert_eq!(v[1].model, "second");
    }

    #[test]
    fn test_format_saved_at_human_rfc3339() {
        // Local timezone-aware formatting → assert structure, not exact text.
        let s = format_saved_at_human("2026-04-13T15:30:45+02:00");
        // Should contain the date (in some recognisable form) and time.
        assert!(s.contains("2026"), "expected year in: {s}");
        assert!(s.contains(":"), "expected time separator in: {s}");
    }

    #[test]
    fn test_format_saved_at_human_invalid_falls_back_to_raw() {
        let s = format_saved_at_human("not a timestamp");
        assert_eq!(s, "not a timestamp");
    }

    #[test]
    fn test_format_saved_at_human_empty() {
        let s = format_saved_at_human("");
        assert_eq!(s, "");
    }

    #[test]
    fn test_load_session_by_prefix_exact_match() {
        let tmp = tempfile::tempdir().unwrap();
        let sessions = tmp.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();

        let snap = SessionSnapshot {
            saved_at: "2026-04-13T15:00:00+02:00".into(),
            started_at: "2026-04-13T14:30:15+02:00".into(),
            model: "target-model".into(),
            messages: vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text { text: "hello".into() }],
            }],
            system_prompt: vec![],
            constants: None, table_sorts: vec![], name: None, stats: None,
        };
        let path = sessions.join(session_filename_for(&snap.started_at));
        save_session_to(&snap, &path).unwrap();

        // Exact match (full timestamp without .json)
        let loaded = load_session_by_prefix_in("2026_04_13_14_30_15", &sessions)
            .unwrap()
            .unwrap();
        assert_eq!(loaded.model, "target-model");
        assert_eq!(loaded.messages[0].text(), "hello");
    }

    #[test]
    fn test_load_session_by_prefix_date_only() {
        let tmp = tempfile::tempdir().unwrap();
        let sessions = tmp.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();

        let snap = SessionSnapshot {
            saved_at: "2026-04-13T15:00:00+02:00".into(),
            started_at: "2026-04-13T14:30:15+02:00".into(),
            model: "found-model".into(),
            messages: vec![],
            system_prompt: vec![],
            constants: None, table_sorts: vec![], name: None, stats: None,
        };
        let path = sessions.join(session_filename_for(&snap.started_at));
        save_session_to(&snap, &path).unwrap();

        // Date-only prefix
        let loaded = load_session_by_prefix_in("2026_04_13", &sessions)
            .unwrap()
            .unwrap();
        assert_eq!(loaded.model, "found-model");
    }

    #[test]
    fn test_load_session_by_prefix_partial_time() {
        let tmp = tempfile::tempdir().unwrap();
        let sessions = tmp.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();

        let snap = SessionSnapshot {
            saved_at: "2026-04-13T15:00:00+02:00".into(),
            started_at: "2026-04-13T14:30:15+02:00".into(),
            model: "partial-match".into(),
            messages: vec![],
            system_prompt: vec![],
            constants: None, table_sorts: vec![], name: None, stats: None,
        };
        let path = sessions.join(session_filename_for(&snap.started_at));
        save_session_to(&snap, &path).unwrap();

        // Partial time prefix
        let loaded = load_session_by_prefix_in("2026_04_13_14", &sessions)
            .unwrap()
            .unwrap();
        assert_eq!(loaded.model, "partial-match");
    }

    #[test]
    fn test_load_session_by_prefix_picks_most_recent_on_ambiguity() {
        let tmp = tempfile::tempdir().unwrap();
        let sessions = tmp.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();

        // Two sessions on the same day
        for (started, model) in &[
            ("2026-04-13T09:00:00+02:00", "morning"),
            ("2026-04-13T14:00:00+02:00", "afternoon"),
        ] {
            let snap = SessionSnapshot {
                saved_at: started.to_string(),
                started_at: started.to_string(),
                model: model.to_string(),
                messages: vec![],
                system_prompt: vec![],
                constants: None, table_sorts: vec![], name: None, stats: None,
            };
            let path = sessions.join(session_filename_for(started));
            save_session_to(&snap, &path).unwrap();
        }

        // Prefix matches both — should return the latest
        let loaded = load_session_by_prefix_in("2026_04_13", &sessions)
            .unwrap()
            .unwrap();
        assert_eq!(loaded.model, "afternoon");
    }

    #[test]
    fn test_load_session_by_prefix_no_match() {
        let tmp = tempfile::tempdir().unwrap();
        let sessions = tmp.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();

        let snap = SessionSnapshot {
            saved_at: "2026-04-13T14:00:00+02:00".into(),
            started_at: "2026-04-13T14:00:00+02:00".into(),
            model: "test".into(),
            messages: vec![],
            system_prompt: vec![],
            constants: None, table_sorts: vec![], name: None, stats: None,
        };
        let path = sessions.join(session_filename_for(&snap.started_at));
        save_session_to(&snap, &path).unwrap();

        // Non-matching prefix
        let result = load_session_by_prefix_in("2025_01", &sessions).unwrap();
        assert!(result.is_none());
    }

    #[test]
    fn test_load_session_by_prefix_empty_dir() {
        let tmp = tempfile::tempdir().unwrap();
        let sessions = tmp.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();

        let result = load_session_by_prefix_in("2026", &sessions).unwrap();
        assert!(result.is_none());
    }

    #[test]
    fn test_load_session_by_prefix_nonexistent_dir() {
        let tmp = tempfile::tempdir().unwrap();
        let nonexistent = tmp.path().join("nope");
        let result = load_session_by_prefix_in("2026", &nonexistent).unwrap();
        assert!(result.is_none());
    }

    #[test]
    fn test_table_sort_state_roundtrip() {
        let sorts = vec![
            TableSortState { block_index: 0, table_index: 0, sort_column: 1, sort_descending: false },
            TableSortState { block_index: 2, table_index: 1, sort_column: 0, sort_descending: true },
        ];
        let json = serde_json::to_string(&sorts).unwrap();
        let restored: Vec<TableSortState> = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.len(), 2);
        assert_eq!(restored[0].block_index, 0);
        assert_eq!(restored[0].sort_column, 1);
        assert!(!restored[0].sort_descending);
        assert_eq!(restored[1].block_index, 2);
        assert!(restored[1].sort_descending);
    }

    #[test]
    fn test_session_snapshot_table_sorts_default_empty() {
        // Old session files without table_sorts should deserialize with empty vec
        let json = r#"{
            "saved_at": "2026-01-01T00:00:00+00:00",
            "started_at": "2026-01-01T00:00:00+00:00",
            "model": "test",
            "messages": [],
            "system_prompt": []
        }"#;
        let snap: SessionSnapshot = serde_json::from_str(json).unwrap();
        assert!(snap.table_sorts.is_empty());
    }

    #[test]
    fn test_session_snapshot_with_table_sorts_roundtrip() {
        let snap = SessionSnapshot {
            saved_at: "2026-01-01T00:00:00+00:00".into(),
            started_at: "2026-01-01T00:00:00+00:00".into(),
            model: "test".into(),
            messages: vec![],
            system_prompt: vec![],
            constants: None,
            table_sorts: vec![
                TableSortState { block_index: 0, table_index: 0, sort_column: 2, sort_descending: true },
            ],
            name: None,
            stats: None,
        };
        let json = serde_json::to_string(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.table_sorts.len(), 1);
        assert_eq!(restored.table_sorts[0].sort_column, 2);
        assert!(restored.table_sorts[0].sort_descending);
    }

    #[test]
    fn test_session_snapshot_empty_table_sorts_not_serialized() {
        let snap = SessionSnapshot {
            saved_at: "2026-01-01T00:00:00+00:00".into(),
            started_at: "2026-01-01T00:00:00+00:00".into(),
            model: "test".into(),
            messages: vec![],
            system_prompt: vec![],
            constants: None,
            table_sorts: vec![], name: None, stats: None,
        };
        let json = serde_json::to_string(&snap).unwrap();
        assert!(!json.contains("table_sorts"), "Empty table_sorts should be skipped: {json}");
    }

    #[test]
    fn test_load_session_from_path() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("test.json");
        let snap = make_snapshot(vec![Message {
            role: Role::User,
            content: vec![ContentBlock::Text { text: "hello".into() }],
        }]);
        save_session_to(&snap, &path).unwrap();

        let loaded = load_session_from(&path).unwrap();
        assert_eq!(loaded.messages.len(), 1);
        assert_eq!(loaded.messages[0].text(), "hello");
    }

    #[test]
    fn test_load_session_from_nonexistent() {
        let result = load_session_from(std::path::Path::new("/nonexistent/path.json"));
        assert!(result.is_err());
    }

    #[test]
    fn test_session_preview_messages_filters_tools() {
        let messages = vec![
            Message {
                role: Role::User,
                content: vec![ContentBlock::Text { text: "Read my file".into() }],
            },
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::ToolUse {
                    id: "t1".into(),
                    name: "Read".into(),
                    input: serde_json::json!({}),
                }],
            },
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "t1".into(),
                    content: crate::ToolResultContent::Text("file contents".into()),
                    is_error: None,
                }],
            },
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::Text { text: "Here is the file".into() }],
            },
        ];
        let preview = session_preview_messages(&messages, 100);
        assert_eq!(preview.len(), 2);
        assert_eq!(preview[0], ("You", "Read my file".to_string()));
        assert_eq!(preview[1], ("Assistant", "Here is the file".to_string()));
    }

    #[test]
    fn test_session_preview_messages_truncates() {
        let messages = vec![Message {
            role: Role::User,
            content: vec![ContentBlock::Text { text: "a".repeat(200).into() }],
        }];
        let preview = session_preview_messages(&messages, 50);
        assert_eq!(preview.len(), 1);
        assert!(preview[0].1.ends_with('…'));
        assert_eq!(preview[0].1.chars().count(), 51); // 50 + …
    }

    #[test]
    fn test_session_preview_messages_collapses_newlines() {
        let messages = vec![Message {
            role: Role::User,
            content: vec![ContentBlock::Text { text: "line1\nline2\nline3".into() }],
        }];
        let preview = session_preview_messages(&messages, 100);
        assert_eq!(preview[0].1, "line1 line2 line3");
    }

    fn make_named(dir: &std::path::Path, started: &str, name: Option<&str>) {
        let mut snap = make_snapshot(vec![]);
        snap.started_at = started.into();
        snap.saved_at = started.into();
        snap.name = name.map(|s| s.to_string());
        let path = dir.join(session_filename_for(started));
        save_session_to(&snap, &path).unwrap();
    }

    #[test]
    fn test_load_session_by_name_finds_match() {
        let tmp = tempfile::tempdir().unwrap();
        make_named(tmp.path(), "2026-01-01T10:00:00+00:00", Some("ein test"));
        make_named(tmp.path(), "2026-01-02T10:00:00+00:00", Some("other"));
        let loaded = load_session_by_name_in(tmp.path(), "ein test").unwrap();
        assert!(loaded.is_some());
        assert_eq!(loaded.unwrap().name.as_deref(), Some("ein test"));
    }

    #[test]
    fn test_load_session_by_name_returns_none_for_no_match() {
        let tmp = tempfile::tempdir().unwrap();
        make_named(tmp.path(), "2026-01-01T10:00:00+00:00", Some("foo"));
        let loaded = load_session_by_name_in(tmp.path(), "bar").unwrap();
        assert!(loaded.is_none());
    }

    #[test]
    fn test_load_session_by_name_handles_unnamed() {
        let tmp = tempfile::tempdir().unwrap();
        make_named(tmp.path(), "2026-01-01T10:00:00+00:00", None);
        let loaded = load_session_by_name_in(tmp.path(), "anything").unwrap();
        assert!(loaded.is_none());
    }

    #[test]
    fn test_load_session_by_name_with_spaces_preserved() {
        let tmp = tempfile::tempdir().unwrap();
        make_named(tmp.path(), "2026-01-01T10:00:00+00:00", Some("ein test mit spaces"));
        let loaded = load_session_by_name_in(tmp.path(), "ein test mit spaces").unwrap();
        assert!(loaded.is_some(), "must match exact string with spaces (not kebab-case)");
    }

    #[test]
    fn test_load_session_by_name_does_not_match_kebab_variant() {
        let tmp = tempfile::tempdir().unwrap();
        make_named(tmp.path(), "2026-01-01T10:00:00+00:00", Some("ein test"));
        let loaded = load_session_by_name_in(tmp.path(), "ein-test").unwrap();
        assert!(loaded.is_none(), "spaces must NOT be matched against hyphens");
    }

    #[test]
    fn test_session_name_exists_true() {
        let tmp = tempfile::tempdir().unwrap();
        make_named(tmp.path(), "2026-01-01T10:00:00+00:00", Some("foo"));
        assert!(session_name_exists_in(tmp.path(), "foo", None).unwrap());
    }

    #[test]
    fn test_session_name_exists_false() {
        let tmp = tempfile::tempdir().unwrap();
        make_named(tmp.path(), "2026-01-01T10:00:00+00:00", Some("foo"));
        assert!(!session_name_exists_in(tmp.path(), "bar", None).unwrap());
    }

    #[test]
    fn test_session_name_exists_excludes_path() {
        let tmp = tempfile::tempdir().unwrap();
        make_named(tmp.path(), "2026-01-01T10:00:00+00:00", Some("mine"));
        let my_path = tmp.path().join(session_filename_for("2026-01-01T10:00:00+00:00"));
        // Excluding own path → not a duplicate
        assert!(!session_name_exists_in(tmp.path(), "mine", Some(&my_path)).unwrap());
    }

    #[test]
    fn test_session_name_exists_with_other_session_having_same_name() {
        let tmp = tempfile::tempdir().unwrap();
        make_named(tmp.path(), "2026-01-01T10:00:00+00:00", Some("dup"));
        make_named(tmp.path(), "2026-01-02T10:00:00+00:00", Some("dup"));
        let path1 = tmp.path().join(session_filename_for("2026-01-01T10:00:00+00:00"));
        // Excluding the FIRST should still find the SECOND with same name
        assert!(session_name_exists_in(tmp.path(), "dup", Some(&path1)).unwrap());
    }

    // ── SessionStats: cumulative counters that survive resume ──────────

    #[test]
    fn test_session_stats_default_is_all_zero() {
        let stats = SessionStats::default();
        assert_eq!(stats.turn_count, 0);
        assert_eq!(stats.request_count, 0);
        assert_eq!(stats.total_input_tokens, 0);
        assert_eq!(stats.total_output_tokens, 0);
        assert_eq!(stats.last_input_tokens, 0);
        assert_eq!(stats.last_output_tokens, 0);
        assert_eq!(stats.last_cache_tokens, 0);
    }

    #[test]
    fn test_session_stats_serde_roundtrip() {
        let stats = SessionStats {
            turn_count: 7,
            request_count: 9,
            total_input_tokens: 12_345,
            total_output_tokens: 6_789,
            last_input_tokens: 1_500,
            last_output_tokens: 200,
            last_cache_tokens: 800,
        };
        let json = serde_json::to_string(&stats).unwrap();
        let restored: SessionStats = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.turn_count, 7);
        assert_eq!(restored.request_count, 9);
        assert_eq!(restored.total_input_tokens, 12_345);
        assert_eq!(restored.total_output_tokens, 6_789);
        assert_eq!(restored.last_input_tokens, 1_500);
        assert_eq!(restored.last_output_tokens, 200);
        assert_eq!(restored.last_cache_tokens, 800);
    }

    #[test]
    fn test_session_snapshot_default_stats_is_none() {
        // A snapshot without explicit stats must serialize/deserialize cleanly.
        let snap = make_snapshot(vec![]);
        assert!(snap.stats.is_none());
        let json = serde_json::to_string(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();
        assert!(restored.stats.is_none());
    }

    #[test]
    fn test_session_snapshot_with_stats_roundtrip() {
        let mut snap = make_snapshot(vec![]);
        snap.stats = Some(SessionStats {
            turn_count: 3,
            request_count: 5,
            total_input_tokens: 100,
            total_output_tokens: 50,
            last_input_tokens: 30,
            last_output_tokens: 10,
            last_cache_tokens: 20,
        });
        let json = serde_json::to_string(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();
        let s = restored.stats.expect("stats must roundtrip");
        assert_eq!(s.turn_count, 3);
        assert_eq!(s.request_count, 5);
        assert_eq!(s.total_input_tokens, 100);
        assert_eq!(s.total_output_tokens, 50);
        assert_eq!(s.last_input_tokens, 30);
        assert_eq!(s.last_output_tokens, 10);
        assert_eq!(s.last_cache_tokens, 20);
    }

    #[test]
    fn test_session_snapshot_legacy_json_without_stats_loads_cleanly() {
        // Old session files (pre-stats) must still deserialize without errors.
        // The stats field defaults to None.
        let legacy_json = r#"{
            "saved_at": "2026-04-04T12:00:00Z",
            "started_at": "2026-04-04T11:00:00Z",
            "model": "old-model",
            "messages": [],
            "system_prompt": []
        }"#;
        let snap: SessionSnapshot = serde_json::from_str(legacy_json)
            .expect("legacy snapshot without stats must load");
        assert!(snap.stats.is_none());
        assert_eq!(snap.model, "old-model");
    }

    #[test]
    fn test_session_snapshot_skips_stats_when_none() {
        // When stats is None, the JSON output must not contain the field —
        // keeps old session files small and avoids noise in diffs.
        let snap = make_snapshot(vec![]);
        let json = serde_json::to_string(&snap).unwrap();
        assert!(
            !json.contains("\"stats\""),
            "stats field must be omitted when None, got: {json}"
        );
    }

    #[test]
    fn test_build_snapshot_passes_stats() {
        let state = make_state(vec![], "m");
        let stats = SessionStats {
            turn_count: 2,
            request_count: 3,
            total_input_tokens: 1000,
            total_output_tokens: 500,
            last_input_tokens: 300,
            last_output_tokens: 100,
            last_cache_tokens: 50,
        };
        let snap = build_snapshot(
            &state,
            "2026-04-18T10:00:00+02:00",
            vec![],
            None,
            None,
            Some(stats.clone()),
        );
        let s = snap.stats.expect("stats must be set");
        assert_eq!(s.turn_count, 2);
        assert_eq!(s.request_count, 3);
        assert_eq!(s.total_input_tokens, 1000);
        assert_eq!(s.total_output_tokens, 500);
        assert_eq!(s.last_cache_tokens, 50);
    }

    #[test]
    fn test_build_snapshot_without_stats_is_none() {
        let state = make_state(vec![], "m");
        let snap = build_snapshot(
            &state,
            "2026-04-18T10:00:00+02:00",
            vec![],
            None,
            None,
            None,
        );
        assert!(snap.stats.is_none());
    }
}
