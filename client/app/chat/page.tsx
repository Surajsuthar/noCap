"use client";

import { ChatHeader } from "@/components/chat-header";
import {
  Captions,
  Clock3,
  Flag,
  Globe2,
  Mic,
  MicOff,
  PhoneOff,
  ScanFace,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

const prompts = ["no spoilers", "late night build", "street food", "old internet"];

export default function Page() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [volOn, setVolOn] = useState(true);

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-[#0d0d0c] text-white">

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <section className="relative z-10 flex h-full w-full flex-col">
        <ChatHeader />
        <div className="relative flex flex-1 min-h-0">

          {/* STRANGER FEED — left, large, fills most of the screen */}
          <div className="relative flex-1 min-w-0 overflow-hidden bg-[#111110]">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(244,76,32,0.12),transparent_40%),linear-gradient(315deg,rgba(99,190,135,0.09),transparent_40%)]" />
            <div className="pointer-events-none absolute inset-4 border border-white/6" />

            {/* Waiting / placeholder — swap with <video> in real app */}
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="size-20 rounded-full border border-white/10 bg-white/5 grid place-items-center">
                  <ScanFace size={36} className="text-white/25" />
                </div>
                <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping" style={{ animationDuration: "2s" }} />
              </div>
              <p className="font-mono text-xs uppercase tracking-widest text-white/30">Waiting for match…</p>
            </div>

            {/* Match badge top-left */}
            <div className="absolute top-4 left-4 flex items-center gap-2 border border-primary/35 bg-black/50 px-3 py-1.5 backdrop-blur-sm">
              <span className="size-1.5 bg-primary animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-wider">4.8k km away</span>
            </div>

            {/* Stranger label bottom-left */}
            <div className="absolute bottom-4 left-4 border border-white/10 bg-black/40 px-2.5 py-1 backdrop-blur-sm">
              <p className="font-mono text-[10px] uppercase text-white/50">Stranger</p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px shrink-0 bg-white/8" />

          {/* YOUR FEED — right column, narrower, full height */}
          <div className="relative flex w-[350px] shrink-0 flex-col overflow-hidden bg-[#0f0f0e]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.06),transparent_60%)]" />

            {/* Your camera feed — fills the column */}
            <div className="relative flex flex-1 min-h-0 flex-col items-center justify-center gap-3">
              {camOn ? (
                <Video size={32} className="text-white/20" />
              ) : (
                <VideoOff size={32} className="text-white/15" />
              )}
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/25">
                {camOn ? "Your Camera" : "Camera Off"}
              </p>

              {/* You label */}
              <div className="absolute top-3 left-3 border border-white/10 bg-black/40 px-2.5 py-1 backdrop-blur-sm">
                <p className="font-mono text-[10px] uppercase text-white/50">You</p>
              </div>

              {/* Live dot */}
              {camOn && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 border border-primary/30 bg-black/50 px-2 py-1 backdrop-blur-sm">
                  <span className="size-1.5 bg-primary animate-pulse" />
                  <span className="font-mono text-[9px] uppercase text-primary/80">Live</span>
                </div>
              )}
            </div>

            {/* ── CONTROLS — pinned bottom center of your feed ── */}
            <div className="relative shrink-0 bg-linear-to-t from-black/90 via-black/60 to-transparent px-4 pb-5 pt-8">
              <div className="flex items-center justify-center gap-2">
                <ToggleButton
                  on={micOn}
                  onClick={() => setMicOn(!micOn)}
                  iconOn={<Mic size={16} />}
                  iconOff={<MicOff size={16} />}
                  label="Mic"
                />
                <ToggleButton
                  on={camOn}
                  onClick={() => setCamOn(!camOn)}
                  iconOn={<Video size={16} />}
                  iconOff={<VideoOff size={16} />}
                  label="Camera"
                />
                <ToggleButton
                  on={volOn}
                  onClick={() => setVolOn(!volOn)}
                  iconOn={<Volume2 size={16} />}
                  iconOff={<VolumeX size={16} />}
                  label="Volume"
                />
                <button className="grid size-10 place-items-center border border-red-600 bg-red-600 text-white transition hover:brightness-110 active:scale-95">
                  <PhoneOff size={16} />
                  <span className="sr-only">End call</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ── BOTTOM BAR — vibe tags + next match ── */}
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-white/8 bg-black/30 px-4 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex shrink-0 items-center gap-1.5">
              <Sparkles size={13} className="text-primary" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">Vibes</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {prompts.map((p) => (
                <span key={p} className="border border-white/10 bg-white/4 px-2.5 py-1 font-mono text-[10px] text-white/60">
                  #{p}
                </span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button className="border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase text-white/60 transition hover:border-white/20">
              Safety Log
            </button>
            <button className="flex items-center gap-2 border border-primary bg-primary px-4 py-1.5 font-semibold text-xs text-white transition hover:bg-primary/85 active:scale-95">
              <Shuffle size={13} />
              Next Match
            </button>
          </div>
        </footer>

      </section>
    </main>
  );
}



function ToggleButton({
  on, onClick, iconOn, iconOff, label,
}: {
  on: boolean;
  onClick: () => void;
  iconOn: ReactNode;
  iconOff: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`grid size-10 place-items-center border transition active:scale-95 ${on
        ? "border-white/15 bg-white/8 text-white hover:border-primary/50 hover:text-primary"
        : "border-white/8 bg-white/4 text-white/35 hover:border-white/20 hover:text-white/60"
        }`}
    >
      {on ? iconOn : iconOff}
      <span className="sr-only">{label}</span>
    </button>
  );
}
