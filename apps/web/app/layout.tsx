import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MentorSir — PTP 2.0 | UPSC Prelims Mentorship",
  description:
    "India's most structured UPSC Prelims mentorship. GS, CSAT & Current Affairs with 1-on-1 guidance from 118+ scorers and IIT/IIM graduates.",
  keywords: "UPSC, Prelims 2026, UPSC mentorship, PTP 2.0, IAS preparation, CSAT, Current Affairs",
  openGraph: {
    title: "MentorSir — Crack UPSC Prelims 2026",
    description: "Smart Structure. Right Guidance. Confident Prelims.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
