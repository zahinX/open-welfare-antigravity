export default function NewShiftLoading() {
  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-4 w-36 bg-zinc-800 rounded mb-4" />
        <div className="h-7 w-48 bg-zinc-800 rounded mb-2" />
        <div className="h-4 w-80 bg-zinc-800 rounded" />
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8 space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <div className="h-3.5 w-24 bg-zinc-800 rounded mb-2" />
            <div className="h-10 w-full bg-zinc-800 rounded-lg" />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <div className="h-10 w-28 bg-zinc-800 rounded-lg" />
          <div className="h-10 w-20 bg-zinc-800 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
