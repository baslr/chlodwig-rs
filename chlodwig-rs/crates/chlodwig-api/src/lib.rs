//! Chlodwig API — HTTP clients with SSE streaming.
//!
//! Two implementations of [`chlodwig_core::ApiClient`]:
//! - [`AnthropicClient`] — native Anthropic Messages API
//! - [`OpenAiClient`] — OpenAI-compatible `/v1/chat/completions`
//!   (works with OpenAI, Azure, 9router, ollama, etc.)

pub mod client;
pub mod openai;

pub use client::AnthropicClient;
pub use openai::OpenAiClient;

use std::sync::Arc;

/// Create the appropriate [`ApiClient`] based on the resolved configuration.
pub fn create_client(config: &chlodwig_core::ResolvedConfig) -> Arc<dyn chlodwig_core::ApiClient> {
    match config.api_format {
        chlodwig_core::ApiFormat::Anthropic => {
            let mut c = AnthropicClient::new(config.api_key.clone());
            if let Some(ref url) = config.base_url {
                c = c.with_base_url(url.clone());
            }
            Arc::new(c)
        }
        chlodwig_core::ApiFormat::Openai => {
            let mut c = OpenAiClient::new(config.api_key.clone());
            if let Some(ref url) = config.base_url {
                c = c.with_base_url(url.clone());
            }
            Arc::new(c)
        }
    }
}
