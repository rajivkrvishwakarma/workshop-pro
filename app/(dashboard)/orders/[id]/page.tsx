'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGetOrder } from '@/hooks/api/use-orders';
import { Loader2, ArrowLeft, Calendar, FileText, User, Phone, MapPin, Package, CheckCircle2, Factory } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { EditorProvider } from '@/features/editor/store/EditorContext';
import { AnnotationEditor } from '@/features/editor/components/AnnotationEditor';

export default function OrderViewPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [fullScreenItem, setFullScreenItem] = useState<any>(null);

  const { data: order, isLoading, error } = useGetOrder(orderId);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center">
        <h3 className="text-lg font-semibold text-on-surface mb-2">Order not found</h3>
        <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => router.back()} variant="outline">Go Back</Button>
      </div>
    );
  }

  const isDraft = !order.statusId;
  const status = isDraft ? { name: 'Draft', color: '#f59e0b' } : order.status;

  return (
    <div className="flex flex-col bg-background md:bg-transparent pb-24 md:pb-8 animate-in fade-in duration-300 max-w-5xl mx-auto w-full">

      <div className="hidden md:flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Order #{order.id.slice(0, 8).toUpperCase()}
            <span 
              className="px-3 py-1 rounded-full text-sm font-semibold tracking-normal"
              style={{ 
                backgroundColor: `${status?.color || '#94a3b8'}20`, 
                color: status?.color || '#475569' 
              }}
            >
              {status?.name}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm flex items-center mt-1">
            <Calendar className="w-4 h-4 mr-2" />
            Created on {format(new Date(order.createdAt), 'MMMM do, yyyy - h:mm a')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:p-0">
        
        {/* Left Column: Customer & Commercials */}
        <div className="flex flex-col gap-4 sm:gap-6 lg:col-span-1">
          {/* Customer Details Card */}
          <div className="bg-surface border border-outline-variant rounded-xl p-3 sm:p-5 shadow-sm">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Customer Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-semibold text-on-surface">{order.customer?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Mobile Number
                </p>
                <p className="font-medium text-on-surface">{order.customer?.mobile || 'N/A'}</p>
              </div>
              {order.customer?.address && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Address
                  </p>
                  <p className="text-sm text-on-surface mt-1">{order.customer.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Commercials Card */}
          <div className="bg-surface border border-outline-variant rounded-xl p-3 sm:p-5 shadow-sm">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Commercials
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Rate Type</span>
                <span className="font-medium capitalize">{order.rateType?.replace('_', ' ') || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Est. Rate</span>
                <span className="font-medium">₹{order.estimatedRate || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Priority</span>
                <span className="font-medium capitalize">{order.priority || 'Normal'}</span>
              </div>
              {order.deadline && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className="font-medium text-red-600">{format(new Date(order.deadline), 'MMM d, yyyy')}</span>
                </div>
              )}
              {order.expectedWeight > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Expected Weight</span>
                  <span className="font-medium">{order.expectedWeight} kg</span>
                </div>
              )}
              <hr className="border-outline-variant my-2" />
              <div className="flex justify-between items-center text-lg font-bold text-primary">
                <span>Advance Paid</span>
                <span>₹{order.advanceAmount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Items */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          <div className="bg-surface border border-outline-variant rounded-xl p-3 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Order Items ({order.items?.length || 0})
              </h3>
            </div>
            
            {order.items && order.items.length > 0 ? (
              <div className="grid gap-3 sm:gap-4">
                {order.items.map((item: any, index: number) => (
                  <div key={item.id} className="border border-outline-variant rounded-lg p-3 sm:p-4 flex flex-col xl:flex-row gap-4 sm:gap-6 bg-surface-container-lowest">
                    {/* Item Image */}
                    {item.product?.imageUrl ? (
                      <div className="w-full lg:w-[400px] h-[300px] bg-surface-variant rounded-md overflow-hidden relative shrink-0 border border-outline-variant">
                        <EditorProvider initialElements={item.design?.elements || []}>
                          <AnnotationEditor 
                            imageUrl={item.product.imageUrl} 
                            canvasWidth={Number(item.design?.width) || 0}
                            canvasHeight={Number(item.design?.height) || 0}
                            unit={item.design?.unit}
                            holfass={item.design?.holfass}
                            kabja={item.design?.kabja}
                            hasVentilator={item.design?.hasVentilator}
                            ventilatorImageUrl={item.design?.ventilatorImageUrl}
                            readOnly={true}
                            onViewFullScreen={() => setFullScreenItem(item)}
                          />
                        </EditorProvider>
                      </div>
                    ) : (
                      <div className="w-full lg:w-[400px] h-[300px] bg-surface-variant flex items-center justify-center rounded-md shrink-0 text-muted-foreground border border-outline-variant">
                        <Factory className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    
                    <div className="flex-1 flex flex-col pt-2 lg:pt-0">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-on-surface text-xl">{item.product?.category || 'Custom Product'}</h4>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">Item {index + 1}</span>
                      </div>
                      
                      {item.design && (
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm bg-surface rounded-md p-3 border border-outline-variant">
                          {item.design.width && item.design.height && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground text-[10px] uppercase tracking-wider block mb-0.5">Size</span>
                              <span className="font-semibold text-on-surface">{item.design.width} (Width) × {item.design.height} (Height) {item.design.unit || ''}</span>
                            </div>
                          )}
                          {item.design.material && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground text-[10px] uppercase tracking-wider block mb-0.5">Material</span>
                              <span className="font-medium">{item.design.material}</span>
                            </div>
                          )}
                          {item.design.kabja && item.design.kabja !== 'none' && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground text-[10px] uppercase tracking-wider block mb-0.5">Kabja</span>
                              <span className="font-medium capitalize">{item.design.kabja}</span>
                            </div>
                          )}
                          {item.design.holfass?.side && item.design.holfass.side !== 'none' && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground text-[10px] uppercase tracking-wider block mb-0.5">Holfass ({item.design.holfass.side})</span>
                              <div className="font-medium text-xs text-on-surface flex flex-wrap gap-x-3 gap-y-1">
                                {item.design.holfass[item.design.holfass.side]?.top && (
                                  <span>Top: {item.design.holfass[item.design.holfass.side].top}</span>
                                )}
                                {item.design.holfass[item.design.holfass.side]?.middle && (
                                  <span>Middle: {item.design.holfass[item.design.holfass.side].middle}</span>
                                )}
                                {item.design.holfass[item.design.holfass.side]?.bottom && (
                                  <span>Bottom: {item.design.holfass[item.design.holfass.side].bottom}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-surface-container-lowest rounded-lg border border-dashed border-outline-variant">
                No items added to this order yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Full Screen Modal */}
      <Dialog open={!!fullScreenItem} onOpenChange={(open) => !open && setFullScreenItem(null)}>
        <DialogContent className="max-w-full w-screen h-[100dvh] max-h-screen p-0 m-0 rounded-none border-none flex flex-col bg-background gap-0 overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">Full Screen View</DialogTitle>
          <DialogDescription className="sr-only">View item design in full screen</DialogDescription>
          
          <div className="flex justify-between items-center p-4 bg-surface border-b border-outline-variant z-50 shrink-0">
             <h2 className="font-bold text-lg">{fullScreenItem?.product?.category || 'Custom Product'}</h2>
             <Button variant="ghost" size="icon" onClick={() => setFullScreenItem(null)}>
               <span className="material-symbols-outlined">close</span>
             </Button>
          </div>
          
          <div className="flex-1 relative bg-[#f8f9fa] overflow-hidden w-full h-full">
             {fullScreenItem && (
                <EditorProvider initialElements={fullScreenItem.design?.elements || []}>
                  <AnnotationEditor 
                    imageUrl={fullScreenItem.product.imageUrl} 
                    canvasWidth={Number(fullScreenItem.design?.width) || 0}
                    canvasHeight={Number(fullScreenItem.design?.height) || 0}
                    unit={fullScreenItem.design?.unit}
                    holfass={fullScreenItem.design?.holfass}
                    kabja={fullScreenItem.design?.kabja}
                    hasVentilator={fullScreenItem.design?.hasVentilator}
                    ventilatorImageUrl={fullScreenItem.design?.ventilatorImageUrl}
                    readOnly={true}
                  />
                </EditorProvider>
             )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
