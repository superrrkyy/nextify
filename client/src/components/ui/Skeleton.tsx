import { cn } from '../../lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-surface border border-border/50', className)}
      {...props}
    />
  );
}

export function TrackRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
