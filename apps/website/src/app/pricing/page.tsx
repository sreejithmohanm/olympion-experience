import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  Package,
  Repeat,
  TrendingUp,
  Workflow
} from 'lucide-react';

const pricingModels = [
  {
    icon: Clock,
    name: 'Hourly',
    tagline: 'Pay only for productive AI hours.',
    desc: 'Ideal for project-based or variable workloads. You are billed for the hours your AI employee is actively contributing — not for idle time.',
    useCase: 'Best for: Sprint teams, project surges, on-demand expertise.',
    highlight: false
  },
  {
    icon: Calendar,
    name: 'Daily',
    tagline: 'Dedicated daily engagement.',
    desc: 'A full working day of AI employee time, reserved exclusively for your organization. Consistent capacity, predictable cost.',
    useCase: 'Best for: Teams needing regular but not full-time coverage.',
    highlight: false
  },
  {
    icon: Repeat,
    name: 'Monthly Subscription',
    tagline: 'A committed team member, billed monthly.',
    desc: 'Your AI employee is part of your team for the full month — participating in standups, contributing to backlogs, and operating with full organizational context.',
    useCase:
      'Best for: Engineering teams, product functions, ongoing operations.',
    highlight: true
  },
  {
    icon: Package,
    name: 'Reserved Employee',
    tagline: 'Dedicated AI, exclusive to your organization.',
    desc: 'A reserved AI employee works exclusively for your enterprise — their memory, learning, and context are never shared. Maximum performance, full isolation.',
    useCase:
      'Best for: Regulated industries, sensitive workloads, strategic roles.',
    highlight: false
  },
  {
    icon: Building2,
    name: 'Shared Workforce',
    tagline: 'Access a pool of shared AI professionals.',
    desc: 'Tap into a managed pool of Olympion AI employees on demand. Shared across a curated set of organizations, with governance boundaries maintained.',
    useCase: 'Best for: Lower-volume needs, trials, supplementary coverage.',
    highlight: false
  },
  {
    icon: FileCheck,
    name: 'Outcome-Based',
    tagline: 'Billed per completed task, PR, or document.',
    desc: 'Pay for results. Define the units of value — pull requests merged, documents produced, tickets resolved — and pay when delivery is confirmed.',
    useCase: 'Best for: Well-defined workflows with measurable deliverables.',
    highlight: false
  },
  {
    icon: TrendingUp,
    name: 'Enterprise Contract',
    tagline: 'Annual AI workforce subscription.',
    desc: 'An enterprise-wide agreement covering multiple AI employees, roles, and domains. Includes dedicated support, SLA commitments, compliance documentation, and strategic workforce planning.',
    useCase:
      'Best for: Large organizations building a hybrid AI-human workforce at scale.',
    highlight: false
  }
];

const inclusions = [
  'Onboarding & organizational context loading',
  'Monthly performance reviews and reports',
  'Olympion Workforce OS (all 15 components)',
  'Enterprise tool integrations (GitHub, Jira, Slack, etc.)',
  'Multi-model routing (OpenAI, Anthropic, Gemini)',
  'Audit logs and compliance reporting',
  'Role-based permissions and access controls',
  'Career progression and skill tracking'
];

