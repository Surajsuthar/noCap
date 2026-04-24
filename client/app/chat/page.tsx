import { Dock } from "@/components/dock";
import { VideoFrame } from "@/components/video-frame";

export default function Page() {
  return (
    <div className="relative flex h-screen w-full flex-col bg-[#1c1c1c] overflow-hidden">
      <div className="flex flex-1 items-center justify-center gap-4 px-8 pb-28">
        <VideoFrame />
        <VideoFrame />
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-2xl bg-[#2a2a2a]/90 px-5 py-3 shadow-xl ring-1 ring-white/10 backdrop-blur-md">
        <Dock />
      </div>
    </div>
  );
}
