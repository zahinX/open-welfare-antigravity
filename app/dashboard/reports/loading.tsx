export default function ReportsLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-56 bg-zinc-800 rounded-lg mb-2" />
        <div className="h-4 w-96 bg-zinc-900 rounded-lg" />
      </div>

      {/* Filter and tab bar skeleton */}
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900 space-y-4">
        <div className="flex gap-6 border-b border-zinc-800 pb-4">
          <div className="h-4 w-20 bg-zinc-800 rounded" />
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-4 w-28 bg-zinc-800 rounded" />
          <div className="h-4 w-20 bg-zinc-800 rounded" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <div className="flex-1 h-10 bg-zinc-950 rounded-md border border-zinc-800" />
          <div className="flex-1 h-10 bg-zinc-950 rounded-md border border-zinc-800" />
          <div className="w-36 h-10 bg-zinc-800 rounded-md" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-zinc-800 bg-zinc-950/50">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-zinc-800 rounded" />
            <div className="h-6 w-32 bg-zinc-800 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-28 bg-zinc-800 rounded" />
            <div className="h-6 w-32 bg-zinc-800 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 bg-zinc-800 rounded" />
            <div className="h-6 w-32 bg-zinc-800 rounded" />
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-zinc-950/50 rounded flex items-center px-4 gap-6">
              <div className="h-3 w-24 bg-zinc-800 rounded" />
              <div className="h-4 w-16 bg-zinc-800 rounded-full" />
              <div className="h-3 w-48 bg-zinc-800 rounded" />
              <div className="h-3 w-24 bg-zinc-800 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
