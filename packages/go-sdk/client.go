// Package wusul provides a Go SDK for the Wusul API
package wusul

import (
	"fmt"
	"time"
)

// Client is the main Wusul SDK client
type Client struct {
	http *HTTPClient

	// AccessPasses provides methods for managing access passes
	AccessPasses *AccessPasses

	// Console provides methods for managing card templates (Enterprise only)
	Console *Console
}

// NewClient creates a new Wusul client instance
//
// Example:
//
//	accountID := os.Getenv("WUSUL_ACCOUNT_ID")
//	sharedSecret := os.Getenv("WUSUL_SHARED_SECRET")
//
//	client := wusul.NewClient(accountID, sharedSecret, nil)
//
//	// Issue an access pass
//	accessPass, err := client.AccessPasses.Issue(wusul.IssueAccessPassParams{
//	    CardTemplateID:  "template_123",
//	    FullName:        "John Doe",
//	    Email:           "john@example.com",
//	    CardNumber:      "12345",
//	    StartDate:       "2025-11-01T00:00:00Z",
//	    ExpirationDate:  "2026-11-01T00:00:00Z",
//	})
func NewClient(accountID, sharedSecret string, config *Config) (*Client, error) {
	if accountID == "" || sharedSecret == "" {
		return nil, fmt.Errorf("accountId and sharedSecret are required")
	}

	baseURL := "https://api.wusul.io"
	timeout := 30 * time.Second

	if config != nil {
		if config.BaseURL != "" {
			baseURL = config.BaseURL
		}
		if config.Timeout > 0 {
			timeout = config.Timeout
		}
	}

	httpClient := NewHTTPClient(accountID, sharedSecret, baseURL, timeout)

	return &Client{
		http:         httpClient,
		AccessPasses: newAccessPasses(httpClient),
		Console:      newConsole(httpClient),
	}, nil
}

// Health performs a health check to verify API connectivity
func (c *Client) Health() (map[string]interface{}, error) {
	var result map[string]interface{}
	err := c.http.Get("/health", nil, &result)
	if err != nil {
		return nil, err
	}
	return result, nil
}