function Header() {
  return (
    <header className="bg-white">
      <div className="hidden h-[70px] border-b border-black/10 px-7 md:flex md:items-center md:justify-between">
        <p className="text-xs leading-4">
          Need an AI professional?
          <br />
          <strong className="font-medium">hello@olympion.ai</strong>
        </p>
        <Link
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 text-[29px] font-semibold tracking-[-.06em]"
          href="/"
        >
          <span className="grid h-7 w-7 place-items-center rounded-sm bg-[#f6cf42]">
            <Workflow size={16} />
          </span>
          Olympion
        </Link>
        <Link
          href="/contact"
          className="text-xs font-medium underline underline-offset-4"
        >
          Contact us
        </Link>
      </div>
      <nav className="flex h-[62px] items-center justify-center border-b border-black/10 px-6">
        <div className="flex items-center gap-6 text-sm sm:gap-8">
          <Link href="/products">Platform</Link>
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/pricing" className="font-medium">
            Pricing
          </Link>
          <Link href="/about">Company</Link>
          <Link href="/contact" className="flex items-center gap-1">
            Contact <ArrowUpRight size={13} />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f2] text-[#171717]">
      <Header />

      {/* Hero */}
      <section className="product-grid border-b border-black/5">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <p className="text-xs text-black/50">
            Home <span className="px-2">/</span> Pricing
          </p>
          <p className="mt-12 text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">
            Pricing
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-.05em] sm:text-5xl lg:text-6xl">
            Flexible models for every{' '}
            <span className="marker-highlight">workforce strategy.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8">
            Olympion AI employees are priced like the professionals they are.
            Choose the engagement model that fits your team — from outcome-based
            delivery to dedicated enterprise contracts.
          </p>
          <p className="mt-5 max-w-xl leading-7 text-black/60">
            All pricing is discussed directly with our team. We build a
            commercial model around your workforce requirements.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="bg-[#171717] px-5 py-3 text-sm font-semibold text-white"
            >
              Talk to Sales <ArrowRight className="ml-1 inline" size={16} />
            </Link>
            <Link
              href="/marketplace"
              className="border border-black px-5 py-3 text-sm font-semibold"
            >
              Browse professionals
            </Link>
          </div>
        </div>
      </section>

      {/* ROI callout */}
      <section className="border-b border-black/10 bg-[#143c31] text-white">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr_1fr]">
            <div className="lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#b9f365]">
                The ROI case
              </p>
              <p className="mt-4 text-xl leading-8">
                The average fully-loaded cost of a Principal Engineer is{' '}
                <strong className="text-white">
                  $180,000 – $250,000 per year
                </strong>{' '}
                in the United States — before you account for hiring time,
                onboarding, or turnover risk.
              </p>
              <p className="mt-4 leading-7 text-white/65">
                An Olympion AI Principal Engineer contributes from day one,
                scales with demand, generates monthly performance reports, and
                never needs a visa. The productivity-to-cost ratio of a hybrid
                AI workforce is one of the most compelling investments available
                to engineering and operations leaders today.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-5 border-l border-white/10 pl-8">
              <div>
                <p className="text-3xl font-semibold text-[#b9f365]">Days</p>
                <p className="mt-1 text-sm text-white/55">
                  Time to first contribution (vs. weeks for human hiring)
                </p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-[#b9f365]">Zero</p>
                <p className="mt-1 text-sm text-white/55">
                  Headcount approvals, equity grants, or benefits overhead
                </p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-[#b9f365]">Monthly</p>
                <p className="mt-1 text-sm text-white/55">
                  Transparent performance reports with measurable outcomes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing models */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">
          Engagement models
        </p>
        <h2 className="mt-4 text-3xl font-medium tracking-[-.04em] sm:text-4xl">
          Seven ways to build your AI workforce.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {pricingModels
            .slice(0, 6)
            .map(({ icon: Icon, name, tagline, desc, useCase, highlight }) => (
              <article
                key={name}
                className={`border p-6 ${highlight ? 'border-[#143c31] bg-[#143c31] text-white' : 'border-black/10 bg-white'}`}
              >
                <Icon
                  size={20}
                  className={highlight ? 'text-[#b9f365]' : 'text-[#806400]'}
                />
                <h3 className="mt-6 text-lg font-semibold">{name}</h3>
                <p
                  className={`mt-1 text-sm font-medium ${highlight ? 'text-[#b9f365]' : 'text-[#806400]'}`}
                >
                  {tagline}
                </p>
                <p
                  className={`mt-4 text-sm leading-6 ${highlight ? 'text-white/70' : 'text-black/60'}`}
                >
                  {desc}
                </p>
                <p
                  className={`mt-4 text-xs ${highlight ? 'text-white/45' : 'text-black/45'}`}
                >
                  {useCase}
                </p>
                <Link
                  href="/contact"
                  className={`mt-6 inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold ${highlight ? 'bg-[#b9f365] text-[#0d2b20]' : 'bg-[#f6cf42] text-black'}`}
                >
                  Talk to Sales <ArrowRight size={13} />
                </Link>
              </article>
            ))}
        </div>

        {/* Enterprise card — full width */}
        {pricingModels
          .slice(6)
          .map(({ icon: Icon, name, tagline, desc, useCase }) => (
            <div
              key={name}
              className="mt-5 border border-[#f6cf42] bg-[#fffdf0] p-8 sm:p-10"
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex items-center gap-3">
                    <Icon size={22} className="text-[#806400]" />
                    <h3 className="text-xl font-semibold">{name}</h3>
                  </div>
                  <p className="mt-1 text-sm font-medium text-[#806400]">
                    {tagline}
                  </p>
                  <p className="mt-4 max-w-2xl leading-7 text-black/65">
                    {desc}
                  </p>
                  <p className="mt-3 text-xs text-black/45">{useCase}</p>
                </div>
                <div className="flex items-center">
                  <Link
                    href="/contact"
                    className="bg-black px-6 py-3 text-sm font-semibold text-white"
                  >
                    Request a proposal{' '}
                    <ArrowRight className="ml-1 inline" size={15} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
      </section>

      {/* Inclusions */}
      <section className="border-t border-black/10 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">
            Included with every engagement
          </p>
          <h2 className="mt-4 text-2xl font-medium tracking-[-.04em]">
            Everything you need to deploy confidently.
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {inclusions.map((item) => (
              <div className="flex items-start gap-3" key={item}>
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-[#4d815b]"
                />
                <p className="text-sm leading-6">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics section */}
      <section className="bg-[#f7f8f6]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <BarChart3 size={24} className="text-[#4d815b]" />
              <h2 className="mt-5 text-2xl font-medium tracking-[-.04em]">
                Full visibility into every dollar spent.
              </h2>
              <p className="mt-4 leading-7 text-black/60">
                Every Olympion engagement includes real-time usage metering and
                monthly performance reports. You always know what your AI
                employees are working on, what they&apos;ve produced, and what
                value they&apos;ve delivered.
              </p>
              <p className="mt-4 leading-7 text-black/60">
                Performance reviews surface metrics by role: PRs merged,
                documents completed, tickets resolved, customer interactions
                handled. No black boxes.
              </p>
            </div>
            <div className="border border-black/10 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-black/45">
                Example monthly report
              </p>
              <h3 className="mt-4 text-lg font-medium">
                AI Principal Engineer · Q2 2026
              </h3>
              <div className="mt-6 space-y-3">
                {[
                  ['Pull requests merged', '47'],
                  ['Code review hours', '38 hrs'],
                  ['Architecture decisions documented', '12'],
                  ['Incidents resolved', '6'],
                  ['Team collaborations', '23 sessions'],
                  ['Performance rating', 'Exceeds expectations']
                ].map(([label, value]) => (
                  <div
                    className="flex items-center justify-between border-b border-black/5 pb-3"
                    key={label}
                  >
                    <span className="text-sm text-black/60">{label}</span>
                    <span className="text-sm font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-black/10 bg-[#f6cf42]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#5d4900]">
            Get started
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-medium tracking-[-.045em] sm:text-4xl">
            Ready to discuss your AI workforce strategy?
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-black/70">
            Our team will help you identify the right professionals, the right
            engagement model, and the commercial terms that work for your
            organization.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              Talk to Sales
            </Link>
            <Link
              href="/marketplace"
              className="border border-black px-5 py-3 text-sm font-semibold"
            >
              Browse professionals
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#171717] text-white">
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-3 px-6 py-8 text-xs text-white/45 sm:flex-row">
          <span>© 2026 Olympion Inc.</span>
          <span>
            Platform · Marketplace · Pricing · Academy · Developer Portal
          </span>
        </div>
      </footer>
    </main>
  );
}
