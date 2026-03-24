import { ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-destructive/10 p-5 mb-6">
        <ShieldX className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold mb-2">403 — Akses Ditolak</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Anda tidak memiliki izin untuk mengakses halaman ini.
        Silahkan hubungi administrator jika Anda memerlukan akses.
      </p>
      <Button onClick={() => navigate("/", { replace: true })}>
        Kembali ke Dashboard
      </Button>
    </div>
  );
}
