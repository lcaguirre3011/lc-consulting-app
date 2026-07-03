import { ProjectsScreen } from "@/components/screens";
import { Suspense } from "react";

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsScreen />
    </Suspense>
  );
}
