//! Anthropic API client implementation.

use async_stream::stream;
use bytes::Bytes;
use chlodwig_core::{ApiClient, ApiError, ApiRequest, SseEvent, SseStream};
use futures::{Stream, StreamExt};
use reqwest;
use std::time::Duration;

/// Concrete Anthropic API client.
pub struct AnthropicClient {
    http: reqwest::Client,
    api_key: String,
    base_url: String,
}

impl AnthropicClient {
    pub fn new(api_key: String) -> Self {
        Self {
            http: reqwest::Client::new(),
            api_key,
            base_url: "https://api.anthropic.com".into(),
        }
    }

    pub fn with_base_url(mut self, url: String) -> Self {
        self.base_url = url;
        self
    }
}

#[async_trait::async_trait]
impl ApiClient for AnthropicClient {
    async fn stream_message(&self, request: ApiRequest) -> Result<SseStream, ApiError> {
        let response = self
            .http
            .post(format!("{}/v1/messages", self.base_url))
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", "2023-06-01")
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| ApiError::Connection(e.to_string()))?;

        let status = response.status().as_u16();

        if status == 429 {
            let retry_after = response
                .headers()
                .get("retry-after")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.parse::<u64>().ok())
                .unwrap_or(1);
            return Err(ApiError::RateLimited {
                retry_after_ms: retry_after * 1000,
            });
        }

        if status == 529 {
            return Err(ApiError::Overloaded("API overloaded".into()));
        }

        if status >= 400 {
            let body = response.text().await.unwrap_or_default();
            return Err(ApiError::HttpError { status, body });
        }

        let byte_stream = response.bytes_stream();
        let sse_stream = parse_sse_stream(byte_stream);
        Ok(Box::pin(sse_stream))
    }
}

/// Parse a raw byte stream into typed SSE events.
/// Handles the SSE wire format: "event: <type>\ndata: <json>\n\n"
fn parse_sse_stream(
    byte_stream: impl Stream<Item = Result<Bytes, reqwest::Error>> + Send + 'static,
) -> impl Stream<Item = Result<(String, SseEvent), ApiError>> + Send {
    stream! {
        let mut buffer = String::new();
        let mut _current_event_type = String::new();

        tokio::pin!(byte_stream);

        while let Some(chunk) = byte_stream.next().await {
            let chunk = match chunk {
                Ok(c) => c,
                Err(e) => {
                    yield Err(ApiError::Connection(e.to_string()));
                    return;
                }
            };
            buffer.push_str(&String::from_utf8_lossy(&chunk));

            // Process complete SSE messages (double newline delimited)
            while let Some(pos) = buffer.find("\n\n") {
                let message = buffer[..pos].to_string();
                buffer = buffer[pos + 2..].to_string();

                let mut data_line = None;

                for line in message.lines() {
                    if let Some(event_type) = line.strip_prefix("event: ") {
                        _current_event_type = event_type.trim().to_string();
                    } else if let Some(data) = line.strip_prefix("data: ") {
                        data_line = Some(data.trim().to_string());
                    }
                }

                if let Some(data) = data_line {
                    if !data.is_empty() && data != "[DONE]" {
                        let raw = data.clone();
                        match serde_json::from_str::<SseEvent>(&data) {
                            Ok(event) => yield Ok((raw, event)),
                            Err(e) => {
                                tracing::debug!("SSE event type: '{}', raw data: {}", _current_event_type, &data[..data.len().min(500)]);
                                tracing::warn!("SSE parse error: {} for data: {}", e, &data[..data.len().min(200)]);
                            }
                        }
                    }
                }
            }
        }
    }
}

