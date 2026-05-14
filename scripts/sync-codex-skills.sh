#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
src_dir="$repo_root/.agents/skills"
codex_dest="${CODEX_HOME:-$HOME/.codex}/skills"
agents_dest="$HOME/.agents/skills"
managed_marker=".job-search-managed-skills.txt"

mkdir -p "$codex_dest" "$agents_dest"

mapfile -t current_skill_names < <(find "$src_dir" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | LC_ALL=C sort)

sync_skill_mirror() {
  local destination_root="$1"
  local marker_path="$destination_root/$managed_marker"

  mkdir -p "$destination_root"

  if [[ -f "$marker_path" ]]; then
    while IFS= read -r managed_skill_name; do
      [[ -n "$managed_skill_name" ]] || continue
      if printf '%s\n' "${current_skill_names[@]}" | grep -Fxq "$managed_skill_name"; then
        continue
      fi

      rm -rf "$destination_root/$managed_skill_name"
    done < "$marker_path"
  fi

  for skill_name in "${current_skill_names[@]}"; do
    rm -rf "$destination_root/$skill_name"
    cp -R "$src_dir/$skill_name" "$destination_root/"
  done

  printf '%s\n' "${current_skill_names[@]}" > "$marker_path"
}

sync_skill_mirror "$codex_dest"
sync_skill_mirror "$agents_dest"

printf 'Synced skills from %s to %s and %s\n' "$src_dir" "$codex_dest" "$agents_dest"
