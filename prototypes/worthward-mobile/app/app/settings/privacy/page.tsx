import { ProductRoutePage } from "../../ProductRoutePage";

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <ProductRoutePage
      returnPath="/app/settings/privacy"
      view="account"
    />
  );
}
