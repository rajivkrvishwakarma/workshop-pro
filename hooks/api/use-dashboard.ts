import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api/axios';

export interface DashboardStats {
  totalRevenue: number;
  totalAdvance: number;
  totalCustomers: number;
  totalStaff: number;
  activeOrders: number;
  totalDue: number;
  todayDeadlines: number;
  recentActivities: Array<{
    id: string;
    action: string;
    createdAt: string;
    orderId: string;
  }>;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => get<DashboardStats>('/dashboard/stats').then(res => res.data),
  });
};
