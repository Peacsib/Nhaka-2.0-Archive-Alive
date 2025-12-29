import { useState, useRef, useCallback } from "react";
import { DocumentUpload } from "./DocumentUpload";
import { BatchUpload, QueuedFile, FileStatus } from "./BatchUpload";
import { DocumentPreview } from "./DocumentPreview";
import { AgentTheater } from "./AgentTheater";
import { ProcessingTimer } from "./ProcessingTimer";
import { SampleDocuments } from "./SampleDocuments";
import { ImageComparison } from "./ImageComparison";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Play, RotateCcw, Download, Share2, AlertTriangle, Scan, Zap, X, FileText, CheckCircle2, Settings2, Layers, File as FileIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import bsacDecay from "@/assets/BSAC_Archive_Record_1896.png";
import dokeLinguist from "@/assets/linguist_test.png";
import tandiCertificate from "@/assets/Colonial_Certificate_1957.jpg";
import shanghaiPostcard from "@/assets/Salisbury to China.webp";

const sampleImages: Record<string, string> = {
  decay: bsacDecay,
  linguist: dokeLinguist,
  history: tandiCertificate,
  connection: shanghaiPostcard,
};
import type { AgentType } from "./AgentAvatar";

interface ProcessingSectionProps {
  autoStart?: boolean;
}

