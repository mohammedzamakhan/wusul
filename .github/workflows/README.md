# GitHub Actions Workflows

This directory contains the CI/CD workflows for the Wusul monorepo.

## Workflows

### 1. CI (`ci.yml`)

**Triggers:** Pull requests and pushes to `main`

Runs comprehensive checks on the codebase:

- **Test API** - Runs API integration tests with PostgreSQL and Redis services
- **Test SDK** - Runs SDK unit tests
- **Lint & Format** - Checks code quality and formatting
- **Build Projects** - Builds both API and SDK packages
- **Nx Affected Check** - For PRs, only tests/builds affected projects (performance optimization)

**Features:**
- Uses Nx caching for faster builds
- Uploads code coverage to Codecov
- Creates build artifacts
- Continues on non-critical failures

### 2. Publish SDK (`publish-sdk.yml`)

**Triggers:**
- GitHub releases
- Manual workflow dispatch

Publishes the `wusul` package to NPM:

1. Builds the SDK
2. Runs tests
3. Publishes to NPM registry
4. Creates release summary

**Requirements:**
- `NPM_TOKEN` secret must be configured in repository settings
- Package version should be bumped before release

**Manual Publish:**
```bash
gh workflow run publish-sdk.yml --ref main
```

### 3. Deploy (`deploy.yml`)

**Triggers:**
- Pushes to `main`
- Manual workflow dispatch

Template for deploying the API to production.

**Note:** This is a template. Configure your deployment provider:
- Docker registries (Docker Hub, ECR, GCR, ACR)
- Container platforms (AWS ECS/EKS, Google Cloud Run, Azure Container Apps)
- PaaS providers (Railway, Render, Fly.io, Heroku)

### Deprecated

- `integration-tests.yml.bak` - Old workflow, kept for reference

## Nx Caching

All workflows use Nx caching to speed up builds:

```yaml
- name: Restore Nx cache
  uses: actions/cache@v3
  with:
    path: .nx/cache
    key: ${{ runner.os }}-nx-${{ hashFiles('**/package-lock.json') }}
```

This caches build outputs and task results between runs.

## Environment Variables

### CI Environment
The workflows automatically set up:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Node.js 20
- npm with caching

### Required Secrets

Configure these in Settings → Secrets and variables → Actions:

| Secret | Required For | Description |
|--------|--------------|-------------|
| `NPM_TOKEN` | publish-sdk.yml | NPM authentication token for publishing |
| `CODECOV_TOKEN` | ci.yml (optional) | Codecov token for coverage reports |

### Deployment Secrets (if using deploy.yml)

Add secrets based on your deployment platform:
- `DOCKER_USERNAME`, `DOCKER_PASSWORD` - Docker registry
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - AWS
- `GCP_SA_KEY` - Google Cloud
- `RAILWAY_TOKEN` - Railway
- etc.

## Running Workflows Locally

You can run the same commands locally:

```bash
# Run all tests
npm test

# Run API tests with services
docker-compose -f apps/api/docker-compose.yml up -d
npm run test:api
docker-compose -f apps/api/docker-compose.yml down

# Run SDK tests
npm run test:sdk

# Build all
npm run build

# Lint
npm run lint

# Check affected projects (compared to main)
npx nx affected:test --base=main
```

## Nx Affected Commands

For PRs, the `affected` job only runs tasks for changed projects:

```bash
# See what's affected
npx nx show projects --affected --base=origin/main

# Build only affected
npx nx affected --target=build --base=origin/main

# Test only affected
npx nx affected --target=test --base=origin/main
```

## Workflow Status

Check workflow status:
- On pull requests: Status checks appear at the bottom
- On the Actions tab: https://github.com/mohammedzamakhan/wusul/actions

## Troubleshooting

### Workflow Failures

1. **Prisma Client errors** - Ensure `prisma:generate` runs before build/test
2. **Cache issues** - Clear Nx cache: `npx nx reset`
3. **TypeScript errors** - Some API errors are expected (continue-on-error)
4. **NPM publish fails** - Check NPM_TOKEN secret and package version

### Debugging

Enable debug logging:
```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

### Manual Workflow Runs

Trigger manually via GitHub UI or CLI:
```bash
gh workflow run ci.yml --ref your-branch
gh workflow run publish-sdk.yml --ref main
```

## Best Practices

1. **Always run tests locally** before pushing
2. **Use Nx affected** for faster local development
3. **Keep workflows DRY** - Reuse common steps
4. **Document secrets** required for each workflow
5. **Monitor workflow run times** and optimize as needed

## Maintenance

- Review workflow performance monthly
- Update action versions (Dependabot recommended)
- Optimize Nx cache configuration
- Clean up old workflow runs (Settings → Actions → General)
