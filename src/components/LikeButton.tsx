import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LikeButtonProps {
  postId: number;
  initialLikes: number;
  className?: string;
  isPlaceholder?: boolean;
}

const LikeButton = ({ postId, initialLikes, className = "", isPlaceholder = false }: LikeButtonProps) => {
  const [likeCount, setLikeCount] = useState(initialLikes || 0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (isPlaceholder) return;
      
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user?.id) {
          // First verify if the submission exists
          const { data: submission, error: submissionError } = await supabase
            .from('submissions')
            .select('id')
            .eq('id', postId)
            .single();
          
          if (submissionError || !submission) {
            console.error('Submission not found:', submissionError);
            return;
          }

          const { data, error } = await supabase
            .from('submission_likes')
            .select('*')
            .eq('submission_id', postId)
            .eq('user_id', session.session.user.id);
          
          if (error) {
            console.error('Error checking like status:', error);
            return;
          }
          
          setIsLiked(Boolean(data?.length));
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkLikeStatus();
  }, [postId, isPlaceholder]);

  const createNotification = async (username: string) => {
    const { error } = await supabase
      .from('like_notifications')
      .insert([
        {
          submission_id: postId,
          username: username
        }
      ]);

    if (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isPlaceholder) {
      toast.error("Bu bir örnek gönderidir, beğeni yapılamaz.");
      return;
    }
    
    try {
      // First verify if the submission exists
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .select('id')
        .eq('id', postId)
        .single();
      
      if (submissionError || !submission) {
        toast.error("Bu gönderi artık mevcut değil.");
        return;
      }

      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        // Anonymous like - just increment the count and create notification
        const { error } = await supabase
          .from('submissions')
          .update({ likes: likeCount + 1 })
          .eq('id', postId);

        if (error) throw error;
        
        await createNotification('Anonim');
        setLikeCount(prev => prev + 1);
        toast.success("Beğeni kaydedildi!");
        return;
      }

      // Authenticated like - record in submission_likes table
      if (isLiked) {
        const { error } = await supabase
          .from('submission_likes')
          .delete()
          .eq('submission_id', postId)
          .eq('user_id', session.session.user.id);

        if (error) throw error;
        
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        toast.success("Beğeni kaldırıldı");
      } else {
        const { error } = await supabase
          .from('submission_likes')
          .insert([
            { 
              submission_id: postId,
              user_id: session.session.user.id
            }
          ])
          .select()
          .single();

        if (error) {
          // If we get a duplicate key error, it means the user has already liked this submission
          if (error.code === '23505') {
            toast.error("Bu gönderiyi zaten beğenmişsiniz.");
            // Refresh the like status
            setIsLiked(true);
            return;
          }
          throw error;
        }
        
        await createNotification(session.session.user.email || 'Kullanıcı');
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        toast.success("Beğeni kaydedildi!");
      }
    } catch (error: any) {
      console.error('Like error:', error);
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
      
      // Revert optimistic update
      if (isLiked) {
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      } else {
        setLikeCount(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      }
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-1 text-gray-600 hover:text-primary transition-colors ${className}`}
    >
      <Heart
        size={20}
        className={`transition-colors ${
          isLiked ? "fill-red-500 text-red-500" : ""
        }`}
      />
      <span>{likeCount}</span>
    </button>
  );
};

export default LikeButton;