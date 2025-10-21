## Instructions

Create a conventional commit following best practices. Do NOT auto-push.

1. **Check Status**:
   ```bash
   git status
   git diff
   ```

2. **Review Changes**:
   - Read the diff to understand what changed
   - Identify the type of change (feat, fix, refactor, docs, chore, etc.)
   - Determine scope (feature area affected)

3. **Stage Files**:
   ```bash
   git add [specific files]
   # or
   git add .
   ```

4. **Draft Commit Message**:
   - Follow [Conventional Commits](https://www.conventionalcommits.org/)
   - Format: `type(scope): description`
   - Types: feat, fix, refactor, docs, test, chore, style, perf
   - Keep subject line under 72 characters
   - Add body if changes need explanation

   Examples:
   ```
   feat(auth): add email validation to login form
   fix(stats): correct daily count calculation
   refactor(database): migrate to Drizzle ORM
   docs(readme): update setup instructions
   chore(deps): upgrade expo to 54.0.15
   ```

5. **Create Commit**:
   ```bash
   git commit -m "type(scope): description"
   # or with body
   git commit -m "type(scope): description" -m "Additional details here"
   ```

6. **Verify Commit**:
   ```bash
   git log -1
   ```

7. **Ask User About Push**:
   - Show commit summary
   - Ask: "Would you like to push this commit? (y/n)"
   - If yes: `git push`
   - If no: Done (user can push later)

## Guidelines

- **No co-authored-by** unless user explicitly requests
- **No auto-push** - always ask first
- **Descriptive messages** - explain why, not just what
- **Atomic commits** - one logical change per commit
- **Review before commit** - check diff first

## Example

User: "/commit"

Response:
1. Check git status and diff
2. Identify changes: "Added validation to LoginScreen.tsx and created validators.ts"
3. Stage files: `git add src/screens/LoginScreen.tsx src/utils/validators.ts`
4. Determine type: "feat" (new feature)
5. Determine scope: "auth" (authentication feature)
6. Create commit: `git commit -m "feat(auth): add email and password validation to login"`
7. Verify: Show commit log
8. Ask: "Commit created. Would you like to push to remote? (y/n)"
