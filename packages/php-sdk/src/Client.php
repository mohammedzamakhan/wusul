<?php

namespace Wusul;

use Wusul\Resources\AccessPasses;
use Wusul\Resources\Console;

/**
 * Main Wusul SDK client
 *
 * @example
 * ```php
 * use Wusul\Client;
 *
 * $accountId = getenv('WUSUL_ACCOUNT_ID');
 * $sharedSecret = getenv('WUSUL_SHARED_SECRET');
 *
 * $client = new Client($accountId, $sharedSecret);
 *
 * // Issue an access pass
 * $accessPass = $client->accessPasses->issue([
 *     'cardTemplateId' => 'template_123',
 *     'fullName' => 'John Doe',
 *     'email' => 'john@example.com',
 *     'cardNumber' => '12345',
 *     'startDate' => '2025-11-01T00:00:00Z',
 *     'expirationDate' => '2026-11-01T00:00:00Z'
 * ]);
 * ```
 */
class Client
{
    private HttpClient $http;

    /**
     * Access passes resource for managing access passes
     */
    public AccessPasses $accessPasses;

    /**
     * Console resource for managing card templates (Enterprise only)
     */
    public Console $console;

    /**
     * Creates a new Wusul client instance
     *
     * @param string $accountId Your Wusul account ID (X-ACCT-ID)
     * @param string $sharedSecret Your Wusul shared secret for signing requests
     * @param array $options Optional configuration
     *                       - baseUrl: Base URL for the Wusul API (default: https://api.wusul.io)
     *                       - timeout: Request timeout in seconds (default: 30)
     *
     * @throws \InvalidArgumentException If accountId or sharedSecret is empty
     *
     * @example
     * ```php
     * // Using environment variables
     * $client = new Client(
     *     getenv('WUSUL_ACCOUNT_ID'),
     *     getenv('WUSUL_SHARED_SECRET')
     * );
     *
     * // With custom configuration
     * $client = new Client(
     *     $accountId,
     *     $sharedSecret,
     *     [
     *         'baseUrl' => 'https://api.wusul.io',
     *         'timeout' => 60
     *     ]
     * );
     * ```
     */
    public function __construct(string $accountId, string $sharedSecret, array $options = [])
    {
        if (empty($accountId) || empty($sharedSecret)) {
            throw new \InvalidArgumentException('accountId and sharedSecret are required');
        }

        $baseUrl = $options['baseUrl'] ?? 'https://api.wusul.io';
        $timeout = $options['timeout'] ?? 30;

        $this->http = new HttpClient($accountId, $sharedSecret, $baseUrl, $timeout);
        $this->accessPasses = new AccessPasses($this->http);
        $this->console = new Console($this->http);
    }

    /**
     * Health check to verify API connectivity
     *
     * @return mixed Health status information
     * @throws \Exception
     */
    public function health()
    {
        return $this->http->get('/health');
    }
}
