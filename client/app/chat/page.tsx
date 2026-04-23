export default function Page() {
  return (
    <div className="relative flex h-screen w-full flex-col bg-[#1c1c1c] overflow-hidden">

      {/* Video Grid */}
      <div className="flex flex-1 items-center justify-center gap-4 px-8 pb-28">
        {/* Tile 1 */}
        <div className="relative flex aspect-video w-full max-w-170 items-center justify-center rounded-2xl bg-[#2a2a2a] ring-1 ring-white/10 overflow-hidden">
          <div className="flex flex-col items-center gap-3 text-white/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span className="text-sm font-medium tracking-wide">Waiting...</span>
          </div>
          {/* Name tag */}
          <div className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            You
          </div>
        </div>

        {/* Tile 2 */}
        <div className="relative flex aspect-video w-full max-w-170 items-center justify-center rounded-2xl bg-[#2a2a2a] ring-1 ring-white/10 overflow-hidden">
          <div className="flex flex-col items-center gap-3 text-white/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span className="text-sm font-medium tracking-wide">Waiting...</span>
          </div>
          {/* Name tag */}
          <div className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            Guest
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-2xl bg-[#2a2a2a]/90 px-5 py-3 shadow-xl ring-1 ring-white/10 backdrop-blur-md">

        <DockButton label="Mic">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="9" y1="22" x2="15" y2="22" />
          </svg>
        </DockButton>

        {/* Camera */}
        <DockButton label="Camera">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7L16 12 23 17V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
        </DockButton>

        {/* Screen Share */}
        <DockButton label="Share">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <polyline points="8 21 12 17 16 21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </DockButton>

        {/* Chat */}
        <DockButton label="Chat">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </DockButton>

        {/* Participants */}
        <DockButton label="People">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </DockButton>

        {/* Divider */}
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
      </div>
    </div>
  );
}

/* ── Reusable dock icon button ── */
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
