import { ProductRoutePage } from "../../ProductRoutePage";

export const dynamic = "force-dynamic";

export default async function PursuitDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const decodedJobId = decodeURIComponent(jobId);
  return (
    <ProductRoutePage
      jobId={decodedJobId}
      returnPath={`/app/pursuits/${encodeURIComponent(decodedJobId)}`}
      view="pursuit"
    />
  );
}
