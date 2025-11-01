# Changelog

All notable changes to the Wusul API project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Apple Wallet integration
- Google Wallet integration
- SMS/Email notification system
- Multi-language i18n support
- UAE Pass integration
- Absher integration

---

## [1.0.0] - 2025-01-15

### Added
- Initial release of Wusul API
- Complete API infrastructure with Node.js and TypeScript
- Dual authentication mechanism (X-ACCT-ID + X-PAYLOAD-SIG)
- Access Pass management endpoints
  - Issue access pass
  - List access passes
  - Update access pass
  - Suspend/Resume/Unlink/Delete access pass
- Card Template management endpoints (Enterprise)
  - Create card template
  - Read card template
  - Update card template
  - Publish card template
  - Read event logs
- Webhook system with CloudEvents specification
  - Access pass events
  - Card template events
  - Automatic retry mechanism
- PostgreSQL database with Prisma ORM
- Redis caching layer
- Comprehensive logging with Pino
- Request validation with Zod
- Rate limiting middleware
- Error handling middleware
- Docker and Docker Compose configuration
- Health check endpoint
- API documentation
- README and contributing guidelines
- MENA-specific features
  - Arabic language support
  - Regional timezone support (Asia/Dubai)
  - Prayer time integration (feature flag)
  - UAE Pass integration (planned)
  - Absher integration (planned)

### Security
- SHA256 payload signature verification
- Helmet security middleware
- Input sanitization and validation
- SQL injection protection via Prisma
- XSS protection
- Rate limiting

### Performance
- Redis caching
- Database connection pooling
- Request compression
- Optimized database queries
- Horizontal scaling ready

### Developer Experience
- TypeScript strict mode
- ESLint and Prettier configuration
- Jest testing framework
- Hot reload in development
- Structured logging
- Comprehensive error messages

---

## Version History

### Version Format

Given a version number MAJOR.MINOR.PATCH:

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

### Release Tags

- `[Unreleased]` - Changes in development
- `[1.0.0]` - First stable release

### Change Categories

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

---

## Links

- [Documentation](./README.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Contributing Guide](./CONTRIBUTING.md)
