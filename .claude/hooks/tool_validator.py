#!/usr/bin/env python3
"""
Tool Validator for VibeKeeper
Suggests modern CLI tools and Expo/React Native best practices.
Non-blocking - provides helpful suggestions only.
"""

import json
import sys


def extract_command(tool_input):
    """Extract command string from tool input."""
    if isinstance(tool_input, dict):
        return tool_input.get("command", "")
    return str(tool_input)


def check_expo_best_practices(command):
    """Check for Expo/React Native best practices and modern CLI tools."""
    suggestions = []

    # Suggest npx expo install for expo packages
    if "npm install expo" in command or "npm install @expo" in command:
        suggestions.append(
            "💡 Use 'npx expo install' for Expo packages (ensures SDK compatibility)"
        )

    # Suggest modern React Native CLI
    if "react-native run-ios" in command:
        suggestions.append("💡 Use 'npx expo run:ios' instead")
    elif "react-native run-android" in command:
        suggestions.append("💡 Use 'npx expo run:android' instead")

    # Suggest modern search tools
    if command.startswith("grep "):
        suggestions.append("💡 Consider 'rg' (ripgrep) for faster searching")
    elif command.startswith("find "):
        suggestions.append("💡 Consider 'fd' for faster file finding")

    # Suggest modern file viewers
    if command.startswith("cat "):
        suggestions.append("💡 Consider 'bat' for syntax-highlighted output")

    # Suggest modern directory listing
    if command.startswith("ls "):
        suggestions.append("💡 Consider 'eza' for better directory listing")

    # Suggest modern JSON/YAML tools
    if "cat" in command and (".json" in command or ".yaml" in command or ".yml" in command):
        if ".json" in command:
            suggestions.append("💡 Consider 'jq' for JSON viewing/filtering")
        else:
            suggestions.append("💡 Consider 'yq' for YAML viewing/filtering")

    # Suggest sed alternative
    if command.startswith("sed "):
        suggestions.append("💡 Consider 'sd' for faster pattern replacement")

    # Suggest git diff enhancement
    if "git diff" in command:
        suggestions.append("💡 Configure 'delta' for syntax-highlighted diffs: git config core.pager delta")

    # Suggest disk usage tools
    if command.startswith("du "):
        suggestions.append("💡 Consider 'dust' for interactive disk usage analysis")

    return suggestions


def main():
    try:
        hook_input = json.loads(sys.stdin.read())
        tool_name = hook_input.get("tool_name", hook_input.get("toolName", ""))
        tool_input = hook_input.get("tool_input", hook_input.get("toolInput", {}))

        # Only check Bash commands
        if tool_name == "Bash":
            command = extract_command(tool_input)
            suggestions = check_expo_best_practices(command)
            for suggestion in suggestions:
                print(suggestion, file=sys.stderr)

        sys.exit(0)
    except Exception:
        sys.exit(0)


if __name__ == "__main__":
    main()
