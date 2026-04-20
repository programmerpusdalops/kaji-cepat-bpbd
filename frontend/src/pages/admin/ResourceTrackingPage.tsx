/**
 * ResourceTrackingPage — Admin Resource Needs vs Fulfilled Dashboard
 *
 * TODO: Replace mock data with real API calls to /api/v1/resources
 * Features: Visual progress bars, fulfillment percentage, grouped by disaster,
 * form to update quantities
 */

import { useState } from "react";
import { mockResources, type ResourceItem } from "@/dummy-data/feedsMockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Package, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, Edit2, Search, BarChart3
} from "lucide-react";
import { toast } from "sonner";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

function ProgressBar({ fulfilled, needed }: { fulfilled: number; needed: number }) {
  const percent = needed > 0 ? Math.min((fulfilled / needed) * 100, 100) : 0;
  const color =
    percent >= 80 ? "bg-green-500" :
    percent >= 50 ? "bg-amber-500" :
    "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">
          {fulfilled.toLocaleString("id-ID")} / {needed.toLocaleString("id-ID")}
        </span>
        <span className={`font-semibold ${
          percent >= 80 ? "text-green-600 dark:text-green-400" :
          percent >= 50 ? "text-amber-600 dark:text-amber-400" :
          "text-red-600 dark:text-red-400"
        }`}>
          {percent.toFixed(0)}%
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function ResourceTrackingPage() {
  const [resources, setResources] = useState<ResourceItem[]>(mockResources);
  const [search, setSearch] = useState("");
  const [filterEvent, setFilterEvent] = useState("ALL");
  const [editItem, setEditItem] = useState<ResourceItem | null>(null);
  const [editFulfilled, setEditFulfilled] = useState("");

  // Get unique disaster events
  const events = [...new Set(resources.map(r => r.disasterEvent))];

  const filtered = resources.filter(r => {
    if (filterEvent !== "ALL" && r.disasterEvent !== filterEvent) return false;
    if (search) return r.name.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  // Group by disaster event
  const grouped = filtered.reduce<Record<string, ResourceItem[]>>((acc, item) => {
    if (!acc[item.disasterEvent]) acc[item.disasterEvent] = [];
    acc[item.disasterEvent].push(item);
    return acc;
  }, {});

  // Stats
  const totalNeeded = resources.reduce((s, r) => s + r.needed, 0);
  const totalFulfilled = resources.reduce((s, r) => s + r.fulfilled, 0);
  const overallRate = totalNeeded > 0 ? (totalFulfilled / totalNeeded) * 100 : 0;
  const criticalCount = resources.filter(r => (r.fulfilled / r.needed) < 0.5).length;

  const handleUpdate = () => {
    if (!editItem) return;
    const newVal = parseInt(editFulfilled);
    if (isNaN(newVal) || newVal < 0) {
      toast.error("Masukkan jumlah yang valid");
      return;
    }
    // TODO: PUT /api/v1/resources/:id
    setResources(prev =>
      prev.map(r =>
        r.id === editItem.id
          ? { ...r, fulfilled: newVal, lastUpdated: new Date().toISOString() }
          : r
      )
    );
    toast.success(`${editItem.name} berhasil diperbarui`);
    setEditItem(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Package className="h-7 w-7 text-primary" />
          Tracking Logistik & Sumber Daya
        </h1>
        <p className="page-subtitle">Pantau kebutuhan vs pemenuhan logistik bencana secara real-time</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="stat-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-sm text-muted-foreground">Total Item</span>
          </div>
          <p className="text-2xl font-bold">{resources.length}</p>
        </div>
        <div className="stat-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg p-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-sm text-muted-foreground">Tingkat Pemenuhan</span>
          </div>
          <p className="text-2xl font-bold">{overallRate.toFixed(0)}%</p>
        </div>
        <div className="stat-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-sm text-muted-foreground">Tercukupi (&gt;80%)</span>
          </div>
          <p className="text-2xl font-bold">{resources.filter(r => (r.fulfilled / r.needed) >= 0.8).length}</p>
        </div>
        <div className="stat-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg p-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <span className="text-sm text-muted-foreground">Kritis (&lt;50%)</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari item logistik..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterEvent} onValueChange={setFilterEvent}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter kejadian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Kejadian</SelectItem>
            {events.map(ev => (
              <SelectItem key={ev} value={ev}>{ev}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resource Cards grouped by disaster */}
      {Object.entries(grouped).map(([event, items]) => (
        <div key={event} className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {event}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
            {items.map(item => {
              const percent = item.needed > 0 ? (item.fulfilled / item.needed) * 100 : 0;
              return (
                <div key={item.id} className="stat-card p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.unit}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => {
                        setEditItem(item);
                        setEditFulfilled(String(item.fulfilled));
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <ProgressBar fulfilled={item.fulfilled} needed={item.needed} />
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Update: {formatDate(item.lastUpdated)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Update Dialog */}
      <Dialog open={editItem !== null} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update {editItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Kebutuhan: <span className="font-semibold text-foreground">{editItem?.needed.toLocaleString("id-ID")} {editItem?.unit}</span>
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fulfilled-input">Jumlah Terpenuhi</Label>
              <Input
                id="fulfilled-input"
                type="number"
                value={editFulfilled}
                onChange={e => setEditFulfilled(e.target.value)}
                min={0}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Batal</Button>
            <Button onClick={handleUpdate}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
