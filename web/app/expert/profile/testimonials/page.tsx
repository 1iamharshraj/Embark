import type { Metadata } from "next";
import ExpertPlaceholderPage from "../../_components/ExpertPlaceholderPage";

export const metadata: Metadata = {
  title: "Profile testimonials — Expert profile",
};

export default function ProfileTestimonialsPage() {
  return (
    <ExpertPlaceholderPage
      title="Profile testimonials"
      description="Manage testimonials that appear directly on your public expert page."
      related={[
        { href: "/expert/profile/edit", label: "Back to profile" },
        { href: "/expert/testimonials", label: "All reviews" },
      ]}
    />
  );
}
