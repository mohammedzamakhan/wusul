use thiserror::Error;

/// Result type for Wusul SDK operations
pub type Result<T> = std::result::Result<T, WusulError>;

/// Errors that can occur when using the Wusul SDK
#[derive(Error, Debug)]
pub enum WusulError {
    /// HTTP request failed
    #[error("HTTP request failed: {0}")]
    HttpError(#[from] reqwest::Error),

    /// API returned an error response
    #[error("API error: {status} - {message}")]
    ApiError { status: u16, message: String },

    /// Failed to serialize/deserialize data
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),

    /// Invalid configuration
    #[error("Configuration error: {0}")]
    ConfigError(String),

    /// Authentication failed
    #[error("Authentication error: {0}")]
    AuthError(String),

    /// Invalid parameter provided
    #[error("Invalid parameter: {0}")]
    InvalidParameter(String),

    /// Resource not found
    #[error("Resource not found: {0}")]
    NotFound(String),

    /// Rate limit exceeded
    #[error("Rate limit exceeded")]
    RateLimitExceeded,

    /// Timeout error
    #[error("Request timeout")]
    Timeout,
}
