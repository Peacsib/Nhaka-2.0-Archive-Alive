import { Card } from "./ui/card";
import { AgentAvatar, AgentType } from "./AgentAvatar";
import { Eye, Zap, Shield, Globe } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Transparent AI",
    description: "Watch the AI think. No black boxes—see exactly how your document is being analyzed and restored.",
  },
  {
    icon: Zap,
    title: "Multi-Agent Collaboration",
    description: "Five specialized agents work together, each bringing unique expertise to the restoration process.",
  },
  {
    icon: Shield,
    title: "Confidence Markers",
    description: "Know exactly what's original and what's reconstructed with clear confidence indicators.",
  },
  {
    icon: Globe,
    title: "Cultural Preservation",
    description: "Help preserve family histories, historical documents, and cultural artifacts for future generations.",
  },
];

const agents: { type: AgentType; description: string }[] = [
  {
    type: "scanner",
    description: "Extracts text with precision using ERNIE 4.0 OCR, identifies unclear sections, and assesses document quality.",
  },
  {
    type: "linguist",
    description: "Expert in Doke Orthography (1931 Shona). Identifies archaic characters like ɓ, ɗ, ȿ, ɀ and maps to modern equivalents.",
  },
  {
    type: "historian",
    description: "Zimbabwean history specialist. Verifies names, dates, and cross-references against 1890s colonial records.",
  },
  {
    type: "validator",
    description: "Cross-checks all findings for accuracy and consistency, ensuring restoration integrity.",
  },
  {
    type: "repair",
    description: "Archival conservator. Analyzes document condition and recommends chemical treatments for preservation.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container px-4 md:px-6">
        {/* Features Grid */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Why Archive Resurrection?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            More than just OCR—a complete document restoration experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-3 rounded-lg bg-accent/10 w-fit mb-4">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Meet the Agents */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Meet Your AI Restoration Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Five specialized agents with distinct personalities, working together to bring your archives back to life.
          </p>
          <a href="/resurrect">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/30 hover:border-accent/50 transition-all duration-300 text-accent font-medium group">
              <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
              See Them Collaborate in Real-Time
            </button>
          </a>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {agents.map((agent, index) => (
            <Card
              key={agent.type}
              className="p-6 text-center hover:shadow-xl transition-all duration-300 group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="mb-4 flex justify-center">
                <AgentAvatar agent={agent.type} size="md" isActive />
              </div>
              <h3 className="font-serif text-xl font-bold mb-1 capitalize">
                {agent.type === "repair" ? "Repair Advisor" : agent.type}
              </h3>
              <p className="text-sm text-accent italic mb-4">
                {agent.type === "scanner" && "The Detective"}
                {agent.type === "linguist" && "The Scholar"}
                {agent.type === "historian" && "The Archivist"}
                {agent.type === "validator" && "The Judge"}
                {agent.type === "repair" && "The Healer"}
              </p>
              <p className="text-muted-foreground text-sm">{agent.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
