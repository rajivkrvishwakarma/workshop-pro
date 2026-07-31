'use client';

import { useState, useEffect } from 'react';
import { MobileHeader } from '@/components/layout/mobile-header';
import { ArrowRight, Loader2, History, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { useGetCustomerByMobile, useSearchCustomers } from '@/hooks/api/use-customers';
import { toast } from 'sonner';

export function CustomerStep({ onNext, onResumeDraft, defaultData }: { onNext: (data: any) => void, onResumeDraft?: (orderId: string) => void, defaultData?: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState(defaultData || { id: '', name: '', mobile: '', address: '' });
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const debouncedMobile = useDebounce(formData.mobile, 500);

  const { data: customerData, isFetching: isLoadingCustomer } = useGetCustomerByMobile(debouncedMobile);
  const { data: searchData, isFetching: isSearching } = useSearchCustomers(debouncedMobile);
  
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (customerData && customerData.success && customerData.data) {
      // Only auto-fill if not manually editing other fields (a more advanced check could be used, but this is fine)
      setFormData((prev: any) => ({
        ...prev,
        id: customerData.data.id,
        name: customerData.data.name || prev.name,
        address: customerData.data.address || prev.address
      }));
    } else if (customerData && (!customerData.success || !customerData.data)) {
      setFormData((prev: any) => ({ ...prev, id: '' }));
    }
  }, [customerData]);

  const handleSelectSuggestion = (customer: any) => {
    setFormData((prev: any) => ({
      ...prev,
      id: customer.id,
      name: customer.name || prev.name,
      mobile: customer.mobile,
      address: customer.address || prev.address
    }));
    setShowDropdown(false);
  };

  const recentOrders = customerData?.data?.orders || [];

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setFormData((prev: any) => ({ ...prev, address: data.display_name }));
          } else {
            alert('Could not determine address from location');
          }
        } catch (error) {
          console.error("Error fetching location address:", error);
          alert('Error fetching address');
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert('Failed to get location. Please ensure location permissions are granted.');
        setIsFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ customer: formData });
  };

  return (
    <div className="flex-1 w-full flex flex-col relative h-full bg-background md:bg-transparent">
      <MobileHeader title="Customer Details" onBack={() => router.back()} />
      
      <form onSubmit={handleSubmit} className="flex-1 w-full max-w-4xl mx-auto flex flex-col p-4 pb-32 md:pt-4 md:pb-8 overflow-y-auto">
        <div className="hidden md:block mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Customer Details</h2>
          <p className="text-muted-foreground text-sm mt-1">Enter the client information for this order.</p>
        </div>
        
        <div className="space-y-6 flex-1">
          <div className="space-y-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Mobile Number</label>
            <div className="relative">
              <Input 
                required
                type="tel"
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-surface-container-low border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-primary"
                value={formData.mobile}
                onChange={(e) => {
                  setFormData({ ...formData, mobile: e.target.value });
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              {(isLoadingCustomer || isSearching) && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              )}
              
              {showDropdown && searchData?.data && searchData.data.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-surface border border-outline-variant rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {searchData.data.map((customer: any) => (
                    <div 
                      key={customer.id}
                      onClick={() => handleSelectSuggestion(customer)}
                      className="px-4 py-3 hover:bg-surface-variant cursor-pointer border-b border-outline-variant last:border-0 flex flex-col"
                    >
                      <span className="font-medium text-on-surface text-sm">{customer.mobile}</span>
                      <span className="text-xs text-on-surface-variant">{customer.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Full Name</label>
            <Input 
              required
              type="text"
              placeholder="e.g. John Doe"
              className="w-full bg-surface-container-low border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-primary"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Address / Site Location</label>
              <button 
                type="button" 
                onClick={handleFetchLocation}
                disabled={isFetchingLocation}
                className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline bg-primary/10 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
              >
                {isFetchingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                Fetch GPS Location
              </button>
            </div>
            <Textarea 
              rows={4}
              placeholder="Full site address..."
              className="w-full bg-surface-container-low border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-primary resize-none"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          
          {recentOrders.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <History className="w-4 h-4" />
                <h3 className="font-label-md text-label-md uppercase tracking-wider">Recent Orders</h3>
              </div>
              <div className="grid gap-2">
                {recentOrders.map((order: any) => {
                  const isDraft = !order.statusId;
                  return (
                    <div 
                      key={order.id} 
                      onClick={() => {
                        if (isDraft && onResumeDraft) {
                          onResumeDraft(order.id);
                        } else {
                          toast.info("Completed order details coming soon");
                        }
                      }}
                      className="p-3 bg-surface-container-lowest border rounded-lg flex justify-between items-center text-sm cursor-pointer hover:bg-surface-container-low hover:border-primary/50 transition-all group"
                    >
                      <div>
                        <span className="font-medium text-on-surface block group-hover:text-primary transition-colors">Order #{order.id.slice(0, 8)}</span>
                        <span className="text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${isDraft ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {isDraft ? 'Draft' : 'Completed'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Area (Sticky Bottom on Mobile) */}
        <div className="fixed bottom-0 left-0 w-full md:static md:w-auto bg-surface border-t border-outline-variant md:border-none p-4 md:p-0 z-40 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-0 md:mt-8 flex justify-end">
          <Button 
            type="submit"
            className="w-full md:w-auto py-3 px-8 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            Continue to Products
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}
