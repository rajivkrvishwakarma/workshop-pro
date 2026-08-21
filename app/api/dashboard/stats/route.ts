import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, payments, statuses } from '@/drizzle/schema/orders';
import { customers } from '@/drizzle/schema/customers';
import { workshopUsers } from '@/drizzle/schema/workshop-users';
import { orderActivities } from '@/drizzle/schema/order-activities';
import { eq, sql, ne, and, gte, lt, desc } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    // 1. Total Revenue
    const revenueResult = await db
      .select({ total: sql<number>`sum(${payments.amount})` })
      .from(payments)
      .where(eq(payments.status, 'completed'));
    
    const totalRevenue = Number(revenueResult[0]?.total || 0);

    // 2. Customers
    const customersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers);
    const totalCustomers = Number(customersResult[0]?.count || 0);

    // 3. Staff Members
    const staffResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(workshopUsers)
      .where(eq(workshopUsers.isActive, true));
    const totalStaff = Number(staffResult[0]?.count || 0);

    // 4. Fetch orders and statuses to calculate Active Orders and Total Due
    const allOrders = await db.select().from(orders);
    const allStatuses = await db.select().from(statuses);
    
    // Map status names to IDs
    const completedStatusIds = allStatuses
      .filter(s => s.name.toLowerCase() === 'completed' || s.name.toLowerCase() === 'delivered' || s.name.toLowerCase() === 'cancelled')
      .map(s => s.id);

    let activeOrdersCount = 0;
    let totalDue = 0;
    let todayDeadlinesCount = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all completed payments by order
    const allPayments = await db.select().from(payments).where(eq(payments.status, 'completed'));
    const paymentMap = allPayments.reduce((acc, p) => {
      acc[p.orderId] = (acc[p.orderId] || 0) + Number(p.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    for (const order of allOrders) {
      // Active Orders
      if (order.statusId && !completedStatusIds.includes(order.statusId)) {
        activeOrdersCount++;
      }

      // Total Due
      if (order.estimatedAmount) {
        const advance = Number(order.advanceAmount || 0);
        const paid = paymentMap[order.id] || 0;
        const discount = Number(order.discount || 0);
        const due = Number(order.estimatedAmount) - advance - paid - discount;
        if (due > 0) {
          totalDue += due;
        }
      }

      // Today Deadlines
      if (order.deadline) {
        const deadlineDate = new Date(order.deadline);
        if (deadlineDate >= today && deadlineDate < tomorrow) {
          todayDeadlinesCount++;
        }
      }
    }

    // 5. Recent Activity
    const recentActivities = await db
      .select({
        id: orderActivities.id,
        action: orderActivities.action,
        createdAt: orderActivities.createdAt,
        orderId: orders.id,
      })
      .from(orderActivities)
      .leftJoin(orders, eq(orderActivities.orderId, orders.id))
      .orderBy(desc(orderActivities.createdAt))
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalCustomers,
        totalStaff,
        activeOrders: activeOrdersCount,
        totalDue,
        todayDeadlines: todayDeadlinesCount,
        recentActivities,
      }
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to fetch dashboard stats' } },
      { status: 500 }
    );
  }
}
