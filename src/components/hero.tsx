import { ArrowRight, BadgeCheck, Search, TrendingUp } from "lucide-react";

const STATS = [
  { value: "8", label: "AU accounts compared", icon: Search },
  { value: "100%", label: "transparent logic", icon: BadgeCheck },
  { value: "Live", label: "updates as you type", icon: TrendingUp },
];

export function Hero() {
  return (
    <section
      className="mx-4 sm:mx-6 mt-6 mb-10 rounded-3xl overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #FFF5EE 0%, #FFE4CC 55%, #FFCFA8 100%)",
      }}
    >
      <div className="px-8 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20 max-w-3xl">
        <p className="text-sm font-semibold text-orange-600 tracking-wide uppercase mb-4">
          Concept feature · Open Home Loans
        </p>

        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-stone-900 tracking-tight leading-[1.1] mb-5">
          See the savings rate
          <br />
          <span className="text-orange-500">you could actually earn.</span>
        </h1>

        <p className="text-lg text-stone-600 leading-relaxed mb-8 max-w-lg">
          Compare AU bonus savings accounts by your real habits — not the
          headline rate. Adjust the sliders below and see your honest estimate
          instantly. No sign-up, no obligation.
        </p>

        <a
          href="#form"
          className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-base font-semibold shadow-sm text-white"
          style={{ background: "#F97316" }}
        >
          Check my rate
          <ArrowRight className="h-4 w-4" />
        </a>

        <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80"
            >
              <Icon className="h-4 w-4 text-orange-400 mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-stone-900 leading-none">
                {value}
              </p>
              <p className="text-xs text-stone-500 mt-1 leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
