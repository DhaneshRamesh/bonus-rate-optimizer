import { Button } from "@/components/ui/button";
import { ArrowRight, BadgeCheck, Search, TrendingUp } from "lucide-react";

const STATS = [
  { value: "8", label: "accounts compared", icon: Search },
  { value: "100%", label: "transparent logic", icon: BadgeCheck },
  { value: "~$800", label: "avg gap found", icon: TrendingUp },
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
        {/* Eyebrow */}
        <p className="text-sm font-semibold text-orange-600 tracking-wide uppercase mb-4">
          Concept Demo · Not Financial Advice
        </p>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-stone-900 tracking-tight leading-[1.1] mb-5">
          Find the savings rate
          <br />
          <span className="text-orange-500">you'll actually earn.</span>
        </h1>

        {/* Sub-copy */}
        <p className="text-lg text-stone-600 leading-relaxed mb-8 max-w-lg">
          Australian banks advertise eye-catching bonus rates — but conditions
          like monthly deposits, card transaction minimums, and balance caps
          mean most savers miss out. See your real estimated rate before you
          commit.
        </p>

        {/* CTA */}
        <Button
          size="lg"
          className="rounded-full px-7 py-3 text-base font-semibold shadow-sm"
          style={{ background: "#F97316", color: "#fff" }}
        >
          Check my rate
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        {/* Stats row */}
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
