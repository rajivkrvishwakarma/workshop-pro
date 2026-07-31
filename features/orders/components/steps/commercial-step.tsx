'use client';

import { useState, useEffect } from 'react';
import { MobileHeader } from '@/components/layout/mobile-header';
import { useUpdateOrder } from '@/hooks/api/use-orders';
import { Check } from 'lucide-react';


export function CommercialStep({ orderId, onNext, onBack, defaultData }: { orderId?: string, onNext: (data: any) => void, onBack: () => void, defaultData?: any }) {
  const [formData, setFormData] = useState(defaultData || {
    rateType: 'per_kg',
    estimatedRate: 0,
    expectedWeight: 0,
    advanceAmount: 0,
    deadline: '',
  });

  const { mutate: updateOrder } = useUpdateOrder();

  const estimatedTotal = formData.rateType === 'per_kg' 
    ? formData.estimatedRate * formData.expectedWeight
    : formData.estimatedRate; // for per_sqft or fixed it would be calculated differently, simplified here

  // Auto-save commercial data
  useEffect(() => {
    if (orderId) {
      const timeoutId = setTimeout(() => {
        // Prepare data for API
        const payload = {
          rateType: formData.rateType,
          estimatedRate: formData.estimatedRate,
          expectedWeight: formData.expectedWeight,
          advanceAmount: formData.advanceAmount,
          ...(formData.deadline ? { deadline: formData.deadline } : {})
        };

        updateOrder({ id: orderId, data: payload });
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData, orderId, updateOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ commercial: { ...formData, estimatedTotal } });
  };

  return (
    <div className="flex-1 w-full flex flex-col relative h-full bg-background md:bg-transparent">
      <MobileHeader title="Commercials" onBack={onBack} />
      
      <form onSubmit={handleSubmit} className="flex-1 w-full max-w-4xl mx-auto flex flex-col p-4 pb-32 md:pt-4 md:pb-8 overflow-y-auto">
        <div className="hidden md:block mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Commercials & Deadline</h2>
          <p className="text-muted-foreground text-sm mt-1">Set rates, advances, and delivery estimates.</p>
        </div>
        
        <div className="space-y-6 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Rate Type</label>
              <div className="relative">
                <select 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                  value={formData.rateType}
                  onChange={(e) => setFormData({ ...formData, rateType: e.target.value })}
                >
                  <option value="per_kg">Per KG</option>
                  <option value="per_sqft">Per Sq.Ft</option>
                  <option value="fixed">Fixed Rate</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Rate (₹)</label>
              <input 
                type="number"
                placeholder="0.00"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                value={formData.estimatedRate || ''}
                onChange={(e) => setFormData({ ...formData, estimatedRate: Number(e.target.value) })}
              />
            </div>
          </div>

          {formData.rateType === 'per_kg' && (
            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Expected Weight (KG)</label>
              <input 
                type="number"
                placeholder="e.g. 150"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                value={formData.expectedWeight || ''}
                onChange={(e) => setFormData({ ...formData, expectedWeight: Number(e.target.value) })}
              />
            </div>
          )}

          <div className="p-4 bg-primary-container text-on-primary-container rounded-xl flex justify-between items-center shadow-inner border border-primary/20 mt-2">
            <span className="font-label-md text-label-md">Estimated Total</span>
            <span className="font-display-sm text-display-sm">₹{estimatedTotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Advance (₹)</label>
              <input 
                type="number"
                placeholder="0.00"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                value={formData.advanceAmount || ''}
                onChange={(e) => setFormData({ ...formData, advanceAmount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Deadline</label>
              <input 
                required
                type="date"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Action Area (Sticky Bottom on Mobile) */}
        <div className="fixed bottom-0 left-0 w-full md:static md:w-auto bg-surface border-t border-outline-variant md:border-none p-4 md:p-0 z-40 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-0 md:mt-8 flex justify-between gap-4">
          <button type="button" onClick={onBack} className="flex-1 md:flex-none font-label-md text-label-md py-3 px-8 rounded-lg border-2 border-outline-variant hover:bg-surface-variant text-on-surface transition-all">
            Back
          </button>
          <button 
            type="submit" 
            className="flex-2 md:flex-none font-label-md text-label-md py-3 px-8 rounded-lg flex items-center justify-center gap-xs transition-colors bg-primary text-on-primary hover:bg-primary/90 shadow-md hover:shadow-lg"
          >
            Complete Order
            <Check className="w-5 h-5 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
}

