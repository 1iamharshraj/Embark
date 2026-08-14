import type { Metadata } from "next";
import {
  Anton,
  Bricolage_Grotesque,
  Gloock,
  Inter,
  PT_Serif,
} from "next/font/google";
import "./globals.css";
import Providers from "./Providers";
import { LayoutShell } from "@/components/LayoutShell";


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

const gloock = Gloock({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-gloock",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-pt-serif",
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
    <html lang="en" className={`${bricolage.variable} ${inter.variable} ${gloock.variable} ${anton.variable} ${ptSerif.variable}`}>
      <body className="font-body antialiased bg-cream text-charcoal">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
