import { Card } from "./ui/card";
import { Library, Users, Globe, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    icon: Users,
    value: "5",
    label: "AI Agents",
    description: "Collaborating in real-time via SSE streaming",
    color: "text-agent-scanner",
    bgColor: "bg-agent-scanner/10",
  },
  {
    icon: Library,
    value: "2",
    label: "ERNIE Models",
    description: "PaddleOCR-VL + ERNIE 4.5 via Novita AI",
    color: "text-agent-historian",
    bgColor: "bg-agent-historian/10",
  },
  {
    icon: DollarSign,
    value: "Fast",
    label: "Processing",
    description: "Efficient multimodal document analysis",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Globe,
    value: "100+",
    label: "Languages",
    description: "Multi-script OCR with context awareness",
    color: "text-agent-linguist",
    bgColor: "bg-agent-linguist/10",
  },
];

export const ImpactStats = () => {
  return (
    <section id="stats" className="py-16 bg-gradient-to-b from-background to-secondary/20">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Powered by ERNIE Multimodal AI
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A multi-agent system combining PaddleOCR-VL vision and ERNIE 4.5 language models.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className={cn(
                "p-4 md:p-6 text-center border-border/50 hover:border-accent/50 transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-1"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn("p-3 rounded-xl w-fit mx-auto mb-3", stat.bgColor)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className={cn("font-serif text-3xl md:text-4xl font-bold mb-1", stat.color)}>
                {stat.value}
              </div>
              <div className="font-medium text-foreground text-sm md:text-base mb-1">
                {stat.label}
              </div>
              <p className="text-xs text-muted-foreground hidden md:block">
                {stat.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
