import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Image, File, Plus, Trash2, Play, Pause, CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

export type FileStatus = "queued" | "processing" | "complete" | "error" | "paused";

export interface QueuedFile {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  confidence?: number;
  error?: string;
  startTime?: number;
  endTime?: number;
}

interface BatchUploadProps {
  onFilesSelect: (files: File[]) => void;
  onStartBatch: () => void;
  onPauseBatch: () => void;
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
  queuedFiles: QueuedFile[];
  isProcessing: boolean;
  isPaused: boolean;
  currentFileIndex: number;
}

export const BatchUpload = ({
  onFilesSelect,
  onStartBatch,
  onPauseBatch,
  onRemoveFile,
  onClearAll,
  queuedFiles,
  isProcessing,
  isPaused,
  currentFileIndex,
}: BatchUploadProps) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesSelect(acceptedFiles);
    }
  }, [onFilesSelect]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
    },
    noClick: queuedFiles.length > 0,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return Image;
    if (file.type === "application/pdf") return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case "queued": return <Clock className="w-4 h-4 text-muted-foreground" />;
      case "processing": return <Loader2 className="w-4 h-4 text-accent animate-spin" />;
      case "complete": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "error": return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "paused": return <Pause className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: FileStatus) => {
    switch (status) {
      case "queued": return "bg-muted text-muted-foreground";
      case "processing": return "bg-accent/20 text-accent";
      case "complete": return "bg-emerald-500/20 text-emerald-600";
      case "error": return "bg-destructive/20 text-destructive";
      case "paused": return "bg-amber-500/20 text-amber-600";
    }
  };

  // Calculate batch stats
  const completedCount = queuedFiles.filter(f => f.status === "complete").length;
  const errorCount = queuedFiles.filter(f => f.status === "error").length;
  const totalCount = queuedFiles.length;
  const batchProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Estimate remaining time (15-30s per doc)
  const remainingDocs = totalCount - completedCount - errorCount;
  const estimatedSecondsRemaining = remainingDocs * 22; // avg 22s per doc
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `~${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `~${mins}m ${secs}s`;
  };

  if (queuedFiles.length === 0) {
    return (
      <Card
        {...getRootProps()}
        className={cn(
          "relative p-8 border-2 border-dashed cursor-pointer transition-all duration-300",
          isDragActive 
            ? "border-accent bg-accent/10 scale-[1.02]" 
            : "border-border hover:border-accent/50 hover:bg-secondary/50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center text-center">
          <div 
            className={cn(
              "p-4 rounded-full mb-4 transition-all duration-300",
              isDragActive ? "bg-accent/20" : "bg-secondary"
            )}
          >
            <Upload 
              className={cn(
                "w-8 h-8 transition-all duration-300",
                isDragActive ? "text-accent scale-110" : "text-muted-foreground"
              )} 
            />
          </div>
          
          <h3 className="font-serif text-xl font-semibold mb-2 text-foreground">
            {isDragActive ? "Drop your documents here" : "Upload Your Archives"}
          </h3>
          
          <p className="text-muted-foreground mb-4 max-w-sm">
            Drag and drop multiple documents, or click to browse. 
            Supports batch processing.
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
              PNG, JPG, WEBP
            </span>
            <span className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
              PDF
            </span>
            <span className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
              Up to 20MB each
            </span>
            <span className="px-3 py-1 rounded-full bg-accent/20 text-xs text-accent font-medium">
              Batch Upload
            </span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Batch Header */}
      <Card className="p-4 border-2 border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Batch Queue</h3>
              <p className="text-sm text-muted-foreground">
                {completedCount}/{totalCount} documents processed
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isProcessing && !isPaused && remainingDocs > 0 && (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatTime(estimatedSecondsRemaining)}
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={open}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Add More
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="gap-1 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>

        {/* Batch Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Batch Progress</span>
            <span>{Math.round(batchProgress)}%</span>
          </div>
          <Progress value={batchProgress} className="h-2" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {!isProcessing ? (
            <Button onClick={onStartBatch} className="gap-2 flex-1">
              <Play className="w-4 h-4" />
              Start Batch ({totalCount} docs)
            </Button>
          ) : isPaused ? (
            <Button onClick={onStartBatch} className="gap-2 flex-1">
              <Play className="w-4 h-4" />
              Resume
            </Button>
          ) : (
            <Button onClick={onPauseBatch} variant="outline" className="gap-2 flex-1">
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}
        </div>
      </Card>

      {/* File Queue */}
      <div {...getRootProps()} className="space-y-2">
        <input {...getInputProps()} />
        
        {queuedFiles.map((qf, index) => {
          const FileIcon = getFileIcon(qf.file);
          const isCurrentFile = index === currentFileIndex && isProcessing;
          
          return (
            <Card
              key={qf.id}
              className={cn(
                "p-3 transition-all duration-300",
                isCurrentFile && "ring-2 ring-accent shadow-lg",
                qf.status === "complete" && "bg-emerald-500/5 border-emerald-500/30",
                qf.status === "error" && "bg-destructive/5 border-destructive/30"
              )}
            >
              <div className="flex items-center gap-3">
                {/* File Icon */}
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isCurrentFile ? "bg-accent/20" : "bg-secondary"
                )}>
                  <FileIcon className={cn(
                    "w-5 h-5",
                    isCurrentFile ? "text-accent" : "text-muted-foreground"
                  )} />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-foreground truncate">
                      {qf.file.name}
                    </p>
                    <Badge className={cn("text-xs", getStatusColor(qf.status))}>
                      {getStatusIcon(qf.status)}
                      <span className="ml-1 capitalize">{qf.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(qf.file.size)}
                    </span>
                    
                    {qf.status === "complete" && qf.confidence && (
                      <span className="text-xs text-emerald-600">
                        {qf.confidence.toFixed(1)}% confidence
                      </span>
                    )}
                    
                    {qf.status === "error" && qf.error && (
                      <span className="text-xs text-destructive truncate">
                        {qf.error}
                      </span>
                    )}
                  </div>

                  {/* Individual Progress */}
                  {qf.status === "processing" && (
                    <Progress value={qf.progress} className="h-1 mt-2" />
                  )}
                </div>

                {/* Remove Button */}
                {qf.status !== "processing" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(qf.id);
                    }}
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Drop Zone Hint */}
      {isDragActive && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Card className="p-8 border-2 border-dashed border-accent bg-accent/10 animate-pulse">
            <div className="flex flex-col items-center text-center">
              <Upload className="w-12 h-12 text-accent mb-4" />
              <p className="text-lg font-semibold text-accent">Drop to add to queue</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
