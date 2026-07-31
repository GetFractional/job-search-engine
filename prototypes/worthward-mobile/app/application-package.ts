export type ApplicationQuestionField = {
  key: string;
  semanticKey: string;
  label: string;
  required: boolean;
  inputType: string;
  options: Array<{ label: string; value: string }>;
  assetType: "resume" | "cover_letter" | null;
  isFileUpload: boolean;
  unsupportedReason: string | null;
};

type QuestionRecord = {
  label: string;
  required: boolean;
  fields: Array<{
    name: string;
    type: string;
    values: unknown[];
  }>;
};

function normalizedQuestionSet(sourceFacts: Record<string, unknown>): QuestionRecord[] {
  if (!Array.isArray(sourceFacts.questionSet)) return [];
  return sourceFacts.questionSet.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const question = entry as Record<string, unknown>;
    const label =
      typeof question.label === "string" && question.label.trim()
        ? question.label.trim()
        : "Employer question";
    const nestedFields = Array.isArray(question.fields)
      ? question.fields.flatMap((field) => {
          if (!field || typeof field !== "object" || Array.isArray(field)) {
            return [];
          }
          const record = field as Record<string, unknown>;
          return [
            {
              name: typeof record.name === "string" ? record.name.trim() : "",
              type: typeof record.type === "string" ? record.type.trim() : "",
              values: Array.isArray(record.values) ? record.values : [],
            },
          ];
        })
      : [];
    const fields = nestedFields.length
      ? nestedFields
      : [
          {
            name:
              typeof question.name === "string"
                ? question.name.trim()
                : typeof question.key === "string"
                  ? question.key.trim()
                  : typeof question.id === "string"
                    ? question.id.trim()
                    : "",
            type:
              typeof question.type === "string"
                ? question.type.trim()
                : "input_text",
            values: Array.isArray(question.values)
              ? question.values
              : Array.isArray(question.options)
                ? question.options
                : [],
          },
        ];
    return [{ label, required: question.required === true, fields }];
  });
}

function normalizedFieldKey(name: string, label: string): string {
  const bracketValue = name.match(/\[([^\]]+)\]$/)?.[1] ?? name;
  const normalizedName = bracketValue
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (normalizedName) return normalizedName;
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function knownAnswerKey(label: string, fallback: string): string {
  const normalized = label.toLowerCase();
  if (normalized.includes("first name")) return "firstName";
  if (normalized.includes("last name")) return "lastName";
  if (normalized === "email" || normalized.includes("email address")) {
    return "email";
  }
  if (normalized.includes("phone")) return "phone";
  if (normalized.includes("linkedin")) return "linkedInProfile";
  if (normalized.includes("sponsor")) return "requiresSponsorship";
  return fallback;
}

