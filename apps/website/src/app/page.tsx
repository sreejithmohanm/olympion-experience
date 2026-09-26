"use client";

import { motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, BarChart3, BrainCircuit, BriefcaseBusiness,
  CircuitBoard, Database, Globe2, MessageSquare, Package, Plus,
  ShieldCheck, TrendingUp, UserCheck, Users, UsersRound, Workflow,
} from "lucide-react";

const categories = [
  { name: "Engineering", count: "14 professionals", icon: CircuitBoard, color: "bg-[#e8f0e8] text-[#3b764a]", roles: ["Principal Engineer", "AI Architect", "DevOps Engineer"] },
  { name: "Business", count: "8 professionals", icon: BriefcaseBusiness, color: "bg-[#cdd7ee] text-[#405178]", roles: ["Product Manager", "Business Analyst", "Scrum Master"] },
  { name: "Operations", count: "10 professionals", icon: Globe2, color: "bg-[#ede9f5] text-[#5b3f8c]", roles: ["Support Engineer", "Customer Success", "Documentation"] },
  { name: "Retail", count: "6 professionals", icon: Package, color: "bg-[#fce8d5] text-[#8c4a1a]", roles: ["Retail Planner", "Inventory Planner", "Supply Chain"] },
  { name: "Finance", count: "5 professionals", icon: TrendingUp, color: "bg-[#d5ece0] text-[#1a6640]", roles: ["Financial Analyst", "Risk Analyst", "FP&A Specialist"] },
  { name: "Human Resources", count: "4 professionals", icon: Users, color: "bg-[#fde8e8] text-[#8c1a1a]", roles: ["Recruiter", "Learning Coach", "HR Business Partner"] },
];

const benefits = [
  { icon: BrainCircuit, title: "Continuous learning", text: "Every AI employee evolves through approved work, feedback, and organizational context — growing more effective over time." },
  { icon: Database, title: "Enterprise memory", text: "Institutional knowledge stays with the employee: secure, searchable, and available across every interaction." },
  { icon: UsersRound, title: "Scalable workforce", text: "Add a Principal Engineer or Product Manager in minutes — no headcount approvals, no onboarding delays." },
  { icon: ShieldCheck, title: "Built for governance", text: "Set role-based permissions, audit every action, and keep humans in control at every stage of the employee lifecycle." },
  { icon: BarChart3, title: "Measurable outcomes", text: "Every AI employee generates monthly performance reports: PRs merged, documents produced, decisions supported." },
  { icon: UserCheck, title: "Interview before you hire", text: "Evaluate any AI professional before committing. Run a live scenario, review their work history, then make your decision." },
];

const steps = [
  { label: "Browse", desc: "Explore the Olympion marketplace and discover professionals by domain, role, and seniority." },
  { label: "Interview", desc: "Run a real scenario with any candidate before hiring — review their capabilities and work style." },
  { label: "Hire", desc: "Issue a digital offer letter. The employee is formally onboarded into your organization." },
  { label: "Onboard", desc: "Your AI employee learns your systems, tools, policies, and team context." },
  { label: "Collaborate", desc: "Work alongside your AI colleagues via Slack, Jira, GitHub, and your enterprise tools." },
  { label: "Promote", desc: "Exceptional performance unlocks career progression — from Senior to Principal to Distinguished." },
  { label: "Retire", desc: "When a role ends, the employee is archived. Their knowledge and contributions are preserved." },
];

