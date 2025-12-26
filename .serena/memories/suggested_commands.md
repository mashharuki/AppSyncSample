# Suggested Commands

## Package Management
```bash
# Install dependencies
pnpm install

# Add dependency to specific workspace
pnpm add <package> --filter <workspace-name>
# Example: pnpm add react --filter frontend
```

## Development
```bash
# Start frontend dev server
pnpm dev
# Equivalent to: pnpm --filter frontend dev

# Build all packages
pnpm build
# Runs recursive build across all workspaces

# Run tests
pnpm test
# Runs tests in all workspaces

# Watch mode for CDK
pnpm --filter cdk watch
```

## Code Quality
```bash
# Run linting
pnpm lint
# Uses Biome to check all files

# Auto-format code
pnpm format
# Uses Biome to format and write changes

# Run tests in watch mode
pnpm --filter <package> test:watch
```

## AWS Deployment
```bash
# Deploy CDK stack to AWS
pnpm deploy
# Equivalent to: pnpm --filter cdk deploy

# Synthesize CloudFormation template (dry run)
pnpm synth
# Equivalent to: pnpm --filter cdk synth

# Destroy AWS resources
pnpm destroy
# Equivalent to: pnpm --filter cdk destroy
```

## Common Darwin/macOS Commands
```bash
# List files (macOS uses BSD ls)
ls -la

# Search for files
find . -name "*.ts"

# Search in files (use ripgrep if available, otherwise grep)
rg "pattern" --type ts
grep -r "pattern" .

# Git operations
git status
git add .
git commit -m "message"
git push
```

## Workspace-specific Commands
```bash
# CDK package
pnpm --filter cdk <command>
pnpm --filter cdk build
pnpm --filter cdk test
pnpm --filter cdk cdk <cdk-command>

# Frontend package (when it exists)
pnpm --filter frontend dev
pnpm --filter frontend build

# Shared package
pnpm --filter shared build
pnpm --filter shared test
```

## Troubleshooting
```bash
# Clear node_modules and reinstall
rm -rf node_modules packages/*/node_modules
pnpm install

# Clear CDK output
rm -rf packages/cdk/cdk.out

# Rebuild TypeScript
pnpm -r build
```
