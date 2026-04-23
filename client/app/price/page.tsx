import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
	{
		name: "Free Plan",
		price: "0",
		period: null,
		description:
			"Recommended for people with at least 1 year experience in crypto markets.",
		features: [
			"Randomised matching only — no filters",
			"Standard queue position (behind paid users)",
			"No session history",
			"Moderation still applies identically",
		],
		cta: "Get started for free",
		dark: false,
		badge: null,
	},
	{
		name: "Prime",
		price: "$9.99",
		period: "/month",
		description:
			"Recommended for people with at least 1 year experience in crypto markets.",
		features: [
			"Dedicated filter system (matches your preferences)",
			"Priority queue",
			"Personalized portfolio reviews",
			"Invitations to premium webinars",
			"Access to exclusive industry reports",
		],
		cta: "Get started",
		dark: true,
		badge: "Most Popular",
	},
];

export default function PricingCards() {
	return (
		<div className="flex flex-col justify-center items-center mt-10 w-full px-4">
			{/* Heading Section */}
			<div className="mb-12 text-center">
				<h1 className="text-4xl font-bold mb-2">Pricing Plans</h1>
				<p className="text-white/60 text-sm">
					Choose the perfect plan for your needs
				</p>
			</div>

			{/* Cards Container */}
			<div className="flex gap-8 max-w-5xl w-full">
				{plans.map((plan) => (
					<div key={plan.name} className="flex-1 relative">
						{/* Badge */}
						{plan.badge && (
							<div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
								<span className="bg-red-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
									{plan.badge}
								</span>
							</div>
						)}

						<Card
							className={cn(
								"flex flex-col rounded-2xl w-lg border transition-all duration-200 hover:-translate-y-1 h-full",
								plan.dark
									? "bg-white/10 border-white/10"
									: "bg-white/5 border-white/10",
							)}
						>
							<CardHeader className="pb-2 pt-7 px-6">
								<h2 className="text-xl font-bold tracking-tight text-white">
									{plan.name}
								</h2>
								<div className="flex items-end gap-1 mt-3">
									<span className="text-sm font-semibold mb-1.5 text-white">
										$
									</span>
									<span className="text-5xl font-extrabold leading-none tracking-tighter text-white">
										{plan.price}
									</span>
									{plan.period && (
										<span className="text-sm mb-1.5 ml-0.5 text-white/50">
											{plan.period}
										</span>
									)}
								</div>
								<p className="text-sm mt-3 leading-relaxed text-white/50 font-light">
									{plan.description}
								</p>
							</CardHeader>

							<CardContent className="flex-1 px-6 py-4">
								<ul className="space-y-3">
									{plan.features.map((feature) => (
										<li key={feature} className="flex items-start gap-2.5">
											<Check
												className="h-4 w-4 mt-0.5 shrink-0 text-white"
												strokeWidth={2}
											/>
											<span className="text-sm text-white/70">{feature}</span>
										</li>
									))}
								</ul>

								<div className="mt-4">
									<Button
										variant="outline"
										className="w-full rounded-xl h-11 text-sm font-medium bg-transparent border-white/20 text-white hover:bg-white hover:text-black transition-all"
									>
										{plan.cta}
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				))}
			</div>
		</div>
	);
}
