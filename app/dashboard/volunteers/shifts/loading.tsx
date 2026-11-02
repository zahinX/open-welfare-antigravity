export default function ShiftsLoading() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="h-7 w-40 bg-zinc-800 rounded-lg" />
          <div className="mt-2 h-4 w-64 bg-zinc-800 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-zinc-800 rounded-lg" />
      </div>
      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="bg-zinc-900/60 border-b border-zinc-800 px-5 py-3.5 grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 bg-zinc-800 rounded" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-5 py-4 grid grid-cols-5 gap-4 border-b border-zinc-800/60">
            <div className="col-span-2 h-4 bg-zinc-800 rounded" />
            <div className="h-4 bg-zinc-800 rounded" />
            <div className="h-4 bg-zinc-800 rounded" />
            <div className="h-4 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
