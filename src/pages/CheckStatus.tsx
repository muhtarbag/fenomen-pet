import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import { SubmissionDetails } from "@/components/check-status/SubmissionDetails";

const CheckStatus = () => {
  const [username, setUsername] = useState("");
  const [searchInitiated, setSearchInitiated] = useState(false);

  const { data: submission, isLoading } = useQuery({
    queryKey: ["submission-status", username],
    queryFn: async () => {
      if (!username) return null;
      
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("username", username)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching submission:", error);
        toast.error("Sorgulama sırasında bir hata oluştu");
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;
    },
    enabled: searchInitiated && !!username,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Lütfen kullanıcı adınızı girin");
      return;
    }
    setSearchInitiated(true);
  };

  return (
    <>
      <Helmet>
        <title>Gönderi Durumu Sorgula | FenomenPet Başvuru Takip</title>
        <meta 
          name="description" 
          content="FenomenPet'e gönderdiğiniz fotoğrafların durumunu sorgulayın. Başvurunuzun onaylanıp onaylanmadığını öğrenin." 
        />
        <meta 
          name="keywords" 
          content="fenomenpet durum sorgula, başvuru takip, fotoğraf durumu, bonus kontrol" 
        />
        <link rel="canonical" href="https://fenomenpet.com/check-status" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "FenomenPet Gönderi Durumu Sorgula",
            "description": "FenomenPet'e gönderdiğiniz fotoğrafların durumunu sorgulayın.",
            "publisher": {
              "@type": "Organization",
              "name": "FenomenPet",
              "logo": {
                "@type": "ImageObject",
                "url": "https://fenomenpet.com/lovable-uploads/a06650c0-2ee1-42dd-9217-cef8bdd67039.png"
              }
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">
            Gönderi Durumu Sorgula
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Kullanıcı Adı
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@kullaniciadi"
                className="w-full"
                autoComplete="off"
              />
            </div>
            
            <Button type="submit" className="w-full">
              Sorgula
            </Button>
          </form>

          {isLoading && (
            <div className="text-center mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-2">Sorgulanıyor...</p>
            </div>
          )}

          {searchInitiated && !isLoading && !submission && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-center text-yellow-800">
                Bu kullanıcı adına ait gönderi bulunamadı.
              </p>
            </div>
          )}

          {submission && <SubmissionDetails submission={submission} />}
        </div>
      </div>
    </>
  );
};

export default CheckStatus;