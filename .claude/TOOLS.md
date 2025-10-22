# VibeKeeper Development Tools Reference

**Last Updated**: 2025-10-22
**Status**: Comprehensive tool inventory for Windows development

This document lists all installed modern CLI tools available on your Windows machine. Claude should prefer these tools over traditional alternatives for better performance and user experience.

## 🎯 Tool Philosophy

- **Modern**: Faster, more user-friendly than traditional Unix tools
- **Preferred**: Use these instead of grep, find, cat, ls, etc.
- **Cross-Platform**: Work well on Windows with proper output handling
- **Documented**: Tool validator hook will suggest these when appropriate

---

## 📋 Installed Tools

### Search & Find Tools

| Tool | Install | Purpose | Replaces | Notes |
|------|---------|---------|----------|-------|
| **ripgrep** (`rg`) | `winget install -e --id=BurntSushi.ripgrep.MSVC` | Fast recursive search | `grep`, `findstr` | Already enabled in settings |
| **fd** | `winget install -e --id=sharkdp.fd` | Fast file finding | `find` | Already enabled in settings |
| **fzf** | `winget install -e --id=junegunn.fzf` | Fuzzy finder | `grep` -i | Interactive filtering |
| **broot** | `winget install -e --id=Dystroy.broot` | Interactive tree explorer | `tree` | Navigate large codebases |

### File & Text Processing

| Tool | Install | Purpose | Replaces | Notes |
|------|---------|---------|----------|-------|
| **bat** | `winget install -e --id=sharkdp.bat` | Syntax-highlighted cat | `cat`, `type` | Use for file previews |
| **sd** | `winget install -e --id=chmln.sd` | Fast sed replacement | `sed` | Pattern matching & replace |
| **jq** | `winget install -e --id=jqlang.jq` | JSON processor | `grep`, `awk` | Parse/filter JSON |
| **yq** | `winget install -e --id=MikeFarah.yq` | YAML processor | `grep`, `awk` | Parse/filter YAML |
| **xsv** | `winget install -e --id=BurntSushi.xsv.GNU` | CSV processor | `awk`, `cut` | Handle CSV data |
| **miller** | `winget install -e --id=Miller.Miller` | CSV/JSON processor | `awk`, `sed` | Multi-format data |

### File & Disk Info

| Tool | Install | Purpose | Replaces | Notes |
|------|---------|---------|----------|-------|
| **eza** | `winget install -e --id=eza-community.eza` | Modern ls replacement | `ls` | Colored, better formatting |
| **duf** | `winget install -e --id=muesli.duf` | Disk usage | `du` | User-friendly output |
| **dust** | `winget install -e --id=bootandy.dust` | Disk usage explorer | `du`, `ncdu` | Interactive exploration |

### Development & System Tools

| Tool | Install | Purpose | Replaces | Notes |
|------|---------|---------|----------|-------|
| **delta** | `winget install -e --id=dandavison.delta` | Syntax-highlighted diff | `diff`, `git diff` | Better git diffs |
| **httpie** | `winget install -e --id=HTTPie.HTTPie` | HTTP client | `curl`, `wget` | User-friendly API testing |
| **bottom** | `winget install -e --id=Clement.bottom` | System monitor | `htop`, `tasklist` | Better process monitoring |
| **zoxide** | `winget install -e --id=ajeetdsouza.zoxide` | Smart cd | `cd` | Faster directory navigation |

---

## 🚀 Usage Examples

### Text Search (Use `rg` not grep)
```bash
# ❌ Don't do this
grep -r "somePattern" src/

# ✅ Do this instead
rg "somePattern" src/
```

### Finding Files (Use `fd` not find)
```bash
# ❌ Don't do this
find src -name "*.tsx" -type f

# ✅ Do this instead
fd "\.tsx$" src/
```

### View Files (Use `bat` not cat)
```bash
# ❌ Don't do this
cat package.json

# ✅ Do this instead
bat package.json
```

### List Directory (Use `eza` not ls)
```bash
# ❌ Don't do this
ls -la src/

# ✅ Do this instead
eza -la src/
```

### Parse JSON (Use `jq`)
```bash
# ✅ Extract value from JSON
jq '.scripts.start' package.json
```

### Git Diffs (Use `delta`)
```bash
# Configure git to use delta
git config core.pager delta
git diff
```

---

## 🔧 Tool Validator Hook

The `.claude/hooks/tool_validator.py` script monitors my tool usage and suggests modern alternatives. When I use traditional commands like:

- `grep` → suggests `rg`
- `find` → suggests `fd`
- `ls` → suggests `eza`
- Old React Native CLI → suggests `npx expo run:ios/android`

**Non-blocking**: These are suggestions only, never preventing work.

---

## 📝 Tool Validator Configuration

The `tool_validator.py` hook is configured in `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 .claude/hooks/tool_validator.py",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

---

## 🎯 When to Use Each Tool

### For VibeKeeper Development

| Task | Tool | Example |
|------|------|---------|
| Find TypeScript files | `fd` | `fd "\.tsx?$" src/` |
| Search component usage | `rg` | `rg "useLogStore" src/` |
| Check JSON syntax | `jq` | `jq empty package.json` |
| View formatted logs | `bat` | `bat docs/ERROR_LOG.md` |
| Find large files | `dust` | `dust src/` |
| Compare git changes | `delta` | `git diff` (auto via config) |
| List project files | `eza` | `eza -T src/ --ignore-glob=node_modules` |

---

## 📚 Integration with Claude Code

### Permissions Already Enabled
- ✅ `Bash(rg:*)` - ripgrep searches
- ✅ `Bash(fd:*)` - file finding

### Additional Tools to Suggest
When I encounter tasks like:
- Text replacement → suggest `sd`
- JSON manipulation → suggest `jq`
- Disk analysis → suggest `dust` or `duf`
- Directory navigation → suggest `zoxide`
- System monitoring → suggest `bottom`

---

## 🔧 Windows-Specific Setup Notes

The tool validator hook is configured to use `py` (Python launcher) instead of `python3` for compatibility on Windows. On Windows, `python3` is a Microsoft Store alias that doesn't work in hook contexts.

**Hook Configuration** (in `.claude/settings.local.json`):
```json
"command": "py .claude/hooks/tool_validator.py"
```

This ensures the hook runs correctly and suggests modern tools without errors.

---

**Note**: This file should be referenced in CLAUDE.md under "Development Tools" section. Claude will consult this when deciding which tools to use for any given task.
