import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Auth — NoCap",
    template: "%s — NoCap",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between bg-card border-r border-border p-10 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
            NO<span className="text-primary">CAP</span>
          </span>
        </div>
        <div className="relative z-10 space-y-4">
          <blockquote className="space-y-2">
            <p className="text-3xl font-bold leading-tight tracking-tight text-foreground">
              Real faces.
              <br />
              Real conversations.
              <br />
              <span className="text-primary">Zero filters.</span>
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Jump into a live video call with a random stranger anywhere on the
              planet. No scripts, no bots — just authentic human connection,
              one&nbsp;call at a time.
            </p>
          </blockquote>
          <div className="flex items-center gap-8 pt-4">
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">12K+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Online now
              </p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">190+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Countries
              </p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">∞</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Connections
              </p>
            </div>
          </div>
        </div>
        <p className="relative z-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} NoCap. All rights reserved.
        </p>
      </div>

      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="mb-8 flex lg:hidden items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
            NO<span className="text-primary">CAP</span>
          </span>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
