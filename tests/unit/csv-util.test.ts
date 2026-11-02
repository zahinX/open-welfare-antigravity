import { describe, it, expect } from 'vitest'
import {
  escapeCsvField,
  generateCsv,
  formatFinancialReportCsv,
  formatCampaignReportCsv,
  formatBeneficiaryReportCsv,
  formatVolunteerReportCsv,
} from '@/lib/utils/csv'
import {
  FinancialSummaryReport,
  CampaignPerformanceItem,
  BeneficiaryReportItem,
  VolunteerShiftReportItem,
} from '@/lib/services/reports'

describe('CSV Utility (lib/utils/csv.ts)', () => {
  describe('escapeCsvField', () => {
    it('should quote strings containing commas or quotes correctly', () => {
      expect(escapeCsvField('Hello, World')).toBe('"Hello, World"')
      expect(escapeCsvField('He said "Hello"')).toBe('"He said ""Hello"""')
      expect(escapeCsvField(12345)).toBe('"12345"')
      expect(escapeCsvField(null)).toBe('""')
      expect(escapeCsvField(undefined)).toBe('""')
    })
  })

  describe('generateCsv', () => {
    it('should format headers and rows into CRLF separated CSV text', () => {
      const headers = ['Name', 'Role', 'Status']
      const rows = [
        ['Alice', 'Admin', 'Active'],
        ['Bob', 'Volunteer, Lead', 'Pending'],
      ]

      const csv = generateCsv(headers, rows)
      expect(csv).toContain('"Name","Role","Status"')
      expect(csv).toContain('"Alice","Admin","Active"')
      expect(csv).toContain('"Bob","Volunteer, Lead","Pending"')
    })
  })

  describe('formatFinancialReportCsv', () => {
    it('should format financial report rows correctly', () => {
      const mockReport: FinancialSummaryReport = {
        totalDonations: 5000,
        totalDisbursements: 2000,
        netBalance: 3000,
        donationCount: 1,
        disbursementCount: 1,
        items: [
          {
            id: 'tx-1',
            type: 'donation',
            date: '2026-08-18T10:00:00Z',
            title: 'Donation to Winter Relief',
            donorOrBeneficiary: 'John Doe',
            campaignTitle: 'Winter Relief',
            amount: 5000,
            currency: 'BDT',
            convertedAmount: 5000,
            paymentMethodOrStatus: 'completed',
          },
        ],
      }

      const csv = formatFinancialReportCsv(mockReport)
      expect(csv).toContain('"Transaction ID","Type","Date"')
      expect(csv).toContain('"tx-1","DONATION","2026-08-18T10:00:00Z","Donation to Winter Relief","John Doe","Winter Relief","5000","BDT","5000","completed"')
    })
  })

  describe('formatCampaignReportCsv', () => {
    it('should format campaign performance rows', () => {
      const mockCampaigns: CampaignPerformanceItem[] = [
        {
          id: 'c-1',
          title: 'Flood Relief',
          status: 'active',
          currency: 'BDT',
          targetAmount: 100000,
          raisedAmount: 75000,
          progressPercentage: 75,
          disbursedAmount: 20000,
          netBalance: 55000,
          donorCount: 42,
          deadlineAt: '2026-12-31',
          createdAt: '2026-08-01',
        },
      ]

      const csv = formatCampaignReportCsv(mockCampaigns)
      expect(csv).toContain('"Campaign ID","Title","Status"')
      expect(csv).toContain('"c-1","Flood Relief","ACTIVE","BDT","100000","75000","75%","20000","55000","42","2026-12-31","2026-08-01"')
    })
  })

  describe('formatBeneficiaryReportCsv', () => {
    it('should format beneficiary report rows', () => {
      const mockBeneficiaries: BeneficiaryReportItem[] = [
        {
          id: 'b-1',
          fullName: 'Rahim Uddin',
          contactPhone: '01711111111',
          familySize: 5,
          status: 'approved',
          totalDisbursedAmount: 15000,
          disbursementsCount: 3,
          createdAt: '2026-08-10',
        },
      ]

      const csv = formatBeneficiaryReportCsv(mockBeneficiaries)
      expect(csv).toContain('"Beneficiary ID","Full Name","Contact Phone"')
      expect(csv).toContain('"b-1","Rahim Uddin","01711111111","5","APPROVED","15000","3","2026-08-10"')
    })
  })

  describe('formatVolunteerReportCsv', () => {
    it('should format volunteer shifts report rows', () => {
      const mockShifts: VolunteerShiftReportItem[] = [
        {
          id: 's-1',
          title: 'Medical Camp',
          location: 'Sylhet',
          startTime: '2026-09-01T09:00:00Z',
          endTime: '2026-09-01T17:00:00Z',
          maxVolunteers: 20,
          signupsCount: 15,
          attendedCount: 12,
          attendanceRate: 80,
        },
      ]

      const csv = formatVolunteerReportCsv(mockShifts)
      expect(csv).toContain('"Shift ID","Title","Location"')
      expect(csv).toContain('"s-1","Medical Camp","Sylhet","2026-09-01T09:00:00Z","2026-09-01T17:00:00Z","20","15","12","80%"')
    })
  })
})
