# Development & Commit Rules

## Why These Rules Matter

Following consistent development and commit practices ensures:
- **Maintainability**: Clear history makes debugging and feature tracking easier
- **Teamwork**: Standardized workflows reduce friction and improve collaboration
- **Traceability**: Well-documented changes enable quick issue identification and resolution
- **Automation**: Consistent patterns enable better CI/CD and tooling integration

---

## 🌿 Branch Naming Conventions

Use descriptive, lowercase names with hyphens as separators:

```bash
# Feature branches
feature/user-authentication
feature/payment-integration
feature/dashboard-redesign

# Bug fixes
fix/login-validation-error
fix/memory-leak-in-api
fix/responsive-layout-issues

# Refactoring
refactor/extract-service-layer
refactor/update-dependencies
refactor/optimize-database-queries

# Hotfixes (for production issues)
hotfix/security-patch-2024
hotfix/critical-bug-fix
hotfix/downgrade-dependency

# Release branches
release/v1.2.0
release/beta-features
release/prepare-production

# Documentation
docs/api-endpoints
docs/setup-guide
docs/README-update
```

**Rules:**
- Use kebab-case (lowercase with hyphens)
- Be descriptive but concise
- Include ticket number if applicable: `feature/PROJ-123-user-auth`
- Delete branches after merge to keep repository clean

---

## 📝 Commit Message Format (Conventional Commits)

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting, missing semi colons, etc. (no logic changes)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates, build process
- `ci`: CI/CD configuration changes
- `build`: Build system or dependency changes

### Examples
```bash
feat(auth): add OAuth2 integration with Google
fix(api): resolve user profile data validation error
docs(readme): update installation instructions for macOS
refactor(components): extract shared Button component from UI library
test(utils): add unit tests for validation helpers
chore(deps): update React from 18.2.0 to 18.3.0
perf(database): optimize query performance by 40%
```

**Rules:**
- Use lowercase for type
- Keep description under 50 characters
- Use imperative mood ("add" not "added" or "adds")
- Reference issue numbers in footer: `Closes #123`
- Break large changes into multiple logical commits

---

## 🔀 Pull Request Rules

### Before Creating PR
- [ ] Branch is up-to-date with target branch
- [ ] All tests pass locally
- [ ] Code follows project linting rules
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventional format
- [ ] No sensitive data or debug code included

### PR Template Checklist
```markdown
## Description
Brief description of changes and their purpose.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Browser compatibility verified

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process
1. **Automated Checks**: CI/CD pipeline must pass
2. **Code Review**: At least one team member approval
3. **Testing**: Verify all test suites pass
4. **Documentation**: Ensure docs are accurate
5. **Merge**: Squash and merge to maintain clean history

---

## 📁 Code Organization

### Frontend Structure (apps/web/)
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs)
│   └── features/       # Feature-specific components
├── pages/              # Route pages
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── services/           # API calls and external services
├── types/              # TypeScript type definitions
├── styles/             # Global styles and themes
└── tests/              # Test files
```

### Backend Structure (apps/api/)
```
src/
├── controllers/        # Request handlers
├── services/           # Business logic
├── models/             # Data models and schemas
├── middleware/         # Express middleware
├── routes/             # API route definitions
├── utils/              # Helper functions
├── types/              # TypeScript types
├── config/             # Configuration files
└── tests/              # Test files
```

**Rules:**
- Keep components small and focused
- Use absolute imports where possible
- Separate business logic from UI components
- Maintain consistent naming across packages
- Place tests alongside source files or in dedicated test directories

---

## ⏰ Commit Frequency and Atomicity

### When to Commit
- **After completing a logical unit of work**
- **Before switching to another task**
- **When reaching a stable, testable state**
- **At least daily** to avoid losing work

### What Makes a Good Commit
- **Atomic**: One logical change per commit
- **Testable**: Code compiles and tests pass
- **Descriptive**: Clear commit message explaining the change
- **Focused**: Don't mix unrelated changes
- **Reversible**: Easy to understand and revert if needed

### Examples of Good Commits
```bash
# ✅ Good - Single logical change
feat(auth): add password reset functionality

# ✅ Good - Focused fix
fix(forms): resolve validation error on email input

# ❌ Bad - Multiple unrelated changes
feat: add user auth and fix dashboard bug and update deps
```

---

## 🤖 Changelog Automation

### Recommended Tools

#### Option 1: Changesets
```bash
# Install
npm install @changesets/cli

# Initialize
npx changeset init

# Add changeset
npx changeset add

# Version and publish
npx changeset version
npx changeset publish
```

#### Option 2: Semantic Release
```bash
# Install
npm install semantic-release @semantic-release/changelog @semantic-release/git

# Configure (.releaserc.json)
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

### Benefits
- **Automatic versioning** based on commit types
- **Generated changelogs** from commit messages
- **Consistent releases** without manual version bumping
- **Integration with CI/CD** for automated publishing

---

## 🔧 Linting and Formatting Rules

### ESLint Configuration
- Use shared ESLint config from `packages/config`
- Enable TypeScript rules for type safety
- Configure React-specific rules for frontend
- Set up import ordering and naming conventions

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Pre-commit Hooks (Recommended)
```bash
# Install husky and lint-staged
npm install --save-dev husky lint-staged

# Package.json configuration
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

### Rules Enforcement
- **CI Pipeline**: Fail builds on linting errors
- **Pre-commit**: Auto-format and lint before commits
- **IDE Integration**: Use editor extensions for real-time feedback
- **Consistency**: Same rules across all packages and apps

---

## 🚀 Quick Reference

### Branch Creation
```bash
git checkout -b feature/user-authentication
```

### Commit Process
```bash
git add .
git commit -m "feat(auth): add OAuth2 integration"
git push origin feature/user-authentication
```

### Common Commands
```bash
# Check linting
npm run lint

# Fix formatting
npm run format

# Run tests
npm run test

# Check commit messages
npx commitlint --from HEAD~1
```

---

**Remember**: These rules are guidelines to help us work better together. If you have suggestions for improvements, please discuss them with the team!
