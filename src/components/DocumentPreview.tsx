import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Eye, FileText, CheckCircle2, Sparkles, Download, ArrowLeftRight } from "lucide-react";
import baiduLogo from "@/assets/baidu.jpg";

interface TextSegment {
  text: string;
  confidence: "high" | "low";
}

interface RestoredData {
  segments: TextSegment[];
  overallConfidence: number;
}

interface DocumentPreviewProps {
  file: File | null;
  isProcessing: boolean;
  isComplete: boolean;
  restoredData?: RestoredData | null;
  enhancedImageBase64?: string | null;
}

const defaultRestoredText = `December 15, 1943

My Dearest Margaret,

I hope this letter finds you well. The days here at ██Camp Edwards██ have been long, but your last letter brought me more comfort than I can express.

The ░░rations░░ have improved somewhat, though I still dream of your apple pie. Tell Mother I received her package - the socks are holding up better than anything the Army provides.

We're preparing for something big, I think. I can't say much, but know that I carry your photograph close to my heart. It's dog-eared now from all the times I've looked at it.

Give my love to little Tommy. Tell him his father will be home before he knows it, and we'll go fishing at the old creek like I promised.

Forever yours,
William

---
[CONFIDENCE MARKERS]
██ = High confidence (89%)
░░ = Reconstructed from context
Sections 3, 7, 12 marked as interpretive
`;

