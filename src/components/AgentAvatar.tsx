import { cn } from "@/lib/utils";
import { Scan, BookOpen, Wand2, Languages, ShieldCheck } from "lucide-react";

export type AgentType = "scanner" | "linguist" | "historian" | "validator" | "reconstructor";

interface AgentAvatarProps {
  agent: AgentType;
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
  isTyping?: boolean;
}

const agentConfig: Record<AgentType, {
  icon: typeof Scan;
  name: string;
  role: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowClass: string;
}> = {
  scanner: {
    icon: Scan,
    name: "Scanner",
    role: "OCR Specialist",
    color: "bg-agent-scanner",
    bgColor: "bg-agent-scanner-bg",
    borderColor: "border-agent-scanner",
    glowClass: "glow-scanner",
  },
  linguist: {
    icon: Languages,
    name: "Linguist",
    role: "Language Expert",
    color: "bg-agent-linguist",
    bgColor: "bg-agent-linguist-bg",
    borderColor: "border-agent-linguist",
    glowClass: "glow-linguist",
  },
  historian: {
    icon: BookOpen,
    name: "Historian",
    role: "Historical Context",
    color: "bg-agent-historian",
    bgColor: "bg-agent-historian-bg",
    borderColor: "border-agent-historian",
    glowClass: "glow-historian",
  },
  validator: {
    icon: ShieldCheck,
    name: "Validator",
    role: "Fact Checker",
    color: "bg-agent-validator",
    bgColor: "bg-agent-validator-bg",
    borderColor: "border-agent-validator",
    glowClass: "glow-validator",
  },
  reconstructor: {
    icon: Wand2,
    name: "Reconstructor",
    role: "Document Artist",
    color: "bg-agent-reconstructor",
    bgColor: "bg-agent-reconstructor-bg",
    borderColor: "border-agent-reconstructor",
    glowClass: "glow-reconstructor",
  },
};

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export const AgentAvatar = ({ 
  agent, 
  size = "md", 
  isActive = false,
  isTyping = false 
}: AgentAvatarProps) => {
  const config = agentConfig[agent];
  const Icon = config.icon;

  return (
    <div className="relative">
      <div
        className={cn(
          "rounded-full flex items-center justify-center transition-all duration-300",
          sizeClasses[size],
          config.color,
          isActive && config.glowClass,
          isActive && "ring-2 ring-offset-2 ring-offset-background",
          isActive && config.borderColor.replace("border-", "ring-")
        )}
      >
        <Icon className={cn(iconSizes[size], "text-primary-foreground")} />
      </div>
      
      {/* Typing/Active Indicator */}
      {(isActive || isTyping) && (
        <span 
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
            isTyping ? "bg-accent animate-pulse" : "bg-agent-reconstructor"
          )} 
        />
      )}
    </div>
  );
};

export const AgentInfo = ({ agent }: { agent: AgentType }) => {
  const config = agentConfig[agent];
  
  return (
    <div className="flex items-center gap-3">
      <AgentAvatar agent={agent} size="md" isActive />
      <div>
        <h4 className="font-semibold text-foreground">{config.name}</h4>
        <p className="text-sm text-muted-foreground italic">{config.role}</p>
      </div>
    </div>
  );
};

export { agentConfig };
