import { ProductRoutePage } from "../../ProductRoutePage";

export const dynamic = "force-dynamic";

export default async function PursuitDetailPage({
  params,
}: {
  params: Promise<{ pursuitId: string }>;
}) {
  const { pursuitId } = await params;
  const decodedPursuitId = decodeURIComponent(pursuitId);
  return (
    <ProductRoutePage
      jobId={decodedPursuitId}
      returnPath={`/app/pursuits/${encodeURIComponent(decodedPursuitId)}`}
      view="pursuit"
    />
  );
}
