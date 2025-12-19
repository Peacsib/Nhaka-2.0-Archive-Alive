import { useState, useEffect, useRef } from "react";
import { AgentMessage, TypingIndicator } from "./AgentMessage";
import { AgentAvatar, AgentInfo, AgentType, agentConfig } from "./AgentAvatar";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { InlineConfidence } from "./ConfidenceIndicator";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Message {
  id: string;
  agent: AgentType;
  message: string;
  timestamp: string;
  confidence?: number;
  documentSection?: string;
  isDebate?: boolean;
}

interface AgentTheaterProps {
  isProcessing: boolean;
  onComplete?: () => void;
  documentName?: string;
  onMessagesUpdate?: (messages: Message[]) => void;
}

const demoMessages: Omit<Message, "id" | "timestamp">[] = [
  { agent: "scanner", message: "Initializing document analysis... Detecting image format and quality metrics.", confidence: 0 },
  { agent: "scanner", message: "Handwritten script detected. Estimating era: 1940s based on ink patterns and paper degradation.", documentSection: "Header region" },
  { agent: "scanner", message: "OCR confidence: 73% overall. Flagging 12 unclear sections for collaborative review.", confidence: 73 },
  { agent: "scanner", message: "Marginal annotations detected in left margin. May contain significant context.", documentSection: "Left margin" },
  { agent: "historian", message: "Analyzing extracted text fragments... Cross-referencing with historical databases." },
  { agent: "historian", message: "Date markers suggest wartime correspondence, likely 1943-1944 European theater.", documentSection: "Date line" },
  { agent: "historian", message: "The unclear word in line 7 appears to be 'rations' based on contextual analysis of wartime vocabulary.", documentSection: "Line 7", confidence: 82 },
  { agent: "historian", message: "Found reference to 'Camp Edwards' - this was a major US Army training facility during WWII." },
  { agent: "scanner", message: "⚡ CROSS-VERIFICATION: Re-analyzing flagged section with Historian's context. New OCR confidence: 84%.", confidence: 84, isDebate: true },
  { agent: "reconstructor", message: "Beginning synthesis of Scanner and Historian findings..." },
  { agent: "reconstructor", message: "Reconstructing damaged sections using period-appropriate language patterns.", documentSection: "Damaged sections" },
  { agent: "historian", message: "⚠️ DEBATE: I suggest 'rationing' instead of 'rations' given the sentence structure.", isDebate: true },
  { agent: "reconstructor", message: "✓ RESOLUTION: Accepting 'rationing' - grammatical context supports Historian's interpretation.", isDebate: true, confidence: 91 },
  { agent: "reconstructor", message: "Applying confidence markers: ██ = high confidence, ░░ = reconstructed from context." },
  { agent: "reconstructor", message: "Final document ready. Overall confidence: 89%. 3 sections marked as interpretive.", confidence: 89 },
];

export const AgentTheater = ({ isProcessing, onComplete, documentName, onMessagesUpdate }: AgentTheaterProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTyping, setCurrentTyping] = useState<AgentType | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeAgent, setActiveAgent] = useState<AgentType>("scanner");
  const [mobileTimelineOpen, setMobileTimelineOpen] = useState(false);
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
          confidence: msg.confidence,
          documentSection: msg.documentSection,
          isDebate: msg.isDebate,
        };

        setMessages((prev) => {
          const updated = [...prev, newMessage];
          onMessagesUpdate?.(updated);
          return updated;
        });
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
    <Card className="overflow-hidden border-2 border-border bg-gradient-to-b from-card to-card/80 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-secondary/30 to-secondary/10">
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

      {/* Desktop Agent Status Bar */}
      <div className="hidden md:flex gap-4 p-3 border-b border-border bg-muted/30">
        {(["scanner", "historian", "reconstructor"] as AgentType[]).map((agent) => (
          <div
            key={agent}
            className={cn(
              "flex-1 p-2 rounded-lg transition-all duration-300",
              activeAgent === agent ? "bg-secondary ring-1 ring-accent shadow-sm" : "opacity-50"
            )}
          >
            <AgentInfo agent={agent} />
          </div>
        ))}
      </div>

      {/* Mobile Agent Timeline Toggle */}
      <div className="md:hidden border-b border-border">
        <button
          onClick={() => setMobileTimelineOpen(!mobileTimelineOpen)}
          className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", `bg-agent-${activeAgent}`)} />
            <span className="text-sm font-medium capitalize">{activeAgent}</span>
            <span className="text-xs text-muted-foreground">
              {agentConfig[activeAgent].role}
            </span>
          </div>
          {mobileTimelineOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        
        {/* Mobile Timeline Expanded */}
        <div className={cn(
          "overflow-hidden transition-all duration-300",
          mobileTimelineOpen ? "max-h-40" : "max-h-0"
        )}>
          <div className="p-3 space-y-2 bg-muted/20">
            {(["scanner", "historian", "reconstructor"] as AgentType[]).map((agent, idx) => (
              <div
                key={agent}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-all",
                  activeAgent === agent ? "bg-secondary ring-1 ring-accent/50" : "opacity-60"
                )}
              >
                <div className="relative">
                  <AgentAvatar agent={agent} size="sm" isActive={activeAgent === agent} />
                  {idx < 2 && (
                    <div className="absolute top-full left-1/2 w-0.5 h-3 bg-border -translate-x-1/2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">{agent}</p>
                  <p className="text-xs text-muted-foreground truncate">{agentConfig[agent].role}</p>
                </div>
                {activeAgent === agent && isProcessing && (
                  <div className="typing-indicator flex gap-1">
                    <span className="w-1.5 h-1.5" />
                    <span className="w-1.5 h-1.5" />
                    <span className="w-1.5 h-1.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="h-[300px] md:h-[400px]" ref={scrollRef}>
        <div className="p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={cn(msg.isDebate && "relative")}>
              {msg.isDebate && (
                <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-accent to-transparent rounded-full" />
              )}
              <AgentMessage
                agent={msg.agent}
                message={msg.message}
                timestamp={msg.timestamp}
                animateIn
                delay={0}
                confidence={msg.confidence}
                documentSection={msg.documentSection}
                isDebate={msg.isDebate}
              />
            </div>
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
