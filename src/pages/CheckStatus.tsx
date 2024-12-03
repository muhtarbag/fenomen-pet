import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import { rejectionReasons } from "@/components/admin/SubmissionActions/RejectButton";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

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

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            İnceleniyor
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="success" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle2 className="w-4 h-4" />
            Onaylandı
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            Reddedildi
          </Badge>
        );
      default:
        return null;
    }
  };

  const getRejectionReasonText = (reason: string) => {
    const reasonData = rejectionReasons[reason as keyof typeof rejectionReasons];
    return reasonData ? reasonData.label : reason;
  };

  return (
    <>
      <Helmet>
        <title>Gönderi Durumu Sorgula | FenomenPet Başvuru Takip</title>
        <meta name="description" content="FenomenPet'e gönderdiğiniz fotoğrafların durumunu sorgulayın. Başvurunuzun onaylanıp onaylanmadığını öğrenin." />
        <meta name="keywords" content="fenomenpet durum sorgula, başvuru takip, fotoğraf durumu, bonus kontrol" />
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

          {submission && (
            <div className="mt-8 p-6 bg-white shadow-sm rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Gönderi Durumu</h2>
                {getStatusBadge(submission.status)}
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-1">
                  <p className="text-sm text-gray-600">İşlem Numarası</p>
                  <p className="font-medium">{submission.transaction_id}</p>
                </div>
                
                {submission.status === 'rejected' && submission.rejection_reason && (
                  <div className="grid grid-cols-1 gap-1">
                    <p className="text-sm text-gray-600">Red Nedeni</p>
                    <p className="text-red-600 font-medium">
                      {getRejectionReasonText(submission.rejection_reason)}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-1">
                  <p className="text-sm text-gray-600">Gönderim Tarihi</p>
                  <p className="font-medium">
                    {new Date(submission.created_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {submission.image_url && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Gönderilen Fotoğraf</p>
                    <img 
                      src={submission.image_url} 
                      alt="Gönderilen fotoğraf"
                      className="w-full h-auto rounded-lg shadow-sm"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CheckStatus;