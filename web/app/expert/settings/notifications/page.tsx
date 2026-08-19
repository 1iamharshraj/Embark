import type { Metadata } from "next";
import ExpertPlaceholderPage from "../../_components/ExpertPlaceholderPage";

export const metadata: Metadata = {
  title: "Notification settings — Expert settings",
};

export default function NotificationSettingsPage() {
  return (
    <ExpertPlaceholderPage
      title="Notification settings"
      description="Choose how you want to be notified about bookings, DMs, messages, and payouts."
      related={[
        { href: "/expert/notifications", label: "All notifications" },
        { href: "/expert/settings", label: "General settings" },
      ]}
    />
  );
}
