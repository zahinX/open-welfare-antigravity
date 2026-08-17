export default function DashboardLoading() {
  return (
    <div className="p-8 w-full max-w-5xl mx-auto animate-pulse">
      <div className="h-8 w-48 bg-zinc-800 rounded-lg mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-zinc-900 rounded-2xl border border-zinc-800"></div>
        ))}
      </div>
      <div className="h-64 bg-zinc-900 rounded-2xl border border-zinc-800"></div>
    </div>
  )
}
