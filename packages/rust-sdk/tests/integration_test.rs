use wusul::{Wusul, WusulConfig};
use std::time::Duration;

#[test]
fn test_client_initialization() {
    let client = Wusul::new("test_account".to_string(), "test_secret".to_string());
    assert!(client.is_ok());
}

#[test]
fn test_client_with_custom_config() {
    let config = WusulConfig::new("account".to_string(), "secret".to_string())
        .with_base_url("https://api.test.wusul.io".to_string())
        .with_timeout(Duration::from_secs(45));

    let client = Wusul::with_config(config);
    assert!(client.is_ok());
}

#[test]
fn test_client_validation_empty_account_id() {
    let result = Wusul::new("".to_string(), "secret".to_string());
    assert!(result.is_err());
}

#[test]
fn test_client_validation_empty_secret() {
    let result = Wusul::new("account".to_string(), "".to_string());
    assert!(result.is_err());
}

#[test]
fn test_config_defaults() {
    let config = WusulConfig::new("account".to_string(), "secret".to_string());
    assert_eq!(config.base_url, "https://api.wusul.io");
    assert_eq!(config.timeout, Duration::from_secs(30));
}
