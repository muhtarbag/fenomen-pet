import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteSubmissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: number) => {
      console.log('🗑️ Starting deletion process for submission:', submissionId);

      // First check if submission exists
      const { data: existingSubmission } = await supabase
        .from('submissions')
        .select()
        .eq('id', submissionId)
        .maybeSingle();

      if (!existingSubmission) {
        console.error('❌ Submission not found:', submissionId);
        throw new Error('Gönderi bulunamadı');
      }

      // Delete associated likes
      const { error: likesError } = await supabase
        .from('submission_likes')
        .delete()
        .eq('submission_id', submissionId);

      if (likesError) {
        console.error('❌ Error deleting likes:', likesError);
        throw new Error('Beğeniler silinirken bir hata oluştu');
      }

      // Delete associated rejected submissions
      const { error: rejectedError } = await supabase
        .from('rejected_submissions')
        .delete()
        .eq('original_submission_id', submissionId);

      if (rejectedError) {
        console.error('❌ Error deleting rejected submission:', rejectedError);
        throw new Error('Reddedilen gönderi silinirken bir hata oluştu');
      }

      // Finally, delete the submission itself
      const { error: submissionError } = await supabase
        .from('submissions')
        .delete()
        .eq('id', submissionId);

      if (submissionError) {
        console.error('❌ Error deleting submission:', submissionError);
        throw new Error('Gönderi silinirken bir hata oluştu');
      }

      console.log('✅ Successfully deleted submission and related records:', submissionId);
      return submissionId;
    },
    onSuccess: (deletedId) => {
      console.log('✨ Delete mutation success:', deletedId);
      
      // Immediately update the cache to remove the deleted item
      queryClient.setQueryData(['submissions'], (oldData: any[] | undefined) => {
        if (!oldData) return [];
        const newData = oldData.filter(submission => submission.id !== deletedId);
        console.log('📊 Cache size after delete:', newData.length);
        return newData;
      });

      // Then invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ['submissions']
      });
      
      toast.success("Gönderi başarıyla silindi");
    },
    onError: (error: Error) => {
      console.error('❌ Delete mutation error:', error);
      toast.error(error.message || "Gönderi silinirken bir hata oluştu");
    }
  });
};