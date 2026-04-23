import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";

export const metadata: Metadata = {
	title: "Terms of Service",
	description:
		"Read the NoCap Terms of Service. By using our platform you agree to these terms governing random video calls and community conduct.",
	robots: { index: true, follow: true },
};

const sections = [
	{
		title: "1. Acceptance of Terms",
		content: [
			'By accessing or using NoCap ("the Service", "we", "us"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use the Service.',
			"We reserve the right to update these Terms at any time. Continued use of the Service after changes are posted constitutes acceptance of the revised Terms.",
		],
	},
	{
		title: "2. Eligibility",
		content: [
			"You must be at least 18 years old to use NoCap. By using the Service, you represent and warrant that you meet this age requirement.",
			"If you are under 18, you are strictly prohibited from using or accessing the Service. We do not knowingly collect information from minors.",
		],
	},
	{
		title: "3. Acceptable Use",
		content: [
			"You agree not to use NoCap to transmit, share, or display any content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.",
			"Prohibited conduct includes but is not limited to: nudity or sexual content, harassment or bullying, hate speech based on race, gender, religion, nationality, disability, or sexual orientation, impersonation of any person or entity, and any activity that violates applicable laws.",
			"NoCap employs automated and human moderation tools. Violations may result in immediate termination of your session and permanent ban from the Service.",
		],
	},
	{
		title: "4. Privacy",
		content: [
			"Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices.",
			"Video calls on NoCap are not recorded or stored by default. However, other users may capture your video through third-party tools — exercise caution about what you share on camera.",
		],
	},
	{
		title: "5. Intellectual Property",
		content: [
			"The NoCap name, logo, and all related product and service names, design marks, and slogans are trademarks of NoCap. You may not use these marks without our prior written permission.",
			"You retain ownership of any content you share during calls. By using the Service, you grant NoCap a limited, non-exclusive license to process your data solely to provide the Service.",
		],
	},
	{
		title: "6. Disclaimers",
		content: [
			'The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.',
			"NoCap does not guarantee that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. You use the Service entirely at your own risk.",
		],
	},
	{
		title: "7. Limitation of Liability",
		content: [
			"To the fullest extent permitted by applicable law, NoCap shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service.",
			"Our total liability to you for any claim arising out of or relating to these Terms or the Service shall not exceed the greater of $10 USD or the amounts you have paid to NoCap in the twelve months preceding the claim.",
		],
	},
	{
		title: "8. Termination",
		content: [
			"We may suspend or terminate your access to the Service at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, NoCap, or third parties.",
			"Upon termination, all provisions of these Terms that by their nature should survive termination shall continue to apply, including intellectual property provisions and disclaimers.",
		],
	},
	{
		title: "9. Governing Law",
		content: [
			"These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.",
			"Any disputes arising under these Terms shall be resolved through binding arbitration, except that either party may seek injunctive or other equitable relief in any court of competent jurisdiction.",
		],
	},
	{
		title: "10. Contact",
		content: [
			"If you have questions about these Terms, please contact us at legal@nocap.live. We aim to respond to all inquiries within 5 business days.",
		],
	},
];

export default function TermsPage() {
	return (
		<LegalLayout activeHref="/terms">
			{/* Page header */}
			<div className="mb-10 space-y-2 border-b border-border pb-10">
				<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
					Legal
				</p>
				<h1 className="text-3xl font-bold tracking-tight text-foreground">
					Terms of Service
				</h1>
				<p className="text-sm text-muted-foreground">
					Last updated:{" "}
					<time className="font-medium text-foreground">April 23, 2026</time>
				</p>
				<p className="pt-2 text-sm leading-relaxed text-muted-foreground max-w-2xl">
					Please read these Terms carefully before using NoCap. They govern your
					access to and use of our random video call platform.
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
