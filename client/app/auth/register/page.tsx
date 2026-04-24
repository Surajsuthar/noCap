import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Create Account — NoCap",
  description:
    "Create your free NoCap account and start meeting random people face-to-face via live video chat. No filters, no scripts — just real conversations.",
  keywords: [
    "nocap",
    "sign up",
    "register",
    "video chat",
    "random video call",
    "omegle alternative",
    "meet strangers",
  ],
  openGraph: {
    title: "Create Account — NoCap",
    description:
      "Join NoCap and connect with random people around the world through live video chat.",
    type: "website",
    siteName: "NoCap",
  },
  twitter: {
    card: "summary",
    title: "Create Account — NoCap",
    description:
      "Join NoCap and connect with random people around the world through live video chat.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
