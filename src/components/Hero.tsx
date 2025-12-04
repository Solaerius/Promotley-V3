import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import gamlastan from "@/assets/gamlastan.png";
import { useAuth } from "@/hooks/useAuth";

const Hero = () => {
  const { user } = useAuth();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden font-poppins">
      {/* Background image with blur */}
      <div className="absolute inset-0">
        <img 
          src={gamlastan} 
          alt="Stockholm Gamla Stan background" 
          className="w-full h-full object-cover object-[center_67%] blur-[2px] opacity-50"
        />
      </div>
      
      {/* Animated gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-warm opacity-40" />
      
      {/* Floating glow elements */}
      <div className="absolute top-20 left-5 md:left-10 w-48 h-48 md:w-72 md:h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-5 md:right-10 w-64 h-64 md:w-96 md:h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      
      {/* Content */}
      <div className="container relative z-10 px-4 py-24 md:py-32 mx-auto">
        <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight animate-fade-in text-hero-foreground leading-[1.1] px-2 text-balance">
            Bli företaget alla{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-hero-foreground via-primary-glow to-hero-foreground">
                pratar om
              </span>
              <span className="absolute inset-0 blur-xl bg-gradient-to-r from-primary via-accent to-primary opacity-40" />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-hero-muted max-w-xl mx-auto leading-relaxed animate-slide-up font-medium px-4">
            AI som hjälper UF-företag och startups att växa snabbare på sociala medier
          </p>

          {/* CTA Buttons */}
          <div className="max-w-xl mx-auto pt-4 md:pt-6 animate-slide-up px-4" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link to="/auth">
                <Button 
                  variant="gradient" 
                  size="lg"
                  className="text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 shadow-elegant font-semibold whitespace-nowrap h-auto"
                >
                  Starta gratis
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <span className="text-hero-muted/60 text-sm font-medium">eller</span>
              <Link to={user ? "/join-organization" : "/auth?mode=join"}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 border border-white/20 text-white/90 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 font-medium whitespace-nowrap h-auto"
                >
                  Anslut till företag
                </Button>
              </Link>
            </div>
            <p className="text-xs md:text-sm text-hero-muted/60 text-center mt-4">
              Ingen kortinformation krävs.
            </p>
          </div>

          {/* Secondary CTA */}
          <div className="pt-2 animate-slide-up px-4" style={{ animationDelay: "0.3s" }}>
            <a href="#how-it-works">
              <Button 
                variant="ghost" 
                size="lg" 
                className="text-sm sm:text-base px-5 sm:px-6 py-2.5 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 font-medium"
              >
                Se hur det funkar
              </Button>
            </a>
          </div>

          {/* Social proof badge */}
          <div className="flex items-center justify-center gap-2 pt-6 md:pt-8 text-hero-muted animate-fade-in px-4" style={{ animationDelay: "0.4s" }}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-glow" />
            </div>
            <p className="text-xs sm:text-sm font-medium">
              <span className="font-bold text-hero-foreground">100+</span> UF-företag växer redan med Promotley
            </p>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
