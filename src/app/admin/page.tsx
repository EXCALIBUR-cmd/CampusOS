"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { SideNavBar } from "@/components/SideNavBar";
import { Header } from "@/components/Header";

export default function AdminPortal() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // Search, Filter, Pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

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
      const url = editingUserId ? `/api/admin/users/${editingUserId}` : "/api/admin/users";
      const method = editingUserId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingUserId(null);
        fetchUsers();
      } else {
        alert(data.error || "Error saving user");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openModalForCreate = () => {
    setEditingUserId(null);
    setFormData({ email: "", password: "", role: "student", name: "", department: "", semester: 1, designation: "" });
    setShowModal(true);
  };

  const openModalForEdit = (user: any) => {
    setEditingUserId(user._id);
    const profile = user.role === "student" ? user.studentProfile : user.role === "teacher" ? user.teacherProfile : user.adminProfile;
    setFormData({
      email: user.email,
      password: "", // Leave blank for edit unless changing (though API doesn't handle pass update yet)
      role: user.role,
      name: profile?.name || "",
      department: profile?.department || "",
      semester: profile?.semester || 1,
      designation: profile?.designation || "",
    });
    setShowModal(true);
  };

  const getProfileName = (user: any) => {
    if (user.role === "student" && user.studentProfile) return user.studentProfile.name;
    if (user.role === "teacher" && user.teacherProfile) return user.teacherProfile.name;
    if (user.role === "admin" && user.adminProfile) return user.adminProfile.name;
    return "N/A";
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      if (!matchesRole) return false;

      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const name = getProfileName(u).toLowerCase();
      const email = (u.email || "").toLowerCase();
      const profile = u.role === "student" ? u.studentProfile : u.role === "teacher" ? u.teacherProfile : u.adminProfile;
      const id = u.role === "student" && profile?.commanderId ? profile.commanderId.toLowerCase() : u._id.toString().toLowerCase();

      return name.includes(term) || email.includes(term) || id.includes(term);
    });
  }, [users, searchTerm, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-outline-variant/50">
      <td className="px-6 py-4"><div className="h-4 bg-surface-container-highest rounded w-20"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-surface-container-highest rounded w-48"></div></td>
      <td className="px-6 py-4"><div className="h-6 bg-surface-container-highest rounded-full w-16"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-surface-container-highest rounded w-24"></div></td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <div className="h-5 bg-surface-container-highest rounded w-12"></div>
          <div className="h-5 bg-surface-container-highest rounded w-16"></div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-4 bg-surface-container-highest rounded w-16"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-8 bg-surface-container-highest rounded w-8 ml-auto"></div></td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <SideNavBar />

      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Header title="Admin Portal" subtitle="System User Management" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-1 w-full gap-4">
            {/* Search Input */}
            <div className="relative max-w-sm w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="Search by ID, name, or email..." 
                className="w-full bg-surface-container-highest border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Role Filter */}
            <select 
              className="bg-surface-container-highest border border-outline-variant rounded-xl px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors appearance-none pr-10 relative min-w-[120px]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            onClick={openModalForCreate}
            className="bg-primary hover:bg-primary/80 transition-colors px-6 py-2.5 rounded-xl font-bold font-geist text-on-primary shadow-lg shadow-primary/30 text-sm flex items-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Create User
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden border border-outline-variant flex flex-col h-[calc(100vh-220px)]">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-highest z-10 shadow-sm">
                <tr className="text-on-surface-variant font-mono text-[10px] uppercase tracking-widest border-b border-outline-variant">
                  <th className="px-6 py-4">ID / Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => {
                    const profile = user.role === "student" ? user.studentProfile : user.role === "teacher" ? user.teacherProfile : user.adminProfile;
                    const name = profile?.name || "N/A";
                    const dept = profile?.department || "N/A";
                    const id = user.role === "student" && profile?.commanderId ? profile.commanderId : user._id.toString().slice(-6);
                    
                    return (
                    <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-geist font-bold text-on-surface text-sm">
                            {name}
                          </span>
                          <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
                            ID: {id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <Link 
                          href={`/profile/${user._id}`} 
                          className="text-primary hover:text-primary/80 transition-colors underline decoration-primary/30 underline-offset-4"
                        >
                          {user.email}
                        </Link>
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
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openModalForEdit(user)}
                          className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
                          title="Edit User"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
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
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">search_off</span>
                      <p className="text-sm font-mono text-on-surface-variant uppercase tracking-wider">
                        No users match your criteria
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {!loading && filteredUsers.length > 0 && (
            <div className="border-t border-outline-variant p-4 bg-surface-container-lowest flex justify-between items-center">
              <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-geist font-bold text-on-surface"
                >
                  Prev
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-geist font-bold text-on-surface"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-2xl w-full max-w-md border border-outline-variant shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-xl font-geist font-bold text-on-surface">{editingUserId ? "Edit User" : "Create New User"}</h2>
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
                  disabled={!!editingUserId}
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {!editingUserId && (
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
              )}
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
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors appearance-none disabled:opacity-50"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    disabled={!!editingUserId}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Department</label>
                  <select
                    required
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="" disabled>Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Civil">Civil</option>
                    <option value="Aerospace">Aerospace</option>
                    <option value="Chemical">Chemical</option>
                    <option value="Hydrology">Hydrology</option>
                    <option value="Thermodynamics">Thermodynamics</option>
                    <option value="Biotech">Biotech</option>
                  </select>
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
                  {editingUserId ? "Save Changes" : "Confirm Creation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
