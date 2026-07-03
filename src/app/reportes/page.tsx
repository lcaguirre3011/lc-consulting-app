import { ReportsScreen } from "@/components/screens";
import { Suspense } from "react";

export default function ReportsPage() {
  return (
    <Suspense fallback={null}>
      <ReportsScreen />
    </Suspense>
  );
}
