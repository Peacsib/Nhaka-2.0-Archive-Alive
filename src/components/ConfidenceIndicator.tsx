import { cn } from "@/lib/utils";

interface ConfidenceIndicatorProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animate?: boolean;
}

export const ConfidenceIndicator = ({
  value,
  size = "md",
  showLabel = true,
  animate = true,
}: ConfidenceIndicatorProps) => {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
  };

  const getColor = (val: number) => {
    if (val >= 80) return "stroke-agent-reconstructor";
    if (val >= 60) return "stroke-accent";
    return "stroke-agent-scanner";
  };

  return (
    <div className={cn("relative", sizeClasses[size])}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          className="stroke-muted"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          className={cn(getColor(value), animate && "transition-all duration-1000 ease-out")}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? strokeDashoffset : circumference}
          style={{
            animation: animate ? `confidence-fill 1s ease-out forwards` : undefined,
          }}
        />
      </svg>
      {showLabel && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center font-mono font-semibold",
          textSizeClasses[size]
        )}>
          {value}%
        </div>
      )}
    </div>
  );
};

export const InlineConfidence = ({ value }: { value: number }) => {
  const getColorClass = (val: number) => {
    if (val >= 80) return "text-agent-reconstructor bg-agent-reconstructor-bg";
    if (val >= 60) return "text-accent bg-accent/10";
    return "text-agent-scanner bg-agent-scanner-bg";
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-medium",
      getColorClass(value)
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {value}%
    </span>
  );
};
