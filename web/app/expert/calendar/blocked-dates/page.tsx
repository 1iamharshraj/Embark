import type { Metadata } from "next";
import ExpertPlaceholderPage from "../../_components/ExpertPlaceholderPage";

export const metadata: Metadata = {
  title: "Blocked dates — Expert calendar",
};

export default function BlockedDatesPage() {
  return (
    <ExpertPlaceholderPage
      title="Blocked dates"
      description="Mark holidays, travel days, or personal time off so students cannot book those slots."
      related={[
        { href: "/expert/availability", label: "Availability" },
        { href: "/expert/calendar/integration", label: "Calendar integration" },
      ]}
    />
  );
}
