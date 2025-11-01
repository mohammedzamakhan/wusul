import { HttpClient } from './http-client';
import { AccessPasses } from './resources/access-passes';
import { Console } from './resources/console';
import { WusulConfig } from './types';

/**
 * Main Wusul SDK client
 *
 * @example
 * ```typescript
 * import Wusul from 'wusul';
 *
 * const accountId = process.env.WUSUL_ACCOUNT_ID;
 * const sharedSecret = process.env.WUSUL_SHARED_SECRET;
 *
 * const client = new Wusul(accountId, sharedSecret);
 *
 * // Issue an access pass
 * const accessPass = await client.accessPasses.issue({
 *   cardTemplateId: "template_123",
 *   fullName: "John Doe",
 *   email: "john@example.com",
 *   cardNumber: "12345",
 *   startDate: "2025-11-01T00:00:00Z",
 *   expirationDate: "2026-11-01T00:00:00Z"
 * });
 * ```
 */
export class Wusul {
  private http: HttpClient;

  /**
   * Access passes resource for managing access passes
   */
  public readonly accessPasses: AccessPasses;

  /**
   * Console resource for managing card templates (Enterprise only)
   */
  public readonly console: Console;

  /**
   * Creates a new Wusul client instance
   *
   * @param accountId - Your Wusul account ID (X-ACCT-ID)
   * @param sharedSecret - Your Wusul shared secret for signing requests
   * @param options - Optional configuration
   * @param options.baseUrl - Base URL for the Wusul API (default: https://api.wusul.io)
   * @param options.timeout - Request timeout in milliseconds (default: 30000)
   *
   * @example
   * ```typescript
   * // Using environment variables
   * const client = new Wusul(
   *   process.env.WUSUL_ACCOUNT_ID!,
   *   process.env.WUSUL_SHARED_SECRET!
   * );
   *
   * // With custom configuration
   * const client = new Wusul(
   *   accountId,
   *   sharedSecret,
   *   {
   *     baseUrl: 'https://api.wusul.io',
   *     timeout: 60000
   *   }
   * );
   * ```
   */
  constructor(accountId: string, sharedSecret: string, options?: Partial<WusulConfig>) {
    if (!accountId || !sharedSecret) {
      throw new Error('accountId and sharedSecret are required');
    }

    const baseUrl = options?.baseUrl || 'https://api.wusul.io';
    const timeout = options?.timeout || 30000;

    this.http = new HttpClient(accountId, sharedSecret, baseUrl, timeout);
    this.accessPasses = new AccessPasses(this.http);
    this.console = new Console(this.http);
  }

  /**
   * Health check to verify API connectivity
   *
   * @returns Health status information
   */
  async health(): Promise<any> {
    return this.http.get('/health');
  }
}

export default Wusul;
