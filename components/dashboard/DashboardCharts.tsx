'use client' // Required for Recharts client-side rendering and interactive tooltips

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

interface DashboardChartsProps {
  type: 'beneficiary' | 'volunteer'
  data: any
  title: string
  subtitle?: string
}

export function DashboardCharts({ type, data, title, subtitle }: DashboardChartsProps) {
  // Theme colors based on our design system
  const COLORS = ['#10b981', '#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6']

  const renderBeneficiaryChart = () => {
    // Format the record object into an array for Recharts
    const chartData = Object.entries(data || {}).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }))

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.5rem', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  const renderVolunteerChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="title" 
            stroke="#a1a1aa" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
          />
          <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.5rem', color: '#fff' }}
            cursor={{ fill: '#27272a', opacity: 0.4 }}
          />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="signups_count" name="Signups" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="attended_count" name="Attended" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        {type === 'beneficiary' ? renderBeneficiaryChart() : renderVolunteerChart()}
      </div>
    </div>
  )
}
