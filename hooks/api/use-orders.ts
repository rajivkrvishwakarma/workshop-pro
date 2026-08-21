import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post, put } from '@/lib/api/axios';

export const useGetOrder = (id?: string | null) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => get<any>(`/orders/${id}`).then(res => res.data),
    enabled: !!id,
  });
};

export const useGetOrders = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => get<any>('/orders', filters).then(res => res.data),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { customerId: string }) => post<any>('/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => put<any>(`/orders/${id}`, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
    },
  });
};
