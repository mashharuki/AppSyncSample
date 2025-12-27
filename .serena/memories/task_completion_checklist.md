# Task Completion Checklist

When completing a development task, follow these steps:

## 1. Code Quality Checks
```bash
# Run linting
pnpm lint

# If there are issues, format the code
pnpm format

# Verify no linting errors remain
pnpm lint
```

## 2. Build Verification
```bash
# Build all packages
pnpm build

# Verify no TypeScript errors
# Check the build output for any compilation errors
```

## 3. Run Tests
```bash
# Run all tests
pnpm test

# For specific workspace
pnpm --filter cdk test
pnpm --filter shared test
pnpm --filter frontend test
```

## 4. Local Validation (if applicable)
```bash
# For CDK changes, synthesize to check CloudFormation template
pnpm synth

# For frontend changes, run dev server and test manually
pnpm dev
```

## 5. Git Workflow
```bash
# Check current status
git status

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add customer search functionality"

# Push to remote
git push
```

## Commit Message Convention
Follow conventional commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Build process or auxiliary tool changes

## Pre-deployment Checklist (for CDK changes)
- [ ] Run `pnpm lint` - no errors
- [ ] Run `pnpm build` - successful build
- [ ] Run `pnpm test` - all tests pass
- [ ] Run `pnpm synth` - CloudFormation template generated successfully
- [ ] Review the synthesized template for unexpected changes
- [ ] Commit changes to git
- [ ] Run `pnpm deploy` only after all checks pass

## Common Issues and Fixes
### Linting errors
```bash
pnpm format  # Auto-fix most formatting issues
pnpm lint    # Verify fixes
```

### Build errors
```bash
# Clear build artifacts and rebuild
rm -rf packages/*/dist packages/cdk/cdk.out
pnpm build
```

### Test failures
```bash
# Run tests in watch mode to debug
pnpm --filter <package> test:watch
```

## Notes
- Always run `pnpm lint` and `pnpm build` before committing
- Biome enforces strict rules - all errors must be fixed
- Tests use Vitest framework
- CDK stack should be synthesized successfully before deployment
