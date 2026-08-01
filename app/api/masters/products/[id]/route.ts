import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productMasters } from '@/drizzle/schema/product-masters';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { category, name, description } = await req.json();

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category is required' }, { status: 400 });
    }

    const [updatedMaster] = await db.update(productMasters).set({
      category,
      name: name || category,
      description,
      updatedAt: new Date(),
    }).where(eq(productMasters.id, resolvedParams.id)).returning();

    if (!updatedMaster) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedMaster });
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      return NextResponse.json({ success: false, error: 'Category name already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const [deletedMaster] = await db.delete(productMasters)
      .where(eq(productMasters.id, resolvedParams.id))
      .returning();

    if (!deletedMaster) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deletedMaster });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
