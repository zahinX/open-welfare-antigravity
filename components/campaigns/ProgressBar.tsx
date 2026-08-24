interface ProgressBarProps {
  current: number
  target: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({
  current,
  target,
  className = '',
  showLabel = false,
}: ProgressBarProps) {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0
  const actualPercentage = target > 0 ? (current / target) * 100 : 0

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-zinc-400">
          <span>{actualPercentage.toFixed(1)}% funded</span>
          <span>{percentage}% of goal</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label={`Fundraising progress: ${percentage}% of goal reached`}
        className="h-2.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
