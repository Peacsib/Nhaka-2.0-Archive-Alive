import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Clock, Star, Wrench, Languages, BookOpen, Globe, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Hero Asset imports
import bsacDecay from "@/assets/BSAC_Archive_Record_1896.png";
import dokeLinguist from "@/assets/linguist_test.png";
import tandiCertificate from "@/assets/Colonial_Certificate_1957.jpg";
import shanghaiPostcard from "@/assets/Salisbury to China.webp";

interface SampleDocument {
  id: string;
  name: string;
  era: string;
  type: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  image: string;
  highlight: string;
  aiAction: string;
}

// 4 Hero Assets - Strategic Narrative Arc for Demo
const sampleDocs: SampleDocument[] = [
  {
    id: "decay",
    name: "BSAC Yellow List (1896)",
    era: "1896",
    type: "Company Record",
    description: "British South Africa Company record with acidic paper degradation and foxing.",
    difficulty: "hard",
    image: bsacDecay,
    highlight: "Paper Damage",
    aiAction: "Detects acidic degradation → Recommends Magnesium Bicarbonate Wash",
  },
  {
    id: "linguist",
    name: "Doke Orthography Chart (1931)",
    era: "1931",
    type: "Linguistic Document",
    description: "Clement Doke's Shona unification proposal with special phonetic symbols (ş, z̧, ʋ).",
    difficulty: "hard",
    image: dokeLinguist,
    highlight: "Doke Script",
    aiAction: "Identifies Doke 1931 symbols → Maps ş→sv, z̧→zv to modern Shona",
  },
  {
    id: "history",
    name: "George Tandi Certificate (1957)",
    era: "1957",
    type: "Service Award",
    description: "Colonial service award for Zimbabwe's first Black postman. Uses colonial name 'Hartley'.",
    difficulty: "medium",
    image: tandiCertificate,
    highlight: "Colonial Names",
    aiAction: "Detects 'Hartley' → Auto-links to modern name 'Chegutu' (post-1982)",
  },
  {
    id: "connection",
    name: "Salisbury-Shanghai Postcard (1907)",
    era: "1907",
    type: "Postal History",
    description: "Postcard mailed from Salisbury (Harare) to Shanghai, China - proving 118 years of connection.",
    difficulty: "easy",
    image: shanghaiPostcard,
    highlight: "China-Zim Link",
    aiAction: "Verifies China-Zimbabwe historical connection → 118 Years",
  },
];

const difficultyColors = {
  easy: "text-green-600 bg-green-100",
  medium: "text-amber-600 bg-amber-100",
  hard: "text-red-600 bg-red-100",
};

const agentIcons: Record<string, React.ReactNode> = {
  "Paper Damage": <Wrench className="w-4 h-4" />,
  "Doke Script": <Languages className="w-4 h-4" />,
  "Colonial Names": <BookOpen className="w-4 h-4" />,
  "China-Zim Link": <Globe className="w-4 h-4" />,
};

interface SampleDocumentsProps {
  onSelect: (id: string) => Promise<void> | void;
  onSelectMultiple?: (ids: string[]) => Promise<void> | void;
  batchMode?: boolean;
}

export const SampleDocuments = ({ onSelect, onSelectMultiple, batchMode = false }: SampleDocumentsProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null);

  const handleCardClick = async (docId: string) => {
    if (batchMode) {
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(docId)) {
          newSet.delete(docId);
        } else {
          newSet.add(docId);
        }
        return newSet;
      });
    } else {
      // Show loading state for single document selection
      setLoadingDocId(docId);
      try {
        await onSelect(docId);
      } catch (error) {
        console.error("Error selecting sample document:", error);
        toast.error("Failed to load sample document");
      } finally {
        setLoadingDocId(null);
      }
    }
  };

  const handleAddSelected = async () => {
    if (onSelectMultiple && selectedIds.size > 0) {
      const idsToAdd = Array.from(selectedIds);
      setSelectedIds(new Set());
      setIsLoading(true);
      try {
        await onSelectMultiple(idsToAdd);
      } catch (error) {
        console.error("Error adding sample documents:", error);
        toast.error("Failed to add sample documents to queue");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sampleDocs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sampleDocs.map(d => d.id)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-accent" />
          <h3 className="font-serif text-xl font-semibold">Hero Documents - Demo Flow</h3>
          <span className="text-xs text-muted-foreground ml-2">Paper → Language → Context → Connection</span>
        </div>
        
        {batchMode && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={isLoading}
            >
              {selectedIds.size === sampleDocs.length ? "Deselect All" : "Select All"}
            </Button>
            <Button
              size="sm"
              onClick={handleAddSelected}
              disabled={selectedIds.size === 0 || isLoading}
              className="gap-1"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isLoading ? "Loading..." : `Add ${selectedIds.size > 0 ? `(${selectedIds.size})` : ""} to Queue`}
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sampleDocs.map((doc, index) => {
          const isSelected = selectedIds.has(doc.id);
          const isLoadingThis = loadingDocId === doc.id;
          return (
          <Card
            key={doc.id}
            className={cn(
              "p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden relative",
              batchMode && isSelected 
                ? "border-accent ring-2 ring-accent/50" 
                : "hover:border-accent/50",
              isLoadingThis && "opacity-75 pointer-events-none"
            )}
            onClick={() => handleCardClick(doc.id)}
          >
            {/* Loading overlay for single mode */}
            {isLoadingThis && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <span className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium text-accent">Loading...</span>
                </div>
              </div>
            )}
            {/* Selection indicator for batch mode */}
            {batchMode && (
              <div className={cn(
                "absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                isSelected 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-black/50 text-white/70 group-hover:bg-black/70"
              )}>
                {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
            )}
            {/* Document Preview Image */}
            <div className="relative h-32 mb-3 rounded-lg overflow-hidden bg-secondary">
              <img 
                src={doc.image} 
                alt={doc.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {index + 1}. {doc.highlight}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground text-sm leading-tight">{doc.name}</h4>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {doc.era}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[doc.difficulty]}`}>
                  {doc.difficulty}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2">
                {doc.description}
              </p>
              
              {/* AI Action Preview */}
              <div className="flex items-start gap-2 pt-2 border-t border-border/50">
                <span className="text-accent">{agentIcons[doc.highlight]}</span>
                <p className="text-xs text-accent/80 line-clamp-2">{doc.aiAction}</p>
              </div>
            </div>
          </Card>
          );
        })}
      </div>
    </div>
  );
};
