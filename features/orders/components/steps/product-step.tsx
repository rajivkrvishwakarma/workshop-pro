'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { MobileHeader } from '@/components/layout/mobile-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ProductStep({ onNext, onBack, defaultData }: { onNext: (data: any) => void, onBack: () => void, defaultData?: any }) {
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultData?.category || '');
  const [masters, setMasters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Note: We're skipping the image selection step in this UI revamp as per the HTML provided,
  // but we can preserve the underlying data model requirement if needed by passing an empty string or picking the first one.
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(defaultData?.imageUrl || '');

  useEffect(() => {
    async function fetchMasters() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/masters/products');
        const data = await res.json();
        if (data.success) {
          setMasters(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch masters:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMasters();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedCategory) return;
    
    onNext({ 
      product: { 
        category: selectedCategory, 
        description: '', // Removing description step based on HTML design
        imageUrl: selectedImageUrl
      } 
    });
  };

  const dynamicCategories = masters.map(m => m.category);
  const categoriesToRender = dynamicCategories.length > 0 
    ? dynamicCategories.includes('Custom Build') ? dynamicCategories : [...dynamicCategories, 'Custom Build']
    : ['Loading categories...'];

  const getIconForCategory = (cat: string) => {
    const lowercase = cat.toLowerCase();
    if (lowercase.includes('gate') && lowercase.includes('sliding')) return 'swap_horiz';
    if (lowercase.includes('gate')) return 'fence';
    if (lowercase.includes('window')) return 'window';
    if (lowercase.includes('door')) return 'door_front';
    if (lowercase.includes('rail')) return 'stairs';
    return 'architecture';
  };

  const selectedMaster = masters.find(m => m.category === selectedCategory);
  const availableImages = selectedMaster?.images || [];

  return (
    <div className="flex-1 w-full flex flex-col relative h-full">
      <MobileHeader title="New Order" onBack={onBack} />
      
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col p-4 pb-32 md:pt-4 md:pb-8 overflow-y-auto">


      {/* Headline & Instructions */}
      <div className="mb-lg">
        <h1 className="font-headline-sm text-headline-sm md:font-display-lg md:text-display-lg text-on-surface mb-xs">Select Product Type</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Choose the primary category for this fabrication job.</p>
      </div>

      {/* Product Selection Grid */}
      <div className="grid grid-cols-3 gap-2 md:gap-md mb-xl content-start">
        {categoriesToRender.map(cat => {
          const isSelected = selectedCategory === cat;
          const isLoadingItem = cat === 'Loading categories...';
          return (
            <div 
              key={cat}
              onClick={() => {
                if (isLoadingItem) return;
                setSelectedCategory(cat);
                
                const categoryMaster = masters.find(m => m.category === cat);
                if (categoryMaster?.images && categoryMaster.images.length > 0) {
                  setShowImageModal(true);
                } else {
                  setSelectedImageUrl('');
                }
              }}
              className={`product-card cursor-pointer border rounded-xl p-2 md:p-md flex flex-col items-center justify-center text-center h-28 md:h-40 transition-all ${
                isSelected 
                  ? 'border-primary bg-primary-fixed shadow-[0_0_0_1px_#2563eb]' 
                  : 'border-outline-variant bg-surface hover:border-primary hover:bg-surface-container-low'
              }`}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-2 md:mb-sm text-primary shrink-0">
                {isLoadingItem ? (
                   <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-primary" />
                ) : (
                  <span className="material-symbols-outlined text-3xl md:text-4xl" style={isSelected ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                    {getIconForCategory(cat)}
                  </span>
                )}
              </div>
              <span className="font-label-sm md:font-label-md text-label-sm md:text-label-md text-on-surface leading-tight text-balance">{cat}</span>
            </div>
          );
        })}
      </div>

      {/* Image Selection Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="w-full max-w-4xl h-[92vh] md:h-[90vh] flex flex-col p-0 gap-0 overflow-hidden top-auto bottom-0 translate-y-0 rounded-t-2xl rounded-b-none md:top-[50%] md:bottom-auto md:-translate-y-1/2 md:rounded-xl">
          <DialogHeader className="p-4 md:p-6 border-b shrink-0 bg-surface">
            <DialogTitle className="font-headline-sm text-headline-sm text-on-surface">Select a Design</DialogTitle>
            <DialogDescription className="font-body-md text-body-md text-on-surface-variant">
              Pick a reference image for your canvas (optional).
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 pb-32 md:p-6 md:pb-8 bg-surface-container-lowest">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableImages.map((img: any) => (
                <div 
                  key={img.id}
                  onClick={() => setSelectedImageUrl(img.imageUrl)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all aspect-square bg-surface-container-low ${
                    selectedImageUrl === img.imageUrl 
                      ? 'border-primary shadow-md scale-[0.98]' 
                      : 'border-outline-variant hover:border-primary/50'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.imageUrl} alt="Design reference" className="w-full h-full object-cover" />
                  
                  {/* Select indicator */}
                  {selectedImageUrl === img.imageUrl && (
                    <div className="absolute top-2 right-2 bg-primary text-on-primary rounded-full p-1 shadow-sm flex items-center justify-center w-6 h-6">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                  )}

                  {/* Preview Eye Button */}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(img.imageUrl);
                    }}
                    className="absolute bottom-2 right-2 bg-black/40 hover:bg-black/60 text-white rounded p-1.5 shadow-sm flex items-center justify-center backdrop-blur-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t bg-surface shrink-0 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowImageModal(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowImageModal(false);
              handleSubmit();
            }}>Confirm Selection</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Screen Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="w-full max-w-full h-[100dvh] md:h-screen p-0 m-0 border-none bg-black/95 flex flex-col justify-center items-center rounded-none sm:rounded-none max-h-none overflow-hidden">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPreviewImage(null);
            }}
            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          
          {previewImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={previewImage} 
              alt="Design Preview" 
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Action Area (Sticky Bottom on Mobile) */}
      <div className="fixed bottom-0 left-0 w-full md:static md:w-auto bg-surface border-t border-outline-variant md:border-none p-4 md:p-0 z-40 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-0 md:mt-8 flex justify-between gap-4">
        <button 
          type="button" 
          onClick={onBack} 
          className="flex-1 md:flex-none font-label-md text-label-md py-3 px-8 rounded-lg border-2 border-outline-variant hover:bg-surface-variant text-on-surface transition-all"
        >
          Back
        </button>
        <button 
          onClick={handleSubmit}
          disabled={!selectedCategory}
          className={`flex-2 md:flex-none font-label-md text-label-md py-3 px-8 rounded-lg flex items-center justify-center gap-xs transition-colors shadow-md hover:shadow-lg ${
            selectedCategory 
              ? 'bg-primary text-on-primary hover:bg-primary/90 cursor-pointer' 
              : 'bg-surface-variant text-outline cursor-not-allowed shadow-none'
          }`}
        >
          Continue
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
      </div>
    </div>
  );
}