interface RepairRecommendation {
  issue: string;
  severity: string;
  recommendation: string;
  estimated_cost?: string;
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

interface DamageHotspot {
  id: number;
  x: number;
  y: number;
  damage_type: string;
  severity: string;
  label: string;
  treatment: string;
  icon: string;
}

interface RestorationSummary {
  document_type: string;
  detected_issues: string[];
  enhancements_applied: string[];
  layout_info: Record<string, unknown>;
  quality_score: number;
  skew_corrected?: boolean;
  shadows_removed?: boolean;
  yellowing_fixed?: boolean;
  text_structure?: Record<string, unknown>;
  image_regions_count?: number;
}

interface ResurrectionResult {
  overall_confidence: number;
  processing_time_ms: number;
  raw_ocr_text?: string;
  transliterated_text?: string;
  archive_id?: string;
  repair_recommendations?: RepairRecommendation[];
  damage_hotspots?: DamageHotspot[];
  restoration_summary?: RestorationSummary;
  enhanced_image_base64?: string;
}

interface StreamCompleteData {
  type: "complete";
  cached?: boolean;
  cache_hash?: string;
  result: ResurrectionResult;
}

const severityColors: Record<string, { bg: string; ring: string }> = {
  critical: { bg: "bg-red-600", ring: "bg-red-500" },
  moderate: { bg: "bg-amber-600", ring: "bg-amber-500" },
  minor: { bg: "bg-green-600", ring: "bg-green-500" },
};

export const ProcessingSection = ({ autoStart = false }: ProcessingSectionProps) => {
  const [uploadMode, setUploadMode] = useState<"single" | "batch">("single");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [agentMessages, setAgentMessages] = useState<AgentMessageData[]>([]);
  const [restoredData, setRestoredData] = useState<{ segments: { text: string; confidence: "high" | "low" }[]; overallConfidence: number } | null>(null);
  const [arMode, setArMode] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [showArOverlay, setShowArOverlay] = useState(false);
  const [damageHotspots, setDamageHotspots] = useState<DamageHotspot[]>([]);
  const [restorationSummary, setRestorationSummary] = useState<RestorationSummary | null>(null);
  const [enhancedImageBase64, setEnhancedImageBase64] = useState<string | null>(null);
  const [currentAgent, setCurrentAgent] = useState<AgentType | undefined>();
  
  // Batch processing state
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [isBatchPaused, setIsBatchPaused] = useState(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [batchResults, setBatchResults] = useState<Map<string, ResurrectionResult>>(new Map());
  
  const sectionRef = useRef<HTMLElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setIsComplete(false);
    setAgentMessages([]);
    setRestoredData(null);
    setArMode(false);
    setShowArOverlay(false);
    setDamageHotspots([]);
    setCurrentAgent(undefined);
  };

  const handleBatchFilesSelect = (files: File[]) => {
    const newQueuedFiles: QueuedFile[] = files.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${file.name}`,
      file,
      status: "queued" as FileStatus,
      progress: 0,
    }));
    setQueuedFiles(prev => [...prev, ...newQueuedFiles]);
  };

  const handleRemoveFile = (id: string) => {
    setQueuedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleClearAll = () => {
    if (isBatchProcessing) {
      abortControllerRef.current?.abort();
    }
    setQueuedFiles([]);
    setIsBatchProcessing(false);
    setIsBatchPaused(false);
    setCurrentBatchIndex(0);
    setBatchResults(new Map());
  };

  const processFile = useCallback(async (file: File, fileId?: string): Promise<ResurrectionResult | null> => {
    const formData = new FormData();
    formData.append("file", file);

    const apiUrl = import.meta.env.VITE_API_URL || "https://nhaka-2-0-archive-alive.onrender.com";
    
    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch(`${apiUrl}/resurrect/stream`, {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === "complete") {
                const completeData = data as StreamCompleteData;
                return completeData.result;
              } else {
                const msgData = data as AgentMessageData;
                setCurrentAgent(msgData.agent);
                setAgentMessages(prev => [...prev, msgData]);
                
                // Update batch file progress
                if (fileId) {
                  setQueuedFiles(prev => prev.map(f => 
                    f.id === fileId ? { ...f, progress: Math.min(f.progress + 15, 90) } : f
                  ));
                }
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return null;
      }
      throw error;
    }
    
    return null;
  }, []);

  const startBatchProcessing = useCallback(async () => {
    if (queuedFiles.length === 0) {
      toast.error("No files in queue");
      return;
    }

    setIsBatchProcessing(true);
    setIsBatchPaused(false);
    
    const startIndex = isBatchPaused ? currentBatchIndex : 0;
    
    for (let i = startIndex; i < queuedFiles.length; i++) {
      if (isBatchPaused) break;
      
      const qf = queuedFiles[i];
      if (qf.status === "complete" || qf.status === "error") continue;
      
      setCurrentBatchIndex(i);
      setAgentMessages([]);
      setCurrentAgent(undefined);
      
      // Update status to processing
      setQueuedFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: "processing" as FileStatus, startTime: Date.now(), progress: 0 } : f
      ));

      try {
        const result = await processFile(qf.file, qf.id);
        
        if (result) {
          setBatchResults(prev => new Map(prev).set(qf.id, result));
          setQueuedFiles(prev => prev.map((f, idx) => 
            idx === i ? { 
              ...f, 
              status: "complete" as FileStatus, 
              progress: 100, 
              confidence: result.overall_confidence,
              endTime: Date.now() 
            } : f
          ));
          
          toast.success(`${qf.file.name} processed`, {
            description: `Confidence: ${result.overall_confidence.toFixed(1)}%`,
          });
        }
      } catch (error) {
        setQueuedFiles(prev => prev.map((f, idx) => 
          idx === i ? { 
            ...f, 
            status: "error" as FileStatus, 
            error: (error as Error).message,
            endTime: Date.now() 
          } : f
        ));
        
        toast.error(`Failed: ${qf.file.name}`, {
          description: (error as Error).message,
        });
      }
    }

    setIsBatchProcessing(false);
    
    const completed = queuedFiles.filter(f => f.status === "complete").length + 1;
    const total = queuedFiles.length;
    
    if (completed === total) {
      toast.success(`Batch complete! ${completed}/${total} documents processed`);
    }
  }, [queuedFiles, isBatchPaused, currentBatchIndex, processFile]);

  const pauseBatchProcessing = () => {
    setIsBatchPaused(true);
    abortControllerRef.current?.abort();
  };

  const handleSampleSelect = async (sampleId: string) => {
    const imageUrl = sampleImages[sampleId];
    if (!imageUrl) {
      toast.error("Sample document not found");
      return;
    }
    
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch sample: ${response.status}`);
      }
      const blob = await response.blob();
      
      const extensions: Record<string, string> = {
        decay: "png",
        linguist: "png", 
        history: "jpg",
        connection: "webp",
      };
      const ext = extensions[sampleId] || "jpg";
      const mimeTypes: Record<string, string> = {
        png: "image/png",
        jpg: "image/jpeg",
        webp: "image/webp",
      };
      
      const file = new File([blob], `sample-${sampleId}.${ext}`, { type: mimeTypes[ext] });
      
