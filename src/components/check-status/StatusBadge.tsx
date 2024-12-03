import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string | null;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
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
        <Badge 
          variant="outline" 
          className={cn(
            "flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          Onaylandı
        </Badge>
      );
    case 'rejected':
      return (
        <Badge 
          variant="destructive" 
          className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white"
        >
          <XCircle className="w-4 h-4" />
          Reddedildi
        </Badge>
      );
    default:
      return null;
  }
};