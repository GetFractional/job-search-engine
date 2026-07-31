import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const read = (relativePath) =>
  readFileSync(path.join(appRoot, relativePath), "utf8");

function loadApplicationPackageContract() {
  const source = read("app/application-package.ts");
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const compiledModule = { exports: {} };
  new Function("exports", "module", javascript)(
    compiledModule.exports,
    compiledModule,
  );
  return compiledModule.exports;
}

function sourceSlice(source, start, end = null) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `expected source marker: ${start}`);
  const endIndex = end === null ? source.length : source.indexOf(end, startIndex);
  assert.notEqual(endIndex, -1, `expected source marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

function walkRouteFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkRouteFiles(target);
    return entry.isFile() && entry.name === "route.ts" ? [target] : [];
  });
}

const employerQuestionSet = {
  questionSetChecksum: "A".repeat(64),
  questionSet: [
    {
      label: "First name",
      required: true,
      fields: [
        {
          name: "job_application[first_name]",
          type: "input_text",
          values: [],
        },
      ],
    },
    {
      label: "Email address",
      required: true,
      fields: [
        {
          name: "job_application[email_address]",
          type: "input_text",
          values: [],
        },
      ],
    },
    {
      label: "LinkedIn profile",
      required: false,
      fields: [
        {
          name: "job_application[linkedin_profile]",
          type: "input_text",
          values: [],
        },
      ],
    },
    {
      label: "Will you now or in the future require sponsorship?",
      required: true,
      fields: [
        {
          name: "job_application[sponsorship]",
          type: "boolean",
          values: [],
        },
      ],
    },
    {
      label: "Preferred work setting",
      required: true,
      fields: [
        {
          name: "job_application[work_setting]",
          type: "select",
          values: [
            "Remote",
            { label: "Hybrid", value: "hybrid" },
            { name: "On-site", id: 3 },
            null,
          ],
        },
      ],
    },
    {
      label: "Resume",
      required: true,
      fields: [
        {
          name: "job_application[resume]",
          type: "input_file",
          values: [],
        },
      ],
    },
    {
      label: "Cover letter",
      required: false,
      fields: [
        {
          name: "job_application[cover_letter]",
          type: "input_file",
          values: [],
        },
      ],
    },
  ],
};

test("employer questions normalize answer keys, field types, choices, and asset slots", () => {
  const { applicationQuestionFields } = loadApplicationPackageContract();
  const fields = applicationQuestionFields(employerQuestionSet);

  assert.deepEqual(
    fields.map(({ key, semanticKey, inputType, required, assetType }) => ({
      key,
      semanticKey,
      inputType,
      required,
      assetType,
    })),
    [
      {
        key: "first_name__q1f1",
        semanticKey: "firstName",
        inputType: "input_text",
        required: true,
        assetType: null,
      },
      {
        key: "email_address__q2f1",
        semanticKey: "email",
        inputType: "input_text",
        required: true,
        assetType: null,
      },
      {
        key: "linkedin_profile__q3f1",
        semanticKey: "linkedInProfile",
        inputType: "input_text",
        required: false,
        assetType: null,
      },
      {
        key: "sponsorship__q4f1",
        semanticKey: "requiresSponsorship",
        inputType: "boolean",
        required: true,
        assetType: null,
      },
      {
        key: "work_setting__q5f1",
        semanticKey: "work_setting",
        inputType: "select",
        required: true,
        assetType: null,
      },
      {
        key: "resume__q6f1",
        semanticKey: "resume",
        inputType: "input_file",
        required: true,
        assetType: "resume",
      },
      {
        key: "cover_letter__q7f1",
        semanticKey: "cover_letter",
        inputType: "input_file",
        required: false,
        assetType: "cover_letter",
      },
    ],
  );
  assert.deepEqual(
    fields.find((field) => field.semanticKey === "work_setting")?.options,
    [
      { label: "Remote", value: "Remote" },
      { label: "Hybrid", value: "hybrid" },
      { label: "On-site", value: "3" },
    ],
  );
});

test("required gaps distinguish missing answers from accepted outbound files", () => {
  const {
    applicationQuestionFields,
    hasApplicationAnswer,
    requiredApplicationGaps,
  } = loadApplicationPackageContract();
  const fields = applicationQuestionFields(employerQuestionSet);
  const key = (semanticKey) =>
    fields.find((field) => field.semanticKey === semanticKey)?.key;

  assert.equal(hasApplicationAnswer({ consent: false }, "consent"), true);
  assert.deepEqual(
    requiredApplicationGaps(
      employerQuestionSet,
      {
        [key("email")]: "member@example.test",
        [key("requiresSponsorship")]: false,
        [key("work_setting")]: "Remote",
      },
      new Set(),
    ),
    ["First name", "Resume"],
  );
  assert.deepEqual(
    requiredApplicationGaps(
      employerQuestionSet,
      {
        [key("firstName")]: "Member",
        [key("email")]: "member@example.test",
        [key("requiresSponsorship")]: false,
        [key("work_setting")]: "Remote",
      },
      new Set(["resume"]),
    ),
    [],
  );
  assert.deepEqual(
    requiredApplicationGaps({}, {}, new Set()),
    ["The employer question set is unavailable."],
  );
});

test("provided application answers must match current field types and choices", () => {
  const {
    applicationQuestionFields,
    invalidApplicationAnswers,
  } = loadApplicationPackageContract();
  const fields = applicationQuestionFields(employerQuestionSet);
  const key = (semanticKey) =>
    fields.find((field) => field.semanticKey === semanticKey)?.key;

  assert.deepEqual(
    invalidApplicationAnswers(employerQuestionSet, {
      [key("email")]: "not-an-email",
      [key("linkedInProfile")]: "http://linkedin.com/in/member",
      [key("requiresSponsorship")]: "No",
      [key("work_setting")]: "Office",
    }),
    [
      "Email address is not a valid email address.",
      "LinkedIn profile must be a LinkedIn HTTPS URL.",
      "Will you now or in the future require sponsorship? must be answered Yes or No.",
      "Preferred work setting must use one of the employer's current choices.",
    ],
  );
  assert.deepEqual(
    invalidApplicationAnswers(employerQuestionSet, {
      [key("email")]: "member@example.test",
      [key("linkedInProfile")]: "https://www.linkedin.com/in/member",
      [key("requiresSponsorship")]: false,
      [key("work_setting")]: "hybrid",
    }),
    [],
  );
});

test("generic employer booleans use exact boolean answers and the shared Yes/No UI", () => {
  const {
    applicationQuestionFields,
    invalidApplicationAnswers,
    isBooleanApplicationQuestion,
  } = loadApplicationPackageContract();
  const sourceFacts = {
    questionSet: [
      {
        label: "Are you at least 18 years old?",
        required: true,
        fields: [
          {
            name: "job_application[age_confirmation]",
            type: "BOOLEAN",
            values: [],
          },
        ],
      },
    ],
  };
  const [field] = applicationQuestionFields(sourceFacts);

  assert.equal(field.inputType, "boolean");
  assert.equal(field.semanticKey, "age_confirmation");
  assert.equal(isBooleanApplicationQuestion(field), true);
  assert.deepEqual(
    invalidApplicationAnswers(sourceFacts, { [field.key]: "Yes" }),
    ["Are you at least 18 years old? must be answered Yes or No."],
  );
  assert.deepEqual(
    invalidApplicationAnswers(sourceFacts, { [field.key]: false }),
    [],
  );

  const app = read("app/WayAheadApp.tsx");
  const packageBuilder = sourceSlice(
    app,
    '<form className="wa-package-builder"',
    "</form>",
  );
  assert.match(packageBuilder, /isBooleanApplicationQuestion\(field\)/);
  assert.match(packageBuilder, /next\[field\.key\] = event\.target\.value === "yes"/);
  assert.doesNotMatch(
    packageBuilder,
    /field\.semanticKey === "requiresSponsorship"/,
  );
});

test("option-backed boolean fields preserve the employer's exact string choices", () => {
  const {
    applicationQuestionFields,
    invalidApplicationAnswers,
    isBooleanApplicationQuestion,
  } = loadApplicationPackageContract();
  const sourceFacts = {
    questionSet: [
      {
        label: "Can you perform the essential functions of this role?",
        required: true,
        fields: [
          {
            name: "job_application[essential_functions]",
            type: "boolean",
            values: [
              { label: "Yes", value: "confirmed_yes" },
              { label: "No", value: "confirmed_no" },
            ],
          },
        ],
      },
    ],
  };
  const [field] = applicationQuestionFields(sourceFacts);

  assert.equal(isBooleanApplicationQuestion(field), false);
  assert.deepEqual(
    invalidApplicationAnswers(sourceFacts, {
      [field.key]: "confirmed_yes",
    }),
    [],
  );
  assert.deepEqual(
    invalidApplicationAnswers(sourceFacts, { [field.key]: true }),
    [
      "Can you perform the essential functions of this role? must use one of the employer's current choices.",
    ],
  );
});

test("employer-provided sponsorship choices remain exact strings instead of boolean guesses", () => {
  const {
    applicationQuestionFields,
    invalidApplicationAnswers,
  } = loadApplicationPackageContract();
  const sourceFacts = {
    questionSet: [
      {
        label: "Will you now or in the future require sponsorship?",
        required: true,
        fields: [
          {
            name: "job_application[sponsorship]",
            type: "single_select",
            values: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ],
          },
        ],
      },
    ],
  };
  const [field] = applicationQuestionFields(sourceFacts);

  assert.deepEqual(
    invalidApplicationAnswers(sourceFacts, { [field.key]: "no" }),
    [],
  );
  assert.deepEqual(
    invalidApplicationAnswers(sourceFacts, { [field.key]: false }),
    [
      "Will you now or in the future require sponsorship? must use one of the employer's current choices.",
    ],
  );
});

test("required generic files and multi-selects fail closed as unsupported employer fields", () => {
  const {
    applicationQuestionFields,
    requiredApplicationGaps,
  } = loadApplicationPackageContract();
  const sourceFacts = {
    questionSet: [
      {
        label: "Portfolio",
        required: true,
        fields: [
          {
            name: "job_application[portfolio]",
            type: "input_file",
            values: [],
          },
        ],
      },
      {
        label: "Select all relevant certifications",
        required: true,
        fields: [
          {
            name: "job_application[certifications]",
            type: "multi_select",
            values: ["PMP", "SHRM"],
          },
        ],
      },
    ],
  };
  const fields = applicationQuestionFields(sourceFacts);

  assert.deepEqual(
    fields.map(({ assetType, isFileUpload, unsupportedReason }) => ({
      assetType,
      isFileUpload,
      unsupportedReason,
    })),
    [
      {
        assetType: null,
        isFileUpload: true,
        unsupportedReason: "unsupported required file upload",
      },
      {
        assetType: null,
        isFileUpload: false,
        unsupportedReason: "unsupported multi-select field",
      },
    ],
  );
  assert.deepEqual(
    requiredApplicationGaps(
      sourceFacts,
      {
        [fields[1].key]: ["PMP"],
      },
      new Set(["resume"]),
    ),
    [
      "Portfolio (unsupported required file upload)",
      "Select all relevant certifications (unsupported multi-select field)",
    ],
  );
});

test("distinct employer fields never collapse into one semantic answer key", () => {
  const {
    applicationQuestionFields,
    requiredApplicationGaps,
  } = loadApplicationPackageContract();
  const sourceFacts = {
    questionSet: [
      {
        label: "Phone number",
        required: true,
        fields: [{ name: "mobile_phone", type: "input_text", values: [] }],
      },
      {
        label: "Alternate phone number",
        required: true,
        fields: [{ name: "alternate_phone", type: "input_text", values: [] }],
      },
    ],
  };
  const fields = applicationQuestionFields(sourceFacts);

  assert.equal(fields[0].semanticKey, "phone");
  assert.equal(fields[1].semanticKey, "phone");
  assert.notEqual(fields[0].key, fields[1].key);
  assert.deepEqual(
    requiredApplicationGaps(
      sourceFacts,
      { [fields[0].key]: "555-0100" },
      new Set(),
    ),
    ["Alternate phone number"],
  );
});

test("resume-only, optional-letter, and required-letter forms select the correct package contract", () => {
  const {
    requiredApplicationGaps,
    sourceAcceptsAsset,
    sourceRequiresAsset,
  } = loadApplicationPackageContract();
  const resumeQuestion = {
    label: "Résumé",
    required: true,
    fields: [{ name: "resume", type: "input_file", values: [] }],
  };
  const coverLetterQuestion = (required) => ({
    label: "Cover letter",
    required,
    fields: [{ name: "cover_letter", type: "input_file", values: [] }],
  });
  const resumeOnly = { questionSet: [resumeQuestion] };
  const optionalLetter = {
    questionSet: [resumeQuestion, coverLetterQuestion(false)],
  };
  const requiredLetter = {
    questionSet: [resumeQuestion, coverLetterQuestion(true)],
  };

  assert.equal(sourceAcceptsAsset(resumeOnly, "resume"), true);
  assert.equal(sourceAcceptsAsset(resumeOnly, "cover_letter"), false);
  assert.equal(sourceRequiresAsset(resumeOnly, "cover_letter"), false);
  assert.deepEqual(
    requiredApplicationGaps(resumeOnly, {}, new Set(["resume"])),
    [],
  );

  assert.equal(sourceAcceptsAsset(optionalLetter, "cover_letter"), true);
  assert.equal(sourceRequiresAsset(optionalLetter, "cover_letter"), false);
  assert.deepEqual(
    requiredApplicationGaps(optionalLetter, {}, new Set(["resume"])),
    [],
  );

  assert.equal(sourceRequiresAsset(requiredLetter, "cover_letter"), true);
  assert.deepEqual(
    requiredApplicationGaps(requiredLetter, {}, new Set(["resume"])),
    ["Cover letter"],
  );
  assert.deepEqual(
    requiredApplicationGaps(
      requiredLetter,
      {},
      new Set(["resume", "cover_letter"]),
    ),
    [],
  );
});

test("question-set fingerprints accept either hex case but reject non-normalized input", () => {
  const { isQuestionSetChecksum } = loadApplicationPackageContract();
  const lowercase = "ab".repeat(32);
  const uppercase = lowercase.toUpperCase();

  assert.equal(isQuestionSetChecksum(lowercase), true);
  assert.equal(isQuestionSetChecksum(uppercase), true);
  assert.equal(isQuestionSetChecksum(` ${lowercase}`), false);
  assert.equal(isQuestionSetChecksum(`${lowercase} `), false);
  assert.equal(isQuestionSetChecksum(`sha256:${lowercase}`), false);
  assert.equal(isQuestionSetChecksum(lowercase.slice(1)), false);
  assert.equal(isQuestionSetChecksum(`${lowercase.slice(0, -1)}z`), false);
});

test("package, file-review, approval, and pursuit-event routes are member-authenticated and same-origin", () => {
  const routes = {
    package: read("app/api/application-package/route.ts"),
    review: read("app/api/pursuit-assets/review/route.ts"),
    approval: read("app/api/approvals/route.ts"),
    events: read("app/api/pursuit-events/route.ts"),
  };

  for (const route of Object.values(routes)) {
    assert.match(route, /requireUserRequest/);
    assert.match(route, /requireSameOrigin/);
    assert.match(route, /readBoundedJson/);
    assert.doesNotMatch(route, /requireFounderRequest/);
  }
  assert.match(routes.package, /buildApplicationPackage/);
  assert.match(routes.review, /markPursuitAssetClaimSafe/);
  assert.match(routes.approval, /approvePursuitPackage/);
  assert.match(routes.events, /recordPursuitEvent/);
});

test("repository package and claim-safe review bind exact current evidence to the member tenant", () => {
  const repository = read("app/workspace-repository.ts");
  const review = sourceSlice(
    repository,
    "export async function markPursuitAssetClaimSafe",
    "export async function buildApplicationPackage",
  );
  const applicationPackage = sourceSlice(
    repository,
    "export async function buildApplicationPackage",
    "const PURSUIT_EVENT_TYPES",
  );

  assert.match(review, /confirmation !== "confirm_claim_safe_file"/);
  assert.match(review, /ga\.id = \? AND ga\.user_id = \?/);
  assert.match(review, /review_state = 'claim_safe'/);
  assert.match(review, /client-render-receipt-v1/);
  assert.match(review, /current employer source and analysis/);
  assert.match(review, /sourceVersions\.jobPostingVersionId !== asset\.latest_job_posting_version_id/);
  assert.match(review, /sourceVersions\.analysisId !== asset\.current_analysis_id/);
  assert.match(review, /userReviewedExactFile: true/);
  assert.match(review, /externalActionAuthorized: false/);

  assert.match(applicationPackage, /p\.id = \? AND p\.user_id = \?/);
  assert.match(applicationPackage, /candidate\.user_id = \?/);
  assert.match(applicationPackage, /candidate\.review_state = 'claim_safe'/);
  assert.match(
    applicationPackage,
    /json_extract\(candidate\.source_versions_json, '\$\.jobPostingVersionId'\) = \?/,
  );
  assert.match(
    applicationPackage,
    /json_extract\(candidate\.source_versions_json, '\$\.analysisId'\) = \?/,
  );
  assert.match(
    applicationPackage,
    /SELECT current_pursuit\.user_id FROM pursuits current_pursuit[\s\S]*current_pursuit\.revision = \?/,
  );
  assert.match(applicationPackage, /context\.capture_state !== "verified"/);
  assert.match(applicationPackage, /context\.validation_state !== "trusted"/);
  assert.match(
    applicationPackage,
    /audit\.user_id = p\.user_id[\s\S]*AS source_recheck_verified_at/,
  );
  assert.match(
    applicationPackage,
    /context\.source_recheck_verified_at! >= packageBuiltAt - 24 \* 60 \* 60 \* 1000/,
  );
  assert.match(
    applicationPackage,
    /postingLastCheckedAt: context\.source_recheck_verified_at/,
  );
  assert.doesNotMatch(applicationPackage, /jp\.last_checked_at/);
  assert.doesNotMatch(applicationPackage, /context\.last_checked_at/);
  assert.match(applicationPackage, /answers\.questionSetChecksum = sourceChecksum\.toLowerCase\(\)/);
  assert.match(applicationPackage, /requiredApplicationGaps/);
  assert.match(applicationPackage, /invalidApplicationAnswers/);
  assert.match(applicationPackage, /employerFormPopulated: false/);
  assert.match(applicationPackage, /fileUploaded: false/);
  assert.match(applicationPackage, /applicationSubmitted: false/);
});

test("approval is bound to the latest exact package, revision, attestation, and readback", () => {
  const repository = read("app/workspace-repository.ts");
  const approval = sourceSlice(
    repository,
    "export async function approvePursuitPackage",
  );

  assert.match(approval, /confirmation !== "approve_application_package"/);
  assert.match(approval, /attestationVersion !== "application-package-staging-v1"/);
  assert.match(approval, /Number\.isInteger\(expectedRevision\)/);
  assert.match(approval, /pp\.id = \? AND pp\.user_id = \?/);
  assert.match(approval, /ORDER BY current_package\.version DESC LIMIT 1/);
  assert.match(approval, /packageRecord\.payload_sha256 !== payloadSha256/);
  assert.match(approval, /packageRecord\.blockers_json !== "\[\]"/);
  assert.match(approval, /packageRecord\.pursuit_revision !== expectedRevision/);
  assert.match(approval, /scope: "form_staging_only"/);
  assert.match(approval, /formPopulationAuthorized: false/);
  assert.match(approval, /fileUploadAuthorized: false/);
  assert.match(approval, /submissionAuthorized: false/);
  assert.match(
    approval,
    /WHERE id = \? AND user_id = \? AND revision = \? AND state = 'ready_for_approval'/,
  );
  assert.match(approval, /readback\.revision !== expectedRevision \+ 1/);
  assert.match(approval, /approval receipt could not be read back safely/);
});

test("there is no employer-form populate, file-upload, apply, or submit API endpoint", () => {
  const routeFiles = walkRouteFiles(path.join(appRoot, "app", "api"));
  const routeSegments = routeFiles.flatMap((routeFile) =>
    path
      .relative(path.join(appRoot, "app", "api"), path.dirname(routeFile))
      .split(path.sep)
      .filter(Boolean),
  );

  assert.deepEqual(
    routeSegments.filter((segment) =>
      new Set(["apply", "populate", "submit", "upload"]).has(segment),
    ),
    [],
  );

  const repository = read("app/workspace-repository.ts");
  const boundedPackageSurface = [
    sourceSlice(
      repository,
      "export async function markPursuitAssetClaimSafe",
      "export async function buildApplicationPackage",
    ),
    sourceSlice(
      repository,
      "export async function buildApplicationPackage",
      "const PURSUIT_EVENT_TYPES",
    ),
    sourceSlice(repository, "export async function approvePursuitPackage"),
  ].join("\n");
  assert.doesNotMatch(boundedPackageSurface, /\bfetch\s*\(/);
  assert.doesNotMatch(boundedPackageSurface, /\bFormData\b/);
  assert.doesNotMatch(boundedPackageSurface, /\.submit\s*\(/);
  assert.match(
    boundedPackageSurface,
    /Way Ahead still cannot populate the form, upload files, or submit the application/,
  );
});

test("pursuit lifecycle events are tenant-bound, member-reported, and append-only", () => {
  const repository = read("app/workspace-repository.ts");
  const events = sourceSlice(
    repository,
    "export async function recordPursuitEvent",
    "type GreenhouseJobResponse",
  );
  const integrityTriggers = JSON.parse(read("db/integrity-triggers.json"));
  const deleteTrigger = integrityTriggers.find(
    ({ name }) => name === "pursuit_events_delete_immutable",
  )?.sql;
  const updateTrigger = integrityTriggers.find(
    ({ name }) => name === "pursuit_events_update_immutable",
  )?.sql;
  const approvalAssetInsertTrigger = integrityTriggers.find(
    ({ name }) =>
      name === "external_action_approvals_asset_source_binding_insert",
  )?.sql;
  const approvalAssetUpdateTrigger = integrityTriggers.find(
    ({ name }) =>
      name === "external_action_approvals_asset_source_binding_update",
  )?.sql;

  assert.match(events, /confirmation !== "record_member_reported_event"/);
  assert.match(events, /FROM pursuits WHERE id = \? AND user_id = \?/);
  assert.match(events, /INSERT INTO pursuit_events/);
  assert.doesNotMatch(events, /UPDATE pursuit_events/);
  assert.doesNotMatch(events, /DELETE FROM pursuit_events/);
  assert.match(events, /provenance: "member_reported"/);
  assert.match(events, /platformExecutedExternalAction: false/);
  assert.doesNotMatch(events, /\bfetch\s*\(/);
  assert.match(deleteTrigger ?? "", /BEFORE DELETE ON `pursuit_events`/);
  assert.match(deleteTrigger ?? "", /pursuit events are append-only/);
  assert.match(updateTrigger ?? "", /BEFORE UPDATE ON `pursuit_events`/);
  assert.match(updateTrigger ?? "", /pursuit events are append-only/);
  for (const trigger of [
    approvalAssetInsertTrigger,
    approvalAssetUpdateTrigger,
  ]) {
    assert.match(trigger ?? "", /\$\.jobPostingVersionId/);
    assert.match(trigger ?? "", /\$\.analysisId/);
    assert.match(trigger ?? "", /current_pursuit\.`current_analysis_id`/);
  }
});

test("application submission requires an explicit approved package or explicit outside report and consumes only the exact approval", () => {
  const repository = read("app/workspace-repository.ts");
  const events = sourceSlice(
    repository,
    "export async function recordPursuitEvent",
    "type GreenhouseJobResponse",
  );

  assert.match(
    events,
    /Boolean\(packageId\) === reportedOutsideWayAhead/,
  );
  assert.match(
    events,
    /approval\.action = 'approve_application_package'/,
  );
  assert.match(
    events,
    /approval\.payload_sha256 = pp\.payload_sha256/,
  );
  assert.match(
    events,
    /approval\.state = 'approved'/,
  );
  assert.match(
    events,
    /\$\.sourceRecheck\.postingLastCheckedAt/,
  );
  assert.match(
    events,
    /postingLastCheckedAt'\) >= \(\? - 86400000\)/,
  );
  assert.match(
    events,
    /postingLastCheckedAt'\) <= \(\? \+ 300000\)/,
  );
  assert.match(
    events,
    /UPDATE external_action_approvals SET state = 'completed'/,
  );
  assert.match(
    events,
    /const nextExternalApprovalState = consumedApproval[\s\S]*\? "completed"/,
  );
  assert.match(
    events,
    /UPDATE pursuits SET state = \?, revision = revision \+ 1, external_approval_state = \?/,
  );
  assert.match(
    events,
    /\.bind\(\s*nextState,\s*nextExternalApprovalState,/,
  );
  assert.match(
    events,
    /consumedApproval\.id/,
  );
  assert.match(
    events,
    /\.\.\.verifiedMetadata/,
  );
});
