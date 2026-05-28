import { CheckCircle2, Calculator, Trophy, ShieldAlert } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      title: "We check your habits",
      description: "We check your habits against each account’s conditions.",
      icon: CheckCircle2,
    },
    {
      title: "We estimate your rate",
      description: "We estimate the rate you’re likely to earn.",
      icon: Calculator,
    },
    {
      title: "We rank by true return",
      description: "We rank by expected annual interest, not headline rate.",
      icon: Trophy,
    },
    {
      title: "We explain trade-offs",
      description: "We explain the trade-offs clearly.",
      icon: ShieldAlert,
    },
  ];

  return (
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground tracking-tight">How it works</h2>
        <p className="text-sm text-muted-foreground mt-1">A transparent, data-driven approach to finding your best savings rate.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground leading-tight">
                  {step.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
