#!/usr/bin/env ruby

# Example usage of the Wusul Ruby SDK
# This demonstrates how to use the SDK to manage access passes

require 'wusul'

# Initialize the client with your credentials
account_id = ENV['WUSUL_ACCOUNT_ID']
shared_secret = ENV['WUSUL_SHARED_SECRET']

unless account_id && shared_secret
  puts 'Error: Please set WUSUL_ACCOUNT_ID and WUSUL_SHARED_SECRET environment variables'
  exit 1
end

client = Wusul::Client.new(account_id, shared_secret)

puts '=== Wusul Ruby SDK Example ==='
puts

# 1. Health Check
puts '1. Checking API health...'
begin
  health = client.health
  puts "   ✓ API is healthy: #{health}"
rescue Wusul::WusulError => e
  puts "   ✗ Health check failed: #{e.message}"
end
puts

# 2. Issue an Access Pass
puts '2. Issuing a new access pass...'
begin
  access_pass = client.access_passes.issue(
    card_template_id: '0xd3adb00b5',
    employee_id: '123456789',
    tag_id: 'DDEADB33FB00B5',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    phone_number: '+1-555-123-4567',
    classification: 'full_time',
    card_number: '12345',
    start_date: Time.now.utc.iso8601,
    expiration_date: (Time.now + (365 * 24 * 60 * 60)).utc.iso8601,
    title: 'Software Engineer',
    metadata: {
      department: 'engineering',
      badge_type: 'employee'
    }
  )

  puts "   ✓ Access pass issued successfully!"
  puts "   Install URL: #{access_pass['url']}"
  card_id = access_pass['id']
rescue Wusul::WusulError => e
  puts "   ✗ Failed to issue access pass: #{e.message}"
  card_id = nil
end
puts

# 3. List Access Passes
puts '3. Listing access passes...'
begin
  passes = client.access_passes.list
  puts "   ✓ Found #{passes.length} access pass(es)"
  passes.first(3).each do |pass|
    puts "     - #{pass['full_name']} (#{pass['state']})"
  end
rescue Wusul::WusulError => e
  puts "   ✗ Failed to list access passes: #{e.message}"
end
puts

# 4. Filter by state
puts '4. Filtering active access passes...'
begin
  active_passes = client.access_passes.list(state: 'active')
  puts "   ✓ Found #{active_passes.length} active pass(es)"
rescue Wusul::WusulError => e
  puts "   ✗ Failed to filter access passes: #{e.message}"
end
puts

# 5. Update an Access Pass (if we created one)
if card_id
  puts '5. Updating the access pass...'
  begin
    updated_pass = client.access_passes.update(
      card_id: card_id,
      title: 'Senior Software Engineer'
    )
    puts "   ✓ Access pass updated successfully!"
  rescue Wusul::WusulError => e
    puts "   ✗ Failed to update access pass: #{e.message}"
  end
  puts
end

# 6. Suspend an Access Pass (if we created one)
if card_id
  puts '6. Suspending the access pass...'
  begin
    client.access_passes.suspend(card_id)
    puts "   ✓ Access pass suspended successfully!"
  rescue Wusul::WusulError => e
    puts "   ✗ Failed to suspend access pass: #{e.message}"
  end
  puts
end

# 7. Resume an Access Pass (if we created one)
if card_id
  puts '7. Resuming the access pass...'
  begin
    client.access_passes.resume(card_id)
    puts "   ✓ Access pass resumed successfully!"
  rescue Wusul::WusulError => e
    puts "   ✗ Failed to resume access pass: #{e.message}"
  end
  puts
end

# 8. Console API - Create Card Template (Enterprise only)
puts '8. Creating a card template (Enterprise only)...'
begin
  template = client.console.create_template(
    name: 'Employee Badge',
    platform: 'apple',
    use_case: 'employee_badge',
    protocol: 'desfire',
    allow_on_multiple_devices: true,
    design: {
      background_color: '#FFFFFF',
      label_color: '#000000'
    }
  )
  puts "   ✓ Template created: #{template['id']}"
rescue Wusul::ForbiddenError
  puts '   ⚠ Skipped - Enterprise feature not available'
rescue Wusul::WusulError => e
  puts "   ✗ Failed to create template: #{e.message}"
end
puts

puts '=== Example completed ==='
puts
puts 'For more examples and documentation, visit:'
puts '  https://docs.wusul.io'
puts '  https://github.com/mohammedzamakhan/wusul'
