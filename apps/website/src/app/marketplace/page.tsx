import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BarChart3, BookOpen, BriefcaseBusiness,
  CircuitBoard, GitBranch, Globe2, Headphones, Package, TrendingUp,
  Users, Workflow,
} from "lucide-react";

type Employee = {
  name: string;
  seniority: string;
  skills: string[];
  available: boolean;
};

type Category = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  accent: string;
  employees: Employee[];
};

const categories: Category[] = [
  {
    id: "engineering",
    label: "Engineering",
    icon: CircuitBoard,
    color: "bg-[#e8f0e8]",
    accent: "text-[#3b764a]",
    employees: [
      { name: "Principal Engineer", seniority: "Distinguished", skills: ["System Design", "Architecture Review", "Engineering Leadership"], available: true },
      { name: "Senior Full Stack Developer", seniority: "Senior", skills: ["React", "Node.js", "TypeScript", "REST APIs"], available: true },
      { name: "AI Architect", seniority: "Principal", skills: ["LLM Integration", "MLOps", "AI System Design"], available: false },
      { name: "DevOps Engineer", seniority: "Staff", skills: ["Kubernetes", "CI/CD", "Infrastructure as Code"], available: true },
      { name: "QA Engineer", seniority: "Senior", skills: ["Test Automation", "Performance Testing", "Quality Frameworks"], available: true },
    ],
  },
  {
    id: "business",
    label: "Business",
    icon: BriefcaseBusiness,
    color: "bg-[#cdd7ee]",
    accent: "text-[#405178]",
    employees: [
      { name: "Product Manager", seniority: "Principal", skills: ["Roadmap Planning", "Stakeholder Management", "PRD Writing"], available: true },
      { name: "Business Analyst", seniority: "Senior", skills: ["Requirements Analysis", "Process Mapping", "Data Analysis"], available: true },
      { name: "Scrum Master", seniority: "Staff", skills: ["Agile Facilitation", "Sprint Planning", "Team Coaching"], available: false },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    icon: Globe2,
    color: "bg-[#ede9f5]",
    accent: "text-[#5b3f8c]",
    employees: [
      { name: "Support Engineer", seniority: "Senior", skills: ["Incident Management", "Customer Escalations", "Root Cause Analysis"], available: true },
      { name: "Customer Success Engineer", seniority: "Staff", skills: ["Onboarding", "Health Monitoring", "Expansion Planning"], available: true },
      { name: "Documentation Engineer", seniority: "Senior", skills: ["Technical Writing", "API Documentation", "Knowledge Management"], available: true },
    ],
  },
  {
    id: "retail",
    label: "Retail",
    icon: Package,
    color: "bg-[#fce8d5]",
    accent: "text-[#8c4a1a]",
    employees: [
      { name: "Retail Planner", seniority: "Principal", skills: ["Demand Forecasting", "Assortment Planning", "Margin Optimization"], available: true },
      { name: "Inventory Planner", seniority: "Senior", skills: ["Stock Optimization", "Replenishment", "Supplier Coordination"], available: false },
      { name: "Supply Chain Planner", seniority: "Staff", skills: ["Logistics Planning", "Vendor Management", "Cost Reduction"], available: true },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: TrendingUp,
    color: "bg-[#d5ece0]",
    accent: "text-[#1a6640]",
    employees: [
      { name: "Financial Analyst", seniority: "Senior", skills: ["Financial Modeling", "Forecasting", "Variance Analysis"], available: true },
      { name: "FP&A Specialist", seniority: "Staff", skills: ["Budgeting", "Executive Reporting", "Scenario Planning"], available: true },
      { name: "Risk Analyst", seniority: "Senior", skills: ["Risk Assessment", "Compliance", "Portfolio Analysis"], available: false },
    ],
  },
  {
    id: "hr",
    label: "Human Resources",
    icon: Users,
    color: "bg-[#fde8e8]",
    accent: "text-[#8c1a1a]",
    employees: [
      { name: "Recruiter", seniority: "Senior", skills: ["Talent Sourcing", "Candidate Assessment", "Pipeline Management"], available: true },
      { name: "Learning Coach", seniority: "Staff", skills: ["Learning Path Design", "Skills Assessment", "Development Planning"], available: true },
      { name: "HR Business Partner", seniority: "Principal", skills: ["Workforce Planning", "Org Design", "Culture Programs"], available: false },
    ],
  },
];

const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  engineering: CircuitBoard,
  business: BriefcaseBusiness,
  operations: Globe2,
  retail: Package,
  finance: TrendingUp,
  hr: Users,
};

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
          <Link href="/products">Platform</Link>
          <Link href="/marketplace" className="font-medium">Marketplace</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/about">Company</Link>
          <Link href="/contact" className="flex items-center gap-1">Contact <ArrowUpRight size={13}/></Link>
        </div>
      </nav>
    </header>
  );
}

