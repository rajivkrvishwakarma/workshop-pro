import { NextRequest, NextResponse } from 'next/server';
import { CanvasRepository } from '@/repositories/canvas.repository';
import { z } from 'zod';

const measurementSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

const canvasObjectSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  rotation: z.number().optional(),
  label: z.string().optional(),
  material: z.string().optional(),
  thickness: z.string().optional(),
  color: z.string().optional(),
  zIndex: z.number().optional(),
  measurements: z.array(measurementSchema).optional(),
});

const canvasLayoutSchema = z.object({
  id: z.string().optional(),
  orderItemId: z.string(),
  zoom: z.number().optional(),
  panX: z.number().optional(),
  panY: z.number().optional(),
  gridEnabled: z.boolean().optional(),
  snapToGrid: z.boolean().optional(),
});

const payloadSchema = z.object({
  layout: canvasLayoutSchema,
  objects: z.array(canvasObjectSchema),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { layout, objects } = payloadSchema.parse(body);
    
    // We expect the frontend to pass the correct orderItemId in layout
    const savedLayout = await CanvasRepository.saveLayout(layout, objects);

    return NextResponse.json({ success: true, data: savedLayout }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(req.url);
    const orderItemId = searchParams.get('orderItemId');
    
    if (!orderItemId) {
      return NextResponse.json({ success: false, error: 'orderItemId is required' }, { status: 400 });
    }

    const layout = await CanvasRepository.getLayoutByOrderItemId(orderItemId);
    return NextResponse.json({ success: true, data: layout });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
