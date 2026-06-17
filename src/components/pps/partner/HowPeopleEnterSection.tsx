import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

export function HowPeopleEnterSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            How People Typically Enter the Porch
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {entries.map((entry) => (
            <div
              key={entry.tier}
              className={`relative bg-white p-8 rounded-xl border-t-4 ${entry.borderColor} shadow-sm flex flex-col h-full`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full ${entry.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <entry.icon className={`w-5 h-5 ${entry.iconColor}`} />
                </div>
                <h3 className={`text-xl md:text-2xl font-poppins font-bold ${entry.textColor}`}>
                  {entry.tier}
                </h3>
              </div>
              <div className="flex-1">
                <p className="text-foreground leading-relaxed mb-3">
                  {entry.intro}
                </p>
                <ul className="space-y-1">
                  {entry.items.map((item, i) => (
                    <li key={i} className="text-foreground text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <p className={`font-bold ${entry.textColor} mt-4`}>
                {entry.closing}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mb-10 max-w-2xl mx-auto space-y-2">
          <p className="text-lg text-foreground">
            No path is inherently better. Each serves a different need and moment.
          </p>
        </div>

        {/* Progression, Not Prescription callout */}
        <div className="bg-gradient-to-r from-primary/5 to-gold/10 border border-primary/20 p-8 md:p-10 rounded-xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy">
              Progression, Not Prescription
            </h3>
          </div>
          <p className="text-primary font-medium mb-4">
            There is no ladder to climb. Your pathway emerges from clarity.
          </p>
          <p className="text-foreground leading-relaxed max-w-2xl mx-auto mb-4">
            You might start with{" "}
            <Link to="/partner/ignite" className="font-bold text-gold hover:underline">
              IGNITE
            </Link>{" "}
            and stay there. Or progress to{" "}
            <Link to="/partner/amplify" className="font-bold text-strategic hover:underline">
              AMPLIFY
            </Link>{" "}
            when you're ready for more depth. Or jump straight to{" "}
            <Link to="/partner/embody" className="font-bold text-navy hover:underline">
              EMBODY
            </Link>
            . Your pathway emerges from exploration, not prescription.
          </p>
          <p className="text-navy font-medium italic">
            Your starting point is yours to choose. Your momentum is yours to own.
          </p>
        </div>
      </div>
    </section>
  );
}
