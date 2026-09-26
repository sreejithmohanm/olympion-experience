import Link from "next/link";
import {
  Activity, ArrowRight, ArrowUpRight, BarChart3, BrainCircuit,
  Database, Eye, Fingerprint, GitBranch, GraduationCap, KeyRound,
  LockKeyhole, Network, Scale, Settings2, ShieldCheck, Shuffle,
  Users, WalletCards, Workflow, Zap,
} from "lucide-react";

const osCapabilities = [
  { Icon: Fingerprint, label: "Identity & Access", desc: "Each AI employee has a unique, verifiable professional identity with role-scoped permissions and authentication." },
  { Icon: Users, label: "Employee Registry", desc: "A central directory of every AI professional — their role, history, current deployment, and organizational assignments." },
  { Icon: BrainCircuit, label: "Skills Engine", desc: "Dynamic skill profiles updated continuously as employees complete work and earn validated competencies." },
  { Icon: Database, label: "Memory Engine", desc: "Long-term contextual memory stores organizational knowledge, past decisions, and institutional context per employee." },
  { Icon: GraduationCap, label: "Learning Engine", desc: "Structured learning from approved interactions, performance feedback, and domain-specific training data." },
  { Icon: GitBranch, label: "Knowledge Graph", desc: "A living, queryable map of organizational knowledge: products, teams, processes, systems, and their relationships." },
  { Icon: Network, label: "Tool Connector Framework", desc: "Pre-built integrations with GitHub, Jira, Confluence, Slack, SAP, Kubernetes, and enterprise data systems." },
  { Icon: WalletCards, label: "Billing Engine", desc: "Flexible billing across seven models: hourly, daily, monthly, reserved, shared, outcome-based, and enterprise contract." },
  { Icon: BarChart3, label: "Usage Metering", desc: "Granular activity tracking measures productive hours, task completions, and contribution quality per employee." },
  { Icon: ShieldCheck, label: "Audit & Compliance", desc: "Immutable audit logs, role-based controls, and compliance frameworks built in — not bolted on." },
  { Icon: Settings2, label: "Prompt & Policy Management", desc: "Centralized management of behavioral policies, safety rules, and communication guidelines for every employee." },
  { Icon: Shuffle, label: "Multi-Model Router", desc: "Dynamic routing across foundation models — OpenAI, Anthropic, Gemini, and local enterprise models — by task type." },
  { Icon: Zap, label: "Agent Orchestrator", desc: "Coordinates multi-step workflows, delegates sub-tasks, and manages collaboration between multiple AI employees." },
  { Icon: Eye, label: "Observability Platform", desc: "Real-time dashboards, performance analytics, and alerting for every employee activity across your organization." },
  { Icon: Scale, label: "Workforce OS Core", desc: "The unified runtime that ties every capability together, ensuring consistent, governed behavior across your AI workforce." },
];

const employeeTraits = [
  { label: "Identity", desc: "Each AI employee has a unique professional identity — a name, a role, a domain of expertise, and a verifiable record of credentials." },
  { label: "Experience", desc: "A structured history of past work, completed tasks, tools used, and decisions supported — portable across deployments." },
  { label: "Responsibilities", desc: "Clearly defined scope: what the employee owns, what escalates to a human, and what falls outside their remit." },
  { label: "Skills", desc: "A dynamic, validated skill profile updated through approved work — not self-reported, but earned." },
  { label: "Working Memory", desc: "Active context held during a work session: current tasks, open threads, recent conversations, and pending decisions." },
  { label: "Company Knowledge", desc: "Deep understanding of your organization's products, systems, codebase, customers, and team structures." },
  { label: "Performance Metrics", desc: "Monthly performance reports: PRs merged, documents produced, tickets resolved, decisions supported." },
  { label: "Learning History", desc: "A timestamped record of every learning milestone, feedback cycle, and capability improvement." },
  { label: "Permissions", desc: "Explicit, role-scoped access controls governing what systems, data, and actions each employee can access." },
  { label: "Career Progression", desc: "A defined career path: from Senior to Staff to Principal to Distinguished — with promotion milestones and review criteria." },
];

