package io.wusul.sdk;

import io.wusul.sdk.http.HttpClient;
import io.wusul.sdk.resources.AccessPasses;
import io.wusul.sdk.resources.Console;

import java.io.IOException;

/**
 * Main Wusul SDK client.
 * <p>
 * Example usage:
 * <pre>{@code
 * String accountId = System.getenv("WUSUL_ACCOUNT_ID");
 * String sharedSecret = System.getenv("WUSUL_SHARED_SECRET");
 *
 * Wusul client = new Wusul(accountId, sharedSecret);
 *
 * // Issue an access pass
 * IssueAccessPassParams params = new IssueAccessPassParams(
 *     "template_123",
 *     "12345",
 *     "John Doe",
 *     "2025-11-01T00:00:00Z",
 *     "2026-11-01T00:00:00Z"
 * );
 * params.setEmail("john@example.com");
 *
 * AccessPass accessPass = client.accessPasses.issue(params);
 * System.out.println("Access pass URL: " + accessPass.getUrl());
 * }</pre>
 */
public class Wusul {
    private static final String DEFAULT_BASE_URL = "https://api.wusul.io";
    private static final long DEFAULT_TIMEOUT = 30000; // 30 seconds

    private final HttpClient http;

    /**
     * Access passes resource for managing access passes.
     */
    public final AccessPasses accessPasses;

    /**
     * Console resource for managing card templates (Enterprise only).
     */
    public final Console console;

    /**
     * Creates a new Wusul client instance with default configuration.
     *
     * @param accountId Your Wusul account ID (X-ACCT-ID)
     * @param sharedSecret Your Wusul shared secret for signing requests
     * @throws IllegalArgumentException if accountId or sharedSecret is null or empty
     */
    public Wusul(String accountId, String sharedSecret) {
        this(accountId, sharedSecret, DEFAULT_BASE_URL, DEFAULT_TIMEOUT);
    }

    /**
     * Creates a new Wusul client instance with custom configuration.
     *
     * @param accountId Your Wusul account ID (X-ACCT-ID)
     * @param sharedSecret Your Wusul shared secret for signing requests
     * @param baseUrl Base URL for the Wusul API
     * @param timeout Request timeout in milliseconds
     * @throws IllegalArgumentException if accountId or sharedSecret is null or empty
     */
    public Wusul(String accountId, String sharedSecret, String baseUrl, long timeout) {
        if (accountId == null || accountId.trim().isEmpty()) {
            throw new IllegalArgumentException("accountId is required");
        }
        if (sharedSecret == null || sharedSecret.trim().isEmpty()) {
            throw new IllegalArgumentException("sharedSecret is required");
        }

        this.http = new HttpClient(accountId, sharedSecret, baseUrl, timeout);
        this.accessPasses = new AccessPasses(this.http);
        this.console = new Console(this.http);
    }

    /**
     * Health check to verify API connectivity.
     *
     * @return Health status information
     * @throws IOException if the request fails
     */
    public Object health() throws IOException {
        return this.http.get("/health", null, Object.class);
    }
}
