"use client";

import {
  ArrowRight,
  BadgeCheck,
  Circle,
  Clock3,
  Globe2,
  Mic,
  MonitorUp,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Video,
  Volume2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const footerLinks = [
  { label: "Pricing", href: "/price" },
  { label: "About Us", href: "/about-us" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const liveMatches = [
  {
    city: "Seoul",
    topic: "music taste",
    time: "00:18",
    hue: "from-orange-500/30 via-zinc-950 to-sky-500/20",
    initials: "MJ",
  },
  {
    city: "Lagos",
    topic: "startup chaos",
    time: "01:42",
    hue: "from-emerald-400/25 via-zinc-950 to-orange-600/20",
    initials: "AO",
  },
  {
    city: "Berlin",
    topic: "late night talks",
    time: "03:07",
    hue: "from-rose-500/25 via-zinc-950 to-lime-400/15",
    initials: "LK",
  },
  {
    city: "Mumbai",
    topic: "college life",
    time: "00:54",
    hue: "from-amber-400/30 via-zinc-950 to-cyan-500/20",
    initials: "SP",
  },
];

const topics = ["music", "gaming", "study break", "travel", "founders", "language swap"];

const stats = [
  { value: "12K+", label: "online now", icon: Users },
  { value: "190+", label: "countries", icon: Globe2 },
  { value: "<1s", label: "match time", icon: Zap },
];

const signalBars = [48, 76, 62, 88, 54, 94, 68, 82, 58, 74, 96, 64];

function VideoTile({
  className,
  hue,
  initials,
  label,
}: {
  className?: string;
  hue: string;
  initials: string;
  label: string;
}) {
  return (
    <div className={`relative overflow-hidden border border-white/12 bg-linear-to-br ${hue} ${className}`}>
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.55) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-white/12 to-transparent"
      />
      <div className="absolute left-4 top-4 flex items-center gap-2 bg-black/45 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur">
        <Circle className="size-2 fill-secondary text-secondary" />
        {label}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid size-24 place-items-center border border-white/20 bg-white/10 text-2xl font-black text-white/80 shadow-2xl backdrop-blur-md">
          {initials}
        </div>
      </div>
      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between text-white/65">
        <div className="flex items-center gap-2">
          <Volume2 className="size-4" />
          <div className="flex h-7 items-end gap-1">
            {signalBars.slice(0, 8).map((height, index) => (
              <span
                key={`${height}-${index}`}
                className="w-1 bg-white/55"
                style={{ height: `${Math.max(8, height / 4)}px` }}
              />
            ))}
          </div>
        </div>
        <span className="font-mono text-xs">HD</span>
      </div>
    </div>
  );
}

function MatchQueue({ active }: { active: number }) {
  return (
    <div className="grid gap-2">
      {liveMatches.map((match, index) => (
        <div
          key={match.city}
          className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border px-3 py-3 transition-colors ${index === active
            ? "border-primary/70 bg-primary/12 text-white"
            : "border-white/10 bg-white/[0.04] text-white/55"
            }`}
        >
          <div className={`grid size-10 place-items-center bg-linear-to-br ${match.hue} text-xs font-bold text-white/80`}>
            {match.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{match.city}</p>
            <p className="truncate text-xs text-white/38">{match.topic}</p>
          </div>
          <div className="font-mono text-xs text-white/45">{match.time}</div>
        </div>
      ))}
    </div>
  );
}

function LiveConsole() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((current) => (current + 1) % liveMatches.length);
    }, 2600);

    return () => clearInterval(interval);
  }, []);

  const match = liveMatches[active];

  return (
    <section className="relative border border-white/14 bg-zinc-950/80 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center bg-primary text-primary-foreground">
            <Video className="size-4 fill-current" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">NoCap live desk</p>
            <p className="text-xs text-white/40">matching room / public beta</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          <Radio className="size-4" />
          live
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_16rem]">
        <div className="grid gap-3">
          <div className="grid min-h-[22rem] gap-3 md:grid-cols-[1fr_13rem]">
            <VideoTile
              className="min-h-[22rem]"
              hue={match.hue}
              initials={match.initials}
              label={`matched / ${match.city}`}
            />
            <div className="grid gap-3">
              <VideoTile
                className="min-h-44"
                hue="from-zinc-800 via-zinc-950 to-orange-500/18"
                initials="YOU"
                label="you"
              />
              <div className="grid grid-cols-3 border border-white/10 bg-white/[0.04]">
                {[
                  { icon: Mic, label: "mic" },
                  { icon: Video, label: "cam" },
                  { icon: MonitorUp, label: "share" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    className="grid min-h-24 place-items-center border-r border-white/10 text-white/55 transition-colors last:border-r-0 hover:bg-white/8 hover:text-white"
                    aria-label={label}
                  >
                    <Icon className="size-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, text: "report tools on deck" },
              { icon: BadgeCheck, text: "human-first matching" },
              { icon: Clock3, text: "skip whenever" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-white/52"
              >
                <Icon className="size-4 text-primary" />
                {text}
              </div>
            ))}
          </div>
        </div>

        <aside className="grid content-between gap-4">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/36">queue</p>
              <p className="font-mono text-xs text-secondary">+247/min</p>
            </div>
            <MatchQueue active={active} />
          </div>

          <div className="border border-primary/35 bg-primary/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Sparkles className="size-4" />
              <p className="text-xs font-bold uppercase tracking-[0.2em]">spark</p>
            </div>
            <p className="text-sm leading-relaxed text-white/72">
              Pick a vibe, hit start, and NoCap drops you straight into a real face-to-face conversation.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function Home() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <main className="min-h-screen overflow-hidden bg-zinc-950 text-white">
      <section className="relative isolate min-h-screen px-4 py-5 sm:px-6 lg:px-8">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(circle at 18% 16%, rgba(255, 91, 43, .28), transparent 32%), radial-gradient(circle at 82% 22%, rgba(88, 180, 255, .18), transparent 28%), linear-gradient(135deg, #09090b 0%, #15100d 48%, #071313 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.13]"
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
            {footerLinks.slice(0, 3).map(({ label, href }) => (
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

        <div className="mx-auto grid max-w-7xl gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-12">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 border border-secondary/40 bg-secondary/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              <Circle className="size-2 fill-current" />
              12,408 people online
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.92] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Random video chat with actual pulse.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/62 sm:text-lg">
              NoCap is built for instant face-to-face conversation: fast matching, clean controls, real people, and enough edge to keep the room moving.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth"
                className="inline-flex h-12 items-center justify-center gap-2 bg-primary px-6 text-sm font-black text-primary-foreground shadow-xl shadow-primary/20 transition-colors hover:bg-primary/86"
              >
                Jump into a call
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/chat"
                className="inline-flex h-12 items-center justify-center gap-2 border border-white/18 bg-white/7 px-6 text-sm font-bold text-white transition-colors hover:bg-white/12"
              >
                Preview room
                <Video className="size-4" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 border border-white/10 bg-black/20">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="border-r border-white/10 p-4 last:border-r-0">
                  <Icon className="mb-3 size-5 text-primary" />
                  <p className="font-mono text-2xl font-black">{value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/38">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {topics.map((topic) => (
                <Link
                  key={topic}
                  href="/auth"
                  className="border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/58 transition-colors hover:border-primary/60 hover:text-white"
                >
                  #{topic}
                </Link>
              ))}
            </div>
          </div>

          <LiveConsole />
        </div>

        <footer className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-5 text-xs text-white/36 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span>© {currentYear} NoCap.</span>
            <span className="hidden sm:inline">Real conversations, no script.</span>
            <div className="flex items-center justify-center gap-2">
              <div className="size-1.5 fill-current bg-red-600 rounded-full"></div>
              <span className="hidden sm:inline">All Systems operational.</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5 text-amber-300/80">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-3 fill-current" />
              ))}
            </div>
            {footerLinks.map(({ label, href }) => (
              <Link key={label} href={href} className="transition-colors hover:text-white">
                {label}
              </Link>
            ))}
            <Link href="https://x.com/Suraj__0067" className="transition-colors hover:text-white">
              built by @Suraj__0067
            </Link>
          </div>
        </footer>
      </section>
    </main>
  );
}
