import { ArrowRight, Lock, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="mx-4 sm:mx-6 mt-8 mb-12 overflow-hidden relative">
      <div className="px-8 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-10 items-center max-w-6xl mx-auto">
          {/* Left Column: Copy */}
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-4">
              Concept feature · Open Home Loans
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold font-serif text-foreground tracking-tight leading-[1.15] mb-5">
              See the savings rate
              <br />
              <span className="text-foreground/80">you could actually earn.</span>
            </h1>

            <p className="text-lg text-foreground/80 leading-relaxed mb-8 font-medium max-w-lg">
              Compare Australian bonus savings accounts by your real habits — not just the headline rate. We estimate your likely return after conditions, caps, and eligibility rules.
            </p>

            <a
              href="#form"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold text-primary-foreground bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 mb-6"
            >
              Check my rate
              <ArrowRight className="h-4 w-4" />
            </a>

            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Demo dataset · No sign-up · General information only</span>
            </div>
          </div>

          {/* Right Column: Preview Card */}
          <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            {/* Decorative background blur */}
            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
            
            <div className="relative bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Estimated annual interest
                  </p>
                  <p className="text-4xl font-bold text-foreground mt-1 tracking-tight">
                    +$788 <span className="text-xl font-medium text-muted-foreground">/ year</span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Likely eligible
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Based on:
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Monthly deposit met",
                      "Balance growth met",
                      "Balance within bonus cap"
                    ].map((cond) => (
                      <li key={cond} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground">{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground">
                    Compared with your current <span className="text-foreground font-bold">2.05% p.a.</span> rate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
