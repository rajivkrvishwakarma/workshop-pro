'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { AnnotationEditor } from '@/features/editor/components/AnnotationEditor';
import { EditorProvider, useEditorContext as useEditorStore } from '@/features/editor/store/EditorContext';
import { useGetMaterials, useGetProducts } from '@/hooks/api/use-masters';
import { canShowKabjaAndHolfass } from '@/lib/constants/product-rules';

interface MeasurementBlockProps {
  item: any;
  onChange: (item: any) => void;
  onDelete: () => void;
  index: number;
}

const UNITS = ['inch', 'cm', 'mm', 'foot', 'meter'];

function MeasurementBlockContent({ item, onChange, onDelete, index }: MeasurementBlockProps) {
  const defaultData = item.design;
  const productData = item.product;
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

  // We can just use `getElements` instead of subscribing, and call `onChange` when something changes.
  const getElements = useEditorStore(s => s.getElements);
  
  const elements = useEditorStore(s => s.elements); // triggers re-render when elements change

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Debounced save
  useEffect(() => {
    if (!onChangeRef.current) return;
    const timer = setTimeout(() => {
      onChangeRef.current({ 
        ...item, 
        design: { 
          width, height, unit, material, templateId: category, 
          holfass, kabja, hasVentilator, ventilatorImageUrl, 
          elements: getElements() 
        } 
      });
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, unit, material, holfass, kabja, hasVentilator, ventilatorImageUrl, category, elements]);

  return (
    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row mb-6">
      
      {/* Canvas Area (Left) */}
      <div className="flex-[2] flex flex-col min-h-[400px] border-b md:border-b-0 md:border-r border-outline-variant bg-background">
        {/* Item Header */}
        <div className="flex items-center justify-between p-3 shrink-0 w-full border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
              Item {index + 1}
            </div>
            <h3 className="font-headline-sm text-lg text-on-surface">{category}</h3>
          </div>
          <button 
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-full transition-colors"
            title="Delete Item"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
        
        <div className="w-full flex-1 relative min-h-[400px]">
          <AnnotationEditor 
            imageUrl={productData?.imageUrl} 
            canvasWidth={Number(width) || 0} 
            canvasHeight={Number(height) || 0} 
            unit={unit} 
            holfass={holfass} 
            kabja={kabja} 
            hasVentilator={hasVentilator} 
            ventilatorImageUrl={ventilatorImageUrl} 
          />
        </div>
      </div>

      {/* Properties Area (Right) */}
      <div className="flex-1 bg-surface flex flex-col max-h-[600px]">
        <div className="px-4 py-3 border-b border-surface-variant shrink-0 bg-surface-container-lowest">
          <h2 className="font-headline-sm text-base text-on-surface font-semibold">Properties</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-32 md:pb-8 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Height ({unit})</label>
              <input 
                type="number" min="0" 
                className="w-full bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                value={height} onFocus={(e) => e.target.select()} onChange={(e) => setHeight(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Width ({unit})</label>
              <input 
                type="number" min="0" 
                className="w-full bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                value={width} onFocus={(e) => e.target.select()} onChange={(e) => setWidth(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} 
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Unit</label>
              <select 
                className="w-full bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={unit} onChange={(e) => setUnit(e.target.value)}
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Material</label>
              <select 
                className="w-full bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
            </div>
          </div>

          {/* Ventilator Section */}
          {!category.toLowerCase().includes('window') && !category.toLowerCase().includes('railing') && (
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Gate Ventilator</label>
              <div className="flex gap-2 mb-1">
                 <button 
                   type="button" 
                   onClick={() => setHasVentilator(true)} 
                   className={`flex-1 py-1.5 border text-sm rounded-md transition-colors ${hasVentilator ? 'border-primary bg-primary-fixed text-primary' : 'border-outline-variant bg-surface hover:bg-surface-variant'}`}
                 >Yes</button>
                 <button 
                   type="button" 
                   onClick={() => { setHasVentilator(false); setVentilatorImageUrl(''); }} 
                   className={`flex-1 py-1.5 border text-sm rounded-md transition-colors ${!hasVentilator ? 'border-primary bg-primary-fixed text-primary' : 'border-outline-variant bg-surface hover:bg-surface-variant'}`}
                 >No</button>
              </div>
              
              {hasVentilator && ventilatorImages.length > 0 && (
                <div className="mt-2 p-2 bg-surface-container-lowest border rounded-lg">
                   <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
                     {ventilatorImages.map((img: any) => (
                        <div 
                          key={img.id} 
                          onClick={() => setVentilatorImageUrl(img.imageUrl)}
                          className={`relative w-16 h-16 shrink-0 border-2 rounded cursor-pointer overflow-hidden snap-center transition-all ${ventilatorImageUrl === img.imageUrl ? 'border-primary shadow-sm' : 'border-outline-variant hover:border-primary/50'}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.imageUrl} className="w-full h-full object-cover" alt="Ventilator design" />
                        </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
          )}

          {/* Kabja Section */}
          {canShowKabjaAndHolfass(category) && (
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Kabja (Hinges)</label>
              <div className="flex gap-2">
                 {['none', 'left', 'right'].map((side) => (
                    <button 
                      key={side}
                      type="button"
                      onClick={() => setKabja(side as any)}
                      className={`flex-1 py-1.5 border text-sm rounded-md capitalize transition-colors ${
                        kabja === side ? 'border-primary bg-primary-fixed text-primary' : 'border-outline-variant bg-surface hover:bg-surface-variant'
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
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Holfass Options</label>
                {(holfass.side === 'left' || holfass.side === 'right' || holfass.side === 'both') && (
                  <button 
                    onClick={() => setHolfass(prev => ({ ...prev, left: prev.right, right: prev.left, side: prev.side === 'left' ? 'right' : prev.side === 'right' ? 'left' : prev.side }))}
                    className="text-xs text-primary flex items-center hover:underline"
                  >
                    Swap
                  </button>
                )}
              </div>
              <div className="flex gap-2 mb-2 flex-wrap">
                 {['none', 'left', 'right', 'both'].map((side) => (
                    <button 
                      key={side}
                      type="button"
                      onClick={() => setHolfass(prev => ({ ...prev, side: side as any }))}
                      className={`flex-1 min-w-[60px] py-1.5 border text-sm rounded-md capitalize transition-colors ${
                        holfass.side === side ? 'border-primary bg-primary-fixed text-primary' : 'border-outline-variant bg-surface hover:bg-surface-variant'
                      }`}
                    >
                      {side}
                    </button>
                 ))}
              </div>
              
              {/* Left Holfass Inputs */}
              {(holfass.side === 'left' || holfass.side === 'both') && (
                <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest p-2 rounded-lg border">
                  <div className="col-span-3 text-[10px] font-bold text-on-surface-variant uppercase">Left Side ({unit})</div>
                  <input type="number" min="0" placeholder="Bottom" className="w-full bg-surface-container-low border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary" value={holfass.left.bottom} onChange={(e) => setHolfass(prev => ({ ...prev, left: { ...prev.left, bottom: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) } }))} />
                  <input type="number" min="0" placeholder="Middle" className="w-full bg-surface-container-low border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary" value={holfass.left.middle} onChange={(e) => setHolfass(prev => ({ ...prev, left: { ...prev.left, middle: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) } }))} />
                  <input type="number" min="0" placeholder="Top" className="w-full bg-surface-container-low border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary" value={holfass.left.top} onChange={(e) => setHolfass(prev => ({ ...prev, left: { ...prev.left, top: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) } }))} />
                </div>
              )}

              {/* Right Holfass Inputs */}
              {(holfass.side === 'right' || holfass.side === 'both') && (
                <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest p-2 rounded-lg border mt-2">
                  <div className="col-span-3 text-[10px] font-bold text-on-surface-variant uppercase">Right Side ({unit})</div>
                  <input type="number" min="0" placeholder="Bottom" className="w-full bg-surface-container-low border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary" value={holfass.right.bottom} onChange={(e) => setHolfass(prev => ({ ...prev, right: { ...prev.right, bottom: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) } }))} />
                  <input type="number" min="0" placeholder="Middle" className="w-full bg-surface-container-low border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary" value={holfass.right.middle} onChange={(e) => setHolfass(prev => ({ ...prev, right: { ...prev.right, middle: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) } }))} />
                  <input type="number" min="0" placeholder="Top" className="w-full bg-surface-container-low border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary" value={holfass.right.top} onChange={(e) => setHolfass(prev => ({ ...prev, right: { ...prev.right, top: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) } }))} />
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export const MeasurementBlock = memo(function MeasurementBlockWrapper(props: MeasurementBlockProps) {
  // We wrap each measurement block in its own EditorProvider so it has its own Zustand store.
  // We pass the initial elements from the item's design.
  return (
    <EditorProvider initialElements={props.item.design?.elements || []}>
      <MeasurementBlockContent {...props} />
    </EditorProvider>
  );
});
