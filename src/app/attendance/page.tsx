"use client";

import { SideNavBar } from "@/components/SideNavBar";
import { Header } from "@/components/Header";
import { useState } from "react";

function CircularProgress({
  percent,
  size = 72,
  strokeWidth = 6,
  colorClass = "stroke-primary",
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="circle-progress -rotate-90" width={size} height={size}>
        {/* Background Track */}
        <circle
          className="stroke-outline-variant/20"
          fill="transparent"
          strokeWidth={strokeWidth}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        {/* Progress Line */}
        <circle
          className={`${colorClass} transition-all duration-500 ease-out`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
      </svg>
      <span className="absolute font-mono text-[11px] font-bold">{percent}%</span>
    </div>
  );
}

interface PresenceLog {
  id: number;
  subject: string;
  code: string;
  time: string;
  status: "present" | "late" | "absent";
}

export default function AttendancePage() {
  const [logs, setLogs] = useState<PresenceLog[]>([
    { id: 1, subject: "Artificial Intelligence", code: "CS-401", time: "Today, 10:15 AM", status: "present" },
    { id: 2, subject: "Database Management", code: "CS-402", time: "Yesterday, 02:30 PM", status: "present" },
    { id: 3, subject: "Linear Algebra", code: "MTH-302", time: "Oct 10, 09:00 AM", status: "late" },
    { id: 4, subject: "Software Engineering", code: "CS-405", time: "Oct 09, 11:30 AM", status: "present" },
  ]);

  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInStep, setCheckInStep] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  const handleCheckIn = () => {
    setCheckingIn(true);
    setCheckInStep(1);
    setSuccessMsg("");

    // Step 1: Calibrating
    setTimeout(() => {
      setCheckInStep(2);
      // Step 2: Verifying
      setTimeout(() => {
        setCheckInStep(3);
        // Step 3: Completed
        setTimeout(() => {
          const newLog: PresenceLog = {
            id: Date.now(),
            subject: "Artificial Intelligence",
            code: "CS-401",
            time: "Just now",
            status: "present",
          };
          setLogs((prev) => [newLog, ...prev]);
          setCheckingIn(false);
          setCheckInStep(0);
          setSuccessMsg("Check-in successful! Code CS-401 registered.");
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const subjects = [
    { name: "Artificial Intelligence", code: "CS-401", percent: 95, color: "stroke-primary", text: "text-primary" },
    { name: "Database Management", code: "CS-402", percent: 88, color: "stroke-secondary", text: "text-secondary" },
    { name: "Linear Algebra", code: "MTH-302", percent: 92, color: "stroke-tertiary", text: "text-tertiary" },
    { name: "Software Engineering", code: "CS-405", percent: 78, color: "stroke-error", text: "text-error" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Side Navigation */}
      <SideNavBar />

      {/* Main Content Canvas */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Header title="System Presence" subtitle="Operational Tracker: Attendance Registry" />

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Progress Wheels (Span 8) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <section className="glass-card p-6 rounded-2xl">
              <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface mb-6">
                Active Courses Status
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {subjects.map((sub) => (
                  <div key={sub.code} className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl hover:bg-white/5 transition-all">
                    <CircularProgress percent={sub.percent} colorClass={sub.color} />
                    <div>
                      <h4 className="font-geist text-xs font-bold text-on-surface leading-tight">
                        {sub.name}
                      </h4>
                      <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest mt-1">
                        {sub.code}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Subject Registry Table */}
            <section className="glass-card p-6 rounded-2xl">
              <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface mb-6">
                Course Attendance Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-on-surface-variant font-mono uppercase tracking-widest text-[9px]">
                      <th className="pb-3 font-semibold">Subject</th>
                      <th className="pb-3 font-semibold">Attended / Total</th>
                      <th className="pb-3 font-semibold">Absences Allowed</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 font-semibold">Artificial Intelligence (CS-401)</td>
                      <td className="py-4 font-mono">19 / 20 lectures</td>
                      <td className="py-4 font-mono">4 remaining</td>
                      <td className="py-4"><span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase font-mono tracking-wider font-semibold">Excellent</span></td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 font-semibold">Database Management (CS-402)</td>
                      <td className="py-4 font-mono">22 / 25 lectures</td>
                      <td className="py-4 font-mono">3 remaining</td>
                      <td className="py-4"><span className="px-2 py-0.5 rounded bg-secondary/10 border border-secondary/20 text-secondary text-[10px] uppercase font-mono tracking-wider font-semibold">Optimal</span></td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 font-semibold">Linear Algebra (MTH-302)</td>
                      <td className="py-4 font-mono">12 / 13 lectures</td>
                      <td className="py-4 font-mono">5 remaining</td>
                      <td className="py-4"><span className="px-2 py-0.5 rounded bg-tertiary/10 border border-tertiary/20 text-tertiary text-[10px] uppercase font-mono tracking-wider font-semibold">Optimal</span></td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 font-semibold">Software Engineering (CS-405)</td>
                      <td className="py-4 font-mono">14 / 18 lectures</td>
                      <td className="py-4 font-mono">0 remaining</td>
                      <td className="py-4"><span className="px-2 py-0.5 rounded bg-error/10 border border-error/20 text-error text-[10px] uppercase font-mono tracking-wider font-semibold">Critical</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right Column: Terminal Simulator & History Log (Span 4) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Terminal Simulator */}
            <section className="glass-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-primary/5 rounded-full blur-[40px]"></div>
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface">
                    Secure Check-in
                  </h3>
                  <span className="material-symbols-outlined text-primary text-[20px]">nfc</span>
                </div>
                <p className="text-on-surface-variant text-[13px] leading-relaxed mb-6">
                  Verify your presence coordinates inside active lecture zones to register attendance credentials.
                </p>

                {checkingIn && (
                  <div className="mb-6 p-4 rounded-xl bg-white/5 border border-outline-variant/30 space-y-3 font-mono text-[10px]">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant uppercase tracking-wider">Status:</span>
                      <span className="text-primary animate-pulse font-bold uppercase tracking-widest">
                        {checkInStep === 1
                          ? "Calibrating Coordinates..."
                          : checkInStep === 2
                          ? "Verifying GPS Grid..."
                          : "Decrypting Token..."}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary neon-glow transition-all duration-300"
                        style={{ width: `${(checkInStep / 3) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>{successMsg}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="w-full py-3 bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-xs uppercase tracking-widest font-semibold rounded-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 neon-glow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                <span>{checkingIn ? "Scanning Zone..." : "Initialize Scan"}</span>
              </button>
            </section>

            {/* Attendance History Timeline */}
            <section className="glass-card p-6 rounded-2xl flex flex-col h-[350px]">
              <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface mb-6">
                Presence History Log
              </h3>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {logs.map((log, index) => (
                  <div key={log.id} className="flex gap-4 relative">
                    {index < logs.length - 1 && (
                      <div className="absolute left-[13px] top-8 bottom-[-24px] w-[2px] bg-outline-variant/30"></div>
                    )}
                    <div
                      className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 z-10 ${
                        log.status === "present"
                          ? "text-primary border-primary bg-primary/10"
                          : log.status === "late"
                          ? "text-secondary border-secondary bg-secondary/10"
                          : "text-error border-error bg-error/10"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {log.status === "present"
                          ? "done"
                          : log.status === "late"
                          ? "schedule"
                          : "close"}
                      </span>
                    </div>
                    <div>
                      <p className="font-sans text-xs text-on-surface leading-normal font-semibold">
                        {log.subject}
                      </p>
                      <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-wider mt-0.5">
                        {log.code} // {log.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
