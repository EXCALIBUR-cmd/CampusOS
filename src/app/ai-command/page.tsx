"use client";

import { SideNavBar } from "@/components/SideNavBar";
import { Header } from "@/components/Header";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
  time: string;
}

export default function AICommandPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Academic Intel interface calibrated. Welcome back, Commander Sterling. State your academic directive. I am configured to assist with CS-401 (AI Ethics), CS-402 (Databases), and MTH-302 (Linear Algebra).",
      time: "10:00 AM",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    // Simulated Intelligence response
    setTimeout(() => {
      let replyText = "Directive registered, Commander. Let me analyze that query against our system database. ";

      if (inputValue.toLowerCase().includes("attendance")) {
        replyText +=
          "Your overall attendance rating is 92%. However, Software Engineering (CS-405) has reached a critical threshold with 0 remaining absences allowed. I recommend prioritizing the next SE lecture.";
      } else if (inputValue.toLowerCase().includes("math") || inputValue.toLowerCase().includes("algebra")) {
        replyText +=
          "Linear Algebra (MTH-302) shows optimal mastery at 92%. Your next mission 'Eigenvalues & Spectral Theorems' is complete. I recommend reviewing eigenvectors for the upcoming module quiz.";
      } else if (inputValue.toLowerCase().includes("assignment") || inputValue.toLowerCase().includes("mission")) {
        replyText +=
          "You have 3 active assignments pending. AI Ethics CS-401 is due in 4 days. You can submit files directly through the Missions Control Submission Terminal.";
      } else {
        replyText +=
          "Analysis complete. Your CGPA rating remains strong at 3.8. Focus on active course deliverables to optimize your next weekly XP calibration.";
      }

      const aiResponse: Message = {
        id: Date.now() + 1,
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setLoading(false);
    }, 1500);
  };

  const samplePrompts = [
    "Analyze attendance warning alerts",
    "Show linear algebra study plan",
    "What are my pending assignments?",
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Side Navigation */}
      <SideNavBar />

      {/* Main Content Canvas */}
      <main className="flex-1 ml-64 p-8 flex flex-col h-screen overflow-hidden">
        <Header title="AI Command Center" subtitle="Academic Intel: Intelligence Matrix" />

        {/* Chat Interface Container */}
        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 max-w-2xl ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 font-bold text-xs uppercase ${
                    msg.sender === "user"
                      ? "text-primary border-primary bg-primary/15"
                      : "text-secondary border-secondary bg-secondary/15"
                  }`}
                >
                  {msg.sender === "user" ? "S" : "AI"}
                </div>
                <div
                  className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary/5 border-primary/20 text-on-surface"
                      : "bg-surface-container-low border-outline-variant/30 text-on-surface-variant"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className="font-mono text-[9px] text-outline/50 mt-2 text-right uppercase tracking-wider">
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-4 mr-auto max-w-2xl">
                <div className="w-8 h-8 rounded-full border border-secondary/20 bg-secondary/15 flex items-center justify-center font-bold text-xs text-secondary shrink-0">
                  AI
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant flex items-center gap-2 font-mono">
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full"></span>
                  <span className="animate-pulse">Calibrating Intelligence Matrix...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Ideas */}
          <div className="px-6 py-3 border-t border-outline-variant/20 flex flex-wrap gap-2 text-[10px]">
            {samplePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInputValue(prompt)}
                className="bg-white/5 hover:bg-white/10 border border-outline-variant/50 text-on-surface-variant hover:text-primary hover:border-primary/30 px-3 py-1.5 rounded-lg transition-all font-mono uppercase tracking-wider cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form Terminal */}
          <form
            onSubmit={handleSend}
            className="p-6 border-t border-outline-variant/30 flex items-center gap-4 bg-surface-container-lowest/50"
          >
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-0 bottom-2 text-on-surface-variant text-[18px]">
                terminal
              </span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Transmit system query directive..."
                className="w-full bg-transparent pl-8 pr-2 py-1.5 border-b border-outline-variant/50 focus:border-primary text-on-surface font-sans text-xs focus:outline-none transition-all placeholder:text-outline/40"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-xs uppercase tracking-widest font-semibold rounded-lg hover:opacity-95 transition-all neon-glow cursor-pointer"
            >
              Transmit
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
