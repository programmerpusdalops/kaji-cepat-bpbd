/**
 * SkeletonLoaders — Reusable skeleton components for loading states
 *
 * Used across all pages to replace spinners with shimmer skeletons
 * that match the actual content layout.
 */

import { Skeleton } from "@/components/ui/skeleton";

// ─── Dashboard Skeleton ───────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-72 skeleton-shimmer" />
        <Skeleton className="h-4 w-96 mt-2 skeleton-shimmer" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5 space-y-3" style={{ animationDelay: `${i * 80}ms` }}>
            <Skeleton className="h-4 w-24 skeleton-shimmer" />
            <Skeleton className="h-9 w-20 skeleton-shimmer" />
            <Skeleton className="h-3 w-32 skeleton-shimmer" />
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="stat-card p-5 space-y-4">
            <Skeleton className="h-5 w-40 skeleton-shimmer" />
            <Skeleton className="h-16 w-16 rounded-full skeleton-shimmer" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full skeleton-shimmer" />
              <Skeleton className="h-3 w-3/4 skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="stat-card p-5">
            <Skeleton className="h-5 w-48 mb-4 skeleton-shimmer" />
            <Skeleton className="h-[280px] w-full rounded-lg skeleton-shimmer" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="stat-card p-5">
        <Skeleton className="h-5 w-36 mb-4 skeleton-shimmer" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-28 skeleton-shimmer" />
              <Skeleton className="h-4 w-40 skeleton-shimmer" />
              <Skeleton className="h-4 w-24 skeleton-shimmer" />
              <Skeleton className="h-5 w-20 rounded-full skeleton-shimmer" />
              <Skeleton className="h-4 w-16 skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Table Skeleton ───────────────────────────────────────────

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="stat-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 skeleton-shimmer" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 p-4 border-b last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className="h-4 flex-1 skeleton-shimmer"
              style={{ maxWidth: c === 0 ? "120px" : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Card Grid Skeleton ──────────────────────────────────────

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="stat-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg skeleton-shimmer" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4 skeleton-shimmer" />
              <Skeleton className="h-3 w-1/2 skeleton-shimmer" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full skeleton-shimmer" />
            <Skeleton className="h-3 w-5/6 skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Map Skeleton ────────────────────────────────────────────

export function MapSkeleton() {
  return (
    <div className="stat-card p-5">
      <Skeleton className="h-5 w-40 mb-4 skeleton-shimmer" />
      <Skeleton className="h-[450px] w-full rounded-lg skeleton-shimmer" />
    </div>
  );
}

// ─── Profile Skeleton ────────────────────────────────────────

export function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Skeleton className="h-8 w-48 skeleton-shimmer" />
        <Skeleton className="h-4 w-72 mt-2 skeleton-shimmer" />
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <Skeleton className="h-24 w-full skeleton-shimmer" />
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-end gap-4 -mt-10">
            <Skeleton className="h-20 w-20 rounded-full skeleton-shimmer" />
            <div className="space-y-2 pb-1">
              <Skeleton className="h-6 w-48 skeleton-shimmer" />
              <Skeleton className="h-4 w-32 skeleton-shimmer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 skeleton-shimmer" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
