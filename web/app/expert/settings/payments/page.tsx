import type { Metadata } from "next";
import ExpertPlaceholderPage from "../../_components/ExpertPlaceholderPage";

export const metadata: Metadata = {
  title: "Payment settings — Expert settings",
};

export default function PaymentsSettingsPage() {
  return (
    <ExpertPlaceholderPage
      title="Payment settings"
      description="Add your bank account, UPI, or payment method for receiving payouts."
      related={[
        { href: "/expert/wallet", label: "Wallet" },
        { href: "/expert/earnings", label: "Earnings" },
      ]}
    />
  );
}
