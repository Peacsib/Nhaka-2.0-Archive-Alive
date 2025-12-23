import { Header } from "@/components/Header";
import { ProcessingSection } from "@/components/ProcessingSection";
import { Footer } from "@/components/Footer";

const Resurrect = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <ProcessingSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Resurrect;
