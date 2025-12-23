import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { ImpactStats } from "@/components/ImpactStats";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const goToResurrect = () => {
    navigate("/resurrect");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <HeroSection 
          onStartDemo={goToResurrect}
          onUpload={goToResurrect}
        />
        
        <ImpactStats />
        
        <FeaturesSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
