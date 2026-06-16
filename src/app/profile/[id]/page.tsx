"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SideNavBar } from "@/components/SideNavBar";
import { Header } from "@/components/Header";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!userId) return;
      try {
        const res = await fetch(`/api/profile/${userId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setUserData(json.data);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [userId]);

  const courses = [
    { code: "CS-401", name: "Artificial Intelligence", grade: "A", time: "Mon, Wed // 10:00 AM", instructor: "Dr. K. Vance" },
    { code: "CS-402", name: "Database Management", grade: "A-", time: "Tue, Thu // 02:00 PM", instructor: "Prof. L. Croft" },
  ];

  const skills = [
    { name: "Coding", value: 92 },
    { name: "Security", value: 88 },
    { name: "Algorithms", value: 85 },
    { name: "Systems", value: 78 },
    { name: "Mathematics", value: 90 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <SideNavBar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex">
        <SideNavBar />
        <main className="flex-1 ml-64 p-8 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
          <h2 className="font-geist text-2xl font-bold text-on-surface">User Not Found</h2>
          <p className="text-on-surface-variant font-mono mt-2">The requested profile dossier does not exist.</p>
        </main>
      </div>
    );
  }

  const role = userData.role;
  const profile = role === "student" ? userData.studentProfile : role === "teacher" ? userData.teacherProfile : userData.adminProfile;
  const name = profile?.name || "Unknown";
  const department = profile?.department || "Unassigned";
  const bio = profile?.bio || "No biography available on record.";

  const titlePrefix = role === "student" ? "Commander" : role === "teacher" ? "Professor" : "Administrator";
  const idDisplay = role === "student" && profile?.commanderId ? profile.commanderId : userData._id.toString().slice(-6).toUpperCase();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Side Navigation */}
      <SideNavBar />

      {/* Main Content Canvas */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Header title={`${titlePrefix} Profile`} subtitle={`Dossier Record: ${idDisplay}`} />

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Dossier Header (Span 8) */}
          <div className={`col-span-12 ${role === "student" ? "lg:col-span-8" : "lg:col-span-12"} space-y-6`}>
            {/* Dossier Card */}
            <section className="glass-card p-8 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

              {/* Avatar Frame */}
              <div className="w-24 h-24 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center font-bold text-[36px] text-primary relative shrink-0 neon-glow">
                {name[0] || "?"}
                {role === "student" && (
                  <span className="absolute bottom-0 right-0 bg-secondary px-1.5 py-0.5 rounded text-[8px] font-mono text-white font-bold uppercase tracking-wider leading-none">
                    LVL {profile?.level ?? 1}
                  </span>
                )}
                {role !== "student" && (
                  <span className="absolute bottom-0 right-0 bg-tertiary px-1.5 py-0.5 rounded text-[8px] font-mono text-white font-bold uppercase tracking-wider leading-none">
                    {role}
                  </span>
                )}
              </div>

              {/* Profile Details */}
              <div className="space-y-3 text-center sm:text-left">
                <div>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <h2 className="font-geist text-2xl font-bold text-on-surface">
                      {name}
                    </h2>
                    <span className="px-2.5 py-0.5 bg-surface-container-highest border border-outline-variant text-on-surface-variant font-mono text-[9px] uppercase tracking-wider rounded font-bold">
                      {userData.email}
                    </span>
                  </div>
                  <p className="text-on-surface-variant font-mono text-[11px] uppercase tracking-widest mt-1">
                    {role === "teacher" && profile?.designation ? `${profile.designation} // ` : ""}
                    Faculty of {department}
                    {role === "student" && profile?.semester ? ` // Semester ${profile.semester}` : ""}
                  </p>
                </div>
                <p className="text-on-surface-variant text-sm max-w-xl leading-relaxed">
                  {bio}
                </p>
                <div className="flex gap-2 items-center justify-center sm:justify-start pt-2">
                  <span className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold ${userData.isActive ? 'text-primary' : 'text-error'}`}>
                    <span className={`w-2 h-2 rounded-full ${userData.isActive ? 'bg-primary glow-rare' : 'bg-error'}`}></span>
                    {userData.isActive ? "System Active" : "Suspended"}
                  </span>
                </div>
              </div>
            </section>

            {/* Content varies by role */}
            {role === "student" && (
              <section className="glass-card p-6 rounded-2xl">
                <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface mb-6">
                  Active Enrolled Courses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course) => (
                    <div
                      key={course.code}
                      className="p-4 rounded-xl bg-white/[0.02] border border-outline-variant/30 hover:border-primary/30 transition-all flex justify-between items-start"
                    >
                      <div className="space-y-2">
                        <div>
                          <span className="font-mono text-[9px] text-primary uppercase tracking-widest font-bold block">
                            {course.code}
                          </span>
                          <h4 className="font-geist text-sm font-bold text-on-surface leading-tight mt-0.5">
                            {course.name}
                          </h4>
                        </div>
                        <div className="font-mono text-[10px] text-on-surface-variant space-y-0.5">
                          <p>{course.time}</p>
                          <p>{course.instructor}</p>
                        </div>
                      </div>
                      <span className="w-8 h-8 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center font-mono font-bold text-sm text-primary">
                        {course.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {role === "teacher" && (
              <section className="glass-card p-6 rounded-2xl">
                <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface mb-6">
                  Assigned Teaching Modules
                </h3>
                <div className="p-8 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest/50">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">assignment_ind</span>
                  <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
                    No modules currently assigned to this professor.
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Skill Radar Graphic & Quick Statistics (Span 4) - STUDENT ONLY */}
          {role === "student" && (
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Quick Stats Grid */}
              <section className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 rounded-2xl text-center">
                  <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest block mb-1">
                    CGPA Rating
                  </span>
                  <span className="font-geist text-2xl font-bold text-primary">{profile?.cgpa ? profile.cgpa.toFixed(2) : "0.00"}</span>
                </div>
                <div className="glass-card p-4 rounded-2xl text-center">
                  <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest block mb-1">
                    XP Yield
                  </span>
                  <span className="font-geist text-2xl font-bold text-secondary">{profile?.totalXp || 0}</span>
                </div>
                <div className="glass-card p-4 rounded-2xl text-center">
                  <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest block mb-1">
                    Current Streak
                  </span>
                  <span className="font-geist text-2xl font-bold text-tertiary">{profile?.streak || 0}</span>
                </div>
                <div className="glass-card p-4 rounded-2xl text-center">
                  <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest block mb-1">
                    Guild Quests
                  </span>
                  <span className="font-geist text-2xl font-bold text-on-surface">12</span>
                </div>
              </section>

              {/* Custom SVG Radar Skill Chart */}
              <section className="glass-card p-6 rounded-2xl flex flex-col items-center">
                <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface mb-6 w-full text-left">
                  Radar Dossier Capabilities
                </h3>

                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <polygon points="50,15 85,40 72,80 28,80 15,40" fill="none" stroke="#FFFFFF10" strokeWidth="0.5" />
                    <polygon points="50,25 76,44 65,72 35,72 24,44" fill="none" stroke="#FFFFFF10" strokeWidth="0.5" />
                    <polygon points="50,35 67,48 60,65 40,65 33,48" fill="none" stroke="#FFFFFF10" strokeWidth="0.5" />

                    <line x1="50" y1="50" x2="50" y2="15" stroke="#FFFFFF10" strokeWidth="0.5" />
                    <line x1="50" y1="50" x2="85" y2="40" stroke="#FFFFFF10" strokeWidth="0.5" />
                    <line x1="50" y1="50" x2="72" y2="80" stroke="#FFFFFF10" strokeWidth="0.5" />
                    <line x1="50" y1="50" x2="28" y2="80" stroke="#FFFFFF10" strokeWidth="0.5" />
                    <line x1="50" y1="50" x2="15" y2="40" stroke="#FFFFFF10" strokeWidth="0.5" />

                    <polygon
                      points="50,18.2 80.8,41.2 68.7,75.5 32.8,73.4 18.5,42.2"
                      fill="var(--radar-fill-color)"
                      stroke="var(--primary)"
                      strokeWidth="1.5"
                      className="radar-glow"
                    />
                  </svg>

                  <span className="absolute top-1 font-mono text-[8px] text-on-surface-variant font-bold uppercase">Coding</span>
                  <span className="absolute right-1 top-[38%] font-mono text-[8px] text-on-surface-variant font-bold uppercase">Security</span>
                  <span className="absolute right-5 bottom-1 font-mono text-[8px] text-on-surface-variant font-bold uppercase">Algorithms</span>
                  <span className="absolute left-5 bottom-1 font-mono text-[8px] text-on-surface-variant font-bold uppercase">Systems</span>
                  <span className="absolute left-1 top-[38%] font-mono text-[8px] text-on-surface-variant font-bold uppercase">Math</span>
                </div>

                <div className="w-full space-y-2 mt-4 text-xs font-mono">
                  {skills.map((s) => (
                    <div key={s.name} className="flex justify-between items-center text-[10px] text-on-surface-variant">
                      <span className="uppercase tracking-wider">{s.name}</span>
                      <span className="text-on-surface font-bold">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
