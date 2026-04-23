import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description:
		"Read NoCap's Privacy Policy. Learn how we collect, use, and protect your data on our random video call platform.",
	robots: { index: true, follow: true },
};

const sections = [
	{
		title: "1. Information We Collect",
		content: [
			"Account information: When you sign up, we collect your email address and a hashed password. You may optionally provide a display name.",
			"Usage data: We collect information about how you interact with the Service — including session duration, skip frequency, and feature usage — to improve matching quality and platform performance.",
			"Device & network data: We collect your IP address, browser type, operating system, and general geographic location (country/region level) to enforce safety rules and comply with legal obligations.",
			"Communications: If you contact our support team, we retain those communications to resolve your issue and improve our support processes.",
		],
	},
	{
		title: "2. Information We Do Not Collect",
		content: [
			"NoCap does not record, store, or archive your video or audio during calls. Calls are transmitted peer-to-peer and are not routed through our servers for the purpose of recording.",
			"We do not collect payment card numbers directly. All billing is handled by our payment processor (Stripe) which is PCI-DSS compliant.",
		],
	},
	{
		title: "3. How We Use Your Information",
		content: [
			"To operate and improve the Service: matching algorithms, queue prioritisation, and latency optimisation.",
			"To enforce our Terms of Service and Community Guidelines, including detecting and acting on prohibited conduct.",
			"To send transactional emails (account confirmation, password reset, billing receipts). We will not send you marketing emails without your explicit consent.",
			"To comply with legal obligations, such as responding to lawful requests from law enforcement or regulatory authorities.",
		],
	},
	{
		title: "4. Sharing of Information",
		content: [
			"We do not sell, rent, or trade your personal information to third parties for marketing purposes.",
			"We share data with trusted service providers (e.g. hosting, analytics, payment processing) solely to operate the Service. These providers are contractually obligated to keep your information confidential.",
			"We may disclose information if required by law, court order, or governmental authority, or if we believe disclosure is necessary to protect the rights, property, or safety of NoCap, our users, or the public.",
			"In the event of a merger, acquisition, or asset sale, your information may be transferred as part of that transaction. We will notify you via email or a prominent in-app notice before your data is transferred.",
		],
	},
	{
		title: "5. Cookies & Tracking",
		content: [
			"We use strictly necessary cookies to maintain your session and authentication state. These cannot be disabled without breaking core functionality.",
			"We use analytics cookies (via a privacy-respecting provider) to understand aggregate usage patterns. You can opt out of analytics cookies via the cookie banner or your browser settings.",
			"We do not use third-party advertising cookies or tracking pixels.",
		],
	},
	{
		title: "6. Data Retention",
		content: [
			"Account data is retained for as long as your account is active. If you delete your account, we will delete or anonymise your personal data within 30 days, except where we are legally required to retain it.",
			"Aggregated, anonymised analytics data (which cannot be linked back to you) may be retained indefinitely.",
		],
	},
	{
		title: "7. Security",
		content: [
			"We use industry-standard security measures including TLS encryption in transit, bcrypt password hashing, and role-based access controls for internal systems.",
			"No method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.",
			"If we become aware of a data breach that affects your personal information, we will notify you within 72 hours as required by applicable law.",
		],
	},
	{
		title: "8. Your Rights",
		content: [
			"Depending on your jurisdiction, you may have the right to: access the personal data we hold about you, request correction of inaccurate data, request deletion of your data, object to or restrict certain processing, and request a portable copy of your data.",
			"To exercise any of these rights, email us at privacy@nocap.live. We will respond within 30 days.",
			"If you are located in the EEA, UK, or California, additional rights may apply under GDPR, UK GDPR, or CCPA respectively.",
		],
	},
	{
		title: "9. Children's Privacy",
		content: [
			"NoCap is not intended for users under the age of 18. We do not knowingly collect personal information from minors.",
			"If you believe a minor has provided us with personal information, please contact us immediately at privacy@nocap.live and we will take steps to delete that information.",
		],
	},
	{
		title: "10. Third-Party Links",
		content: [
			"The Service may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties and encourage you to read their privacy policies.",
		],
	},
	{
		title: "11. Changes to This Policy",
		content: [
			"We may update this Privacy Policy from time to time. Material changes will be communicated via email or a prominent in-app notice at least 14 days before they take effect.",
			"Your continued use of the Service after the effective date of any changes constitutes your acceptance of the revised policy.",
		],
	},
	{
		title: "12. Contact",
		content: [
			"If you have questions or concerns about this Privacy Policy or how we handle your data, contact our privacy team at privacy@nocap.live.",
		],
	},
];

export default function PrivacyPolicyPage() {
	return (
		<LegalLayout activeHref="/privacy-policy">
			{/* Page header */}
			<div className="mb-10 space-y-2 border-b border-border pb-10">
				<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
					Legal
				</p>
				<h1 className="text-3xl font-bold tracking-tight text-foreground">
					Privacy Policy
				</h1>
				<p className="text-sm text-muted-foreground">
					Last updated:{" "}
					<time className="font-medium text-foreground">April 23, 2026</time>
				</p>
				<p className="pt-2 text-sm leading-relaxed text-muted-foreground max-w-2xl">
					Your privacy matters to us. This policy explains what data NoCap
					collects, why we collect it, and how we protect it. We aim to be
					transparent — no jargon, no surprises.
				</p>
			</div>

			{/* Sections */}
			<div className="space-y-10">
				{sections.map(({ title, content }) => (
					<section key={title} className="space-y-3">
						<h2 className="text-base font-semibold tracking-tight text-foreground border-l-2 border-primary pl-3">
							{title}
						</h2>
						<div className="space-y-3 pl-3">
							{content.map((para) => (
								<p
									key={para}
									className="text-sm leading-relaxed text-muted-foreground"
								>
									{para}
								</p>
							))}
						</div>
					</section>
				))}
			</div>
		</LegalLayout>
	);
}
