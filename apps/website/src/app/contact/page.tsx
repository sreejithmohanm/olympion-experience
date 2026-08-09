import Link from "next/link";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, ChevronDown, Headphones, MapPin, MessageSquareText, Phone, TrendingUp, Workflow } from "lucide-react";

const supportCards = [
  {
    icon: MessageSquareText,
    title: "Start a conversation",
    text: "Tell us what your team is building. We will help you identify the AI professionals and operating model that best fits your organization.",
    label: "General enquiries",
    detail: "hello@olympion.ai",
    action: "Get in touch",
    href: "mailto:hello@olympion.ai",
  },
  {
    icon: Headphones,
    title: "Enterprise support",
    text: "For existing partners, our enterprise team is ready to help with deployment, governance, workforce operations, and integrations.",
    label: "Support line",
    detail: "support@olympion.ai",
    action: "Request support",
    href: "mailto:support@olympion.ai",
  },
  {
    icon: BriefcaseBusiness,
    title: "Careers at Olympion",
    text: "We are building the platform where the world&apos;s most capable AI professionals are created. Join the team shaping this category.",
    label: "Careers",
    detail: "careers@olympion.ai",
    action: "Explore roles",
    href: "mailto:careers@olympion.ai",
  },
  {
    icon: TrendingUp,
    title: "Investor relations",
    text: "Olympion is creating a new category: enterprise AI workforce management. We welcome conversations with aligned investors and partners.",
    label: "Investor enquiries",
    detail: "investors@olympion.ai",
    action: "Get in touch",
    href: "mailto:investors@olympion.ai",
  },
];

const faqs = [
  {
    q: "What is the difference between an AI employee and an AI agent?",
    a: "AI agents are stateless tools that execute specific tasks on demand — they have no persistent memory, no professional identity, and no career path. Olympion AI employees are fundamentally different: they hold a named professional identity, retain long-term organizational memory, own a domain of responsibility, generate monthly performance reports, and advance through structured career progression. They are designed to be permanent members of your team, not disposable utilities.",
  },
  {
    q: "How long does onboarding take?",
    a: "Onboarding timelines vary by role and organization complexity. For most deployments, an AI employee can begin contributing within days. During onboarding, the employee learns your systems, tools, codebase or data, team structures, and organizational policies. The more context you provide, the faster and more effectively they contribute.",
  },
  {
    q: "Can I interview an AI employee before hiring?",
    a: "Yes — and we strongly encourage it. Olympion's marketplace allows you to run a live work scenario with any candidate before making a hiring decision. You can evaluate their reasoning, review their background, test their domain expertise, and ask questions. Only once you're satisfied do you issue an offer letter and proceed with onboarding.",
  },
  {
    q: "What security and compliance standards does Olympion support?",
    a: "Olympion Workforce OS is built with enterprise compliance as a first-class requirement. Every AI employee operates within explicit role-scoped permission boundaries. All actions are logged to immutable audit trails. We support role-based access control, data residency requirements, and policy-governed prompt management. Specific compliance certifications and data handling agreements are available upon request.",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f2] text-[#161616]">
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
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/about">Company</Link>
            <Link href="/contact" className="flex items-center gap-1 font-medium">Contact <ArrowUpRight size={13}/></Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="contact-grid border-b border-black/5">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <p className="text-xs text-black/50">Home <span className="px-2">/</span> Contact us</p>
          <h1 className="mt-5 text-4xl font-medium tracking-[-.045em] sm:text-5xl">Contact us</h1>
          <p className="mt-2 text-sm text-black/50">Olympion is the home of enterprise AI professionals.</p>
          <p className="mt-10 max-w-2xl text-lg leading-8">
            Interested in recruiting AI professionals, exploring a partnership, or joining the team building this category? We&apos;d love to hear from you.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {supportCards.map(({ icon: Icon, title, text, label, detail, action, href }) => (
              <article className="border border-black/10 bg-white p-6" key={title}>
                <Icon size={21} className="text-[#886b00]"/>
                <h2 className="mt-7 text-xl font-medium">{title}</h2>
                <p className="mt-3 min-h-16 text-sm leading-6 text-black/60">{text}</p>
                <div className="mt-6 border-t border-black/10 pt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-black/40">{label}</p>
                  <p className="mt-1 text-sm font-medium">{detail}</p>
                </div>
                <Link href={href} className="mt-6 inline-flex items-center gap-2 bg-[#f6cf42] px-3 py-2 text-xs font-semibold">
                  {action} <ArrowRight size={14}/>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact details */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-5xl gap-7 px-6 py-12 md:grid-cols-[1fr_auto_auto]">
          <div>
            <p className="text-xl font-medium tracking-[-.03em]">Have a question?<br />Contact Olympion.</p>
          </div>
          <div className="flex gap-3">
            <Phone size={17} className="mt-1 shrink-0"/>
            <div>
              <p className="text-xs text-black/45">Sales</p>
              <p className="mt-1 text-sm font-medium">+1 (800) OLYMPION</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin size={17} className="mt-1 shrink-0"/>
            <div>
              <p className="text-xs text-black/45">Headquarters</p>
              <p className="mt-1 text-sm font-medium">San Francisco, California</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">Frequently asked questions</p>
        <h2 className="mt-4 text-3xl font-medium tracking-[-.04em]">Common questions about Olympion.</h2>
        <div className="mt-10 divide-y divide-black/10 border-t border-black/10">
          {faqs.map(({ q, a }) => (
            <details className="group py-6" key={q}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                <h3 className="text-base font-medium">{q}</h3>
                <ChevronDown size={18} className="mt-0.5 shrink-0 text-black/40 transition group-open:rotate-180"/>
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-black/60">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-black/10 bg-[#f6cf42]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#5d4900]">Ready to start?</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-medium tracking-[-.04em] sm:text-4xl">
            Your future workforce is one conversation away.
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/marketplace" className="bg-black px-5 py-3 text-sm font-semibold text-white">
              Browse professionals
            </Link>
            <Link href="/pricing" className="border border-black px-5 py-3 text-sm font-semibold">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-[#f5f5f2]">
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-4 px-6 py-8 text-xs text-black/45 sm:flex-row">
          <span>© 2026 Olympion Inc.</span>
          <span>Platform · Marketplace · Pricing · Academy · Developer Portal</span>
        </div>
      </footer>
    </main>
  );
}
