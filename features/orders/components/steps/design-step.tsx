'use client';

import { useState, useEffect, useRef } from 'react';
import { AnnotationEditor } from '@/features/editor/components/AnnotationEditor';
import { useEditorStore } from '@/features/editor/store/useEditorStore';
import { useGetMaterials, useGetProducts } from '@/hooks/api/use-masters';
import { canShowKabjaAndHolfass } from '@/lib/constants/product-rules';
import { MobileHeader } from '@/components/layout/mobile-header';
import { Button } from '@/components/ui/button';

interface DesignStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  onChange?: (data: any) => void;
  defaultData?: any;
  productData?: any;
}

const UNITS = ['inch', 'cm', 'mm', 'foot', 'meter'];

export function DesignStep({ onNext, onBack, onChange, defaultData, productData }: DesignStepProps) {
  const category = productData?.category || 'Custom Item';
  const [unit, setUnit] = useState(defaultData?.unit || 'inch');
  const [width, setWidth] = useState<number | string>(defaultData?.width ?? 0);
  const [height, setHeight] = useState<number | string>(defaultData?.height ?? 0);
  const [material, setMaterial] = useState(defaultData?.material || 'Mild Steel');
  const [hasVentilator, setHasVentilator] = useState(defaultData?.hasVentilator || false);
  const [ventilatorImageUrl, setVentilatorImageUrl] = useState<string>(defaultData?.ventilatorImageUrl || '');

  const { data: materialsRes } = useGetMaterials();
  const { data: productsRes } = useGetProducts();

  const materialsList = materialsRes?.data || [];
  const ventilatorImages = productsRes?.data?.find((m: any) => m.category.toLowerCase().includes('ventilator'))?.images || [];

  useEffect(() => {
    if (!material && materialsList.length > 0) {
      setMaterial(materialsList[0].name);
    }
  }, [materialsList, material]);
  
  const [holfass, setHolfass] = useState<{
    side: 'none' | 'left' | 'right' | 'both';
    left: { top: number | ''; middle: number | ''; bottom: number | '' };
    right: { top: number | ''; middle: number | ''; bottom: number | '' };
  }>(defaultData?.holfass || {
    side: 'none',
    left: { top: '', middle: '', bottom: '' },
    right: { top: '', middle: '', bottom: '' }
  });
  const [kabja, setKabja] = useState<'none' | 'left' | 'right'>(defaultData?.kabja || 'none');

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!onChangeRef.current) return;
    const elements = useEditorStore.getState().elements;
    const timer = setTimeout(() => {
      if (onChangeRef.current) {
        onChangeRef.current({ design: { width, height, unit, material, templateId: category, holfass, kabja, hasVentilator, ventilatorImageUrl, elements } });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [width, height, unit, material, holfass, kabja, hasVentilator, ventilatorImageUrl, category]);

  // Subscribe to canvas elements changes
  useEffect(() => {
    if (!onChangeRef.current) return;
    return useEditorStore.subscribe((state: any, prevState: any) => {
      if (state.elements !== prevState.elements && onChangeRef.current) {
        onChangeRef.current({ design: { width, height, unit, material, templateId: category, holfass, kabja, hasVentilator, ventilatorImageUrl, elements: state.elements } });
      }
    });
  }, [width, height, unit, material, holfass, kabja, hasVentilator, ventilatorImageUrl, category]);

  const handleProceed = () => {
    const elements = useEditorStore.getState().elements;
    onNext({ design: { width, height, unit, material, templateId: category, holfass, kabja, hasVentilator, ventilatorImageUrl, elements } });
  };

  return (
    <div className="relative flex-1 w-full h-full flex flex-col font-sans select-none overflow-hidden bg-background">
      <MobileHeader 
        title="Canvas" 
        onBack={onBack} 
        rightAction={
          <Button variant="ghost" size="icon" onClick={handleProceed} className="text-primary hover:bg-surface-container-low w-10 h-10 rounded-full">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
          </Button>
        } 
      />

      {/* Desktop Top Bar (Hidden on Mobile) */}
      <header className="hidden md:flex bg-surface border-b border-outline-variant justify-between items-center px-container-margin h-16 shrink-0 z-20 relative">
        <button onClick={onBack} aria-label="Back" className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors active:scale-95">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline-sm text-headline-sm text-on-surface text-center flex-1">Canvas</h1>
        <button onClick={handleProceed} aria-label="Save" className="w-11 h-11 flex items-center justify-center text-primary hover:bg-surface-variant rounded-full transition-colors active:scale-95">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
        </button>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col md:flex-row bg-surface">
        
        {/* Canvas Area (Left) */}
        <div className="relative flex-1 flex flex-col overflow-hidden bg-background">
          {/* Floating Toolbar (Left) */}
          <div className="absolute top-md left-md bg-surface border border-outline-variant rounded-lg flex flex-col p-1 shadow-sm z-10 hidden md:flex">
            <button className="w-10 h-10 flex items-center justify-center text-primary bg-primary-fixed hover:bg-primary-fixed-dim rounded-md transition-colors" title="Grid">
              <span className="material-symbols-outlined">grid_on</span>
            </button>
          </div>

          {/* The CAD Object Canvas */}
          <div className="relative flex-1 flex items-center justify-center z-0">
             <div className="w-full h-full flex items-center justify-center">
               <AnnotationEditor imageUrl={productData?.imageUrl} canvasWidth={Number(width) || 0} canvasHeight={Number(height) || 0} unit={unit} holfass={holfass} kabja={kabja} hasVentilator={hasVentilator} ventilatorImageUrl={ventilatorImageUrl} />
             </div>
          </div>
        </div>

        {/* Bottom Sheet / Side Panel */}
        <div className="w-full md:w-[400px] lg:w-[450px] bg-surface border-t md:border-t-0 md:border-l border-outline-variant md:rounded-br-xl md:rounded-bl-none z-20 flex flex-col h-1/2 md:h-full shrink-0">

          {/* Sheet Content Header */}
          <div className="px-container-margin pt-4 pb-4 flex justify-between items-end border-b border-surface-variant shrink-0">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Properties</h2>
            <span className="font-label-sm text-label-sm text-primary bg-primary-fixed px-2 py-1 rounded">Selected: {category}</span>
          </div>

          {/* Sheet Content Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-container-margin py-4 flex flex-col gap-md pb-32 md:pb-12">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                  Height <span>({unit})</span>
                </label>
                <input 
                  type="number" min="0" 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" 
                  value={height} onFocus={(e) => e.target.select()} onChange={(e) => setHeight(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} 
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                  Width <span>({unit})</span>
                </label>
                <input 
                  type="number" min="0" 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" 
                  value={width} onFocus={(e) => e.target.select()} onChange={(e) => setWidth(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Unit</label>
                <div className="relative">
                  <select 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                    value={unit} onChange={(e) => setUnit(e.target.value)}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Material</label>
                <div className="relative">
                  <select 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                    value={material} onChange={(e)=>setMaterial(e.target.value)}
                  >
                    {materialsList.length === 0 ? (
                      <option value="Mild Steel">Mild Steel</option>
                    ) : (
                      materialsList.map((m: any) => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
            </div>

            {/* Ventilator Section */}
            {!category.toLowerCase().includes('window') && !category.toLowerCase().includes('railing') && (
              <div className="flex flex-col gap-1 mt-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Gate Ventilator</label>
                <div className="flex flex-wrap gap-2 mb-2">
                   <button 
                     type="button" 
                     onClick={() => setHasVentilator(true)} 
                     className={`flex-1 min-w-[70px] py-2 border font-label-md text-label-md rounded-lg active:scale-95 transition-transform capitalize ${hasVentilator ? 'border-primary bg-primary-fixed text-primary' : 'border-outline-variant bg-surface text-on-surface hover:bg-surface-variant'}`}
                   >Yes</button>
                   <button 
                     type="button" 
                     onClick={() => { setHasVentilator(false); setVentilatorImageUrl(''); }} 
                     className={`flex-1 min-w-[70px] py-2 border font-label-md text-label-md rounded-lg active:scale-95 transition-transform capitalize ${!hasVentilator ? 'border-primary bg-primary-fixed text-primary' : 'border-outline-variant bg-surface text-on-surface hover:bg-surface-variant'}`}
                   >No</button>
                </div>
                
                {hasVentilator && ventilatorImages.length > 0 && (
                  <div className="mt-2 p-3 bg-surface-container-lowest border rounded-xl shadow-sm">
                     <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 block">Select Ventilator Design</label>
                     <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                       {ventilatorImages.map((img: any) => (
                          <div 
                            key={img.id} 
                            onClick={() => setVentilatorImageUrl(img.imageUrl)}
                            className={`relative w-20 h-20 shrink-0 border-2 rounded-lg cursor-pointer overflow-hidden snap-center transition-all ${ventilatorImageUrl === img.imageUrl ? 'border-primary shadow-md scale-95' : 'border-outline-variant hover:border-primary/50'}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.imageUrl} className="w-full h-full object-cover" alt="Ventilator design" />
                            {ventilatorImageUrl === img.imageUrl && (
                              <div className="absolute top-1 right-1 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center shadow">
                                <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                              </div>
                            )}
                          </div>
                       ))}
                     </div>
                  </div>
                )}
              </div>
            )}

            {/* Kabja Section */}
            {canShowKabjaAndHolfass(category) && (
              <div className="flex flex-col gap-1 mt-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Kabja (Hinges)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                 {['none', 'left', 'right'].map((side) => (
                    <button 
                      key={side}
                      type="button"
                      onClick={() => setKabja(side as any)}
                      className={`flex-1 min-w-[70px] py-2 border font-label-md text-label-md rounded-lg active:scale-95 transition-transform capitalize ${
                        kabja === side ? 'border-primary bg-primary-fixed text-primary' : 'border-outline-variant bg-surface text-on-surface hover:bg-surface-variant'
                      }`}
                    >
                      {side}
                    </button>
                 ))}
                </div>
              </div>
            )}

            {/* Holfass Section */}
            {canShowKabjaAndHolfass(category) && (
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Holfass Options</label>
                {(holfass.side === 'left' || holfass.side === 'right' || holfass.side === 'both') && (
                  <button 
                    onClick={() => setHolfass(prev => ({ ...prev, left: prev.right, right: prev.left, side: prev.side === 'left' ? 'right' : prev.side === 'right' ? 'left' : prev.side }))}
                    className="text-xs text-primary flex items-center gap-1 hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span> Swap Sides
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                 {['none', 'left', 'right', 'both'].map((side) => (
                    <button 
                      key={side}
                      type="button"
                      onClick={() => setHolfass(prev => ({ ...prev, side: side as any }))}
                      className={`flex-1 min-w-[70px] py-2 border font-label-md text-label-md rounded-lg active:scale-95 transition-transform capitalize ${
                        holfass.side === side ? 'border-primary bg-primary-fixed text-primary' : 'border-outline-variant bg-surface text-on-surface hover:bg-surface-variant'
                      }`}
                    >
                      {side}
                    </button>
                 ))}
              </div>
              
              {/* Left Holfass Inputs */}
              {(holfass.side === 'left' || holfass.side === 'both') && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="col-span-3 font-label-sm text-label-sm text-on-surface-variant">Left Side ({unit})</div>
                  <input type="number" min="0" placeholder="Bottom" className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={holfass.left.bottom} onChange={(e) => setHolfass(prev => ({ ...prev, left: { ...prev.left, bottom: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) } }))} />
                  <input type="number" min="0" placeholder="Middle" className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={holfass.left.middle} onChange={(e) => setHolfass(prev => ({ ...prev, left: { ...prev.left, middle: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) } }))} />
                  <input type="number" min="0" placeholder="Top" className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={holfass.left.top} onChange={(e) => setHolfass(prev => ({ ...prev, left: { ...prev.left, top: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) } }))} />
                </div>
              )}

              {/* Right Holfass Inputs */}
              {(holfass.side === 'right' || holfass.side === 'both') && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="col-span-3 font-label-sm text-label-sm text-on-surface-variant">Right Side ({unit})</div>
                  <input type="number" min="0" placeholder="Bottom" className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={holfass.right.bottom} onChange={(e) => setHolfass(prev => ({ ...prev, right: { ...prev.right, bottom: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) } }))} />
                  <input type="number" min="0" placeholder="Middle" className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={holfass.right.middle} onChange={(e) => setHolfass(prev => ({ ...prev, right: { ...prev.right, middle: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) } }))} />
                  <input type="number" min="0" placeholder="Top" className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={holfass.right.top} onChange={(e) => setHolfass(prev => ({ ...prev, right: { ...prev.right, top: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) } }))} />
                </div>
              )}
            </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
