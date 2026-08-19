import type { Metadata } from "next";
import ExpertPlaceholderPage from "../../_components/ExpertPlaceholderPage";

export const metadata: Metadata = {
  title: "Security — Expert settings",
};

export default function SecuritySettingsPage() {
  return (
    <ExpertPlaceholderPage
      title="Security"
      description="Change your password, manage active sessions, and enable two-factor authentication."
      related={[
        { href: "/expert/account", label: "Account" },
        { href: "/expert/settings", label: "General settings" },
      ]}
    />
  );
}
