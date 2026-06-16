"use client";

import { useEffect, useState } from "react";
import { SideNavBar } from "@/components/SideNavBar";
import { Header } from "@/components/Header";

interface Ticket {
  _id: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  reply: string;
  user?: { email: string; role: string };
  createdAt: string;
}

export default function SupportPage() {
  const [role, setRole] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  
  // Admin reply states
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.success) setRole(data.data.role);
      })
      .catch(console.error);

    fetch("/api/support")
      .then(r => r.json())
      .then(data => {
        if (data.success) setTickets(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const json = await res.json();
      if (json.success) {
        setTickets([json.data, ...tickets]);
        setSubject("");
        setMessage("");
      } else {
        setFormError(json.error || "Failed to submit ticket");
      }
    } catch (err) {
      setFormError("Network error. Try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleResolveTicket = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/support/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reply: replyMessage }),
      });
      const json = await res.json();
      if (json.success) {
        setTickets(tickets.map(t => t._id === id ? { ...t, status: json.data.status, reply: json.data.reply } : t));
        setReplyingTo(null);
        setReplyMessage("");
      } else {
        alert(json.error);
      }
    } catch (err) {
      alert("Failed to resolve ticket");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <SideNavBar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Header title="Support Hub" subtitle="Centralized Issue Resolution Protocol" />

        <div className="grid grid-cols-12 gap-6 mt-6">
          {role !== "admin" && (
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <section className="glass-card p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
                <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface mb-6 relative z-10">
                  New Support Request
                </h3>
                {formError && (
                  <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-xs font-medium">
                    {formError}
                  </div>
                )}
                <form onSubmit={handleSubmitTicket} className="space-y-4 relative z-10">
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Subject</label>
                    <input
                      type="text" required
                      className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Message</label>
                    <textarea
                      required rows={5}
                      className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary resize-none"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                    ></textarea>
                  </div>
                  <button
                    type="submit" disabled={formLoading}
                    className="w-full py-3 bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-xs uppercase tracking-widest font-semibold rounded-lg hover:opacity-95 transition-all neon-glow flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    {formLoading ? "Transmitting..." : "Submit Request"}
                  </button>
                </form>
              </section>
            </div>
          )}

          <div className={`col-span-12 ${role !== "admin" ? "lg:col-span-8" : ""}`}>
            <section className="glass-card p-6 rounded-2xl min-h-[500px]">
              <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface mb-6">
                {role === "admin" ? "Global Ticket Queue" : "Your Tickets"}
              </h3>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="w-full h-24 bg-surface-container-low animate-pulse rounded-xl"></div>)}
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant text-sm font-mono">No active support tickets found.</div>
              ) : (
                <div className="space-y-4">
                  {tickets.map(ticket => (
                    <div key={ticket._id} className="bg-surface-container-highest border border-outline-variant/50 p-5 rounded-xl transition-all hover:bg-white/[0.02]">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-geist text-base font-bold text-on-surface">{ticket.subject}</h4>
                          <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
                            {role === "admin" && ticket.user && <span>From: {ticket.user.email} // </span>}
                            {new Date(ticket.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest font-bold rounded ${
                          ticket.status === "open" ? "bg-warning/10 text-warning border border-warning/20" : "bg-primary/10 text-primary border border-primary/20"
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-on-surface-variant bg-surface-container-lowest p-3 rounded-lg mb-4">
                        {ticket.message}
                      </div>

                      {ticket.reply && (
                        <div className="text-sm text-primary bg-primary/5 border border-primary/20 p-3 rounded-lg mb-4 flex gap-3">
                          <span className="material-symbols-outlined text-[18px]">support_agent</span>
                          <div>
                            <span className="block font-bold text-[10px] font-mono uppercase tracking-widest mb-1">Admin Response</span>
                            {ticket.reply}
                          </div>
                        </div>
                      )}

                      {role === "admin" && ticket.status === "open" && (
                        <div className="pt-4 border-t border-outline-variant/30">
                          {replyingTo === ticket._id ? (
                            <div className="space-y-3">
                              <textarea
                                rows={3} placeholder="Type your response here..."
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:border-primary resize-none"
                                value={replyMessage} onChange={e => setReplyMessage(e.target.value)}
                              ></textarea>
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setReplyingTo(null)} className="px-3 py-1.5 text-xs font-mono uppercase text-on-surface-variant hover:text-on-surface">Cancel</button>
                                <button onClick={() => handleResolveTicket(ticket._id, "resolved")} className="px-4 py-1.5 bg-primary/20 text-primary font-mono text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-primary/30 transition-all border border-primary/30">Resolve Ticket</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setReplyingTo(ticket._id)} className="text-[10px] font-mono uppercase tracking-widest font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">reply</span> Reply & Resolve
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
