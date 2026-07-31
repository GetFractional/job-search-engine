import { ProductRoutePage } from "../../../ProductRoutePage";

export const dynamic = "force-dynamic";

export default async function CoverLetterDetailPage({
  params,
}: {
  params: Promise<{ letterId: string }>;
}) {
  const { letterId } = await params;
  const decodedLetterId = decodeURIComponent(letterId);
  return (
    <ProductRoutePage
      documentId={decodedLetterId}
      returnPath={`/app/documents/cover-letters/${encodeURIComponent(decodedLetterId)}`}
      studio="cover"
      view="studio"
    />
  );
}
