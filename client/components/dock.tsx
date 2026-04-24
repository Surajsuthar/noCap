import { Icons } from "./icons";

export function Dock() {
  return <>
    <DockButton label="Mic">
      <Icons.Mic />
    </DockButton>

    {/* Camera */}
    <DockButton label="Camera">
      <Icons.Cemara />
    </DockButton>

    <DockButton label="Chat">
      <Icons.Chat />
    </DockButton>

    <div className="mx-1 h-8 w-px bg-white/10" />

    {/* Leave / End Call */}
    <button
      className="flex flex-col items-center gap-1 group"
      aria-label="Leave call"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white transition-all duration-150 hover:bg-red-500 hover:scale-105 active:scale-95 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.43 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.31 9.9" />
          <line x1="23" y1="1" x2="1" y2="23" />
        </svg>
      </div>
      <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">Leave</span>
    </button>
  </>
}


function DockButton({
  label,
  active = false,
  children,
}: {
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      className="flex flex-col items-center gap-1 group"
      aria-label={label}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer ${active
          ? "bg-white text-[#1c1c1c]"
          : "bg-white/10 text-white hover:bg-white/20"
          }`}
      >
        {children}
      </div>
      <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">
        {label}
      </span>
    </button>
  );
}
