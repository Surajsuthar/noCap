"use client";

import { Video, Star, ArrowRight, Users, Globe, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const footerLinks = [
  { label: "Pricing", href: "/price" },
  { label: "About Us", href: "/about-us" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const testimonials = [
  {
    quote:
      "Met someone from Japan at 2am and we talked for 3 hours straight. NoCap is genuinely addictive.",
    name: "Alex M.",
    title: "Designer · London",
    initials: "AM",
  },
  {
    quote:
      "Finally an Omegle alternative that doesn't feel sketchy. Clean UI, real people, instant connect.",
    name: "Priya K.",
    title: "Student · Mumbai",
    initials: "PK",
  },
  {
    quote:
      "Used it to practice my Spanish with native speakers every morning. Nothing beats real conversation.",
    name: "Carlos R.",
    title: "Dev · Mexico City",
    initials: "CR",
  },
];

const slides = [
  { id: 1, remoteHue: "from-rose-900/40 to-rose-800/20",    localHue: "from-slate-800/60 to-slate-900/40",   remoteInitial: "J", localInitial: "Y" },
  { id: 2, remoteHue: "from-violet-900/40 to-violet-800/20", localHue: "from-slate-800/60 to-slate-900/40",  remoteInitial: "P", localInitial: "Y" },
  { id: 3, remoteHue: "from-sky-900/40 to-sky-800/20",       localHue: "from-slate-800/60 to-slate-900/40",  remoteInitial: "M", localInitial: "Y" },
  { id: 4, remoteHue: "from-emerald-900/40 to-emerald-800/20", localHue: "from-slate-800/60 to-slate-900/40", remoteInitial: "S", localInitial: "Y" },
];

function VideoFrame({ hue, initial, small = false }: { hue: string; initial: string; small?: boolean }) {
  return (
    <div className={`relative w-full h-full bg-linear-to-br ${hue} flex items-center justify-center`}>
      {/* Subtle noise/scanline feel */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)",
        }}
      />
      <div
        className={`relative z-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white/70 ${
          small ? "h-8 w-8 text-xs" : "h-16 w-16 text-xl"
        }`}
      >
        {initial}
      </div>
    </div>
  );
}

function CallSlide({ slide }: { slide: (typeof slides)[0] }) {
  return (
    <div className="w-full shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={{ aspectRatio: "16/9" }}>
      {/* Full bleed two-panel layout — remote left, local pip bottom-right */}
      <div className="relative w-full h-full">
        {/* Remote (full) */}
        <VideoFrame hue={slide.remoteHue} initial={slide.remoteInitial} />

        {/* Local PiP */}
        <div className="absolute bottom-3 right-3 w-[28%] rounded-xl overflow-hidden border border-white/20 shadow-lg" style={{ aspectRatio: "4/3" }}>
          <VideoFrame hue={slide.localHue} initial={slide.localInitial} small />
        </div>

        {/* Bottom bar — minimal, just "Next" button feel */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="h-7 px-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center">
            <span className="text-[11px] text-white/60 font-medium">Next →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Carousel() {
  const [active, setActive] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = (idx: number) => {
    setActive(idx);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActive((p) => (p + 1) % slides.length);
    }, 3200);
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setActive((p) => (p + 1) % slides.length);
    }, 3200);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [active]);

  return (
    <div className="w-full space-y-3">
      {/* Slide */}
      <div className="relative w-full overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="w-full shrink-0">
              <CallSlide slide={slide} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-white/70" : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [tIdx, setTIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTIdx((p) => (p + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, []);

  const testimonial = testimonials[tIdx];

  return (
    <main className="flex h-screen w-full overflow-hidden">
      {/* ── LEFT: branding panel ── */}
      <section className="flex w-full lg:w-1/2 items-center justify-center p-6 md:p-10 shrink-0">
        <div className="relative w-full h-full rounded-3xl backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-white/20 via-transparent to-transparent opacity-40 pointer-events-none" />

          <div className="relative z-10 p-8 md:p-10 h-full w-full flex flex-col justify-between text-white">
            {/* Top */}
            <div className="space-y-7">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-white/20 border border-white/30">
                  <Video className="h-5 w-5 fill-white text-white" />
                </div>
                <span className="text-2xl font-semibold tracking-tight font-mono">
                  NO<span className="text-white/50">CAP</span>
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-3 max-w-md">
                <h1 className="text-4xl font-bold leading-tight tracking-tight">
                  Talk to anyone.{" "}
                  <span className="text-primary">Right now.</span>
                </h1>
                <p className="text-base text-white/60 leading-relaxed">
                  One click and you're face-to-face with a real stranger from
                  anywhere on the planet. No scripts. No bots. Just real
                  conversations — no cap.
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8">
                {[
                  { icon: Users, value: "12K+", label: "Online now" },
                  { icon: Globe, value: "190+", label: "Countries" },
                  { icon: Zap, value: "<1s", label: "Match time" },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-white/40" />
                    <div>
                      <p className="text-lg font-bold font-mono leading-none">{value}</p>
                      <p className="text-[11px] text-white/40 uppercase tracking-widest">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <div className="space-y-5">
              {/* Rotating testimonial */}
              <div className="rounded-2xl bg-white/10 border border-white/15 p-4 space-y-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-white/70 italic leading-relaxed min-h-12">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xs font-semibold text-white">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/90">{testimonial.name}</p>
                    <p className="text-[11px] text-white/45">{testimonial.title}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/30">
                  © {new Date().getFullYear()} NoCap. All rights reserved.
                </p>
                <nav className="flex items-center gap-4">
                  {footerLinks.map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      className="text-xs text-white/45 hover:text-white/80 transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="px-1">
                <p className="text-[11px] text-white/25">built by</p>
                <Link
                  href="https://x.com/Suraj__0067"
                  className="text-xs text-white/50 hover:text-white/80 transition-colors"
                >
                  @Suraj__0067
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RIGHT: carousel panel ── */}
      <section className="hidden lg:flex w-1/2 flex-col items-center justify-center p-10 pl-0 shrink-0">
        <div className="relative w-full h-full rounded-3xl backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-bl from-white/10 via-transparent to-transparent opacity-30 pointer-events-none" />

          <div className="relative z-10 p-10 h-full w-full flex flex-col justify-between text-white">
            {/* Header */}
            <div className="space-y-1">
              <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-mono">
                See how it works
              </p>
              <h2 className="text-2xl font-bold tracking-tight">
                Real calls. Real people.
              </h2>
              <p className="text-sm text-white/50 max-w-xs">
                Thousands of conversations happening right now — yours is one click away.
              </p>
            </div>

            {/* Carousel */}
            <div className="flex-1 flex flex-col justify-center">
              <Carousel />
            </div>

            {/* Bottom trust bar */}
            <div className="space-y-4">
              <div className="h-px bg-white/10 w-full" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {[
                    { value: "4.8★", label: "App rating" },
                    { value: "2M+", label: "Calls made" },
                    { value: "99.9%", label: "Uptime" },
                  ].map(({ value, label }) => (
                    <div key={label}>
                      <p className="text-sm font-bold font-mono text-white/90">{value}</p>
                      <p className="text-[11px] text-white/35 uppercase tracking-widest">{label}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/auth"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-xs font-semibold group"
                >
                  Join free
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
