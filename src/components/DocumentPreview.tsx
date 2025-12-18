import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { cn } from "@/lib/utils";
import { Eye, FileText, CheckCircle2 } from "lucide-react";
import sampleLetterImage from "@/assets/sample-letter.jpg";

interface DocumentPreviewProps {
  file: File | null;
  isProcessing: boolean;
  isComplete: boolean;
}

const sampleRestoredText = `December 15, 1943

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

export const DocumentPreview = ({ file, isProcessing, isComplete }: DocumentPreviewProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("original");

  useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      // Use sample image for demo files, otherwise use actual file
      if (file.name.startsWith("sample-")) {
        setImageUrl(sampleLetterImage);
      } else {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    }
  }, [file]);

  useEffect(() => {
    if (isComplete) {
      setActiveTab("restored");
    }
  }, [isComplete]);

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

  return (
    <Card className="overflow-hidden border-2 border-border">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="p-4 border-b border-border bg-secondary/30">
          <div className="flex items-center justify-between mb-3">
            <TabsList className="bg-muted">
              <TabsTrigger value="original" className="gap-2">
                <FileText className="w-4 h-4" />
                Original
              </TabsTrigger>
              <TabsTrigger value="restored" className="gap-2" disabled={!isComplete}>
                <CheckCircle2 className="w-4 h-4" />
                Restored
              </TabsTrigger>
            </TabsList>
            
            {isComplete && (
              <Badge variant="default" className="bg-agent-reconstructor">
                89% Confidence
              </Badge>
            )}
          </div>
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
                  <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-serif text-lg">Agents analyzing document...</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="restored" className="m-0">
          <div className="h-[450px] overflow-auto p-6 bg-[hsl(40_30%_97%)]">
            <div 
              className={cn(
                "font-mono text-sm whitespace-pre-wrap leading-relaxed text-foreground",
                isComplete && "animate-reveal-document"
              )}
            >
              {sampleRestoredText}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
