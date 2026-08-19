import type { Metadata } from "next";
import ExpertPlaceholderPage from "../../_components/ExpertPlaceholderPage";

export const metadata: Metadata = {
  title: "About — Expert profile",
};

export default function AboutPage() {
  return (
    <ExpertPlaceholderPage
      title="About your public page"
      description="Add a longer bio, story, and what students can expect from working with you."
      related={[{ href: "/expert/profile/edit", label: "Back to profile" }]}
    />
  );
}
