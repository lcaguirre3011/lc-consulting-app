import { CrmScreen } from "@/components/screens";
import { Suspense } from "react";

export default function CrmPage() {
  return (
    <Suspense fallback={null}>
      <CrmScreen />
    </Suspense>
  );
}
