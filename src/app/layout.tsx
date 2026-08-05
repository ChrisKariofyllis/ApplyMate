import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppHeader } from "@/components/ui/AppHeader";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ApplyMate",
  description: "AI-powered career matching and resume generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#0a0a0a] text-slate-50 antialiased`}
      >
        <AppHeader />
        <div className="min-h-[calc(100vh-3.5rem)]">{children}</div>
      </body>
    </html>
  );
}