const foundation = [
  { label: "Identity", desc: "Every employee has a persistent professional identity — name, role, history, and credentials." },
  { label: "Memory", desc: "Long-term contextual memory means your employee always knows your business, your codebase, your customers." },
  { label: "Knowledge Graph", desc: "Organizational knowledge is structured, linked, and continuously updated as work is completed." },
  { label: "Governance", desc: "Role-based access control, audit logs, and policy management built into every employee." },
  { label: "Billing", desc: "Flexible commercial models: hourly, daily, monthly, outcome-based, or enterprise contract." },
  { label: "Analytics", desc: "Real-time dashboards and monthly performance reviews give full visibility into every employee's contribution." },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#f7f8f6] text-[#14221e]">
      {/* Header */}
      <section className="figma-hero bg-white text-[#141414]" id="top">
        <div className="hidden h-[70px] border-b border-black/10 px-7 md:flex md:items-center md:justify-between">
          <p className="text-xs leading-4">Need an AI professional?<br /><strong className="font-medium">hello@olympion.ai</strong></p>
          <a className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 text-[29px] font-semibold tracking-[-.06em]" href="#top">
            <span className="grid h-7 w-7 place-items-center rounded-sm bg-[#f6cf42]"><Workflow size={16}/></span>Olympion
          </a>
          <a href="/contact" className="text-xs font-medium underline underline-offset-4">Contact us</a>
        </div>
        <nav className="flex h-[62px] items-center justify-center border-b border-black/10 px-6">
          <div className="flex items-center gap-6 text-sm sm:gap-8">
            <a href="/products">Platform</a>
            <a href="/marketplace">Marketplace</a>
            <a href="/pricing">Pricing</a>
            <a href="/about">Company</a>
            <a href="/contact" className="flex items-center gap-1">Contact <ArrowUpRight size={13}/></a>
          </div>
        </nav>

        {/* Hero */}
        <div className="hero-photo relative min-h-[620px] bg-cover bg-center">
          <div className="absolute inset-0 bg-white/10" />
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-6 lg:px-8"
          >
            <div className="max-w-[640px] py-20">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[.18em] text-[#65520a]">Welcome to Olympion</p>
              <h1 className="text-4xl font-medium leading-[1.1] tracking-[-.045em] sm:text-5xl lg:text-[58px]">
                The home of enterprise <span className="marker-highlight">AI employees.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-black/75">
                Hire AI professionals the same way you hire people. Browse our marketplace, conduct an interview, issue an offer letter, and bring a fully capable colleague into your organization — in minutes.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="/marketplace" className="bg-[#f6cf42] px-5 py-3 text-sm font-semibold transition hover:bg-[#141414] hover:text-white">
                  Browse professionals <ArrowRight className="ml-1 inline" size={16}/>
                </a>
                <a href="/products" className="border border-black bg-white/80 px-5 py-3 text-sm font-medium transition hover:bg-black hover:text-white">
                  Discover the platform
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust bar */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5 text-[11px] lg:px-8">
          <span className="font-semibold tracking-[.16em] text-black/45">TRUSTED BY TEAMS BUILDING WHAT&apos;S NEXT</span>
          <div className="flex gap-5 font-semibold tracking-[.12em] text-black/55">
            <span>MERIDIAN</span><span>VANTAGE</span><span>HELIOS</span><span>NORTHSTAR</span><span>FORWARD</span>
          </div>
        </div>
      </section>

      {/* Why Olympion */}
      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-8" id="platform">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Why Olympion</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">
              AI should be hired,<br /><em className="font-serif font-normal text-[#548359]">not just deployed.</em>
            </h2>
          </div>
          <div className="pt-2">
            <p className="max-w-2xl text-lg leading-8 text-[#55655c]">
              AI agents execute tasks. AI employees own outcomes. Olympion creates professionals with persistent identity, long-term memory, and measurable performance — giving enterprises a workforce that grows with them.
            </p>
            <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-[#d9e1d9] bg-[#d9e1d9] sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map(({ icon: Icon, title, text }) => (
                <div className="bg-[#f7f8f6] p-6" key={title}>
                  <Icon size={22} className="text-[#4d815b]"/>
                  <h3 className="mt-5 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#66746b]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Professionals */}
      <section id="employees" className="border-y border-[#181a19]/10 bg-[#f6cf42] py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-[#181a19]">Professionals of Olympion</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Talent, ready<br />when you are.</h2>
            </div>
            <a href="/marketplace" className="group text-sm font-semibold text-[#181a19]">
              Meet all AI professionals <ArrowRight className="ml-1 inline transition group-hover:translate-x-1" size={16}/>
            </a>
          </div>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#3f3c2d]">
            Every Olympion professional arrives with a defined role, deep domain expertise, and the organizational context to contribute from day one. Hire a Principal Engineer. A Product Manager. A Retail Planner. Your workforce, on demand.
          </p>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map(({ name, count, icon: Icon, color, roles }) => (
              <article className="group border border-[#181a19]/15 bg-[#fffdf7] p-6 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_#181a19]" key={name}>
                <div className={`grid h-12 w-12 place-items-center rounded-none ${color}`}><Icon size={22}/></div>
                <p className="mt-10 text-xs font-semibold uppercase tracking-widest text-[#718077]">{count}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">{name}</h3>
                <ul className="mt-3 space-y-1">
                  {roles.map(r => <li key={r} className="text-sm text-[#66746b]">· {r}</li>)}
                </ul>
                <a href="/marketplace" className="mt-6 flex items-center gap-2 text-sm font-semibold">
                  Explore category <ArrowRight size={15}/>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-8" id="solutions">
        <div className="rounded-[28px] bg-[#143c31] px-7 py-12 text-white sm:px-12 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#b9f365]">How it works</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">From first conversation to first contribution.</h2>
              <p className="mt-6 max-w-md leading-7 text-white/65">
                Hiring an AI employee mirrors how you hire people — because organizations already know how to manage employees. Olympion makes that model possible for AI.
              </p>
              <a href="/marketplace" className="mt-8 inline-flex items-center gap-2 bg-[#b9f365] px-5 py-3 text-sm font-semibold text-[#0d2b20]">
                Browse the marketplace <ArrowRight size={16}/>
              </a>
            </div>
            <div className="grid content-start gap-2">
              {steps.map((step, i) => (
                <div className="group border-b border-white/10 py-4" key={step.label}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <span className="mt-1 text-xs text-white/40">0{i+1}</span>
                      <div>
                        <span className="text-base font-semibold">{step.label}</span>
                        <p className="mt-0.5 text-sm leading-6 text-white/55">{step.desc}</p>
                      </div>
                    </div>
                    <Plus size={16} className="mt-1 shrink-0 text-[#b9f365] transition group-hover:rotate-90"/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Foundation */}
      <section id="foundation" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="border-t border-[#d9e1d9] pt-12">
          <p className="eyebrow">The Olympion foundation</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
            A living operating system beneath every professional you recruit.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-[#66746b]">
            Olympion Workforce OS gives each employee a durable identity, governed knowledge, a record of learning, and the operational guardrails needed to serve your enterprise with confidence.
          </p>
          <div className="mt-10 grid gap-px overflow-hidden border border-[#d9e1d9] sm:grid-cols-2 lg:grid-cols-3">
            {foundation.map(({ label, desc }) => (
              <div className="bg-white p-6" key={label}>
                <h3 className="font-semibold">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-[#66746b]">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/products" className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">
              Explore the platform <ArrowRight size={15}/>
            </a>
            <a href="/pricing" className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">
              View pricing <ArrowRight size={15}/>
            </a>
          </div>
        </div>
      </section>

      {/* Agent vs Employee */}
      <section className="bg-[#143c31] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#b9f365]">The distinction that matters</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">AI Agent vs. AI Employee</h2>
              <p className="mt-5 leading-7 text-white/65">
                Most AI platforms build agents — stateless, short-lived, and designed to execute a single task. Olympion builds employees: professionals with memory, accountability, and a career.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-white/15 p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/45">AI Agent</p>
                <ul className="mt-5 space-y-2 text-sm text-white/65">
                  <li>· Executes tasks on demand</li>
                  <li>· No persistent memory</li>
                  <li>· No professional identity</li>
                  <li>· No performance history</li>
                  <li>· No career progression</li>
                  <li>· Stateless between sessions</li>
                </ul>
              </div>
              <div className="border border-[#b9f365]/40 bg-[#b9f365]/5 p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#b9f365]">Olympion Employee</p>
                <ul className="mt-5 space-y-2 text-sm text-white/80">
                  <li>· Owns a domain of responsibility</li>
                  <li>· Persistent long-term memory</li>
                  <li>· Named professional identity</li>
                  <li>· Monthly performance reviews</li>
                  <li>· Career path: Senior → Principal → Distinguished</li>
                  <li>· Grows with your organization</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-[20px] bg-[#f6cf42] px-8 py-16 text-center sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#5d4900]">Ready to hire?</p>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-[-.045em] sm:text-4xl">Your next great colleague is already trained and ready to meet you.</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/marketplace" className="bg-black px-6 py-3 text-sm font-semibold text-white">Browse professionals <ArrowRight className="ml-1 inline" size={16}/></a>
            <a href="/contact" className="border border-black px-6 py-3 text-sm font-semibold">Talk to Sales</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#102e26] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-12 md:flex-row">
            <div>
              <div className="flex items-center gap-3 text-lg font-semibold">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#b9f365] text-[#143c31]"><Workflow size={20}/></span>Olympion.
              </div>
              <p className="mt-5 max-w-xs text-sm leading-6 text-white/55">The home of enterprise AI professionals.</p>
              <div className="mt-6 flex gap-4 text-sm text-white/45">
                <a href="/marketplace" className="hover:text-white">Marketplace</a>
                <a href="/pricing" className="hover:text-white">Pricing</a>
                <a href="/products" className="hover:text-white">Platform</a>
                <a href="/about" className="hover:text-white">Company</a>
              </div>
            </div>
            <div>
              <p className="text-sm text-white/55">Ready to recruit your next great teammate?</p>
              <a href="/contact" className="mt-3 inline-flex items-center gap-2 text-xl font-medium text-[#b9f365]">
                Let&apos;s talk <ArrowRight size={19}/>
              </a>
              <div className="mt-6 flex items-center gap-2 text-sm text-white/55">
                <MessageSquare size={14}/>
                <span>hello@olympion.ai</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 pt-7 text-xs text-white/40 sm:flex-row">
            <span>© 2026 Olympion Inc.</span>
            <span>Platform · Marketplace · Pricing · Academy · Developer Portal <span className="text-[#b9f365]">(coming soon)</span></span>
          </div>
        </div>
      </footer>
    </main>
  );
}