/// Retry wrapper for transient API errors.
pub async fn stream_with_retry(
    client: &dyn ApiClient,
    request: ApiRequest,
    max_retries: u32,
) -> Result<SseStream, ApiError> {
    let mut attempt = 0;
    loop {
        match client.stream_message(request.clone()).await {
            Ok(stream) => return Ok(stream),
            Err(ApiError::RateLimited { retry_after_ms }) if attempt < max_retries => {
                tracing::warn!("Rate limited, retrying after {}ms (attempt {})", retry_after_ms, attempt + 1);
                tokio::time::sleep(Duration::from_millis(retry_after_ms)).await;
                attempt += 1;
            }
            Err(ApiError::Overloaded(_)) if attempt < max_retries => {
                let backoff = Duration::from_secs(2u64.pow(attempt));
                tracing::warn!("API overloaded, retrying after {:?} (attempt {})", backoff, attempt + 1);
                tokio::time::sleep(backoff).await;
                attempt += 1;
            }
            Err(e) => return Err(e),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chlodwig_core::*;
    use futures::StreamExt;

    #[tokio::test]
    async fn test_parse_text_delta() {
        let raw = "event: content_block_delta\ndata: {\"type\":\"content_block_delta\",\"index\":0,\"delta\":{\"type\":\"text_delta\",\"text\":\"Hello\"}}\n\n";

        let byte_stream =
            futures::stream::once(async move { Ok::<_, reqwest::Error>(Bytes::from(raw)) });

        let events: Vec<_> = parse_sse_stream(byte_stream).collect().await;

        assert_eq!(events.len(), 1);
        match &events[0] {
            Ok((raw_data, SseEvent::ContentBlockDelta {
                delta: Delta::TextDelta { text },
                ..
            })) => {
                assert_eq!(text, "Hello");
                assert!(raw_data.contains("content_block_delta"), "raw should contain event data");
            }
            other => panic!("Unexpected: {other:?}"),
        }
    }

    #[tokio::test]
    async fn test_parse_split_chunks() {
        // SSE message split across two byte chunks
        let chunk1 = "event: content_block_delta\nda";
        let chunk2 = "ta: {\"type\":\"content_block_delta\",\"index\":0,\"delta\":{\"type\":\"text_delta\",\"text\":\"Hi\"}}\n\n";

        let byte_stream = futures::stream::iter(vec![
            Ok(Bytes::from(chunk1)),
            Ok(Bytes::from(chunk2)),
        ]);

        let events: Vec<_> = parse_sse_stream(byte_stream).collect().await;

        assert_eq!(events.len(), 1);
        match &events[0] {
            Ok((_raw, SseEvent::ContentBlockDelta {
                delta: Delta::TextDelta { text },
                ..
            })) => assert_eq!(text, "Hi"),
            other => panic!("Unexpected: {other:?}"),
        }
    }

    #[tokio::test]
    async fn test_parse_multiple_events() {
        let raw = concat!(
            "event: message_start\n",
            "data: {\"type\":\"message_start\",\"message\":{\"id\":\"msg_1\",\"model\":\"test\",\"usage\":{\"input_tokens\":10,\"output_tokens\":0}}}\n\n",
            "event: content_block_start\n",
            "data: {\"type\":\"content_block_start\",\"index\":0,\"content_block\":{\"type\":\"text\"}}\n\n",
            "event: content_block_delta\n",
            "data: {\"type\":\"content_block_delta\",\"index\":0,\"delta\":{\"type\":\"text_delta\",\"text\":\"Hi\"}}\n\n",
            "event: content_block_stop\n",
            "data: {\"type\":\"content_block_stop\",\"index\":0}\n\n",
            "event: message_delta\n",
            "data: {\"type\":\"message_delta\",\"delta\":{\"stop_reason\":\"end_turn\"},\"usage\":{\"output_tokens\":1}}\n\n",
            "event: message_stop\n",
            "data: {\"type\":\"message_stop\"}\n\n",
        );

        let byte_stream =
            futures::stream::once(async move { Ok::<_, reqwest::Error>(Bytes::from(raw)) });

        let events: Vec<_> = parse_sse_stream(byte_stream)
            .collect::<Vec<_>>()
            .await
            .into_iter()
            .filter_map(|r| r.ok())
            .collect();

        assert_eq!(events.len(), 6);
        assert!(matches!(events[0], (_, SseEvent::MessageStart { .. })));
        assert!(matches!(events[1], (_, SseEvent::ContentBlockStart { .. })));
        assert!(matches!(events[2], (_, SseEvent::ContentBlockDelta { .. })));
        assert!(matches!(events[3], (_, SseEvent::ContentBlockStop { .. })));
        assert!(matches!(events[4], (_, SseEvent::MessageDelta { .. })));
        assert!(matches!(events[5], (_, SseEvent::MessageStop)));
    }
}
