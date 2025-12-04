import { Card } from "@/components/ui/card";
import { Link2, BarChart3, Lightbulb } from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "Berätta om ditt företag",
    description: "Budget, bransch, målgrupp och hur mycket tid du har. Promotley anpassar strategin efter just dig.",
    gradient: "from-primary to-primary-glow",
  },
  {
    icon: BarChart3,
    title: "Koppla dina sociala medier",
    description: "AI:n analyserar dina konton och konkurrenterna för att hitta de bästa möjligheterna.",
    gradient: "from-accent to-primary",
  },
  {
    icon: Lightbulb,
    title: "Få din personliga strategi",
    description: "Komplett plan med exakt när, hur ofta och vad du ska posta - anpassat efter din budget och tid.",
    gradient: "from-primary-glow to-accent",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4 bg-gradient-hero font-poppins">
      <div className="container mx-auto max-w-6xl">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-20 space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold px-2 leading-tight text-balance">
            Från företagsidé till{" "}
            <span className="text-transparent bg-clip-text bg-gradient-primary">
              färdig strategi
            </span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground px-4 max-w-xl mx-auto">
            Få din personliga innehållsplan på under 5 minuter
          </p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="relative p-6 md:p-8 bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 group"
              >
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm md:text-base shadow-md">
                  {index + 1}
                </div>

                <div className="space-y-4 mt-2">
                  {/* Icon with gradient background */}
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>

                  <h3 className="text-lg md:text-xl font-semibold">{step.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
