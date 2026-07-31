import { ProductRoutePage } from "../../../ProductRoutePage";

export const dynamic = "force-dynamic";

export default async function ResumeDetailPage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const { resumeId } = await params;
  const decodedResumeId = decodeURIComponent(resumeId);
  return (
    <ProductRoutePage
      documentId={decodedResumeId}
      returnPath={`/app/documents/resumes/${encodeURIComponent(decodedResumeId)}`}
      studio="resume"
      view="studio"
    />
  );
}
