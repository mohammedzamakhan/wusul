//! # Wusul Rust SDK
//!
//! Official Rust SDK for the Wusul digital access control platform.
//!
//! ## Features
//!
//! - Manage digital access passes for Apple Wallet and Google Wallet
//! - Create and manage card templates (Enterprise tier)
//! - Full async/await support with tokio
//! - Type-safe API with comprehensive error handling
//! - Automatic request authentication
//!
//! ## Installation
//!
//! Add this to your `Cargo.toml`:
//!
//! ```toml
//! [dependencies]
//! wusul = "1.0"
//! tokio = { version = "1", features = ["full"] }
//! ```
//!
//! ## Quick Start
//!
//! ```no_run
//! use wusul::{Wusul, types::IssueAccessPassParams};
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     // Initialize the client
//!     let client = Wusul::new(
//!         "your_account_id".to_string(),
//!         "your_shared_secret".to_string()
//!     )?;
//!
//!     // Issue a new access pass
//!     let params = IssueAccessPassParams {
//!         card_template_id: "template_123".to_string(),
//!         full_name: "John Doe".to_string(),
//!         start_date: "2024-01-01".to_string(),
//!         expiration_date: "2024-12-31".to_string(),
//!         email: Some("john@example.com".to_string()),
//!         ..Default::default()
//!     };
//!
//!     let access_pass = client.access_passes.issue(params).await?;
//!     println!("Created access pass: {}", access_pass.id);
//!
//!     // List all access passes
//!     let passes = client.access_passes.list(None).await?;
//!     println!("Total passes: {}", passes.len());
//!
//!     Ok(())
//! }
//! ```
//!
//! ## Configuration
//!
//! You can customize the client configuration:
//!
//! ```no_run
//! use wusul::{Wusul, WusulConfig};
//! use std::time::Duration;
//!
//! # fn example() -> Result<(), Box<dyn std::error::Error>> {
//! let config = WusulConfig::new(
//!     "account_id".to_string(),
//!     "shared_secret".to_string()
//! )
//! .with_base_url("https://api.staging.wusul.io".to_string())
//! .with_timeout(Duration::from_secs(60));
//!
//! let client = Wusul::with_config(config)?;
//! # Ok(())
//! # }
//! ```

pub mod auth;
pub mod error;
pub mod http_client;
pub mod resources;
pub mod types;

use error::{Result, WusulError};
use http_client::HttpClient;
use resources::{AccessPasses, Console};
use std::sync::Arc;
pub use types::WusulConfig;

/// Main client for interacting with the Wusul API
///
/// The client provides access to all Wusul API resources through
/// its field properties:
///
/// - `access_passes` - Manage digital access passes
/// - `console` - Manage card templates and view event logs (Enterprise tier)
///
/// # Example
///
/// ```no_run
/// use wusul::Wusul;
///
/// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
/// let client = Wusul::new(
///     "your_account_id".to_string(),
///     "your_shared_secret".to_string()
/// )?;
///
/// // Check API health
/// let health = client.health().await?;
/// println!("API Status: {:?}", health);
/// # Ok(())
/// # }
/// ```
pub struct Wusul {
    http: Arc<HttpClient>,
    /// Resource for managing access passes
    pub access_passes: AccessPasses,
    /// Resource for console operations (Enterprise tier)
    pub console: Console,
}

impl Wusul {
    /// Create a new Wusul client with default configuration
    ///
    /// # Arguments
    ///
    /// * `account_id` - Your Wusul account ID
    /// * `shared_secret` - Your Wusul shared secret for authentication
    ///
    /// # Errors
    ///
    /// Returns an error if:
    /// - Account ID or shared secret is empty
    /// - HTTP client cannot be initialized
    ///
    /// # Example
    ///
    /// ```no_run
    /// use wusul::Wusul;
    ///
    /// # fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = Wusul::new(
    ///     "your_account_id".to_string(),
    ///     "your_shared_secret".to_string()
    /// )?;
    /// # Ok(())
    /// # }
    /// ```
    pub fn new(account_id: String, shared_secret: String) -> Result<Self> {
        let config = WusulConfig::new(account_id, shared_secret);
        Self::with_config(config)
    }

