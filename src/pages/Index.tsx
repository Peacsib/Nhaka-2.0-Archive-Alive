import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ProcessingSection } from "@/components/ProcessingSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { ImpactStats } from "@/components/ImpactStats";
import { Footer } from "@/components/Footer";
import { useRef } from "react";

const Index = () => {
  const uploadRef = useRef<HTMLElement>(null);

  const scrollToUpload = () => {
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
  };

  const startDemo = () => {
    scrollToUpload();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <HeroSection 
          onStartDemo={startDemo}
          onUpload={scrollToUpload}
        />
        
        <ProcessingSection />
        
        <ImpactStats />
        
        <FeaturesSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
