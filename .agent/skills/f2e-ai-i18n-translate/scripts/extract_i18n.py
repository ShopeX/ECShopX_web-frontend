#!/usr/bin/env python3
"""Helper script placeholder for extracting Chinese literals from plan-scoped files."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def main() -> int:
    payload = {"status": "placeholder", "files": sys.argv[1:]}
    sys.stdout.write(json.dumps(payload, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
