#!/bin/zsh

set -euo pipefail

session_name="my-way-ahead-qa"
remote_session_name="my-way-ahead-qa-awake"
script_dir="${0:A:h}"
project_dir="${script_dir:h}"
action="${1:-status}"
pid_file="/tmp/my-way-ahead-qa.pid"
caffeinate_pid_file="/tmp/my-way-ahead-qa-caffeinate.pid"
lock_dir="/tmp/my-way-ahead-qa.lock"
lock_owner_file="${lock_dir}/owner"
lock_acquired=0

release_lock() {
  local recorded_owner=""
  if (( ! lock_acquired )); then
    return 0
  fi
  if [[ -r "$lock_owner_file" ]]; then
    recorded_owner="$(<"$lock_owner_file")"
  fi
  if [[ "$recorded_owner" == "$$" ]]; then
    rm -f "$lock_owner_file"
    rmdir "$lock_dir" >/dev/null 2>&1 || true
  fi
  lock_acquired=0
}

release_lock_and_exit() {
  local exit_code="$1"
  trap - EXIT HUP INT TERM
  release_lock
  exit "$exit_code"
}

acquire_lock() {
  local attempt recorded_owner owner_command
  for attempt in {1..300}; do
    if mkdir "$lock_dir" 2>/dev/null; then
      print -r -- "$$" > "$lock_owner_file"
      lock_acquired=1
      trap release_lock EXIT
      trap 'release_lock_and_exit 129' HUP
      trap 'release_lock_and_exit 130' INT
      trap 'release_lock_and_exit 143' TERM
      return 0
    fi

    if [[ -r "$lock_owner_file" ]]; then
      recorded_owner="$(<"$lock_owner_file")"
      owner_command=""
      if [[ "$recorded_owner" == <-> ]]; then
        owner_command="$(/bin/ps -p "$recorded_owner" -o command= 2>/dev/null || true)"
      fi
      if [[ "$owner_command" != *"qa-service.sh"* ]]; then
        rm -f "$lock_owner_file"
        rmdir "$lock_dir" >/dev/null 2>&1 || true
        continue
      fi
    fi
    sleep 0.1
  done
  echo "Another Way Ahead QA lifecycle action is still running. Try again after it finishes."
  return 1
}

acquire_lock

session_running() {
  local session_list
  session_list="$(/usr/bin/screen -ls 2>/dev/null || true)"
  [[ "$session_list" == *".${session_name}"* ]]
}

remote_session_running() {
  local session_list
  session_list="$(/usr/bin/screen -ls 2>/dev/null || true)"
  [[ "$session_list" == *".${remote_session_name}"* ]]
}

port_running() {
  lsof -nP -iTCP:3011 -sTCP:LISTEN >/dev/null 2>&1
}

managed_process_running() {
  local managed_pid port_pid
  [[ -r "$pid_file" ]] || return 1
  managed_pid="$(<"$pid_file")"
  [[ "$managed_pid" == <-> ]] || return 1
  port_pid="$(lsof -tiTCP:3011 -sTCP:LISTEN 2>/dev/null | head -n 1)"
  [[ "$managed_pid" == "$port_pid" ]] || return 1
}

remote_guard_running() {
  local managed_pid remote_pid remote_command
  managed_process_running || return 1
  managed_pid="$(<"$pid_file")"
  [[ -r "$caffeinate_pid_file" ]] || return 1
  remote_pid="$(<"$caffeinate_pid_file")"
  [[ "$remote_pid" == <-> ]] || return 1
  remote_command="$(/bin/ps -p "$remote_pid" -o command= 2>/dev/null || true)"
  [[ "$remote_command" == "/usr/bin/caffeinate -is -w ${managed_pid}" ]]
}

stop_remote_guard() {
  local managed_pid="" remote_pid remote_command
  if remote_session_running; then
    /usr/bin/screen -S "$remote_session_name" -X quit
  fi
  if [[ ! -r "$caffeinate_pid_file" ]]; then
    return 0
  fi
  remote_pid="$(<"$caffeinate_pid_file")"
  if managed_process_running; then
    managed_pid="$(<"$pid_file")"
  fi
  remote_command=""
  if [[ "$remote_pid" == <-> ]]; then
    remote_command="$(/bin/ps -p "$remote_pid" -o command= 2>/dev/null || true)"
  fi
  if [[ -n "$managed_pid" && "$remote_command" == "/usr/bin/caffeinate -is -w ${managed_pid}" ]]; then
    kill "$remote_pid" >/dev/null 2>&1 || true
    for attempt in {1..30}; do
      if ! lsof -p "$remote_pid" >/dev/null 2>&1; then
        break
      fi
      sleep 0.1
    done
    if lsof -p "$remote_pid" >/dev/null 2>&1; then
      kill -KILL "$remote_pid" >/dev/null 2>&1 || true
    fi
  elif [[ -n "$remote_command" ]]; then
    echo "Ignored stale keep-awake PID ${remote_pid}; it does not belong to this QA preview."
  fi
  rm -f "$caffeinate_pid_file"
}

