import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api/axios';

export const useGetStatuses = () => {
  return useQuery({
    queryKey: ['statuses'],
    queryFn: () => get<any>('/statuses').then(res => res.data),
  });
};
