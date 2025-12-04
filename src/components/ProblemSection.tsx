import { AlertCircle, CheckCircle } from "lucide-react";

const ProblemSection = () => {
  return (
    <section className="relative py-20 md:py-28 px-4 font-poppins" style={{ background: 'var(--gradient-problem)' }}>
      <div className="container mx-auto max-w-6xl">
        {/* Section title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-14 md:mb-20 px-2 leading-tight text-balance max-w-3xl mx-auto">
          Du vet känslan när du lägger tid på{" "}
          <span className="text-transparent bg-clip-text bg-gradient-primary">
            content som ingen ser?
          </span>
        </h2>

        {/* Split screen comparison */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-stretch">
          {/* Before - Problem */}
          <div className="relative p-6 md:p-8 rounded-2xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-foreground pt-1">Innan Promotley</h3>
            </div>
            
            <ul className="space-y-3 md:space-y-4">
              {[
                "Vet inte när eller hur ofta du ska posta",
                "Ingen koll på budget för marknadsföring",
                "Låga visningar och engagemang",
                "Saknar strategi för innehållsplanering",
                "Osäker på vad som funkar för din bransch",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-muted-foreground">
                  <span className="text-destructive shrink-0 mt-0.5">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* After - Solution */}
          <div className="relative p-6 md:p-8 rounded-2xl border border-primary/20 bg-gradient-hero backdrop-blur-sm shadow-soft">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-foreground pt-1">Med Promotley</h3>
            </div>
            
            <ul className="space-y-3 md:space-y-4">
              {[
                "Personlig postningsstrategi",
                "Budgetanpassad innehållsplan",
                "Skräddarsytt för din bransch och målgrupp",
                "Komplett innehållskalender varje vecka",
                "AI-genererat innehåll redo att publicera",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-foreground">
                  <span className="text-primary shrink-0 mt-0.5">✓</span>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
