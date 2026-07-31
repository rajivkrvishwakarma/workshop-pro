import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const statuses = await db.query.statuses.findMany({
      orderBy: (statuses, { asc }) => [asc(statuses.sequence)],
    });
    return NextResponse.json({ success: true, data: statuses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
