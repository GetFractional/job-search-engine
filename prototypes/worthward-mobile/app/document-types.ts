export type DocumentTemplateKey = "executive" | "classic" | "modern";
export type DocumentDensity = "comfortable" | "compact";
export type DocumentAccent = "forest" | "navy" | "charcoal";

export type DocumentDesign = {
  templateKey: DocumentTemplateKey;
  density: DocumentDensity;
  accent: DocumentAccent;
  fontScale: 95 | 100 | 105;
};

export type ResumeExperienceContent = {
  id: string;
  employer: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  summary: string;
  bullets: string[];
};

export type ResumeSkillGroup = {
  id: string;
  label: string;
  skills: string[];
};

export type ResumeContent = {
  schemaVersion: 1;
  targetTitle: string;
  summary: string;
  location: string;
  experiences: ResumeExperienceContent[];
  skillGroups: ResumeSkillGroup[];
  design: DocumentDesign;
  provenance: {
    source: "approved_profile" | "user_authored";
    unresolvedItems: string[];
  };
};

export type ResumeStudioRecord = {
  id: string;
  name: string;
  kind: "master" | "path" | "job";
  version: number;
  content: ResumeContent;
  templateKey: DocumentTemplateKey;
  reviewState: "draft" | "approved" | "superseded";
  assignment: {
    scope: "default" | "path" | "job";
    careerPathId: string | null;
    jobPostingId: string | null;
  } | null;
  updatedAt: number;
};

export type ResumeCareerPathOption = {
  id: string;
  label: string;
  state: "suggested" | "active" | "paused" | "rejected";
};

export type ResumeJobOption = {
  id: string;
  employer: string;
  title: string;
  freshnessState: "fresh" | "stale_risk" | "stale" | "removed" | "unknown";
};

export type CoverLetterContent = {
  schemaVersion: 1;
  employer: string;
  roleTitle: string;
  salutation: string;
  paragraphs: string[];
  closing: string;
  signoff: string;
  design: DocumentDesign;
  provenance: {
    source:
      | "approved_profile"
      | "approved_profile_and_posting"
      | "user_authored";
    unresolvedItems: string[];
  };
};

export type CoverLetterStudioRecord = {
  id: string;
  pursuitId: string;
  version: number;
  filename: string | null;
  content: CoverLetterContent;
  reviewState: "draft" | "claim_safe" | "approved" | "superseded";
  updatedAt: number;
};

export type DocumentPursuitOption = {
  id: string;
  employer: string;
  roleTitle: string;
  state: string;
};

export const defaultDocumentDesign: DocumentDesign = {
  templateKey: "executive",
  density: "comfortable",
  accent: "forest",
  fontScale: 100,
};

export function emptyResumeContent(): ResumeContent {
  return {
    schemaVersion: 1,
    targetTitle: "",
    summary: "",
    location: "",
    experiences: [],
    skillGroups: [],
    design: { ...defaultDocumentDesign },
    provenance: { source: "user_authored", unresolvedItems: [] },
  };
}

export function emptyCoverLetterContent(): CoverLetterContent {
  return {
    schemaVersion: 1,
    employer: "",
    roleTitle: "",
    salutation: "Dear Hiring Team,",
    paragraphs: [""],
    closing: "Thank you for your consideration.",
    signoff: "Sincerely,",
    design: { ...defaultDocumentDesign },
    provenance: { source: "user_authored", unresolvedItems: [] },
  };
}
