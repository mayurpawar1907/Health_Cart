import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api, { unwrap } from '@/services/api'
import { formatDate } from '@/lib/utils'
import { Loading } from '@/components/ui/Loading'
import {
  AdminPage,
  AdminPageHeader,
  AdminPagination,
  AdminSelect,
  AdminTHead,
  AdminTh,
  AdminTr,
  AdminTd,
  AdminTable,
  AdminToolbar,
  Badge,
} from '@/components/admin/AdminUi'

type AuditLog = {
  id: string
  action: string
  entity: string
  entityId?: string
  meta?: Record<string, unknown>
  createdAt: string
  user?: { fullName: string; email: string; role: string }
}

type AuditResponse = { items: AuditLog[]; total: number; page: number; pages: number }

export function AdminAuditPage() {
  const [page, setPage] = useState(1)
  const [entity, setEntity] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit', page, entity],
    queryFn: async () =>
      unwrap<AuditResponse>((await api.get('/admin/audit-logs', { params: { page, entity: entity || undefined } })).data),
  })

  if (isLoading) return <Loading label="Loading audit log" />

  return (
    <AdminPage>
      <AdminPageHeader title="Audit log" subtitle="Track admin actions across the platform" />

      <AdminToolbar>
        <AdminSelect value={entity} onChange={(v) => { setEntity(v); setPage(1) }}>
          <option value="">All entities</option>
          {['User', 'Test', 'TestCategory', 'Appointment', 'Membership'].map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </AdminSelect>
      </AdminToolbar>

      <AdminTable>
        <table className="w-full min-w-[800px] text-left text-sm">
          <AdminTHead>
            <AdminTh>When</AdminTh>
            <AdminTh>Admin</AdminTh>
            <AdminTh>Action</AdminTh>
            <AdminTh>Entity</AdminTh>
            <AdminTh>Details</AdminTh>
          </AdminTHead>
          <tbody>
            {(data?.items ?? []).map((log) => (
              <AdminTr key={log.id}>
                <AdminTd className="text-ink-soft">{formatDate(log.createdAt)}</AdminTd>
                <AdminTd>
                  <p className="font-semibold">{log.user?.fullName ?? 'System'}</p>
                  <p className="text-xs text-ink-soft">{log.user?.role}</p>
                </AdminTd>
                <AdminTd><Badge tone="teal">{log.action}</Badge></AdminTd>
                <AdminTd>{log.entity}{log.entityId ? ` · ${log.entityId.slice(0, 8)}…` : ''}</AdminTd>
                <AdminTd className="max-w-xs truncate text-xs text-ink-soft">{log.meta ? JSON.stringify(log.meta) : '—'}</AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </table>
      </AdminTable>

      {data ? <AdminPagination page={page} pages={data.pages} onPage={setPage} /> : null}
    </AdminPage>
  )
}
