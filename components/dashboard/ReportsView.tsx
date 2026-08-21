'use client' // Required for useState, tab switching, and CSV export handlers

import { useState } from 'react'
import {
  getFinancialReportAction,
  getCampaignPerformanceReportAction,
  getBeneficiaryReportAction,
  getVolunteerReportAction,
} from '@/lib/actions/analytics.actions'

type ReportType = 'financial' | 'campaigns' | 'beneficiaries' | 'volunteers'

export function ReportsView() {
  const [activeTab, setActiveTab] = useState<ReportType>('financial')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateReport = async () => {
    setIsLoading(true)
    setError(null)
    setReportData(null)

    const filter = {
      ...(startDate && { startDate: new Date(startDate).toISOString() }),
      ...(endDate && { endDate: new Date(endDate).toISOString() }),
    }

    try {
      let res
      if (activeTab === 'financial') {
        res = await getFinancialReportAction(filter)
      } else if (activeTab === 'campaigns') {
        res = await getCampaignPerformanceReportAction(filter)
      } else if (activeTab === 'beneficiaries') {
        res = await getBeneficiaryReportAction(filter)
      } else {
        res = await getVolunteerReportAction(filter)
      }

      if (res.success) {
        setReportData(res.data)
      } else {
        setError(res.error || 'Failed to generate report')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    const params = new URLSearchParams()
    params.append('type', activeTab)
    if (startDate) params.append('startDate', new Date(startDate).toISOString())
    if (endDate) params.append('endDate', new Date(endDate).toISOString())

    // Construct the export URL and trigger download
    window.location.href = `/api/export/reports?${params.toString()}`
  }

  const tabs: { id: ReportType; label: string }[] = [
    { id: 'financial', label: 'Financial' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'beneficiaries', label: 'Beneficiaries' },
    { id: 'volunteers', label: 'Volunteers' },
  ]

  const renderTableHeaders = () => {
    if (!reportData) return null
    if (activeTab === 'financial') {
      return (
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Type</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Title / Description</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Donor / Beneficiary</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Amount (BDT)</th>
        </tr>
      )
    }
    if (activeTab === 'campaigns') {
      return (
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Campaign</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Target</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Raised</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Disbursed</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Progress</th>
        </tr>
      )
    }
    if (activeTab === 'beneficiaries') {
      return (
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Family Size</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Disbursements</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Received (BDT)</th>
        </tr>
      )
    }
    if (activeTab === 'volunteers') {
      return (
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Shift</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Capacity</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Signups</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Attended</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Rate</th>
        </tr>
      )
    }
  }

  const renderTableRows = () => {
    if (!reportData) return null

    if (activeTab === 'financial') {
      return (reportData.items || []).map((item: any) => (
        <tr key={item.id} className="border-t border-zinc-800">
          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
            {new Date(item.date).toLocaleDateString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              item.type === 'donation' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
            }`}>
              {item.type}
            </span>
          </td>
          <td className="px-6 py-4 text-sm text-zinc-300 max-w-xs truncate">{item.title}</td>
          <td className="px-6 py-4 text-sm text-zinc-300">{item.donorOrBeneficiary}</td>
          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
            item.type === 'donation' ? 'text-emerald-400' : 'text-zinc-300'
          }`}>
            {item.type === 'donation' ? '+' : '-'}{item.convertedAmount.toLocaleString()}
          </td>
        </tr>
      ))
    }

    if (activeTab === 'campaigns') {
      return (reportData as any[]).map((item) => (
        <tr key={item.id} className="border-t border-zinc-800">
          <td className="px-6 py-4 text-sm text-zinc-300 max-w-xs truncate">{item.title}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {item.status}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-zinc-300">
            {item.targetAmount.toLocaleString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-400">
            {item.raisedAmount.toLocaleString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-400">
            {item.disbursedAmount.toLocaleString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-zinc-300">
            {item.progressPercentage}%
          </td>
        </tr>
      ))
    }

    if (activeTab === 'beneficiaries') {
      return (reportData as any[]).map((item) => (
        <tr key={item.id} className="border-t border-zinc-800">
          <td className="px-6 py-4 text-sm text-zinc-300">{item.fullName}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {item.status}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{item.familySize}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-zinc-300">
            {item.disbursementsCount}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-400">
            {item.totalDisbursedAmount.toLocaleString()}
          </td>
        </tr>
      ))
    }

    if (activeTab === 'volunteers') {
      return (reportData as any[]).map((item) => (
        <tr key={item.id} className="border-t border-zinc-800">
          <td className="px-6 py-4 text-sm text-zinc-300">{item.title}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
            {new Date(item.startTime).toLocaleDateString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-zinc-300">
            {item.maxVolunteers}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-400">
            {item.signupsCount}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-400">
            {item.attendedCount}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-zinc-300">
            {item.attendanceRate}%
          </td>
        </tr>
      ))
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-end">
        <div className="flex-1 w-full space-y-4">
          <div className="border-b border-zinc-800">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setReportData(null)
                  }}
                  className={`
                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="startDate" className="block text-sm font-medium text-zinc-400 mb-1">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="endDate" className="block text-sm font-medium text-zinc-400 mb-1">End Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGenerateReport}
            disabled={isLoading}
            className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate Report'}
          </button>
          {reportData && (
            <button
              onClick={handleExportCSV}
              className="flex-1 md:flex-none px-4 py-2 border border-zinc-700 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Report Data Table */}
      {reportData && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm overflow-hidden">
          {activeTab === 'financial' && reportData.netBalance !== undefined && (
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-zinc-800 bg-zinc-950/50">
              <div>
                <p className="text-sm font-medium text-zinc-500">Total Donations</p>
                <p className="text-xl font-bold text-emerald-400">{reportData.totalDonations.toLocaleString()} BDT</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Total Disbursements</p>
                <p className="text-xl font-bold text-blue-400">{reportData.totalDisbursements.toLocaleString()} BDT</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Net Balance</p>
                <p className={`text-xl font-bold ${reportData.netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {reportData.netBalance.toLocaleString()} BDT
                </p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-900">
                {renderTableHeaders()}
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
                {renderTableRows()}
              </tbody>
            </table>
            
            {((activeTab === 'financial' && reportData.items?.length === 0) || 
              (activeTab !== 'financial' && reportData.length === 0)) && (
              <div className="p-8 text-center text-zinc-500">
                No data found for the selected criteria.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
