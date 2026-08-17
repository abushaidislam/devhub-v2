import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard-shell";
import { SavedRecipeWorkspace } from "@/components/saved-recipe-workspace";

export const metadata: Metadata = {
  title: "Saved Recipes",
  description: "Manage versioned workflow recipes stored in this browser.",
  alternates: { canonical: "/recipes" },
  robots: { index: false, follow: true },
};

export default function RecipesPage() {
  return (
    <DashboardShell>
      <SavedRecipeWorkspace />
    </DashboardShell>
  );
}