stop_managed_process() {
  local managed_pid
  if ! managed_process_running; then
    return 0
  fi
  managed_pid="$(<"$pid_file")"
  kill "$managed_pid" >/dev/null 2>&1 || true
  for attempt in {1..30}; do
    if [[ "$(lsof -tiTCP:3011 -sTCP:LISTEN 2>/dev/null | head -n 1)" != "$managed_pid" ]]; then
      rm -f "$pid_file"
      return 0
    fi
    sleep 0.1
  done
  kill -KILL "$managed_pid" >/dev/null 2>&1 || true
  rm -f "$pid_file"
}

stop_session() {
  stop_remote_guard
  stop_managed_process
  if session_running; then
    /usr/bin/screen -S "$session_name" -X quit
  fi
  for attempt in {1..50}; do
    if ! session_running && ! port_running; then
      return 0
    fi
    sleep 0.1
  done
  return 1
}

start_service() {
  cd "$project_dir"
  WRANGLER_LOG_PATH=".wrangler/wrangler.log" \
    ./node_modules/.bin/wrangler d1 migrations apply DB \
    --local \
    --config wrangler.local.jsonc
  npm run build
  if session_running || managed_process_running; then
    if ! stop_session; then
      echo "The prior managed QA session did not release port 3011."
      lsof -nP -iTCP:3011 -sTCP:LISTEN || true
      return 1
    fi
  fi
  if port_running; then
    echo "Port 3011 is already owned by another process. Stop it before starting Way Ahead QA."
    return 1
  fi
  /usr/bin/screen -dmS "$session_name" /bin/zsh "$script_dir/run-qa-loopback.sh"
  for attempt in {1..240}; do
    if curl -fs -o /dev/null http://127.0.0.1:3011/#/; then
      echo "Way Ahead QA is running at http://localhost:3011/#/"
      return 0
    fi
    sleep 0.25
  done
  echo "Way Ahead QA did not become healthy."
  if [[ -f /tmp/my-way-ahead-qa.log ]]; then
    tail -n 20 /tmp/my-way-ahead-qa.log
  fi
  return 1
}

case "$action" in
  start)
    start_service
    ;;
  remote)
    start_service
    if ! managed_process_running; then
      echo "The QA service started, but its managed preview process could not be verified."
      exit 1
    fi
    stop_remote_guard
    managed_pid="$(<"$pid_file")"
    /usr/bin/screen -dmS "$remote_session_name" /bin/zsh "$script_dir/run-qa-remote-guard.sh" "$managed_pid"
    for attempt in {1..40}; do
      if remote_guard_running; then
        echo "Remote QA is ready at http://localhost:3011/#/ and this Mac will resist idle sleep while the preview runs."
        echo "Keep the Mac logged in, connected, powered when practical, and open. Stop with npm run qa:remote:stop."
        exit 0
      fi
      sleep 0.1
    done
    echo "The QA service is healthy, but the temporary keep-awake guard did not start."
    exit 1
    ;;
  remote-status)
    if managed_process_running && curl -fsS -o /dev/null http://127.0.0.1:3011/#/ && remote_guard_running; then
      echo "Remote QA is healthy at http://localhost:3011/#/ and the temporary keep-awake guard is active."
    elif managed_process_running && curl -fsS -o /dev/null http://127.0.0.1:3011/#/; then
      echo "The QA service is healthy, but the temporary keep-awake guard is not active. Start it with npm run qa:remote."
      exit 1
    else
      echo "Remote QA is not ready. Start it with npm run qa:remote."
      exit 1
    fi
    ;;
  status)
    if managed_process_running && curl -fsS -o /dev/null http://127.0.0.1:3011/#/; then
      echo "Way Ahead QA is healthy at http://localhost:3011/#/"
    elif managed_process_running; then
      echo "Way Ahead QA process exists but is unhealthy."
      if [[ -f /tmp/my-way-ahead-qa.log ]]; then
        tail -n 20 /tmp/my-way-ahead-qa.log
      fi
      exit 1
    elif lsof -nP -iTCP:3011 -sTCP:LISTEN >/dev/null 2>&1; then
      echo "Port 3011 is active, but it is not owned by the managed Way Ahead QA session."
      exit 1
    else
      echo "Way Ahead QA is not running. Start it with npm run qa:laptop."
      exit 1
    fi
    ;;
  stop)
    stop_remote_guard
    if session_running || managed_process_running; then
      if stop_session; then
        echo "Way Ahead QA stopped."
      else
        echo "Way Ahead QA session did not stop cleanly."
        lsof -nP -iTCP:3011 -sTCP:LISTEN || true
        exit 1
      fi
    elif port_running; then
      echo "Port 3011 is active, but it is not owned by the managed Way Ahead QA process."
      exit 1
    else
      echo "Way Ahead QA was already stopped."
    fi
    ;;
  *)
    echo "Usage: $0 {start|remote|status|remote-status|stop}"
    exit 2
    ;;
esac
