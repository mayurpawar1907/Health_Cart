import { useQuery } from '@tanstack/react-query';
import api, { unwrap } from '@/api/client';
import { enrichPackages } from '@/utils/packages';
export function useHealthPackages() {
    return useQuery({
        queryKey: ['tests', 'packages'],
        queryFn: async () => {
            const data = unwrap((await api.get('/tests', { params: { packages: 'true' } })).data);
            return enrichPackages(data);
        },
        staleTime: 0,
        refetchOnMount: 'always',
    });
}
