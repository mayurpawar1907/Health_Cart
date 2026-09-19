import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import api, { unwrap } from '@/api/client';
import { TestCard } from '@/components/ui/TestCard';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { UserPage, UserPageHeader, UserToolbar, UserSearch } from '@/components/user/UserUi';
export function SearchPage() {
    const [params, setParams] = useSearchParams();
    const q = params.get('q') ?? '';
    const [debounced, setDebounced] = useState(q);
    const [input, setInput] = useState(q);
    useEffect(() => {
        setInput(q);
        const t = setTimeout(() => setDebounced(q), 250);
        return () => clearTimeout(t);
    }, [q]);
    const recent = JSON.parse(localStorage.getItem('hc_recent_searches') || '[]');
    const results = useQuery({
        queryKey: ['search', debounced],
        enabled: debounced.length > 1,
        queryFn: async () => unwrap((await api.get('/tests', { params: { search: debounced } })).data),
    });
    const popular = ['Blood Test', 'CBC', 'Vitamin D', 'Thyroid', 'Diabetes', 'Liver', 'Kidney', 'Health Packages'];
    function runSearch(value) {
        const term = value.trim();
        if (!term)
            return;
        const next = [term, ...recent.filter((x) => x !== term)].slice(0, 6);
        localStorage.setItem('hc_recent_searches', JSON.stringify(next));
        setParams({ q: term });
    }
    return (<UserPage>
      <UserPageHeader title="Search" subtitle={q ? `Results for “${q}”` : 'Find tests and health packages'}/>

      <UserToolbar>
        <UserSearch value={input} onChange={setInput} placeholder="Search tests, packages, CBC, thyroid…"/>
        <button type="button" onClick={() => runSearch(input)} className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-dark">
          Search
        </button>
      </UserToolbar>

      {recent.length ? (<div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Recent</p>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (<Link key={r} to={`/search?q=${encodeURIComponent(r)}`} className="rounded-full border border-line/80 bg-white px-3 py-1 text-sm transition hover:border-teal/40 hover:text-teal">
                {r}
              </Link>))}
          </div>
        </div>) : null}

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Popular searches</p>
        <div className="flex flex-wrap gap-2">
          {popular.map((r) => (<Link key={r} to={`/search?q=${encodeURIComponent(r)}`} className="rounded-full border border-line/80 bg-white px-3 py-1 text-sm transition hover:border-teal/40 hover:text-teal">
              {r}
            </Link>))}
        </div>
      </div>

      {debounced.length <= 1 ? (<EmptyState title="Start searching" body="Try CBC, Vitamin D, thyroid, or a package name."/>) : results.isLoading ? (<Loading label="Searching tests"/>) : !results.data?.length ? (<EmptyState title="No matching tests" body="Try CBC, Vitamin D, thyroid or a package name."/>) : (<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.data.map((t) => (<TestCard key={t.id} test={t}/>))}
        </div>)}
    </UserPage>);
}
