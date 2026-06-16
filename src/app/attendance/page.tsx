"use client";

import { SideNavBar } from "@/components/SideNavBar";
import { Header } from "@/components/Header";
import { useState, useEffect, useMemo } from "react";

function CircularProgress({ percent, size = 72, strokeWidth = 6, colorClass = "stroke-primary" }: any) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="circle-progress -rotate-90" width={size} height={size}>
        <circle className="stroke-outline-variant/20" fill="transparent" strokeWidth={strokeWidth} cx={size / 2} cy={size / 2} r={radius} />
        <circle className={`${colorClass} transition-all duration-500 ease-out`} fill="transparent" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" cx={size / 2} cy={size / 2} r={radius} />
      </svg>
      <span className="absolute font-mono text-[11px] font-bold">{Math.round(percent)}%</span>
    </div>
  );
}

export default function AttendancePage() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Student View State
  const [studentRecords, setStudentRecords] = useState<any[]>([]);

  // Teacher/Admin View State
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [savingAttendance, setSavingAttendance] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setRole(data.data.role);
          if (data.data.role === "student") {
            fetchStudentAttendance();
          } else {
            fetchCourses();
          }
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if ((role === "teacher" || role === "admin") && selectedCourse) {
      fetchClassAttendance(selectedCourse, selectedDate);
    }
  }, [selectedCourse, selectedDate]);

  const fetchStudentAttendance = async () => {
    try {
      const res = await fetch("/api/attendance");
      const json = await res.json();
      if (json.success) setStudentRecords(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      const json = await res.json();
      if (json.success) {
        setCourses(json.data);
        if (json.data.length > 0) setSelectedCourse(json.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassAttendance = async (courseId: string, date: string) => {
    try {
      // 1. Get existing records
      const res = await fetch(`/api/attendance?courseId=${courseId}&date=${date}`);
      const json = await res.json();
      const existingRecords = json.success ? json.data : [];

      // 2. Get course students
      const course = courses.find(c => c._id === courseId);
      if (!course) return;

      // Merge
      const mergedData = course.students.map((student: any) => {
        const existing = existingRecords.find((r: any) => r.student._id === student._id);
        return {
          studentId: student._id,
          name: student.name,
          commanderId: student.commanderId,
          status: existing ? existing.status : "present", // default to present
        };
      });
      setAttendanceData(mergedData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = (studentId: string, newStatus: string) => {
    setAttendanceData(prev => prev.map(a => a.studentId === studentId ? { ...a, status: newStatus } : a));
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse,
          date: selectedDate,
          records: attendanceData.map(a => ({ studentId: a.studentId, status: a.status }))
        })
      });
      const json = await res.json();
      if (json.success) {
        alert("Attendance saved successfully!");
      } else {
        alert("Failed to save: " + json.error);
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setSavingAttendance(false);
    }
  };

  // Compute student stats
  const studentStats = useMemo(() => {
    if (role !== "student") return [];
    
    const courseMap: any = {};
    studentRecords.forEach(r => {
      const cId = r.course._id;
      if (!courseMap[cId]) {
        courseMap[cId] = { course: r.course, total: 0, attended: 0, absences: 0 };
      }
      courseMap[cId].total++;
      if (r.status === "present" || r.status === "late") courseMap[cId].attended++;
      if (r.status === "absent") courseMap[cId].absences++;
    });

    return Object.values(courseMap).map((s: any) => ({
      ...s,
      percent: s.total > 0 ? (s.attended / s.total) * 100 : 0
    }));
  }, [studentRecords, role]);

  return (
    <div className="min-h-screen bg-background flex">
      <SideNavBar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Header title={role === "student" ? "System Presence" : "Attendance Tracker"} subtitle="Operational Tracker: Attendance Registry" />

        {loading ? (
          <div className="mt-8 space-y-6">
             <div className="w-full h-32 bg-surface-container-low animate-pulse rounded-2xl"></div>
             <div className="w-full h-64 bg-surface-container-low animate-pulse rounded-2xl"></div>
          </div>
        ) : role === "student" ? (
          <div className="mt-8 space-y-6">
            <section className="glass-card p-6 rounded-2xl">
              <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface mb-6">Active Courses Status</h3>
              {studentStats.length === 0 ? (
                <div className="text-on-surface-variant text-sm py-4">No attendance records found yet.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {studentStats.map((stat: any, i) => (
                    <div key={stat.course._id} className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl bg-white/5 border border-outline-variant/30">
                      <CircularProgress 
                        percent={stat.percent} 
                        colorClass={stat.percent > 85 ? "stroke-primary" : stat.percent > 70 ? "stroke-secondary" : "stroke-error"} 
                      />
                      <div>
                        <h4 className="font-geist text-xs font-bold text-on-surface leading-tight">{stat.course.name}</h4>
                        <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest mt-1">{stat.course.code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="glass-card p-6 rounded-2xl">
              <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface mb-6">Attendance Log History</h3>
              {studentRecords.length === 0 ? (
                <div className="text-on-surface-variant text-sm py-4">No history available.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-outline-variant/30 text-on-surface-variant font-mono uppercase tracking-widest text-[9px]">
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Course</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {studentRecords.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                        <tr key={record._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 font-mono">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="py-4 font-semibold">{record.course.name} <span className="font-mono text-[9px] text-on-surface-variant">({record.course.code})</span></td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-semibold ${
                              record.status === "present" ? "bg-primary/10 border border-primary/20 text-primary" :
                              record.status === "late" ? "bg-secondary/10 border border-secondary/20 text-secondary" :
                              "bg-error/10 border border-error/20 text-error"
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <section className="glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-end relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-5%] w-48 h-48 bg-primary/5 rounded-full blur-[60px] pointer-events-none"></div>
              
              <div className="flex-1 w-full z-10">
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Select Course</label>
                <select
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                  {courses.length === 0 && <option value="">No courses assigned</option>}
                </select>
              </div>

              <div className="w-full md:w-64 z-10">
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Date</label>
                <input
                  type="date"
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </section>

            {selectedCourse && (
              <section className="glass-card p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface">Mark Student Attendance</h3>
                  <button
                    onClick={handleSaveAttendance}
                    disabled={savingAttendance || attendanceData.length === 0}
                    className="px-6 py-2 bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-xs uppercase tracking-widest font-semibold rounded-lg hover:opacity-95 transition-all neon-glow disabled:opacity-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    {savingAttendance ? "Saving..." : "Save Registry"}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-outline-variant/30 text-on-surface-variant font-mono uppercase tracking-widest text-[9px]">
                        <th className="pb-3 font-semibold px-4">Student Name</th>
                        <th className="pb-3 font-semibold px-4">Commander ID</th>
                        <th className="pb-3 font-semibold px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {attendanceData.map((data) => (
                        <tr key={data.studentId} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-semibold text-sm">{data.name}</td>
                          <td className="py-3 px-4 font-mono text-on-surface-variant">{data.commanderId}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {["present", "late", "absent"].map(status => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(data.studentId, status)}
                                  className={`px-3 py-1 text-[10px] font-mono uppercase tracking-widest font-bold rounded transition-colors ${
                                    data.status === status 
                                      ? status === "present" ? "bg-primary text-on-primary" : status === "late" ? "bg-secondary text-on-secondary" : "bg-error text-on-error"
                                      : "bg-surface-container-highest border border-outline-variant text-on-surface-variant hover:bg-white/10"
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {attendanceData.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-12 text-center text-on-surface-variant text-sm font-mono">No students enrolled in this course.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
