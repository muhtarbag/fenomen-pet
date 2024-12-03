import { StatusBadge } from "./StatusBadge";
import { rejectionReasons } from "@/components/admin/SubmissionActions/RejectButton";

interface SubmissionDetailsProps {
  submission: {
    transaction_id: string;
    status: string;
    rejection_reason?: string;
    created_at: string;
    image_url?: string;
  };
}

export const SubmissionDetails = ({ submission }: SubmissionDetailsProps) => {
  const getRejectionReasonText = (reason: string) => {
    const reasonData = rejectionReasons[reason as keyof typeof rejectionReasons];
    return reasonData ? reasonData.label : reason;
  };

  return (
    <div className="mt-8 p-6 bg-white shadow-sm rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Gönderi Durumu</h2>
        <StatusBadge status={submission.status} />
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
  );
};