# Claude Code Configuration for VibeKeeper

**Status**: Revised for current project state (Pre-Development)

Modern, lightweight Claude Code setup for building a React Native/Expo mobile app from planning to production.

## 🎯 Philosophy

- **Reality-Based**: Works with what EXISTS, helps BUILD what doesn't
- **Lightweight**: Skills <3k tokens each for fast activation
- **Incremental**: Configure and build step-by-step
- **Practical**: Flexible rules, accepts pragmatic solutions

## 📦 Agent Skills (5 Foundational)

**Auto-activated** when relevant to your request:

1. **react-native-mobile** - Mobile development, Expo workflows, platform code
2. **project-setup** - Initialize TypeScript, database, state, testing
3. **testing** - Jest, React Native Testing Library, test patterns
4. **debugging** - Troubleshoot crashes, performance, build issues
5. **code-patterns** - React Native patterns and best practices

**Key**: Skills are GUIDES, not assumptions. They help you build infrastructure, not assume it exists.

## ⚡ Slash Commands (4 Essential)

**Manually invoked** for specific workflows:

- `/dev` - Quick start development server
- `/task [problem]` - Intelligent task routing (simple → direct, complex → investigator/planner)
- `/commit` - Create conventional commits with best practices
- `/code-review` - Review changes before committing

## 🤖 Specialized Agents (4 Workflow)

Used by `/task` for complex multi-file changes:

- **investigator** - Find related code across codebase
- **code-flow-mapper** - Trace execution paths and dependencies
- **planner** - Create detailed implementation plans
- **code-reviewer** - Quality and security review

## 🪝 Hooks (1 Helper)

- **tool_validator.py** - Suggests modern CLI tools (rg, fd), Expo best practices
  - **Non-blocking** - suggestions only, never prevents work
  - **No external dependencies** - uses `python3` directly

## 📁 Structure

```
.claude/
├── skills/                    # Auto-activated guides (5)
│   ├── react-native-mobile/
│   ├── project-setup/
│   ├── testing/
│   ├── debugging/
│   └── code-patterns/
├── commands/                  # Manual workflows (4)
│   ├── dev.md
│   ├── task.md
│   ├── commit.md
│   └── code-review.md
├── agents/                    # Complex task workflow (4)
│   ├── investigator.md
│   ├── code-flow-mapper.md
│   ├── planner.md
│   └── code-reviewer.md
├── hooks/                     # Tool suggestions (1)
│   └── tool_validator.py
├── settings.json              # Permissions & MCP config
└── README.md                  # This file

Root:
└── CLAUDE.md                  # **Most Important** - Project conventions & state
```

## 🚀 How It Works

### For Everyday Coding

Just ask naturally - skills activate automatically:

```
"Create a Button component with TypeScript"
→ react-native-mobile + code-patterns activate

"Set up the database with Drizzle ORM"
→ project-setup activates, guides through installation

"Why is Metro bundler failing?"
→ debugging activates with troubleshooting steps
```

### For Specific Workflows

Use slash commands:

```bash
/dev                    # Start dev server
/task [problem]         # Auto-routes: simple → direct, complex → full workflow
/commit                 # Commit with conventions
/code-review           # Review before push
```

### For Complex Changes

`/task` intelligently chooses workflow:

**Simple** (< 3 files, clear scope):
```
/task Add validation to login form
→ Reads files → Implements → Tests → Done
```

**Complex** (multiple files, unclear scope):
```
/task Refactor state management to Zustand
→ investigator finds all code
→ code-flow-mapper traces dependencies
→ planner creates detailed plan
→ Shows plan for approval
→ Executes after confirmation
```

## 🎨 Design Principles

1. **Check Before Using**: Verify infrastructure exists, install if missing
2. **Incremental Building**: Set up one system at a time
3. **Flexible Rules**: Backwards compatibility and fallbacks are acceptable
4. **Pragmatic Over Perfect**: Ship working code, iterate later
5. **Reality-Based**: Don't assume architecture exists - build it step by step

## 📚 Project-Specific

### Current Project State

**VibeKeeper** is a cigarette tracking mobile app in **Phase 0: Pre-Development**

**What EXISTS**:
- ✅ App.js (Expo template)
- ✅ package.json (expo, react, react-native)
- ✅ Comprehensive planning docs

**What's NOT built**:
- ❌ No src/ directory
- ❌ No TypeScript config
- ❌ No database layer
- ❌ No state management
- ❌ No testing setup

See `CLAUDE.md` in project root for complete project conventions and state.

## 🔧 Customization

### Add a Skill

Create `.claude/skills/my-skill/SKILL.md`:

```yaml
---
name: My Skill
description: What it does and when Claude should use it
allowed-tools: Bash, Read, Write
---

# My Skill

## When to Use
- List specific scenarios

## Guidance
Instructions for Claude
```

**Keep it <3k tokens** for fast activation!

### Add a Command

Create `.claude/commands/my-command.md`:

```markdown
## Instructions

What to do when invoked.

Problem: $ARGUMENTS
```

### Modify Hook

Edit `.claude/hooks/tool_validator.py`. Receives JSON on stdin:

```json
{
  "tool_name": "Bash",
  "tool_input": {"command": "npm install"}
}
```

**Must exit 0** to allow operation, exit non-zero to block.

## 💡 Best Practices

### When Starting Development

1. Read `CLAUDE.md` to understand current state
2. Check what infrastructure exists before using
3. Install missing dependencies before importing
4. Build incrementally, test each step

### Using Skills

- Skills activate automatically - just ask naturally
- They provide guidance, not assumptions
- They help BUILD infrastructure, not assume it exists

### Using /task

- Simple changes: `/task` handles directly
- Complex changes: `/task` uses investigator → planner workflow
- Always presents plan before execution

### Using Hooks

- Hooks suggest improvements (non-blocking)
- Suggestions for modern tools (rg > grep, fd > find)
- Warns about Expo best practices

## 🎯 Example Workflows

### Initialize TypeScript

```
"Set up TypeScript configuration"
→ project-setup skill activates
→ Installs dependencies
→ Creates tsconfig.json
→ Verifies compilation
```

### Create Component

```
"Create a LogButton component"
→ react-native-mobile + code-patterns activate
→ Checks if src/ exists (doesn't)
→ Offers to create structure first
→ Creates proper TypeScript component
```

### Complex Refactoring

```
/task Migrate from Context API to Zustand
→ Analyzes: Complex (multiple files)
→ investigator: Finds all Context usage
→ code-flow-mapper: Traces state flows
→ planner: Creates migration plan
→ Shows plan with file-by-file changes
→ After approval: Executes migration
→ Reports completion
```

## 🔐 Security & Privacy

- Minimal permissions (Expo/RN specific only)
- No external tool dependencies (only python3)
- Hooks are non-blocking suggestions
- All data stays local (offline-first)

## 📖 Key Files

- **CLAUDE.md** (root) - Project conventions, current state, tech stack
- **.claude/README.md** (this file) - Claude Code configuration guide
- **settings.json** - Permissions, MCP servers, hooks config
- **skills/** - Foundational guides (<3k tokens each)

## 🚦 Getting Started

1. **Read CLAUDE.md** to understand project state
2. **Ask naturally** - skills activate automatically
3. **Use /dev** to start development
4. **Use /task** for implementation work
5. **Use /commit** to save changes

Skills will guide you through setting up infrastructure as needed.

---

**Version**: 2.0 (Reality-Based)
**Last Updated**: 2025-10-22
**Ready for**: VibeKeeper development from Phase 0 → Production