const connectors = [
  { label: "GitHub", category: "Engineering" },
  { label: "Jira", category: "Project Management" },
  { label: "Confluence", category: "Knowledge Base" },
  { label: "Slack", category: "Communication" },
  { label: "SAP", category: "ERP" },
  { label: "Kubernetes", category: "Infrastructure" },
  { label: "VS Code / IDE", category: "Development" },
  { label: "Salesforce", category: "CRM" },
];

const models = ["OpenAI GPT-4o", "Anthropic Claude", "Google Gemini", "Local Enterprise Models"];

const lifecycle = [
  { step: "01", label: "Hire", desc: "Browse the Olympion marketplace, interview your candidate, and issue a digital offer letter — just like hiring a person." },
  { step: "02", label: "Onboard", desc: "Your AI employee learns your systems, tools, team structures, and organizational policies during a structured onboarding period." },
  { step: "03", label: "Work", desc: "Your employee operates across connected tools — Slack, GitHub, Jira — contributing to real work with full audit visibility." },
  { step: "04", label: "Review", desc: "Monthly performance reviews surface measurable outcomes: tasks completed, quality metrics, and contribution to team goals." },
  { step: "05", label: "Promote", desc: "Exceptional performance unlocks career progression. Employees advance from Senior through Principal to Distinguished levels." },
  { step: "06", label: "Retire", desc: "When a role ends, the employee is formally archived. Their knowledge, history, and contributions remain accessible to your organization." },
];

