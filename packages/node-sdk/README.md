# Wusul Node.js SDK

Official Node.js SDK for [Wusul](https://wusul.io) - Digital Access Control Platform for the MENA region.

[![npm version](https://img.shields.io/npm/v/wusul.svg)](https://www.npmjs.com/package/wusul)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install wusul
```

## Quick Start

```typescript
import Wusul from 'wusul';

const accountId = process.env.WUSUL_ACCOUNT_ID;
const sharedSecret = process.env.WUSUL_SHARED_SECRET;

const client = new Wusul(accountId, sharedSecret);

// Issue an access pass
const accessPass = await client.accessPasses.issue({
  cardTemplateId: "template_123",
  fullName: "John Doe",
  email: "john@example.com",
  phoneNumber: "+966501234567",
  cardNumber: "12345",
  startDate: "2025-11-01T00:00:00Z",
  expirationDate: "2026-11-01T00:00:00Z"
});

console.log(`Access pass created: ${accessPass.url}`);
```

## Authentication

Wusul uses a dual authentication mechanism:

1. **X-ACCT-ID header**: Your static account ID
2. **X-PAYLOAD-SIG header**: A SHA256 signature of your payload using your shared secret

You can find both keys in your Wusul console on the API keys page. The SDK handles authentication automatically.

## Usage

### Initialize the Client

```typescript
import Wusul from 'wusul';

// Basic initialization
const client = new Wusul(accountId, sharedSecret);

// With custom configuration
const client = new Wusul(accountId, sharedSecret, {
  baseUrl: 'https://api.wusul.io',
  timeout: 60000 // 60 seconds
});
```

### Access Passes

#### Issue an Access Pass

```typescript
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
  employeePhoto: "[base64_encoded_image]",
  metadata: {
    department: "engineering",
    badgeType: "permanent"
  }
});

console.log(`Install URL: ${accessPass.url}`);
```

#### List Access Passes

```typescript
// List all access passes for a template
const passes = await client.accessPasses.list({
  templateId: "template_123"
});

// Filter by state
const activePasses = await client.accessPasses.list({
  state: "active"
});

// List all
const allPasses = await client.accessPasses.list();
```

#### Update an Access Pass

```typescript
const updatedPass = await client.accessPasses.update({
  accessPassId: "pass_123",
  fullName: "Ahmed Al-Rashid (Updated)",
  title: "Senior Engineering Manager",
  expirationDate: "2027-01-01T00:00:00Z"
});
```

#### Suspend an Access Pass

```typescript
await client.accessPasses.suspend("pass_123");
console.log('Access pass suspended');
```

#### Resume an Access Pass

```typescript
await client.accessPasses.resume("pass_123");
console.log('Access pass resumed');
```

#### Unlink an Access Pass

```typescript
await client.accessPasses.unlink("pass_123");
console.log('Access pass unlinked from device');
```

#### Delete an Access Pass

```typescript
await client.accessPasses.delete("pass_123");
console.log('Access pass deleted');
```

### Card Templates (Enterprise Only)

#### Create a Card Template

```typescript
const template = await client.console.createTemplate({
  name: "Employee Badge - Corporate",
  platform: "apple",
  useCase: "employee_badge",
  protocol: "desfire",
  allowOnMultipleDevices: true,
  watchCount: 2,
  iphoneCount: 3,
  design: {
    backgroundColor: "#FFFFFF",
    labelColor: "#000000",
    labelSecondaryColor: "#333333",
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
    version: "1.0",
    environment: "production"
  }
});

console.log(`Template created: ${template.id}`);
```

#### Read a Card Template

```typescript
const template = await client.console.readTemplate("template_123");
console.log(`Template: ${template.name}`);
```

#### Update a Card Template

```typescript
const updatedTemplate = await client.console.updateTemplate({
  cardTemplateId: "template_123",
  name: "Employee Badge - Corporate (Updated)",
  allowOnMultipleDevices: true,
  watchCount: 3,
  supportInfo: {
    supportEmail: "newsupport@company.sa"
  }
});
```

#### Publish a Card Template

```typescript
await client.console.publishTemplate("template_123");
console.log('Template published');
```

#### Read Event Logs

```typescript
// Get all events
const events = await client.console.eventLog({
  cardTemplateId: "template_123"
});

// Filter events
const filteredEvents = await client.console.eventLog({
  cardTemplateId: "template_123",
  filters: {
    device: "mobile",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    eventType: "install"
  }
});

events.forEach(event => {
  console.log(`Event: ${event.type} at ${event.timestamp}`);
});
```

### Health Check

```typescript
const health = await client.health();
console.log('API Status:', health.status);
```

## Error Handling

The SDK throws errors when API requests fail:

```typescript
try {
  const accessPass = await client.accessPasses.issue({
    cardTemplateId: "invalid_template",
    fullName: "Test User",
    cardNumber: "12345",
    startDate: new Date().toISOString(),
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  });
} catch (error) {
  console.error('Error:', error.message);
  // Handle error appropriately
}
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```typescript
import Wusul, {
  AccessPass,
  IssueAccessPassParams,
  AccessPassState
} from 'wusul';

const params: IssueAccessPassParams = {
  cardTemplateId: "template_123",
  fullName: "John Doe",
  cardNumber: "12345",
  startDate: new Date().toISOString(),
  expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
};

const accessPass: AccessPass = await client.accessPasses.issue(params);
```

## Environment Variables

It's recommended to store your credentials in environment variables:

```bash
# .env
WUSUL_ACCOUNT_ID=your_account_id
WUSUL_SHARED_SECRET=your_shared_secret
```

Then use them in your code:

```typescript
import Wusul from 'wusul';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Wusul(
  process.env.WUSUL_ACCOUNT_ID!,
  process.env.WUSUL_SHARED_SECRET!
);
```

## Examples

Check out the [examples directory](../../examples) for complete working examples.

## API Reference

For detailed API documentation, visit [https://docs.wusul.io](https://docs.wusul.io)

## Support

- Documentation: [https://docs.wusul.io](https://docs.wusul.io)
- GitHub Issues: [https://github.com/mohammedzamakhan/wusul/issues](https://github.com/mohammedzamakhan/wusul/issues)
- Email: support@wusul.io

## License

MIT License - see the [LICENSE](../../LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md) for details.
