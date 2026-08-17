export default function CampaignsLoading() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="h-7 w-40 bg-zinc-800 rounded-lg mb-2" />
          <div className="h-4 w-64 bg-zinc-900 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-zinc-800 rounded-lg" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="bg-zinc-900/60 px-5 py-3.5 border-b border-zinc-800">
          <div className="flex gap-10">
            {['w-24', 'w-16', 'w-16', 'w-16', 'w-20'].map((w, i) => (
              <div key={i} className={`h-3 ${w} bg-zinc-800 rounded`} />
            ))}
          </div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-5 py-4 border-b border-zinc-800/60 bg-zinc-950 flex items-center gap-6">
            <div className="flex-1">
              <div className="h-4 w-48 bg-zinc-800 rounded mb-2" />
              <div className="h-1 w-32 bg-zinc-800 rounded-full" />
            </div>
            <div className="h-5 w-16 bg-zinc-800 rounded-full" />
            <div className="h-4 w-20 bg-zinc-800 rounded ml-auto" />
            <div className="h-4 w-20 bg-zinc-800 rounded" />
            <div className="h-4 w-24 bg-zinc-800 rounded" />
            <div className="h-4 w-16 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