function Header() {
  return (
    <header className="bg-white">
      <div className="hidden h-[70px] border-b border-black/10 px-7 md:flex md:items-center md:justify-between">
        <p className="text-xs leading-4">Need an AI professional?<br /><strong className="font-medium">hello@olympion.ai</strong></p>
        <Link className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 text-[29px] font-semibold tracking-[-.06em]" href="/">
          <span className="grid h-7 w-7 place-items-center rounded-sm bg-[#f6cf42]"><Workflow size={16}/></span>Olympion
        </Link>
        <Link href="/contact" className="text-xs font-medium underline underline-offset-4">Contact us</Link>
      </div>
      <nav className="flex h-[62px] items-center justify-center border-b border-black/10 px-6">
        <div className="flex items-center gap-6 text-sm sm:gap-8">
          <Link href="/products" className="font-medium">Platform</Link>
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/about">Company</Link>
          <Link href="/contact" className="flex items-center gap-1">Contact <ArrowUpRight size={13}/></Link>
        </div>
      </nav>
    </header>
  );
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f2] text-[#171717]">
      <Header />

      {/* Hero */}
      <section className="product-grid border-b border-black/5">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <p className="text-xs text-black/50">Home <span className="px-2">/</span> Platform</p>
          <p className="mt-12 text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">Olympion Workforce OS</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-.05em] sm:text-5xl lg:text-6xl">
            The operating system for your <span className="marker-highlight">AI workforce.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8">
            Olympion is not a collection of AI tools. It is a complete workforce operating system — built to create, deploy, govern, and continuously develop AI professionals across every function of your enterprise.
          </p>
          <p className="mt-5 max-w-2xl leading-7 text-black/60">
            Every AI employee is powered by fifteen purpose-built OS components: from identity and memory to billing, audit, and career progression. It&apos;s the infrastructure that makes AI professionals — not AI agents — possible.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/contact" className="bg-[#171717] px-5 py-3 text-sm font-semibold text-white">
              Schedule a demo <ArrowRight className="ml-1 inline" size={16}/>
            </Link>
            <Link href="/marketplace" className="border border-black px-5 py-3 text-sm font-semibold">
              Browse professionals
            </Link>
          </div>
        </div>
      </section>

      {/* OS Capabilities */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">Workforce OS</p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-.04em] sm:text-4xl">
              15 components. One cohesive workforce.
            </h2>
            <p className="mt-4 leading-7 text-black/60">
              Rather than assembling a collection of standalone tools, Olympion provides a unified operating system where every component works in concert — giving each AI employee the structure, context, and capability to function as a true professional.
            </p>
          </div>
          <div className="grid grid-cols-1 border-l border-t border-black/10 sm:grid-cols-2">
            {osCapabilities.map(({ Icon, label, desc }) => (
              <div className="flex flex-col border-b border-r border-black/10 bg-white p-5" key={label}>
                <Icon size={18} className="text-[#806400]"/>
                <h3 className="mt-3 text-sm font-semibold">{label}</h3>
                <p className="mt-1 text-xs leading-5 text-black/55">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Employee Traits */}
      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-5xl gap-0 px-6 py-0 lg:grid-cols-2">
          <div className="flex min-h-96 flex-col justify-end bg-[#171717] p-8 text-white sm:p-10">
            <Activity size={25} className="text-[#f6cf42]"/>
            <p className="mt-16 text-xs font-semibold uppercase tracking-[.17em] text-[#f6cf42]">AI Professionals</p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-.04em] sm:text-4xl">
              More than software.<br />A professional member of your team.
            </h2>
            <p className="mt-5 max-w-md leading-7 text-white/65">
              Every Olympion employee arrives with ten foundational attributes — the same attributes that define any skilled professional. They don&apos;t just execute tasks. They own a domain and grow within it.
            </p>
          </div>
          <div className="grid content-start">
            {employeeTraits.map(({ label, desc }, index) => (
              <div className="border-b border-r border-black/10 p-5" key={label}>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center bg-[#f6cf42] text-[10px] font-semibold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-black/55">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Employee Lifecycle */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">Employee lifecycle</p>
        <h2 className="mt-4 text-3xl font-medium tracking-[-.04em] sm:text-4xl">
          From offer letter to career archive.
        </h2>
        <p className="mt-4 max-w-2xl leading-7 text-black/60">
          Managing AI employees follows the same lifecycle enterprises use for human employees — because that&apos;s the model organizations already know how to operate.
        </p>
        <div className="mt-10 grid gap-px bg-black/10 border border-black/10 sm:grid-cols-2 lg:grid-cols-3">
          {lifecycle.map(({ step, label, desc }) => (
            <div className="bg-white p-6" key={label}>
              <span className="text-2xl font-semibold tracking-tight text-[#f6cf42]">{step}</span>
              <h3 className="mt-3 text-lg font-semibold">{label}</h3>
              <p className="mt-2 text-sm leading-6 text-black/60">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise Connectors */}
      <section className="border-t border-black/10 bg-[#171717] text-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#f6cf42]">Integrations</p>
              <h2 className="mt-4 text-3xl font-medium tracking-[-.04em] sm:text-4xl">
                Works where your team works.
              </h2>
              <p className="mt-4 leading-7 text-white/60">
                Olympion AI employees operate natively within your existing tools — no new workflows, no context-switching. They connect, contribute, and communicate through the systems your teams already rely on.
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/45">Enterprise connectors</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {connectors.map(({ label, category }) => (
                    <div className="border border-white/10 p-3" key={label}>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="mt-1 text-xs text-white/40">{category}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/45">Foundation models</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {models.map(m => (
                    <span className="border border-white/15 px-3 py-1.5 text-sm" key={m}>{m}</span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-white/40">Olympion routes tasks to the optimal model based on capability, cost, and governance policy.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="border border-black/10 bg-[#f6cf42] p-8 sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#5f4b00]">Start building</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-medium tracking-[-.04em] sm:text-4xl">
            Your future workforce is ready to meet you.
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-black/70">
            Tell us what you need to accomplish. We&apos;ll help you identify the AI professionals who can make it happen — from Principal Engineers to Retail Planners to Financial Analysts.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 bg-black px-5 py-3 text-sm font-semibold text-white">
              Talk to Olympion <ArrowRight size={16}/>
            </Link>
            <Link href="/pricing" className="border border-black px-5 py-3 text-sm font-semibold">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#171717] text-white">
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-3 px-6 py-8 text-xs text-white/45 sm:flex-row">
          <span>© 2026 Olympion Inc.</span>
          <span>Platform · Marketplace · Pricing · Academy · Developer Portal</span>
        </div>
      </footer>
    </main>
  );
}
