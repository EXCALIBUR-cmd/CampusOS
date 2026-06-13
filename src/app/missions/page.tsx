"use client";

import { SideNavBar } from "@/components/SideNavBar";
import { Header } from "@/components/Header";
import { useState } from "react";

interface Assignment {
  id: string;
  code: string;
  name: string;
  due: string;
  status: "pending" | "complete" | "overdue";
  xp: string;
}

export default function MissionsPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "complete" | "overdue">("all");
  const [selectedMission, setSelectedMission] = useState<Assignment | null>(null);

  // File Upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState("");

  const [missions, setMissions] = useState<Assignment[]>([
    { id: "1", code: "CS-401", name: "AI Ethics & Algorithmic Bias", due: "Oct 15, 2026", status: "pending", xp: "+450 XP" },
    { id: "2", code: "CS-402", name: "Relational Algebra Query Design", due: "Oct 18, 2026", status: "pending", xp: "+350 XP" },
    { id: "3", code: "MTH-302", name: "Eigenvalues & Spectral Theorems", due: "Oct 05, 2026", status: "complete", xp: "+500 XP" },
    { id: "4", code: "CS-405", name: "Requirements Engineering SRS Documentation", due: "Oct 01, 2026", status: "overdue", xp: "+600 XP" },
  ]);

  const filteredMissions = missions.filter((m) => {
    if (filter === "all") return true;
    return m.status === filter;
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      triggerUpload();
    }
  };

  const triggerUpload = () => {
    setUploading(true);
    setUploadProgress(0);
    setUploadSuccess("");

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadSuccess(`Mission upload complete. Code ${selectedMission?.code}-SUB calibrated.`);
          // Mark mission as complete in state
          setMissions((prevMissions) =>
            prevMissions.map((m) =>
              m.id === selectedMission?.id ? { ...m, status: "complete" } : m
            )
          );
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Side Navigation */}
      <SideNavBar />

      {/* Main Content Canvas */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Header title="Missions Control" subtitle="Assignments Registry: Active Directives" />

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Mission Directives (Span 8) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Filter Buttons */}
            <div className="flex justify-between items-center bg-surface-container-lowest/50 p-4 rounded-xl border border-outline-variant/30">
              <div className="flex gap-2">
                {["all", "pending", "complete", "overdue"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status as any)}
                    className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                      filter === status
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface-container-low border-outline-variant/50 text-on-surface-variant hover:text-primary hover:border-primary/40"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                Directives found: {filteredMissions.length}
              </span>
            </div>

            {/* Missions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMissions.map((m) => (
                <div
                  key={m.id}
                  className="glass-card p-6 rounded-2xl flex flex-col justify-between h-[200px]"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[9px] text-primary uppercase tracking-widest font-bold">
                        {m.code}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest font-bold ${
                          m.status === "complete"
                            ? "bg-primary-container/20 text-primary border border-primary/30"
                            : m.status === "overdue"
                            ? "bg-error-container/20 text-error border border-error/30"
                            : "bg-surface-container-high text-on-surface-variant border border-outline-variant"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <h4 className="font-geist text-sm font-bold text-on-surface leading-tight">
                      {m.name}
                    </h4>
                  </div>

                  <div className="mt-auto pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                    <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                      <p>Due // {m.due}</p>
                      <p className="text-secondary font-bold">{m.xp}</p>
                    </div>

                    {m.status === "pending" || m.status === "overdue" ? (
                      <button
                        onClick={() => {
                          setSelectedMission(m);
                          setUploadSuccess("");
                        }}
                        className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/40 font-mono text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      >
                        Submit directive
                      </button>
                    ) : (
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        check_circle
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Mission Submission dropzone terminal (Span 4) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <section className="glass-card p-6 rounded-2xl flex flex-col h-[418px] justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px]"></div>

              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface">
                    Submission Terminal
                  </h3>
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    cloud_upload
                  </span>
                </div>

                {selectedMission ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-white/5 border border-outline-variant/30 rounded-xl">
                      <span className="font-mono text-[9px] text-primary uppercase tracking-widest">
                        Selected directive
                      </span>
                      <h4 className="font-geist text-xs font-bold text-on-surface mt-0.5">
                        {selectedMission.name}
                      </h4>
                      <p className="font-mono text-[9px] text-on-surface-variant uppercase mt-1">
                        {selectedMission.code} // Yield: {selectedMission.xp}
                      </p>
                    </div>

                    {/* Drag and drop zone */}
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`h-40 border border-dashed rounded-xl flex flex-col items-center justify-center text-center p-4 transition-all ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-outline-variant/50 bg-surface-container-low"
                      }`}
                    >
                      <span className="material-symbols-outlined text-on-surface-variant text-[32px] mb-2">
                        insert_drive_file
                      </span>
                      <p className="text-xs text-on-surface font-semibold">
                        Drag & drop assignment package
                      </p>
                      <p className="text-[10px] text-on-surface-variant font-mono mt-1 uppercase tracking-wider">
                        or click here to select file
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        id="file-upload"
                        onChange={triggerUpload}
                        disabled={uploading}
                      />
                      <label
                        htmlFor="file-upload"
                        className="absolute inset-0 cursor-pointer"
                      ></label>
                    </div>

                    {uploading && (
                      <div className="space-y-2 font-mono text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant uppercase tracking-wider">
                            Uploading...
                          </span>
                          <span className="text-primary font-bold">{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary neon-glow"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {uploadSuccess && (
                      <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">
                            check_circle
                          </span>
                          <span className="font-bold">Transmission Complete</span>
                        </div>
                        <p className="text-[10px] text-on-surface-variant leading-relaxed font-mono">
                          {uploadSuccess}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-[280px] text-on-surface-variant">
                    <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">
                      quick_reference_all
                    </span>
                    <p className="text-xs font-semibold">No directive selected</p>
                    <p className="text-[10px] max-w-[200px] leading-relaxed mt-2">
                      Please select a mission from the list to initialize the secure upload terminal.
                    </p>
                  </div>
                )}
              </div>

              {selectedMission && (
                <button
                  onClick={() => setSelectedMission(null)}
                  className="w-full py-3 bg-white/5 border border-outline-variant text-on-surface font-mono text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-white/10 hover:border-primary/40 transition-all cursor-pointer mt-4"
                >
                  Cancel directive
                </button>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
