#!/bin/zsh

set -euo pipefail

script_dir="${0:A:h}"
project_dir="${script_dir:h}"
pid_file="/tmp/my-way-ahead-qa.pid"

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export WRANGLER_LOG_PATH=".wrangler/wrangler.log"

cd "$project_dir"

child_pid=""

stop_child() {
  trap - EXIT HUP INT TERM
  if [[ -n "$child_pid" ]] && kill -0 "$child_pid" >/dev/null 2>&1; then
    kill "$child_pid" >/dev/null 2>&1 || true
    for attempt in {1..30}; do
      if ! kill -0 "$child_pid" >/dev/null 2>&1; then
        break
      fi
      sleep 0.1
    done
    if kill -0 "$child_pid" >/dev/null 2>&1; then
      kill -KILL "$child_pid" >/dev/null 2>&1 || true
    fi
    wait "$child_pid" >/dev/null 2>&1 || true
  fi
  rm -f "$pid_file"
}

trap stop_child EXIT HUP INT TERM

./node_modules/.bin/vinext start --hostname 127.0.0.1 --port 3011 > /tmp/my-way-ahead-qa.log 2>&1 &
child_pid="$!"
print -r -- "$child_pid" > "$pid_file"

set +e
wait "$child_pid"
exit_code="$?"
set -e
rm -f "$pid_file"
child_pid=""
exit "$exit_code"
