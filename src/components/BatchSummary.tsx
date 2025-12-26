import { CheckCircle2, AlertCircle, Clock, TrendingUp, FileText, Download } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";
import type { QueuedFile } from "./BatchUpload";

interface BatchSummaryProps {
  queuedFiles: QueuedFile[];
  onDownloadAll: () => void;
  onViewResult: (fileId: string) => void;
}

export const BatchSummary = ({ queuedFiles, onDownloadAll, onViewResult }: BatchSummaryProps) => {
  const completed = queuedFiles.filter(f => f.status === "complete");
  const failed = queuedFiles.filter(f => f.status === "error");
  const total = queuedFiles.length;
  
  const avgConfidence = completed.length > 0
    ? completed.reduce((sum, f) => sum + (f.confidence || 0), 0) / completed.length
    : 0;
  
  const totalTime = queuedFiles.reduce((sum, f) => {
    if (f.startTime && f.endTime) {
      return sum + (f.endTime - f.startTime);
    }
    return sum;
  }, 0);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (completed.length === 0 && failed.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-emerald-500/20">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold">Batch Complete</h3>
            <p className="text-sm text-muted-foreground">
              {completed.length}/{total} documents processed successfully
            </p>
          </div>
        </div>
        
        <Button onClick={onDownloadAll} className="gap-2">
          <Download className="w-4 h-4" />
          Download All
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-2xl font-bold">{completed.length}</span>
          </div>
          <p className="text-xs text-muted-foreground">Successful</p>
        </div>
        
        {failed.length > 0 && (
          <div className="p-3 rounded-lg bg-destructive/10 text-center">
            <div className="flex items-center justify-center gap-1 text-destructive mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-2xl font-bold">{failed.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
        )}
        
        <div className="p-3 rounded-lg bg-accent/10 text-center">
          <div className="flex items-center justify-center gap-1 text-accent mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-2xl font-bold">{avgConfidence.toFixed(0)}%</span>
          </div>
          <p className="text-xs text-muted-foreground">Avg Confidence</p>
        </div>
        
        <div className="p-3 rounded-lg bg-muted text-center">
          <div className="flex items-center justify-center gap-1 text-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-2xl font-bold">{formatTime(totalTime)}</span>
          </div>
          <p className="text-xs text-muted-foreground">Total Time</p>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground mb-2">Results</p>
        
        {queuedFiles.map((qf) => (
          <div
            key={qf.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50",
              qf.status === "complete" && "bg-emerald-500/5",
              qf.status === "error" && "bg-destructive/5"
            )}
            onClick={() => qf.status === "complete" && onViewResult(qf.id)}
          >
            <div className={cn(
              "p-1.5 rounded-lg",
              qf.status === "complete" ? "bg-emerald-500/20" : "bg-destructive/20"
            )}>
              {qf.status === "complete" ? (
                <FileText className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-destructive" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{qf.file.name}</p>
              {qf.status === "complete" && qf.confidence && (
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={qf.confidence} className="h-1.5 flex-1 max-w-[100px]" />
                  <span className="text-xs text-emerald-600">{qf.confidence.toFixed(1)}%</span>
                </div>
              )}
              {qf.status === "error" && qf.error && (
                <p className="text-xs text-destructive truncate">{qf.error}</p>
              )}
            </div>
            
            {qf.startTime && qf.endTime && (
              <span className="text-xs text-muted-foreground">
                {formatTime(qf.endTime - qf.startTime)}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
