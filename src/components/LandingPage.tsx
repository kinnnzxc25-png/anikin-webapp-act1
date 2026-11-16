import React, { useState } from 'react';
import { ArrowRight, Menu, X, Shield, Users, Compass, Calendar } from 'lucide-react';

interface LandingPageProps {
  onNavigateAuth: (mode: 'signin' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateAuth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tiers = [
    {
      index: '01.',
      name: 'Founding Circle',
      cadence: 'By Committee Invitation · Annual Charter',
      summary:
        'Full global chapter access across Manila, Tokyo, Singapore, London, and New York with permanent table priority and private boardroom reservations.',
      privileges: [
        'Unrestricted 24/7 lounge & listening room entry',
        'Two accompanied guest privileges per evening',
        'Voting seat on annual chapter admissions',
      ],
    },
    {
      index: '02.',
      name: 'Executive',
      cadence: 'Vetted Membership · Annual Charter',
      summary:
        'Designed for founders, creative directors, and managing partners seeking high-trust peer roundtables, private salons, and curated member introductions.',
      privileges: [
        'Primary chapter house access & global reciprocity',
        'Monthly closed-door founders\' supper & salons',
        'Full access to Member Directory & Digital Vault',
      ],
    },
    {
      index: '03.',
      name: 'Patron',
      cadence: 'Cultural & Arts Fellowship · Annual Charter',
      summary:
        'For architects, collectors, and cultural patrons supporting independent exhibitions, architectural commissions, and intimate evening programming.',
      privileges: [
        'Priority seating at seasonal cultural briefings',
        'Private studio walkthroughs & exhibition previews',
        'Full access to Member Directory & Digital Vault',
      ],
    },
  ];

  const featuredMembers = [
    {
      name: 'Rafael Navarro',
      role: 'Club Chairman · Navarro Capital',
      chapter: 'Manila',
      portrait: '/src/assets/images/member_founder_portrait_1794742533525.jpg',
    },
    {
      name: 'Julian Reyes',
      role: 'Principal Creative Director · Monolith Atelier',
      chapter: 'Tokyo',
      portrait: '/src/assets/images/member_director_portrait_1794742533514.jpg',
    },
    {
      name: 'Arthur Sterling',
      role: 'Founding Architect · Sterling & Co. Studio',
      chapter: 'London',
      portrait: '/src/assets/images/member_architect_portrait_1794742535069.jpg',
    },
  ];

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col">
      {/* Top Bar: 3-Zone Contract */}
      <header className="sticky top-0 z-30 bg-[#060911]/90 backdrop-blur-md border-b border-[#D4AF37]/15">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <a
            href="#top"
            className="font-display text-lg sm:text-xl font-semibold tracking-[0.18em] text-[#E7C860] whitespace-nowrap shrink-0"
          >
            BOY'S AT THE BACK
          </a>

          {/* Zone 2: 4 Single-line Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wide text-slate-300">
            <a href="#ethos" className="hover:text-[#E7C860] transition-colors whitespace-nowrap shrink-0">
              Ethos
            </a>
            <a href="#membership" className="hover:text-[#E7C860] transition-colors whitespace-nowrap shrink-0">
              Membership
            </a>
            <a href="#chapters" className="hover:text-[#E7C860] transition-colors whitespace-nowrap shrink-0">
              Chapters
            </a>
            <a href="#directory-preview" className="hover:text-[#E7C860] transition-colors whitespace-nowrap shrink-0">
              Fellowship
            </a>
          </nav>

          {/* Zone 3: Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateAuth('signin')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] text-xs font-semibold tracking-wide transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Member Login</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="md:hidden p-2 rounded-lg border border-[#D4AF37]/25 text-slate-200 hover:text-[#E7C860] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A1120] border-t border-[#D4AF37]/15 px-6 py-5 space-y-4">
            <div className="flex flex-col space-y-3 text-sm text-slate-200">
              <a href="#ethos" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E7C860]">
                Ethos
              </a>
              <a href="#membership" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E7C860]">
                Membership
              </a>
              <a href="#chapters" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E7C860]">
                Chapters
              </a>
              <a href="#directory-preview" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E7C860]">
                Fellowship
              </a>
            </div>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateAuth('signin');
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-[#D4AF37] text-[#060911] text-xs font-semibold cursor-pointer"
              >
                Member Login
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateAuth('signup');
                }}
                className="w-full py-2.5 px-4 rounded-lg border border-[#D4AF37]/40 text-[#E7C860] text-xs font-semibold cursor-pointer"
              >
                Apply for Membership
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="top" className="relative overflow-hidden border-b border-[#D4AF37]/15">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Narrative Column */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4AF37]">
                Private Society · Est. 2025
              </p>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.08] tracking-tight text-balance">
                An Exclusive Community for Members.
              </h1>

