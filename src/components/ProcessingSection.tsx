import { useState, useRef, useCallback } from "react";
import { DocumentUpload } from "./DocumentUpload";
import { DocumentPreview } from "./DocumentPreview";
import { AgentTheater } from "./AgentTheater";
import { SampleDocuments } from "./SampleDocuments";
import { Button } from "./ui/button";
import { Play, RotateCcw, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AgentType } from "./AgentAvatar";

interface ProcessingSectionProps {
  autoStart?: boolean;
}

interface TextSegment {
  text: string;
  confidence: "high" | "low";
  keyword?: string | undefined;
}

interface RestoredData {
  segments: TextSegment[];
  overallConfidence: number;
}

interface AgentLog {
  agent: AgentType;
  message: string;
  confidence?: number;
  isDebate?: boolean;
  highlightKeywords?: string[];
}

interface ResurrectionResult {
  segments: TextSegment[];
  overallConfidence: number;
  agentLogs: AgentLog[];
  processingTimeMs: number;
}

// Enhanced forensic mock agent messages for Shona document resurrection (fallback)
const mockAgentMessages: AgentLog[] = [
  { 
    agent: "scanner", 
    message: "Initializing PaddleOCR-VL... Detecting Historical Shona characters and iron-gall ink corrosion patterns.", 
    confidence: 0,
    highlightKeywords: ["Lobengula"]
  },
  { 
    agent: "scanner", 
    message: "Material degradation detected: 73% faded ink regions, 12% water damage. Enhancing contrast on signature blocks.", 
    confidence: 68,
    highlightKeywords: ["Charles Rudd"]
  },
  { 
    agent: "linguist", 
    message: "Analyzing Doke Orthography (1931-1955). Validating phonetic values for character ȿ in 'Matabeleland'.", 
    confidence: 72,
    highlightKeywords: ["Matabeleland"]
  },
  { 
    agent: "linguist", 
    message: "⚠️ ORTHOGRAPHIC ALERT: Detecting pre-standardization Shona script. Applying 1888-era character mappings.", 
    confidence: 78,
    isDebate: true
  },
  { 
    agent: "historian", 
    message: "Cross-referencing 1888 Rudd Concession timeline via ERNIE 4.0. Verifying Jameson's 1894 Land Grants.", 
    confidence: 85,
    highlightKeywords: ["October 1888"]
  },
  { 
    agent: "historian", 
    message: "Historical context: British South Africa Company charter records accessed. Matching signatory patterns.", 
    confidence: 88,
    highlightKeywords: ["British South Africa Company's"]
  },
  { 
    agent: "validator", 
    message: "⚡ CROSS-CHECK: Detected potential OCR error '188B' → Correcting to '1888' based on historical timeline.", 
    confidence: 92,
    isDebate: true,
    highlightKeywords: ["October 1888"]
  },
  { 
    agent: "validator", 
    message: "CROSS-CHECK COMPLETE. Hallucination avoided. All dates verified against colonial archive records. Finalizing verified record.", 
    confidence: 94,
    highlightKeywords: ["Rudd Concession"]
  },
];

// Mock restored text with confidence highlighting and keyword markers (fallback)
const mockRestoredText = {
  segments: [
    { text: "The undersigned Chiefs", confidence: "high" as const, keyword: undefined },
    { text: " Lobengula ", confidence: "low" as const, keyword: "Lobengula" },
    { text: "and headmen of the", confidence: "high" as const, keyword: undefined },
    { text: " Matabeleland ", confidence: "high" as const, keyword: "Matabeleland" },
    { text: "territory hereby grant exclusive mining rights to", confidence: "high" as const, keyword: undefined },
    { text: " Charles Rudd ", confidence: "low" as const, keyword: "Charles Rudd" },
    { text: "and associates for the extraction of minerals within the designated regions.", confidence: "high" as const, keyword: undefined },
    { text: "\n\nSigned this day of ", confidence: "high" as const, keyword: undefined },
    { text: "October 1888", confidence: "low" as const, keyword: "October 1888" },
    { text: " in the presence of witnesses.", confidence: "high" as const, keyword: undefined },
    { text: "\n\n[Historical Note: ", confidence: "high" as const, keyword: undefined },
    { text: "Rudd Concession", confidence: "high" as const, keyword: "Rudd Concession" },
    { text: " - This document formed the basis of the ", confidence: "high" as const, keyword: undefined },
    { text: "British South Africa Company's", confidence: "low" as const, keyword: "British South Africa Company's" },
    { text: " claim to mining rights in Matabeleland and Mashonaland.]", confidence: "high" as const, keyword: undefined },
  ],
  overallConfidence: 94,
};

