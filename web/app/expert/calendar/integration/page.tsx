import type { Metadata } from "next";
import ExpertPlaceholderPage from "../../_components/ExpertPlaceholderPage";

export const metadata: Metadata = {
  title: "Calendar integration — Expert calendar",
};

export default function CalendarIntegrationPage() {
  return (
    <ExpertPlaceholderPage
      title="Calendar integration"
      description="Connect Google Calendar, Outlook, or other providers to sync your availability automatically."
      related={[
        { href: "/expert/availability", label: "Availability" },
        { href: "/expert/calendar/blocked-dates", label: "Blocked dates" },
      ]}
    />
  );
}
