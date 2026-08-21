'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { OrderStepper } from "@/features/orders/components/order-stepper";
import { PageHeader } from "@/components/common/page-header";

function NewOrderContent() {
  const searchParams = useSearchParams();
  const draftOrderId = searchParams.get('orderId') || undefined;

  return (
    <div className="flex flex-col h-[calc(100dvh)] md:h-auto md:space-y-6 md:p-0">
      <div className="hidden md:block">
        <PageHeader 
          title={draftOrderId ? "Edit Draft Order" : "Create New Order"} 
          description={draftOrderId ? "Continue editing and complete this draft order." : "Follow the steps below to create a new workshop order."}
        />
      </div>
      <div className="flex-1 bg-surface md:rounded-xl md:border md:border-outline-variant md:shadow-sm md:p-6 w-full max-w-full overflow-hidden flex flex-col">
        <OrderStepper initialOrderId={draftOrderId} />
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={null}>
      <NewOrderContent />
    </Suspense>
  );
}
