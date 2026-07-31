const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { eq } = require('drizzle-orm');
const { orderItems } = require('./drizzle/schema/orders');

const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_MvIU6qVj9KCH@ep-delicate-wildflower-atf6ys2w.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require' });
const db = drizzle(pool);

async function run() {
  const id = '0f530e2f-6564-419c-a08d-1db88aa15be3';
  const itemsData = [
    {
      id: '96cccd9a-8372-4296-97b4-e2b1c60b7967',
      product: { category: 'Main Gate', imageUrl: 'https://res.cloudinary.com/dykqvsfd1/image/upload/v1783840723/workshop/product-masters/fcnawlx9a4gzc9y4etml.png' },
      design: {"width":72,"height":89,"unit":"inch","material":"Mild Steel","templateId":"Main Gate","holfass":{"side":"none","left":{"top":"","middle":"","bottom":""},"right":{"top":"","middle":"","bottom":""}},"kabja":"none","hasVentilator":false,"ventilatorImageUrl":"","elements":[]}
    },
    {
      id: '9d951176-6105-4c9b-b000-ac207ac92c16',
      product: { category: 'Window', imageUrl: 'https://res.cloudinary.com/dykqvsfd1/image/upload/v1783840771/workshop/product-masters/orqhv7u6hzymvykf3fdp.jpg' },
      design: {"width":25,"height":34,"unit":"inch","material":"Mild Steel","templateId":"Window","holfass":{"side":"none","left":{"top":"","middle":"","bottom":""},"right":{"top":"","middle":"","bottom":""}},"kabja":"none","hasVentilator":false,"ventilatorImageUrl":"","elements":[]}
    }
  ];

  try {
    await db.transaction(async (tx) => {
      console.log('Deleting items...');
      const delRes = await tx.delete(orderItems).where(eq(orderItems.orderId, id));
      console.log('Delete result:', delRes);
      
      const itemsToInsert = itemsData.map((item) => ({
        id: item.id,
        orderId: id,
        productType: item.product?.category || null,
        category: item.product?.category || null,
        previewImageId: item.product?.imageUrl || null,
        designData: item.design ? item.design : {},
      }));
      console.log('Inserting items...');
      const insRes = await tx.insert(orderItems).values(itemsToInsert);
      console.log('Insert result:', insRes);
    });
    console.log('Success!');
  } catch (e) {
    console.error('Error in transaction:', e);
  } finally {
    pool.end();
  }
}

run();
