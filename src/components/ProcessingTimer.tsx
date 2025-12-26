import { useState, useEffect, useRef } from "react";
import { Clock, Zap, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStep {
  id: string;
  name: string;
  agent: string;
  estimatedMs: number;
  timeoutMs: number;
  icon: string;
}

// Processing pipeline steps with realistic timing
const PROCESSING_STEPS: ProcessingStep[] = [
  { id: "scanner", name: "Document Scan", agent: "Scanner", estimatedMs: 3000, timeoutMs: 30000, icon: "🔬" },
  { id: "vision", name: "Vision Analysis", agent: "ERNIE 4.5", estimatedMs: 4000, timeoutMs: 30000, icon: "👁️" },
  { id: "ocr", name: "OCR Extraction", agent: "PaddleOCR-VL", estimatedMs: 7000, timeoutMs: 120000, icon: "📝" },
  { id: "linguist", name: "Language Analysis", agent: "Linguist", estimatedMs: 3000, timeoutMs: 20000, icon: "📚" },
  { id: "historian", name: "Historical Context", agent: "Historian", estimatedMs: 3000, timeoutMs: 20000, icon: "📜" },
  { id: "validator", name: "Cross-Validation", agent: "Validator", estimatedMs: 3000, timeoutMs: 25000, icon: "✓" },
  { id: "repair", name: "Repair Analysis", agent: "Advisor", estimatedMs: 2500, timeoutMs: 20000, icon: "🔧" },
  { id: "save", name: "Archive Save", agent: "Supabase", estimatedMs: 1000, timeoutMs: 30000, icon: "💾" },
];

const TOTAL_ESTIMATED_MS = PROCESSING_STEPS.reduce((sum, step) => sum + step.estimatedMs, 0);

type StepStatus = "pending" | "active" | "complete" | "timeout" | "error";

interface ProcessingTimerProps {
  isProcessing: boolean;
  isComplete: boolean;
  currentAgent?: string;
  onTimeout?: () => void;
  className?: string;
}

export const ProcessingTimer = ({
  isProcessing,
  isComplete,
  currentAgent,
  onTimeout,
  className,
}: ProcessingTimerProps) => {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepStartTime, setStepStartTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Map agent names to step IDs
  const agentToStepMap: Record<string, string> = {
    scanner: "scanner",
    linguist: "linguist",
    historian: "historian",
    validator: "validator",
    repair_advisor: "repair",
  };

  // Update current step based on agent
  useEffect(() => {
    if (currentAgent && agentToStepMap[currentAgent]) {
      const stepId = agentToStepMap[currentAgent];
      const stepIndex = PROCESSING_STEPS.findIndex(s => s.id === stepId);
      
      if (stepIndex >= 0 && stepIndex !== currentStepIndex) {
        // Mark previous steps as complete
        const newStatuses: Record<string, StepStatus> = {};
        PROCESSING_STEPS.forEach((step, idx) => {
          if (idx < stepIndex) {
            newStatuses[step.id] = "complete";
          } else if (idx === stepIndex) {
            newStatuses[step.id] = "active";
          } else {
            newStatuses[step.id] = "pending";
          }
        });
        setStepStatuses(newStatuses);
        setCurrentStepIndex(stepIndex);
        setStepStartTime(Date.now());
      }
    }
  }, [currentAgent, currentStepIndex]);

  // Timer logic
  useEffect(() => {
    if (isProcessing && !isComplete) {
      intervalRef.current = setInterval(() => {
        setElapsedMs(prev => prev + 100);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isProcessing, isComplete]);

  // Reset on new processing
  useEffect(() => {
    if (isProcessing && elapsedMs === 0) {
      setStepStatuses({});
      setCurrentStepIndex(0);
      setStepStartTime(Date.now());
    }
  }, [isProcessing, elapsedMs]);

  // Mark all complete when done
  useEffect(() => {
    if (isComplete) {
      const allComplete: Record<string, StepStatus> = {};
      PROCESSING_STEPS.forEach(step => {
        allComplete[step.id] = "complete";
      });
      setStepStatuses(allComplete);
    }
  }, [isComplete]);

  // Check for timeout
  useEffect(() => {
    if (stepStartTime && isProcessing) {
      const currentStep = PROCESSING_STEPS[currentStepIndex];
      const stepElapsed = Date.now() - stepStartTime;
      
      if (stepElapsed > currentStep.timeoutMs) {
        setStepStatuses(prev => ({
          ...prev,
          [currentStep.id]: "timeout"
        }));
        onTimeout?.();
      }
    }
  }, [elapsedMs, stepStartTime, currentStepIndex, isProcessing, onTimeout]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${seconds}s`;
  };

  const estimatedRemaining = Math.max(0, TOTAL_ESTIMATED_MS - elapsedMs);
  const progressPercent = Math.min(100, (elapsedMs / TOTAL_ESTIMATED_MS) * 100);

  const getStepStatus = (stepId: string): StepStatus => {
    return stepStatuses[stepId] || "pending";
  };

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case "pending": return null;
      case "active": return <Loader2 className="w-3 h-3 animate-spin text-accent" />;
      case "complete": return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
      case "timeout": return <AlertTriangle className="w-3 h-3 text-amber-500" />;
      case "error": return <AlertTriangle className="w-3 h-3 text-destructive" />;
    }
  };

  if (!isProcessing && !isComplete) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Timer Display */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <Clock className={cn("w-5 h-5", isProcessing && "text-accent animate-pulse")} />
          )}
          <div>
            <p className="text-sm font-medium">
              {isComplete ? "Complete" : "Processing"}
            </p>
            <p className="text-xs text-muted-foreground">
              Elapsed: {formatTime(elapsedMs)}
            </p>
          </div>
        </div>

        {!isComplete && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Zap className="w-3 h-3" />
              <span>~{formatTime(estimatedRemaining)} remaining</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(progressPercent)}% estimated
            </p>
          </div>
        )}
      </div>

      {/* Step Timeline */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-1">
        {PROCESSING_STEPS.map((step, idx) => {
          const status = getStepStatus(step.id);
          const isActive = status === "active";
          const isCompleted = status === "complete";
          
          return (
            <div
              key={step.id}
              className={cn(
                "relative p-2 rounded-lg text-center transition-all duration-300",
                isActive && "bg-accent/20 ring-1 ring-accent",
                isCompleted && "bg-emerald-500/10",
                status === "timeout" && "bg-amber-500/10",
                status === "pending" && "bg-muted/30 opacity-50"
              )}
            >
              <div className="text-lg mb-1">{step.icon}</div>
              <p className="text-[10px] font-medium truncate">{step.name.split(" ")[0]}</p>
              
              {/* Status indicator */}
              <div className="absolute -top-1 -right-1">
                {getStatusIcon(status)}
              </div>
              
              {/* Connection line */}
              {idx < PROCESSING_STEPS.length - 1 && (
                <div className={cn(
                  "hidden md:block absolute top-1/2 -right-1 w-2 h-0.5 -translate-y-1/2",
                  isCompleted ? "bg-emerald-500" : "bg-border"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Detail */}
      {isProcessing && !isComplete && currentStepIndex < PROCESSING_STEPS.length && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/10 border border-accent/20">
          <Loader2 className="w-4 h-4 text-accent animate-spin" />
          <span className="text-sm">
            <span className="font-medium">{PROCESSING_STEPS[currentStepIndex].agent}</span>
            <span className="text-muted-foreground"> — {PROCESSING_STEPS[currentStepIndex].name}</span>
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            ~{Math.round(PROCESSING_STEPS[currentStepIndex].estimatedMs / 1000)}s typical
          </span>
        </div>
      )}
    </div>
  );
};
