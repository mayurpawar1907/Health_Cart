import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { UserBadge, UserPage, UserPageHeader, UserTable, UserTd, UserTh, UserTHead, UserTr, } from '@/components/user/UserUi';
export function NotificationsPage() {
    const qc = useQueryClient();
    const q = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => unwrap((await api.get('/notifications')).data),
    });
    const readOne = useMutation({
        mutationFn: (id) => api.patch(`/notifications/${id}/read`),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['notifications'] });
            void qc.invalidateQueries({ queryKey: ['notifications-unread'] });
        },
    });
    const readAll = useMutation({
        mutationFn: () => api.patch('/notifications/read-all'),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['notifications'] });
            void qc.invalidateQueries({ queryKey: ['notifications-unread'] });
        },
    });
    if (q.isLoading)
        return <Loading label="Loading notifications"/>;
    return (<UserPage>
      <UserPageHeader title="Notifications" subtitle="Appointment and report alerts" actions={q.data?.length ? (<Button variant="secondary" className="rounded-xl" onClick={() => readAll.mutate()}>
              Mark all read
            </Button>) : null}/>

      {!q.data?.length ? (<EmptyState title="You're all caught up" body="Appointment and report alerts will appear here."/>) : (<UserTable>
          <table className="w-full min-w-[720px] text-left text-sm">
            <UserTHead>
              <UserTh>Type</UserTh>
              <UserTh>Title</UserTh>
              <UserTh>Message</UserTh>
              <UserTh>Status</UserTh>
            </UserTHead>
            <tbody>
              {q.data.map((n) => (<UserTr key={n.id} className={n.isRead ? undefined : 'bg-teal-light/20'}>
                  <UserTd>
                    <UserBadge tone="teal">{n.type.replaceAll('_', ' ')}</UserBadge>
                  </UserTd>
                  <UserTd>
                    <button type="button" className="text-left font-semibold text-ink hover:text-teal" onClick={() => readOne.mutate(n.id)}>
                      {n.title}
                    </button>
                  </UserTd>
                  <UserTd className="max-w-[280px] text-ink-soft">
                    <p className="line-clamp-2">{n.body}</p>
                  </UserTd>
                  <UserTd>
                    <UserBadge tone={n.isRead ? 'default' : 'success'}>{n.isRead ? 'Read' : 'New'}</UserBadge>
                  </UserTd>
                </UserTr>))}
            </tbody>
          </table>
        </UserTable>)}
    </UserPage>);
}
