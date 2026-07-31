import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const service = await readFile(new URL("../scripts/qa-service.sh", import.meta.url), "utf8");
const loopback = await readFile(
  new URL("../scripts/run-qa-loopback.sh", import.meta.url),
  "utf8",
);
const access = await readFile(new URL("../QA_ACCESS.md", import.meta.url), "utf8");

test("forces Remote QA through the exact-current-build restart path", () => {
  const remoteCase = service.match(/remote\)\n([\s\S]*?)\n    ;;/)?.[1] ?? "";
  assert.match(remoteCase, /start_service/);
  assert.doesNotMatch(remoteCase, /Reusing the healthy current QA preview/);
  assert.match(
    service,
    /wrangler d1 migrations apply DB[\s\S]*--local[\s\S]*--config wrangler\.local\.jsonc/,
  );
  assert.match(service, /start_service\(\)[\s\S]*npm run build/);
  assert.match(
    loopback,
    /vite preview --host 0\.0\.0\.0 --port 3011 --strictPort/,
  );
  assert.doesNotMatch(loopback, /vinext start/);
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

test("makes the authenticated hosted URL canonical across phone, laptop, and Remote", () => {
  assert.match(access, /same HTTPS URL is the supported route/);
  assert.match(access, /`localhost` means the iPhone itself/);
  assert.match(access, /Tailscale, NetBird, Dev Tunnels, and router changes are not required/);
  assert.match(access, /Do not switch to an unauthenticated public tunnel/);
});
