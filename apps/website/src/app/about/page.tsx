import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Workflow } from 'lucide-react';

const values = [
  [
    'Trust',
    'Enterprise AI must be secure, transparent, and reliable.',
    'Every AI employee operates within governed boundaries. Permissions are explicit, audit trails are complete, and no action is taken without appropriate authorization. Enterprises can inspect, restrict, and override at any time.'
  ],
  [
    'Learning',
    'Every AI professional continuously evolves through approved experience.',
    'Growth is structured, not accidental. Olympion employees learn from approved interactions, validated outcomes, and organizational feedback — building expertise that compounds over time.'
  ],
  [
    'Collaboration',
    'Humans and AI are stronger together.',
    'AI employees are designed to augment human judgment, not replace it. Every professional understands their boundaries, escalates when uncertain, and operates as a trusted colleague — not an autonomous system.'
  ],
  [
    'Innovation',
    'We push the boundaries of what enterprise software can become.',
    'The idea that knowledge work can be performed by AI professionals — professionals with identity, memory, and career paths — is a new category. Olympion exists to prove it and build it.'
  ],
  [
    'Responsibility',
    'AI should augment human capability — not replace human creativity.',
    'We are building something that will shape how organizations work for decades. We take that seriously. Our employees are designed to make humans more capable, not to make humans unnecessary.'
  ]
];

const openRoles = [
  'Chief Technology Officer',
  'Chief AI Officer',
  'Chief Product Officer',
  'Chief Revenue Officer',
  'Advisory Board'
];

