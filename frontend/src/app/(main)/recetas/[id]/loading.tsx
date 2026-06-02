import { Skeleton } from '@/components/ui/skeleton'

export default function CargandoDetalle() {
  return (
    <div className="min-h-screen bg-background">
      <Skeleton className="h-[400px] w-full" />
      <div className="-mt-8 relative z-10 bg-background rounded-t-[2rem] px-5 pt-8">
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-9 w-3/4 rounded-xl mb-3" />
        <Skeleton className="h-4 w-full rounded-lg mb-1" />
        <Skeleton className="h-4 w-5/6 rounded-lg mb-6" />
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 rounded-lg mb-1" />
            <Skeleton className="h-3 w-16 rounded-lg" />
          </div>
        </div>
        <div className="flex gap-3 mb-6">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
        <Skeleton className="h-7 w-40 rounded-xl mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl mb-2" />
        ))}
      </div>
    </div>
  )
}
