export default function VolunteerLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-10">
        <div className="h-9 w-72 bg-zinc-800 rounded-lg mb-3" />
        <div className="h-5 w-96 bg-zinc-800 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
            <div className="h-5 w-3/4 bg-zinc-800 rounded" />
            <div className="h-4 w-full bg-zinc-800 rounded" />
            <div className="h-4 w-1/2 bg-zinc-800 rounded" />
            <div className="h-2 w-full bg-zinc-800 rounded-full" />
            <div className="h-10 w-full bg-zinc-800 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
