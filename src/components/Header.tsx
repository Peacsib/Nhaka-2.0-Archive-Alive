import { Archive, Menu, X, Github } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <Archive className="w-5 h-5 text-accent" />
            </div>
            <span className="font-serif text-lg font-bold text-foreground">
              Nhaka 2.0
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="/resurrect" 
              className="relative text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              Upload
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
            <a 
              href="/#features" 
              className="relative text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
            <a 
              href="/#stats" 
              className="relative text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              Impact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
            <a 
              href="https://github.com/Peacsib/Nhaka-2.0-Archive-Alive" 
              target="_blank"
              rel="noopener noreferrer"
              className="relative text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
            >
              <Github className="w-4 h-4" />
              GitHub
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="/resurrect">
              <Button variant="hero" size="sm">
                Try Demo
              </Button>
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-80 pb-4" : "max-h-0"
          )}
        >
          <nav className="flex flex-col gap-2">
            <a 
              href="/resurrect" 
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
            >
              Upload
            </a>
            <a 
              href="/#features" 
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
            >
              How It Works
            </a>
            <a 
              href="/#stats" 
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
            >
              Impact
            </a>
            <a 
              href="https://github.com/Peacsib/Nhaka-2.0-Archive-Alive" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a href="/resurrect" className="mx-4 mt-2">
              <Button variant="hero" size="sm" className="w-full">
                Try Demo
              </Button>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};
