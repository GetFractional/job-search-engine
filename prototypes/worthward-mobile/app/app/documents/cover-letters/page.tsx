import { ProductRoutePage } from "../../ProductRoutePage";

export const dynamic = "force-dynamic";

export default function CoverLettersPage() {
  return (
    <ProductRoutePage
      returnPath="/app/documents/cover-letters"
      studio="cover"
      view="studio"
    />
  );
}
