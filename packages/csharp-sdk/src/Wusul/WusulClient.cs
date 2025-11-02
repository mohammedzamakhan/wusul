using System;
using System.Threading.Tasks;
using Wusul.Http;
using Wusul.Models;
using Wusul.Resources;

namespace Wusul
{
    /// <summary>
    /// Main Wusul SDK client for interacting with the Wusul API
    /// </summary>
    /// <example>
    /// <code>
    /// var accountId = Environment.GetEnvironmentVariable("WUSUL_ACCOUNT_ID");
    /// var sharedSecret = Environment.GetEnvironmentVariable("WUSUL_SHARED_SECRET");
    ///
    /// var client = new WusulClient(accountId, sharedSecret);
    ///
    /// // Issue an access pass
    /// var accessPass = await client.AccessPasses.IssueAsync(new IssueAccessPassRequest
    /// {
    ///     CardTemplateId = "template_123",
    ///     FullName = "John Doe",
    ///     Email = "john@example.com",
    ///     CardNumber = "12345",
    ///     StartDate = DateTime.UtcNow.ToString("o"),
    ///     ExpirationDate = DateTime.UtcNow.AddYears(1).ToString("o")
    /// });
    /// </code>
    /// </example>
    public class WusulClient : IDisposable
    {
        private readonly WusulHttpClient _http;
        private bool _disposed = false;

        /// <summary>
        /// Access passes resource for managing access passes
        /// </summary>
        public AccessPasses AccessPasses { get; }

        /// <summary>
        /// Console resource for managing card templates (Enterprise only)
        /// </summary>
        public Resources.Console Console { get; }

        /// <summary>
        /// Creates a new Wusul client instance
        /// </summary>
        /// <param name="accountId">Your Wusul account ID (X-ACCT-ID)</param>
        /// <param name="sharedSecret">Your Wusul shared secret for signing requests</param>
        /// <param name="config">Optional configuration</param>
        /// <exception cref="ArgumentException">Thrown when accountId or sharedSecret is null or empty</exception>
        /// <example>
        /// <code>
        /// // Using environment variables
        /// var client = new WusulClient(
        ///     Environment.GetEnvironmentVariable("WUSUL_ACCOUNT_ID"),
        ///     Environment.GetEnvironmentVariable("WUSUL_SHARED_SECRET")
        /// );
        ///
        /// // With custom configuration
        /// var client = new WusulClient(
        ///     accountId,
        ///     sharedSecret,
        ///     new WusulConfig
        ///     {
        ///         BaseUrl = "https://api.wusul.io",
        ///         Timeout = 60000
        ///     }
        /// );
        /// </code>
        /// </example>
        public WusulClient(string accountId, string sharedSecret, WusulConfig? config = null)
        {
            if (string.IsNullOrWhiteSpace(accountId))
                throw new ArgumentException("accountId is required", nameof(accountId));

            if (string.IsNullOrWhiteSpace(sharedSecret))
                throw new ArgumentException("sharedSecret is required", nameof(sharedSecret));

            var baseUrl = config?.BaseUrl ?? "https://api.wusul.io";
            var timeout = config?.Timeout ?? 30000;

            _http = new WusulHttpClient(accountId, sharedSecret, baseUrl, timeout);
            AccessPasses = new AccessPasses(_http);
            Console = new Resources.Console(_http);
        }

        /// <summary>
        /// Health check to verify API connectivity
        /// </summary>
        /// <returns>Health status information</returns>
        public async Task<object> HealthAsync()
        {
            return await _http.GetAsync<object>("/health");
        }

        /// <summary>
        /// Disposes the Wusul client and releases resources
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Disposes the Wusul client and releases resources
        /// </summary>
        /// <param name="disposing">Whether to dispose managed resources</param>
        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _http?.Dispose();
                }
                _disposed = true;
            }
        }
    }
}
