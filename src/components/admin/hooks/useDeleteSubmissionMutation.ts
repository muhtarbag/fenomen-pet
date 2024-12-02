import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteSubmissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      console.log('🗑️ Starting deletion process for submission:', id);

      try {
        // First check if the submission exists in rejected_submissions
        const { data: rejectedData, error: findError } = await supabase
          .from('rejected_submissions')
          .select('id')
          .eq('original_submission_id', id)
          .single();

        console.log('🔍 Checking rejected submissions:', { rejectedData, findError });

        if (rejectedData) {
          console.log('📝 Found rejected submission record, deleting it first');
          const { error: rejectedError } = await supabase
            .from('rejected_submissions')
            .delete()
            .eq('original_submission_id', id);

          if (rejectedError) {
            console.error('❌ Error deleting from rejected_submissions:', rejectedError);
            throw new Error(`Failed to delete rejected submission: ${rejectedError.message}`);
          }
        }

        // Then delete from submission_likes table
        console.log('🗑️ Deleting from submission_likes');
        const { error: likesError } = await supabase
          .from('submission_likes')
          .delete()
          .eq('submission_id', id);

        if (likesError) {
          console.error('❌ Error deleting from submission_likes:', likesError);
          throw new Error(`Failed to delete likes: ${likesError.message}`);
        }

        // Finally delete from submissions table
        console.log('🗑️ Deleting from submissions');
        const { error: submissionError } = await supabase
          .from('submissions')
          .delete()
          .eq('id', id);

        if (submissionError) {
          console.error('❌ Error deleting from submissions:', submissionError);
          throw new Error(`Failed to delete submission: ${submissionError.message}`);
        }

        console.log('✅ Successfully deleted submission and related records');
        return id;
      } catch (error: any) {
        console.error('❌ Delete operation failed:', error);
        throw error;
      }
    },
    onSuccess: (deletedId) => {
      console.log('✨ Delete mutation success:', deletedId);
      
      // Force a complete cache invalidation
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      
      toast.success("İçerik başarıyla silindi");
    },
    onError: (error: Error) => {
      console.error('❌ Delete mutation error:', error);
      toast.error(`Silme işlemi başarısız: ${error.message}`);
    }
  });
};