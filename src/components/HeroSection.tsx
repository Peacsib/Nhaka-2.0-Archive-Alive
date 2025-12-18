import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Clock } from "lucide-react";

interface HeroSectionProps {
  onStartDemo: () => void;
  onUpload: () => void;
}

export const HeroSection = ({ onStartDemo, onUpload }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-agent-scanner/10 rounded-full blur-3xl animate-pulse-soft delay-500" />
      </div>
      
      {/* Floating Document Fragments */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-32 h-40 bg-card/60 rounded shadow-lg rotate-[-8deg] animate-float opacity-40" />
        <div className="absolute top-[25%] right-[15%] w-28 h-36 bg-card/60 rounded shadow-lg rotate-[12deg] animate-float delay-300 opacity-40" />
        <div className="absolute bottom-[20%] left-[20%] w-24 h-32 bg-card/60 rounded shadow-lg rotate-[5deg] animate-float delay-200 opacity-40" />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-secondary-foreground">
              AI-Powered Archive Restoration
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight animate-fade-in delay-100">
            Resurrect{" "}
            <span className="relative">
              <span className="text-accent">Lost</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 8C50 2 150 2 198 8" stroke="hsl(var(--accent))" strokeWidth="3" strokeLinecap="round" className="opacity-60"/>
              </svg>
            </span>{" "}
            Archives
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto animate-fade-in delay-200 font-light">
            Watch three AI agents collaborate in real-time to bring faded documents back to life.
          </p>

          {/* Emotional Hook */}
          <p className="text-lg text-foreground/80 mb-10 max-w-xl mx-auto animate-fade-in delay-300 italic font-serif">
            "Your grandmother's wartime letters are fading. But her story doesn't have to."
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in delay-400">
            <Button 
              variant="hero" 
              size="xl" 
              onClick={onUpload}
              className="group"
            >
              <Upload className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              Upload Your Document
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              onClick={onStartDemo}
              className="group"
            >
              <Clock className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-border/50 animate-fade-in delay-500">
            <p className="text-sm text-muted-foreground mb-4">Trusted for preserving</p>
            <div className="flex flex-wrap justify-center gap-8 text-muted-foreground/70">
              <span className="font-serif text-lg">Family Letters</span>
              <span className="text-border">•</span>
              <span className="font-serif text-lg">Historical Documents</span>
              <span className="text-border">•</span>
              <span className="font-serif text-lg">Cultural Artifacts</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
