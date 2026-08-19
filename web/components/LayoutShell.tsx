"use client";

import { usePathname } from "next/navigation";
import TopBar from "@/components/TopBar";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isExpertDash = pathname?.startsWith("/expert");

  return (
    <>
      {!isAdmin && !isExpertDash && <TopBar />}
      {!isAdmin && !isExpertDash && <Nav />}
      {children}
      {!isAdmin && !isExpertDash && <Footer />}
      {!isAdmin && !isExpertDash && <PwaInstallPrompt />}
    </>
  );
}

