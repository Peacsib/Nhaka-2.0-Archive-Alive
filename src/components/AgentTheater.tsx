import { useState, useEffect, useRef } from "react";
import { AgentMessage, TypingIndicator } from "./AgentMessage";
import { AgentAvatar, AgentInfo, AgentType, agentConfig } from "./AgentAvatar";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
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

interface AgentMessageData {
  agent: AgentType;
  message: string;
  confidence?: number;
  document_section?: string;
  is_debate?: boolean;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentTheaterProps {
  isProcessing: boolean;
  isComplete?: boolean;
  onComplete?: () => void;
  documentName?: string;
  onMessagesUpdate?: (messages: Message[]) => void;
  messages?: AgentMessageData[];
}

const defaultDemoMessages: Omit<Message, "id" | "timestamp">[] = [
  { agent: "scanner", message: "🔬 Initializing PaddleOCR-VL forensic scan...", confidence: 0 },
  { agent: "scanner", message: "📄 Document loaded. Analyzing ink degradation patterns.", documentSection: "Image Analysis" },
  { agent: "scanner", message: "📝 OCR extraction complete: 450 characters extracted.", confidence: 82 },
  { agent: "linguist", message: "📚 Initializing Doke Orthography analysis (1931-1955 reference)..." },
  { agent: "linguist", message: "🔤 Scanning for Pre-1955 Shona phonetic markers...", documentSection: "Orthography Scan", confidence: 75 },
  { agent: "linguist", message: "📜 HISTORICAL TERMS: 3 colonial-era terms identified.", confidence: 82 },
  { agent: "historian", message: "📜 Initializing historical analysis engine (1888-1923 database)..." },
  { agent: "historian", message: "👤 KEY FIGURES: Lobengula, Rudd, Jameson detected.", confidence: 88 },
  { agent: "historian", message: "⚡ CROSS-VERIFIED: Document aligns with Rudd Concession (Oct 30, 1888).", confidence: 92, isDebate: true },
  { agent: "validator", message: "🔍 Initializing hallucination detection protocols..." },
  { agent: "validator", message: "🔄 Cross-referencing Scanner↔Linguist↔Historian outputs...", documentSection: "Cross-Validation" },
  { agent: "validator", message: "✓ No cross-agent inconsistencies detected.", confidence: 85 },
  { agent: "validator", message: "📈 FINAL CONFIDENCE SCORE: 78.5%", confidence: 78.5 },
  { agent: "repair_advisor", message: "🔧 Initializing physical condition assessment..." },
  { agent: "repair_advisor", message: "🔍 DAMAGE DETECTED: 2 conservation issues identified.", confidence: 80, isDebate: true },
  { agent: "repair_advisor", message: "   🔴 Iron-gall ink corrosion: Calcium phytate treatment recommended", documentSection: "Repair Recommendation" },
  { agent: "repair_advisor", message: "📸 DIGITIZATION PRIORITY: HIGH (85%) - Immediate scanning recommended", confidence: 85 },
];

export const AgentTheater = ({ isProcessing, isComplete, onComplete, documentName, onMessagesUpdate, messages: externalMessages }: AgentTheaterProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTyping, setCurrentTyping] = useState<AgentType | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeAgent, setActiveAgent] = useState<AgentType>("scanner");
  const [mobileTimelineOpen, setMobileTimelineOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const processedCount = useRef(0);

  // Handle external messages from SSE stream
  useEffect(() => {
    if (externalMessages && externalMessages.length > 0) {
      // Deduplicate messages - skip if message text is very similar to previous
      const seenMessages = new Set<string>();
      const deduplicatedMessages: Message[] = [];
      
      for (let idx = 0; idx < externalMessages.length; idx++) {
        const msg = externalMessages[idx];
        // Create a key based on agent + first 50 chars of message
        const msgKey = `${msg.agent}-${msg.message.slice(0, 50)}`;
        
        // Skip duplicate "Initializing" messages from same agent
        if (msg.message.toLowerCase().includes('initializing') && seenMessages.has(`${msg.agent}-init`)) {
          continue;
        }
        if (msg.message.toLowerCase().includes('initializing')) {
          seenMessages.add(`${msg.agent}-init`);
        }
        
        // Skip if exact same message key seen before
        if (seenMessages.has(msgKey)) {
          continue;
        }
        seenMessages.add(msgKey);
        
        deduplicatedMessages.push({
          id: `msg-${idx}-${msg.agent}`,
          agent: msg.agent,
          message: msg.message,
          timestamp: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          confidence: msg.confidence,
          documentSection: msg.document_section,
          isDebate: msg.is_debate,
        });
      }
      
      setMessages(deduplicatedMessages);
      
      // Update active agent based on last message
      if (deduplicatedMessages.length > 0) {
        setActiveAgent(deduplicatedMessages[deduplicatedMessages.length - 1].agent);
      }
      
      // Calculate progress based on agent stages - ONLY INCREASES
      const agentOrder: AgentType[] = ["scanner", "linguist", "historian", "validator", "repair_advisor"];
      const lastAgent = deduplicatedMessages[deduplicatedMessages.length - 1]?.agent;
      const agentIndex = agentOrder.indexOf(lastAgent);
      
      // Each agent = 20%, progress within agent based on message count for that agent
      const agentProgress = agentIndex >= 0 ? ((agentIndex + 1) / agentOrder.length) * 100 : 0;
      
      setProgress(prev => {
        // Never decrease progress
        const newProgress = isComplete ? 100 : Math.min(agentProgress, 95);
        return Math.max(prev, newProgress);
      });
    }
  }, [externalMessages, isComplete]);

  // Set progress to 100 when complete
  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      setCurrentTyping(null);
    }
  }, [isComplete]);

  // Demo mode - only runs if no external messages
  useEffect(() => {
    if (!isProcessing || (externalMessages && externalMessages.length > 0)) {
      // Only reset if not complete and no messages
      if (!isProcessing && !isComplete && !externalMessages?.length && messages.length === 0) {
        setMessages([]);
        setProgress(0);
        processedCount.current = 0;
      }
      return;
    }

    const messagesToUse = defaultDemoMessages;
    let messageIndex = 0;
    
    const addNextMessage = () => {
      if (messageIndex >= messagesToUse.length) {
        setCurrentTyping(null);
        setProgress(100);
        onComplete?.();
        return;
      }

      const msg = messagesToUse[messageIndex];
      setActiveAgent(msg.agent);
      setCurrentTyping(msg.agent);

      // Show typing for a moment
      setTimeout(() => {
        const newMessage: Message = {
          id: `msg-${messageIndex}`,
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
        setProgress(((messageIndex + 1) / messagesToUse.length) * 100);
        messageIndex++;

        // Schedule next message
        setTimeout(addNextMessage, 1200 + Math.random() * 800);
      }, 800 + Math.random() * 400);
    };

    // Start the sequence
    const timer = setTimeout(addNextMessage, 500);
    return () => clearTimeout(timer);
  }, [isProcessing, isComplete, onComplete, externalMessages, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      // Scroll the parent ScrollArea viewport to show latest messages
      const viewport = scrollRef.current.closest('[data-radix-scroll-area-viewport]');
      if (viewport) {
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight;
        });
      }
    }
  }, [messages, currentTyping, activeAgent]);

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
      <div className="hidden md:flex gap-2 p-3 border-b border-border bg-muted/30 overflow-x-auto">
        {(["scanner", "linguist", "historian", "validator", "repair_advisor"] as AgentType[]).map((agent) => (
          <div
            key={agent}
            className={cn(
              "flex-1 min-w-0 p-2 rounded-lg transition-all duration-300",
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
            {activeAgent && agentConfig[activeAgent] && (
              <span className="text-xs text-muted-foreground">
                {agentConfig[activeAgent].role}
              </span>
            )}
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
          mobileTimelineOpen ? "max-h-48" : "max-h-0"
        )}>
          <div className="p-3 space-y-2 bg-muted/20">
            {(["scanner", "linguist", "historian", "validator", "repair_advisor"] as AgentType[]).map((agent, idx) => (
              <div
                key={agent}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-all",
                  activeAgent === agent ? "bg-secondary ring-1 ring-accent/50" : "opacity-60"
                )}
              >
                <div className="relative">
                  <AgentAvatar agent={agent} size="sm" isActive={activeAgent === agent} />
                  {idx < 4 && (
                    <div className="absolute top-full left-1/2 w-0.5 h-3 bg-border -translate-x-1/2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">{agent.replace('_', ' ')}</p>
                  {agentConfig[agent] && (
                    <p className="text-xs text-muted-foreground truncate">{agentConfig[agent].role}</p>
                  )}
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
      <ScrollArea className="h-[300px] md:h-[400px]">
        <div className="p-4 space-y-3" ref={scrollRef}>
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
