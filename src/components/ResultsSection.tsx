import { TrendingUp, Users, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useCountUp } from "@/hooks/useCountUp";

const stats = [
  {
    icon: TrendingUp,
    value: 87,
    suffix: "%",
    label: "Förbättrat engagemang",
    description: "Genomsnittlig ökning för företag som följer strategin",
  },
  {
    icon: Users,
    value: 2400,
    suffix: "+",
    label: "Nya följare i snitt",
    description: "Per företag under de första 3 månaderna",
  },
  {
    icon: Clock,
    value: 5,
    suffix: "h",
    label: "Sparad tid per vecka",
    description: "Genom automatiserad innehållsplanering",
  },
];

const ResultsSection = () => {
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section 
      ref={ref as any}
      className="relative py-20 md:py-28 px-4 bg-gradient-diagonal overflow-hidden font-poppins"
    >
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-primary/15 rounded-full blur-3xl animate-glow-pulse" />
      
      <div className="container mx-auto relative z-10 max-w-6xl">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-20 space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white px-2 leading-tight text-balance">
            När strategi möter{" "}
            <span className="text-primary-glow">
              verkliga resultat
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/70 px-4 max-w-xl mx-auto">
            Resultat från företag som följde sin personliga Promotley-strategi
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const count = useCountUp({ 
              end: stat.value, 
              duration: 2000 + (index * 200), 
              isVisible 
            });
            
            return (
              <Card
                key={index}
                className="p-6 md:p-8 bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all duration-300 text-center"
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-glow" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2 text-white tabular-nums">
                  {count}{stat.suffix}
                </div>
                <div className="text-white/90 text-base font-medium mb-2">
                  {stat.label}
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  {stat.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
