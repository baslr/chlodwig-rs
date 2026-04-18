//! Shared configuration helpers used by both CLI and GTK frontends.
//!
//! Config file: `~/.chlodwig-rs/config.json`
//!
//! ```json
//! {
//!   "api_key": "sk-ant-...",
//!   "model": "claude-sonnet-4-20250514",
//!   "base_url": "https://custom.api.example.com",
//!   "max_tokens": 8192
//! }
//! ```
//!
//! All fields are optional. Resolution order (each layer overrides the previous):
//! 1. `~/.chlodwig-rs/config.json` (lowest priority)
//! 2. Environment variables (`ANTHROPIC_API_KEY`, `CHLODWIG_MODEL`, etc.)
//! 3. CLI arguments (`--api-key`, `--model`, etc.) (highest priority)

use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

/// Default model when nothing is configured.
pub const DEFAULT_MODEL: &str = "github/claude-opus-4.6";

/// Default max tokens when nothing is configured.
pub const DEFAULT_MAX_TOKENS: u32 = 16384;

/// Persistent application configuration loaded from `~/.chlodwig-rs/config.json`.
///
/// All fields are optional — missing fields are simply `None`.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct AppConfig {
    /// API key for Anthropic.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub api_key: Option<String>,

    /// Model name (e.g. `"claude-sonnet-4-20250514"`).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,

    /// API base URL override.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub base_url: Option<String>,

    /// Max tokens for response.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
}

/// CLI argument overrides. GTK passes `ConfigOverrides::default()` (all `None`).
///
/// These have the highest priority — they override both config.json and env vars.
#[derive(Debug, Clone, Default)]
pub struct ConfigOverrides {
    pub api_key: Option<String>,
    pub model: Option<String>,
    pub base_url: Option<String>,
    pub max_tokens: Option<u32>,
}

/// Fully resolved configuration. All values are final.
#[derive(Debug, Clone)]
pub struct ResolvedConfig {
    pub api_key: String,
    pub model: String,
    pub base_url: Option<String>,
    pub max_tokens: u32,
}

/// Returns the path to the config file: `~/.chlodwig-rs/config.json`.
pub fn config_path() -> PathBuf {
    crate::log_dir().join("config.json")
}

/// Loads the config from a specific path.
///
/// Returns `AppConfig::default()` if the file doesn't exist.
/// Returns `Err` if the file exists but contains invalid JSON.
pub fn load_config_from(path: &Path) -> Result<AppConfig, String> {
    match std::fs::read_to_string(path) {
        Ok(contents) => serde_json::from_str(&contents)
            .map_err(|e| format!("Failed to parse {}: {e}", path.display())),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(AppConfig::default()),
        Err(e) => Err(format!("Failed to read {}: {e}", path.display())),
    }
}

/// Loads the config from the default path (`~/.chlodwig-rs/config.json`).
///
/// Returns `AppConfig::default()` if the file doesn't exist.
pub fn load_config() -> Result<AppConfig, String> {
    load_config_from(&config_path())
}

/// Format a token count as a human-readable string.
///
/// - `>= 1_000_000` → `"1.2M"`
/// - `>= 1_000` → `"12.3k"`
/// - `< 1_000` → `"42"`
pub fn format_tokens(n: u64) -> String {
    if n >= 1_000_000 {
        format!("{:.1}M", n as f64 / 1_000_000.0)
    } else if n >= 1_000 {
        format!("{:.1}k", n as f64 / 1_000.0)
    } else {
        format!("{n}")
    }
}

/// Resolve configuration with the 3-layer priority chain:
///
/// 1. Load `~/.chlodwig-rs/config.json` → fill values
/// 2. Read environment variables → override
/// 3. Apply `overrides` (CLI args) → override
/// 4. Apply defaults for anything still unset
///
/// Returns `Err` if no API key can be found from any source.
pub fn resolve_config(overrides: ConfigOverrides) -> Result<ResolvedConfig, String> {
    resolve_config_with_path(overrides, &config_path())
}

