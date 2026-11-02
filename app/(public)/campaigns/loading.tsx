export default function CampaignsLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-36 rounded-full bg-zinc-800" />
        <div className="h-10 w-72 sm:w-96 rounded-lg bg-zinc-800" />
        <div className="h-5 w-full max-w-lg rounded-md bg-zinc-850" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-16 rounded-full bg-zinc-800" />
              <div className="h-4 w-20 rounded bg-zinc-800" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-3/4 rounded bg-zinc-800" />
              <div className="h-4 w-full rounded bg-zinc-850" />
              <div className="h-4 w-2/3 rounded bg-zinc-850" />
            </div>
            <div className="pt-4 border-t border-zinc-800/60 space-y-3">
              <div className="h-2 w-full rounded-full bg-zinc-800" />
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-zinc-800" />
                <div className="h-4 w-24 rounded bg-zinc-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