function normalizedOptions(values: unknown[]): Array<{ label: string; value: string }> {
  return values.flatMap((value) => {
    if (typeof value === "string" || typeof value === "number") {
      return [{ label: String(value), value: String(value) }];
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    const record = value as Record<string, unknown>;
    const rawValue =
      typeof record.value === "string" || typeof record.value === "number"
        ? String(record.value)
        : typeof record.id === "string" || typeof record.id === "number"
          ? String(record.id)
          : "";
    const label =
      typeof record.label === "string"
        ? record.label
        : typeof record.name === "string"
          ? record.name
          : rawValue;
    return rawValue ? [{ label, value: rawValue }] : [];
  });
}

function questionAssetType(
  label: string,
  fieldName: string,
  inputType: string,
): "resume" | "cover_letter" | null {
  if (!inputType.toLowerCase().includes("file")) return null;
  const normalized = `${label} ${fieldName}`.toLowerCase();
  if (normalized.includes("cover letter")) return "cover_letter";
  if (normalized.includes("resume") || normalized.includes("résumé")) {
    return "resume";
  }
  return null;
}

export function applicationQuestionFields(
  sourceFacts: Record<string, unknown>,
): ApplicationQuestionField[] {
  return normalizedQuestionSet(sourceFacts).flatMap((question, questionIndex) => {
    const fields = question.fields;
    return fields.map((field, index) => {
      const fallbackKey = normalizedFieldKey(
        field.name,
        fields.length > 1 ? `${question.label}_${index + 1}` : question.label,
      );
      const semanticKey = knownAnswerKey(question.label, fallbackKey);
      const isFileUpload = field.type.toLowerCase().includes("file");
      const assetType = questionAssetType(
        question.label,
        field.name,
        field.type,
      );
      const normalizedInputType = field.type.toLowerCase();
      const isUnsupportedMultiSelect =
        (normalizedInputType.includes("multi_select") ||
          normalizedInputType.includes("multiple")) &&
        !normalizedInputType.includes("single_select");
      return {
        key: `${fallbackKey || "field"}__q${questionIndex + 1}f${index + 1}`,
        semanticKey,
        label:
          fields.length > 1 && field.name
            ? `${question.label} (${field.name})`
            : question.label,
        required: question.required,
        inputType: normalizedInputType,
        options: normalizedOptions(field.values),
        assetType,
        isFileUpload,
        unsupportedReason:
          isFileUpload && !assetType
            ? "unsupported required file upload"
            : isUnsupportedMultiSelect
              ? "unsupported multi-select field"
              : null,
      };
    });
  });
}

export function isBooleanApplicationQuestion(
  field: ApplicationQuestionField,
): boolean {
  return field.inputType === "boolean" && field.options.length === 0;
}

export function sourceAcceptsAsset(
  sourceFacts: Record<string, unknown>,
  type: "resume" | "cover_letter",
): boolean {
  return applicationQuestionFields(sourceFacts).some(
    (field) => field.assetType === type,
  );
}

export function sourceRequiresAsset(
  sourceFacts: Record<string, unknown>,
  type: "resume" | "cover_letter",
): boolean {
  return applicationQuestionFields(sourceFacts).some(
    (field) => field.assetType === type && field.required,
  );
}

export function hasApplicationAnswer(
  answers: Record<string, unknown>,
  key: string,
): boolean {
  if (!Object.prototype.hasOwnProperty.call(answers, key)) return false;
  const value = answers[key];
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.trim().length > 0;
  return Array.isArray(value)
    ? value.length > 0
    : Boolean(value && typeof value === "object");
}

export function requiredApplicationGaps(
  sourceFacts: Record<string, unknown>,
  answers: Record<string, unknown>,
  assetTypes: Set<string>,
): string[] {
  if (!Array.isArray(sourceFacts.questionSet)) {
    return ["The employer question set is unavailable."];
  }
  return applicationQuestionFields(sourceFacts).flatMap((field) => {
    if (!field.required) return [];
    if (field.unsupportedReason) {
      return [`${field.label} (${field.unsupportedReason})`];
    }
    if (field.assetType) {
      return assetTypes.has(field.assetType) ? [] : [field.label];
    }
    return hasApplicationAnswer(answers, field.key) ? [] : [field.label];
  });
}

export function invalidApplicationAnswers(
  sourceFacts: Record<string, unknown>,
  answers: Record<string, unknown>,
): string[] {
  return applicationQuestionFields(sourceFacts).flatMap((field) => {
    if (
      field.isFileUpload ||
      field.assetType ||
      field.unsupportedReason ||
      !hasApplicationAnswer(answers, field.key)
    ) {
      return [];
    }
    const value = answers[field.key];
    if (
      field.semanticKey === "email" &&
      (typeof value !== "string" || !/^\S+@\S+\.\S+$/.test(value))
    ) {
      return [`${field.label} is not a valid email address.`];
    }
    if (
      field.semanticKey === "linkedInProfile" &&
      typeof value === "string" &&
      value &&
      !/^https:\/\/([a-z0-9-]+\.)?linkedin\.com\//i.test(value)
    ) {
      return [`${field.label} must be a LinkedIn HTTPS URL.`];
    }
    if (
      field.options.length > 0 &&
      !(
        typeof value === "string" &&
        field.options.some((option) => option.value === value)
      )
    ) {
      return [`${field.label} must use one of the employer's current choices.`];
    }
    if (isBooleanApplicationQuestion(field) && typeof value !== "boolean") {
      return [`${field.label} must be answered Yes or No.`];
    }
    return [];
  });
}

export function isQuestionSetChecksum(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}
