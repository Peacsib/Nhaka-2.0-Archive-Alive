import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentType, agentConfig } from "./AgentAvatar";

interface NarrationDrawerProps {
  messages: Array<{
    id: string;
    agent: AgentType;
    message: string;
    timestamp: string;
  }>;
  currentAgent?: AgentType | null;
  isOpen: boolean;
  onToggle: () => void;
}

export const NarrationDrawer = ({
  messages,
  currentAgent,
  isOpen,
  onToggle,
}: NarrationDrawerProps) => {
  const latestMessage = messages[messages.length - 1];
  const config = currentAgent ? agentConfig[currentAgent] : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Collapsed Header */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between p-4 bg-card/95 backdrop-blur-md border-t border-border",
          "transition-all duration-300"
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {config && (
            <div className={cn(
              "w-3 h-3 rounded-full animate-pulse",
              `bg-agent-${currentAgent}`
            )} />
          )}
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs text-muted-foreground">
              {currentAgent ? `${config?.name} is analyzing...` : "Waiting for input"}
            </p>
            {latestMessage && (
              <p className="text-sm truncate text-foreground">
                {latestMessage.message}
              </p>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {/* Expanded Content */}
      <div
        className={cn(
          "bg-card/95 backdrop-blur-md border-t border-border overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[50vh]" : "max-h-0"
        )}
      >
        <div className="p-4 space-y-3 max-h-[calc(50vh-60px)] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 italic">
              Upload a document to see agent narration...
            </p>
          ) : (
            messages.map((msg) => {
              const msgConfig = agentConfig[msg.agent];
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "p-3 rounded-lg border-l-2",
                    `border-agent-${msg.agent}`,
                    `bg-agent-${msg.agent}-bg`
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold">{msgConfig.name}</span>
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm font-mono text-foreground/90">{msg.message}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
