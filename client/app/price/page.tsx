import {
  ArrowRight,
  BadgeCheck,
  Check,
  Circle,
  Crown,
  Gauge,
  Globe2,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
  Zap,
} from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    eyebrow: "Start here",
    price: "$0",
    period: "forever",
    description: "For jumping into NoCap and meeting real people without setup.",
    features: [
      "Random video matching",
      "Standard queue access",
      "Basic community moderation",
      "Watch ads for temporary preference filters",
      "Unlimited skips when the room is busy",
    ],
    cta: "Start free",
    href: "/auth",
    featured: false,
  },
  {
    name: "Prime",
    eyebrow: "Best signal",
    price: "$9.99",
    period: "per month",
    description: "For cleaner matching, faster rooms, and fewer interruptions.",
    features: [
      "Always-on preference matching",
      "Priority queue with faster connections",
      "Reconnect with recent matches",
      "Ad-free sessions",
      "HD video priority",
    ],
    cta: "Go Prime",
    href: "/auth/register",
    featured: true,
  },
];

const comparison = [
  { label: "Match queue", free: "Standard", prime: "Priority" },
  { label: "Preference filters", free: "Ad unlock", prime: "Always on" },
  { label: "Reconnect", free: "Not included", prime: "Recent matches" },
  { label: "Video quality", free: "Standard", prime: "HD priority" },
  { label: "Ads", free: "Sometimes", prime: "Removed" },
];

const perks = [
  {
    icon: Gauge,
    title: "Faster room entry",
    text: "Prime moves you ahead when traffic spikes, so the product keeps feeling instant.",
  },
  {
    icon: Globe2,
    title: "Better match intent",
    text: "Keep interests and region preferences on without waiting through ad unlocks.",
  },
  {
    icon: ShieldCheck,
    title: "Same safety layer",
    text: "Moderation, report tools, and core safety controls stay available on every plan.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-zinc-950 text-white">
      <section className="relative isolate px-4 py-5 sm:px-6 lg:px-8">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-75"
          style={{
            background:
              "radial-gradient(circle at 16% 12%, rgba(255, 91, 43, .24), transparent 31%), radial-gradient(circle at 86% 18%, rgba(88, 180, 255, .18), transparent 28%), linear-gradient(135deg, #09090b 0%, #15100d 46%, #071313 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="flex items-center gap-3" aria-label="NoCap home">
            <span className="grid size-10 place-items-center bg-primary text-primary-foreground">
              <Video className="size-5 fill-current" />
            </span>
            <span className="font-mono text-2xl font-black tracking-normal">
              NO<span className="text-white/42">CAP</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {[
              { label: "Home", href: "/" },
              { label: "About", href: "/about-us" },
              { label: "Terms", href: "/terms" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="text-sm text-white/48 transition-colors hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href="/auth"
            className="inline-flex h-10 items-center gap-2 bg-white px-4 text-sm font-bold text-zinc-950 transition-colors hover:bg-primary hover:text-white"
          >
            Start
            <ArrowRight className="size-4" />
          </Link>
        </header>

        <div className="mx-auto grid max-w-7xl gap-8 py-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:py-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 border border-secondary/40 bg-secondary/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              <Circle className="size-2 fill-current" />
              pricing built for real rooms
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.94] tracking-normal sm:text-6xl">
              Pay only when you want more control.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
              NoCap stays usable for free. Prime is for people who want better signal: preference matching, faster queueing, reconnects, and fewer interruptions.
            </p>

            <div className="mt-8 grid max-w-xl grid-cols-3 border border-white/10 bg-black/20">
              {[
                { value: "$0", label: "to start" },
                { value: "<1s", label: "Prime queue" },
                { value: "HD", label: "priority video" },
              ].map(({ value, label }) => (
                <div key={label} className="border-r border-white/10 p-4 last:border-r-0">
                  <p className="font-mono text-2xl font-black">{value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/38">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`relative flex min-h-[34rem] flex-col border p-5 shadow-2xl ${
                  plan.featured
                    ? "border-primary/70 bg-primary/12 shadow-primary/10"
                    : "border-white/12 bg-white/[0.045]"
                }`}
              >
                {plan.featured && (
                  <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-primary-foreground">
                    <Crown className="size-3.5" />
                    popular
                  </div>
                )}

                <div className="mb-8">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/38">{plan.eyebrow}</p>
                  <h2 className="text-3xl font-black">{plan.name}</h2>
                  <p className="mt-3 min-h-14 text-sm leading-6 text-white/58">{plan.description}</p>
                </div>

                <div className="mb-8 flex items-end gap-3">
                  <span className="font-mono text-6xl font-black leading-none">{plan.price}</span>
                  <span className="pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-white/42">{plan.period}</span>
                </div>

                <ul className="mb-8 grid flex-1 gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-white/72">
                      <Check className="mt-0.5 size-4 shrink-0 text-secondary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`inline-flex h-12 items-center justify-center gap-2 px-5 text-sm font-black transition-colors ${
                    plan.featured
                      ? "bg-primary text-primary-foreground hover:bg-primary/86"
                      : "border border-white/18 bg-white/7 text-white hover:bg-white/12"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-4 border-t border-white/10 py-8 lg:grid-cols-[1fr_1.1fr]">
          <section className="border border-white/12 bg-zinc-950/70 p-5">
            <div className="mb-5 flex items-center gap-2 text-primary">
              <Sparkles className="size-4" />
              <p className="text-xs font-black uppercase tracking-[0.2em]">why prime exists</p>
            </div>
            <div className="grid gap-3">
              {perks.map(({ icon: Icon, title, text }) => (
                <div key={title} className="grid grid-cols-[2.5rem_1fr] gap-3 border border-white/10 bg-white/[0.035] p-3">
                  <div className="grid size-10 place-items-center bg-white/8 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-white/48">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-white/12 bg-zinc-950/70 p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-secondary">
                <BadgeCheck className="size-4" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">plan signal</p>
              </div>
              <div className="hidden items-center gap-1.5 text-amber-300/80 sm:flex">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-3 fill-current" />
                ))}
              </div>
            </div>

            <div className="overflow-hidden border border-white/10">
              <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr] border-b border-white/10 bg-white/[0.04] text-xs font-black uppercase tracking-[0.16em] text-white/42">
                <div className="p-3">Feature</div>
                <div className="border-l border-white/10 p-3">Free</div>
                <div className="border-l border-white/10 p-3 text-primary">Prime</div>
              </div>
              {comparison.map((row) => (
                <div key={row.label} className="grid grid-cols-[1.2fr_0.9fr_0.9fr] border-b border-white/10 text-sm last:border-b-0">
                  <div className="p-3 font-semibold text-white/78">{row.label}</div>
                  <div className="border-l border-white/10 p-3 text-white/48">{row.free}</div>
                  <div className="border-l border-white/10 p-3 font-semibold text-white/76">{row.prime}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/10 py-5 text-xs text-white/36 sm:flex-row sm:items-center sm:justify-between">
          <span>No hidden setup fees. Cancel when the conversation slows down.</span>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {[
              { label: "Privacy", href: "/privacy-policy" },
              { label: "Terms", href: "/terms" },
              { label: "About", href: "/about-us" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="transition-colors hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </footer>
      </section>
    </main>
  );
}
