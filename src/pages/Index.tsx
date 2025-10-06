import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import HowItWorks from "@/components/HowItWorks";
import ResultsSection from "@/components/ResultsSection";
import AIDemoSection from "@/components/AIDemoSection";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import TrustSection from "@/components/TrustSection";
import FinalCTA from "@/components/FinalCTA";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <ResultsSection />
      <AIDemoSection />
      <Pricing />
      <Testimonials />
      <TrustSection />
      <FinalCTA />
      
      {/* Footer */}
      <footer className="border-t py-12 px-4 bg-background">
        <div className="container mx-auto text-center text-muted-foreground font-poppins">
          <p>© 2025 Promotley. AI-driven marknadsföring för UF-företag.</p>
          <div className="mt-4 flex gap-6 justify-center">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
              Integritetspolicy
            </Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">
              Användarvillkor
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
