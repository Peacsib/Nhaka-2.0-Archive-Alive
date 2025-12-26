import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Image, File, Files } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  onFileSelect: (file: File) => void;
  onBatchSelect?: (files: File[]) => void;
  selectedFile?: File | null;
  selectedFiles?: File[];
  onClear?: () => void;
  batchMode?: boolean;
}

const MAX_BATCH_SIZE = 5;

export const DocumentUpload = ({ 
  onFileSelect, 
  onBatchSelect,
  selectedFile, 
  selectedFiles = [],
  onClear,
  batchMode = false
}: DocumentUploadProps) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (batchMode && onBatchSelect) {
      // Batch mode - accept up to 5 files
      const filesToAdd = acceptedFiles.slice(0, MAX_BATCH_SIZE);
      onBatchSelect(filesToAdd);
    } else if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect, onBatchSelect, batchMode]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: batchMode ? MAX_BATCH_SIZE : 1,
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

  // Batch mode with multiple files selected
  if (batchMode && selectedFiles.length > 0) {
    return (
      <Card className="p-6 border-2 border-accent/50 bg-accent/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Files className="w-5 h-5 text-accent" />
            <span className="font-medium">{selectedFiles.length} document{selectedFiles.length > 1 ? 's' : ''} selected</span>
          </div>
          {onClear && (
            <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground hover:text-destructive">
              Clear all
            </Button>
          )}
        </div>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {selectedFiles.map((file, idx) => {
            const FileIcon = getFileIcon(file);
            return (
              <div key={idx} className="flex items-center gap-3 p-2 bg-background/50 rounded-lg">
                <FileIcon className="w-5 h-5 text-accent" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
            );
          })}
        </div>
        {selectedFiles.length < MAX_BATCH_SIZE && (
          <div {...getRootProps()} className="mt-3 p-3 border border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 transition-colors">
            <input {...getInputProps()} />
            <p className="text-xs text-center text-muted-foreground">
              + Add more (up to {MAX_BATCH_SIZE - selectedFiles.length} more)
            </p>
          </div>
        )}
      </Card>
    );
  }

  // Single file selected (non-batch mode)
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
          {batchMode ? (
            <Files 
              className={cn(
                "w-8 h-8 transition-all duration-300",
                isDragActive ? "text-accent scale-110" : "text-muted-foreground"
              )} 
            />
          ) : (
            <Upload 
              className={cn(
                "w-8 h-8 transition-all duration-300",
                isDragActive ? "text-accent scale-110" : "text-muted-foreground"
              )} 
            />
          )}
        </div>
        
        <h3 className="font-serif text-xl font-semibold mb-2 text-foreground">
          {isDragActive 
            ? (batchMode ? "Drop your documents here" : "Drop your document here")
            : (batchMode ? "Upload Multiple Documents" : "Upload Your Archive")
          }
        </h3>
        
        <p className="text-muted-foreground mb-4 max-w-sm">
          {batchMode 
            ? `Drag and drop up to ${MAX_BATCH_SIZE} documents, or click to browse.`
            : "Drag and drop your document, or click to browse."
          }
          {" "}Supports images and PDFs.
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
            PNG, JPG
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
            PDF
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
            {batchMode ? `Max ${MAX_BATCH_SIZE} files` : "Up to 20MB"}
          </span>
        </div>
      </div>
    </Card>
  );
};
