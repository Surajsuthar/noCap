import type { Metadata } from "next";
import { Oxanium, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";


const fontSans = Oxanium({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "NoCap — Random Video Calls",
    template: "%s — NoCap",
  },
  description:
    "NoCap is a live random video call platform. Meet real strangers from around the world — no scripts, no filters, just authentic face-to-face conversations.",
  keywords: [
    "nocap",
    "random video call",
    "omegle alternative",
    "video chat with strangers",
    "live video chat",
    "meet strangers online",
    "anonymous video call",
    "random chat",
  ],
  openGraph: {
    title: "NoCap — Random Video Calls",
    description:
      "Meet real strangers from around the world via live video calls. No scripts, no filters — just real conversations.",
    type: "website",
    siteName: "NoCap",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoCap — Random Video Calls",
    description:
      "Meet real strangers from around the world via live video calls. No scripts, no filters — just real conversations.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
