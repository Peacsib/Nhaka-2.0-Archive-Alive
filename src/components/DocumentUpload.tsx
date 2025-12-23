import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Image, File } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  onClear?: () => void;
}

export const DocumentUpload = ({ onFileSelect, selectedFile, onClear }: DocumentUploadProps) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
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

  if (selectedFile) {
    const FileIcon = getFileIcon(selectedFile);
    
    return (
      <Card className="p-6 border-2 border-accent/50 bg-accent/5">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-accent/20">
            <FileIcon className="w-8 h-8 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
          </div>
          {onClear && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </Card>
    );
  }

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
          {isDragActive ? "Drop your document here" : "Upload Your Archive"}
        </h3>
        
        <p className="text-muted-foreground mb-4 max-w-sm">
          Drag and drop your document, or click to browse. 
          Supports images and PDFs.
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
            PNG, JPG
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
            PDF
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
            Up to 20MB
          </span>
        </div>
      </div>
    </Card>
  );
};
