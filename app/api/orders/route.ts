import { NextRequest, NextResponse } from 'next/server';
import { OrderRepository } from '@/repositories/order.repository';
import { z } from 'zod';

const createOrderSchema = z.object({
  customerId: z.string(),
  priority: z.string().optional(),
  rateType: z.string().optional(),
  estimatedRate: z.number().optional(),
  advanceAmount: z.number().optional(),
  expectedWeight: z.number().optional(),
  deadline: z.string().transform((str) => new Date(str)).optional(),
  remarks: z.string().optional(),
  internalNotes: z.string().optional(),
  items: z.array(z.object({
    productType: z.string(),
    category: z.string().optional(),
  })).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createOrderSchema.parse(body);
    
    const { items, ...orderData } = data;
    
    const order = await OrderRepository.create(
      { ...orderData, createdBy: 'system' }, // Replace with session userId
      items || []
    );

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const statusId = searchParams.get('statusId') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const orders = await OrderRepository.findAll({ search, statusId, customerId, limit, offset });
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
