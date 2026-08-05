export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.15)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(20,184,166,0.1)_0%,_transparent_60%)]" />

        <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              Open Welfare
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#features"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-emerald-200/80 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#about"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-emerald-200/80 hover:text-white transition-colors"
            >
              About
            </a>
            <button className="px-5 py-2.5 text-sm font-semibold text-emerald-950 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl hover:from-emerald-300 hover:to-teal-300 transition-all duration-200 shadow-lg shadow-emerald-500/20 cursor-default">
              Get Started
            </button>
          </div>
        </nav>

        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-28 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-emerald-300">
              Open Source · Community Driven
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight">
            Empowering Communities
            <br />
            <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              Through Welfare
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-emerald-100/60 max-w-2xl leading-relaxed">
            A modern platform for mosques and local charities to manage
            donation campaigns, track beneficiary support, and coordinate
            volunteer shifts — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
            <button className="px-8 py-3.5 text-base font-semibold text-emerald-950 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl hover:from-emerald-300 hover:to-teal-300 transition-all duration-200 shadow-xl shadow-emerald-500/25 cursor-default">
              Launch Dashboard
            </button>
            <button className="px-8 py-3.5 text-base font-semibold text-emerald-200 border border-emerald-500/30 rounded-2xl hover:bg-emerald-500/10 transition-all duration-200 cursor-default">
              View Campaigns
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
              Built for transparency, accountability, and community engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Campaign Management */}
            <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-emerald-500/30 hover:bg-zinc-900 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                <svg
                  className="w-6 h-6 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Campaign Management
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Create and manage fundraising campaigns with real-time progress
                tracking, goal management, and transparent donation records.
              </p>
            </div>

            {/* Beneficiary Tracking */}
            <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-emerald-500/30 hover:bg-zinc-900 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5 group-hover:bg-teal-500/20 transition-colors">
                <svg
                  className="w-6 h-6 text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Beneficiary Tracking
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Maintain secure records of beneficiaries, track disbursements,
                and ensure aid reaches those who need it with full audit trails.
              </p>
            </div>

            {/* Volunteer Coordination */}
            <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-emerald-500/30 hover:bg-zinc-900 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5 group-hover:bg-cyan-500/20 transition-colors">
                <svg
                  className="w-6 h-6 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Volunteer Shifts
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Organize volunteer schedules, manage shift sign-ups, and
                coordinate community service efforts seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-zinc-950 to-zinc-900 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-emerald-400">100%</div>
            <div className="mt-1 text-sm text-zinc-500">Open Source</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-teal-400">RLS</div>
            <div className="mt-1 text-sm text-zinc-500">Row Level Security</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-400">∞</div>
            <div className="mt-1 text-sm text-zinc-500">Campaigns</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-300">Free</div>
            <div className="mt-1 text-sm text-zinc-500">Forever</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-zinc-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Built for the Community
          </h2>
          <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
            Open Welfare is a free, open-source platform designed to help
            mosques, community centers, and local charities manage their
            welfare operations with transparency and efficiency. Every
            donation tracked. Every beneficiary served. Every volunteer
            appreciated.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white border border-zinc-700 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-zinc-950 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
            Open Welfare — MIT License
          </div>
          <p className="text-sm text-zinc-600">
            Built with Next.js, Supabase & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
