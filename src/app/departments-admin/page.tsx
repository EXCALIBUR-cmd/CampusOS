"use client";

import { useEffect, useState, useMemo } from "react";
import { SideNavBar } from "@/components/SideNavBar";
import { Header } from "@/components/Header";

interface Department {
  _id: string;
  name: string;
  code: string;
  headOfDepartment: string;
  description: string;
}

export default function DepartmentsAdminPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", headOfDepartment: "", description: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch("/api/departments")
      .then(r => r.json())
      .then(data => {
        if (data.success) setDepartments(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredDepts = useMemo(() => {
    return departments.filter(d => 
      d.name.toLowerCase().includes(search.toLowerCase()) || 
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.headOfDepartment.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, departments]);

  const openModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ name: dept.name, code: dept.code, headOfDepartment: dept.headOfDepartment, description: dept.description });
    } else {
      setEditingDept(null);
      setFormData({ name: "", code: "", headOfDepartment: "", description: "" });
    }
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const url = editingDept ? `/api/departments/${editingDept._id}` : `/api/departments`;
      const method = editingDept ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      
      if (!json.success) throw new Error(json.error);

      if (editingDept) {
        setDepartments(prev => prev.map(d => d._id === json.data._id ? json.data : d));
      } else {
        setDepartments(prev => [...prev, json.data]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save department");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setDepartments(prev => prev.filter(d => d._id !== id));
      } else {
        alert("Error: " + json.error);
      }
    } catch (err) {
      alert("Failed to delete department");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <SideNavBar />
      <main className="flex-1 ml-64 p-8 flex flex-col h-screen overflow-hidden">
        <Header title="Department Management" subtitle="Academic Division Registry" />

        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden relative mt-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>

          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center relative z-10">
            <div className="relative w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search departments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-xs uppercase tracking-widest font-semibold rounded-lg hover:opacity-95 transition-all neon-glow flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Division
            </button>
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
                    <th className="px-6 py-4 font-semibold">Department Name</th>
                    <th className="px-6 py-4 font-semibold">Head of Dept</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredDepts.map((dept) => (
                    <tr key={dept._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-primary font-bold tracking-widest uppercase bg-primary/10 px-2 py-1 rounded">
                          {dept.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-geist text-sm text-on-surface font-semibold">{dept.name}</td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant">{dept.headOfDepartment || "Not Assigned"}</td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant truncate max-w-[200px]">{dept.description}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openModal(dept)}
                          className="p-1.5 text-on-surface-variant hover:text-primary transition-colors bg-surface-container-highest rounded-md border border-outline-variant hover:border-primary/50"
                        >
                          <span className="material-symbols-outlined text-[16px] block">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(dept._id)}
                          className="p-1.5 text-on-surface-variant hover:text-error transition-colors bg-surface-container-highest rounded-md border border-outline-variant hover:border-error/50"
                        >
                          <span className="material-symbols-outlined text-[16px] block">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredDepts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant text-sm">No departments found.</td>
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
          <div className="bg-surface-container border border-outline-variant rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-geist text-lg font-bold text-on-surface">{editingDept ? "Manage Division" : "Create New Division"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-xs font-medium">{formError}</div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Division Code</label>
                  <input
                    type="text" required
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Division Name</label>
                  <input
                    type="text" required
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Head of Department</label>
                  <input
                    type="text"
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary"
                    value={formData.headOfDepartment}
                    onChange={e => setFormData({ ...formData, headOfDepartment: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary resize-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant">
                <button
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-mono uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
                >Cancel</button>
                <button
                  type="submit" disabled={formLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-xs uppercase tracking-widest font-semibold rounded-lg hover:opacity-95 transition-all neon-glow disabled:opacity-50"
                >{formLoading ? "Saving..." : editingDept ? "Save Changes" : "Create Division"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
