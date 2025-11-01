# Wusul API - وصول

> Digital Access Control Platform for MENA Region
>
> منصة التحكم في الوصول الرقمي لمنطقة الشرق الأوسط وشمال إفريقيا

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

## Overview

Wusul is a production-ready API platform that enables businesses across the MENA region to issue and manage NFC-based digital access credentials through Apple Wallet and Google Wallet. The platform works with existing MIFARE DESFire and HID Seos readers without requiring hardware replacement.

### Key Features

- **🔐 Dual Authentication**: Secure API access using account ID + payload signature verification
- **📱 Multi-Platform Support**: Apple Wallet (iOS) and Google Wallet (Android)
- **🔄 Real-time Management**: Instant credential issuance, updates, and revocation
- **🔔 Webhook System**: CloudEvents-compliant webhook notifications
- **🌍 MENA-Optimized**: Arabic language support, regional compliance, and prayer time integration
- **🏢 Enterprise Ready**: Multi-tenant architecture with role-based access control
- **📊 Comprehensive Logging**: Detailed audit trails and event logs
- **🚀 High Performance**: Built with Node.js, TypeScript, PostgreSQL, and Redis

## Technology Stack

- **Runtime**: Node.js 20.x
- **Language**: TypeScript 5.x
- **Framework**: Express.js
- **Database**: PostgreSQL 16 with Prisma ORM
- **Cache**: Redis 7
- **Validation**: Zod
- **Authentication**: Custom dual-auth mechanism (similar to AccessGrid)
- **Logging**: Pino
- **Containerization**: Docker & Docker Compose

## Project Structure

```
wusul/
├── src/
│   ├── config/              # Configuration files
│   │   ├── index.ts         # Main configuration
│   │   ├── database.ts      # Prisma client
│   │   ├── redis.ts         # Redis client
│   │   └── logger.ts        # Pino logger
│   ├── controllers/         # Route controllers
│   │   ├── access-pass.controller.ts
│   │   └── card-template.controller.ts
│   ├── middleware/          # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── rate-limit.middleware.ts
│   ├── models/              # Database models (Prisma)
│   ├── routes/              # API routes
│   │   ├── access-pass.routes.ts
│   │   ├── card-template.routes.ts
│   │   └── index.ts
│   ├── services/            # Business logic
│   │   ├── access-pass.service.ts
│   │   ├── card-template.service.ts
│   │   ├── event-log.service.ts
│   │   └── webhook.service.ts
│   ├── utils/               # Utility functions
│   │   ├── auth.ts
│   │   ├── response.ts
│   │   └── cloudevents.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── validators/          # Request validators (Zod)
│   │   ├── access-pass.validator.ts
│   │   └── card-template.validator.ts
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── prisma/
│   └── schema.prisma        # Database schema
├── docker-compose.yml       # Docker services
├── Dockerfile               # Container definition
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker & Docker Compose (for containerized setup)
- PostgreSQL 16 (if running locally)
- Redis 7 (if running locally)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd wusul
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` and configure your environment variables:

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

4. **Set up the database**

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

5. **Start the development server**

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Using Docker Compose (Recommended)

1. **Start all services**

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Redis cache on port 6379
- Wusul API on port 3000

2. **Run database migrations**

```bash
docker-compose exec api npx prisma migrate deploy
```

3. **View logs**

```bash
docker-compose logs -f api
```

4. **Stop services**

```bash
docker-compose down
```

## API Documentation

### Authentication

Wusul uses a dual authentication mechanism:

1. **X-ACCT-ID**: Static account identifier
2. **X-PAYLOAD-SIG**: SHA256 signature of the base64-encoded payload

#### Generating Signature

```typescript
import crypto from 'crypto';

function generateSignature(sharedSecret: string, payload: any): string {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const hash = crypto.createHash('sha256');
  hash.update(sharedSecret + base64Payload);
  return hash.digest('hex');
}
```

### API Endpoints

#### Access Pass Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/v1/access-passes` | Issue a new access pass | Yes |
| GET | `/v1/access-passes` | List access passes | Yes |
| PATCH | `/v1/access-passes/:id` | Update access pass | Yes |
| POST | `/v1/access-passes/:id/suspend` | Suspend access pass | Yes |
| POST | `/v1/access-passes/:id/resume` | Resume access pass | Yes |
| POST | `/v1/access-passes/:id/unlink` | Unlink access pass | Yes |
| POST | `/v1/access-passes/:id/delete` | Delete access pass | Yes |

