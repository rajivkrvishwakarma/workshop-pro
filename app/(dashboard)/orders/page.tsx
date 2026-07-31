'use client';

import { useState } from 'react';
import { useGetOrders } from '@/hooks/api/use-orders';
import { useGetStatuses } from '@/hooks/api/use-statuses';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Filter, Eye, Clock, Phone, MapPin } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

export default function OrdersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data: ordersData, isLoading: isLoadingOrders } = useGetOrders({
    search: debouncedSearch || undefined,
    statusId: statusFilter || undefined,
  });

  const { data: statusesData } = useGetStatuses();
  const orders = ordersData || [];
  const statuses = statusesData?.data || [];

  return (
    <div className="flex flex-col h-full bg-background md:bg-transparent animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 mt-4 md:mt-0">
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">All Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and track your workshop orders.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search customer or mobile..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-surface-container-low border-outline-variant focus:border-primary focus:ring-primary w-full"
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-surface-container-low border border-outline-variant text-sm rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-primary h-10 w-32 cursor-pointer text-on-surface"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft (Unsaved)</option>
              {statuses.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoadingOrders ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[400px] text-center bg-surface-container-lowest border border-outline-variant border-dashed rounded-xl p-8">
          <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-2">No orders found</h3>
          <p className="text-muted-foreground max-w-full md:max-w-sm px-4">We couldn't find any orders matching your current filters. Try adjusting your search.</p>
          {(searchTerm || statusFilter) && (
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24 md:pb-8">
          {orders.map((order: any) => {
            const isDraft = !order.statusId;
            const status = isDraft ? { name: 'Draft', color: '#f59e0b' } : order.status;
            
            return (
              <div 
                key={order.id} 
                className="bg-surface border border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {order.customer?.name || 'Unknown Customer'}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <span 
                    className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                    style={{ 
                      backgroundColor: `${status.color || '#94a3b8'}20`, 
                      color: status.color || '#475569' 
                    }}
                  >
                    {status.name}
                  </span>
                </div>

                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center text-sm text-on-surface-variant">
                    <Phone className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                    <span>{order.customer?.mobile || 'No mobile'}</span>
                  </div>
                  {order.customer?.address && (
                    <div className="flex items-start text-sm text-on-surface-variant">
                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{order.customer.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t border-outline-variant flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Items</span>
                    <span className="font-semibold text-on-surface">{order.items?.length || 0}</span>
                  </div>
                  <Button 
                    size="sm"
                    className="rounded-full px-5"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
