const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_MvIU6qVj9KCH@ep-delicate-wildflower-atf6ys2w.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require' });
pool.query(`insert into "order_items" ("id", "order_id", "product_type", "category", "preview_image_id", "design_data") values ($1, $2, $3, $4, $5, $6)`, 
['96cccd9a-8372-4296-97b4-e2b1c60b7967', '0f530e2f-6564-419c-a08d-1db88aa15be3', 'Main Gate', 'Main Gate', 'https://res.cloudinary.com/dykqvsfd1/image/upload/v1783840723/workshop/product-masters/fcnawlx9a4gzc9y4etml.png', {"width":72,"height":89,"unit":"inch","material":"Mild Steel","templateId":"Main Gate","holfass":{"side":"none","left":{"top":"","middle":"","bottom":""},"right":{"top":"","middle":"","bottom":""}},"kabja":"none","hasVentilator":false,"ventilatorImageUrl":"","elements":[]}])
.then(() => console.log('success'))
.catch(e => console.error(e))
.finally(() => pool.end());
