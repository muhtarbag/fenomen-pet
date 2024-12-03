import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useLike = (postId: number, initialLikes: number, isPlaceholder: boolean = false) => {
  const [likeCount, setLikeCount] = useState(initialLikes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const checkLikeStatus = useCallback(async () => {
    if (isPlaceholder) return;
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user?.id) {
        const { data, error } = await supabase
          .from('submission_likes')
          .select('*')
          .eq('submission_id', postId)
          .eq('user_id', session.session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking like status:', error);
          return;
        }
        
        setIsLiked(!!data);
      } else {
        // Yerel depolama kontrolü
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        setIsLiked(likedPosts.includes(postId));
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  }, [postId, isPlaceholder]);

  const handleLike = async () => {
    if (isPlaceholder) {
      toast.error("Bu bir örnek gönderidir, beğeni yapılamaz.");
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        // Oturum açmamış kullanıcılar için yerel depolama kontrolü
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        
        if (likedPosts.includes(postId)) {
          toast.error("Bu gönderiyi zaten beğenmişsiniz.");
          setIsProcessing(false);
          return;
        }

        // IP tabanlı kontrol
        const clientIp = await fetch('https://api.ipify.org?format=json')
          .then(response => response.json())
          .then(data => data.ip);

        try {
          const { error: insertError } = await supabase
            .from('anonymous_likes')
            .insert({
              submission_id: postId,
              ip_address: clientIp
            });

          if (insertError) {
            if (insertError.message.includes('24 saat içinde')) {
              toast.error("24 saat içinde tekrar beğeni yapamazsınız.");
              return;
            }
            throw insertError;
          }

          likedPosts.push(postId);
          localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
          toast.success("Beğeni kaydedildi!");
        } catch (error: any) {
          if (error.message.includes('24 saat içinde')) {
            toast.error("24 saat içinde tekrar beğeni yapamazsınız.");
          } else {
            throw error;
          }
        }
      } else {
        // Oturum açmış kullanıcılar için beğeni işlemi
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
            .insert({ 
              submission_id: postId,
              user_id: session.session.user.id
            });

          if (error) {
            if (error.code === '23505') {
              toast.error("Bu gönderiyi zaten beğenmişsiniz.");
              setIsLiked(true);
              return;
            }
            throw error;
          }
          
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
          toast.success("Beğeni kaydedildi!");
        }
      }
    } catch (error: any) {
      console.error('Like error:', error);
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
      
      // Optimistic update'i geri al
      if (isLiked) {
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      } else {
        setLikeCount(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    likeCount,
    isLiked,
    isProcessing,
    checkLikeStatus,
    handleLike
  };
};