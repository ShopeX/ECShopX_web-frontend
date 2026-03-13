#!/usr/bin/env python3
"""Generate a deterministic i18n key from file path and source text."""

from __future__ import annotations

import hashlib
import sys


def build_key(relative_path: str, text: str) -> str:
    path_hash = hashlib.md5(relative_path.encode("utf-8")).hexdigest()[:8]
    text_hash = hashlib.md5(text.encode("utf-8")).hexdigest()[:6]
    return f"{path_hash}.{text_hash}"


def main() -> int:
    if len(sys.argv) != 3:
      sys.stderr.write("Usage: generate_i18n_key.py <relative_path> <text>\n")
      return 1

    relative_path, text = sys.argv[1], sys.argv[2]
    sys.stdout.write(f"{build_key(relative_path, text)}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
