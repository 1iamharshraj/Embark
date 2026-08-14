import { ReactNode } from "react";
import Container from "@/components/Container";
import { AccountNav } from "./_components/AccountNav";

interface AccountLayoutProps {
  children: ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <section className="bg-cream min-h-screen py-8 sm:py-12 lg:py-16">
      <Container>
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-10">
          <AccountNav />
          <main className="min-w-0">{children}</main>
        </div>
      </Container>
    </section>
  );
}
