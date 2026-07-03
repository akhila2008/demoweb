const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateOrders() {
  console.log("Starting order migration...");
  
  // 1. Fetch legacy orders
  const { data: legacyOrders, error: fetchErr } = await supabase.from('legacy_orders_jsonb').select('*');
  if (fetchErr) {
    console.error("Error fetching legacy orders:", fetchErr.message);
    return;
  }
  
  if (!legacyOrders || legacyOrders.length === 0) {
    console.log("No legacy orders found to migrate.");
    return;
  }

  // 2. Migrate each order
  for (const row of legacyOrders) {
    const data = row.data;
    const orderId = row.id;
    if (!orderId) continue;

    console.log(`Migrating Order ${orderId}...`);
    
    // Check if order already exists in new table
    const { data: existing } = await supabase.from('orders').select('id').eq('order_number', orderId).single();
    if (existing) {
      console.log(`Order ${orderId} already migrated.`);
      continue;
    }

    // Insert Order
    const { data: newOrder, error: insertErr } = await supabase.from('orders').insert({
      user_id: row.user_id || null, // Assuming UUID is stored if logged in
      order_number: orderId,
      status: data.status || 'CONFIRMED',
      subtotal: Number(data.subtotal) || 0,
      shipping_fee: Number(data.shipping) || 0,
      discount: Number(data.discount) || 0,
      grand_total: Number(data.total) || 0,
      shipping_address: data.customer || {},
      created_at: row.created_at || new Date().toISOString()
    }).select('id').single();

    if (insertErr) {
      console.error(`Failed to insert Order ${data.id}:`, insertErr);
      continue;
    }

    // Insert Order Items
    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        // Try to find the new product UUID based on name
        const { data: prod } = await supabase.from('products').select('id').eq('name', item.name).single();
        
        await supabase.from('order_items').insert({
          order_id: newOrder.id,
          product_id: prod ? prod.id : null,
          product_name: item.name,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1
        });
      }
    }

    // Insert Payment if exists
    if (data.paymentId || data.paymentMethod) {
      await supabase.from('payments').insert({
        order_id: newOrder.id,
        razorpay_payment_id: data.paymentId || null,
        amount: Number(data.total) || 0,
        status: data.status === 'CONFIRMED' ? 'CAPTURED' : 'CREATED',
        payment_method: data.paymentMethod || 'ONLINE'
      });
    }
  }

  console.log("Order migration complete!");
}

migrateOrders();
