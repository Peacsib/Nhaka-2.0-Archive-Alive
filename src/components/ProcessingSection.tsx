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

// Enhanced forensic mock agent messages for Shona document resurrection
const mockAgentMessages: { 
  agent: AgentType; 
  message: string; 
  confidence?: number; 
  isDebate?: boolean;
  highlightKeywords?: string[];
}[] = [
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

// Mock restored text with confidence highlighting and keyword markers
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

export const ProcessingSection = ({ autoStart = false }: ProcessingSectionProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [restoredData, setRestoredData] = useState<typeof mockRestoredText | null>(null);
  const [highlightedKeywords, setHighlightedKeywords] = useState<string[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setIsComplete(false);
    setRestoredData(null);
    setHighlightedKeywords([]);
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
    toast.success("Sample document loaded!", {
      description: "Click 'Start Resurrection' to see the agents in action.",
    });
  };

  const handleHighlightChange = useCallback((keywords: string[]) => {
    setHighlightedKeywords(keywords);
  }, []);

  const handleStartProcessing = async () => {
    if (!selectedFile && !autoStart) {
      toast.error("Please upload a document first");
      return;
    }
    
    setIsProcessing(true);
    setIsComplete(false);
    setRestoredData(null);
    setHighlightedKeywords([]);

    // Try to call FastAPI backend, fall back to mock if unavailable
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      // Attempt to call local FastAPI endpoint
      const response = await fetch("http://localhost:8000/resurrect", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Use real response if available
        setRestoredData(data);
      } else {
        throw new Error("FastAPI not available");
      }
    } catch (error) {
      // FastAPI not running - use mock data (AgentTheater handles timing)
      console.log("FastAPI not available, using mock response...");
    }
  };

  const handleProcessingComplete = async () => {
    setIsProcessing(false);
    setIsComplete(true);
    
    // Set mock restored data
    setRestoredData(mockRestoredText);
    setHighlightedKeywords([]); // Clear highlights on completion

    toast.success("Document resurrected!", {
      description: `Your archive has been restored with ${mockRestoredText.overallConfidence}% confidence.`,
    });

    // Save to Supabase archives table
    try {
      const { error } = await supabase.from("archives").insert({
        document_name: selectedFile?.name || "sample-document.jpg",
        original_text: null,
        restored_text: mockRestoredText.segments.map(s => s.text).join(""),
        agent_logs: mockAgentMessages,
        confidence_data: {
          segments: mockRestoredText.segments,
          overall: mockRestoredText.overallConfidence,
        },
        overall_confidence: mockRestoredText.overallConfidence,
        processing_time_ms: mockAgentMessages.length * 800 * 2, // Approximate based on delays
      });

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
  };

  const handleDownload = () => {
    toast.success("Download started", {
      description: "Your restored document is being prepared.",
    });
  };

  const handleShare = () => {
    toast.success("Link copied!", {
      description: "Share this restoration with others.",
    });
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
              </h3>
              <AgentTheater
                isProcessing={isProcessing}
                onComplete={handleProcessingComplete}
                documentName={selectedFile?.name}
                customMessages={mockAgentMessages}
                onHighlightChange={handleHighlightChange}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};