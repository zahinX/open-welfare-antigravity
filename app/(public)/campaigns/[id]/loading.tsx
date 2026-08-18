export default function CampaignDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-5 w-36 rounded bg-zinc-800" />

      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="h-6 w-24 rounded-full bg-zinc-800" />
          <div className="h-6 w-36 rounded bg-zinc-800" />
        </div>
        <div className="h-10 w-3/4 rounded-lg bg-zinc-800" />
      </div>

      {/* Progress card skeleton */}
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-zinc-800" />
            <div className="h-8 w-32 rounded bg-zinc-800" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-zinc-800" />
            <div className="h-8 w-32 rounded bg-zinc-800" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-zinc-800" />
            <div className="h-8 w-32 rounded bg-zinc-800" />
          </div>
        </div>
        <div className="h-3 w-full rounded-full bg-zinc-800" />
      </div>

      {/* Description skeleton */}
      <div className="space-y-4 pt-4">
        <div className="h-7 w-48 rounded bg-zinc-800" />
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6 sm:p-8 space-y-3">
          <div className="h-4 w-full rounded bg-zinc-850" />
          <div className="h-4 w-5/6 rounded bg-zinc-850" />
          <div className="h-4 w-4/6 rounded bg-zinc-850" />
        </div>
      </div>
    </div>
  )
}
