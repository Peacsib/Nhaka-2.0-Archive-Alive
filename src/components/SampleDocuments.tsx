import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Clock, Star } from "lucide-react";

interface SampleDocument {
  id: string;
  name: string;
  era: string;
  type: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
}

const sampleDocs: SampleDocument[] = [
  {
    id: "1",
    name: "Wartime Letter (1943)",
    era: "1940s",
    type: "Personal Letter",
    description: "A soldier's letter home, partially faded with handwritten script.",
    difficulty: "medium",
  },
  {
    id: "2",
    name: "Victorian Recipe",
    era: "1890s",
    type: "Household Document",
    description: "A grandmother's recipe with marginal notes and aging ink.",
    difficulty: "easy",
  },
  {
    id: "3",
    name: "Immigration Record",
    era: "1920s",
    type: "Official Document",
    description: "Ellis Island arrival record with stamps and annotations.",
    difficulty: "hard",
  },
];

const difficultyColors = {
  easy: "text-agent-reconstructor bg-agent-reconstructor-bg",
  medium: "text-agent-historian bg-agent-historian-bg",
  hard: "text-agent-scanner bg-agent-scanner-bg",
};

interface SampleDocumentsProps {
  onSelect: (id: string) => void;
}

export const SampleDocuments = ({ onSelect }: SampleDocumentsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-accent" />
        <h3 className="font-serif text-xl font-semibold">Try a Sample Document</h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {sampleDocs.map((doc) => (
          <Card
            key={doc.id}
            className="p-4 hover:shadow-lg transition-all duration-300 hover:border-accent/50 cursor-pointer group"
            onClick={() => onSelect(doc.id)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-secondary group-hover:bg-accent/20 transition-colors">
                <FileText className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">{doc.name}</h4>
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {doc.era}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[doc.difficulty]}`}>
                    {doc.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {doc.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
