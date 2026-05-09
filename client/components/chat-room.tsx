"use client";

import { ChatHeader } from "@/components/chat-header";
import {
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
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";

const prompts = ["no spoilers", "late night build", "street food", "old internet"];
const MEDIA_STORAGE_KEY = "nocap.chat.media.v1";

type MediaPreferences = {
  audioDeviceId: string;
  videoDeviceId: string;
  micOn: boolean;
  camOn: boolean;
  volOn: boolean;
};

type DeviceOption = {
  deviceId: string;
  label: string;
};

const defaultPreferences: MediaPreferences = {
  audioDeviceId: "",
  videoDeviceId: "",
  micOn: true,
  camOn: true,
  volOn: true,
};

export function ChatRoom() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preferences, setPreferences] =
    useState<MediaPreferences>(defaultPreferences);
  const [audioInputs, setAudioInputs] = useState<DeviceOption[]>([]);
  const [videoInputs, setVideoInputs] = useState<DeviceOption[]>([]);
  const [mediaStatus, setMediaStatus] = useState<"idle" | "ready" | "blocked">(
    "idle",
  );

  const stopLocalStream = useCallback(() => {
    for (const track of streamRef.current?.getTracks() ?? []) {
      track.stop();
    }
    streamRef.current = null;
  }, []);

  const savePreferences = useCallback((next: MediaPreferences) => {
    setPreferences(next);
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return;
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    setAudioInputs(
      devices
        .filter((device) => device.kind === "audioinput")
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${index + 1}`,
        })),
    );
    setVideoInputs(
      devices
        .filter((device) => device.kind === "videoinput")
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${index + 1}`,
        })),
    );
  }, []);

  const startLocalMedia = useCallback(
    async (nextPreferences: MediaPreferences) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaStatus("blocked");
        return;
      }

      stopLocalStream();

      if (!nextPreferences.micOn && !nextPreferences.camOn) {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }
        setMediaStatus("ready");
        await refreshDevices();
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: nextPreferences.micOn
            ? deviceConstraint(nextPreferences.audioDeviceId)
            : false,
          video: nextPreferences.camOn
            ? deviceConstraint(nextPreferences.videoDeviceId)
            : false,
        });

        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setMediaStatus("ready");
        await refreshDevices();
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setMediaStatus("blocked");
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }
      }
    },
    [refreshDevices, stopLocalStream],
  );

  useEffect(() => {
    const storedPreferences = readStoredPreferences();
    setPreferences(storedPreferences);
    void startLocalMedia(storedPreferences);

    return () => {
      stopLocalStream();
    };
  }, [startLocalMedia, stopLocalStream]);

  const updatePreferences = (patch: Partial<MediaPreferences>) => {
    const next = { ...preferences, ...patch };
    savePreferences(next);
    void startLocalMedia(next);
  };

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-[#0d0d0c] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-size-[48px_48px]" />

      <section className="relative z-10 flex h-full w-full flex-col">
        <ChatHeader />
        <div className="relative flex min-h-0 flex-1">
          <StrangerFeed />
          <div className="w-px shrink-0 bg-white/8" />
          <LocalFeed
            audioInputs={audioInputs}
            mediaStatus={mediaStatus}
            onChangePreferences={updatePreferences}
            preferences={preferences}
            videoInputs={videoInputs}
            videoRef={localVideoRef}
          />
        </div>
        <ChatFooter />
      </section>
    </main>
  );
}

function StrangerFeed() {
  return (
    <div className="relative min-w-0 flex-1 overflow-hidden bg-[#111110]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(244,76,32,0.12),transparent_40%),linear-gradient(315deg,rgba(99,190,135,0.09),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-4 border border-white/6" />

      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="grid size-20 place-items-center rounded-full border border-white/10 bg-white/5">
            <ScanFace className="text-white/25" size={36} />
          </div>
          <div
            className="absolute inset-0 animate-ping rounded-full border border-primary/30"
            style={{ animationDuration: "2s" }}
          />
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-white/30">
          Waiting for match...
        </p>
      </div>

      <div className="absolute top-4 left-4 flex items-center gap-2 border border-primary/35 bg-black/50 px-3 py-1.5 backdrop-blur-sm">
        <span className="size-1.5 animate-pulse bg-primary" />
        <span className="font-mono text-[10px] uppercase tracking-wider">
          4.8k km away
        </span>
      </div>

      <div className="absolute bottom-4 left-4 border border-white/10 bg-black/40 px-2.5 py-1 backdrop-blur-sm">
        <p className="font-mono text-[10px] uppercase text-white/50">Stranger</p>
      </div>
    </div>
  );
}