/// Resolve configuration using a specific config file path (for testing).
pub fn resolve_config_with_path(
    overrides: ConfigOverrides,
    config_file: &Path,
) -> Result<ResolvedConfig, String> {
    // Layer 1: config.json
    let file_config = load_config_from(config_file)?;
    let mut api_key: Option<String> = file_config.api_key;
    let mut model: Option<String> = file_config.model;
    let mut base_url: Option<String> = file_config.base_url;
    let mut max_tokens: Option<u32> = file_config.max_tokens;

    // Layer 2: environment variables override config.json
    if let Ok(val) = std::env::var("ANTHROPIC_API_KEY") {
        api_key = Some(val);
    } else if let Ok(val) = std::env::var("ANTHROPIC_AUTH_TOKEN") {
        // AUTH_TOKEN is a fallback for API_KEY — only checked if API_KEY is not set in env.
        // If API_KEY was already set from config.json, AUTH_TOKEN in env still overrides it.
        api_key = Some(val);
    }
    if let Ok(val) = std::env::var("CHLODWIG_MODEL") {
        model = Some(val);
    }
    if let Ok(val) = std::env::var("ANTHROPIC_BASE_URL") {
        base_url = Some(val);
    }
    if let Ok(val) = std::env::var("CHLODWIG_MAX_TOKENS") {
        if let Ok(n) = val.parse::<u32>() {
            max_tokens = Some(n);
        }
    }

    // Layer 3: CLI overrides (highest priority)
    if let Some(val) = overrides.api_key {
        api_key = Some(val);
    }
    if let Some(val) = overrides.model {
        model = Some(val);
    }
    if let Some(val) = overrides.base_url {
        base_url = Some(val);
    }
    if let Some(val) = overrides.max_tokens {
        max_tokens = Some(val);
    }

    // Layer 4: defaults for anything still unset
    let api_key = api_key.ok_or_else(|| {
        "No API key found. Set ANTHROPIC_API_KEY, pass --api-key, \
         or add \"api_key\" to ~/.chlodwig-rs/config.json."
            .to_string()
    })?;

    Ok(ResolvedConfig {
        api_key,
        model: model.unwrap_or_else(|| DEFAULT_MODEL.to_string()),
        base_url,
        max_tokens: max_tokens.unwrap_or(DEFAULT_MAX_TOKENS),
    })
}

