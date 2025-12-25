import { Button } from "@/components/ui/button";
import { Upload, Archive, Clock } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface HeroSectionProps {
  onStartDemo: () => void;
  onUpload: () => void;
}

export const HeroSection = ({ onStartDemo, onUpload }: HeroSectionProps) => {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Effects with Parallax */}
      <div className="absolute inset-0 bg-hero-gradient" />
      
      {/* Subtle faded document background */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'800\' height=\'600\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ctext x=\'50\' y=\'100\' font-family=\'serif\' font-size=\'24\' fill=\'%23000\' opacity=\'0.3\'%3EDear Sir,%3C/text%3E%3Ctext x=\'50\' y=\'150\' font-family=\'serif\' font-size=\'18\' fill=\'%23000\' opacity=\'0.2\'%3EI write to inform you of the recent developments...%3C/text%3E%3Ctext x=\'50\' y=\'200\' font-family=\'serif\' font-size=\'18\' fill=\'%23000\' opacity=\'0.15\'%3ERegarding the matter of the land concession...%3C/text%3E%3Ctext x=\'50\' y=\'250\' font-family=\'serif\' font-size=\'18\' fill=\'%23000\' opacity=\'0.1\'%3ESigned this day, 1896%3C/text%3E%3C/svg%3E")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)'
        }}
      />
      
      <div 
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, hsl(32 90% 50% / 0.12) 0%, hsl(32 90% 50% / 0.04) 40%, transparent 70%)' }}
      />
      
      {/* Ambient glow orbs - parallax slower */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      >
        <div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, hsl(32 90% 50% / 0.5) 0%, hsl(32 90% 50% / 0.1) 50%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, hsl(195 85% 42% / 0.4) 0%, hsl(195 85% 42% / 0.1) 50%, transparent 70%)' }}
        />
      </div>

      <div 
        className="container relative z-10 px-4 md:px-6"
        style={{ transform: `translateY(${scrollY * 0.15}px)` }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Badges Container - Aligned */}
          <div className="flex flex-col items-center gap-3 mb-8">
            {/* ERNIE Challenge Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 animate-fade-in shadow-sm min-w-[280px] justify-center">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                🏆 ERNIE AI Developer Challenge 2025
              </span>
            </div>

            {/* AI-Powered Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-secondary/80 to-secondary/60 border border-accent/20 animate-fade-in shadow-sm min-w-[280px] justify-center">
              <Archive className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-secondary-foreground">
                AI-Powered Archive Restoration
              </span>
            </div>
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
            Watch five AI agents collaborate in real-time to bring faded documents back to life.
          </p>

          {/* Emotional Hook */}
          <p className="text-lg text-foreground/80 mb-10 max-w-xl mx-auto animate-fade-in delay-300 italic font-serif">
            "Every faded letter holds a story. Let AI help you read it again."
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in delay-400">
            {/* Upload Button with Animated Corner Gradient */}
            <div className="relative group">
              {/* Animated gradient border */}
              <div className="absolute -inset-[2px] gradient-border-animated rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <Button 
                  variant="hero" 
                  size="xl" 
                  onClick={onUpload}
                  className="group/btn relative z-10"
                >
                  <Upload className="w-5 h-5 mr-2 group-hover/btn:animate-bounce" />
                  Upload Your Document
                </Button>
              </div>
            </div>

            {/* Watch Demo Button with Animated Corner Gradient */}
            <div className="relative group">
              {/* Animated gradient border */}
              <div className="absolute -inset-[2px] gradient-border-animated rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="xl" 
                  onClick={onStartDemo}
                  className="group/btn relative z-10"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>
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