#### Card Template Management (Enterprise Only)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/v1/console/card-templates` | Create card template | Enterprise |
| GET | `/v1/console/card-templates/:id` | Read card template | Enterprise |
| PATCH | `/v1/console/card-templates/:id` | Update card template | Enterprise |
| GET | `/v1/console/card-templates/:id/logs` | Read event logs | Enterprise |

#### Wallet Pass Management (Phase 2)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/v1/wallet/passes/:accessPassId` | Generate wallet pass | Yes |
| GET | `/v1/wallet/apple/v1/passes/:passTypeIdentifier/:serialNumber` | Get Apple Wallet pass | Token |
| POST | `/v1/wallet/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber` | Register device for Apple push notifications | Token |
| DELETE | `/v1/wallet/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber` | Unregister device | Token |

### Example: Issue Access Pass

```bash
curl -X POST http://localhost:3000/v1/access-passes \
  -H "Content-Type: application/json" \
  -H "X-ACCT-ID: 0xYourAccountId" \
  -H "X-PAYLOAD-SIG: generated-signature-here" \
  -d '{
    "card_template_id": "0xt3mp14t3",
    "full_name": "Ahmed Al-Mansouri",
    "email": "ahmed@company.com",
    "employee_id": "EMP-001",
    "site_code": "123",
    "card_number": "45678",
    "start_date": "2025-01-01T00:00:00Z",
    "expiration_date": "2025-12-31T23:59:59Z",
    "classification": "full_time",
    "title": "Senior Engineer"
  }'
```

### Webhooks

Wusul sends webhook notifications using the CloudEvents specification.

#### Webhook Event Types

- **Access Pass Events**:
  - `ag.access_pass.issued`
  - `ag.access_pass.activated`
  - `ag.access_pass.updated`
  - `ag.access_pass.suspended`
  - `ag.access_pass.resumed`
  - `ag.access_pass.unlinked`
  - `ag.access_pass.deleted`
  - `ag.access_pass.expired`

- **Card Template Events**:
  - `ag.card_template.created`
  - `ag.card_template.updated`
  - `ag.card_template.published`

#### Webhook Payload Example

```json
{
  "specversion": "1.0",
  "id": "unique-event-id",
  "source": "wusul",
  "type": "ag.access_pass.issued",
  "datacontenttype": "application/json",
  "time": "2025-01-15T10:30:00Z",
  "data": {
    "access_pass_id": "0xp4551d",
    "protocol": "DESFIRE",
    "metadata": {}
  }
}
```

## Phase 2 Features (Completed)

### 1. Multi-Language Support (i18n)

Full internationalization support for English and Arabic languages:

**Usage:**
```bash
# Set language via header
curl -X GET http://localhost:3000/v1/access-passes \
  -H "Accept-Language: ar"

# Set language via query parameter
curl -X GET http://localhost:3000/v1/access-passes?lng=ar
```

**Supported Languages:**
- English (en) - Default
- Arabic (ar) - Full RTL support

All API responses, error messages, and notifications are available in both languages.

### 2. Apple Wallet Integration

Generate PKPass files for iOS devices with NFC support:

**Setup:**
1. Place certificates in `certificates/apple/`:
   - `signerCert.pem` - Apple Wallet certificate
   - `signerKey.pem` - Private key
   - `wwdr.pem` - Apple WWDR certificate

2. Configure environment variables:
```env
APPLE_TEAM_ID=your-team-id
APPLE_PASS_TYPE_ID=pass.com.wusul.access
APPLE_CERT_PASSPHRASE=your-passphrase
```

**Usage:**
```bash
# Generate Apple Wallet pass
curl -X GET http://localhost:3000/v1/wallet/passes/{accessPassId} \
  -H "X-ACCT-ID: 0xYourAccountId" \
  -H "X-PAYLOAD-SIG: signature"
```

**Features:**
- NFC tap-to-unlock support
- Push notifications for updates
- Dynamic pass updates via web service
- Location-based notifications

### 3. Google Wallet Integration

Generate Google Wallet passes for Android devices:

**Setup:**
1. Create service account in Google Cloud Console
2. Place `service-account.json` in `certificates/google/`
3. Configure environment:
```env
GOOGLE_WALLET_ISSUER_ID=your-issuer-id
```

