import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Download, MessageCircle } from 'lucide-react'
import { downloadAuthenticatedFile } from '@/lib/download'
import api, { unwrap } from '@/services/api'
import type { Appointment, Report } from '@/types'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Loading } from '@/components/ui/Loading'
import { formatDate, formatMoney } from '@/lib/utils'
import {
  UserBadge,
  UserEmptyRow,
  UserPage,
  UserPageHeader,
  UserPanel,
  UserSearch,
  UserTable,
  UserTd,
  UserTh,
  UserTHead,
  UserToolbar,
  UserTr,
} from '@/components/user/UserUi'

export function HistoryPage() {
  const [params, setParams] = useSearchParams()
  const reportId = params.get('report')
  const [activeReport, setActiveReport] = useState<Report | null>(null)
  const [query, setQuery] = useState('')

  const q = useQuery({
    queryKey: ['history'],
    queryFn: async () => unwrap<Appointment[]>((await api.get('/history')).data),
  })

  const reportQuery = useQuery({
    queryKey: ['report', reportId],
    enabled: !!reportId,
    queryFn: async () => unwrap<Report>((await api.get(`/reports/${reportId}`)).data),
  })

  useEffect(() => {
    if (reportQuery.data) setActiveReport(reportQuery.data)
  }, [reportQuery.data])

  const filtered = useMemo(() => {
    const list = q.data ?? []
    const qLower = query.trim().toLowerCase()
    if (!qLower) return list
    return list.filter(
      (a) =>
        a.test.name.toLowerCase().includes(qLower) ||
        a.code.toLowerCase().includes(qLower) ||
        a.patientName.toLowerCase().includes(qLower),
    )
  }, [q.data, query])

  if (q.isLoading) return <Loading label="Loading history" />

  if (!q.data?.length) {
    return (
      <UserPage>
        <UserPageHeader title="Reports & history" subtitle="Completed tests and lab reports" />
        <EmptyState title="No test history yet" body="Completed appointments and reports will appear here." />
      </UserPage>
    )
  }

  return (
    <UserPage>
      <UserPageHeader title="Reports & history" subtitle="Reports are stored securely and sent on WhatsApp when ready" />

      {activeReport ? (
        <UserPanel title="Lab report">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-xl">{activeReport.appointment?.test?.name ?? 'Lab report'}</p>
              <p className="text-sm text-ink-soft">
                {activeReport.releasedAt ? formatDate(activeReport.releasedAt) : 'Recently released'}
              </p>
            </div>
            <Button variant="ghost" className="rounded-xl" onClick={() => { setActiveReport(null); setParams({}) }}>
              Close
            </Button>
          </div>
          {activeReport.summary ? <p className="mt-4 rounded-2xl bg-teal-light/60 p-4 text-sm">{activeReport.summary}</p> : null}
          {activeReport.fileUrl ? (
            <Button
              className="mt-4 rounded-xl"
              onClick={() =>
                downloadAuthenticatedFile(
                  `/reports/${activeReport.id}/file`,
                  activeReport.fileName ?? 'lab-report.pdf',
                )
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Download report
            </Button>
          ) : null}
          <p className="mt-4 flex items-center gap-2 text-xs text-ink-soft">
            <MessageCircle className="h-4 w-4 text-teal" /> Also shared on your WhatsApp number
          </p>
        </UserPanel>
      ) : null}

      <UserToolbar>
        <UserSearch value={query} onChange={setQuery} placeholder="Search test, booking code, patient…" />
      </UserToolbar>

      <UserTable>
        <table className="w-full min-w-[880px] text-left text-sm">
          <UserTHead>
            <UserTh>Test</UserTh>
            <UserTh>Patient</UserTh>
            <UserTh>Visit date</UserTh>
            <UserTh>Booking</UserTh>
            <UserTh>Amount</UserTh>
            <UserTh>Report</UserTh>
            <UserTh>Actions</UserTh>
          </UserTHead>
          <tbody>
            {!filtered.length ? (
              <UserEmptyRow colSpan={7} message="No records match your search" />
            ) : (
              filtered.map((a) => {
                const report = a.reports?.[0]
                const status = report?.status ?? 'PENDING'
                return (
                  <UserTr key={a.id}>
                    <UserTd>
                      <p className="font-semibold">{a.test.name}</p>
                      {report?.summary && status === 'AVAILABLE' ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-ink-soft">{report.summary}</p>
                      ) : null}
                    </UserTd>
                    <UserTd>{a.patientName}</UserTd>
                    <UserTd className="text-ink-soft">{formatDate(a.date)}</UserTd>
                    <UserTd className="font-mono text-xs">{a.code}</UserTd>
                    <UserTd>{a.finalPrice != null ? formatMoney(Number(a.finalPrice)) : '—'}</UserTd>
                    <UserTd>
                      <UserBadge tone={status === 'AVAILABLE' ? 'success' : status === 'PROCESSING' ? 'warn' : 'default'}>
                        {status === 'AVAILABLE' ? 'Ready' : status}
                      </UserBadge>
                    </UserTd>
                    <UserTd>
                      {status === 'AVAILABLE' && report ? (
                        <Button
                          size="sm"
                          className="rounded-lg text-xs"
                          onClick={() => {
                            setParams({ report: report.id })
                            setActiveReport(report)
                          }}
                        >
                          View report
                        </Button>
                      ) : (
                        <span className="text-xs text-ink-soft">Processing…</span>
                      )}
                    </UserTd>
                  </UserTr>
                )
              })
            )}
          </tbody>
        </table>
      </UserTable>
    </UserPage>
  )
}
