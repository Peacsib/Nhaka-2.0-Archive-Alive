import { Sparkles, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "./ui/button";
export const Footer = () => {
  return <footer className="py-12 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-accent" />
              <span className="font-serif text-xl font-bold">Nhaka 2.0</span>
            </div>
            <p className="text-primary-foreground/70 text-sm max-w-xs">
              Preserving Zimbabwean heritage through transparent AI collaboration. 
              Every document tells a story worth saving.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-primary-foreground/70 text-sm">
              <li><a href="/resurrect" className="hover:text-accent transition-colors">Upload Document</a></li>
              <li><a href="/#features" className="hover:text-accent transition-colors">How It Works</a></li>
              <li><a href="/#stats" className="hover:text-accent transition-colors">Impact Stats</a></li>
              <li><a href="/#features" className="hover:text-accent transition-colors">Meet the Agents</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-2">
              <a href="https://github.com/Peacsib" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                  <Github className="w-5 h-5" />
                </Button>
              </a>
              <a href="https://www.linkedin.com/in/peace-sibanda" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                  <Linkedin className="w-5 h-5" />
                </Button>
              </a>
              <a href="mailto:peacesibx@gmail.com">
                <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                  <Mail className="w-5 h-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary-foreground/50">
              Built with ❤️ for the ERNIE AI Developer Challenge 2025
            </span>
            <span className="px-2 py-0.5 bg-accent/20 rounded text-xs font-medium text-accent">
              Powered by ERNIE & PaddleOCR-VL
            </span>
          </div>
          <p className="text-sm text-primary-foreground/50">
            Every story deserves to be remembered.
          </p>
        </div>
      </div>
    </footer>;
};