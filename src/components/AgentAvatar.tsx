import { cn } from "@/lib/utils";
import { Scan, BookOpen, Languages, ShieldCheck, Wrench } from "lucide-react";

export type AgentType = "scanner" | "linguist" | "historian" | "validator" | "repair_advisor";

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
    role: "PaddleOCR-VL",
    color: "bg-agent-scanner",
    bgColor: "bg-agent-scanner-bg",
    borderColor: "border-agent-scanner",
    glowClass: "glow-scanner",
  },
  linguist: {
    icon: Languages,
    name: "Linguist",
    role: "ERNIE + Doke + Culture",
    color: "bg-agent-linguist",
    bgColor: "bg-agent-linguist-bg",
    borderColor: "border-agent-linguist",
    glowClass: "glow-linguist",
  },
  historian: {
    icon: BookOpen,
    name: "Historian",
    role: "ERNIE + 1888-1923",
    color: "bg-agent-historian",
    bgColor: "bg-agent-historian-bg",
    borderColor: "border-agent-historian",
    glowClass: "glow-historian",
  },
  validator: {
    icon: ShieldCheck,
    name: "Validator",
    role: "ERNIE + Anti-Hallucination",
    color: "bg-agent-validator",
    bgColor: "bg-agent-validator-bg",
    borderColor: "border-agent-validator",
    glowClass: "glow-validator",
  },
  repair_advisor: {
    icon: Wrench,
    name: "Repair",
    role: "ERNIE + Conservation",
    color: "bg-agent-repair",
    bgColor: "bg-agent-repair-bg",
    borderColor: "border-agent-repair",
    glowClass: "glow-repair",
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
  
  // Guard against undefined agent
  if (!config) {
    return (
      <div className={cn(
        "rounded-full flex items-center justify-center bg-muted",
        sizeClasses[size]
      )}>
        <Scan className={cn(iconSizes[size], "text-muted-foreground")} />
      </div>
    );
  }
  
  const Icon = config.icon;

  return (
    <div className="relative">
      <div
        className={cn(
          "rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden",
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
            isTyping ? "bg-accent animate-pulse" : "bg-agent-validator"
          )} 
        />
      )}
    </div>
  );
};

export const AgentInfo = ({ agent }: { agent: AgentType }) => {
  const config = agentConfig[agent];
  
  // Guard against undefined agent
  if (!config) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <AgentAvatar agent={agent} size="sm" isActive />
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-foreground text-xs truncate">Unknown</h4>
          <p className="text-xs text-muted-foreground truncate">Agent</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 min-w-0">
      <AgentAvatar agent={agent} size="sm" isActive />
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-foreground text-xs truncate">{config.name}</h4>
        <p className="text-xs text-muted-foreground truncate">{config.role}</p>
      </div>
    </div>
  );
};

export { agentConfig };
