# Wusul - وصول

> Complete Digital Access Control Ecosystem for MENA Region
>
> منصة التحكم في الوصول الرقمي المتكاملة لمنطقة الشرق الأوسط وشمال إفريقيا

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Nx Monorepo](https://img.shields.io/badge/Nx-Monorepo-143055.svg)](https://nx.dev/)
[![License](https://img.shields.io/badge/License-UNLICENSED-red.svg)](LICENSE)

## Overview

Wusul is a complete digital access control ecosystem that enables businesses across the MENA region to issue and manage NFC-based digital access credentials through Apple Wallet and Google Wallet. The platform works with existing MIFARE DESFire and HID Seos readers without requiring hardware replacement.

This monorepo contains:
- **API Platform**: Production-ready REST API for access control management
- **Multi-Language SDKs**: Official client libraries for 8+ programming languages
- **Documentation**: Comprehensive Mintlify-powered documentation site

### Key Features

- **🔐 Dual Authentication**: Secure API access using account ID + payload signature verification
- **📱 Multi-Platform Support**: Apple Wallet (iOS) and Google Wallet (Android)
- **🔄 Real-time Management**: Instant credential issuance, updates, and revocation
- **🔔 Webhook System**: CloudEvents-compliant webhook notifications
- **🌍 MENA-Optimized**: Full Arabic language support, regional compliance, and prayer time integration
- **🏢 Enterprise Ready**: Multi-tenant architecture with role-based access control
- **📚 Multi-Language SDKs**: Node.js, PHP, Python, Java, Go, C#, Ruby, and Rust
- **📖 Comprehensive Documentation**: Interactive API docs powered by Mintlify
- **🚀 High Performance**: Built with Node.js, TypeScript, PostgreSQL, and Redis

## Repository Structure

This is an Nx monorepo organized as follows:

```
wusul/
├── apps/
│   ├── api/                  # REST API Platform
│   │   ├── src/
│   │   │   ├── config/       # Configuration files
│   │   │   ├── controllers/  # Route controllers
│   │   │   ├── middleware/   # Custom middleware
│   │   │   ├── routes/       # API routes
│   │   │   ├── services/     # Business logic
│   │   │   ├── utils/        # Utility functions
│   │   │   ├── validators/   # Request validators (Zod)
│   │   │   ├── app.ts        # Express app setup
│   │   │   └── server.ts     # Server entry point
│   │   └── prisma/           # Database schema
│   └── docs/                 # Mintlify documentation site
│
├── packages/
│   ├── node-sdk/             # Node.js/TypeScript SDK
│   ├── php-sdk/              # PHP SDK
│   ├── python-sdk/           # Python SDK
│   ├── java-sdk/             # Java SDK
│   ├── go-sdk/               # Go SDK
│   ├── csharp-sdk/           # C# SDK
│   ├── ruby-sdk/             # Ruby SDK
│   └── rust-sdk/             # Rust SDK
│
├── examples/                 # Example implementations
├── docker-compose.yml        # Development services
└── nx.json                   # Nx workspace config
```

## Technology Stack

### API Platform
- **Runtime**: Node.js 20.x
- **Language**: TypeScript 5.x
- **Framework**: Express.js
- **Database**: PostgreSQL 16 with Prisma ORM
- **Cache**: Redis 7
- **Validation**: Zod
- **Authentication**: Custom dual-auth mechanism
- **Logging**: Pino
- **Containerization**: Docker & Docker Compose

### SDKs
- **Node.js**: TypeScript with full type definitions
- **PHP**: PSR-4 compliant with Composer support
- **Python**: Type hints with pip/poetry support
- **Java**: Maven/Gradle compatible
- **Go**: Go modules support
- **C#**: .NET Standard 2.0+
- **Ruby**: RubyGems compatible
- **Rust**: Async-first with tokio, type-safe with comprehensive error handling

### Infrastructure
- **Monorepo**: Nx for build orchestration
- **Testing**: Jest, Vitest, and language-specific frameworks
- **CI/CD**: GitHub Actions
- **Documentation**: Mintlify

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker & Docker Compose (recommended for local development)

### Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/mohammedzamakhan/wusul.git
cd wusul
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` with your configuration:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://wusul:wusul_password@localhost:5432/wusul_db"
REDIS_HOST=localhost
REDIS_PORT=6379

# Generate these using: openssl rand -hex 32
ACCOUNT_ID_SALT=your-account-id-salt-here
SHARED_SECRET_SALT=your-shared-secret-salt-here
```

4. **Start services with Docker Compose**

```bash
npm run docker:up
```

This starts:
- PostgreSQL database on port 5432
- Redis cache on port 6379
- Wusul API on port 3000

5. **Run database migrations**

```bash
npm run prisma:migrate
```

6. **Start development**

```bash
# Run API server
npm run dev

# Run specific app
npx nx serve api

# Build all packages
npm run build

# Run tests
npm test
```

### Using the SDKs

#### Node.js/TypeScript

```bash
npm install wusul
```

```typescript
import { WusulClient } from 'wusul';

const client = new WusulClient({
  accountId: 'your-account-id',
  sharedSecret: 'your-shared-secret',
  baseUrl: 'https://api.wusul.com'
});

// Issue an access pass
const pass = await client.accessPasses.create({
  card_template_id: 'template-id',
  full_name: 'Ahmed Al-Mansouri',
  email: 'ahmed@company.com'
});
```

#### PHP

```bash
composer require wusul/wusul-php
```

```php
use Wusul\WusulClient;

$client = new WusulClient([
    'account_id' => 'your-account-id',
    'shared_secret' => 'your-shared-secret'
]);

$pass = $client->accessPasses->create([
    'card_template_id' => 'template-id',
    'full_name' => 'Ahmed Al-Mansouri'
]);
```

#### Python

```bash
pip install wusul
```

```python
from wusul import WusulClient

client = WusulClient(
    account_id='your-account-id',
    shared_secret='your-shared-secret'
)

pass_data = client.access_passes.create(
    card_template_id='template-id',
    full_name='Ahmed Al-Mansouri'
)
```

#### Rust

```bash
cargo add wusul
cargo add tokio --features full
```

```rust
use wusul::{Wusul, types::IssueAccessPassParams};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Wusul::new(
        "your-account-id".to_string(),
        "your-shared-secret".to_string()
    )?;

    let params = IssueAccessPassParams {
        card_template_id: "template-id".to_string(),
        full_name: "Ahmed Al-Mansouri".to_string(),
        email: Some("ahmed@company.com".to_string()),
        start_date: "2024-01-01".to_string(),
        expiration_date: "2024-12-31".to_string(),
        ..Default::default()
    };

    let pass = client.access_passes.issue(params).await?;
    Ok(())
}
```

For detailed SDK documentation, see the respective package README files or visit our [documentation site](https://wusul.com/docs).

## API Documentation

For complete API documentation, visit our [interactive API docs](https://wusul.com/docs) or see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Quick API Example

```bash
# Issue an access pass
curl -X POST http://localhost:3000/v1/access-passes \
  -H "Content-Type: application/json" \
  -H "X-ACCT-ID: your-account-id" \
  -H "X-PAYLOAD-SIG: generated-signature" \
  -d '{
    "card_template_id": "template-id",
    "full_name": "Ahmed Al-Mansouri",
    "email": "ahmed@company.com"
  }'
```

### Authentication

Wusul uses dual authentication:
- **X-ACCT-ID**: Your account identifier
- **X-PAYLOAD-SIG**: SHA256 signature of base64-encoded payload

All SDKs handle authentication automatically. See SDK documentation for details.

### Core Endpoints

- **Access Passes**: `/v1/access-passes` - Issue, update, suspend, and manage access passes
- **Card Templates**: `/v1/console/card-templates` - Manage card templates (Enterprise)
- **Wallet Passes**: `/v1/wallet/passes/:id` - Generate Apple/Google Wallet passes
- **Webhooks**: CloudEvents-compliant notifications for all lifecycle events

## Platform Features

### Wallet Integration
- **Apple Wallet**: NFC-enabled PKPass files with push notifications
- **Google Wallet**: Smart Tap support with real-time updates
- **QR Code Fallback**: Works without NFC

### Multi-Language Support (i18n)
- Full English and Arabic support
- RTL (Right-to-Left) for Arabic
- Language detection via `Accept-Language` header or `lng` query parameter

### Notifications
- **Email**: SMTP-based with bilingual HTML templates
- **SMS**: Twilio integration with shortened URLs
- **Webhooks**: CloudEvents-compliant for system integration

### MENA-Specific Features
- Arabic language support across all interfaces
- Regional compliance (UAE, Saudi Arabia)
- Prayer time integration for access schedules
- Local timezone support (`Asia/Dubai` default)
- UAE Pass and Absher integration (planned)

## Development

### Monorepo Commands

```bash
# Run all tests
npm test

# Test specific package
npm run test:api
npm run test:sdk
npm run test:rust-sdk

# Build all packages
npm run build

# Build specific package
npm run build:api
npm run build:sdk
npm run build:rust-sdk

# Lint and format
npm run lint
npm run lint:fix
npm run format

# Database management
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

### Working with Nx

```bash
# Run any target for any project
npx nx <target> <project>

# Examples:
npx nx build api
npx nx test node-sdk
npx nx serve docs

# Run target for all projects
npx nx run-many --target=build --all
npx nx run-many --target=test --all

# View dependency graph
npx nx graph
```

### Adding New SDKs

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on adding new language SDKs to the ecosystem.

## Deployment

### API Deployment

```bash
# Build production image
docker build -f apps/api/Dockerfile -t wusul-api:latest .

# Run with Docker Compose
docker-compose up -d

# Production environment
NODE_ENV=production npm run build:api
NODE_ENV=production npm start
```

### SDK Publishing

Each SDK package can be published independently:

```bash
# Node.js SDK
cd packages/node-sdk
npm publish

# PHP SDK
cd packages/php-sdk
composer publish

# Python SDK
cd packages/python-sdk
python -m build
twine upload dist/*
```

## Monorepo Architecture

### Why Nx?

- **Incremental builds**: Only rebuild what changed
- **Dependency graph**: Understand project relationships
- **Caching**: Speed up CI/CD pipelines
- **Code sharing**: Share types and utilities across projects

### Project Dependencies

```
apps/api → (none - independent)
apps/docs → (none - independent)
packages/*-sdk → (none - each SDK is independent)
```

## Security & Best Practices

- Never commit `.env` files or secrets
- Use strong random secrets (generate with `openssl rand -hex 32`)
- Enable HTTPS in production
- Rate limiting enabled by default
- Input validation via Zod schemas
- SQL injection protection via Prisma ORM
- XSS protection via Helmet middleware
- Regular dependency updates via Dependabot

## Roadmap

### ✅ Completed
- Core API platform with full CRUD operations
- Apple Wallet & Google Wallet integration
- Multi-language support (English & Arabic i18n)
- SMS/Email notifications
- CloudEvents-compliant webhooks
- 8 official SDKs (Node.js, PHP, Python, Java, Go, C#, Ruby, Rust)
- Comprehensive documentation site
- Monorepo architecture with Nx

### 🚧 In Progress
- Advanced analytics dashboard
- Mobile SDKs (iOS, Android, React Native, Flutter)
- Enhanced webhook retry mechanisms

### 📅 Planned (2025)
- UAE Pass integration
- Absher integration (Saudi Arabia)
- Blockchain audit trail
- AI-powered access anomaly detection
- IoT device integration
- Payment gateway integration
- GraphQL API support

## Resources

- **Documentation**: [wusul.com/docs](https://wusul.com/docs)
- **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Quick Start Guide**: [QUICKSTART.md](./QUICKSTART.md)
- **Contributing Guide**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

## Contributing

This project is actively maintained. Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code of conduct
- Development workflow
- Pull request process
- SDK development guidelines
- Testing requirements

## Support

For support and inquiries:
- **Email**: support@wusul.com
- **Website**: [wusul.com](https://wusul.com)
- **Documentation**: [wusul.com/docs](https://wusul.com/docs)
- **Issues**: [GitHub Issues](https://github.com/mohammedzamakhan/wusul/issues)

## License

Copyright © 2025 Wusul. All rights reserved.

Licensed under UNLICENSED. See the LICENSE file for details.

---

## Project Stats

- **8 Official SDKs**: Node.js, PHP, Python, Java, Go, C#, Ruby, Rust
- **2 Applications**: API Platform, Documentation Site
- **Multi-Language**: Full English & Arabic support
- **MENA-Focused**: Built for the Middle East & North Africa region

**Built with ❤️ for the MENA Region | صُنع بحب لمنطقة الشرق الأوسط وشمال إفريقيا**
