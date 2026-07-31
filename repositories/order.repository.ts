import 'server-only';
import { db } from '@/lib/db';
import { orders, orderItems, orderAttachments } from '@/drizzle/schema';
import type { InferInsertModel } from 'drizzle-orm';
import { eq, and, notInArray, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

type OrderInsert = InferInsertModel<typeof orders>;
type OrderItemInsert = InferInsertModel<typeof orderItems>;

export class OrderRepository {
  static async create(orderData: Omit<OrderInsert, 'id'>, itemsData: any[]) {
    return await db.transaction(async (tx) => {
      const orderId = uuidv4();
      const [order] = await tx
        .insert(orders)
        .values({ ...orderData, id: orderId })
        .returning();

      if (itemsData.length > 0) {
        const itemsToInsert = itemsData.map((item) => ({
          id: uuidv4(),
          orderId: order.id,
          productType: item.product?.category || null,
          category: item.product?.category || null,
          previewImageId: item.product?.imageUrl || null,
          designData: item.design ? item.design : {},
        }));
        await tx.insert(orderItems).values(itemsToInsert);
      }

      return order;
    });
  }

  static async findById(id: string) {
    const order = await db.query.orders.findFirst({
      where: (t, { eq }) => eq(t.id, id),
      with: {
        customer: true,
        items: true,
        status: true,
      },
    });

    if (order && order.items) {
      // Map backend structure back to frontend structure
      order.items = order.items.map((item: any) => ({
        id: item.id,
        product: {
          category: item.category,
          imageUrl: item.previewImageId,
        },
        design: item.designData || {},
      })) as any;
    }
    
    return order;
  }

  static async findAll({ 
    search, 
    statusId, 
    customerId,
    limit = 50, 
    offset = 0 
  }: { 
    search?: string, 
    statusId?: string, 
    customerId?: string,
    limit?: number, 
    offset?: number 
  } = {}) {
    const conditions = [];

    if (statusId) {
      if (statusId === 'draft') {
        conditions.push(sql`${orders.statusId} IS NULL`);
      } else {
        conditions.push(eq(orders.statusId, statusId));
      }
    }
    
    if (customerId) {
      conditions.push(eq(orders.customerId, customerId));
    }

    const data = await db.query.orders.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        customer: true,
        items: true,
        status: true,
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      limit,
      offset,
    });
    
    // Quick and dirty manual search since customer join filtering is tricky with drizzle relational queries
    // Ideally we would use standard query builder for joins if we need to filter by customer name.
    if (search) {
      const lowerSearch = search.toLowerCase();
      return data.filter(order => 
        order.id.toLowerCase().includes(lowerSearch) ||
        (order.customer && order.customer.name.toLowerCase().includes(lowerSearch)) ||
        (order.customer && order.customer.mobile.includes(lowerSearch))
      );
    }

    return data;
  }

  static async update(id: string, orderData: Partial<Omit<OrderInsert, 'id'>>, itemsData?: any[], attachmentsData?: any[]) {
    return await db.transaction(async (tx) => {
      let order;
      if (Object.keys(orderData).length > 0) {
        const [updated] = await tx
          .update(orders)
          .set({ ...orderData, updatedAt: new Date() })
          .where(eq(orders.id, id))
          .returning();
        order = updated;
      } else {
        order = await tx.query.orders.findFirst({ where: eq(orders.id, id) });
      }

      if (itemsData !== undefined) {
        // Extract IDs of items we want to keep
        const idsToKeep = itemsData
          .filter(i => i.id && i.id.length === 36)
          .map(i => i.id);

        // Delete items that belong to this order but are NOT in the payload
        if (idsToKeep.length > 0) {
          await tx.delete(orderItems).where(
            and(
              eq(orderItems.orderId, id),
              notInArray(orderItems.id, idsToKeep)
            )
          );
        } else {
          await tx.delete(orderItems).where(eq(orderItems.orderId, id));
        }

        if (itemsData.length > 0) {
          const itemsToInsert = itemsData.map((item) => ({
            id: item.id && item.id.length === 36 ? item.id : uuidv4(),
            orderId: id,
            productType: item.product?.category || null,
            category: item.product?.category || null,
            previewImageId: item.product?.imageUrl || null,
            designData: item.design ? item.design : {},
          }));
          
          await tx.insert(orderItems)
            .values(itemsToInsert)
            .onConflictDoUpdate({
              target: orderItems.id,
              set: {
                productType: sql`EXCLUDED.product_type`,
                category: sql`EXCLUDED.category`,
                previewImageId: sql`EXCLUDED.preview_image_id`,
                designData: sql`EXCLUDED.design_data`,
                updatedAt: new Date()
              }
            });
        }
      }

      if (attachmentsData !== undefined) {
        // Clear all existing attachments for this order and insert new ones
        await tx.delete(orderAttachments).where(eq(orderAttachments.orderId, id));

        if (attachmentsData.length > 0) {
          const attachmentsToInsert = attachmentsData.map((att: any) => ({
            id: uuidv4(),
            orderId: id,
            fileId: att.url, // using url as fileId for now since it's required
            type: att.type || 'Site',
            url: att.url,
            isVoiceNote: att.isVoiceNote || false,
            size: att.size || null,
          }));
          await tx.insert(orderAttachments).values(attachmentsToInsert);
        }
      }

      return order;
    });
  }
}
