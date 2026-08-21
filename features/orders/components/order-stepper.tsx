'use client';

import { useState, useEffect } from 'react';
import { CustomerStep } from './steps/customer-step';
import { ProductsManagerStep } from './steps/products-manager-step';
import { AttachmentsStep } from './steps/attachments-step';
import { CommercialStep } from './steps/commercial-step';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCreateCustomer } from '@/hooks/api/use-customers';
import { useCreateOrder, useUpdateOrder } from '@/hooks/api/use-orders';
import { get } from '@/lib/api/axios';

const steps = ['Customer', 'Products', 'Attachments', 'Commercial'];

interface OrderStepperProps {
  initialOrderId?: string;
}

export function OrderStepper({ initialOrderId }: OrderStepperProps = {}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [orderData, setOrderData] = useState<any>({});
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutateAsync: createCustomerAsync } = useCreateCustomer();
  const { mutateAsync: createOrderAsync } = useCreateOrder();
  const { mutateAsync: updateOrderAsync } = useUpdateOrder();

  // Auto-resume draft if initialOrderId is provided (e.g. from "Edit" button)
  useEffect(() => {
    if (initialOrderId) {
      handleResumeDraft(initialOrderId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderId]);

  const handleResumeDraft = async (draftOrderId: string) => {
    setIsProcessing(true);
    try {
      const res = await get<any>(`/orders/${draftOrderId}`);
      if (res?.success && res?.data) {
        const order = res.data;
        setOrderId(order.id);
        setOrderData({
          customer: order.customer,
          items: order.items || []
        });
        setCurrentStep(1); // Jump to products
      } else {
        toast.error("Failed to load draft");
      }
    } catch (e) {
      toast.error("Error loading draft");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = async (stepData: any) => {
    const newOrderData = { ...orderData, ...stepData };
    setOrderData(newOrderData);
    
    if (currentStep === 0) {
      // Customer step to Products step
      setIsProcessing(true);
      try {
        let customerId = stepData.customer.id;
        
        // 1. Create or get customer
        if (!customerId) {
          try {
            const custRes = await createCustomerAsync(stepData.customer);
            if (custRes.success) {
              customerId = custRes.data.id;
              newOrderData.customer.id = customerId;
              setOrderData(newOrderData);
            } else {
              throw new Error("Failed to save customer");
            }
          } catch (e) {
            toast.error("Failed to save customer");
            setIsProcessing(false);
            return;
          }
        }
        
        // 2. Create Draft Order if not already created
        if (!orderId) {
          try {
            const orderResData = await createOrderAsync({ customerId });
            if (orderResData.success) {
              setOrderId(orderResData.data.id);
            } else {
              throw new Error("Failed to create draft order");
            }
          } catch (e) {
            toast.error("Failed to create draft order");
            setIsProcessing(false);
            return;
          }
        }
        
        setCurrentStep(currentStep + 1);
      } catch (e) {
        toast.error("An error occurred");
      } finally {
        setIsProcessing(false);
      }
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final Submit to API (Finalize order state)
      setIsProcessing(true);
      try {
        if (orderId) {
           await updateOrderAsync({ id: orderId, data: { ...stepData, isSubmit: true } });
        }
        setIsSuccess(true);
        setTimeout(() => {
           router.push('/');
        }, 2000);
      } catch (e) {
        toast.error("Failed to submit order");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto md:p-4 md:space-y-6 h-full flex flex-col">
      {/* Stepper Header (Hidden on Mobile) */}
      <div className="hidden md:flex justify-between items-center mb-12 relative px-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isPending = index > currentStep;

          return (
            <div key={step} className="flex items-center flex-1 relative group">
              <div className="flex flex-col items-center flex-1 relative z-10 cursor-default">
                <div 
                  className={`
                    flex items-center justify-center font-black transition-all duration-300
                    ${isActive ? 'w-14 h-14 rounded-2xl bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-xl scale-110 text-xl' : ''}
                    ${isCompleted ? 'w-12 h-12 rounded-xl bg-primary/90 text-primary-foreground shadow-md text-lg' : ''}
                    ${isPending ? 'w-12 h-12 rounded-xl bg-muted text-muted-foreground border-2 border-transparent text-lg' : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div 
                  className={`
                    absolute -bottom-8 whitespace-nowrap text-sm font-semibold transition-all duration-300
                    ${isActive ? 'text-primary scale-110 drop-shadow-sm' : ''}
                    ${isCompleted ? 'text-foreground' : ''}
                    ${isPending ? 'text-muted-foreground/70' : ''}
                  `}
                >
                  {step}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="absolute left-[50%] right-[-50%] top-1/2 -translate-y-1/2 flex items-center z-0 px-4">
                  <div 
                    className={`h-1.5 w-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-primary/80 shadow-[0_0_8px_rgba(var(--primary),0.5)]' : 'bg-muted'}`} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stepper Content */}
      <div className="md:bg-surface md:border border-outline-variant md:rounded-xl md:p-6 md:shadow-sm min-h-[400px] flex-1 flex flex-col w-full relative">
        {isProcessing && (
           <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
           </div>
        )}
        
        {isSuccess ? (
          <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center text-center px-8 animate-in fade-in duration-500 md:relative md:inset-auto md:flex-1 md:w-full md:px-4">
            {/* Animated success icon */}
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30">
                <CheckCircle2 className="w-14 h-14 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-foreground mb-3 tracking-tight">Order Captured!</h2>
            <p className="text-muted-foreground text-base max-w-xs mx-auto leading-relaxed">
              The order has been successfully saved. You can track it from the dashboard.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 w-full max-w-xs">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Redirecting to Dashboard...</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {currentStep === 0 && <CustomerStep onNext={handleNext} onResumeDraft={handleResumeDraft} defaultData={orderData.customer} />}
            {currentStep === 1 && <ProductsManagerStep orderId={orderId!} onNext={handleNext} onBack={handleBack} defaultData={orderData.items} />}
            {currentStep === 2 && <AttachmentsStep orderId={orderId!} onNext={handleNext} onBack={handleBack} defaultData={orderData.attachments} />}
            {currentStep === 3 && <CommercialStep orderId={orderId!} onNext={handleNext} onBack={handleBack} defaultData={orderData.commercial} />}
          </>
        )}
      </div>
    </div>
  );
}
