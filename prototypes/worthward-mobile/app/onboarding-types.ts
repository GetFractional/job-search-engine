import type { CareerPathRecord, JobStandardRecord } from "./production-types";

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

export const ONBOARDING_STEPS: ReadonlyArray<{
  id: OnboardingStep;
  shortLabel: string;
  title: string;
}> = [
  { id: 1, shortLabel: "Goal", title: "What should your next job change?" },
  { id: 2, shortLabel: "Experience", title: "Bring in your experience" },
  { id: 3, shortLabel: "Review", title: "Make your profile accurate" },
  { id: 4, shortLabel: "Standard", title: "Define a job worth taking" },
  { id: 5, shortLabel: "Paths", title: "Choose the paths worth exploring" },
  { id: 6, shortLabel: "Plan", title: "Review your search plan" },
];

export type OnboardingState = {
  account: {
    displayName: string;
    role: "owner" | "member";
  };
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  complete: boolean;
  goal: {
    priorities: string[];
    notes: string;
  } | null;
  careerInput: {
    sourceText: string | null;
    role: {
      employer: string;
      title: string;
      startDate: string | null;
      endDate: string | null;
      isCurrent: boolean;
      location: string | null;
      summary: string | null;
      reviewState: "draft" | "confirmed" | "conflict";
    } | null;
  };
  jobStandard: JobStandardRecord | null;
  careerPaths: CareerPathRecord[];
};

export type OnboardingStepPayload =
  | {
      step: 1;
      data: {
        priorities: string[];
        notes: string;
        consentAccepted: boolean;
      };
    }
  | {
      step: 2;
      data:
        | {
            method: "paste";
            careerText: string;
          }
        | {
            method: "file";
            originalName: string;
            contentType:
              | "application/pdf"
              | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              | "text/plain";
            byteSize: number;
            clientFileChecksumSha256: string;
            extractedText: string;
            pageCount: number | null;
            parser:
              | "pdfjs-browser-v1"
              | "mammoth-browser-v1"
              | "text-browser-v1";
          }
        | {
            method: "manual";
            role: {
              employer: string;
              title: string;
              startDate: string | null;
              endDate: string | null;
              isCurrent: boolean;
              location: string | null;
              summary: string | null;
            };
          };
    }
  | {
      step: 3;
      data: {
        confirmed: boolean;
      };
    }
  | {
      step: 4;
      data: Omit<JobStandardRecord, "id" | "version">;
    }
  | {
      step: 5;
      data: {
        paths: string[];
        primaryIndex: number;
      };
    }
  | {
      step: 6;
      data: {
        confirmed: boolean;
      };
    };
