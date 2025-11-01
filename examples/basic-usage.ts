/**
 * Basic usage example for the Wusul SDK
 *
 * This example demonstrates how to:
 * 1. Initialize the Wusul client
 * 2. Issue an access pass
 * 3. List access passes
 * 4. Update an access pass
 * 5. Suspend, resume, and delete access passes
 */

import Wusul from 'wusul';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Initialize the Wusul client
  const client = new Wusul(
    process.env.WUSUL_ACCOUNT_ID!,
    process.env.WUSUL_SHARED_SECRET!,
    {
      baseUrl: process.env.WUSUL_API_URL || 'https://api.wusul.io',
      timeout: 30000
    }
  );

  try {
    // 1. Health check
    console.log('🔍 Checking API health...');
    const health = await client.health();
    console.log('✅ API is healthy:', health);

    // 2. Issue an access pass
    console.log('\n📝 Issuing a new access pass...');
    const accessPass = await client.accessPasses.issue({
      cardTemplateId: "template_123",
      employeeId: "emp_456",
      fullName: "Ahmed Al-Rashid",
      email: "ahmed@company.sa",
      phoneNumber: "+966501234567",
      classification: "full_time",
      cardNumber: "12345",
      siteCode: "100",
      startDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      title: "Engineering Manager",
      metadata: {
        department: "engineering",
        location: "Riyadh"
      }
    });

    console.log('✅ Access pass created successfully!');
    console.log('   ID:', accessPass.id);
    console.log('   URL:', accessPass.url);

    // 3. List all active access passes
    console.log('\n📋 Listing active access passes...');
    const activePasses = await client.accessPasses.list({
      state: "active"
    });
    console.log(`✅ Found ${activePasses.length} active access passes`);

    // 4. Update the access pass
    console.log('\n✏️  Updating access pass...');
    const updatedPass = await client.accessPasses.update({
      accessPassId: accessPass.id,
      title: "Senior Engineering Manager",
      expirationDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString()
    });
    console.log('✅ Access pass updated successfully!');
    console.log('   New title:', updatedPass.title);

    // 5. Suspend the access pass
    console.log('\n⏸️  Suspending access pass...');
    await client.accessPasses.suspend(accessPass.id);
    console.log('✅ Access pass suspended');

    // 6. Resume the access pass
    console.log('\n▶️  Resuming access pass...');
    await client.accessPasses.resume(accessPass.id);
    console.log('✅ Access pass resumed');

    // 7. Unlink from device (optional)
    console.log('\n🔗 Unlinking access pass from device...');
    await client.accessPasses.unlink(accessPass.id);
    console.log('✅ Access pass unlinked');

    // 8. Delete the access pass (optional - only for testing)
    console.log('\n🗑️  Deleting access pass...');
    await client.accessPasses.delete(accessPass.id);
    console.log('✅ Access pass deleted');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the example
main();
