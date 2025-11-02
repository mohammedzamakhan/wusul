using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Wusul.Auth;
using Wusul.Models;

namespace Wusul.Http
{
    /// <summary>
    /// HTTP client for making authenticated requests to the Wusul API
    /// </summary>
    public class WusulHttpClient : IDisposable
    {
        private readonly System.Net.Http.HttpClient _httpClient;
        private readonly string _accountId;
        private readonly string _sharedSecret;
        private bool _disposed = false;

        /// <summary>
        /// Creates a new HTTP client instance
        /// </summary>
        /// <param name="accountId">Account ID</param>
        /// <param name="sharedSecret">Shared secret</param>
        /// <param name="baseUrl">Base URL for the API</param>
        /// <param name="timeout">Request timeout in milliseconds</param>
        public WusulHttpClient(string accountId, string sharedSecret, string baseUrl, int timeout)
        {
            _accountId = accountId;
            _sharedSecret = sharedSecret;

            _httpClient = new System.Net.Http.HttpClient
            {
                BaseAddress = new Uri(baseUrl),
                Timeout = TimeSpan.FromMilliseconds(timeout)
            };

            _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
        }

        /// <summary>
        /// Makes a GET request
        /// </summary>
        /// <typeparam name="T">Response type</typeparam>
        /// <param name="url">Request URL</param>
        /// <param name="sigPayload">Payload for signature (optional)</param>
        /// <returns>Response data</returns>
        public async Task<T> GetAsync<T>(string url, object? sigPayload = null)
        {
            var payload = sigPayload ?? new { id = "0" };
            var (headers, encodedPayload) = AuthenticationHelper.CreateAuthHeaders(_accountId, _sharedSecret, payload);

            var request = new HttpRequestMessage(HttpMethod.Get, url);
            foreach (var header in headers)
            {
                request.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }

            // Add sig_payload as query parameter
            var separator = url.Contains("?") ? "&" : "?";
            var fullUrl = $"{url}{separator}sig_payload={System.Net.WebUtility.UrlEncode(encodedPayload)}";
            request.RequestUri = new Uri(_httpClient.BaseAddress, fullUrl);

            var response = await _httpClient.SendAsync(request);
            return await HandleResponseAsync<T>(response);
        }

        /// <summary>
        /// Makes a POST request
        /// </summary>
        /// <typeparam name="T">Response type</typeparam>
        /// <param name="url">Request URL</param>
        /// <param name="data">Request body data (optional)</param>
        /// <returns>Response data</returns>
        public async Task<T> PostAsync<T>(string url, object? data = null)
        {
            var payload = data ?? new { id = "0" };
            var (headers, _) = AuthenticationHelper.CreateAuthHeaders(_accountId, _sharedSecret, payload);

            var request = new HttpRequestMessage(HttpMethod.Post, url);
            foreach (var header in headers)
            {
                request.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }

            if (data != null)
            {
                var jsonContent = JsonConvert.SerializeObject(data);
                request.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            }

            var response = await _httpClient.SendAsync(request);
            return await HandleResponseAsync<T>(response);
        }

        /// <summary>
        /// Makes a PATCH request
        /// </summary>
        /// <typeparam name="T">Response type</typeparam>
        /// <param name="url">Request URL</param>
        /// <param name="data">Request body data (optional)</param>
        /// <returns>Response data</returns>
        public async Task<T> PatchAsync<T>(string url, object? data = null)
        {
            var payload = data ?? new { id = "0" };
            var (headers, _) = AuthenticationHelper.CreateAuthHeaders(_accountId, _sharedSecret, payload);

            var request = new HttpRequestMessage(new HttpMethod("PATCH"), url);
            foreach (var header in headers)
            {
                request.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }

            if (data != null)
            {
                var jsonContent = JsonConvert.SerializeObject(data);
                request.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            }

            var response = await _httpClient.SendAsync(request);
            return await HandleResponseAsync<T>(response);
        }

        /// <summary>
        /// Makes a DELETE request
        /// </summary>
        /// <typeparam name="T">Response type</typeparam>
        /// <param name="url">Request URL</param>
        /// <returns>Response data</returns>
        public async Task<T> DeleteAsync<T>(string url)
        {
            var (headers, _) = AuthenticationHelper.CreateAuthHeaders(_accountId, _sharedSecret);

            var request = new HttpRequestMessage(HttpMethod.Delete, url);
            foreach (var header in headers)
            {
                request.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }

            var response = await _httpClient.SendAsync(request);
            return await HandleResponseAsync<T>(response);
        }

        /// <summary>
        /// Handles the HTTP response and deserializes the result
        /// </summary>
        private async Task<T> HandleResponseAsync<T>(HttpResponseMessage response)
        {
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                var errorMessage = content;
                try
                {
                    var errorResponse = JsonConvert.DeserializeObject<WusulResponse<object>>(content);
                    errorMessage = errorResponse?.Error ?? errorResponse?.Message ?? content;
                }
                catch
                {
                    // If we can't parse the error, use the raw content
                }

                throw new WusulException($"Wusul API Error ({(int)response.StatusCode}): {errorMessage}");
            }

            try
            {
                var wusulResponse = JsonConvert.DeserializeObject<WusulResponse<T>>(content);
                if (wusulResponse != null && !EqualityComparer<T>.Default.Equals(wusulResponse.Data, default(T)))
                {
                    return wusulResponse.Data;
                }

                // If there's no data wrapper, try to deserialize directly
                var directResponse = JsonConvert.DeserializeObject<T>(content);
                if (directResponse != null && !EqualityComparer<T>.Default.Equals(directResponse, default(T)))
                {
                    return directResponse;
                }

                throw new WusulException("Response data is null");
            }
            catch (JsonException ex)
            {
                throw new WusulException($"Failed to deserialize response: {ex.Message}");
            }
        }

        /// <summary>
        /// Disposes the HTTP client
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Disposes the HTTP client
        /// </summary>
        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _httpClient?.Dispose();
                }
                _disposed = true;
            }
        }
    }

    /// <summary>
    /// Exception thrown when a Wusul API error occurs
    /// </summary>
    public class WusulException : Exception
    {
        public WusulException(string message) : base(message)
        {
        }

        public WusulException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
