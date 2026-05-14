#!/usr/bin/env bash
set -euo pipefail

sync_git_if_clean=false
skip_hook_install=false
verify_only=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --sync-git-if-clean)
      sync_git_if_clean=true
      ;;
    --skip-hook-install)
      skip_hook_install=true
      ;;
    --verify-only)
      verify_only=true
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
  shift
done

repo_root="$(git rev-parse --show-toplevel)"
sync_script="$repo_root/scripts/sync-codex-skills.sh"
install_hooks_script="$repo_root/scripts/install-job-search-githooks.sh"
source_skills_root="$repo_root/.agents/skills"
codex_skills_root="${CODEX_HOME:-$HOME/.codex}/skills"
agents_skills_root="$HOME/.agents/skills"

current_skill_names=()
while IFS= read -r skill_name; do
  current_skill_names+=("$skill_name")
done < <(find "$source_skills_root" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | LC_ALL=C sort)

test_skill_metadata() {
  local skill_file

  for skill_name in "${current_skill_names[@]}"; do
    skill_file="$source_skills_root/$skill_name/SKILL.md"

    if [[ ! -f "$skill_file" ]]; then
      echo "Missing SKILL.md: $skill_name"
      return 1
    fi

    if ! awk '
      NR == 1 {
        if ($0 != "---") {
          exit 1
        }
        in_frontmatter = 1
        next
      }
      in_frontmatter && $0 == "---" {
        if (has_name && has_description) {
          ok = 1
        }
        exit
      }
      in_frontmatter && /^name:[[:space:]]*[^[:space:]]/ {
        has_name = 1
      }
      in_frontmatter && /^description:[[:space:]]*[^[:space:]]/ {
        has_description = 1
      }
      END {
        exit ok ? 0 : 1
      }
    ' "$skill_file"; then
      echo "Invalid skill metadata: $skill_name"
      return 1
    fi
  done

  echo "Valid"
  return 0
}

if [[ "$skip_hook_install" != true && "$verify_only" != true ]]; then
  "$install_hooks_script"
fi

branch="$(git branch --show-current)"
commit="$(git rev-parse --short HEAD)"
upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || true)"
tracked_status="$(git status --porcelain --untracked-files=no)"
tracked_dirty=false
if [[ -n "$tracked_status" ]]; then
  tracked_dirty=true
fi
untracked_count="$(git status --porcelain | awk '/^\?\?/ { count += 1 } END { print count + 0 }')"
ahead=0
behind=0
git_sync_message="Git sync not requested."

if [[ -n "$upstream" ]]; then
  read -r behind ahead <<<"$(git rev-list --left-right --count "$upstream...HEAD")"
fi

if [[ "$sync_git_if_clean" == true ]]; then
  if [[ "$tracked_dirty" == true ]]; then
    git_sync_message="Skipped git sync because tracked changes are present."
  elif [[ -z "$upstream" ]]; then
    git_sync_message="Skipped git sync because the current branch has no upstream."
  else
    git fetch origin >/dev/null
    read -r behind ahead <<<"$(git rev-list --left-right --count "$upstream...HEAD")"

    if [[ "$ahead" -eq 0 && "$behind" -gt 0 ]]; then
      git pull --ff-only >/dev/null
      commit="$(git rev-parse --short HEAD)"
      behind=0
      git_sync_message="Fast-forwarded the current branch from upstream."
    elif [[ "$ahead" -gt 0 && "$behind" -gt 0 ]]; then
      git_sync_message="Skipped git sync because the branch has diverged from upstream."
    elif [[ "$ahead" -gt 0 ]]; then
      git_sync_message="Skipped git sync because local commits have not been pushed yet."
    else
      git_sync_message="Current branch already matches upstream."
    fi
  fi
fi

if [[ "$verify_only" != true ]]; then
  "$sync_script"
fi

test_directory_mirror() {
  local source_root="$1"
  local destination_root="$2"

  if [[ ! -d "$destination_root" ]]; then
    echo "Destination missing: $destination_root"
    return 1
  fi

  for skill_name in "${current_skill_names[@]}"; do
    if [[ ! -d "$destination_root/$skill_name" ]]; then
      echo "Missing skill directory: $skill_name"
      return 1
    fi

    if ! diff -qr "$source_root/$skill_name" "$destination_root/$skill_name" >/dev/null; then
      echo "Mismatch detected in $skill_name"
      return 1
    fi
  done

  echo "Mirrored"
  return 0
}

codex_reason="Mirrored"
agents_reason="Mirrored"
skill_metadata_reason="Valid"
codex_ok=true
agents_ok=true
skill_metadata_ok=true

if ! skill_metadata_reason="$(test_skill_metadata)"; then
  skill_metadata_ok=false
fi

if ! codex_reason="$(test_directory_mirror "$source_skills_root" "$codex_skills_root")"; then
  codex_ok=false
fi

if ! agents_reason="$(test_directory_mirror "$source_skills_root" "$agents_skills_root")"; then
  agents_ok=false
fi

hooks_path="$(git config --get core.hooksPath || true)"
hooks_ok=false
if [[ "$hooks_path" == ".githooks" ]]; then
  hooks_ok=true
fi

workspace_ready=false
if [[ "$tracked_dirty" == false && "$hooks_ok" == true && "$skill_metadata_ok" == true && "$codex_ok" == true && "$agents_ok" == true && -n "$upstream" && "$ahead" -eq 0 && "$behind" -eq 0 ]]; then
  workspace_ready=true
fi

if [[ "$workspace_ready" == true ]]; then
  echo "Workspace readiness: READY"
else
  echo "Workspace readiness: NOT READY"
fi
echo "Branch: $branch"
echo "Commit: $commit"
if [[ -n "$upstream" ]]; then
  echo "Upstream: $upstream"
else
  echo "Upstream: [none]"
fi
echo "Ahead/Behind: $ahead/$behind"
echo "Tracked changes present: $tracked_dirty"
echo "Untracked items: $untracked_count"
if [[ -n "$hooks_path" ]]; then
  echo "Hooks path: $hooks_path"
else
  echo "Hooks path: [unset]"
fi
echo "Codex skills mirror: $codex_reason"
echo "Agents skills mirror: $agents_reason"
echo "Skill metadata: $skill_metadata_reason"
echo "Git sync: $git_sync_message"

if [[ "$workspace_ready" != true ]]; then
  exit 1
fi