              <p className="text-base text-slate-300 leading-relaxed max-w-xl">
                BOY'S AT THE BACK brings together founders, architects, creative directors, and patrons across five global chapters. Quiet rooms, vetted introductions, and unhurried conversation away from the noise.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigateAuth('signup')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] text-xs font-bold tracking-wide transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Apply for Membership</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigateAuth('signin')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#D4AF37]/35 hover:border-[#D4AF37] text-slate-100 hover:text-[#E7C860] bg-[#0A1120] text-xs font-semibold tracking-wide transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Sign In to Portal</span>
                </button>
              </div>
            </div>

            {/* Quiet Proof Strip */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-6">
              <div>
                <div className="font-mono text-2xl font-semibold text-[#E7C860] tabular-nums">5</div>
                <div className="text-xs text-slate-400 mt-1">Global Chapters</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-semibold text-white tabular-nums">180</div>
                <div className="text-xs text-slate-400 mt-1">Vetted Members</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-semibold text-white tabular-nums">24/7</div>
                <div className="text-xs text-slate-400 mt-1">Lounge & Vault Access</div>
              </div>
            </div>
          </div>

          {/* Right Hero Architectural Photography */}
          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-[#D4AF37]/20 bg-[#0A1120] min-h-[340px] lg:min-h-[480px]">
            <img
              src="/src/assets/images/hero_club_lounge_1794742533409.jpg"
              alt="BOY'S AT THE BACK private members lounge"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060911]/90 via-[#060911]/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="text-xs text-[#E7C860] font-medium">
                Flagship Lounge · Manila & Tokyo
              </div>
              <p className="font-display text-xl sm:text-2xl text-white mt-1">
                Reserved booths, curated vinyl, and private roundtables after dark.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ethos & Community Pillars */}
      <section id="ethos" className="bg-[#0A1120] border-b border-[#D4AF37]/15">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#D4AF37]">
              The House Standard
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white mt-2 text-balance">
              Built for discretion, longevity, and meaningful camaraderie.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="border-t border-[#D4AF37]/30 pt-6">
              <Shield className="w-5 h-5 text-[#D4AF37] mb-4" />
              <h3 className="text-sm font-semibold text-white">Committee Vetted</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Every prospective member is reviewed personally by chapter stewards to preserve trust and cultural fit.
              </p>
            </div>

            <div className="border-t border-[#D4AF37]/30 pt-6">
              <Users className="w-5 h-5 text-[#D4AF37] mb-4" />
              <h3 className="text-sm font-semibold text-white">Private Directory</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Connect directly with fellow founders, designers, and investors across chapters with verified credentials.
              </p>
            </div>

            <div className="border-t border-[#D4AF37]/30 pt-6">
              <Calendar className="w-5 h-5 text-[#D4AF37] mb-4" />
              <h3 className="text-sm font-semibold text-white">Seasonal Salons</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Off-the-record suppers, architectural walkthroughs, and listening evenings published inside the member portal.
              </p>
            </div>

            <div className="border-t border-[#D4AF37]/30 pt-6">
              <Compass className="w-5 h-5 text-[#D4AF37] mb-4" />
              <h3 className="text-sm font-semibold text-white">Member Vault</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Encrypted repository for club charters, event briefs, private project files, and reciprocal house passes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section id="membership" className="bg-[#060911] border-b border-[#D4AF37]/15">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-xl">
              <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#D4AF37]">
                Membership Tiers
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white mt-2 text-balance">
                Open registration or vetted fellowship.
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Join immediately with Open Membership and receive your unique Member ID, or submit an Approval-Based application for committee review.
              </p>
            </div>

            <button
              onClick={() => onNavigateAuth('signup')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#E7C860] hover:text-white transition-colors self-start md:self-auto cursor-pointer"
            >
              <span>Join or Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="bg-[#0A1120] border border-[#D4AF37]/20 rounded-2xl p-8 flex flex-col justify-between hover:border-[#D4AF37]/50 transition-colors"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-xs text-[#D4AF37]">{tier.index}</span>
                    <span className="text-[11px] text-slate-400">{tier.cadence}</span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-white mt-3">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                    {tier.summary}
                  </p>

                  <ul className="mt-6 pt-6 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
                    {tier.privileges.map((priv) => (
                      <li key={priv} className="flex items-start gap-2">
                        <span className="text-[#D4AF37] mt-0.5">—</span>
                        <span>{priv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => onNavigateAuth('signup')}
                    className="w-full py-2.5 px-4 rounded-lg border border-[#D4AF37]/35 hover:bg-[#D4AF37] hover:text-[#060911] text-[#E7C860] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Apply for {tier.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapters & Editorial Gathering */}
      <section id="chapters" className="bg-[#0A1120] border-b border-[#D4AF37]/15">
        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-[#D4AF37]/20 bg-[#060911]">
            <img
              src="/src/assets/images/club_gathering_editorial_1794742535755.jpg"
              alt="Private evening salon gathering at BOY'S AT THE BACK"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover aspect-[4/3]"
            />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#D4AF37]">
              Global Footprint
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white text-balance">
              Five rooms. One standard of hospitality.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Whether hosting a founder roundtable in Manila, listening to rare pressings in Aoyama, or meeting partners in Mayfair, your digital member pass grants seamless entry across every affiliated house.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
              <div>
                <div className="font-semibold text-white">Manila</div>
                <div className="text-slate-400 mt-0.5">Flagship Backroom</div>
              </div>
              <div>
                <div className="font-semibold text-white">Tokyo</div>
                <div className="text-slate-400 mt-0.5">Aoyama Listening Room</div>
              </div>
              <div>
                <div className="font-semibold text-white">Singapore</div>
                <div className="text-slate-400 mt-0.5">Tanjong Pagar Salon</div>
              </div>
              <div>
                <div className="font-semibold text-white">London</div>
                <div className="text-slate-400 mt-0.5">Mayfair Reading Study</div>
              </div>
              <div>
                <div className="font-semibold text-white">New York</div>
                <div className="text-slate-400 mt-0.5">Tribeca Private Loft</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fellowship Preview */}
      <section id="directory-preview" className="bg-[#060911] border-b border-[#D4AF37]/15">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#D4AF37]">
              Member Fellowship
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white mt-2">
              Among peers who build things that endure.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMembers.map((m) => (
              <div
                key={m.name}
                className="bg-[#0A1120] border border-slate-800/90 rounded-2xl p-6 flex items-center gap-4"
              >
                <img
                  src={m.portrait}
                  alt={m.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover ring-1 ring-[#D4AF37]/30 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{m.name}</div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">{m.role}</div>
                  <div className="text-[11px] text-[#D4AF37] mt-1">{m.chapter} Chapter</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="bg-[#060911] py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="font-display text-base font-semibold tracking-[0.18em] text-[#E7C860]">
              BOY'S AT THE BACK
            </div>
            <p className="text-xs text-slate-500 mt-1">
              An Exclusive Community for Members · Manila · Tokyo · Singapore · London · New York
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <button
              onClick={() => onNavigateAuth('signin')}
              className="hover:text-[#E7C860] transition-colors cursor-pointer"
            >
              Member Login
            </button>
            <button
              onClick={() => onNavigateAuth('signup')}
              className="hover:text-[#E7C860] transition-colors cursor-pointer"
            >
              Membership Registration
            </button>
            <span className="text-slate-600">© 2026 BOY'S AT THE BACK</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
