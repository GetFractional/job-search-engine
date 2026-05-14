#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$repo_root" ]]; then
  echo "This script must be run from inside the Job Search git repository." >&2
  exit 1
fi

hooks_dir="$repo_root/.githooks"
if [[ ! -d "$hooks_dir" ]]; then
  echo "Git hooks directory not found: $hooks_dir" >&2
  exit 1
fi

git config core.hooksPath .githooks
echo "Configured git hooks path to .githooks"
