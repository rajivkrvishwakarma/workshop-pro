'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ProductStep } from './product-step';
import { MeasurementBlock } from './measurement-block';
import { useUpdateOrder } from '@/hooks/api/use-orders';
import { Plus, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { MobileHeader } from '@/components/layout/mobile-header';
import { Button } from '@/components/ui/button';

export function ProductsManagerStep({ orderId, onNext, onBack, defaultData = [] }: { orderId?: string, onNext: (data: any) => void, onBack: () => void, defaultData?: any[] }) {
  const [items, setItems] = useState<any[]>(defaultData);
  const [view, setView] = useState<'list' | 'product'>('list');
  const [activeIndex, setActiveIndex] = useState(0);
  
  const { mutate: updateOrder } = useUpdateOrder();

  // Auto-redirect to add product if list is empty
  useEffect(() => {
    if (items.length === 0 && view === 'list') {
      handleAddProduct();
    }
  }, [items.length, view]);

  const handleAddProduct = () => {
    setView('product');
  };

  const handleProductSubmit = (data: any) => {
    const newItem = {
      id: uuidv4(),
      product: data.product,
      design: {
        width: 0,
        height: 0,
        unit: 'inch',
        material: 'Mild Steel',
        templateId: data.product.category,
        elements: []
      }
    };
    
    setItems(prev => {
      const newItems = [...prev, newItem];
      // Auto save on add
      if (orderId) {
        updateOrder({ id: orderId, data: { items: newItems } });
      }
      return newItems;
    });
    
    setActiveIndex(items.length); // switch to the newly added item
    setView('list');
  };

  const handleItemChange = useCallback((index: number, updatedItem: any) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = updatedItem;
      // Auto save on change
      if (orderId) {
        updateOrder({ id: orderId, data: { items: newItems } });
      }
      return newItems;
    });
  }, [orderId, updateOrder]);

  const handleDeleteItem = useCallback((index: number) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems.splice(index, 1);
      if (orderId) updateOrder({ id: orderId, data: { items: newItems } });
      return newItems;
    });
    
    if (activeIndex >= items.length - 1 && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  }, [orderId, updateOrder, items.length, activeIndex]);

  const handleSaveAndProceed = () => {
    onNext({ items });
    if (orderId) updateOrder({ id: orderId, data: { items } });
  };

  if (view === 'product') {
    return (
      <ProductStep 
        onNext={handleProductSubmit} 
        onBack={() => {
          if (items.length === 0) onBack(); // Go back to customer step if no items exist
          else setView('list');
        }} 
      />
    );
  }

  // LIST VIEW (Horizontal Pagination View)
  return (
    <div className="flex-1 w-full flex flex-col relative h-full bg-background overflow-hidden">
      <MobileHeader 
        title="Measurements" 
        onBack={onBack} 
        rightAction={
          <Button variant="ghost" size="icon" onClick={handleAddProduct} className="text-primary hover:bg-surface-container-low w-10 h-10 rounded-full">
            <Plus className="w-6 h-6" />
          </Button>
        } 
      />

      <div className="flex-1 overflow-y-auto w-full max-w-6xl mx-auto p-4 pb-32 md:p-6 md:pb-8 flex flex-col gap-6">
        
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between border-b border-outline-variant pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Measurements</h2>
            <p className="text-muted-foreground text-sm mt-1">Design and measure all products for this order.</p>
          </div>
          <button 
            onClick={handleAddProduct}
            className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/20 transition-all"
          >
            <Plus className="w-5 h-5" /> Add Another Product
          </button>
        </div>

        {/* Measurement Block View */}
        <div className="flex flex-col gap-4 pb-20">
          {items.length > 0 && items[activeIndex] && (
            <>
              {/* Pagination Control */}
              <div className="flex items-center justify-between bg-surface md:bg-transparent border border-outline-variant md:border-none p-2 md:p-0 rounded-xl shadow-sm md:shadow-none mb-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={activeIndex === 0} 
                  onClick={() => setActiveIndex(activeIndex - 1)}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <div className="font-semibold text-sm text-foreground bg-surface-container-low px-4 py-1.5 rounded-full">
                  Product {activeIndex + 1} of {items.length}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={activeIndex === items.length - 1} 
                  onClick={() => setActiveIndex(activeIndex + 1)}
                  className="flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Active Product Canvas */}
              <MeasurementBlock 
                key={items[activeIndex].id} 
                item={items[activeIndex]} 
                index={activeIndex}
                onChange={(updated) => handleItemChange(activeIndex, updated)}
                onDelete={() => handleDeleteItem(activeIndex)}
              />
              
              {/* Add Product Button (shows when on the last item) */}
              {activeIndex === items.length - 1 && (
                <div 
                  onClick={handleAddProduct}
                  className="mt-6 border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-primary hover:bg-surface-container-low transition-all bg-surface text-muted-foreground hover:text-primary group shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground group-hover:text-primary">Add Another Product</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/80 backdrop-blur-md border-t border-outline-variant p-4 z-40 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-4 flex justify-between items-center gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="hidden md:block text-sm text-muted-foreground font-medium ml-4">
          {items.length} product{items.length !== 1 ? 's' : ''} in order
        </div>
        <div className="flex w-full md:w-auto gap-4 md:mr-4">
          <button type="button" onClick={onBack} className="flex-1 md:flex-none px-6 py-2.5 border-2 border-outline-variant rounded-lg font-semibold hover:bg-surface-variant transition-all text-on-surface">
            Back
          </button>
          <button 
            type="button" 
            onClick={handleSaveAndProceed} 
            className="flex-2 md:flex-none flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
          >
            Save & Proceed <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

