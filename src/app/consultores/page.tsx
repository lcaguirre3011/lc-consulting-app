import { ConsultantsScreen } from "@/components/screens";
import { Suspense } from "react";

export default function ConsultantsPage() {
  return (
    <Suspense fallback={null}>
      <ConsultantsScreen />
    </Suspense>
  );
}