// Supabase Edge Function URL
const RESURRECT_FUNCTION_URL = "https://qjqjanbfwxvjsfhseevc.supabase.co/functions/v1/resurrect-document";

export const ProcessingSection = ({ autoStart = false }: ProcessingSectionProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [restoredData, setRestoredData] = useState<RestoredData | null>(null);
  const [highlightedKeywords, setHighlightedKeywords] = useState<string[]>([]);
  const [agentMessages, setAgentMessages] = useState<AgentLog[]>(mockAgentMessages);
  const [useRealAPI, setUseRealAPI] = useState(false);
  const [apiResult, setApiResult] = useState<ResurrectionResult | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setIsComplete(false);
    setRestoredData(null);
    setHighlightedKeywords([]);
    setApiResult(null);
    setUseRealAPI(false);
    toast.success("Document uploaded!", {
      description: "Click 'Start Resurrection' to begin processing.",
    });
  };

  const handleSampleSelect = (id: string) => {
    const sampleFile = new File([""], `sample-${id}.jpg`, { type: "image/jpeg" });
    setSelectedFile(sampleFile);
    setIsComplete(false);
    setRestoredData(null);
    setHighlightedKeywords([]);
    setApiResult(null);
    setUseRealAPI(false);
    toast.success("Sample document loaded!", {
      description: "Click 'Start Resurrection' to see the agents in action.",
    });
  };

  const handleHighlightChange = useCallback((keywords: string[]) => {
    setHighlightedKeywords(keywords);
  }, []);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/xxx;base64, prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const handleStartProcessing = async () => {
    if (!selectedFile && !autoStart) {
      toast.error("Please upload a document first");
      return;
    }
    
    setIsProcessing(true);
    setIsComplete(false);
    setRestoredData(null);
    setHighlightedKeywords([]);
    setApiResult(null);
    setUseRealAPI(false);
    setAgentMessages(mockAgentMessages); // Reset to mock messages initially

    // Try to call Supabase Edge Function with real file
    if (selectedFile && !selectedFile.name.startsWith("sample-")) {
      try {
        toast.info("Connecting to AI agents...", {
          description: "Processing with PaddleOCR-VL and ERNIE 4.0",
        });

        const imageBase64 = await fileToBase64(selectedFile);
        
        const response = await fetch(RESURRECT_FUNCTION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageBase64 }),
        });

        if (response.ok) {
          const data: ResurrectionResult = await response.json();
          console.log("AI resurrection result:", data);
          
          // Use real API response
          setApiResult(data);
          setAgentMessages(data.agentLogs as AgentLog[]);
          setUseRealAPI(true);
          
          toast.success("AI agents connected!", {
            description: "Processing with real PaddleOCR-VL and ERNIE 4.0",
          });
        } else {
          const errorData = await response.json();
          console.error("Edge function error:", errorData);
          throw new Error(errorData.error || "Edge function failed");
        }
      } catch (error) {
        console.log("Edge function not available, using mock response:", error);
        toast.warning("Using demo mode", {
          description: "AI backend unavailable. Showing simulated response.",
        });
        // Fall back to mock data
        setUseRealAPI(false);
        setAgentMessages(mockAgentMessages);
      }
    } else {
      // Sample files always use mock data
      console.log("Using mock response for sample document...");
      setUseRealAPI(false);
      setAgentMessages(mockAgentMessages);
    }
  };

  const handleProcessingComplete = async () => {
    setIsProcessing(false);
    setIsComplete(true);
    
    // Use real API result if available, otherwise mock data
    const finalData = useRealAPI && apiResult 
      ? { segments: apiResult.segments, overallConfidence: apiResult.overallConfidence }
      : mockRestoredText;
    
    setRestoredData(finalData);
    setHighlightedKeywords([]); // Clear highlights on completion

    toast.success("Document resurrected!", {
      description: `Your archive has been restored with ${finalData.overallConfidence}% confidence.`,
    });

    // Save to Supabase archives table
    try {
      const finalAgentLogs = useRealAPI && apiResult ? apiResult.agentLogs : mockAgentMessages;
      const processingTime = useRealAPI && apiResult ? apiResult.processingTimeMs : mockAgentMessages.length * 800 * 2;
      
      const { error } = await supabase.from("archives").insert([{
        document_name: selectedFile?.name || "sample-document.jpg",
        original_text: null,
        restored_text: finalData.segments.map(s => s.text).join(""),
        agent_logs: JSON.parse(JSON.stringify(finalAgentLogs)),
        confidence_data: JSON.parse(JSON.stringify({
          segments: finalData.segments,
          overall: finalData.overallConfidence,
        })),
        overall_confidence: finalData.overallConfidence,
        processing_time_ms: processingTime,
      }]);

      if (error) {
        console.error("Failed to save to archives:", error);
        toast.error("Failed to save to history", { description: error.message });
      } else {
        toast.success("Saved to archives", { description: "View it in your history." });
      }
    } catch (err) {
      console.error("Supabase error:", err);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setIsProcessing(false);
    setIsComplete(false);
    setRestoredData(null);
    setHighlightedKeywords([]);
    setApiResult(null);
    setUseRealAPI(false);
    setAgentMessages(mockAgentMessages);
  };

  const handleDownload = () => {
    if (restoredData) {
      const text = restoredData.segments.map(s => s.text).join("");
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `restored-${selectedFile?.name || "document"}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Download complete", {
        description: "Your restored document has been saved.",
      });
    }
  };

  const handleShare = () => {
    if (restoredData) {
      const text = restoredData.segments.map(s => s.text).join("");
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!", {
        description: "Share this restoration with others.",
      });
    }
  };

  return (
    <section ref={sectionRef} id="upload" className="py-20 bg-secondary/20">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Bring Your Documents <span className="text-accent">Back to Life</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload any faded document and watch our AI agents collaborate to restore it.
          </p>
          {useRealAPI && (
            <p className="text-sm text-confidence-high mt-2 font-medium">
              🔗 Connected to PaddleOCR-VL + ERNIE 4.0
            </p>
          )}
        </div>

        {/* Upload Area */}
        <div className="max-w-2xl mx-auto mb-8">
          <DocumentUpload
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onClear={handleReset}
          />
        </div>

        {/* Sample Documents */}
        {!selectedFile && (
          <div className="max-w-4xl mx-auto mb-12">
            <SampleDocuments onSelect={handleSampleSelect} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <Button
            variant="hero"
            size="lg"
            onClick={handleStartProcessing}
            disabled={!selectedFile || isProcessing}
            className="gap-2"
          >
            <Play className="w-5 h-5" />
            {isProcessing ? "Processing..." : "Start Resurrection"}
          </Button>
          
          {(isProcessing || isComplete) && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Start Over
            </Button>
          )}
          
          {isComplete && (
            <>
              <Button
                variant="accent"
                size="lg"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="w-5 h-5" />
                Download
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share
              </Button>
            </>
          )}
        </div>

        {/* Main Processing Area */}
        {(selectedFile || isProcessing || isComplete) && (
          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Document Preview */}
            <div>
              <h3 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Document Preview
              </h3>
              <DocumentPreview
                file={selectedFile}
                isProcessing={isProcessing}
                isComplete={isComplete}
                restoredData={restoredData}
                highlightedKeywords={highlightedKeywords}
              />
            </div>

            {/* Agent Theater */}
            <div>
              <h3 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-agent-scanner animate-pulse" />
                Agent Collaboration
                {useRealAPI && (
                  <span className="text-xs text-confidence-high ml-2 font-normal">LIVE</span>
                )}
              </h3>
              <AgentTheater
                isProcessing={isProcessing}
                onComplete={handleProcessingComplete}
                documentName={selectedFile?.name}
                customMessages={agentMessages}
                onHighlightChange={handleHighlightChange}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};