import { Card } from "./ui/card";
import { Library, Users, Globe, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    icon: Users,
    value: "2B+",
    label: "People Affected",
    description: "Family histories at risk of being lost",
    color: "text-agent-scanner",
    bgColor: "bg-agent-scanner/10",
  },
  {
    icon: Library,
    value: "50M+",
    label: "Documents Fading",
    description: "Archives worldwide need preservation",
    color: "text-agent-historian",
    bgColor: "bg-agent-historian/10",
  },
  {
    icon: DollarSign,
    value: "$50B",
    label: "Heritage at Risk",
    description: "Economic value of cultural artifacts",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Globe,
    value: "7000+",
    label: "Languages",
    description: "Scripts and dialects need preservation",
    color: "text-agent-reconstructor",
    bgColor: "bg-agent-reconstructor/10",
  },
];

export const ImpactStats = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            The Preservation Crisis
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every day, irreplaceable documents fade into illegibility. We're racing against time.
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
