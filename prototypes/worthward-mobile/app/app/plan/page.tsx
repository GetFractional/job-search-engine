import { ProductRoutePage } from "../ProductRoutePage";

export const dynamic = "force-dynamic";

export default function PlanPage() {
  return <ProductRoutePage returnPath="/app/plan" view="direction" />;
}
