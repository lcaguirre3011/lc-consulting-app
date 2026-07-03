import { ClientsScreen } from "@/components/screens";
import { Suspense } from "react";

export default function ClientsPage() {
  return (
    <Suspense fallback={null}>
      <ClientsScreen />
    </Suspense>
  );
}