      if (uploadMode === "batch") {
        handleBatchFilesSelect([file]);
        toast.success("Sample document added to queue");
      } else {
        handleFileSelect(file);
        if (autoStart) {
          setTimeout(() => startProcessing(file), 500);
        }
      }
    } catch (error) {
      console.error("Error loading sample document:", error);
      toast.error("Failed to load sample document");
      throw error; // Re-throw so SampleDocuments can handle it
    }
  };

  const handleSampleSelectMultiple = async (sampleIds: string[]) => {
    const files: File[] = [];
    
    try {
      for (const sampleId of sampleIds) {
        const imageUrl = sampleImages[sampleId];
        if (!imageUrl) continue;
        
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch sample: ${response.status}`);
        }
        const blob = await response.blob();
        
        const extensions: Record<string, string> = {
          decay: "png",
          linguist: "png", 
          history: "jpg",
          connection: "webp",
        };
        const ext = extensions[sampleId] || "jpg";
        const mimeTypes: Record<string, string> = {
          png: "image/png",
          jpg: "image/jpeg",
          webp: "image/webp",
        };
        
        const file = new File([blob], `sample-${sampleId}.${ext}`, { type: mimeTypes[ext] });
        files.push(file);
      }
      
      if (files.length > 0) {
        handleBatchFilesSelect(files);
        toast.success(`Added ${files.length} sample documents to queue`);
      }
    } catch (error) {
      console.error("Error loading sample documents:", error);
      toast.error("Failed to load sample documents");
      throw error; // Re-throw so SampleDocuments can handle it
    }
  };

  const startProcessing = async (fileToProcess?: File) => {
    const file = fileToProcess || selectedFile;
    if (!file) {
      toast.error("Please select a document first");
      return;
    }

    setIsProcessing(true);
    setIsComplete(false);
    setAgentMessages([]);
    setRestoredData(null);
    setCurrentAgent(undefined);

    try {
      const result = await processFile(file);
      
      if (result) {
        setRestoredData({
          segments: [
            { text: result.transliterated_text || result.raw_ocr_text || "", confidence: "high" }
          ],
          overallConfidence: result.overall_confidence
        });
        
        if (result.damage_hotspots && result.damage_hotspots.length > 0) {
          setDamageHotspots(result.damage_hotspots);
        }
        
        if (result.restoration_summary) {
          setRestorationSummary(result.restoration_summary);
        }
        
        if (result.enhanced_image_base64) {
          setEnhancedImageBase64(result.enhanced_image_base64);
        }
        
        setIsComplete(true);
        setIsProcessing(false);
        
        toast.success(`Document resurrected! Confidence: ${result.overall_confidence.toFixed(1)}%`, {
          description: `Processing time: ${(result.processing_time_ms / 1000).toFixed(1)}s`,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Failed to process document. Is the backend running?");
      setIsProcessing(false);
    }
  };

  const resetProcessing = () => {
    setSelectedFile(null);
    setIsProcessing(false);
    setIsComplete(false);
    setAgentMessages([]);
    setRestoredData(null);
    setArMode(false);
    setShowArOverlay(false);
    setActiveHotspot(null);
    setDamageHotspots([]);
    setRestorationSummary(null);
    setEnhancedImageBase64(null);
    setCurrentAgent(undefined);
  };

  const toggleArMode = () => {
    if (!isComplete) {
      toast.error("Complete document analysis first to enable AR mode");
      return;
    }
    if (damageHotspots.length === 0) {
      toast.error("No damage detected by AI - AR mode unavailable");
      return;
    }
    setArMode(!arMode);
    setShowArOverlay(!arMode);
    if (!arMode) {
      toast.success("AR Diagnosis Mode activated! Hover over hotspots to see damage analysis.");
    }
  };

  const downloadResult = () => {
    if (!restoredData) return;
    
    const text = restoredData.segments.map(s => s.text).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `restored-${selectedFile?.name || "document"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Document downloaded!");
  };

  const downloadBatchResults = () => {
    if (batchResults.size === 0) return;
    
    let content = "# Nhaka Batch Processing Results\n\n";
    batchResults.forEach((result, fileId) => {
      const qf = queuedFiles.find(f => f.id === fileId);
      content += `## ${qf?.file.name || fileId}\n`;
      content += `Confidence: ${result.overall_confidence.toFixed(1)}%\n\n`;
      content += result.transliterated_text || result.raw_ocr_text || "";
      content += "\n\n---\n\n";
    });
    
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nhaka-batch-results-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Batch results downloaded!");
  };

  return (
    <section ref={sectionRef} id="upload" className="py-20 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Resurrect Your Document
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload a damaged historical document and watch our AI agents collaborate to restore it.
          </p>
        </div>

        {/* Upload Mode Tabs */}
        <div className="flex justify-center mb-6">
          <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as "single" | "batch")} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" className="gap-2">
                <FileIcon className="w-4 h-4" />
                Single Document
              </TabsTrigger>
              <TabsTrigger value="batch" className="gap-2">
                <Layers className="w-4 h-4" />
                Batch Upload
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Sample Documents */}
        {!selectedFile && queuedFiles.length === 0 && (
          <SampleDocuments 
            onSelect={handleSampleSelect} 
            onSelectMultiple={handleSampleSelectMultiple}
            batchMode={uploadMode === "batch"}
          />
        )}

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Left Column - Upload & Preview */}
          <div className="space-y-6">
            {uploadMode === "single" ? (
              <>
                {!selectedFile ? (
                  <DocumentUpload onFileSelect={handleFileSelect} />
                ) : (
                  <div className="relative">
                    {/* AR Mode Overlay */}
                    {arMode && showArOverlay && damageHotspots.length > 0 && (
                      <div className="absolute inset-0 z-20 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-lg" />
                        
                        {damageHotspots.map((hotspot) => {
                          const colors = severityColors[hotspot.severity] || severityColors.moderate;
                          const sizeClass = hotspot.severity === "critical" ? "w-8 h-8" : hotspot.severity === "moderate" ? "w-6 h-6" : "w-5 h-5";
                          
                          return (
                            <div
                              key={hotspot.id}
                              className="absolute pointer-events-auto cursor-pointer"
                              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: "translate(-50%, -50%)" }}
                              onMouseEnter={() => setActiveHotspot(hotspot.id)}
                              onMouseLeave={() => setActiveHotspot(null)}
                            >
                              <div className={cn("absolute inset-0 rounded-full animate-ping opacity-75", colors.ring)} />
                              <div className={cn("relative rounded-full flex items-center justify-center text-white font-bold shadow-lg", sizeClass, colors.bg)}>
                                <span className="text-xs">{hotspot.icon}</span>
                              </div>

                              {activeHotspot === hotspot.id && (
                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-30 w-64 p-3 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl border border-border animate-in fade-in slide-in-from-left-2">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{hotspot.icon}</span>
                                    <span className="font-semibold text-foreground">{hotspot.label}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    <span className="font-medium text-accent">Treatment:</span> {hotspot.treatment}
                                  </p>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>AI-detected ({hotspot.severity})</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-cyan-500/90 text-white rounded-full text-sm font-medium shadow-lg">
                          <Scan className="w-4 h-4 animate-pulse" />
                          AR Diagnosis Active ({damageHotspots.length} issues)
                        </div>
                      </div>
                    )}

                    <DocumentPreview
                      file={selectedFile}
                      isProcessing={isProcessing}
                      isComplete={isComplete}
                      restoredData={restoredData}
                      enhancedImageBase64={enhancedImageBase64}
                    />
                  </div>
                )}
              </>
            ) : (
              <BatchUpload
                onFilesSelect={handleBatchFilesSelect}
                onStartBatch={startBatchProcessing}
                onPauseBatch={pauseBatchProcessing}
                onRemoveFile={handleRemoveFile}
                onClearAll={handleClearAll}
                queuedFiles={queuedFiles}
                isProcessing={isBatchProcessing}
                isPaused={isBatchPaused}
                currentFileIndex={currentBatchIndex}
              />
            )}

            {/* Processing Timer - Shows during processing */}
            {(isProcessing || isBatchProcessing) && (
              <ProcessingTimer
                isProcessing={isProcessing || isBatchProcessing}
                isComplete={isComplete}
                currentAgent={currentAgent}
                className="mt-4"
              />
            )}

            {/* Image Comparison - Show after processing */}
            {isComplete && selectedFile && enhancedImageBase64 && restorationSummary && (
              <ImageComparison
                originalImage={URL.createObjectURL(selectedFile)}
                enhancedImage={`data:image/png;base64,${enhancedImageBase64}`}
                enhancements={restorationSummary.enhancements_applied}
                className="mt-4"
              />
            )}

            {/* Action Buttons - Single Mode */}
            {uploadMode === "single" && selectedFile && (
              <div className="flex flex-wrap gap-3">
                {!isProcessing && !isComplete && (
                  <Button onClick={() => startProcessing()} size="lg" className="gap-2">
                    <Play className="w-5 h-5" />
                    Start Resurrection
                  </Button>
                )}
                
                {isComplete && (
                  <>
                    <Button onClick={downloadResult} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </>
                )}

                <Button onClick={resetProcessing} variant="ghost" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>

                {isComplete && (
                  <div className="flex items-center gap-2 ml-auto px-3 py-2 bg-muted rounded-lg">
                    <Scan className={cn("w-4 h-4", arMode && "text-cyan-500")} />
                    <span className="text-sm font-medium">AR Diagnosis</span>
                    <Switch
                      checked={arMode}
                      onCheckedChange={toggleArMode}
                      className="data-[state=checked]:bg-cyan-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Batch Results Download */}
            {uploadMode === "batch" && batchResults.size > 0 && !isBatchProcessing && (
              <Button onClick={downloadBatchResults} className="gap-2 w-full">
                <Download className="w-4 h-4" />
                Download All Results ({batchResults.size} documents)
              </Button>
            )}
          </div>

          {/* Right Column - Agent Theater */}
          <div>
            <AgentTheater
              messages={agentMessages}
              isProcessing={isProcessing || isBatchProcessing}
              isComplete={isComplete}
            />

            {/* AR Diagnosis Panel */}
            {arMode && (
              <Card className="mt-4 p-4 border-cyan-500/50 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-500" />
                    <h3 className="font-semibold">AI Damage Analysis</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setArMode(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {damageHotspots.map((hotspot) => (
                    <div
                      key={hotspot.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer",
                        activeHotspot === hotspot.id ? "bg-accent/20" : "hover:bg-muted"
                      )}
                      onMouseEnter={() => setActiveHotspot(hotspot.id)}
                      onMouseLeave={() => setActiveHotspot(null)}
                    >
                      <span className="text-lg">{hotspot.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{hotspot.label}</p>
                        <p className="text-xs text-muted-foreground">{hotspot.treatment}</p>
                      </div>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        hotspot.severity === "critical" && "bg-red-500",
                        hotspot.severity === "moderate" && "bg-amber-500",
                        hotspot.severity === "minor" && "bg-green-500",
                      )} />
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    💡 {damageHotspots.length} damage regions detected by AI. Hover over hotspots to see treatments.
                  </p>
                </div>
              </Card>
            )}

            {/* Restoration Summary Panel */}
            {isComplete && restorationSummary && (
              <Card className="mt-4 p-4 border-emerald-500/50 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold">Restoration Summary</h3>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-full">
                    <span className="text-xs font-medium text-emerald-600">
                      {restorationSummary.quality_score.toFixed(0)}% Quality
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-lg">
                  <span className="text-lg">
                    {restorationSummary.document_type === "scan" ? "📄" : 
                     restorationSummary.document_type === "photograph" ? "📷" : "💻"}
                  </span>
                  <div>
                    <p className="text-sm font-medium capitalize">{restorationSummary.document_type} Document</p>
                    <p className="text-xs text-muted-foreground">Detected document type</p>
                  </div>
                </div>

                {restorationSummary.detected_issues.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium">Detected Issues</span>
                    </div>
                    <div className="space-y-1">
                      {restorationSummary.detected_issues.slice(0, 4).map((issue, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {issue}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {restorationSummary.enhancements_applied.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium">Enhancements Applied</span>
                    </div>
                    <div className="space-y-1">
                      {restorationSummary.enhancements_applied.map((enhancement, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {enhancement}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(restorationSummary.skew_corrected || restorationSummary.shadows_removed || restorationSummary.yellowing_fixed || restorationSummary.image_regions_count) && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {restorationSummary.skew_corrected && (
                      <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-600 rounded-full flex items-center gap-1">
                        📐 Skew Fixed
                      </span>
                    )}
                    {restorationSummary.shadows_removed && (
                      <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-600 rounded-full flex items-center gap-1">
                        🌓 Shadows Removed
                      </span>
                    )}
                    {restorationSummary.yellowing_fixed && (
                      <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-700 rounded-full flex items-center gap-1">
                        📜 Yellowing Fixed
                      </span>
                    )}
                    {restorationSummary.image_regions_count && restorationSummary.image_regions_count > 0 && (
                      <span className="px-2 py-1 text-xs bg-pink-500/20 text-pink-600 rounded-full flex items-center gap-1">
                        🖼️ {restorationSummary.image_regions_count} Image(s)
                      </span>
                    )}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
