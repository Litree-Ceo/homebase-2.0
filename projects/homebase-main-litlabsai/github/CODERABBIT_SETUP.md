# CodeRabbit Integration Guide

## Quick Setup

### 1. Create CodeRabbit Config
Create `.coderabbit.yaml` in root:

```yaml
reviews:
  profile: "chill"
  request_changes: false
  auto_review: true
  auto_label_base_pr_only: true
  
language_specific_guidelines:
  typescript:
    - "Use strict mode"
    - "Prefer const over let"
    - "Use async/await over promises"
  
  javascript:
    - "Use ES6+ syntax"
    - "Avoid var"
    - "Use template literals"

rules:
  - type: "error"
    pattern: "console.log"
    message: "Remove console.log before merging"
  
  - type: "warning"
    pattern: "TODO|FIXME"
    message: "Address TODO/FIXME comments"

ignore:
  - "node_modules/**"
  - "dist/**"
  - ".next/**"
  - "coverage/**"
```

### 2. GitHub Actions Integration

Create `.github/workflows/coderabbit.yml`:

```yaml
name: CodeRabbit Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: CodeRabbit Review
        uses: coderabbitai/github-action@latest
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### 3. Enable in GitHub

1. Go to repository settings
2. Install CodeRabbit app
3. Configure permissions
4. Enable auto-review

### 4. Local Testing

```bash
# Install CodeRabbit CLI
npm install -g @coderabbit/cli

# Test configuration
coderabbit validate .coderabbit.yaml

# Review a PR locally
coderabbit review --pr <number>
```

## Features Enabled

✅ Automatic PR reviews  
✅ Code quality checks  
✅ Security scanning  
✅ Performance analysis  
✅ Best practices enforcement  
✅ Custom rules  

## Configuration Options

### Review Profiles
- `chill` - Minimal feedback
- `balanced` - Standard review
- `strict` - Comprehensive review

### Auto-labeling
- `bug` - Bug fixes
- `feature` - New features
- `refactor` - Code refactoring
- `docs` - Documentation
- `test` - Test changes

## Troubleshooting

### Reviews not appearing?
1. Check GitHub app permissions
2. Verify `.coderabbit.yaml` syntax
3. Check PR has actual changes

### Too many comments?
1. Adjust profile to "chill"
2. Add more ignore patterns
3. Disable specific rules

### Integration issues?
1. Reinstall GitHub app
2. Clear cache: `coderabbit cache clear`
3. Check logs: `coderabbit logs`

## Next Steps

1. Create `.coderabbit.yaml`
2. Add GitHub Actions workflow
3. Install CodeRabbit app
4. Create test PR
5. Review feedback
6. Adjust configuration

---

**Status**: Ready to integrate  
**Effort**: 5 minutes  
**Benefit**: Automated code reviews
