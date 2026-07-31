import { ProductRoutePage } from "../ProductRoutePage";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <ProductRoutePage returnPath="/app/home" view="today" />;
}
