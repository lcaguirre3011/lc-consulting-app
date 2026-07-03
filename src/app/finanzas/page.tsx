import { FinancialsScreen } from "@/components/screens";
import { Suspense } from "react";

export default function FinancialsPage() {
  return (
    <Suspense fallback={null}>
      <FinancialsScreen />
    </Suspense>
  );
}
