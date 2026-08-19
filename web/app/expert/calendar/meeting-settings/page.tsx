import type { Metadata } from "next";
import ExpertPlaceholderPage from "../../_components/ExpertPlaceholderPage";

export const metadata: Metadata = {
  title: "Meeting settings — Expert calendar",
};

export default function MeetingSettingsPage() {
  return (
    <ExpertPlaceholderPage
      title="Meeting settings"
      description="Set your default meeting link, buffer time, cancellation policy, and reminders."
      related={[
        { href: "/expert/availability", label: "Availability" },
        { href: "/expert/settings/calendar", label: "Calendar settings" },
      ]}
    />
  );
}
