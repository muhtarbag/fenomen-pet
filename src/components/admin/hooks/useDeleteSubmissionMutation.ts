import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Submission } from "./useSubmissions";

export const useDeleteSubmissionMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      console.log('🗑️ Starting deletion process for submission:', id);
      
      try {
        // İlk olarak gönderinin var olup olmadığını kontrol et
        const { data: submission, error: checkError } = await supabase
          .from('submissions')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (checkError) {
          console.error('❌ Error checking submission:', checkError);
          throw new Error('Gönderi kontrol edilirken bir hata oluştu');
        }

        if (!submission) {
          console.log('⚠️ Submission not found');
          throw new Error('Gönderi bulunamadı');
        }

        // Önce rejected_submissions tablosundan sil
        const { error: rejectedError } = await supabase
          .from('rejected_submissions')
          .delete()
          .eq('original_submission_id', id);

        if (rejectedError) {
          console.error('❌ Error deleting from rejected_submissions:', rejectedError);
          throw new Error('Reddedilen gönderi silinirken bir hata oluştu');
        }

        console.log('✅ Successfully deleted from rejected_submissions');

        // Sonra ana submissions tablosundan sil
        const { error: submissionError } = await supabase
          .from('submissions')
          .delete()
          .eq('id', id);

        if (submissionError) {
          console.error('❌ Error deleting from submissions:', submissionError);
          throw new Error('Gönderi silinirken bir hata oluştu');
        }

        console.log('✅ Successfully deleted submission');
        return submission as Submission;

      } catch (error) {
        console.error('❌ Delete operation failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('✨ Delete mutation success');
      toast.success('Gönderi başarıyla silindi');
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
    onError: (error: Error) => {
      console.error('❌ Delete mutation error:', error);
      toast.error(error.message || "Silme işlemi başarısız oldu");
    }
  });
};