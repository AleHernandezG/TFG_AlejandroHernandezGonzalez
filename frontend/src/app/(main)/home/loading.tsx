import { Skeleton } from '@/components/ui/skeleton'

export default function CargandoHome() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-6 pb-3">
        <Skeleton className="h-8 w-32 rounded-xl mb-1" />
        <Skeleton className="h-4 w-48 rounded-lg" />
      </div>
      <div className="flex gap-2 px-4 mb-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="flex flex-col gap-4 px-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[420px] w-full rounded-3xl" />
        ))}
      </div>
    </div>
  )
}
