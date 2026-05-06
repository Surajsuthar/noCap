import {
  Captions,
  Clock3,
  Flag,
  Globe2,
  ShieldCheck,
} from "lucide-react";
import { ReactNode } from "react";


export const ChatHeader = () => {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/8 bg-black/30 px-4 py-2.5 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="grid size-8 shrink-0 place-items-center border border-primary/60 bg-primary text-[11px] font-bold text-white shadow-[3px_3px_0_rgba(0,0,0,0.5)]">
          NC
        </div>
        <div>
          <p className="font-semibold text-sm leading-none">NoCap Live</p>
          <p className="mt-0.5 text-[10px] text-white/45">Stranger room · guarded discovery</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusPill icon={<ShieldCheck size={13} />} label="Guard on" />
        <StatusPill icon={<Globe2 size={13} />} label="Global" />
        <StatusPill icon={<Clock3 size={13} />} label="02:48" accent />
      </div>

      <div className="flex items-center gap-2">
        <button className="grid size-8 place-items-center border border-white/10 bg-white/5 text-white/70 transition hover:border-primary/50 hover:text-primary">
          <Captions size={15} />
        </button>
        <button className="grid size-8 place-items-center border border-white/10 bg-white/5 text-white/70 transition hover:border-red-500/60 hover:text-red-400">
          <Flag size={15} />
        </button>
      </div>
    </header>
  );
};

function StatusPill({ icon, label, accent }: { icon: ReactNode; label: string; accent?: boolean }) {
  return (
    <div className={`flex h-7 items-center gap-1.5 border px-2.5 font-mono text-[10px] uppercase tracking-wide ${accent ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 bg-white/5 text-white/60"}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
