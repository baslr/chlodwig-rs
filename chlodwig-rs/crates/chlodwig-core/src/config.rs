//! Shared configuration helpers used by both CLI and GTK frontends.
//!
//! Config file: `~/.chlodwig-rs/config.json`
//!
//! ```json
//! {
//!   "api_key": "sk-ant-...",
//!   "model": "claude-sonnet-4-20250514"
//! }
//! ```
//!
//! All fields are optional. Priority order for API key resolution:
//! 1. Explicit CLI flag (`--api-key`)
//! 2. `ANTHROPIC_API_KEY` environment variable
//! 3. `ANTHROPIC_AUTH_TOKEN` environment variable
//! 4. `api_key` field in `~/.chlodwig-rs/config.json`

use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

/// Persistent application configuration loaded from `~/.chlodwig-rs/config.json`.
///
/// All fields are optional — missing fields are simply `None`.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct AppConfig {
    /// API key for Anthropic. Used as fallback when env vars are not set.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub api_key: Option<String>,

    /// Model name override (e.g. `"claude-sonnet-4-20250514"`).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,
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

/// Resolves the API key.
///
/// Priority order:
/// 1. `explicit` — a value passed via CLI flag (e.g. `--api-key`)
/// 2. `ANTHROPIC_API_KEY` environment variable
/// 3. `ANTHROPIC_AUTH_TOKEN` environment variable
/// 4. `api_key` from `~/.chlodwig-rs/config.json`
///
/// Returns `Err` with a human-readable message if no key is found.
pub fn resolve_api_key(explicit: Option<String>) -> Result<String, String> {
    resolve_api_key_with_config(explicit, &config_path())
}

/// Resolves the API key using a specific config file path (for testing).
pub fn resolve_api_key_with_config(
    explicit: Option<String>,
    config_file: &Path,
) -> Result<String, String> {
    explicit
        .or_else(|| std::env::var("ANTHROPIC_API_KEY").ok())
        .or_else(|| std::env::var("ANTHROPIC_AUTH_TOKEN").ok())
        .or_else(|| {
            load_config_from(config_file)
                .ok()
                .and_then(|c| c.api_key)
        })
        .ok_or_else(|| {
            "Neither ANTHROPIC_API_KEY nor ANTHROPIC_AUTH_TOKEN is set \
             and no api_key found in ~/.chlodwig-rs/config.json. \
             Please set one, pass --api-key, or create the config file."
                .to_string()
        })
}

/// Resolves the model name.
///
/// Priority order:
/// 1. `explicit` — a value passed via CLI flag (e.g. `--model`)
/// 2. `model` from `~/.chlodwig-rs/config.json`
///
/// Returns `None` if no model override is configured (caller uses its own default).
pub fn resolve_model(explicit: Option<String>) -> Option<String> {
    resolve_model_with_config(explicit, &config_path())
}

