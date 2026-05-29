import { CheckCircle2, Calculator, Trophy, ShieldAlert } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      title: "We check your habits",
      description:
        "Deposit frequency, card spend, and balance growth — matched against each account’s fine print.",
      icon: CheckCircle2,
    },
    {
      title: "We estimate your rate",
      description:
        "Bonus rates only apply when conditions are met; otherwise we use the base or standard rate.",
      icon: Calculator,
    },
    {
      title: "We rank by true return",
      description:
        "Accounts are sorted by expected annual interest after caps, tiers, and intro periods.",
      icon: Trophy,
    },
    {
      title: "We explain trade-offs",
      description:
        "Each result shows why it won, what could block the bonus, and where to verify provider terms.",
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
