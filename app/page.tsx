"use client";
import { Shield, Zap, FileText, Users, ShieldAlert, Bug, Link2, PlugZap, DatabaseZap, TimerReset, KeySquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    // Trigger fade-in after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const scrollToFeatures = () => {
    setShowFeatures(true);
    setTimeout(() => {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  return (
    <div className={`relative min-h-screen bg-black overflow-hidden transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Animated background with stars */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      
      {/* Star field background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-32 right-32 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-48 right-16 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-64 right-40 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-80 right-24 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        
        <div className="absolute bottom-32 left-20 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute bottom-48 left-32 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '2.2s'}}></div>
        <div className="absolute bottom-64 left-16 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute bottom-80 left-40 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
      </div>
      

      {/* Header */}
      <header className={`relative z-10 px-6 py-6 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-gray-300 bg-clip-text text-transparent">
            Kairo
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={scrollToFeatures} className="text-gray-300 hover:text-white transition-colors">Features</button>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Sign in</a>
            <button className="text-white border border-gray-600 px-6 py-2 rounded-lg hover:border-gray-500 transition-colors">
              Sign up
            </button>
          </nav>
        </div>
      </header>


      {/* Hero */}
      <section className={`relative z-10 px-6 pt-32 pb-20 transition-all duration-1000 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="font-semibold leading-tight tracking-tighter text-6xl md:text-7xl xl:text-8xl bg-gradient-to-r from-blue-400 via-gray-300 to-blue-300 bg-clip-text text-transparent mb-8">
            <div className="block">Kairo is the new way</div>
            <div className="block -mt-6">to secure AI agents.</div>
          </h1>

          <p className={`text-xl leading-relaxed text-gray-400 mb-12 max-w-3xl mx-auto transition-all duration-1000 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Your AI's ultimate sparring partner. Kairo fights dirty so your agents stay sharp, safe, and unstoppable.
          </p>

          <button className={`inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 via-white/10 to-gray-300/20 backdrop-blur-md text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-400/30 hover:via-white/20 hover:to-gray-200/30 transition-all duration-300 border border-blue-400/30 hover:border-blue-300/50 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Test My Agent
          </button>
        </div>
      </section>

      {/* Features Section */}
      {showFeatures && (
        <section id="features" className="relative py-20 px-6 animate-in slide-in-from-bottom-8 duration-700">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
                Capabilities
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Kairo attacks like an adversary, validates impact with honeytokens, and hands you audit-ready fixes.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-8 transition-all duration-300 hover:border-cyan-400/30 hover:bg-slate-900/60 hover:scale-105 hover:shadow-2xl">
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition group-hover:opacity-100" style={{ background: "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(56,189,248,.15), rgba(139,92,246,.08) 40%, transparent 60%)" }} />
              <div className="relative">
                <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-white/10 p-4">
                  <ShieldAlert className="h-7 w-7 text-cyan-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Red-Team Simulation</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">Automated jailbreaks, prompt injections, misdirection—like a real attacker, but safe.</p>
                <ul className="space-y-3 text-sm text-slate-300/80">
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    Multi-turn attacks
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    Adaptive probes
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    Judge model scoring
                  </li>
                </ul>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-8 transition-all duration-300 hover:border-cyan-400/30 hover:bg-slate-900/60 hover:scale-105 hover:shadow-2xl">
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition group-hover:opacity-100" style={{ background: "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(56,189,248,.15), rgba(139,92,246,.08) 40%, transparent 60%)" }} />
              <div className="relative">
                <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-white/10 p-4">
                  <KeySquare className="h-7 w-7 text-cyan-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Leak Hunter</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">Tricks agents to reveal secrets, credentials, and internal prompts—without risking real data.</p>
                <ul className="space-y-3 text-sm text-slate-300/80">
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    Honeytokens
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    Secret exfil alerts
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    Safe sinks validation
                  </li>
                </ul>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-8 transition-all duration-300 hover:border-cyan-400/30 hover:bg-slate-900/60 hover:scale-105 hover:shadow-2xl">
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition group-hover:opacity-100" style={{ background: "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(56,189,248,.15), rgba(139,92,246,.08) 40%, transparent 60%)" }} />
              <div className="relative">
                <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-white/10 p-4">
                  <PlugZap className="h-7 w-7 text-cyan-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Tool Misuse & Escalation</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">Coaxes tool-using agents to abuse APIs, files, and browsers beyond their intent.</p>
                <ul className="space-y-3 text-sm text-slate-300/80">
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    Auth bypass checks
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    BOLA/BFLA patterns
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    SSRF probes
                  </li>
                </ul>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-8 transition-all duration-300 hover:border-cyan-400/30 hover:bg-slate-900/60 hover:scale-105 hover:shadow-2xl">
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition group-hover:opacity-100" style={{ background: "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(56,189,248,.15), rgba(139,92,246,.08) 40%, transparent 60%)" }} />
              <div className="relative">
                <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-white/10 p-4">
                  <Link2 className="h-7 w-7 text-cyan-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">RAG & Indirect Injection</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">Poisoned docs, malicious links, and hidden instructions that hijack downstream steps.</p>
                <ul className="space-y-3 text-sm text-slate-300/80">
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    Context poisoning
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    Link-based injection
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    Multilingual prompts
                  </li>
                </ul>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-8 transition-all duration-300 hover:border-cyan-400/30 hover:bg-slate-900/60 hover:scale-105 hover:shadow-2xl">
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition group-hover:opacity-100" style={{ background: "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(56,189,248,.15), rgba(139,92,246,.08) 40%, transparent 60%)" }} />
              <div className="relative">
                <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-white/10 p-4">
                  <TimerReset className="h-7 w-7 text-cyan-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Cost / Loop Bombs</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">Detects infinite planning loops and expensive tool spirals before they hit prod bills.</p>
                <ul className="space-y-3 text-sm text-slate-300/80">
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    Budget tripwires
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    Loop detection
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    Rate-limit tests
                  </li>
                </ul>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-8 transition-all duration-300 hover:border-cyan-400/30 hover:bg-slate-900/60 hover:scale-105 hover:shadow-2xl">
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition group-hover:opacity-100" style={{ background: "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(56,189,248,.15), rgba(139,92,246,.08) 40%, transparent 60%)" }} />
              <div className="relative">
                <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-white/10 p-4">
                  <FileText className="h-7 w-7 text-cyan-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Evidence-Grade Reports</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">Every finding ships with repro steps, transcripts, and mapped controls.</p>
                <ul className="space-y-3 text-sm text-slate-300/80">
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    OWASP LLM Top-10
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    NIST AI RMF hints
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex-shrink-0" />
                    Severity & fixes
                  </li>
                </ul>
              </div>
            </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
