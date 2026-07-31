#!/usr/bin/env bash
set -eo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
scope="focused"
report_path=""

usage() {
  echo "Usage: $0 [--scope focused|full] [--report PATH]"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope)
      scope="${2:-}"
      shift 2
      ;;
    --report)
      report_path="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage >&2
      exit 2
      ;;
  esac
done

if [[ "$scope" != "focused" && "$scope" != "full" ]]; then
  echo "Invalid scope: $scope" >&2
  exit 2
fi

if [[ -z "$report_path" ]]; then
  report_path="$repo_root/tmp/way-ahead-skill-health-report.md"
elif [[ "$report_path" != /* ]]; then
  report_path="$repo_root/$report_path"
fi

mkdir -p "$(dirname "$report_path")"

failures=()
warnings=()
checks=()
skills=(
  "my-way-ahead-company-integrator"
  "my-way-ahead-offer-journey"
)

add_unique_skill() {
  local candidate="$1"
  local existing
  for existing in "${skills[@]}"; do
    [[ "$existing" == "$candidate" ]] && return 0
  done
  skills+=("$candidate")
}

if [[ "$scope" == "full" ]]; then
  while IFS= read -r skill_name; do
    add_unique_skill "$skill_name"
  done < <(
    find "$repo_root/.agents/skills" -mindepth 1 -maxdepth 1 -type d \
      -exec basename {} \; | LC_ALL=C sort
  )
else
  while IFS= read -r changed_path; do
    [[ -n "$changed_path" ]] || continue
    skill_name="${changed_path#.agents/skills/}"
    skill_name="${skill_name%%/*}"
    [[ -n "$skill_name" ]] && add_unique_skill "$skill_name"
  done < <(
    git -C "$repo_root" log --since="35 days ago" --name-only --pretty=format: \
      -- .agents/skills 2>/dev/null | LC_ALL=C sort -u
  )
fi

for skill_name in "${skills[@]}"; do
  skill_file="$repo_root/.agents/skills/$skill_name/SKILL.md"
  if [[ ! -f "$skill_file" ]]; then
    failures+=("Missing SKILL.md for $skill_name")
    continue
  fi

  first_line="$(sed -n '1p' "$skill_file")"
  metadata_end="$(awk 'NR > 1 && $0 == "---" { print NR; exit }' "$skill_file")"
  metadata_name="$(sed -n 's/^name:[[:space:]]*//p' "$skill_file" | head -n 1)"
  metadata_description="$(sed -n 's/^description:[[:space:]]*//p' "$skill_file" | head -n 1)"

  [[ "$first_line" == "---" ]] || failures+=("$skill_name: missing opening metadata delimiter")
  [[ -n "$metadata_end" ]] || failures+=("$skill_name: missing closing metadata delimiter")
  [[ "$metadata_name" == "$skill_name" ]] || failures+=("$skill_name: metadata name does not match directory")
  [[ -n "$metadata_description" ]] || failures+=("$skill_name: description is empty")

  if grep -Fiq "Keep Teal as the operating system" "$skill_file"; then
    failures+=("$skill_name: retired Teal operating-system instruction remains")
  fi
done
checks+=("Validated metadata, entrypoints, and retired-Teal drift for ${#skills[@]} skill(s)")

required_markers=(
  "AGENTS.md|adaptive, evidence-based work in progress"
  ".agents/skills/my-way-ahead-company-integrator/SKILL.md|Task count is an observed portfolio state, not policy"
  ".agents/skills/my-way-ahead-company-integrator/SKILL.md|founder dogfooding"
  ".agents/skills/my-way-ahead-company-integrator/SKILL.md|independent early tester"
  "docs/career-platform/company-os/my-way-ahead-company-operating-system-2026-07-20.md|adaptive, evidence-based work in progress"
  "docs/career-platform/strategy-system/18-career-os-customer-journey-screen-state-and-critical-path-2026-07-23.md|adaptive-WIP contract"
  "docs/career-platform/README.md|There is no permanent numeric initiative cap"
  "scripts/build_my_way_ahead_company_os.py|new-task-activation-prompt-2026-07-29.txt"
  "scripts/build_career_platform_strategy_pdfs.py|06-delivery-roadmap-founder-dogfooding.md"
)

for marker in "${required_markers[@]}"; do
  marker_file="${marker%%|*}"
  marker_text="${marker#*|}"
  if ! grep -Fq "$marker_text" "$repo_root/$marker_file"; then
    failures+=("Missing governance marker '$marker_text' in $marker_file")
  fi
done
checks+=("Checked adaptive-WIP, founder-dogfooding, and independent-tester governance markers")

governing_files=(
  "AGENTS.md"
  ".agents/skills/my-way-ahead-company-integrator/SKILL.md"
  "docs/career-platform/company-os/my-way-ahead-company-operating-system-2026-07-20.md"
  "docs/career-platform/company-os/way-ahead-active-goal-contract-2026-07-24.md"
  "docs/career-platform/company-os/new-task-activation-prompt-2026-07-29.txt"
  "docs/career-platform/strategy-system/00-start-here.md"
  "docs/career-platform/strategy-system/09-founder-strategy-center-delivery-control.md"
  "docs/career-platform/strategy-system/11-board-ceo-dynamic-expert-operating-graph.md"
  "docs/career-platform/strategy-system/17-public-multi-user-alpha-job-supply-and-growth-architecture-2026-07-23.md"
  "docs/career-platform/strategy-system/18-career-os-customer-journey-screen-state-and-critical-path-2026-07-23.md"
  "docs/career-platform/README.md"
  "scripts/build_my_way_ahead_company_os.py"
  "scripts/build_career_platform_strategy_pdfs.py"
)

retired_pattern='exactly two active (initiatives|parent initiatives|parent tasks|parents)|keep (exactly|only|no more than) two active|two-item WIP cap|work in progress is capped at two|only Private-Alpha Readiness and Matt Case Study Zero may be active'
for relative_path in "${governing_files[@]}"; do
  if grep -Ein "$retired_pattern" "$repo_root/$relative_path" >/dev/null; then
    failures+=("Retired fixed-WIP policy remains in governing file $relative_path")
  fi
done
checks+=("Scanned current governing surfaces for retired fixed-WIP policy")

required_current_files=(
  "docs/career-platform/company-os/new-task-activation-prompt-2026-07-29.txt"
  "docs/career-platform/strategy-system/06-delivery-roadmap-founder-dogfooding.md"
  "docs/career-platform/strategy-system/16-founder-feedback-product-reset-2026-07-21.md"
  "docs/career-platform/strategy-system/17-public-multi-user-alpha-job-supply-and-growth-architecture-2026-07-23.md"
  "docs/career-platform/strategy-system/18-career-os-customer-journey-screen-state-and-critical-path-2026-07-23.md"
  "docs/career-platform/strategy-system/19-free-ai-foundation-and-provider-gate-2026-07-29.md"
)
for relative_path in "${required_current_files[@]}"; do
  [[ -f "$repo_root/$relative_path" ]] || failures+=("Missing current canonical source $relative_path")
done
checks+=("Verified current generator source references exist")

for relative_path in \
  "docs/career-platform/README.md" \
  "scripts/build_my_way_ahead_company_os.py" \
  "scripts/build_career_platform_strategy_pdfs.py"; do
  if grep -Ein 'case study zero|Matt.s (first|next-best-job) case' "$repo_root/$relative_path" >/dev/null; then
    failures+=("Retired separate-case framing remains in current operator surface $relative_path")
  fi
done
checks+=("Rejected separate Case Study Zero framing in current operator and generator surfaces")

validator="${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py"
if [[ -f "$validator" ]] && command -v python3 >/dev/null 2>&1; then
  for skill_name in "${skills[@]}"; do
    if ! python3 "$validator" "$repo_root/.agents/skills/$skill_name" >/dev/null; then
      failures+=("$skill_name: official quick_validate.py failed")
    fi
  done
  checks+=("Ran official quick_validate.py")
else
  warnings+=("Official quick_validate.py unavailable in this runtime; metadata fallback ran")
fi

for mirror_root in "${CODEX_HOME:-$HOME/.codex}/skills" "$HOME/.agents/skills"; do
  if [[ ! -d "$mirror_root" ]]; then
    warnings+=("Mirror unavailable: $mirror_root")
    continue
  fi
  for skill_name in "${skills[@]}"; do
    if [[ ! -d "$mirror_root/$skill_name" ]]; then
      failures+=("Missing mirror: $mirror_root/$skill_name")
    elif ! diff -qr "$repo_root/.agents/skills/$skill_name" "$mirror_root/$skill_name" >/dev/null; then
      failures+=("Mirror drift: $mirror_root/$skill_name")
    fi
  done
done
checks+=("Compared available managed-skill mirrors")

commit="$(git -C "$repo_root" rev-parse HEAD)"
branch="$(git -C "$repo_root" branch --show-current)"
generated_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
status="PASS"
[[ ${#failures[@]} -gt 0 ]] && status="FAIL"

{
  echo "# Way Ahead Skill Health Audit"
  echo
  echo "- Generated: \`$generated_at\`"
  echo "- Scope: \`$scope\`"
  echo "- Branch: \`$branch\`"
  echo "- Commit: \`$commit\`"
  echo "- Deterministic gate: **$status**"
  echo "- Skills selected: ${#skills[@]}"
  echo
  echo "## Checks"
  echo
  for check in "${checks[@]}"; do
    echo "- $check"
  done
  echo
  echo "## Findings"
  echo
  if [[ ${#failures[@]} -eq 0 ]]; then
    echo "- No deterministic failure found."
  else
    for failure in "${failures[@]}"; do
      echo "- **FAIL:** $failure"
    done
  fi
  for warning in "${warnings[@]}"; do
    echo "- **NOTE:** $warning"
  done
  echo
  echo "## Required review"
  echo
  echo "The automation is intentionally read-only. Complete the semantic and behavioral review using:"
  echo
  echo "- \`.agents/skills/my-way-ahead-company-integrator/references/skill-audit-contract.md\`"
  echo "- the authority fixture and the scheduled rotating fixture;"
  echo "- all fixtures when scope is \`full\`;"
  echo "- a no-change receipt or a separately reviewed corrective PR."
} > "$report_path"

echo "Way Ahead skill audit: $status"
echo "Report: $report_path"

[[ "$status" == "PASS" ]]
