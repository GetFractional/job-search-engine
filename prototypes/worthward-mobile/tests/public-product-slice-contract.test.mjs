import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const resumeStudio = read("app/ResumeStudio.tsx");
const coverLetterStudio = read("app/CoverLetterStudio.tsx");
const documents = read("app/document-repository.ts");
const app = read("app/WayAheadApp.tsx");
const today = read("app/today-repository.ts");
const todayUi = read("app/TodayDashboard.tsx");
const resumeApi = read("app/api/resumes/route.ts");
const coverLetterApi = read("app/api/cover-letters/route.ts");
const todayApi = read("app/api/today/route.ts");

test("document studios expose editable content, design, preview, and immutable saves", () => {
  assert.match(resumeStudio, /Content|content/);
  assert.match(resumeStudio, /Design|design/);
  assert.match(resumeStudio, /Preview|preview/);
  assert.match(resumeStudio, /Save new version/);
  assert.match(resumeStudio, /Job Path/);
  assert.match(resumeStudio, /Specific job/);
  assert.match(resumeStudio, /type="month"/);
  assert.match(resumeStudio, /Type a skill and press Enter/);
  assert.match(resumeStudio, /Each item stays separate/);
  assert.match(coverLetterStudio, /Save new version/);
  assert.match(coverLetterStudio, /Add paragraph/);
  assert.match(
    coverLetterStudio,
    /const showEmpty = !loading && !selected && !hasContent/,
  );
  assert.match(coverLetterStudio, /Build evidence-grounded outline/);
  assert.match(coverLetterStudio, /Nothing is uploaded or submitted/);
  assert.doesNotMatch(
    `${resumeStudio}\n${coverLetterStudio}`,
    /\b(sample|demo)\b/i,
  );
});

test("document writes are same-origin, user-scoped, versioned, and invalidate stale packages", () => {
  for (const api of [resumeApi, coverLetterApi]) {
    assert.match(api, /requireUserRequest/);
    assert.match(api, /requireSameOrigin/);
    assert.doesNotMatch(api, /requireFounderRequest/);
  }
  assert.match(documents, /WHERE r\.user_id = \?/);
  assert.match(documents, /WHERE ga\.user_id = \?/);
  assert.match(documents, /version_saved/);
  assert.match(documents, /readiness_state = 'superseded'/);
  assert.match(documents, /That resume version is not available/);
  assert.match(documents, /That cover-letter version is not available/);
  assert.doesNotMatch(documents, /role = 'owner'/);
});

test("claim-safe starters use confirmed profile state and do not claim AI", () => {
  assert.match(
    documents,
    /state IN \('user_confirmed', 'user_corrected'\)/,
  );
  assert.match(documents, /review_state = 'confirmed'/);
  assert.match(documents, /approval_state = 'approved'/);
  assert.match(documents, /deterministic-approved-profile-v1/);
  assert.doesNotMatch(documents, /openai|chat completion|responses api/i);
  assert.match(resumeStudio, /No invented experience is added/);
});

test("cover-letter starters disclose profile-only provenance and unresolved posting tailoring", () => {
  const starter = documents.slice(
    documents.indexOf("export async function createCoverLetterFromProfile"),
    documents.indexOf("export async function saveCoverLetterVersion"),
  );
  assert.match(starter, /source: "approved_profile"/);
  assert.doesNotMatch(starter, /source: "approved_profile_and_posting"/);
  assert.match(starter, /posting requirements have not been used to tailor/i);
  assert.match(starter, /My confirmed profile includes work as/);
  assert.match(starter, /comparing the current posting with my verified evidence/);
  assert.doesNotMatch(starter, /summary \|\|[\s\S]*role\.summary/);
  assert.doesNotMatch(starter, /role\.summary\.trim\(\)/);
  assert.match(documents, /postingFactsUsed: false/);
  assert.match(
    app,
    /Review the current posting and tailor every claim before approval/,
  );
  assert.doesNotMatch(app, /One truthful story, tailored to this role/);
});

test("Home is path-segmented, state-aware, and keeps priority distinct from outcome probability", () => {
  assert.match(todayApi, /requireUserRequest/);
  assert.match(today, /career_path_id/);
  assert.match(today, /0\.55/);
  assert.match(today, /0\.45/);
  assert.match(today, /source_checked_at/);
  assert.match(today, /validation_state/);
  assert.match(today, /JOIN resume_assignments/);
  assert.match(todayUi, /All paths/);
  assert.match(todayUi, /Opportunity scoreboard/);
  assert.match(todayUi, /Your job search, prioritized/);
  assert.match(todayUi, /hidden=\{activePursuits\.length === 0\}/);
  assert.match(todayUi, /hidden=\{documentGaps\.length === 0\}/);
  assert.match(
    `${today}\n${todayUi}`,
    /not the probability of an interview or offer/i,
  );
  assert.match(todayUi, /Pursuits needing you/);
  assert.match(todayUi, /Documents to strengthen/);
  assert.match(todayUi, /claim_safe/);
  assert.doesNotMatch(app, /criteriona/);
});
