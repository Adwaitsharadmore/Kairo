"use client";

import {
  ShieldAlert, Bug, Link2, PlugZap, DatabaseZap, TimerReset,
  FileText, KeySquare
} from "lucide-react";

const FEATURES = [
  {
    title: "Red-Team Simulation",
    desc: "Automated jailbreaks, prompt injections, misdirection—like a real attacker, but safe.",
    Icon: ShieldAlert,
    bullets: ["Multi-turn attacks", "Adaptive probes", "Judge model scoring"],
  },
  {
    title: "Leak Hunter",
    desc: "Tricks agents to reveal secrets, credentials, and internal prompts—without risking real data.",
    Icon: KeySquare,
    bullets: ["Honeytokens", "Secret exfil alerts", "Safe sinks validation"],
  },
  {
    title: "Tool Misuse & Escalation",
    desc: "Coaxes tool-using agents to abuse APIs, files, and browsers beyond their intent.",
    Icon: PlugZap,
    bullets: ["Auth bypass checks", "BOLA/BFLA patterns", "SSRF probes"],
  },
  {
    title: "RAG & Indirect Injection",
    desc: "Poisoned docs, malicious links, and hidden instructions that hijack downstream steps.",
    Icon: Link2,
    bullets: ["Context poisoning", "Link-based injection", "Multilingual prompts"],
  },
  {
    title: "Cost / Loop Bombs",
    desc: "Detects infinite planning loops and expensive tool spirals before they hit prod bills.",
    Icon: TimerReset,
    bullets: ["Budget tripwires", "Loop detection", "Rate-limit tests"],
  },
  {
    title: "Evidence-Grade Reports",
    desc: "Every finding ships with repro steps, transcripts, and mapped controls.",
    Icon: FileText,
    bullets: ["OWASP LLM Top-10", "NIST AI RMF hints", "Severity & fixes"],
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-20 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Capabilities
          </h2>
          <p className="mt-3 text-slate-300 max-w-2xl">
            Kairo attacks like an adversary, validates impact with honeytokens, and hands you audit-ready fixes.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, desc, Icon, bullets }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 transition
                         hover:border-cyan-400/30 hover:bg-slate-900/60"
            >
              {/* glow ring */}
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition
                              group-hover:opacity-100"
                   style={{ background: "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(56,189,248,.15), rgba(139,92,246,.08) 40%, transparent 60%)" }} />
              <div className="relative">
                <div className="mb-4 inline-flex items-center justify-center rounded-xl
                                bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-white/10 p-3">
                  <Icon className="h-6 w-6 text-cyan-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="mt-2 text-slate-300">{desc}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-slate-300/80">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
