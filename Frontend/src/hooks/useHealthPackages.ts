import { useQuery } from '@tanstack/react-query'
import api, { unwrap } from '@/services/api'
import type { LabTest } from '@/types'
import { enrichPackages, type EnrichedPackage } from '@/lib/packages'

export function useHealthPackages() {
  return useQuery({
    queryKey: ['tests', 'packages'],
    queryFn: async () => {
      const data = unwrap<LabTest[]>((await api.get('/tests', { params: { packages: 'true' } })).data)
      return enrichPackages(data)
    },
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export type { EnrichedPackage }