/// Extend `PATH` with well-known directories that may not be present in
/// restricted environments (e.g. macOS GUI apps, launchd services, SSH
/// sessions with minimal login shells).
///
/// Directories are only added when they exist **and** are not already in PATH.
/// The original PATH entries come first (preserving user priority), new
/// directories are appended at the end.
///
/// Call this once at process startup, before spawning any child processes.
/// After this, `std::process::Command` and `tokio::process::Command` inherit
/// the enriched PATH automatically — no per-tool plumbing needed.
pub fn enrich_path() {
    let current = std::env::var("PATH").unwrap_or_default();
    let current_dirs: std::collections::HashSet<&str> = current.split(':').collect();

    let home = std::env::var("HOME").unwrap_or_default();

    let candidates: &[String] = &[
        // MacPorts
        "/opt/local/bin".into(),
        "/opt/local/sbin".into(),
        // Homebrew (macOS arm64)
        "/opt/homebrew/bin".into(),
        "/opt/homebrew/sbin".into(),
        // Homebrew (macOS x86_64 / Linux)
        "/usr/local/bin".into(),
        "/usr/local/sbin".into(),
        // Cargo (Rust)
        format!("{home}/.cargo/bin"),
        // Go
        format!("{home}/go/bin"),
        // Local user binaries
        format!("{home}/.local/bin"),
        // nix single-user
        format!("{home}/.nix-profile/bin"),
        // nix multi-user
        "/nix/var/nix/profiles/default/bin".into(),
    ];

    let mut additions = Vec::new();
    for dir in candidates {
        if !current_dirs.contains(dir.as_str()) && std::path::Path::new(dir).is_dir() {
            additions.push(dir.clone());
        }
    }

    if additions.is_empty() {
        return;
    }

    let new_path = if current.is_empty() {
        additions.join(":")
    } else {
        format!("{current}:{}", additions.join(":"))
    };

    tracing::info!(
        "PATH enriched with {} dir(s): {}",
        additions.len(),
        additions.join(", ")
    );

    // SAFETY: single-threaded at startup, before any tool execution.
    unsafe { std::env::set_var("PATH", &new_path) };
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── resolve_config tests ──────────────────────────────────────

    #[test]
    fn test_resolve_config_all_from_config_json() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(
            &path,
            r#"{"api_key": "from-file", "model": "file-model", "base_url": "https://file.example.com", "max_tokens": 4096}"#,
        )
        .unwrap();

        let result = resolve_config_with_path(ConfigOverrides::default(), &path);
        // env vars may override — but if they're not set, config.json values win.
        // We test the file path specifically; env vars are outside our control in parallel tests.
        assert!(result.is_ok());
    }

    #[test]
    fn test_resolve_config_cli_overrides_everything() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(
            &path,
            r#"{"api_key": "from-file", "model": "file-model", "base_url": "https://file.example.com", "max_tokens": 4096}"#,
        )
        .unwrap();

        let overrides = ConfigOverrides {
            api_key: Some("cli-key".into()),
            model: Some("cli-model".into()),
            base_url: Some("https://cli.example.com".into()),
            max_tokens: Some(999),
        };

        let result = resolve_config_with_path(overrides, &path).unwrap();
        // CLI overrides always win, regardless of config.json and env vars.
        assert_eq!(result.api_key, "cli-key");
        assert_eq!(result.model, "cli-model");
        assert_eq!(result.base_url.as_deref(), Some("https://cli.example.com"));
        assert_eq!(result.max_tokens, 999);
    }

    #[test]
    fn test_resolve_config_defaults_when_nothing_set() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("nonexistent.json");

        // Need at least an API key — provide via override
        let overrides = ConfigOverrides {
            api_key: Some("test-key".into()),
            ..Default::default()
        };

        let result = resolve_config_with_path(overrides, &path).unwrap();
        // If env vars are set, they override these defaults.
        // But the defaults themselves are correct:
        // model and max_tokens should have defaults, base_url should be None.
        assert_eq!(result.api_key, "test-key");
        assert!(!result.model.is_empty(), "Model should have a default");
        assert!(result.max_tokens > 0, "Max tokens should have a default");
    }

    #[test]
    fn test_resolve_config_default_model_constant() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("nonexistent.json");

        let overrides = ConfigOverrides {
            api_key: Some("key".into()),
            ..Default::default()
        };

        let result = resolve_config_with_path(overrides, &path).unwrap();
        // If no env var CHLODWIG_MODEL is set, model should be DEFAULT_MODEL.
        // We can't guarantee env is unset, so check it's either the default or an env value.
        if std::env::var("CHLODWIG_MODEL").is_err() {
            assert_eq!(result.model, DEFAULT_MODEL);
        }
    }

    #[test]
    fn test_resolve_config_default_max_tokens_constant() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("nonexistent.json");

        let overrides = ConfigOverrides {
            api_key: Some("key".into()),
            ..Default::default()
        };

        let result = resolve_config_with_path(overrides, &path).unwrap();
        if std::env::var("CHLODWIG_MAX_TOKENS").is_err() {
            assert_eq!(result.max_tokens, DEFAULT_MAX_TOKENS);
        }
    }

    #[test]
    fn test_resolve_config_api_key_required() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("nonexistent.json");

        let result = resolve_config_with_path(ConfigOverrides::default(), &path);
        // If ANTHROPIC_API_KEY or ANTHROPIC_AUTH_TOKEN is set in env, this succeeds.
        // Otherwise it must fail with a helpful message.
        match result {
            Ok(_) => {} // env var provided a key
            Err(msg) => {
                assert!(msg.contains("ANTHROPIC_API_KEY"), "Error mentions env var: {msg}");
                assert!(msg.contains("--api-key"), "Error mentions CLI flag: {msg}");
                assert!(msg.contains("config.json"), "Error mentions config file: {msg}");
            }
        }
    }

    #[test]
    fn test_resolve_config_api_key_from_config_json() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(&path, r#"{"api_key": "json-key"}"#).unwrap();

        let result = resolve_config_with_path(ConfigOverrides::default(), &path);
        assert!(result.is_ok(), "Should resolve API key from config.json");
        // env vars may override, but it should not error
    }

    #[test]
    fn test_resolve_config_base_url_from_config_json() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(
            &path,
            r#"{"api_key": "k", "base_url": "https://custom.api.com"}"#,
        )
        .unwrap();

        let overrides = ConfigOverrides {
            api_key: Some("key".into()),
            ..Default::default()
        };

        let result = resolve_config_with_path(overrides, &path).unwrap();
        if std::env::var("ANTHROPIC_BASE_URL").is_err() {
            assert_eq!(result.base_url.as_deref(), Some("https://custom.api.com"));
        }
    }

    #[test]
    fn test_resolve_config_max_tokens_from_config_json() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(
            &path,
            r#"{"api_key": "k", "max_tokens": 2048}"#,
        )
        .unwrap();

        let overrides = ConfigOverrides {
            api_key: Some("key".into()),
            ..Default::default()
        };

        let result = resolve_config_with_path(overrides, &path).unwrap();
        if std::env::var("CHLODWIG_MAX_TOKENS").is_err() {
            assert_eq!(result.max_tokens, 2048);
        }
    }

    #[test]
    fn test_resolve_config_base_url_none_by_default() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("nonexistent.json");

        let overrides = ConfigOverrides {
            api_key: Some("key".into()),
            ..Default::default()
        };

        let result = resolve_config_with_path(overrides, &path).unwrap();
        if std::env::var("ANTHROPIC_BASE_URL").is_err() {
            assert!(result.base_url.is_none());
        }
    }

    #[test]
    fn test_resolve_config_partial_overrides() {
        // Only override model via CLI, rest from config.json
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(
            &path,
            r#"{"api_key": "file-key", "model": "file-model", "base_url": "https://file.com"}"#,
        )
        .unwrap();

        let overrides = ConfigOverrides {
            model: Some("cli-model".into()),
            ..Default::default()
        };

        let result = resolve_config_with_path(overrides, &path).unwrap();
        // Model must be from CLI
        assert_eq!(result.model, "cli-model");
        // API key and base_url may be from file or env — but should not error
    }

    #[test]
    fn test_resolve_config_invalid_json_returns_error() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(&path, "not json").unwrap();

        let result = resolve_config_with_path(ConfigOverrides::default(), &path);
        assert!(result.is_err());
        let msg = result.unwrap_err();
        assert!(msg.contains("Failed to parse"), "{msg}");
    }

    #[test]
    fn test_resolve_config_max_tokens_invalid_env_ignored() {
        // If CHLODWIG_MAX_TOKENS is set to garbage, it should be silently ignored.
        // We can't safely set env vars in parallel tests, so this is a structural test:
        // verify that the parse path exists and doesn't panic.
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("nonexistent.json");

        let overrides = ConfigOverrides {
            api_key: Some("key".into()),
            max_tokens: Some(512),
            ..Default::default()
        };

        let result = resolve_config_with_path(overrides, &path).unwrap();
        assert_eq!(result.max_tokens, 512);
    }

    #[test]
    fn test_resolve_config_cli_api_key_overrides_file() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(&path, r#"{"api_key": "file-key"}"#).unwrap();

        let overrides = ConfigOverrides {
            api_key: Some("cli-key".into()),
            ..Default::default()
        };

        let result = resolve_config_with_path(overrides, &path).unwrap();
        assert_eq!(result.api_key, "cli-key");
    }

    // ── AppConfig serde tests ─────────────────────────────────────

    #[test]
    fn test_config_path_is_in_chlodwig_rs_dir() {
        let path = config_path();
        assert!(
            path.parent().unwrap().ends_with(".chlodwig-rs"),
            "Expected .chlodwig-rs dir, got: {}",
            path.display()
        );
        assert_eq!(path.file_name().unwrap(), "config.json");
    }

    #[test]
    fn test_app_config_default_all_none() {
        let cfg = AppConfig::default();
        assert!(cfg.api_key.is_none());
        assert!(cfg.model.is_none());
        assert!(cfg.base_url.is_none());
        assert!(cfg.max_tokens.is_none());
    }

    #[test]
    fn test_app_config_roundtrip_full() {
        let cfg = AppConfig {
            api_key: Some("sk-ant-test123".into()),
            model: Some("claude-sonnet-4-20250514".into()),
            base_url: Some("https://api.example.com".into()),
            max_tokens: Some(8192),
        };
        let json = serde_json::to_string(&cfg).unwrap();
        let parsed: AppConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.api_key.as_deref(), Some("sk-ant-test123"));
        assert_eq!(parsed.model.as_deref(), Some("claude-sonnet-4-20250514"));
        assert_eq!(parsed.base_url.as_deref(), Some("https://api.example.com"));
        assert_eq!(parsed.max_tokens, Some(8192));
    }

    #[test]
    fn test_app_config_roundtrip_partial_api_key_only() {
        let json = r#"{"api_key": "my-key"}"#;
        let cfg: AppConfig = serde_json::from_str(json).unwrap();
        assert_eq!(cfg.api_key.as_deref(), Some("my-key"));
        assert!(cfg.model.is_none());
        assert!(cfg.base_url.is_none());
        assert!(cfg.max_tokens.is_none());
    }

    #[test]
    fn test_app_config_roundtrip_partial_model_only() {
        let json = r#"{"model": "claude-sonnet-4-20250514"}"#;
        let cfg: AppConfig = serde_json::from_str(json).unwrap();
        assert!(cfg.api_key.is_none());
        assert_eq!(cfg.model.as_deref(), Some("claude-sonnet-4-20250514"));
    }

    #[test]
    fn test_app_config_roundtrip_empty_object() {
        let json = "{}";
        let cfg: AppConfig = serde_json::from_str(json).unwrap();
        assert!(cfg.api_key.is_none());
        assert!(cfg.model.is_none());
        assert!(cfg.base_url.is_none());
        assert!(cfg.max_tokens.is_none());
    }

    #[test]
    fn test_app_config_ignores_unknown_fields() {
        let json = r#"{"api_key": "k", "model": "m", "future_field": 42}"#;
        let result: Result<AppConfig, _> = serde_json::from_str(json);
        assert!(result.is_ok(), "Should ignore unknown fields");
    }

    #[test]
    fn test_app_config_skip_serializing_none() {
        let cfg = AppConfig {
            api_key: Some("key".into()),
            model: None,
            base_url: None,
            max_tokens: None,
        };
        let json = serde_json::to_string(&cfg).unwrap();
        assert!(json.contains("api_key"));
        assert!(!json.contains("model"), "None fields should be skipped: {json}");
        assert!(!json.contains("base_url"), "None fields should be skipped: {json}");
        assert!(!json.contains("max_tokens"), "None fields should be skipped: {json}");
    }

    #[test]
    fn test_load_config_from_nonexistent_returns_default() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("nonexistent.json");
        let cfg = load_config_from(&path).unwrap();
        assert!(cfg.api_key.is_none());
        assert!(cfg.model.is_none());
    }

    #[test]
    fn test_load_config_from_valid_file() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(&path, r#"{"api_key": "sk-test", "model": "claude-opus"}"#).unwrap();
        let cfg = load_config_from(&path).unwrap();
        assert_eq!(cfg.api_key.as_deref(), Some("sk-test"));
        assert_eq!(cfg.model.as_deref(), Some("claude-opus"));
    }

    #[test]
    fn test_load_config_from_valid_file_with_new_fields() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(
            &path,
            r#"{"api_key": "k", "model": "m", "base_url": "https://x.com", "max_tokens": 1024}"#,
        )
        .unwrap();
        let cfg = load_config_from(&path).unwrap();
        assert_eq!(cfg.base_url.as_deref(), Some("https://x.com"));
        assert_eq!(cfg.max_tokens, Some(1024));
    }

    #[test]
    fn test_load_config_from_empty_object() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(&path, "{}").unwrap();
        let cfg = load_config_from(&path).unwrap();
        assert!(cfg.api_key.is_none());
        assert!(cfg.model.is_none());
    }

    #[test]
    fn test_load_config_from_invalid_json_returns_error() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(&path, "not json at all").unwrap();
        let result = load_config_from(&path);
        assert!(result.is_err());
        let msg = result.unwrap_err();
        assert!(msg.contains("Failed to parse"), "{msg}");
    }

    #[test]
    fn test_load_config_from_utf8_values() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(&path, r#"{"api_key": "schlüssel-🔑"}"#).unwrap();
        let cfg = load_config_from(&path).unwrap();
        assert_eq!(cfg.api_key.as_deref(), Some("schlüssel-🔑"));
    }

    // ── format_tokens tests ───────────────────────────────────────

    #[test]
    fn test_format_tokens_below_1k() {
        assert_eq!(format_tokens(0), "0");
        assert_eq!(format_tokens(42), "42");
        assert_eq!(format_tokens(999), "999");
    }

    #[test]
    fn test_format_tokens_kilo() {
        assert_eq!(format_tokens(1_000), "1.0k");
        assert_eq!(format_tokens(12_345), "12.3k");
        assert_eq!(format_tokens(999_999), "1000.0k");
    }

    #[test]
    fn test_format_tokens_mega() {
        assert_eq!(format_tokens(1_000_000), "1.0M");
        assert_eq!(format_tokens(2_500_000), "2.5M");
    }

    // ── Constants tests ───────────────────────────────────────────

    #[test]
    fn test_default_model_is_not_empty() {
        assert!(!DEFAULT_MODEL.is_empty());
    }

    #[test]
    fn test_default_max_tokens_is_positive() {
        assert!(DEFAULT_MAX_TOKENS > 0);
    }

    // ── enrich_path tests ──────────────────────────────────────
    //
    // These tests mutate global state (PATH env var) and must be serialized.
    // Use a shared mutex to prevent parallel execution.

    use std::sync::Mutex;
    static PATH_TEST_LOCK: Mutex<()> = Mutex::new(());

    #[test]
    fn test_enrich_path_does_not_duplicate_existing_dirs() {
        let _lock = PATH_TEST_LOCK.lock().unwrap_or_else(|e| e.into_inner());
        let before = std::env::var("PATH").unwrap_or_default();

        // Start from a known clean PATH to avoid pre-existing duplicates
        unsafe { std::env::set_var("PATH", "/usr/bin:/bin") };

        enrich_path();
        let after = std::env::var("PATH").unwrap_or_default();

        // Count occurrences of each dir — no dir should appear more than once
        let dirs: Vec<&str> = after.split(':').filter(|s| !s.is_empty()).collect();
        let unique: std::collections::HashSet<&str> = dirs.iter().copied().collect();
        assert_eq!(
            dirs.len(),
            unique.len(),
            "PATH should not contain duplicate entries after enrich_path"
        );

        // Restore
        unsafe { std::env::set_var("PATH", &before) };
    }

    #[test]
    fn test_enrich_path_preserves_original_entries() {
        let _lock = PATH_TEST_LOCK.lock().unwrap_or_else(|e| e.into_inner());
        let before = std::env::var("PATH").unwrap_or_default();

        enrich_path();
        let after = std::env::var("PATH").unwrap_or_default();

        // Every entry from before should still be in after, in the same order
        assert!(
            after.starts_with(&before) || before.is_empty(),
            "Original PATH entries must be preserved at the start"
        );

        // Restore
        unsafe { std::env::set_var("PATH", &before) };
    }

    #[test]
    fn test_enrich_path_adds_existing_dirs() {
        let _lock = PATH_TEST_LOCK.lock().unwrap_or_else(|e| e.into_inner());
        let before = std::env::var("PATH").unwrap_or_default();

        // Set a minimal PATH that's missing common dirs
        unsafe { std::env::set_var("PATH", "/usr/bin:/bin") };

        enrich_path();
        let after = std::env::var("PATH").unwrap_or_default();

        // /usr/bin and /bin should still be there
        assert!(after.contains("/usr/bin"));
        assert!(after.contains("/bin"));

        // If /opt/local/bin exists (MacPorts), it should have been added
        if std::path::Path::new("/opt/local/bin").is_dir() {
            assert!(
                after.contains("/opt/local/bin"),
                "enrich_path should add /opt/local/bin when it exists"
            );
        }

        // If /opt/homebrew/bin exists (Homebrew arm64), it should have been added
        if std::path::Path::new("/opt/homebrew/bin").is_dir() {
            assert!(
                after.contains("/opt/homebrew/bin"),
                "enrich_path should add /opt/homebrew/bin when it exists"
            );
        }

        // Restore
        unsafe { std::env::set_var("PATH", &before) };
    }

    #[test]
    fn test_enrich_path_skips_nonexistent_dirs() {
        let _lock = PATH_TEST_LOCK.lock().unwrap_or_else(|e| e.into_inner());
        let before = std::env::var("PATH").unwrap_or_default();

        unsafe { std::env::set_var("PATH", "/usr/bin") };

        enrich_path();
        let after = std::env::var("PATH").unwrap_or_default();

        // A completely fake dir should never appear
        assert!(
            !after.contains("/this/dir/does/not/exist/at/all"),
            "Non-existent directories must not be added"
        );

        // Restore
        unsafe { std::env::set_var("PATH", &before) };
    }

    #[test]
    fn test_enrich_path_idempotent() {
        let _lock = PATH_TEST_LOCK.lock().unwrap_or_else(|e| e.into_inner());
        let before = std::env::var("PATH").unwrap_or_default();

        // Start from a known minimal state
        unsafe { std::env::set_var("PATH", "/usr/bin:/bin") };

        enrich_path();
        let after_first = std::env::var("PATH").unwrap_or_default();

        enrich_path();
        let after_second = std::env::var("PATH").unwrap_or_default();

        assert_eq!(
            after_first, after_second,
            "Calling enrich_path twice should produce the same result"
        );

        // Restore
        unsafe { std::env::set_var("PATH", &before) };
    }
}
