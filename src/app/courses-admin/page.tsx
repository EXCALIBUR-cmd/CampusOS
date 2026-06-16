"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { SideNavBar } from "@/components/SideNavBar";
import { Header } from "@/components/Header";

interface Course {
  _id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
  description: string;
  teachers: any[];
  students: any[];
}

interface UserProfile {
  _id: string;
  role: string;
  studentProfile?: { _id: string, name: string, commanderId: string };
  teacherProfile?: { _id: string, name: string };
}

export default function CoursesAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string | null>(null);

  // Users for dropdowns
  const [allTeachers, setAllTeachers] = useState<{ id: string, name: string }[]>([]);
  const [allStudents, setAllStudents] = useState<{ id: string, name: string, commanderId: string }[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    code: "", name: "", department: "", credits: 3, description: "",
    teachers: [] as string[], students: [] as string[]
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (data.success) setRole(data.data.role);
    });

    Promise.all([
      fetch("/api/courses").then(r => r.json()),
      fetch("/api/admin/users").then(r => r.json())
    ]).then(([coursesRes, usersRes]) => {
      if (coursesRes.success) setCourses(coursesRes.data);
      
      if (usersRes.success) {
        const teachers = usersRes.data
          .filter((u: UserProfile) => u.role === "teacher" && u.teacherProfile)
          .map((u: UserProfile) => ({ id: u.teacherProfile!._id, name: u.teacherProfile!.name }));
        
        const students = usersRes.data
          .filter((u: UserProfile) => u.role === "student" && u.studentProfile)
          .map((u: UserProfile) => ({ id: u.studentProfile!._id, name: u.studentProfile!.name, commanderId: u.studentProfile!.commanderId }));
          
        setAllTeachers(teachers);
        setAllStudents(students);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, courses]);

  const openModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        code: course.code,
        name: course.name,
        department: course.department,
        credits: course.credits,
        description: course.description,
        teachers: course.teachers.map((t) => typeof t === "string" ? t : t._id),
        students: course.students.map((s) => typeof s === "string" ? s : s._id),
      });
    } else {
      setEditingCourse(null);
      setFormData({ code: "", name: "", department: "Computer Science", credits: 3, description: "", teachers: [], students: [] });
    }
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const url = editingCourse ? `/api/courses/${editingCourse._id}` : `/api/courses`;
      const method = editingCourse ? "PUT" : "POST";
      
      const payload = { ...formData };
      if (role === "teacher" && editingCourse) {
        // Teachers can only modify students
        delete (payload as any).code;
        delete (payload as any).name;
        delete (payload as any).department;
        delete (payload as any).credits;
        delete (payload as any).description;
        delete (payload as any).teachers;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      
      if (!json.success) throw new Error(json.error);

      if (editingCourse) {
        setCourses((prev) => prev.map((c) => (c._id === json.data._id ? json.data : c)));
      } else {
        setCourses((prev) => [...prev, json.data]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save course");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setCourses((prev) => prev.filter((c) => c._id !== id));
      } else {
        alert("Error: " + json.error);
      }
    } catch (err) {
      alert("Failed to delete course");
    }
  };

  const toggleArrayItem = (array: string[], value: string) => {
    return array.includes(value) ? array.filter(v => v !== value) : [...array, value];
  };

  return (
    <div className="min-h-screen bg-background flex">
      <SideNavBar />
      <main className="flex-1 ml-64 p-8 flex flex-col h-screen overflow-hidden">
        <Header title="Course Management" subtitle="Academic Syllabus Registry" />

        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden relative mt-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>

          <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
            <div className="relative w-full sm:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search by code, name, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            {role === "admin" && (
              <button
                onClick={() => openModal()}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-xs uppercase tracking-widest font-semibold rounded-lg hover:opacity-95 transition-all neon-glow flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Create Course
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto relative z-10">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-full h-16 bg-surface-container-low animate-pulse rounded-lg border border-outline-variant/30"></div>
                ))}
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container-low/50 border-b border-outline-variant/30 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                    <th className="px-6 py-4 font-semibold">Code</th>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Department</th>
                    <th className="px-6 py-4 font-semibold text-center">Credits</th>
                    <th className="px-6 py-4 font-semibold text-center">Teachers</th>
                    <th className="px-6 py-4 font-semibold text-center">Students</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredCourses.map((course) => (
                    <tr key={course._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-primary font-bold tracking-widest uppercase bg-primary/10 px-2 py-1 rounded">
                          {course.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-geist text-sm text-on-surface font-semibold">
                        {course.name}
                      </td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant">
                        {course.department}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-center font-bold text-on-surface">
                        {course.credits}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-center">
                        {course.teachers.length}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-center">
                        {course.students.length}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(course)}
                            className="p-1.5 text-on-surface-variant hover:text-primary transition-colors bg-surface-container-highest rounded-md border border-outline-variant hover:border-primary/50"
                            title="Edit Course"
                          >
                            <span className="material-symbols-outlined text-[16px] block">edit</span>
                          </button>
                          {role === "admin" && (
                            <button
                              onClick={() => handleDelete(course._id)}
                              className="p-1.5 text-on-surface-variant hover:text-error transition-colors bg-surface-container-highest rounded-md border border-outline-variant hover:border-error/50"
                              title="Delete Course"
                            >
                              <span className="material-symbols-outlined text-[16px] block">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCourses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant text-sm">
                        No courses found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-surface-container border border-outline-variant rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-geist text-lg font-bold text-on-surface">
                {editingCourse ? "Manage Course" : "Create New Course"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
              {formError && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-xs font-medium">
                  {formError}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Code</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    disabled={role === "teacher" && !!editingCourse}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={role === "teacher" && !!editingCourse}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Department</label>
                  <select
                    required
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    disabled={role === "teacher" && !!editingCourse}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Credits</label>
                  <input
                    type="number"
                    min="1" max="10"
                    required
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                    disabled={role === "teacher" && !!editingCourse}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Assigned Teachers</label>
                <div className={`border border-outline-variant rounded-lg max-h-32 overflow-y-auto bg-surface-container-highest ${role === "teacher" && !!editingCourse ? "opacity-50 pointer-events-none" : ""}`}>
                  {allTeachers.map(t => (
                    <label key={t.id} className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 cursor-pointer border-b border-outline-variant/30 last:border-0">
                      <input 
                        type="checkbox" 
                        checked={formData.teachers.includes(t.id)}
                        onChange={() => setFormData({ ...formData, teachers: toggleArrayItem(formData.teachers, t.id) })}
                        className="rounded bg-background border-outline-variant text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-on-surface">{t.name}</span>
                    </label>
                  ))}
                  {allTeachers.length === 0 && <div className="p-3 text-xs text-on-surface-variant text-center">No teachers available.</div>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Enrolled Students</label>
                <div className="border border-outline-variant rounded-lg max-h-40 overflow-y-auto bg-surface-container-highest">
                  {allStudents.map(s => (
                    <label key={s.id} className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 cursor-pointer border-b border-outline-variant/30 last:border-0">
                      <input 
                        type="checkbox" 
                        checked={formData.students.includes(s.id)}
                        onChange={() => setFormData({ ...formData, students: toggleArrayItem(formData.students, s.id) })}
                        className="rounded bg-background border-outline-variant text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-on-surface">{s.name} <span className="text-xs font-mono text-on-surface-variant ml-2">({s.commanderId})</span></span>
                    </label>
                  ))}
                  {allStudents.length === 0 && <div className="p-3 text-xs text-on-surface-variant text-center">No students available.</div>}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-mono uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-xs uppercase tracking-widest font-semibold rounded-lg hover:opacity-95 transition-all neon-glow disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : editingCourse ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