function LocalFeed({
  audioInputs,
  mediaStatus,
  onChangePreferences,
  preferences,
  videoInputs,
  videoRef,
}: {
  audioInputs: DeviceOption[];
  mediaStatus: "idle" | "ready" | "blocked";
  onChangePreferences: (patch: Partial<MediaPreferences>) => void;
  preferences: MediaPreferences;
  videoInputs: DeviceOption[];
  videoRef: RefObject<HTMLVideoElement | null>;
}) {
  return (
    <div className="relative flex w-[350px] shrink-0 flex-col overflow-hidden bg-[#0f0f0e]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.06),transparent_60%)]" />

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
        {preferences.camOn && mediaStatus === "ready" ? (
          <video
            ref={videoRef}
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
          />
        ) : (
          <LocalFeedPlaceholder camOn={preferences.camOn} status={mediaStatus} />
        )}

        <div className="absolute top-3 left-3 border border-white/10 bg-black/40 px-2.5 py-1 backdrop-blur-sm">
          <p className="font-mono text-[10px] uppercase text-white/50">You</p>
        </div>

        {preferences.camOn && mediaStatus === "ready" && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 border border-primary/30 bg-black/50 px-2 py-1 backdrop-blur-sm">
            <span className="size-1.5 animate-pulse bg-primary" />
            <span className="font-mono text-[9px] uppercase text-primary/80">
              Live
            </span>
          </div>
        )}

        <DevicePanel
          audioDeviceId={preferences.audioDeviceId}
          audioInputs={audioInputs}
          onAudioChange={(audioDeviceId) =>
            onChangePreferences({ audioDeviceId })
          }
          onVideoChange={(videoDeviceId) =>
            onChangePreferences({ videoDeviceId })
          }
          videoDeviceId={preferences.videoDeviceId}
          videoInputs={videoInputs}
        />
      </div>

      <CallControls
        camOn={preferences.camOn}
        micOn={preferences.micOn}
        onToggleCam={() => onChangePreferences({ camOn: !preferences.camOn })}
        onToggleMic={() => onChangePreferences({ micOn: !preferences.micOn })}
        onToggleVolume={() => onChangePreferences({ volOn: !preferences.volOn })}
        volOn={preferences.volOn}
      />
    </div>
  );
}

function LocalFeedPlaceholder({
  camOn,
  status,
}: {
  camOn: boolean;
  status: "idle" | "ready" | "blocked";
}) {
  const label = !camOn
    ? "Camera Off"
    : status === "blocked"
      ? "Allow camera access"
      : "Starting camera";

  return (
    <>
      {camOn ? (
        <Video className="text-white/20" size={32} />
      ) : (
        <VideoOff className="text-white/15" size={32} />
      )}
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/25">
        {label}
      </p>
    </>
  );
}

function DevicePanel({
  audioDeviceId,
  audioInputs,
  onAudioChange,
  onVideoChange,
  videoDeviceId,
  videoInputs,
}: {
  audioDeviceId: string;
  audioInputs: DeviceOption[];
  onAudioChange: (deviceId: string) => void;
  onVideoChange: (deviceId: string) => void;
  videoDeviceId: string;
  videoInputs: DeviceOption[];
}) {
  return (
    <div className="absolute right-3 bottom-3 left-3 grid gap-2 border border-white/10 bg-black/50 p-2.5 backdrop-blur-sm">
      <DeviceSelect
        icon={<Mic size={12} />}
        label="Mic"
        onChange={onAudioChange}
        options={audioInputs}
        value={audioDeviceId}
      />
      <DeviceSelect
        icon={<Video size={12} />}
        label="Cam"
        onChange={onVideoChange}
        options={videoInputs}
        value={videoDeviceId}
      />
    </div>
  );
}

