import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api/axios';

export const useGetCustomerByMobile = (mobile: string) => {
  return useQuery({
    queryKey: ['customers', 'mobile', mobile],
    queryFn: () => get<any>('/customers', { mobile }),
    enabled: mobile.length >= 10,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useSearchCustomers = (query: string) => {
  return useQuery({
    queryKey: ['customers', 'search', query],
    queryFn: () => get<any>('/customers', { query }),
    enabled: query.length >= 4,
    staleTime: 1000 * 60, // 1 minute cache
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => post<any>('/customers', data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};
