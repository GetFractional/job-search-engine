import { ProductRoutePage } from "../ProductRoutePage";

export const dynamic = "force-dynamic";

export default function JobsPage() {
  return <ProductRoutePage returnPath="/app/jobs" view="jobs" />;
}
