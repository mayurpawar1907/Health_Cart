import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api, { unwrap } from '@/api/client';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { AppointmentCard } from '@/components/ui/AppointmentCard';
import { Button } from '@/components/ui/Button';
export function DashboardPage() {
    const q = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => unwrap((await api.get('/dashboard')).data),
    });
    if (q.isLoading || !q.data)
        return <Loading />;
    const { stats, recent } = q.data;
    return (<div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="font-display text-4xl">Dashboard</h1>
        <Link to="/appointments/book"><Button>Quick book</Button></Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
            ['Upcoming', stats.upcoming],
            ['Completed', stats.completed],
            ['Cancelled', stats.cancelled],
            ['Membership', stats.membership],
        ].map(([l, v]) => (<Card key={String(l)} className="p-5">
            <p className="text-sm text-ink-soft">{l}</p>
            <p className="mt-2 font-display text-3xl">{v}</p>
          </Card>))}
      </div>
      <h2 className="font-display text-2xl">Recent history</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {recent.map((a) => <AppointmentCard key={a.id} appointment={a}/>)}
      </div>
    </div>);
}
