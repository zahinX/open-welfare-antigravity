import {
  FinancialSummaryReport,
  CampaignPerformanceItem,
  BeneficiaryReportItem,
  VolunteerShiftReportItem,
} from '@/lib/services/reports'

/**
 * Escapes a field for CSV format (RFC 4180).
 */
export function escapeCsvField(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""'
  const str = String(val)
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return `"${str}"`
}

/**
 * Generates a valid CSV document string given an array of headers and rows.
 */
export function generateCsv(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): string {
  const headerLine = headers.map(escapeCsvField).join(',')
  const rowLines = rows.map((row) => row.map(escapeCsvField).join(','))
  return [headerLine, ...rowLines].join('\r\n')
}

/**
 * Converts financial report data into CSV format.
 */
export function formatFinancialReportCsv(report: FinancialSummaryReport): string {
  const headers = [
    'Transaction ID',
    'Type',
    'Date',
    'Title / Description',
    'Party (Donor/Beneficiary)',
    'Campaign',
    'Original Amount',
    'Currency',
    'Amount (BDT)',
    'Payment / Status',
  ]

  const rows = report.items.map((item) => [
    item.id,
    item.type.toUpperCase(),
    item.date,
    item.title,
    item.donorOrBeneficiary,
    item.campaignTitle || 'N/A',
    item.amount,
    item.currency,
    item.convertedAmount,
    item.paymentMethodOrStatus,
  ])

  return generateCsv(headers, rows)
}

/**
 * Converts campaign performance report data into CSV format.
 */
export function formatCampaignReportCsv(campaigns: CampaignPerformanceItem[]): string {
  const headers = [
    'Campaign ID',
    'Title',
    'Status',
    'Currency',
    'Target Amount',
    'Raised Amount',
    'Progress (%)',
    'Disbursed (BDT)',
    'Net Balance (BDT)',
    'Total Donors',
    'Deadline',
    'Created Date',
  ]

  const rows = campaigns.map((c) => [
    c.id,
    c.title,
    c.status.toUpperCase(),
    c.currency,
    c.targetAmount,
    c.raisedAmount,
    `${c.progressPercentage}%`,
    c.disbursedAmount,
    c.netBalance,
    c.donorCount,
    c.deadlineAt || 'None',
    c.createdAt,
  ])

  return generateCsv(headers, rows)
}

/**
 * Converts beneficiary report data into CSV format.
 */
export function formatBeneficiaryReportCsv(beneficiaries: BeneficiaryReportItem[]): string {
  const headers = [
    'Beneficiary ID',
    'Full Name',
    'Contact Phone',
    'Family Size',
    'Status',
    'Total Disbursed (BDT)',
    'Disbursements Count',
    'Registered Date',
  ]

  const rows = beneficiaries.map((b) => [
    b.id,
    b.fullName,
    b.contactPhone || 'N/A',
    b.familySize,
    b.status.toUpperCase(),
    b.totalDisbursedAmount,
    b.disbursementsCount,
    b.createdAt,
  ])

  return generateCsv(headers, rows)
}

/**
 * Converts volunteer shift report data into CSV format.
 */
export function formatVolunteerReportCsv(shifts: VolunteerShiftReportItem[]): string {
  const headers = [
    'Shift ID',
    'Title',
    'Location',
    'Start Time',
    'End Time',
    'Max Volunteers',
    'Signed Up',
    'Attended',
    'Attendance Rate (%)',
  ]

  const rows = shifts.map((s) => [
    s.id,
    s.title,
    s.location,
    s.startTime,
    s.endTime,
    s.maxVolunteers,
    s.signupsCount,
    s.attendedCount,
    `${s.attendanceRate}%`,
  ])

  return generateCsv(headers, rows)
}
