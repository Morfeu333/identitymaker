import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced Grid Background for Futuristic Theme */}
      <div className="grid-background fixed inset-0 pointer-events-none" />
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={8}
        repeatDelay={2}
        className={cn(
          "[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] fill-primary/30 stroke-primary/20"
        )}
      />
      <div className="relative z-10">
        <Header />
      </div>
      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