const employeeExamples = [
  'AI Principal Engineer',
  'AI Product Manager',
  'AI Architect',
  'AI Retail Planner',
  'AI Business Analyst',
  'AI Support Engineer'
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
          <Link href="/pricing">Pricing</Link>
          <Link href="/about" className="font-medium">
            Company
          </Link>
          <Link href="/contact" className="flex items-center gap-1">
            Contact <ArrowUpRight size={13} />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f2] text-[#171717]">
      <Header />

      {/* Hero */}
      <section className="about-grid border-b border-black/5">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <p className="text-xs text-black/50">
            Home <span className="px-2">/</span> About Olympion
          </p>
          <p className="mt-12 text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">
            About Olympion
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-medium leading-[1.08] tracking-[-.05em] sm:text-5xl lg:text-6xl">
            We don&apos;t build software.
            <br />
            <span className="marker-highlight">We train professionals.</span>
          </h1>
          <p className="mt-9 max-w-2xl text-lg leading-8">
            Olympion was founded on a conviction: the world&apos;s best
            organizations should be able to hire AI colleagues the same way they
            hire people — through a structured process, with accountability, and
            with the expectation that those colleagues will grow.
          </p>
          <p className="mt-5 max-w-2xl leading-7 text-black/60">
            That means not selling software licenses. It means creating
            professionals: AI employees with identity, memory, measurable
            performance, and a career path inside your organization.
          </p>
        </div>
      </section>

      {/* Origin / Brand */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">
              Why Olympion?
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-.04em] sm:text-4xl">
              A home for extraordinary intelligence.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-7 text-black/70">
            <p>
              Inspired by Mount Olympus — home of the ancient world&apos;s
              greatest minds — Olympion is the birthplace of enterprise AI
              professionals. Every employee begins their journey here. They
              learn. They develop expertise. They prove their capability. Only
              then do they join your organization.
            </p>
            <p>
              Unlike AI agents that are deployed and discarded, Olympion
              professionals are nurtured. Each one carries a professional
              identity, a domain of expertise, and an evolving record of work.
              When they join your team, they arrive prepared — not as a blank
              slate.
            </p>
            <blockquote className="border-l-2 border-[#f6cf42] pl-5 text-xl font-medium leading-8 text-black">
              Organizations don&apos;t buy software. They hire professionals.
            </blockquote>
            <p>That&apos;s the shift Olympion makes possible.</p>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-5xl gap-px px-6 py-0 md:grid-cols-2">
          <div className="border-b border-black/10 py-14 md:border-b-0 md:border-r md:pr-14">
            <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">
              Our mission
            </p>
            <h2 className="mt-5 text-3xl font-medium tracking-[-.04em]">
              Enable every enterprise to build a hybrid workforce of human and
              AI employees.
            </h2>
            <p className="mt-5 leading-7 text-black/60">
              Every organization — regardless of size or sector — should be able
              to access and deploy AI professionals with the same confidence
              they bring to hiring human employees: clear roles, defined
              responsibilities, governed permissions, and measurable outcomes.
            </p>
          </div>
          <div className="py-14 md:pl-14">
            <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">
              Our vision
            </p>
            <h2 className="mt-5 text-3xl font-medium tracking-[-.04em]">
              Become the world&apos;s largest marketplace for enterprise AI
              professionals.
            </h2>
            <p className="mt-5 leading-7 text-black/60">
              In the same way that cloud computing became a default
              infrastructure choice, AI professionals will become a default
              workforce choice. Olympion will be the platform where those
              professionals are created, certified, deployed, and continuously
              developed.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">
          Our values
        </p>
        <h2 className="mt-4 text-3xl font-medium tracking-[-.04em] sm:text-4xl">
          The principles behind every professional.
        </h2>
        <div className="mt-10 grid border-l border-t border-black/10 sm:grid-cols-2">
          {values.map(([title, subtitle, text], i) => (
            <article
              className="border-b border-r border-black/10 p-7"
              key={title}
            >
              <span className="text-sm text-[#806400]">0{i + 1}</span>
              <h3 className="mt-6 text-xl font-medium">{title}</h3>
              <p className="mt-1 text-sm font-medium text-black/55">
                {subtitle}
              </p>
              <p className="mt-3 text-sm leading-6 text-black/60">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="bg-[#171717] text-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#f6cf42]">
                Our story
              </p>
              <h2 className="mt-4 text-3xl font-medium tracking-[-.04em] sm:text-4xl">
                Agents weren&apos;t enough. We needed employees.
              </h2>
            </div>
            <div>
              <p className="text-lg leading-8 text-white/75">
                The first wave of AI brought agents — tools that execute
                specific tasks on command. They&apos;re useful. But they
                don&apos;t remember your organization. They don&apos;t hold
                accountability. They can&apos;t grow.
              </p>
              <p className="mt-5 leading-7 text-white/60">
                Olympion was built to answer a different question: what if an
                organization could hire an AI Principal Engineer who truly knows
                the codebase, remembers past decisions, contributes to team
                planning, and improves every month? What if that same model
                applied to Product Managers, Retail Planners, and Financial
                Analysts?
              </p>
              <p className="mt-5 leading-7 text-white/60">
                That&apos;s a workforce — not a toolkit. And workforce
                management is something every enterprise already knows how to
                do.
              </p>
              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                {employeeExamples.map((role) => (
                  <div
                    className="border border-white/15 px-4 py-3 text-sm"
                    key={role}
                  >
                    {role}
                  </div>
                ))}
              </div>
              <p className="mt-7 text-lg font-medium text-[#f6cf42]">
                Olympion makes this workforce a reality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">
              Leadership
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-.04em] sm:text-4xl">
              Built for the next era of work.
            </h2>
          </div>
          <div>
            <div className="border border-black/10 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[.17em] text-black/45">
                Founder
              </p>
              <h3 className="mt-3 text-2xl font-medium">
                Sreejith Mohan Menon
              </h3>
              <p className="mt-1 text-sm text-black/55">
                Enterprise Architect · 20+ Years in Technology
              </p>
              <p className="mt-5 text-sm leading-6 text-black/65">
                Sreejith spent two decades designing enterprise technology
                systems at scale — across cloud platforms, retail systems, and
                AI infrastructure. He saw firsthand that enterprises were
                spending millions on tools, but what they actually needed was
                talent.
              </p>
              <blockquote className="mt-5 border-l-2 border-[#f6cf42] pl-4 text-sm italic leading-6 text-black/60">
                &ldquo;Every organization I worked with had the same problem:
                they could buy software, but they couldn&apos;t buy expertise.
                Olympion is my answer to that problem.&rdquo;
              </blockquote>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  '20+ years',
                  'Enterprise systems',
                  'Cloud architecture',
                  'Artificial Intelligence',
                  'Retail Technology',
                  'Enterprise Architecture'
                ].map((tag) => (
                  <span
                    className="border border-black/10 px-2.5 py-1 text-xs"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-9 text-xs font-semibold uppercase tracking-[.17em] text-black/45">
              Future leadership positions
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {openRoles.map((role) => (
                <div
                  className="flex items-center justify-between border-b border-black/10 py-3 text-sm"
                  key={role}
                >
                  {role}
                  <Link
                    href="/contact"
                    className="text-xs text-[#806400] underline underline-offset-2"
                  >
                    Apply
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-black/10 bg-[#f6cf42]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#5d4900]">
            Join us
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-.05em] sm:text-5xl">
            Help shape the next era of work.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/70">
            Whether you&apos;re an enterprise customer, technology partner,
            investor, or future employee, we invite you to help build the
            operating system for the future workforce.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              Talk to Sales
            </Link>
            <Link
              href="/contact"
              className="border border-black px-5 py-3 text-sm font-semibold"
            >
              Partner with Olympion
            </Link>
            <Link
              href="/contact"
              className="border border-black px-5 py-3 text-sm font-semibold"
            >
              Careers
            </Link>
            <Link
              href="/contact"
              className="border border-black px-5 py-3 text-sm font-semibold"
            >
              Investors
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
