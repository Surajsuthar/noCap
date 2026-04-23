import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign In — NoCap",
  description:
    "Sign in to NoCap and start meeting random people face-to-face via live video chat. No filters, no scripts — just real conversations.",
  keywords: [
    "nocap",
    "video chat",
    "random video call",
    "omegle alternative",
    "meet strangers",
    "video call",
  ],
  openGraph: {
    title: "Sign In — NoCap",
    description:
      "Join NoCap and connect with random people around the world through live video chat.",
    type: "website",
    siteName: "NoCap",
  },
  twitter: {
    card: "summary",
    title: "Sign In — NoCap",
    description:
      "Join NoCap and connect with random people around the world through live video chat.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthPage() {
  return <LoginForm />;
}
