import { cn } from "@/lib/utils";

const statusConfig: Record<string, { bg: string; text: string; label?: string }> = {
  NEW: { bg: "bg-status-new/15", text: "text-status-new" },
  VERIFIED: { bg: "bg-status-verified/15", text: "text-status-verified", label: "Terverifikasi" },
  REJECTED: { bg: "bg-status-rejected/15", text: "text-status-rejected", label: "Ditolak" },
  MONITORING: { bg: "bg-status-monitoring/15", text: "text-status-monitoring" },
  ASSIGNED: { bg: "bg-status-assigned/15", text: "text-status-assigned", label: "Ditugaskan" },
  DEPLOYED: { bg: "bg-status-assigned/15", text: "text-status-assigned" },
  RETURNING: { bg: "bg-status-monitoring/15", text: "text-status-monitoring" },
  ACTIVE: { bg: "bg-status-verified/15", text: "text-status-verified", label: "Aktif" },
  INACTIVE: { bg: "bg-status-rejected/15", text: "text-status-rejected", label: "Nonaktif" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.NEW;
  return (
    <span className={cn("status-badge", config.bg, config.text)}>
      {config.label || status}
    </span>
  );
}
