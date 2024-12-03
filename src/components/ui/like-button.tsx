import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonUIProps {
  onClick: (e: React.MouseEvent) => void;
  isLiked: boolean;
  likeCount: number;
  isProcessing: boolean;
  className?: string;
}

export const LikeButtonUI = ({
  onClick,
  isLiked,
  likeCount,
  isProcessing,
  className = ""
}: LikeButtonUIProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isProcessing}
      className={cn(
        "flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors",
        isProcessing && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label={isLiked ? "Beğeniyi kaldır" : "Beğen"}
    >
      <Heart
        size={20}
        className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'fill-none'}`}
      />
      <span className="text-red-500">{likeCount}</span>
    </button>
  );
};