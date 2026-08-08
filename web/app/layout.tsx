import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";
import TopBar from "@/components/TopBar";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";


const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Embark India — Your MBA journey starts here",
    template: "%s — Embark India",
  },
  description: "MBA platform for tier-2 students — competitions, mentorship, playbooks, guest lectures.",
  keywords: [
    "MBA",
    "case competition",
    "mentorship",
    "playbooks",
    "guest lectures",
    "tier-2 colleges",
    "India",
  ],
  authors: [{ name: "Embark India" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};


export const viewport = {
  themeColor: "#2E6BFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`}>
      <body className="font-body antialiased bg-cream text-charcoal">
        <Providers>
          <TopBar />
          <Nav />
          <main>{children}</main>
          <Footer />
          <PwaInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