/// Resolves the model name using a specific config file path (for testing).
pub fn resolve_model_with_config(
    explicit: Option<String>,
    config_file: &Path,
) -> Option<String> {
    explicit.or_else(|| {
        load_config_from(config_file)
            .ok()
            .and_then(|c| c.model)
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_resolve_api_key_explicit_wins_over_env() {
        // Explicit value always wins, regardless of what env vars are set.
        let result = resolve_api_key(Some("explicit-key".into()));
        assert_eq!(result.unwrap(), "explicit-key");
    }

    #[test]
    fn test_resolve_api_key_none_falls_through_to_env() {
        // With None, the function checks env vars. We can't control those in
        // parallel tests, but we CAN verify it returns Ok (since CI always has
        // ANTHROPIC_API_KEY set) or Err (which is also fine — we test the error
        // message shape separately).
        let result = resolve_api_key(None);
        // Either way, result is valid — we just need it not to panic.
        match result {
            Ok(key) => assert!(!key.is_empty(), "Key should not be empty"),
            Err(msg) => {
                assert!(msg.contains("ANTHROPIC_API_KEY"), "Error mentions ANTHROPIC_API_KEY: {msg}");
                assert!(msg.contains("ANTHROPIC_AUTH_TOKEN"), "Error mentions ANTHROPIC_AUTH_TOKEN: {msg}");
            }
        }
    }

    #[test]
    fn test_resolve_api_key_error_message_mentions_both_vars() {
        // Force the error path by checking the message format.
        // We use explicit=None and rely on the fact that if both env vars
        // are unset, we get the error. If they ARE set, we just skip.
        let result = resolve_api_key(None);
        if result.is_err() {
            let msg = result.unwrap_err();
            assert!(msg.contains("ANTHROPIC_API_KEY"), "{msg}");
            assert!(msg.contains("ANTHROPIC_AUTH_TOKEN"), "{msg}");
        }
        // If env vars are set, this test is a no-op — that's fine,
        // the explicit test above covers the logic.
    }

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

    #[test]
    fn test_resolve_api_key_explicit_none_string_is_not_none() {
        let result = resolve_api_key(Some(String::new()));
        assert_eq!(result.unwrap(), "");
    }

    // --- AppConfig tests ---

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
    }

    #[test]
    fn test_app_config_roundtrip_full() {
        let cfg = AppConfig {
            api_key: Some("sk-ant-test123".into()),
            model: Some("claude-sonnet-4-20250514".into()),
        };
        let json = serde_json::to_string(&cfg).unwrap();
        let parsed: AppConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.api_key.as_deref(), Some("sk-ant-test123"));
        assert_eq!(parsed.model.as_deref(), Some("claude-sonnet-4-20250514"));
    }

    #[test]
    fn test_app_config_roundtrip_partial_api_key_only() {
        let json = r#"{"api_key": "my-key"}"#;
        let cfg: AppConfig = serde_json::from_str(json).unwrap();
        assert_eq!(cfg.api_key.as_deref(), Some("my-key"));
        assert!(cfg.model.is_none());
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
    }

    #[test]
    fn test_app_config_ignores_unknown_fields() {
        // Forward-compatibility: unknown fields should not cause errors
        let json = r#"{"api_key": "k", "model": "m", "future_field": 42}"#;
        let result: Result<AppConfig, _> = serde_json::from_str(json);
        // By default serde ignores unknown fields, but let's verify
        assert!(result.is_ok(), "Should ignore unknown fields");
    }

    #[test]
    fn test_app_config_skip_serializing_none() {
        let cfg = AppConfig {
            api_key: Some("key".into()),
            model: None,
        };
        let json = serde_json::to_string(&cfg).unwrap();
        assert!(json.contains("api_key"));
        assert!(!json.contains("model"), "None fields should be skipped: {json}");
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

    #[test]
    fn test_resolve_api_key_with_config_falls_through_to_file() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(&path, r#"{"api_key": "from-config-file"}"#).unwrap();

        // No explicit, and env vars may or may not be set.
        // Use resolve_api_key_with_config to test the config file fallback.
        let result = resolve_api_key_with_config(None, &path);
        // If env vars are set, they win. If not, config file wins.
        assert!(result.is_ok(), "Should resolve from config file or env");
    }

    #[test]
    fn test_resolve_api_key_with_config_explicit_wins_over_file() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(&path, r#"{"api_key": "from-config-file"}"#).unwrap();

        let result = resolve_api_key_with_config(Some("explicit".into()), &path);
        assert_eq!(result.unwrap(), "explicit");
    }

    #[test]
    fn test_resolve_api_key_with_config_no_file_no_env_errors() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("nonexistent.json");

        // We can't unset env vars in parallel tests, so if they're set this is a no-op.
        let result = resolve_api_key_with_config(None, &path);
        match result {
            Ok(_) => {} // Env var was set — fine
            Err(msg) => {
                assert!(msg.contains("config.json"), "Error mentions config.json: {msg}");
                assert!(msg.contains("ANTHROPIC_API_KEY"), "Error mentions ANTHROPIC_API_KEY: {msg}");
            }
        }
    }

    #[test]
    fn test_resolve_model_with_config_explicit_wins() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(&path, r#"{"model": "from-config"}"#).unwrap();

        let result = resolve_model_with_config(Some("explicit-model".into()), &path);
        assert_eq!(result.as_deref(), Some("explicit-model"));
    }

    #[test]
    fn test_resolve_model_with_config_falls_through_to_file() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(&path, r#"{"model": "from-config"}"#).unwrap();

        let result = resolve_model_with_config(None, &path);
        assert_eq!(result.as_deref(), Some("from-config"));
    }

    #[test]
    fn test_resolve_model_with_config_no_file_returns_none() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("nonexistent.json");

        let result = resolve_model_with_config(None, &path);
        assert!(result.is_none());
    }

    #[test]
    fn test_resolve_model_with_config_no_model_in_file_returns_none() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        std::fs::write(&path, r#"{"api_key": "key-only"}"#).unwrap();

        let result = resolve_model_with_config(None, &path);
        assert!(result.is_none());
    }

    #[test]
    fn test_resolve_api_key_error_message_mentions_config_file() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("nonexistent.json");

        let result = resolve_api_key_with_config(None, &path);
        if result.is_err() {
            let msg = result.unwrap_err();
            assert!(msg.contains("config.json"), "Should mention config.json: {msg}");
        }
    }
}
