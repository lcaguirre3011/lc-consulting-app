import { RecipesEditorScreen } from "@/components/screens";
import { Suspense } from "react";

export default function RecipesPage() {
  return (
    <Suspense fallback={null}>
      <RecipesEditorScreen />
    </Suspense>
  );
}
