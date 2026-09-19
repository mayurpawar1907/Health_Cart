import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api, { unwrap } from '@/services/api'
import type { TestReminder } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import {
  UserPage,
  UserPageHeader,
  UserPanel,
  UserTable,
  UserTd,
  UserTh,
  UserTHead,
  UserTr,
} from '@/components/user/UserUi'

export function RemindersPage() {
  const qc = useQueryClient()
  const [label, setLabel] = useState('')
  const [remindAt, setRemindAt] = useState('')

  const q = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => unwrap<TestReminder[]>((await api.get('/reminders')).data),
  })

  const create = useMutation({
    mutationFn: async () => api.post('/reminders', { label, remindAt }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] })
      setLabel('')
      setRemindAt('')
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/reminders/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  })

  if (q.isLoading) return <Loading label="Loading reminders" />

  return (
    <UserPage>
      <UserPageHeader title="Test reminders" subtitle="Get reminded before your tests — in-app and on WhatsApp" />

      <UserPanel title="Set a reminder">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Reminder label" placeholder="Annual health checkup" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Input label="Remind me on" type="datetime-local" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} />
        </div>
        <Button className="mt-4 rounded-xl" disabled={!label || !remindAt || create.isPending} onClick={() => create.mutate()}>
          Add reminder
        </Button>
      </UserPanel>

      {!q.data?.length ? (
        <EmptyState title="No reminders yet" body="Bookings automatically create reminders. You can add custom ones too." />
      ) : (
        <UserTable>
          <table className="w-full min-w-[640px] text-left text-sm">
            <UserTHead>
              <UserTh>Label</UserTh>
              <UserTh>Remind at</UserTh>
              <UserTh>Linked test</UserTh>
              <UserTh>Actions</UserTh>
            </UserTHead>
            <tbody>
              {q.data.map((r) => (
                <UserTr key={r.id}>
                  <UserTd className="font-semibold">{r.label}</UserTd>
                  <UserTd className="text-ink-soft">
                    {formatDate(r.remindAt)} ·{' '}
                    {new Date(r.remindAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </UserTd>
                  <UserTd className="text-ink-soft">{r.appointment?.test?.name ?? '—'}</UserTd>
                  <UserTd>
                    <Button variant="ghost" size="sm" className="rounded-lg text-xs" onClick={() => remove.mutate(r.id)}>
                      Remove
                    </Button>
                  </UserTd>
                </UserTr>
              ))}
            </tbody>
          </table>
        </UserTable>
      )}
    </UserPage>
  )
}
