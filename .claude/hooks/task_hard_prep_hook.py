#!/usr/bin/env python3
"""Legacy compatibility hook.

This hook previously prepared claude-instance directories for the old /task_hard
workflow. The current configuration no longer requires that setup, but some
installations still reference this script during UserPromptSubmit. We keep a
harmless no-op here so the hook exits cleanly instead of blocking the prompt.
"""

from __future__ import annotations

import json
import sys


def main() -> None:
    try:
        # Drain stdin if JSON is provided so upstream pipes do not hang.
        _ = json.load(sys.stdin)
    except Exception:
        # If input is missing or invalid we still exit successfully.
        pass

    # No further action required.
    sys.exit(0)


if __name__ == "__main__":
    main()
