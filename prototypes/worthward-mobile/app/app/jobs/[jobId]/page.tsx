import { ProductRoutePage } from "../../ProductRoutePage";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const decodedJobId = decodeURIComponent(jobId);
  return (
    <ProductRoutePage
      jobId={decodedJobId}
      returnPath={`/app/jobs/${encodeURIComponent(decodedJobId)}`}
      view="jobs"
    />
  );
}
