import { useEffect } from "react";
import { useLike } from "@/hooks/useLike";
import { LikeButtonUI } from "@/components/ui/like-button";

interface LikeButtonProps {
  postId: number;
  initialLikes: number;
  className?: string;
  isPlaceholder?: boolean;
}

const LikeButton = ({ 
  postId, 
  initialLikes, 
  className = "", 
  isPlaceholder = false 
}: LikeButtonProps) => {
  const {
    likeCount,
    isLiked,
    isProcessing,
    checkLikeStatus,
    handleLike
  } = useLike(postId, initialLikes, isPlaceholder);

  useEffect(() => {
    checkLikeStatus();
  }, [checkLikeStatus]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleLike();
  };

  return (
    <LikeButtonUI
      onClick={handleClick}
      isLiked={isLiked}
      likeCount={likeCount}
      isProcessing={isProcessing}
      className={className}
    />
  );
};

export default LikeButton;