import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "./blog/types";
import { BlogPostItem } from "./blog/BlogPostItem";
import { EditBlogPostDialog } from "./blog/EditBlogPostDialog";

export const BlogPostList = () => {
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const { data: posts, refetch } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      console.log('🔄 Fetching blog posts...');
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error('❌ Error fetching blog posts:', error);
        throw error;
      }
      
      console.log('✅ Fetched blog posts:', data);
      return data as BlogPost[];
    },
  });

  const handleDelete = async (id: number) => {
    try {
      console.log('🗑️ Attempting to delete blog post:', id);
      
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);

      if (error) {
        console.error('❌ Error deleting blog post:', error);
        throw error;
      }

      console.log('✅ Successfully deleted blog post:', id);
      toast.success("Blog yazısı başarıyla silindi");
      refetch();
    } catch (error: any) {
      console.error('❌ Error in handleDelete:', error);
      toast.error("Blog yazısı silinirken bir hata oluştu: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {posts?.map((post) => (
        <BlogPostItem
          key={post.id}
          post={post}
          onEdit={setEditingPost}
          onDelete={handleDelete}
        />
      ))}

      <EditBlogPostDialog
        post={editingPost}
        onClose={() => setEditingPost(null)}
        onSuccess={refetch}
      />
    </div>
  );
};