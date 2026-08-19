import type { Metadata } from "next";
import ExpertPlaceholderPage from "../../_components/ExpertPlaceholderPage";

export const metadata: Metadata = {
  title: "Expertise — Expert profile",
};

export default function ExpertisePage() {
  return (
    <ExpertPlaceholderPage
      title="Expertise"
      description="Highlight the topics, industries, and skills you can help students with."
      related={[{ href: "/expert/profile/edit", label: "Back to profile" }]}
    />
  );
}
