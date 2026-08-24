import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile } from '@/lib/supabase/server'
import {
  getFinancialReport,
  getCampaignPerformanceReport,
  getBeneficiaryReport,
  getVolunteerReport,
} from '@/lib/services/reports'
import {
  formatFinancialReportCsv,
  formatCampaignReportCsv,
  formatBeneficiaryReportCsv,
  formatVolunteerReportCsv,
} from '@/lib/utils/csv'
import { exportReportSchema } from '@/lib/validations/analytics'

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate & Authorize Admin
    const authData = await getUserProfile()
    if (!authData || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authData.profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 })
    }

    // 2. Parse and Validate Query Parameters
    const searchParams = request.nextUrl.searchParams
    const rawInput = {
      type: searchParams.get('type'),
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      campaignId: searchParams.get('campaignId') || undefined,
      status: searchParams.get('status') || undefined,
    }

    const validation = exportReportSchema.safeParse(rawInput)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid export parameters', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { type, startDate, endDate, campaignId, status } = validation.data
    const filter = { startDate, endDate, campaignId, status }
    const dateStamp = new Date().toISOString().split('T')[0]

    let csvContent = ''
    const filename = `report-${type}-${dateStamp}.csv`

    switch (type) {
      case 'financial': {
        const { data, error } = await getFinancialReport(filter)
        if (error || !data) {
          return NextResponse.json({ error: error || 'Failed to generate financial report' }, { status: 500 })
        }
        csvContent = formatFinancialReportCsv(data)
        break
      }
      case 'campaigns': {
        const { data, error } = await getCampaignPerformanceReport(filter)
        if (error || !data) {
          return NextResponse.json({ error: error || 'Failed to generate campaign report' }, { status: 500 })
        }
        csvContent = formatCampaignReportCsv(data)
        break
      }
      case 'beneficiaries': {
        const { data, error } = await getBeneficiaryReport(filter)
        if (error || !data) {
          return NextResponse.json({ error: error || 'Failed to generate beneficiary report' }, { status: 500 })
        }
        csvContent = formatBeneficiaryReportCsv(data)
        break
      }
      case 'volunteers': {
        const { data, error } = await getVolunteerReport(filter)
        if (error || !data) {
          return NextResponse.json({ error: error || 'Failed to generate volunteer report' }, { status: 500 })
        }
        csvContent = formatVolunteerReportCsv(data)
        break
      }
    }

    // 3. Return CSV Response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