    /// Create a new Wusul client with custom configuration
    ///
    /// # Arguments
    ///
    /// * `config` - Custom configuration for the client
    ///
    /// # Errors
    ///
    /// Returns an error if:
    /// - Account ID or shared secret is empty
    /// - HTTP client cannot be initialized
    ///
    /// # Example
    ///
    /// ```no_run
    /// use wusul::{Wusul, WusulConfig};
    /// use std::time::Duration;
    ///
    /// # fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let config = WusulConfig::new(
    ///     "account_id".to_string(),
    ///     "shared_secret".to_string()
    /// )
    /// .with_base_url("https://api.staging.wusul.io".to_string())
    /// .with_timeout(Duration::from_secs(60));
    ///
    /// let client = Wusul::with_config(config)?;
    /// # Ok(())
    /// # }
    /// ```
    pub fn with_config(config: WusulConfig) -> Result<Self> {
        // Validate configuration
        if config.account_id.is_empty() {
            return Err(WusulError::ConfigError(
                "Account ID is required".to_string(),
            ));
        }

        if config.shared_secret.is_empty() {
            return Err(WusulError::ConfigError(
                "Shared secret is required".to_string(),
            ));
        }

        // Create HTTP client
        let http = Arc::new(HttpClient::new(
            config.account_id,
            config.shared_secret,
            config.base_url,
            config.timeout,
        )?);

        // Initialize resources
        let access_passes = AccessPasses::new(Arc::clone(&http));
        let console = Console::new(Arc::clone(&http));

        Ok(Self {
            http,
            access_passes,
            console,
        })
    }

    /// Check the health status of the Wusul API
    ///
    /// # Example
    ///
    /// ```no_run
    /// use wusul::Wusul;
    ///
    /// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = Wusul::new(
    ///     "account_id".to_string(),
    ///     "shared_secret".to_string()
    /// )?;
    ///
    /// let health = client.health().await?;
    /// println!("API Status: {:?}", health);
    /// # Ok(())
    /// # }
    /// ```
    pub async fn health(&self) -> Result<serde_json::Value> {
        self.http.get("/health", None).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_client_creation() {
        let client = Wusul::new("test_account".to_string(), "test_secret".to_string());
        assert!(client.is_ok());
    }

    #[test]
    fn test_client_empty_account_id() {
        let client = Wusul::new("".to_string(), "test_secret".to_string());
        assert!(client.is_err());

        if let Err(WusulError::ConfigError(msg)) = client {
            assert!(msg.contains("Account ID"));
        } else {
            panic!("Expected ConfigError");
        }
    }

    #[test]
    fn test_client_empty_shared_secret() {
        let client = Wusul::new("test_account".to_string(), "".to_string());
        assert!(client.is_err());

        if let Err(WusulError::ConfigError(msg)) = client {
            assert!(msg.contains("Shared secret"));
        } else {
            panic!("Expected ConfigError");
        }
    }

    #[test]
    fn test_client_with_custom_config() {
        let config = WusulConfig::new("test_account".to_string(), "test_secret".to_string())
            .with_base_url("https://api.staging.wusul.io".to_string())
            .with_timeout(std::time::Duration::from_secs(60));

        let client = Wusul::with_config(config);
        assert!(client.is_ok());
    }

    #[test]
    fn test_config_builder() {
        let config = WusulConfig::new("account".to_string(), "secret".to_string())
            .with_base_url("https://custom.api".to_string())
            .with_timeout(std::time::Duration::from_secs(45));

        assert_eq!(config.account_id, "account");
        assert_eq!(config.shared_secret, "secret");
        assert_eq!(config.base_url, "https://custom.api");
        assert_eq!(config.timeout, std::time::Duration::from_secs(45));
    }
}
