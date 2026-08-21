import { NextRequest, NextResponse } from 'next/server';
import { OrderRepository } from '@/repositories/order.repository';
import { z } from 'zod';

const updateOrderSchema = z.object({
  customerId: z.string().optional(),
  priority: z.string().optional(),
  rateType: z.string().optional(),
  estimatedRate: z.number().optional(),
  advanceAmount: z.number().optional(),
  expectedWeight: z.number().optional(),
  deadline: z.string().transform((str) => new Date(str)).optional(),
  remarks: z.string().optional(),
  internalNotes: z.string().optional(),
  items: z.array(z.object({
    id: z.string().optional(),
    product: z.object({
      category: z.string().optional(),
      imageUrl: z.string().optional(),
      description: z.string().optional(),
    }).optional(),
    design: z.any().optional(), // allow unstructured JSON for design data
  })).optional(),
  attachments: z.array(z.object({
    url: z.string(),
    type: z.string().optional(),
    isVoiceNote: z.boolean().optional(),
    size: z.number().optional()
  })).optional(),
  isSubmit: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Safely extract id for both Next 14 and 15
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const order = await OrderRepository.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { db } from '@/lib/db';
import { statuses } from '@/drizzle/schema';
import { ilike } from 'drizzle-orm';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    if (!id || id === 'undefined') {
      return NextResponse.json({ success: false, error: 'Invalid order ID' }, { status: 400 });
    }
    
    const body = await req.json();
    const data = updateOrderSchema.parse(body);
    
    const { items, attachments, isSubmit, ...orderData } = data as any;
    
    if (isSubmit) {
      // Find the "New" or "Pending" status
      let status = await db.query.statuses.findFirst({
        where: ilike(statuses.name, '%new%'),
      });
      
      if (!status) {
        // Fallback: pick the first status if "new" doesn't exist
        status = await db.query.statuses.findFirst({
          orderBy: (s, { asc }) => [asc(s.sequence)],
        });
      }

      // If absolutely no statuses exist in the DB, create a default "New" status
      if (!status) {
        const { v4: uuidv4 } = require('uuid');
        const newStatus = {
          id: uuidv4(),
          name: 'New',
          color: '#3b82f6', // blue
          sequence: 1
        };
        await db.insert(statuses).values(newStatus);
        status = newStatus as any;
      }

      if (status) {
        orderData.statusId = status.id;
      }
    }
    
    const order = await OrderRepository.update(id, orderData, items as any[], attachments as any[]);

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      detail: error.detail,
      code: error.code,
      hint: error.hint
    }, { status: 400 });
  }
}
