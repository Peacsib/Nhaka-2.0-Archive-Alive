import { useState, useRef, useEffect } from "react";
import { DocumentUpload } from "./DocumentUpload";
import { DocumentPreview } from "./DocumentPreview";
import { AgentTheater } from "./AgentTheater";
import { SampleDocuments } from "./SampleDocuments";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Play, RotateCcw, Download, Share2, AlertTriangle, Scan, Zap, X, FileText, CheckCircle2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
// Import all sample document images
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

// Severity colors for hotspots
const severityColors: Record<string, { bg: string; ring: string }> = {
  critical: { bg: "bg-red-600", ring: "bg-red-500" },
  moderate: { bg: "bg-amber-600", ring: "bg-amber-500" },
  minor: { bg: "bg-green-600", ring: "bg-green-500" },
};

export const ProcessingSection = ({ autoStart = false }: ProcessingSectionProps) => {
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
  const sectionRef = useRef<HTMLElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setIsComplete(false);
    setAgentMessages([]);
    setRestoredData(null);
    setArMode(false);
    setShowArOverlay(false);
    setDamageHotspots([]);
  };

  const handleSampleSelect = async (sampleId: string) => {
    // Get the correct image for this sample
    const imageUrl = sampleImages[sampleId];
    if (!imageUrl) {
      toast.error("Sample document not found");
      return;
    }
    
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Determine file extension from sampleId
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
    handleFileSelect(file);
    
    if (autoStart) {
      setTimeout(() => startProcessing(file), 500);
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

    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/resurrect/stream`, {
        method: "POST",
        body: formData,
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
                // Final result
                const completeData = data as StreamCompleteData;
                const result = completeData.result;
                
                setRestoredData({
                  segments: [
                    { text: result.transliterated_text || result.raw_ocr_text || "", confidence: "high" }
                  ],
                  overallConfidence: result.overall_confidence
                });
                
                // Set real damage hotspots from AI analysis
                if (result.damage_hotspots && result.damage_hotspots.length > 0) {
                  setDamageHotspots(result.damage_hotspots);
                }
                
                // Set restoration summary from AI analysis
                if (result.restoration_summary) {
                  setRestorationSummary(result.restoration_summary);
                }
                
                // Set enhanced image for visual display
                if (result.enhanced_image_base64) {
                  setEnhancedImageBase64(result.enhanced_image_base64);
                }
                
                // Check if this was a cached result
                if (completeData.cached) {
                  toast.success(`Document resurrected! Confidence: ${result.overall_confidence.toFixed(1)}%`, {
                    description: `⚡ Retrieved from cache (90% faster)`,
                    duration: 4000,
                  });
                } else {
                  toast.success(`Document resurrected! Confidence: ${result.overall_confidence.toFixed(1)}%`);
                }
                
                setIsComplete(true);
                setIsProcessing(false);
              } else {
                // Agent message
                setAgentMessages(prev => [...prev, data as AgentMessageData]);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
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

        {/* Sample Documents */}
        {!selectedFile && (
          <SampleDocuments onSelect={handleSampleSelect} />
        )}

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Left Column - Upload & Preview */}
          <div className="space-y-6">
            {!selectedFile ? (
              <DocumentUpload onFileSelect={handleFileSelect} />
            ) : (
              <div className="relative">
                {/* AR Mode Overlay */}
                {arMode && showArOverlay && damageHotspots.length > 0 && (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-lg" />
                    
                    {/* Real AI-detected Hotspots */}
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
                          {/* Pulsing ring */}
                          <div className={cn(
                            "absolute inset-0 rounded-full animate-ping opacity-75",
                            colors.ring
                          )} />
                          
                          {/* Hotspot dot */}
                          <div className={cn(
                            "relative rounded-full flex items-center justify-center text-white font-bold shadow-lg",
                            sizeClass,
                            colors.bg
                          )}>
                            <span className="text-xs">{hotspot.icon}</span>
                          </div>

                          {/* Tooltip */}
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

                    {/* AR Mode Badge */}
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

            {/* Action Buttons */}
            {selectedFile && (
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

                {/* AR Mode Toggle */}
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
          </div>

          {/* Right Column - Agent Theater */}
          <div>
            <AgentTheater
              messages={agentMessages}
              isProcessing={isProcessing}
              isComplete={isComplete}
            />

            {/* AR Diagnosis Panel - Shows when AR mode is active */}
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
                  {damageHotspots.map((hotspot) => {
                    return (
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
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    💡 {damageHotspots.length} damage regions detected by AI. Hover over hotspots to see treatments.
                  </p>
                </div>
              </Card>
            )}

            {/* Restoration Summary Panel - Shows when processing is complete */}
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
                
                {/* Document Type */}
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

                {/* Detected Issues */}
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

                {/* Enhancements Applied */}
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

                {/* Quick Restoration Stats */}
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
                    {restorationSummary.image_regions_count > 0 && (
                      <span className="px-2 py-1 text-xs bg-pink-500/20 text-pink-600 rounded-full flex items-center gap-1">
                        🖼️ {restorationSummary.image_regions_count} Image(s)
                      </span>
                    )}
                  </div>
                )}

                {/* Text Structure */}
                {restorationSummary.text_structure && (
                  (restorationSummary.text_structure.headings?.length > 0 || restorationSummary.text_structure.paragraphs?.length > 0) && (
                    <div className="mb-3 p-2 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium mb-1">Document Structure</p>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        {restorationSummary.text_structure.headings?.length > 0 && (
                          <span>📑 {restorationSummary.text_structure.headings.length} heading(s)</span>
                        )}
                        {restorationSummary.text_structure.paragraphs?.length > 0 && (
                          <span>📝 {restorationSummary.text_structure.paragraphs.length} paragraph(s)</span>
                        )}
                      </div>
                    </div>
                  )
                )}

                {/* Layout Info */}
                {restorationSummary.layout_info && Object.keys(restorationSummary.layout_info).length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                      {restorationSummary.layout_info.has_header && (
                        <span className="px-2 py-1 text-xs bg-muted rounded-full">📋 Header</span>
                      )}
                      {restorationSummary.layout_info.has_footer && (
                        <span className="px-2 py-1 text-xs bg-muted rounded-full">📋 Footer</span>
                      )}
                      {restorationSummary.layout_info.has_tables && (
                        <span className="px-2 py-1 text-xs bg-muted rounded-full">📊 Table</span>
                      )}
                      {restorationSummary.layout_info.has_images && (
                        <span className="px-2 py-1 text-xs bg-muted rounded-full">🖼️ Images</span>
                      )}
                      {restorationSummary.layout_info.estimated_columns && (
                        <span className="px-2 py-1 text-xs bg-muted rounded-full">
                          📰 {restorationSummary.layout_info.estimated_columns} column(s)
                        </span>
                      )}
                    </div>
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
