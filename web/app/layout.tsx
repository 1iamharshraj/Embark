import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";
import TopBar from "@/components/TopBar";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

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
  title: "Embark India — Your MBA journey starts here",
  description:
    "Embark India: guest lectures from verified industry experts, stream playbooks, and plain-spoken MBA guidance. Tell us where you are in the journey — we'll point you right.",
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
        </Providers>
      </body>
    </html>
  );
}
