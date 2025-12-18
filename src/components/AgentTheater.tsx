import { useState, useEffect, useRef } from "react";
import { AgentMessage, TypingIndicator } from "./AgentMessage";
import { AgentInfo, AgentType } from "./AgentAvatar";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  agent: AgentType;
  message: string;
  timestamp: string;
}

interface AgentTheaterProps {
  isProcessing: boolean;
  onComplete?: () => void;
  documentName?: string;
}

const demoMessages: Omit<Message, "id" | "timestamp">[] = [
  { agent: "scanner", message: "Initializing document analysis... Detecting image format and quality metrics." },
  { agent: "scanner", message: "Handwritten script detected. Estimating era: 1940s based on ink patterns and paper degradation." },
  { agent: "scanner", message: "OCR confidence: 73% overall. Flagging 12 unclear sections for collaborative review." },
  { agent: "scanner", message: "Marginal annotations detected in left margin. May contain significant context." },
  { agent: "historian", message: "Analyzing extracted text fragments... Cross-referencing with historical databases." },
  { agent: "historian", message: "Date markers suggest wartime correspondence, likely 1943-1944 European theater." },
  { agent: "historian", message: "The unclear word in line 7 appears to be 'rations' based on contextual analysis of wartime vocabulary." },
  { agent: "historian", message: "Found reference to 'Camp Edwards' - this was a major US Army training facility during WWII." },
  { agent: "scanner", message: "Re-analyzing flagged section with adjusted contrast. New OCR confidence: 84%." },
  { agent: "reconstructor", message: "Beginning synthesis of Scanner and Historian findings..." },
  { agent: "reconstructor", message: "Reconstructing damaged sections using period-appropriate language patterns." },
  { agent: "reconstructor", message: "Applying confidence markers: ██ = high confidence, ░░ = reconstructed from context." },
  { agent: "reconstructor", message: "Final document ready. Overall confidence: 89%. 3 sections marked as interpretive." },
];

export const AgentTheater = ({ isProcessing, onComplete, documentName }: AgentTheaterProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTyping, setCurrentTyping] = useState<AgentType | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeAgent, setActiveAgent] = useState<AgentType>("scanner");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageIndex = useRef(0);

  useEffect(() => {
    if (!isProcessing) {
      setMessages([]);
      setProgress(0);
      messageIndex.current = 0;
      return;
    }

    const addNextMessage = () => {
      if (messageIndex.current >= demoMessages.length) {
        setCurrentTyping(null);
        setProgress(100);
        onComplete?.();
        return;
      }

      const msg = demoMessages[messageIndex.current];
      setActiveAgent(msg.agent);
      setCurrentTyping(msg.agent);

      // Show typing for a moment
      setTimeout(() => {
        const newMessage: Message = {
          id: `msg-${messageIndex.current}`,
          agent: msg.agent,
          message: msg.message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, newMessage]);
        setCurrentTyping(null);
        setProgress(((messageIndex.current + 1) / demoMessages.length) * 100);
        messageIndex.current++;

        // Schedule next message
        setTimeout(addNextMessage, 1200 + Math.random() * 800);
      }, 800 + Math.random() * 400);
    };

    // Start the sequence
    const timer = setTimeout(addNextMessage, 500);
    return () => clearTimeout(timer);
  }, [isProcessing, onComplete]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentTyping]);

  return (
    <Card className="overflow-hidden border-2 border-border bg-card/80 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-agent-scanner animate-pulse-soft" />
            <h3 className="font-serif text-lg font-semibold">Agent Theater</h3>
          </div>
          {documentName && (
            <Badge variant="secondary" className="font-mono text-xs">
              {documentName}
            </Badge>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Processing Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Agent Status Bar */}
      <div className="flex gap-4 p-3 border-b border-border bg-muted/30">
        {(["scanner", "historian", "reconstructor"] as AgentType[]).map((agent) => (
          <div
            key={agent}
            className={cn(
              "flex-1 p-2 rounded-lg transition-all duration-300",
              activeAgent === agent ? "bg-secondary ring-1 ring-accent" : "opacity-50"
            )}
          >
            <AgentInfo agent={agent} />
          </div>
        ))}
      </div>

      {/* Messages Area */}
      <ScrollArea className="h-[400px]" ref={scrollRef}>
        <div className="p-4 space-y-3">
          {messages.map((msg, index) => (
            <AgentMessage
              key={msg.id}
              agent={msg.agent}
              message={msg.message}
              timestamp={msg.timestamp}
              animateIn
              delay={0}
            />
          ))}
          
          {currentTyping && <TypingIndicator agent={currentTyping} />}
          
          {!isProcessing && messages.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="font-serif text-lg italic">
                Upload a document to watch the agents collaborate...
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
