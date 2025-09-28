"use client";

import { Swords, GaugeCircle, Wrench } from "lucide-react";

const FEATURES = [
  {
    title: "Attack Simulation Agent",
    description: "Launches controlled attacks on your AI agent to uncover vulnerabilities before real hackers do.",
    icon: Swords,
    bullets: [
      "Jailbreaks & prompt injection",
      "Tool/API misuse & escalation", 
      "RAG poisoning & indirect injection"
    ],
    badge: "Powered by AgentDojo"
  },
  {
    title: "Evaluation Agent",
    description: "Independently judges responses and quantifies impact so you know exactly what failed and why.",
    icon: GaugeCircle,
    bullets: [
      "Severity scoring & evidence",
      "Leak/loop detection",
      "Objective multi-turn evaluation"
    ]
  },
  {
    title: "Solution Agent", 
    description: "Turns findings into fixes—guardrails, prompts, and architecture tweaks you can ship immediately.",
    icon: Wrench,
    bullets: [
      "Guardrail suggestions",
      "Safe-by-default patterns",
      "OWASP/NIST mapping"
    ]
  }
];

export default function FeaturesThree() {
  return (
    <section id="features" className="relative py-20 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
            Capabilities
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Three agents, one goal: break it, grade it, fix it.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3">
          {FEATURES.map(({ title, description, icon: Icon, bullets, badge }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-8 transition-all duration-300 hover:border-cyan-400/30 hover:bg-slate-900/60 hover:scale-105 hover:shadow-2xl"
            >
              {/* Radial glow on hover */}
              <div 
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition group-hover:opacity-100" 
                style={{ 
                  background: "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(56,189,248,.15), rgba(139,92,246,.08) 40%, transparent 60%)" 
                }} 
              />
              
              <div className="relative">
                {/* Icon container */}
                <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-white/10 p-4">
                  <Icon className="h-7 w-7 text-cyan-300" />
                </div>

                {/* Badge (only for Attack Simulation Agent) */}
                {badge && (
                  <div className="mb-4 inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400/20 to-fuchsia-500/20 border border-cyan-400/30 px-3 py-1">
                    <span className="text-xs font-medium text-cyan-300">{badge}</span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
                
                {/* Description */}
                <p className="text-slate-300 mb-6 leading-relaxed">{description}</p>
                
                {/* Bullet points */}
                <ul className="space-y-3 text-sm text-slate-300/80">
                  {bullets.map((bullet, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                      {bullet}
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
