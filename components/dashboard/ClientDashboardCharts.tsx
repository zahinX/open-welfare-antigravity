'use client'

import dynamic from 'next/dynamic'
import type { DashboardChartsProps } from './DashboardCharts'

const DashboardChartsDynamic = dynamic(
  () => import('./DashboardCharts').then(mod => mod.DashboardCharts),
  {
    ssr: false,
    loading: () => <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 min-h-[300px]">Loading chart...</div>
  }
)

export function DashboardChartsWrapper(props: DashboardChartsProps) {
  return <DashboardChartsDynamic {...props} />
}
