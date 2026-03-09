import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, iconColor = "text-primary" }: StatCardProps) {
  return (
    <div className="stat-card flex items-center gap-4">
      <div className={`rounded-lg bg-primary/10 p-3 ${iconColor}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{typeof value === "number" ? value.toLocaleString("id-ID") : value}</p>
      </div>
    </div>
  );
}
