# Team Collaboration Quick Reference

This is a condensed reference guide for our team collaboration protocols. For detailed information, refer to the [full Team Collaboration Protocols](team-collaboration.md).

## Communication Channels

| Channel | Purpose | Response Time |
|---------|---------|---------------|
| GitHub Issues | Task tracking, bugs, features | 24 hours |
| Slack | Quick questions, daily comms | 4 hours (work hours) |
| Email | External comms, announcements | 24 hours |
| Video Calls | Meetings, complex discussions | Scheduled |

## Git Workflow Cheatsheet

### Branches

- **main**: Production code
- **development**: Integration branch
- **feature/[name]**: New features
- **fix/[issue-number]**: Bug fixes
- **docs/[name]**: Documentation
- **refactor/[name]**: Code refactoring

### Common Git Commands

```bash
# Start a new feature
git checkout development
git pull
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "feat(component): add new feature"

# Update your branch with latest development changes
git checkout development
git pull
git checkout feature/my-feature
git merge development

# Push your branch
git push -u origin feature/my-feature
```

## Pull Request Checklist

- [ ] Branch is up to date with the base branch
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New code has test coverage
- [ ] Documentation is updated
- [ ] PR uses the appropriate template
- [ ] PR is linked to relevant issue(s)
- [ ] PR has appropriate reviewers assigned

## Code Review Etiquette

**As a reviewer:**
- Be respectful and constructive
- Review within 24 hours
- Approve only when all concerns are addressed

**As an author:**
- Keep PRs focused (<500 lines when possible)
- Respond to feedback promptly
- Be open to suggestions

## Meeting Schedule

- **Daily Standup**: Every workday, 10:00 AM (15 min)
- **Sprint Planning**: First Monday of sprint (1-2 hours)
- **Sprint Review**: Last Friday of sprint, 2:00 PM (1 hour)
- **Retrospective**: Last Friday of sprint, 3:00 PM (1 hour)

## SLA Response Times

| Priority | First Response | Resolution |
|----------|---------------|------------|
| Critical | 4 hours | 24 hours |
| High | 8 hours | 48 hours |
| Medium | 24 hours | 72 hours |
| Low | 48 hours | 1 week |

## Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Example:**
```
feat(auth): implement login functionality

- Add login form component
- Create authentication service
- Add unit tests

Resolves #123
```

## Documentation Locations

- **Code**: JSDoc comments in code files
- **API**: OpenAPI/Swagger files
- **User guides**: docs/user directory
- **Developer guides**: docs directory
- **Architecture**: docs/architecture

## Issue Templates

- **Bug Report**: For bugs or unexpected behavior
- **Feature Request**: For new features or enhancements
- **Technical Debt**: For code that needs refactoring
- **General Issue**: For other types of issues
