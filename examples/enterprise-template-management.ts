/**
 * Enterprise template management example for the Wusul SDK
 *
 * This example demonstrates enterprise-only features:
 * 1. Create a card template
 * 2. Read template details
 * 3. Update a template
 * 4. Publish a template
 * 5. Read event logs
 *
 * Note: These features require an Enterprise tier account
 */

import Wusul from 'wusul';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Initialize the Wusul client
  const client = new Wusul(
    process.env.WUSUL_ACCOUNT_ID!,
    process.env.WUSUL_SHARED_SECRET!
  );

  try {
    // 1. Create a card template
    console.log('📋 Creating a new card template...');
    const template = await client.console.createTemplate({
      name: "Corporate Employee Badge - 2025",
      platform: "apple",
      useCase: "employee_badge",
      protocol: "desfire",
      allowOnMultipleDevices: true,
      watchCount: 2,
      iphoneCount: 3,
      design: {
        backgroundColor: "#1E3A8A",
        labelColor: "#FFFFFF",
        labelSecondaryColor: "#E5E7EB",
        backgroundImage: "[base64_encoded_image]",
        logoImage: "[base64_encoded_image]",
        iconImage: "[base64_encoded_image]"
      },
      supportInfo: {
        supportUrl: "https://help.company.sa",
        supportPhoneNumber: "+966112345678",
        supportEmail: "support@company.sa",
        privacyPolicyUrl: "https://company.sa/privacy",
        termsAndConditionsUrl: "https://company.sa/terms"
      },
      metadata: {
        version: "2.0",
        environment: "production",
        region: "MENA",
        created_by: "admin@company.sa"
      }
    });

    console.log('✅ Template created successfully!');
    console.log('   ID:', template.id);
    console.log('   Name:', template.name);
    console.log('   Platform:', template.platform);
    console.log('   Protocol:', template.protocol);

    // 2. Read template details
    console.log('\n🔍 Reading template details...');
    const templateDetails = await client.console.readTemplate(template.id);
    console.log('✅ Template details retrieved:');
    console.log('   Name:', templateDetails.name);
    console.log('   Multi-device:', templateDetails.allowOnMultipleDevices);
    console.log('   Watch count:', templateDetails.watchCount);
    console.log('   iPhone count:', templateDetails.iphoneCount);

    // 3. Update the template
    console.log('\n✏️  Updating template...');
    const updatedTemplate = await client.console.updateTemplate({
      cardTemplateId: template.id,
      name: "Corporate Employee Badge - 2025 (Updated)",
      watchCount: 3,
      iphoneCount: 5,
      supportInfo: {
        supportEmail: "newsupport@company.sa",
        supportPhoneNumber: "+966112345679"
      },
      metadata: {
        version: "2.1",
        environment: "production",
        region: "MENA",
        updated_by: "admin@company.sa",
        last_update: new Date().toISOString()
      }
    });

    console.log('✅ Template updated successfully!');
    console.log('   New name:', updatedTemplate.name);

    // 4. Publish the template
    console.log('\n🚀 Publishing template...');
    await client.console.publishTemplate(template.id);
    console.log('✅ Template published successfully!');

    // 5. Read event logs
    console.log('\n📊 Reading event logs...');
    const events = await client.console.eventLog({
      cardTemplateId: template.id,
      filters: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      }
    });

    console.log(`✅ Found ${events.length} events`);
    events.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.type} at ${event.timestamp}`);
    });

    // 6. Filter events by type
    console.log('\n🔎 Filtering install events...');
    const installEvents = await client.console.eventLog({
      cardTemplateId: template.id,
      filters: {
        device: "mobile",
        eventType: "install",
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      }
    });

    console.log(`✅ Found ${installEvents.length} install events in the last 7 days`);

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.message.includes('Enterprise tier required')) {
      console.error('\n⚠️  This feature requires an Enterprise tier account.');
      console.error('   Please upgrade your account to access template management features.');
    }

    process.exit(1);
  }
}

// Run the example
main();
