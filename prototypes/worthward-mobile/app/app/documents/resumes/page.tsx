import { ProductRoutePage } from "../../ProductRoutePage";

export const dynamic = "force-dynamic";

export default function ResumesPage() {
  return (
    <ProductRoutePage
      returnPath="/app/documents/resumes"
      studio="resume"
      view="studio"
    />
  );
}
