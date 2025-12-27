import { useState, useEffect, useRef } from "react";
import { AgentAvatar, AgentType, agentConfig } from "./AgentAvatar";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

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

// WhatsApp color palette
const WHATSAPP_COLORS = {
  background: "#ECE5DD", // Light beige background
  myMessage: "#DCF8C6", // Light green for sent messages
  theirMessage: "#FFFFFF", // White for received messages
  teal: "#075E54", // WhatsApp teal
  green: "#25D366", // WhatsApp green
  timestamp: "#667781", // Gray for timestamps
};

export const AgentTheater = ({ 
  isProcessing, 
  isComplete, 
  onComplete, 
  documentName, 
  onMessagesUpdate, 
  messages: externalMessages 
}: AgentTheaterProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingAgent, setTypingAgent] = useState<AgentType | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle external messages from SSE stream
  useEffect(() => {
    if (externalMessages && externalMessages.length > 0) {
      const seenMessages = new Set<string>();
      const deduplicatedMessages: Message[] = [];
      
      for (let idx = 0; idx < externalMessages.length; idx++) {
        const msg = externalMessages[idx];
        const msgKey = `${msg.agent}-${msg.message.slice(0, 50)}`;
        
        if (msg.message.toLowerCase().includes('initializing') && seenMessages.has(`${msg.agent}-init`)) {
          continue;
        }
        if (msg.message.toLowerCase().includes('initializing')) {
          seenMessages.add(`${msg.agent}-init`);
        }
        
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
      
      // Show typing indicator for last agent
      if (isProcessing && !isComplete && deduplicatedMessages.length > 0) {
        setTypingAgent(deduplicatedMessages[deduplicatedMessages.length - 1].agent);
      } else {
        setTypingAgent(null);
      }
    }
  }, [externalMessages, isComplete, isProcessing]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.closest('[data-radix-scroll-area-viewport]');
      if (viewport) {
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight;
        });
      }
    }
  }, [messages, typingAgent]);

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* WhatsApp Header */}
      <div 
        className="p-3 flex items-center gap-3"
        style={{ backgroundColor: WHATSAPP_COLORS.teal }}
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
          AI
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm">Agent Collaboration</h3>
          <p className="text-xs text-white/80">
            {isProcessing ? (
              <>
                {typingAgent && agentConfig[typingAgent] ? (
                  <>{agentConfig[typingAgent].name} is typing...</>
                ) : (
                  <>5 agents working...</>
                )}
              </>
            ) : isComplete ? (
              <>Analysis complete</>
            ) : (
              <>Ready to analyze</>
            )}
          </p>
        </div>
      </div>

      {/* WhatsApp Background Pattern */}
      <div 
        className="relative"
        style={{ 
          backgroundColor: WHATSAPP_COLORS.background,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <ScrollArea className="h-[400px] md:h-[500px]">
          <div className="p-4 space-y-2" ref={scrollRef}>
            {messages.length === 0 && !isProcessing && (
              <div className="flex items-center justify-center h-full py-20">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white/50 flex items-center justify-center">
                    <span className="text-3xl">💬</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Upload a document to see agents collaborate
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => {
              const agent = agentConfig[msg.agent];
              const isDebate = msg.isDebate;
              
              return (
                <div key={msg.id} className="animate-in slide-in-from-bottom-2 duration-300">
                  {/* Agent name (like WhatsApp group chat) */}
                  <div className="flex items-center gap-2 mb-1 ml-14">
                    <span 
                      className="text-xs font-semibold"
                      style={{ color: agent?.color || WHATSAPP_COLORS.teal }}
                    >
                      {agent?.name || msg.agent}
                    </span>
                  </div>

                  {/* Message bubble */}
                  <div className="flex items-start gap-2">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <AgentAvatar agent={msg.agent} size="sm" />
                    </div>

                    {/* Message content */}
                    <div className="flex-1 max-w-[85%]">
                      <div
                        className={cn(
                          "rounded-lg px-3 py-2 shadow-sm relative",
                          isDebate && "ring-2 ring-green-400/50"
                        )}
                        style={{
                          backgroundColor: WHATSAPP_COLORS.theirMessage,
                        }}
                      >
                        {/* Debate badge */}
                        {isDebate && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                            🤝 Collaborating
                          </div>
                        )}

                        {/* Message text */}
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>

                        {/* Confidence badge */}
                        {msg.confidence !== undefined && msg.confidence > 0 && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-gray-500">
                            <span className="font-medium">{msg.confidence.toFixed(0)}% confident</span>
                          </div>
                        )}

                        {/* Timestamp and checkmarks */}
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span 
                            className="text-[11px]"
                            style={{ color: WHATSAPP_COLORS.timestamp }}
                          >
                            {msg.timestamp}
                          </span>
                          {idx === messages.length - 1 && isComplete && (
                            <CheckCheck className="w-3 h-3" style={{ color: "#53BDEB" }} />
                          )}
                          {idx < messages.length - 1 && (
                            <CheckCheck className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator (WhatsApp style) */}
            {typingAgent && (
              <div className="flex items-start gap-2 animate-in fade-in duration-300">
                <div className="flex-shrink-0">
                  <AgentAvatar agent={typingAgent} size="sm" />
                </div>
                <div 
                  className="rounded-lg px-4 py-3 shadow-sm"
                  style={{ backgroundColor: WHATSAPP_COLORS.theirMessage }}
                >
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* WhatsApp Footer */}
      <div 
        className="p-2 border-t flex items-center gap-2"
        style={{ backgroundColor: "#F0F0F0" }}
      >
        <div className="flex-1 bg-white rounded-full px-4 py-2 text-sm text-gray-500">
          {isProcessing ? "Agents are analyzing..." : isComplete ? "Analysis complete ✓" : "Waiting for document..."}
        </div>
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: WHATSAPP_COLORS.green }}
        >
          <span className="text-white text-lg">🤖</span>
        </div>
      </div>
    </Card>
  );
};