function EmployeeCard({ employee, color, accent }: { employee: Employee; color: string; accent: string }) {
  return (
    <article className="flex flex-col border border-black/10 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <span className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${color} ${accent}`}>
            {employee.seniority}
          </span>
          <h3 className="mt-2 text-base font-semibold leading-tight">{employee.name}</h3>
        </div>
        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${employee.available ? "bg-[#4d815b]" : "bg-black/20"}`} title={employee.available ? "Available" : "In Deployment"}/>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {employee.skills.map(skill => (
          <span className="border border-black/10 px-2 py-0.5 text-[11px] text-black/60" key={skill}>{skill}</span>
        ))}
      </div>
      <div className="mt-5 flex gap-2 border-t border-black/10 pt-4">
        <Link href="/contact" className="flex-1 bg-[#f6cf42] px-3 py-2 text-center text-xs font-semibold">
          Request Interview
        </Link>
        <Link href="/contact" className="flex-1 border border-black/15 px-3 py-2 text-center text-xs font-medium">
          View Profile
        </Link>
      </div>
    </article>
  );
}

export default function MarketplacePage() {
  return (
    <main className="min-h-screen bg-[#f5f5f2] text-[#171717]">
      <Header />

      {/* Hero */}
      <section className="product-grid border-b border-black/5">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <p className="text-xs text-black/50">Home <span className="px-2">/</span> Marketplace</p>
          <p className="mt-12 text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">Olympion Marketplace</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-.05em] sm:text-5xl lg:text-6xl">
            Browse professionals.<br /><span className="marker-highlight">Interview before you hire.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8">
            Every AI professional in the Olympion marketplace has a defined role, a deep skill profile, and a record of capability. Review candidates, run a live evaluation, and hire with confidence.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-black/60">
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#4d815b]"/> Available now</span>
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-black/20"/> In Deployment</span>
          </div>
        </div>
      </section>

      {/* Category navigation */}
      <div className="sticky top-0 z-10 border-b border-black/10 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-6 py-2">
          {categories.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex shrink-0 items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-medium text-black/60 hover:bg-[#f0f0ec] hover:text-black"
            >
              <Icon size={13}/>
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Employee grid by category */}
      {categories.map(({ id, label, icon: Icon, color, accent, employees }) => (
        <section key={id} id={id} className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-8 flex items-center justify-between border-b border-black/10 pb-6">
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center ${color} ${accent}`}>
                <Icon size={18}/>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-black/45">{employees.length} professionals</p>
                <h2 className="text-xl font-semibold">{label}</h2>
              </div>
            </div>
            <Link href="/contact" className="hidden text-xs font-medium underline underline-offset-2 sm:block">
              Request custom role <ArrowRight className="ml-1 inline" size={12}/>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {employees.map(employee => (
              <EmployeeCard key={employee.name} employee={employee} color={color} accent={accent}/>
            ))}
          </div>
        </section>
      ))}

      {/* How the hiring process works */}
      <section className="border-t border-black/10 bg-[#171717] text-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#f6cf42]">The hiring process</p>
          <h2 className="mt-4 text-3xl font-medium tracking-[-.04em]">From browsing to contributing in days.</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", icon: BarChart3, label: "Browse", desc: "Filter by domain, role, and seniority. Review skills and availability." },
              { n: "02", icon: GitBranch, label: "Interview", desc: "Run a live evaluation scenario. Test reasoning, domain knowledge, and work style." },
              { n: "03", icon: BookOpen, label: "Hire", desc: "Issue a digital offer letter. The employee is formally onboarded to your organization." },
              { n: "04", icon: Headphones, label: "Collaborate", desc: "Your AI employee begins contributing through your tools on day one." },
            ].map(({ n, icon: Icon, label, desc }) => (
              <div key={label} className="border-l border-white/10 pl-5">
                <span className="text-xs text-white/35">{n}</span>
                <Icon size={18} className="mt-3 text-[#f6cf42]"/>
                <h3 className="mt-3 font-semibold">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-black/10 bg-[#f6cf42]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#5d4900]">Don&apos;t see what you need?</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-medium tracking-[-.045em] sm:text-4xl">
            We build custom AI professionals for specialized roles.
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-black/70">
            If your workforce requirements fall outside our current catalogue — a highly specialized domain expert, a bespoke operational role, or an organization-specific function — our team will design and train the right professional for you.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/contact" className="bg-black px-5 py-3 text-sm font-semibold text-white">
              Request a custom professional <ArrowRight className="ml-1 inline" size={15}/>
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
