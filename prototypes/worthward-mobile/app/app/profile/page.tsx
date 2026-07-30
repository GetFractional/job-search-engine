import { ProductRoutePage } from "../ProductRoutePage";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return <ProductRoutePage returnPath="/app/profile" view="profile" />;
}
