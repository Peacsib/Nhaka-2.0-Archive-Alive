import { useState, useRef } from "react";
import { DocumentUpload } from "./DocumentUpload";
import { DocumentPreview } from "./DocumentPreview";
import { AgentTheater } from "./AgentTheater";
import { SampleDocuments } from "./SampleDocuments";
import { Button } from "./ui/button";
import { Play, RotateCcw, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ProcessingSectionProps {
  autoStart?: boolean;
}

export const ProcessingSection = ({ autoStart = false }: ProcessingSectionProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setIsComplete(false);
    toast.success("Document uploaded!", {
      description: "Click 'Start Resurrection' to begin processing.",
    });
  };

  const handleSampleSelect = (id: string) => {
    // Simulate loading a sample document
    const sampleFile = new File([""], `sample-${id}.jpg`, { type: "image/jpeg" });
    setSelectedFile(sampleFile);
    setIsComplete(false);
    toast.success("Sample document loaded!", {
      description: "Click 'Start Resurrection' to see the agents in action.",
    });
  };

  const handleStartProcessing = () => {
    if (!selectedFile && !autoStart) {
      toast.error("Please upload a document first");
      return;
    }
    
    setIsProcessing(true);
    setIsComplete(false);
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    setIsComplete(true);
    toast.success("Document resurrected!", {
      description: "Your archive has been restored with 89% confidence.",
    });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setIsProcessing(false);
    setIsComplete(false);
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
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
