import { Globe, Heart, Shield, Zap } from "lucide-react";
import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";

export const metadata: Metadata = {
	title: "About Us",
	description:
		"Learn about NoCap — the random video call platform built to bring real human connection back to the internet.",
	robots: { index: true, follow: true },
};

const values = [
	{
		icon: Heart,
		title: "Authenticity first",
		description:
			"No filters, no personas. We built NoCap because the internet felt increasingly fake. Every feature we ship is tested against one question: does this make conversations more real?",
	},
	{
		icon: Shield,
		title: "Safety by design",
		description:
			"Random doesn't mean unsafe. We invest heavily in automated moderation, one-tap reporting, and trust systems so you can explore freely without anxiety.",
	},
	{
		icon: Globe,
		title: "Genuinely global",
		description:
			"We match across 190+ countries on purpose. Talking to someone whose daily life looks nothing like yours is the point — it's where the interesting stuff happens.",
	},
	{
		icon: Zap,
		title: "Speed over polish",
		description:
			"A one-second match time matters more to us than a slick onboarding flow. We obsess over infrastructure so you never wait.",
	},
];

const stats = [
	{ value: "12K+", label: "Users online right now" },
	{ value: "190+", label: "Countries connected" },
	{ value: "2M+", label: "Calls made to date" },
	{ value: "<1s", label: "Average match time" },
];

const team = [
	{
		initials: "SS",
		name: "Suraj Suthar",
		role: "Founder & Engineer",
		bio: "Built the first version of NoCap in a weekend out of frustration that Omegle was gone and nothing good had replaced it.",
		twitter: "https://x.com/Suraj__0067",
	},
];

export default function AboutUsPage() {
	return (
		<LegalLayout activeHref="/about-us">
			{/* Hero */}
			<div className="mb-14 space-y-4 border-b border-border pb-12">
				<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
					About
				</p>
				<h1 className="text-4xl font-bold tracking-tight text-foreground">
					We think the internet got too polished.
				</h1>
				<p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
					NoCap exists because genuine, unscripted human connection got buried
					under algorithms, follower counts, and curated feeds. We built a
					platform where the only thing between you and a real conversation with
					a real stranger is one click.
				</p>
			</div>

			{/* Stats */}
			<div className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
				{stats.map(({ value, label }) => (
					<div
						key={label}
						className="rounded-xl border border-border bg-card p-5 space-y-1"
					>
						<p className="font-mono text-2xl font-bold text-foreground">
							{value}
						</p>
						<p className="text-xs text-muted-foreground leading-snug">
							{label}
						</p>
					</div>
				))}
			</div>

			{/* Story */}
			<section className="mb-14 space-y-4">
				<h2 className="text-base font-semibold tracking-tight text-foreground border-l-2 border-primary pl-3">
					The story
				</h2>
				<div className="space-y-4 pl-3 text-sm leading-relaxed text-muted-foreground">
					<p>
						When Omegle shut down in November 2023, millions of people lost
						something genuinely irreplaceable — a place to talk to strangers
						without an agenda. The alternatives that filled the gap felt either
						unsafe, overcrowded with bots, or so focused on monetisation that
						the product suffered.
					</p>
					<p>
						NoCap started as a weekend project. The premise was simple: rebuild
						what made Omegle great — the randomness, the surprise, the
						human-ness — and fix everything that made it frustrating. Better
						moderation, faster matching, cleaner video, and a UI that doesn't
						feel like 2009.
					</p>
					<p>
						We launched quietly, told nobody, and within 48 hours had users from
						23 countries. That told us the appetite was real. We've been
						building in public ever since.
					</p>
				</div>
			</section>

			{/* Values */}
			<section className="mb-14 space-y-6">
				<h2 className="text-base font-semibold tracking-tight text-foreground border-l-2 border-primary pl-3">
					What we believe
				</h2>
				<div className="grid gap-4 sm:grid-cols-2">
					{values.map(({ icon: Icon, title, description }) => (
						<div
							key={title}
							className="rounded-xl border border-border bg-card p-5 space-y-3"
						>
							<div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted">
								<Icon className="h-4 w-4 text-foreground" />
							</div>
							<div className="space-y-1">
								<p className="text-sm font-semibold text-foreground">{title}</p>
								<p className="text-xs leading-relaxed text-muted-foreground">
									{description}
								</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Team */}
			<section className="mb-14 space-y-6">
				<h2 className="text-base font-semibold tracking-tight text-foreground border-l-2 border-primary pl-3">
					The team
				</h2>
				<div className="flex flex-col gap-4 sm:flex-row">
					{team.map(({ initials, name, role, bio, twitter }) => (
						<div
							key={name}
							className="flex-1 rounded-xl border border-border bg-card p-5 space-y-4"
						>
							<div className="flex items-center gap-3">
								<div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-muted font-mono text-sm font-bold text-foreground">
									{initials}
								</div>
								<div>
									<p className="text-sm font-semibold text-foreground">
										{name}
									</p>
									<p className="text-xs text-muted-foreground">{role}</p>
								</div>
							</div>
							<p className="text-xs leading-relaxed text-muted-foreground">
								{bio}
							</p>
							{twitter && (
								<a
									href={twitter}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground underline-offset-4 hover:underline hover:text-primary transition-colors"
								>
									{twitter.replace("https://x.com/", "@")} ↗
								</a>
							)}
						</div>
					))}
				</div>
			</section>

			{/* What's next */}
			<section className="mb-14 space-y-4">
				<h2 className="text-base font-semibold tracking-tight text-foreground border-l-2 border-primary pl-3">
					What's next
				</h2>
				<div className="space-y-3 pl-3 text-sm leading-relaxed text-muted-foreground">
					<p>
						We're a small team moving fast. On the roadmap: interest-based
						matching, a mobile app, text-only mode for slower connections, and
						better tools for language-exchange learners.
					</p>
					<p>
						We build in public. Follow{" "}
						<a
							href="https://x.com/Suraj__0067"
							target="_blank"
							rel="noopener noreferrer"
							className="font-medium text-foreground underline-offset-4 hover:underline hover:text-primary transition-colors"
						>
							@Suraj__0067
						</a>{" "}
						for updates, behind-the-scenes posts, and the occasional hot take on
						product design.
					</p>
				</div>
			</section>

			{/* Contact CTA */}
			<div className="rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<p className="text-sm font-semibold text-foreground">Get in touch</p>
					<p className="text-xs text-muted-foreground">
						Press enquiries, partnerships, feedback, or just want to say hi.
					</p>
				</div>
				<a
					href="mailto:hello@nocap.live"
					className="shrink-0 rounded-lg border border-border bg-muted px-4 py-2 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
				>
					hello@nocap.live
				</a>
			</div>
		</LegalLayout>
	);
}
