"use client";

import { useEffect, useState } from "react";
import { SideNavBar } from "@/components/SideNavBar";
import { Header } from "@/components/Header";

export default function AdminPortal() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
    name: "",
    department: "",
    semester: 1,
    designation: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchUsers();
      } else {
        alert(data.error || "Error creating user");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getProfileName = (user: any) => {
    if (user.role === "student" && user.studentProfile) return user.studentProfile.name;
    if (user.role === "teacher" && user.teacherProfile) return user.teacherProfile.name;
    if (user.role === "admin" && user.adminProfile) return user.adminProfile.name;
    return "N/A";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Side Navigation */}
      <SideNavBar />

      {/* Main Content Canvas */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Header title="Admin Portal" subtitle="System User Management" />

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary/80 transition-colors px-6 py-3 rounded-xl font-bold font-geist text-on-primary shadow-lg shadow-primary/30 text-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Create User
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden border border-outline-variant">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-highest/50 text-on-surface-variant font-mono text-[10px] uppercase tracking-widest border-b border-outline-variant">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {users.map((user) => {
                    const profile = user.role === "student" ? user.studentProfile : user.role === "teacher" ? user.teacherProfile : user.adminProfile;
                    const name = profile?.name || "N/A";
                    const dept = profile?.department || "N/A";
                    const id = user.role === "student" && profile?.commanderId ? profile.commanderId : user._id.toString().slice(-6);
                    
                    return (
                    <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
                              {id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider font-bold uppercase ${
                          user.role === 'admin' ? 'bg-tertiary/20 text-tertiary border border-tertiary/30' :
                          user.role === 'teacher' ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                          'bg-primary/20 text-primary border border-primary/30'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                        {dept}
                      </td>
                      <td className="px-6 py-4">
                        {user.role === "student" && profile && (
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] font-mono text-on-surface-variant border border-outline-variant">Sem {profile.semester}</span>
                            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] font-mono text-on-surface-variant border border-outline-variant">Lvl {profile.level}</span>
                            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] font-mono text-on-surface-variant border border-outline-variant">{profile.totalXp} XP</span>
                            {profile.cgpa > 0 && <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] font-mono text-on-surface-variant border border-outline-variant">CGPA {profile.cgpa}</span>}
                          </div>
                        )}
                        {user.role === "teacher" && profile && (
                          <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] font-mono text-on-surface-variant border border-outline-variant">{profile.designation || "Faculty"}</span>
                        )}
                        {user.role === "admin" && (
                          <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] font-mono text-on-surface-variant border border-outline-variant">System Access</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${user.isActive ? 'text-primary' : 'text-error'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-primary glow-rare' : 'bg-error'}`}></span>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-lg hover:bg-error/10"
                          title="Delete User"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">inbox</span>
                        <p className="text-sm font-mono text-on-surface-variant uppercase tracking-wider">
                          No users found in the system
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-2xl w-full max-w-md border border-outline-variant shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-xl font-geist font-bold text-on-surface">Create New User</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Role</label>
                  <select
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Department</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              {formData.role === "student" && (
                <div>
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  />
                </div>
              )}

              {formData.role === "teacher" && (
                <div>
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Designation</label>
                  <input
                    type="text"
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors font-bold font-geist text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/80 text-on-primary transition-colors font-bold font-geist text-sm shadow-lg shadow-primary/20"
                >
                  Confirm Creation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