**Usage:**
```bash
# Generate Google Wallet pass URL
curl -X GET http://localhost:3000/v1/wallet/passes/{accessPassId} \
  -H "X-ACCT-ID: 0xYourAccountId" \
  -H "X-PAYLOAD-SIG: signature"
```

**Features:**
- Smart Tap (NFC) support
- Real-time pass updates
- QR code fallback
- Rich visual customization

### 4. SMS/Email Notifications

Automated notifications for access pass lifecycle events:

**Email Configuration (SMTP):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
SMTP_FROM=noreply@wusul.com
```

**SMS Configuration (Twilio):**
```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Notification Events:**
- ✉️ Access pass issued
- ✉️ Access pass suspended
- ✉️ Access pass resumed
- ✉️ Access pass expiring soon (7 days before)

**Features:**
- Bilingual templates (English & Arabic)
- HTML email templates
- SMS with shortened URLs
- Automatic delivery retry

## MENA-Specific Features

### Arabic Language Support

The API supports both English and Arabic:

```json
{
  "message": "Welcome to Wusul API",
  "message_ar": "مرحباً بك في واجهة برمجة التطبيقات وصول"
}
```

### Regional Compliance

- **Data Sovereignty**: Local hosting options in UAE and Saudi Arabia
- **Timezone Support**: Default timezone set to `Asia/Dubai`
- **Regional Identity Integration**: Support for UAE Pass and Absher (Saudi Arabia)

### Prayer Time Integration

When enabled, access schedules can automatically adjust for prayer times:

```env
ENABLE_PRAYER_TIME_INTEGRATION=true
```

## Development

### Running Tests

```bash
npm test
```

### Running Tests in Watch Mode

```bash
npm run test:watch
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Code Formatting

```bash
npm run format
```

### Database Management

```bash
# Open Prisma Studio
npm run prisma:studio

# Create a new migration
npm run prisma:migrate

# Reset database
npx prisma migrate reset
```

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Production Deployment

```bash
# Build production image
docker build -t wusul-api:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env.production \
  --name wusul-api \
  wusul-api:latest
```

### Environment Variables for Production

Ensure these are set in production:

```env
NODE_ENV=production
DATABASE_URL=<production-database-url>
REDIS_HOST=<production-redis-host>
JWT_SECRET=<strong-random-secret>
ACCOUNT_ID_SALT=<strong-random-salt>
SHARED_SECRET_SALT=<strong-random-salt>
```

## Security Considerations

1. **Never commit `.env` files** to version control
2. **Use strong random secrets** for production
3. **Enable HTTPS** in production (reverse proxy like Nginx)
4. **Rate limiting** is enabled by default
5. **Input validation** using Zod schemas
6. **SQL injection protection** via Prisma ORM
7. **XSS protection** via Helmet middleware

## Performance Optimization

- **Redis caching** for frequently accessed data
- **Database indexing** on frequently queried fields
- **Connection pooling** for PostgreSQL
- **Compression** for API responses
- **Horizontal scaling** ready with stateless design

## Monitoring & Logging

Logs are structured using Pino and include:

- Request/response logging
- Database query logging (development)
- Error logging with stack traces
- Webhook delivery tracking

### Log Levels

- `error`: Critical errors
- `warn`: Warning messages
- `info`: General information
- `debug`: Detailed debugging (development only)

## Roadmap

### Phase 1 (Current)
- ✅ Core API platform
- ✅ Access Pass management
- ✅ Card Template management
- ✅ Webhook system
- ✅ Docker deployment

### Phase 2 (Q2 2025) ✅ COMPLETED
- ✅ Apple Wallet integration
- ✅ Google Wallet integration
- ✅ SMS/Email notifications
- ✅ Multi-language support (full i18n)

### Phase 3 (Q3 2025)
- [ ] UAE Pass integration
- [ ] Absher integration
- [ ] Advanced analytics dashboard
- [ ] Mobile SDK

### Phase 4 (Q4 2025)
- [ ] Blockchain audit trail
- [ ] AI-powered anomaly detection
- [ ] IoT device integration
- [ ] Payment integration

## Contributing

This is a proprietary project for Wusul. Internal contributions welcome.

## Support

For support, please contact:
- Email: support@wusul.com
- Website: https://wusul.com

## License

Copyright © 2025 Wusul. All rights reserved.

This is proprietary software. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited.

---

**Built with ❤️ for the MENA Region | صُنع بحب لمنطقة الشرق الأوسط وشمال إفريقيا**
