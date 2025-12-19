import { cn } from "@/lib/utils";
import { AgentAvatar, AgentType, agentConfig } from "./AgentAvatar";
import { useEffect, useState } from "react";
import { InlineConfidence } from "./ConfidenceIndicator";

interface AgentMessageProps {
  agent: AgentType;
  message: string;
  timestamp?: string;
  isTyping?: boolean;
  animateIn?: boolean;
  delay?: number;
  confidence?: number;
  documentSection?: string;
  isDebate?: boolean;
}

export const AgentMessage = ({
  agent,
  message,
  timestamp,
  isTyping = false,
  animateIn = true,
  delay = 0,
  confidence,
  documentSection,
  isDebate = false,
}: AgentMessageProps) => {
  const config = agentConfig[agent];
  const [visible, setVisible] = useState(!animateIn);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (animateIn) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [animateIn, delay]);

  useEffect(() => {
    if (visible && !isTyping) {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText(message.slice(0, index + 1));
        index++;
        if (index >= message.length) {
          clearInterval(interval);
        }
      }, 15);
      return () => clearInterval(interval);
    }
  }, [visible, message, isTyping]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl transition-all duration-500",
        isDebate ? "bg-gradient-to-r from-accent/10 to-transparent" : config.bgColor,
        "border-l-4",
        isDebate ? "border-accent" : config.borderColor,
        animateIn && "animate-slide-in-left"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <AgentAvatar agent={agent} size="sm" isActive isTyping={isTyping} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-sm text-foreground">
            {config.name}
          </span>
          <span className="text-xs text-muted-foreground italic">
            {config.role}
          </span>
          {documentSection && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              📍 {documentSection}
            </span>
          )}
          {confidence !== undefined && confidence > 0 && (
            <InlineConfidence value={confidence} />
          )}
          {timestamp && (
            <span className="text-xs text-muted-foreground ml-auto">
              {timestamp}
            </span>
          )}
        </div>
        
        <div className={cn(
          "font-mono text-sm leading-relaxed",
          isDebate ? "text-foreground font-medium" : "text-foreground/90"
        )}>
          {isTyping ? (
            <div className="typing-indicator flex gap-1 py-2">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <span>{displayedText}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const TypingIndicator = ({ agent }: { agent: AgentType }) => {
  const config = agentConfig[agent];
  
  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl",
        config.bgColor,
        "border-l-4",
        config.borderColor
      )}
    >
      <AgentAvatar agent={agent} size="sm" isTyping />
      <div className="flex items-center">
        <div className="typing-indicator flex gap-1" style={{ color: `hsl(var(--agent-${agent}))` }}>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
};
