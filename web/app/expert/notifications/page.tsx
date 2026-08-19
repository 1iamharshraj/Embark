import type { Metadata } from "next";
import ExpertPlaceholderPage from "../_components/ExpertPlaceholderPage";

export const metadata: Metadata = {
  title: "Notifications — Expert hub",
};

export default function NotificationsPage() {
  return (
    <ExpertPlaceholderPage
      title="Notifications"
      description="See all alerts about bookings, DMs, reviews, payouts, and platform updates."
      related={[
        { href: "/expert/dashboard", label: "Dashboard" },
        { href: "/expert/settings/notifications", label: "Notification settings" },
      ]}
    />
  );
}
