# Wusul SDK - Official Ruby SDK for Wusul Digital Access Control Platform
#
# @example
#   require 'wusul'
#
#   client = Wusul::Client.new(account_id, shared_secret)
#   access_pass = client.access_passes.issue({...})

require_relative 'wusul/version'
require_relative 'wusul/errors'
require_relative 'wusul/auth'
require_relative 'wusul/http_client'
require_relative 'wusul/client'
require_relative 'wusul/resources/access_passes'
require_relative 'wusul/resources/console'

# Main Wusul module
module Wusul
  class << self
    # Convenience method to create a new Wusul client
    #
    # @param account_id [String] Your Wusul account ID
    # @param shared_secret [String] Your Wusul shared secret
    # @param options [Hash] Optional configuration
    # @return [Wusul::Client] A new client instance
    def new(account_id, shared_secret, options = {})
      Client.new(account_id, shared_secret, options)
    end
  end
end
