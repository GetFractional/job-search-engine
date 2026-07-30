import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

async function read(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

async function productionBundleText() {
  const roots = [
    new URL("../dist/client/", import.meta.url),
    new URL("../dist/server/", import.meta.url),
  ];
  const files = [];

  async function walk(url) {
    for (const entry of await readdir(url, { withFileTypes: true })) {
      const next = new URL(entry.name, url);
      if (entry.isDirectory()) await walk(new URL(`${entry.name}/`, url));
      if (entry.isFile() && /\.(?:js|css|html)$/.test(entry.name)) {
        files.push(next);
      }
    }
  }

  for (const root of roots) await walk(root);
  return (await Promise.all(files.map((file) => readFile(file, "utf8")))).join(
    "\n",
  );
}

test("exposes stable public how-it-works and tools routes with alpha noindex", async () => {
  const [howRoute, toolsRoute] = await Promise.all([
    read("app/how-it-works/page.tsx"),
    read("app/tools/page.tsx"),
  ]);

  for (const route of [howRoute, toolsRoute]) {
    assert.match(route, /getChatGPTUser/);
    assert.match(route, /chatGPTSignInPath\("\/app\/home"\)/);
    assert.match(route, /index:\s*false/);
    assert.match(route, /follow:\s*false/);
    assert.match(route, /PublicContentPage/);
  }
  assert.match(howRoute, /kind="how-it-works"/);
  assert.match(toolsRoute, /kind="tools"/);
});

test("routes public navigation and homepage detail links to real pages", async () => {
  const [navigation, home] = await Promise.all([
    read("app/PublicNavigation.tsx"),
    read("app/PublicSite.tsx"),
  ]);

  assert.match(navigation, /href:\s*"\/how-it-works"/);
  assert.match(navigation, /href:\s*"\/tools"/);
  assert.match(navigation, /href:\s*"\/how-it-works#control"/);
  assert.doesNotMatch(
    navigation,
    /href:\s*"#(?:how-it-works|career-tools|trust)"/,
  );
  assert.match(home, /href="\/how-it-works"/);
  assert.match(home, /href="\/tools"/);
  assert.doesNotMatch(
    home,
    /href="#(?:how-it-works|career-tools|trust)"/,
  );
});

test("renders the real journey, bounded tools, and exact external-action boundary", async () => {
  const [content, bundle] = await Promise.all([
    read("app/PublicContentPage.tsx"),
    productionBundleText(),
  ]);
  const rendered = `${content}\n${bundle}`;

  for (const required of [
    /Create your private workspace/,
    /Build a reviewed Career Profile/,
    /Define your Job Standard and Job Paths/,
    /Add a current employer job/,
    /Review preliminary structured-field alignment/,
    /Choose what becomes a Pursuit/,
    /Edit the exact application package/,
    /Greenhouse, Lever, and Ashby/,
    /Requirement-level evidence comparison is not live/,
    /blocks a pursue recommendation/,
    /No automated broad job discovery/,
    /No live model-powered generation/,
    /No outreach, employer-form population, file upload, or submission/,
    /approval is not submission authorization/i,
  ]) {
    assert.match(rendered, required);
  }

  assert.doesNotMatch(
    rendered,
    /finds current jobs worth pursuing|automatically applies|guaranteed interview/i,
  );
});
