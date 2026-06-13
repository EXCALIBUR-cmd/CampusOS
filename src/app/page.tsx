"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CampusOSLogo } from "@/components/SideNavBar";

export default function LoginPage() {
  const router = useRouter();
  const [commanderId, setCommanderId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commanderId || !accessCode) {
      setError("Please fill in all credential fields.");
      return;
    }
    setError("");
    setLoading(true);

    // Simulate futuristic validation delay
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background">
      {/* Left Side: Animated Brand Experience */}
      <section className="hidden md:flex relative w-1/2 h-full flex-col justify-center items-center px-12 bg-surface-dim overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-secondary/15"></div>
          {/* Neon blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-container/10 blur-[130px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary-container/10 blur-[130px] rounded-full animate-pulse [animation-delay:1s]"></div>
          {/* Tech Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          ></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-start max-w-lg">
          <div className="mb-12 flex items-center gap-4">
            <CampusOSLogo className="w-20 h-20" />
            <div>
              <span className="font-geist font-black text-[38px] tracking-tight bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text leading-none block">
                CAMPUSOS
              </span>
              <span className="font-mono text-xs text-on-surface-variant uppercase tracking-widest leading-none block mt-1">
                Student Command System
              </span>
            </div>
          </div>
          <h2 className="font-geist text-[40px] font-bold text-on-surface tracking-tight leading-[1.1] mb-6">
            The next generation of academic management.
          </h2>
          <p className="text-on-surface-variant font-body-lg text-base leading-relaxed mb-8">
            An engineered dashboard balancing technical efficiency with gamified feedback loops.
            Position your campus experience as a unified command center.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-primary uppercase tracking-widest">
                SYSTEM CORRELATION
              </span>
              <span className="font-geist text-lg font-bold text-on-surface">Optimal</span>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant"></div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">
                ACTIVE COMMANDERS
              </span>
              <span className="font-geist text-lg font-bold text-on-surface">1,432 Online</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Glassmorphic Login Panel */}
      <section className="w-full md:w-1/2 h-full flex flex-col justify-center items-center px-6 sm:px-16 bg-background relative">
        {/* Subtle decorative lights */}
        <div className="absolute top-1/4 right-10 w-48 h-48 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-10 w-48 h-48 bg-secondary/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="w-full max-w-[420px] relative z-10">
          <div className="md:hidden flex items-center gap-3 mb-8 justify-center">
            <CampusOSLogo className="w-12 h-12" />
            <div>
              <span className="font-geist font-black text-2xl tracking-tight bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                CAMPUSOS
              </span>
              <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
                Student Command System
              </p>
            </div>
          </div>

          <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
            {/* Shimmer overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-transparent to-white/[0.02] pointer-events-none"></div>

            <div className="mb-8">
              <h3 className="font-geist text-2xl font-bold text-on-surface tracking-tight">
                Initialize Access
              </h3>
              <p className="text-on-surface-variant text-xs font-mono uppercase tracking-wider mt-1.5">
                Authentication Required
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block">
                  Commander ID
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-0 bottom-2.5 text-on-surface-variant text-[18px]">
                    account_circle
                  </span>
                  <input
                    type="text"
                    value={commanderId}
                    onChange={(e) => setCommanderId(e.target.value)}
                    placeholder="e.g. sterling_42"
                    className="w-full bg-transparent pl-8 pr-2 py-2 border-b border-outline-variant focus:border-primary text-on-surface font-sans text-sm focus:outline-none transition-all placeholder:text-outline/50"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block">
                  Access Code
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-0 bottom-2.5 text-on-surface-variant text-[18px]">
                    lock
                  </span>
                  <input
                    type="password"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-transparent pl-8 pr-2 py-2 border-b border-outline-variant focus:border-primary text-on-surface font-sans text-sm focus:outline-none transition-all placeholder:text-outline/50"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-on-surface-variant cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded bg-surface-container-high border-outline-variant text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Persist session</span>
                </label>
                <a href="#" className="text-primary hover:underline font-mono uppercase tracking-wider">
                  Forgot credentials?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-xs uppercase tracking-widest font-semibold rounded-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 neon-glow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-on-primary-container border-t-transparent rounded-full"></span>
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                    <span>Verify Credentials</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center text-xs text-on-surface-variant font-mono uppercase tracking-widest">
            SECURE PORT: 443 // HOST: OS_CORE
          </div>
        </div>
      </section>
    </main>
  );
}
