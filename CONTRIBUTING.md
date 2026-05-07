# Contributing to AutoDocs+AutoIncident

First off, thank you for considering contributing to AutoDocs+AutoIncident! 🎉

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Include:

- **Clear use case**
- **Why this would be useful**
- **Possible implementation approach**

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes**:
   - Follow the coding style
   - Add tests for new features
   - Update documentation
3. **Test your changes**:
   ```bash
   npm test
   npm run test:coverage
   ```
4. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add incident bulk assignment"
   git commit -m "fix: resolve timezone issue in on-call"
   ```
5. **Push and create a PR**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/autodocs_incident.git
cd autodocs_incident

# Install dependencies
npm install

# Setup database
psql -U postgres -c "CREATE DATABASE autodocs_incident_dev;"
psql -U postgres -d autodocs_incident_dev -f database/schema.sql

# Copy environment file
cp .env.example .env

# Start development
npm run dev
```

## Coding Standards

### Backend (Node.js)
- Use ES6+ features
- Follow ESLint configuration
- Write unit tests for new functions
- Use async/await over callbacks

### Frontend (React)
- Use functional components with hooks
- Follow Next.js conventions
- Use TypeScript when possible
- Keep components small and focused

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- incidents.test.js

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## Documentation

- Update README.md if needed
- Add JSDoc comments for new functions
- Update API documentation
- Include examples for new features

## Review Process

1. **Automated checks** run on every PR
2. **Code review** by maintainers
3. **Testing** on staging environment
4. **Merge** after approval

## Questions?

- Open an issue for questions
- Email: api-support@autodocs.com
- Check existing documentation

---

Thank you for contributing! 🙏
