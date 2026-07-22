import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const service = await readFile(new URL("../scripts/qa-service.sh", import.meta.url), "utf8");
const access = await readFile(new URL("../QA_ACCESS.md", import.meta.url), "utf8");

test("forces Remote QA through the exact-current-build restart path", () => {
  const remoteCase = service.match(/remote\)\n([\s\S]*?)\n    ;;/)?.[1] ?? "";
  assert.match(remoteCase, /start_service/);
  assert.doesNotMatch(remoteCase, /Reusing the healthy current QA preview/);
  assert.match(service, /start_service\(\)[\s\S]*npm run build/);
});

test("serializes lifecycle commands through a project-scoped lock", () => {
  assert.match(service, /lock_dir="\/tmp\/my-way-ahead-qa\.lock"/);
  assert.match(service, /acquire_lock/);
  assert.match(service, /Another Way Ahead QA lifecycle action is still running/);
  assert.match(service, /release_lock_and_exit\(\)[\s\S]*exit "\$exit_code"/);
  assert.doesNotMatch(service, /trap release_lock EXIT HUP INT TERM/);
});

test("verifies keep-awake identity before reporting or terminating it", () => {
  assert.match(service, /\/usr\/bin\/caffeinate -is -w \$\{managed_pid\}/);
  assert.match(service, /Ignored stale keep-awake PID/);
});

test("keeps Remote host-browser proof separate from native iPhone Safari", () => {
  assert.match(access, /This Remote path supports host-browser review/);
  assert.match(access, /It is not native iPhone Safari/);
  assert.match(access, /Do not enable Tailscale Funnel/);
});
