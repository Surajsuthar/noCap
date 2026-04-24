export function VideoFrame() {
  return (
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
  );
}