function DeviceSelect({
  icon,
  label,
  onChange,
  options,
  value,
}: {
  icon: ReactNode;
  label: string;
  onChange: (deviceId: string) => void;
  options: DeviceOption[];
  value: string;
}) {
  return (
    <label className="grid grid-cols-[42px_1fr] items-center gap-2">
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase text-white/45">
        {icon}
        {label}
      </span>
      <select
        className="h-8 min-w-0 border border-white/10 bg-white/5 px-2 font-mono text-[10px] text-white/70 outline-none transition hover:border-white/20 focus:border-primary/60"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">Default {label}</option>
        {options.map((option) => (
          <option key={option.deviceId} value={option.deviceId}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CallControls({
  camOn,
  micOn,
  onToggleCam,
  onToggleMic,
  onToggleVolume,
  volOn,
}: {
  camOn: boolean;
  micOn: boolean;
  onToggleCam: () => void;
  onToggleMic: () => void;
  onToggleVolume: () => void;
  volOn: boolean;
}) {
  return (
    <div className="relative shrink-0 bg-linear-to-t from-black/90 via-black/60 to-transparent px-4 pt-8 pb-5">
      <div className="flex items-center justify-center gap-2">
        <ToggleButton
          iconOff={<MicOff size={16} />}
          iconOn={<Mic size={16} />}
          label="Mic"
          on={micOn}
          onClick={onToggleMic}
        />
        <ToggleButton
          iconOff={<VideoOff size={16} />}
          iconOn={<Video size={16} />}
          label="Camera"
          on={camOn}
          onClick={onToggleCam}
        />
        <ToggleButton
          iconOff={<VolumeX size={16} />}
          iconOn={<Volume2 size={16} />}
          label="Volume"
          on={volOn}
          onClick={onToggleVolume}
        />
        <button className="grid size-10 place-items-center border border-red-600 bg-red-600 text-white transition hover:brightness-110 active:scale-95">
          <PhoneOff size={16} />
          <span className="sr-only">End call</span>
        </button>
      </div>
    </div>
  );
}

function ToggleButton({
  iconOff,
  iconOn,
  label,
  on,
  onClick,
}: {
  iconOff: ReactNode;
  iconOn: ReactNode;
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`grid size-10 place-items-center border transition active:scale-95 ${on
        ? "border-white/15 bg-white/8 text-white hover:border-primary/50 hover:text-primary"
        : "border-white/8 bg-white/4 text-white/35 hover:border-white/20 hover:text-white/60"
        }`}
      onClick={onClick}
    >
      {on ? iconOn : iconOff}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function ChatFooter() {
  return (
    <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-white/8 bg-black/30 px-4 py-2.5 backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex shrink-0 items-center gap-1.5">
          <Sparkles className="text-primary" size={13} />
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
            Vibes
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {prompts.map((prompt) => (
            <span
              className="border border-white/10 bg-white/4 px-2.5 py-1 font-mono text-[10px] text-white/60"
              key={prompt}
            >
              #{prompt}
            </span>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button className="flex items-center gap-1.5 border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase text-white/60 transition hover:border-white/20">
          <ShieldCheck size={13} />
          Safety Log
        </button>
        <button className="flex items-center gap-1.5 border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase text-white/60 transition hover:border-white/20">
          <Flag size={13} />
          Report
        </button>
        <button className="flex items-center gap-2 border border-primary bg-primary px-4 py-1.5 font-semibold text-xs text-white transition hover:bg-primary/85 active:scale-95">
          <Shuffle size={13} />
          Next Match
        </button>
        <div className="hidden items-center gap-1.5 border border-white/10 bg-white/4 px-2.5 py-1 font-mono text-[10px] uppercase text-white/45 lg:flex">
          <Globe2 size={12} />
          Global
        </div>
      </div>
    </footer>
  );
}

function deviceConstraint(deviceId: string): boolean | MediaTrackConstraints {
  return deviceId ? { deviceId: { ideal: deviceId } } : true;
}

function readStoredPreferences(): MediaPreferences {
  try {
    const stored = localStorage.getItem(MEDIA_STORAGE_KEY);
    if (!stored) {
      return defaultPreferences;
    }

    const parsed = JSON.parse(stored) as Partial<MediaPreferences>;

    return {
      audioDeviceId:
        typeof parsed.audioDeviceId === "string"
          ? parsed.audioDeviceId
          : defaultPreferences.audioDeviceId,
      videoDeviceId:
        typeof parsed.videoDeviceId === "string"
          ? parsed.videoDeviceId
          : defaultPreferences.videoDeviceId,
      micOn:
        typeof parsed.micOn === "boolean"
          ? parsed.micOn
          : defaultPreferences.micOn,
      camOn:
        typeof parsed.camOn === "boolean"
          ? parsed.camOn
          : defaultPreferences.camOn,
      volOn:
        typeof parsed.volOn === "boolean"
          ? parsed.volOn
          : defaultPreferences.volOn,
    };
  } catch {
    return defaultPreferences;
  }
}
