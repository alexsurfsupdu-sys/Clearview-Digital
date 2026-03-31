import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Clearview Digital | Custom Websites & Monthly Management",
  description:
    "Clearview Digital designs, builds, and manages custom websites for small businesses and growing brands.",
  openGraph: {
    title: "Clearview Digital | Custom Websites & Monthly Management",
    description:
      "Custom websites for small businesses and growing brands, with monthly management and ongoing support.",
    siteName: "Clearview Digital",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clearview Digital",
    description:
      "Custom websites and monthly management for small businesses and growing brands.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full scroll-smooth`}>
      <body className="min-h-full bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
