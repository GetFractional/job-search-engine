#!/bin/zsh

set -euo pipefail

managed_pid="${1:-}"
pid_file="/tmp/my-way-ahead-qa-caffeinate.pid"

if [[ "$managed_pid" != <-> ]]; then
  echo "Usage: $0 <managed-preview-pid>"
  exit 2
fi

child_pid=""

stop_child() {
  trap - EXIT HUP INT TERM
  if [[ -n "$child_pid" ]]; then
    kill "$child_pid" >/dev/null 2>&1 || true
    wait "$child_pid" >/dev/null 2>&1 || true
  fi
  rm -f "$pid_file"
}

trap stop_child EXIT HUP INT TERM

/usr/bin/caffeinate -is -w "$managed_pid" > /tmp/my-way-ahead-qa-caffeinate.log 2>&1 &
child_pid="$!"
print -r -- "$child_pid" > "$pid_file"

set +e
wait "$child_pid"
exit_code="$?"
set -e
rm -f "$pid_file"
child_pid=""
exit "$exit_code"
