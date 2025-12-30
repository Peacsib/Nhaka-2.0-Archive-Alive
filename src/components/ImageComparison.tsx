import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Sparkles, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageComparisonProps {
  originalImage: string; // base64 or URL
  enhancedImage: string; // base64 or URL
  enhancements?: string[];
  className?: string;
  autoReveal?: boolean; // NEW: Auto-animate slider to show enhanced version
}

export const ImageComparison = ({
  originalImage,
  enhancedImage,
  enhancements = [],
  className,
  autoReveal = true, // Default to true for automatic reveal
}: ImageComparisonProps) => {
  const [sliderPosition, setSliderPosition] = useState(0); // Start at 0 (original)
  const [showSideBySide, setShowSideBySide] = useState(false);
  const [hasAutoRevealed, setHasAutoRevealed] = useState(false);

  // AUTO-REVEAL EFFECT: Animate slider from original (0%) to enhanced (100%) when component mounts
  useEffect(() => {
    if (autoReveal && !hasAutoRevealed && !showSideBySide) {
      // Wait a moment for the component to render, then start the reveal animation
      const timer = setTimeout(() => {
        let currentPosition = 0;
        const targetPosition = 100; // Show fully enhanced
        const animationDuration = 2000; // 2 seconds
        const frameRate = 60; // 60fps
        const increment = (targetPosition - currentPosition) / (animationDuration / (1000 / frameRate));

        const animate = () => {
          currentPosition += increment;
          if (currentPosition >= targetPosition) {
            currentPosition = targetPosition;
            setSliderPosition(currentPosition);
            setHasAutoRevealed(true);
            return;
          }
          setSliderPosition(currentPosition);
          requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
      }, 800); // Wait 800ms before starting animation

      return () => clearTimeout(timer);
    }
  }, [autoReveal, hasAutoRevealed, showSideBySide]);

  // Reset auto-reveal when switching back from side-by-side
  useEffect(() => {
    if (showSideBySide) {
      setHasAutoRevealed(true); // Prevent auto-reveal when switching back
    }
  }, [showSideBySide]);

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">AI Enhancement</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSideBySide(!showSideBySide)}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          {showSideBySide ? "Slider" : "Side by Side"}
        </Button>
      </div>

      {/* Enhancements Applied */}
      {enhancements.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {enhancements.slice(0, 4).map((enhancement, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent"
            >
              ✓ {enhancement.split("(")[0].trim()}
            </span>
          ))}
          {enhancements.length > 4 && (
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
              +{enhancements.length - 4} more
            </span>
          )}
        </div>
      )}

      {showSideBySide ? (
        /* Side by Side View */
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Original</p>
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border">
              <img
                src={originalImage}
                alt="Original document"
                className="w-full h-full object-contain bg-muted"
              />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-accent">Enhanced</p>
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-accent/50">
              <img
                src={enhancedImage}
                alt="Enhanced document"
                className="w-full h-full object-contain bg-muted"
              />
              <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-accent text-white text-xs font-medium">
                AI Enhanced
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Slider Comparison View */
        <div className="space-y-3">
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border">
            {/* Enhanced Image (Background) */}
            <img
              src={enhancedImage}
              alt="Enhanced document"
              className="absolute inset-0 w-full h-full object-contain bg-muted"
            />

            {/* Original Image (Clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={originalImage}
                alt="Original document"
                className="absolute inset-0 w-full h-full object-contain bg-muted"
              />
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-accent cursor-ew-resize"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-accent shadow-lg flex items-center justify-center">
                <div className="w-1 h-4 bg-white rounded-full" />
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
              Original
            </div>
            <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-accent text-white text-xs font-medium">
              Enhanced
            </div>
          </div>

          {/* Slider Control */}
          <div className="space-y-2">
            <Slider
              value={[sliderPosition]}
              onValueChange={(value) => {
                setSliderPosition(value[0]);
                setHasAutoRevealed(true); // Stop auto-reveal if user manually adjusts
              }}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-center text-muted-foreground">
              {!hasAutoRevealed && autoReveal ? (
                <span className="text-accent animate-pulse">
                  ✨ Watch the AI restoration reveal automatically...
                </span>
              ) : (
                <>Drag to compare • {sliderPosition.toFixed(0)}% enhanced visible</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Enhancement Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
        <span>🎨 {enhancements.length} enhancements applied</span>
        <span>✨ AI-powered restoration</span>
      </div>
    </Card>
  );
};
