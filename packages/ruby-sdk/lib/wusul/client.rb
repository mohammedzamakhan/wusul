require_relative 'http_client'
require_relative 'resources/access_passes'
require_relative 'resources/console'

module Wusul
  # Main Wusul SDK client
  #
  # @example
  #   require 'wusul'
  #
  #   account_id = ENV['WUSUL_ACCOUNT_ID']
  #   shared_secret = ENV['WUSUL_SHARED_SECRET']
  #
  #   client = Wusul::Client.new(account_id, shared_secret)
  #
  #   # Issue an access pass
  #   access_pass = client.access_passes.issue(
  #     card_template_id: "template_123",
  #     full_name: "John Doe",
  #     email: "john@example.com",
  #     card_number: "12345",
  #     start_date: "2025-11-01T00:00:00Z",
  #     expiration_date: "2026-11-01T00:00:00Z"
  #   )
  class Client
    attr_reader :access_passes, :console

    # Creates a new Wusul client instance
    #
    # @param account_id [String] Your Wusul account ID (X-ACCT-ID)
    # @param shared_secret [String] Your Wusul shared secret for signing requests
    # @param options [Hash] Optional configuration
    # @option options [String] :base_url Base URL for the Wusul API (default: https://api.wusul.io)
    # @option options [Integer] :timeout Request timeout in milliseconds (default: 30000)
    #
    # @example
    #   # Using environment variables
    #   client = Wusul::Client.new(
    #     ENV['WUSUL_ACCOUNT_ID'],
    #     ENV['WUSUL_SHARED_SECRET']
    #   )
    #
    #   # With custom configuration
    #   client = Wusul::Client.new(
    #     account_id,
    #     shared_secret,
    #     base_url: 'https://api.wusul.io',
    #     timeout: 60000
    #   )
    def initialize(account_id, shared_secret, options = {})
      raise ArgumentError, 'account_id is required' if account_id.nil? || account_id.empty?
      raise ArgumentError, 'shared_secret is required' if shared_secret.nil? || shared_secret.empty?

      base_url = options[:base_url] || 'https://api.wusul.io'
      timeout = options[:timeout] || 30_000

      @http = HttpClient.new(account_id, shared_secret, base_url, timeout)
      @access_passes = Resources::AccessPasses.new(@http)
      @console = Resources::Console.new(@http)
    end

    # Health check to verify API connectivity
    #
    # @return [Hash] Health status information
    def health
      @http.get('/health')
    end
  end
end
