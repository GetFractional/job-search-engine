#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
src_dir="$repo_root/.agents/skills"
codex_dest="${CODEX_HOME:-$HOME/.codex}/skills"
agents_dest="$HOME/.agents/skills"

mkdir -p "$codex_dest" "$agents_dest"

for skill_dir in "$src_dir"/*; do
  [ -d "$skill_dir" ] || continue
  skill_name="$(basename "$skill_dir")"

  mkdir -p "$codex_dest/$skill_name"
  cp -R "$skill_dir"/. "$codex_dest/$skill_name"/

  mkdir -p "$agents_dest/$skill_name"
  cp -R "$skill_dir"/. "$agents_dest/$skill_name"/
done

printf 'Synced skills from %s to %s and %s\n' "$src_dir" "$codex_dest" "$agents_dest"
