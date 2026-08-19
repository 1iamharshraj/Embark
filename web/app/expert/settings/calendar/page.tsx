import type { Metadata } from "next";
import ExpertPlaceholderPage from "../../_components/ExpertPlaceholderPage";

export const metadata: Metadata = {
  title: "Calendar settings — Expert settings",
};

export default function CalendarSettingsPage() {
  return (
    <ExpertPlaceholderPage
      title="Calendar settings"
      description="Configure default availability, timezone, buffer time, and calendar integrations."
      related={[
        { href: "/expert/availability", label: "Availability" },
        { href: "/expert/calendar/integration", label: "Integrations" },
      ]}
    />
  );
}
