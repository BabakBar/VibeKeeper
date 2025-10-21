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
    """Check for Expo/React Native best practices."""
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
