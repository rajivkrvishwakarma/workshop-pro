'use client';

import { useState, useEffect } from 'react';
import { useGetOrders } from '@/hooks/api/use-orders';
import { useGetStatuses } from '@/hooks/api/use-statuses';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Filter, Eye, Clock, Phone, MapPin, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils/cn';

export default function OrdersPage() {
  const router = useRouter();
  
  const [filters, setFilters] = useState({
    search: '',
    statusId: '',
    dateFrom: '',
    dateTo: '',
    advanceMin: '',
    advanceMax: '',
    rateMin: '',
    rateMax: '',
    name: '',
    mobile: '',
    address: '',
  });

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [defaultStatusSet, setDefaultStatusSet] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 500);

  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== '')
  );

  const { data: ordersData, isLoading: isLoadingOrders } = useGetOrders({
    ...activeFilters,
    search: debouncedSearch || undefined,
  });

  const { data: statusesData } = useGetStatuses();
  const orders = ordersData || [];
  const statuses = statusesData?.data || [];

  // Set default status to "New" once statuses are loaded
  useEffect(() => {
    if (!defaultStatusSet && statuses.length > 0) {
      const newStatus = statuses.find((s: any) => s.name.toLowerCase() === 'new');
      if (newStatus) {
        setFilters(prev => ({ ...prev, statusId: newStatus.id }));
      }
      // Even if not found, we mark as set to avoid infinite checks
      setDefaultStatusSet(true);
    }
  }, [statuses, defaultStatusSet]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      statusId: '',
      dateFrom: '',
      dateTo: '',
      advanceMin: '',
      advanceMax: '',
      rateMin: '',
      rateMax: '',
      name: '',
      mobile: '',
      address: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');
  const hasAdvancedFilters = Object.entries(filters).some(([k, v]) => k !== 'search' && v !== '');

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
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-9 bg-surface-container-low border-outline-variant focus:border-primary focus:ring-primary w-full h-10 rounded-md"
            />
          </div>
          
          <Button
            variant="outline"
            className={cn("h-10 px-4 flex items-center gap-2", hasAdvancedFilters ? "bg-primary/10 border-primary text-primary" : "")}
            onClick={() => setIsFiltersOpen(true)}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
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
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={clearFilters}
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
            const createdAt = new Date(order.createdAt);
            
            return (
              <div 
                key={order.id} 
                className="bg-gradient-to-br from-background to-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all group flex flex-col relative overflow-hidden"
              >
                <div 
                  className="absolute top-0 left-0 w-1 h-full opacity-70"
                  style={{ backgroundColor: status.color || '#94a3b8' }}
                />
                
                <div className="flex justify-between items-start mb-3 pl-2">
                  <div>
                    <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {order.customer?.name || 'Unknown Customer'}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(createdAt, { addSuffix: true })} • {format(createdAt, 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider whitespace-nowrap border"
                    style={{ 
                      backgroundColor: `${status.color || '#94a3b8'}15`, 
                      color: status.color || '#475569',
                      borderColor: `${status.color || '#94a3b8'}30`
                    }}
                  >
                    {status.name}
                  </span>
                </div>

                <div className="space-y-1.5 mb-4 flex-1 pl-2">
                  <div className="flex items-center text-sm text-on-surface-variant">
                    <Phone className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
                    <span>{order.customer?.mobile || 'No mobile'}</span>
                  </div>
                  {order.customer?.address && (
                    <div className="flex items-start text-sm text-on-surface-variant">
                      <MapPin className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{order.customer.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between mt-auto pl-2">
                  <div className="flex flex-col max-w-[60%]">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
                      Items ({order.items?.length || 0})
                    </span>
                    <span className="text-xs font-semibold text-on-surface truncate">
                      {order.items?.length > 0 
                        ? order.items.slice(0, 2).map((i: any) => i.productType).join(', ') + (order.items.length > 2 ? ' ...' : '')
                        : 'No items'}
                    </span>
                  </div>
                  <Button 
                    size="sm"
                    className="h-8 rounded-full px-4 text-xs font-medium bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Advanced Filters Drawer */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm transition-opacity duration-300", 
          isFiltersOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsFiltersOpen(false)}
      />
      
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-[100] h-full w-full sm:max-w-sm bg-surface shadow-2xl transition-transform duration-300 border-l border-outline-variant flex flex-col", 
          isFiltersOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-lowest shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Advanced Filters
          </h2>
          <button 
            onClick={() => setIsFiltersOpen(false)}
            className="p-2 hover:bg-surface-variant rounded-full transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">Status</label>
            <select
              value={filters.statusId}
              onChange={(e) => updateFilter('statusId', e.target.value)}
              className="w-full appearance-none bg-surface-container-low border border-outline-variant rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft (Unsaved)</option>
              {statuses.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={filters.dateFrom} onChange={e => updateFilter('dateFrom', e.target.value)} className="w-full text-sm py-3" placeholder="From" />
              <Input type="date" value={filters.dateTo} onChange={e => updateFilter('dateTo', e.target.value)} className="w-full text-sm py-3" placeholder="To" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">Advance Amount Range</label>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Min (₹)" value={filters.advanceMin} onChange={e => updateFilter('advanceMin', e.target.value)} className="w-full py-3" />
              <Input type="number" placeholder="Max (₹)" value={filters.advanceMax} onChange={e => updateFilter('advanceMax', e.target.value)} className="w-full py-3" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">Total Rate Range</label>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Min (₹)" value={filters.rateMin} onChange={e => updateFilter('rateMin', e.target.value)} className="w-full py-3" />
              <Input type="number" placeholder="Max (₹)" value={filters.rateMax} onChange={e => updateFilter('rateMax', e.target.value)} className="w-full py-3" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">Customer Details</label>
            <Input type="text" placeholder="Name" value={filters.name} onChange={e => updateFilter('name', e.target.value)} className="w-full py-3 mb-3" />
            <Input type="text" placeholder="Mobile Number" value={filters.mobile} onChange={e => updateFilter('mobile', e.target.value)} className="w-full py-3 mb-3" />
            <Input type="text" placeholder="Address" value={filters.address} onChange={e => updateFilter('address', e.target.value)} className="w-full py-3" />
          </div>
        </div>

        <div className="p-4 border-t border-outline-variant bg-surface-container-lowest shrink-0 grid grid-cols-2 gap-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <Button variant="outline" onClick={clearFilters} className="w-full h-12">
            Clear All
          </Button>
          <Button onClick={() => setIsFiltersOpen(false)} className="w-full h-12">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
