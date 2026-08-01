import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { materials } from '@/drizzle/schema/materials';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const [updatedMaterial] = await db.update(materials)
      .set({ name, description, updatedAt: new Date() })
      .where(eq(materials.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updatedMaterial });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    await db.delete(materials).where(eq(materials.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