export const DocumentPreview = ({ file, isProcessing, isComplete, restoredData, enhancedImageBase64 }: DocumentPreviewProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("original");
  const [showComparison, setShowComparison] = useState(false);

  // Debug logging
  console.log("📋 DocumentPreview props:", {
    file: file?.name,
    isProcessing,
    isComplete,
    hasRestoredData: !!restoredData,
    hasEnhancedImage: !!enhancedImageBase64,
    enhancedImageLength: enhancedImageBase64?.length
  });

  useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      // Always use actual file URL
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    if (isComplete && enhancedImageBase64) {
      console.log("🔄 Auto-switching to enhanced tab!");
      // Auto-switch to enhanced tab when processing completes
      setActiveTab("enhanced");
    } else {
      console.log("🔄 Auto-switch conditions not met:", { isComplete, hasEnhancedImage: !!enhancedImageBase64 });
    }
  }, [isComplete, enhancedImageBase64]);

  const downloadEnhancedImage = () => {
    if (!enhancedImageBase64) return;
    
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${enhancedImageBase64}`;
    link.download = `restored-${file?.name || 'document'}.png`;
    link.click();
  };

  if (!file) {
    return (
      <Card className="p-8 border-2 border-dashed border-border bg-muted/30 h-[500px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-serif text-lg">Document preview will appear here</p>
        </div>
      </Card>
    );
  }

  const overallConfidence = restoredData?.overallConfidence ?? 89;

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* WhatsApp-style Teal Header */}
      <div 
        className="p-3 flex items-center justify-between"
        style={{ backgroundColor: "#075E54" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
            📄
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Document Preview</h3>
            <p className="text-xs text-white/80">
              {isProcessing ? "Processing..." : isComplete ? "Restoration complete" : file.name}
            </p>
          </div>
        </div>
        {isComplete && (
          <Badge className="bg-white/20 text-white border-0">
            {overallConfidence.toFixed(1)}% Confidence
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="p-4 border-b border-border bg-secondary/30">
          <div className="flex items-center justify-between mb-3">
            <TabsList className="bg-muted">
              <TabsTrigger value="original" className="gap-2">
                <FileText className="w-4 h-4" />
                Original
              </TabsTrigger>
              <TabsTrigger value="enhanced" className="gap-2" disabled={!enhancedImageBase64}>
                <Sparkles className="w-4 h-4" />
                Enhanced
              </TabsTrigger>
              <TabsTrigger value="restored" className="gap-2" disabled={!isComplete}>
                <CheckCircle2 className="w-4 h-4" />
                Text
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              {enhancedImageBase64 && (
                <Button variant="outline" size="sm" onClick={downloadEnhancedImage} className="gap-1">
                  <Download className="w-3 h-3" />
                  Save Enhanced
                </Button>
              )}
            </div>
          </div>
          
          {/* Before/After Comparison Toggle */}
          {enhancedImageBase64 && activeTab === "enhanced" && (
            <div className="flex items-center gap-2 mt-2">
              <Button 
                variant={showComparison ? "default" : "outline"} 
                size="sm" 
                onClick={() => setShowComparison(!showComparison)}
                className="gap-1"
              >
                <ArrowLeftRight className="w-3 h-3" />
                {showComparison ? "Hide Comparison" : "Compare Before/After"}
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="original" className="m-0">
          <div className="relative h-[450px] overflow-auto bg-muted/20 p-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Original document"
                className={cn(
                  "max-w-full h-auto mx-auto rounded-lg shadow-lg transition-all duration-500",
                  isProcessing && "opacity-50 blur-[1px]",
                  isComplete && "sepia-[0.3]"
                )}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm">PDF Preview</p>
                </div>
              </div>
            )}
            
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <img 
                      src={baiduLogo} 
                      alt="ERNIE" 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
                    />
                  </div>
                  <p className="font-serif text-lg">Agents analyzing document...</p>
                  <p className="text-xs text-accent mt-2 font-medium">⚡ Powered by ERNIE 4.0 + PaddleOCR-VL</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="enhanced" className="m-0">
          <div className="relative h-[450px] overflow-auto bg-muted/20 p-4">
            {showComparison ? (
              /* Side-by-side comparison */
              <div className="flex gap-4 h-full">
                <div className="flex-1 relative">
                  <p className="text-xs text-center text-muted-foreground mb-2 font-medium">BEFORE</p>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Original document"
                      className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                    />
                  )}
                </div>
                <div className="w-px bg-border" />
                <div className="flex-1 relative">
                  <p className="text-xs text-center text-muted-foreground mb-2 font-medium">AFTER</p>
                  {enhancedImageBase64 && (
                    <img
                      src={`data:image/png;base64,${enhancedImageBase64}`}
                      alt="Enhanced document"
                      className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                    />
                  )}
                </div>
              </div>
            ) : (
              /* Enhanced image only */
              <div className="relative">
                {enhancedImageBase64 ? (
                  <>
                    <img
                      src={`data:image/png;base64,${enhancedImageBase64}`}
                      alt="Enhanced document"
                      className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500/90 text-white text-xs rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Enhanced
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Enhanced image will appear here</p>
                      <p className="text-sm">Process a document to see the restoration</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="restored" className="m-0">
          <div className="h-[450px] overflow-auto p-6 bg-[hsl(40_30%_97%)]">
            {/* Restored Document - Professional Layout */}
            <div 
              className={cn(
                "max-w-2xl mx-auto",
                isComplete && "animate-reveal-document"
              )}
            >
              {restoredData ? (
                <div className="space-y-4">
                  {/* Document Header */}
                  <div className="text-center pb-4 border-b border-amber-200">
                    <p className="text-xs text-amber-700 uppercase tracking-wider mb-1">Restored Document</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-8 h-px bg-amber-300" />
                      <span className="text-amber-600 text-xs">✦</span>
                      <span className="w-8 h-px bg-amber-300" />
                    </div>
                  </div>
                  
                  {/* Document Content */}
                  <div className="font-serif text-base leading-relaxed text-stone-800 whitespace-pre-wrap">
                    {restoredData.segments.map((segment, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          "transition-colors",
                          segment.confidence === "low" && "bg-amber-100/50 border-b border-amber-300 border-dashed"
                        )}
                      >
                        {segment.text}
                      </span>
                    ))}
                  </div>
                  
                  {/* Document Footer */}
                  <div className="pt-4 mt-6 border-t border-amber-200">
                    <div className="flex items-center justify-between text-xs text-amber-700">
                      <span>AI-Restored by Nhaka 2.0</span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {restoredData.overallConfidence.toFixed(1)}% Confidence
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // Fallback to default text
                <div className="font-serif text-base leading-relaxed text-stone-800 whitespace-pre-wrap">
                  {defaultRestoredText}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
