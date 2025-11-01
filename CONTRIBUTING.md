# Contributing to Wusul

Thank you for your interest in contributing to Wusul! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Prioritize security and performance
- Write clear, maintainable code
- Document your changes

## Development Setup

1. **Fork and clone the repository**

```bash
git clone <your-fork-url>
cd wusul
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment**

```bash
cp .env.example .env
# Edit .env with your local configuration
```

4. **Start development environment**

```bash
docker-compose up -d
npm run prisma:migrate
npm run dev
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow TypeScript best practices
- Use existing patterns and conventions
- Add comments for complex logic
- Update documentation as needed

### 3. Write Tests

```bash
# Create test file
touch src/__tests__/your-feature.test.ts

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### 4. Commit Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new access pass validation"
git commit -m "fix: resolve authentication bug"
git commit -m "docs: update API documentation"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test updates
- `chore`: Maintenance

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:
- Clear title and description
- Link to related issues
- Screenshots (if UI changes)
- Test results

## Code Standards

### TypeScript

- Use strict TypeScript mode
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable names

```typescript
// Good
interface AccessPassData {
  fullName: string;
  email: string;
  expirationDate: Date;
}

// Bad
const data: any = { ... };
```

### Error Handling

- Use try-catch blocks
- Log errors appropriately
- Return meaningful error messages
- Use AppError class for custom errors

```typescript
try {
  const result = await someOperation();
  return result;
} catch (error) {
  logger.error({ error }, 'Operation failed');
  throw new AppError('OPERATION_FAILED', 'Failed to complete operation', 500);
}
```

### Database Operations

- Use Prisma ORM
- Implement proper transactions
- Handle connection errors
- Use database indexes

```typescript
// Good - Using transaction
await prisma.$transaction(async (tx) => {
  const pass = await tx.accessPass.create({ ... });
  await tx.eventLog.create({ ... });
});
```

### API Design

- Follow RESTful conventions
- Use proper HTTP methods
- Return appropriate status codes
- Include metadata in responses

```typescript
// Good
sendSuccess(res, data, 201);

// Bad
res.json({ data });
```

## Testing Guidelines

### Unit Tests

Test individual functions and methods:

```typescript
describe('generatePayloadSignature', () => {
  it('should generate correct signature', () => {
    const signature = generatePayloadSignature('secret', 'payload');
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');
  });
});
```

### Integration Tests

Test API endpoints:

```typescript
describe('POST /v1/access-passes', () => {
  it('should create access pass', async () => {
    const response = await request(app)
      .post('/v1/access-passes')
      .set('X-ACCT-ID', accountId)
      .set('X-PAYLOAD-SIG', signature)
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## Database Migrations

When modifying the database schema:

1. **Update Prisma Schema**

```prisma
// prisma/schema.prisma
model NewModel {
  id String @id @default(cuid())
  // ... fields
}
```

2. **Create Migration**

```bash
npm run prisma:migrate -- --name add_new_model
```

3. **Commit Migration Files**

```bash
git add prisma/migrations/
git commit -m "feat: add new model migration"
```

## Documentation

Update documentation when:
- Adding new API endpoints
- Changing existing behavior
- Adding configuration options
- Introducing breaking changes

Files to update:
- `README.md` - Overview and setup
- `API_DOCUMENTATION.md` - API endpoints
- Code comments - Complex logic
- JSDoc comments - Public functions

## Performance Guidelines

### Database Queries

- Use proper indexes
- Avoid N+1 queries
- Use pagination
- Implement caching

### API Responses

- Use compression
- Implement rate limiting
- Cache static data
- Minimize payload size

### Memory Management

- Clean up resources
- Avoid memory leaks
- Use streams for large files
- Implement proper garbage collection

## Security Guidelines

### Authentication

- Never commit secrets
- Use environment variables
- Implement proper validation
- Follow security best practices

### Input Validation

- Validate all inputs
- Sanitize user data
- Use Zod schemas
- Prevent injection attacks

### Dependencies

- Keep dependencies updated
- Review security advisories
- Use `npm audit`
- Avoid vulnerable packages

## Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows project conventions
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No sensitive data in code
- [ ] PR description is complete

## Review Process

1. **Automated Checks**
   - Tests must pass
   - Linting must pass
   - Build must succeed

2. **Code Review**
   - At least one approval required
   - Address all comments
   - Make requested changes

3. **Merge**
   - Squash and merge for feature branches
   - Rebase for bug fixes
   - Delete branch after merge

## Getting Help

- **Technical Questions**: Open a discussion
- **Bug Reports**: Create an issue
- **Feature Requests**: Create an issue with proposal
- **Security Issues**: Email security@wusul.com

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Thank you for contributing to Wusul! 🎉
