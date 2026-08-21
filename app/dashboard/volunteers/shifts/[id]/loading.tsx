export default function ShiftDetailLoading() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-4 w-24 bg-zinc-800 rounded mb-4" />
        <div className="h-8 w-96 bg-zinc-800 rounded mb-3" />
        <div className="flex gap-3">
          <div className="h-5 w-32 bg-zinc-800 rounded-full" />
          <div className="h-5 w-28 bg-zinc-800 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main detail card */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-zinc-800 rounded mb-2" />
              <div className="h-4 w-full bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
        {/* Stat card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-3">
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-10 w-16 bg-zinc-800 rounded" />
          <div className="h-2 w-full bg-zinc-800 rounded-full" />
        </div>
      </div>

      {/* Roster */}
      <div className="mt-6 rounded-2xl border border-zinc-800 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-center justify-between border-b border-zinc-800/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800" />
              <div className="h-4 w-32 bg-zinc-800 rounded" />
            </div>
            <div className="h-6 w-20 bg-zinc-800 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
