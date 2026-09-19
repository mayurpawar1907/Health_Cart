import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, FileUp, Upload } from 'lucide-react'
import api, { unwrap } from '@/services/api'
import { formatDate } from '@/lib/utils'
import { downloadAuthenticatedFile } from '@/lib/download'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminSelect,
  AdminTHead,
  AdminTh,
  AdminTr,
  AdminTd,
  AdminTable,
  Badge,
} from '@/components/admin/AdminUi'

type Report = {
  id: string
  status: string
  summary?: string
  fileName?: string
  fileUrl?: string
  createdAt: string
  user: { fullName: string; email: string }
  appointment: { id: string; code: string; test: { name: string } }
}

type AppointmentOption = {
  id: string
  code: string
  patientName: string
  test: { name: string }
}

export function AdminReportsPage() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [appointmentId, setAppointmentId] = useState('')
  const [summary, setSummary] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => unwrap<Report[]>((await api.get('/admin/reports')).data),
  })

  const appointments = useQuery({
    queryKey: ['admin-appts-for-reports'],
    queryFn: async () => unwrap<AppointmentOption[]>((await api.get('/admin/appointments')).data),
  })

  const upload = useMutation({
    mutationFn: async () => {
      if (!file || !appointmentId) throw new Error('Missing file or appointment')
      const form = new FormData()
      form.append('file', file)
      form.append('appointmentId', appointmentId)
      if (summary.trim()) form.append('summary', summary.trim())
      return api.post('/admin/reports/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] })
      setAppointmentId('')
      setSummary('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    },
  })

  if (isLoading) return <Loading label="Loading reports" />

  return (
    <AdminPage>
      <AdminPageHeader title="Reports" subtitle="Upload lab report files — customers download securely from their account" />

      <AdminPanel title="Upload report file" subtitle="PDF, PNG, JPG or TXT · max 10 MB · triggers notification + WhatsApp">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminSelect
            label="Booking"
            value={appointmentId}
            onChange={setAppointmentId}
            className="w-full"
          >
            <option value="">Select appointment…</option>
            {(appointments.data ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} · {a.test.name} · {a.patientName}
              </option>
            ))}
          </AdminSelect>
          <Input label="Summary (optional)" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="All parameters within normal range" />
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-semibold text-ink/80">Report file</p>
            <label className="flex cursor-pointer flex-wrap items-center gap-3 rounded-2xl border border-dashed border-teal/40 bg-teal-light/20 px-4 py-4 transition hover:bg-teal-light/35">
              <FileUp className="h-5 w-5 text-teal" />
              <span className="text-sm text-ink-soft">
                {file ? file.name : 'Choose PDF, image, or text report'}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,application/pdf,image/*,text/plain"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>
        <Button
          size="sm"
          className="mt-4 rounded-xl"
          disabled={!appointmentId || !file || upload.isPending}
          onClick={() => upload.mutate()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {upload.isPending ? 'Uploading…' : 'Upload & release report'}
        </Button>
        {upload.isError ? (
          <p className="mt-2 text-sm text-brand-red">Upload failed. Check file type and size.</p>
        ) : null}
      </AdminPanel>

      <AdminTable>
        <table className="w-full min-w-[900px] text-left text-sm">
          <AdminTHead>
            <AdminTh>Customer</AdminTh>
            <AdminTh>Test</AdminTh>
            <AdminTh>Booking</AdminTh>
            <AdminTh>File</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Released</AdminTh>
            <AdminTh>Actions</AdminTh>
          </AdminTHead>
          <tbody>
            {(data ?? []).map((r) => (
              <AdminTr key={r.id}>
                <AdminTd>
                  <p className="font-semibold">{r.user.fullName}</p>
                  <p className="text-xs text-ink-soft">{r.summary ?? '—'}</p>
                </AdminTd>
                <AdminTd>{r.appointment.test.name}</AdminTd>
                <AdminTd className="font-mono text-xs">{r.appointment.code}</AdminTd>
                <AdminTd className="text-xs text-ink-soft">{r.fileName ?? (r.fileUrl ? 'Uploaded' : '—')}</AdminTd>
                <AdminTd>
                  <Badge tone={r.status === 'AVAILABLE' ? 'success' : 'warn'}>{r.status}</Badge>
                </AdminTd>
                <AdminTd className="text-ink-soft">{formatDate(r.createdAt)}</AdminTd>
                <AdminTd>
                  {r.fileUrl ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-lg text-xs"
                      onClick={() => downloadAuthenticatedFile(`/admin/reports/${r.id}/file`, r.fileName ?? 'report.pdf')}
                    >
                      <Download className="mr-1 h-3.5 w-3.5" /> Download
                    </Button>
                  ) : (
                    <span className="text-xs text-ink-soft">No file</span>
                  )}
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </table>
      </AdminTable>
    </AdminPage>
  )
}
