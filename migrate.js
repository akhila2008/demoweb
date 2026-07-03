const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateProducts() {
  console.log("Starting product migration...");
  
  // 1. Fetch legacy products
  const { data: legacyProducts, error: fetchErr } = await supabase.from('legacy_products_jsonb').select('*');
  if (fetchErr) {
    console.error("Error fetching legacy products (maybe table doesn't exist?):", fetchErr.message);
    return;
  }
  
  if (!legacyProducts || legacyProducts.length === 0) {
    console.log("No legacy products found to migrate.");
    return;
  }

  // Clear existing products to avoid duplicates
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // 2. Insert Category if not exists
  let categoryId;
  const { data: catData } = await supabase.from('categories').select('id').eq('slug', 'migrated-silk').single();
  if (catData) {
    categoryId = catData.id;
  } else {
    const { data: newCat, error: catErr } = await supabase.from('categories').insert({
      name: 'Migrated Silk',
      slug: 'migrated-silk',
      description: 'Legacy products'
    }).select('id').single();
    if (catErr) {
      console.error("Error creating category:", catErr);
      return;
    }
    categoryId = newCat.id;
  }

  // 3. Migrate each product
  for (const row of legacyProducts) {
    const data = row.data;
    if (!data.name) continue;

    console.log(`Migrating ${data.name}...`);
    
    // Generate slug
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const { data: newProduct, error: insertErr } = await supabase.from('products').insert({
      category_id: categoryId,
      name: data.name,
      slug: slug,
      description: data.description || '',
      price: Number(data.price) || 0,
      compare_at_price: null,
      stock: Number(data.stock) || 10,
      is_active: true
    }).select('id').single();

    if (insertErr) {
      console.error(`Failed to insert ${data.name}:`, insertErr);
      continue;
    }

    // Insert Images
    let imageUrls = [];
    if (data.images && Array.isArray(data.images)) {
      imageUrls = data.images;
    } else if (data.image) {
      imageUrls = [data.image];
    }

    console.log(`Found ${imageUrls.length} images for ${data.name}`);

    if (imageUrls.length > 0) {
      const imagesToInsert = imageUrls.map((url, idx) => ({
        product_id: newProduct.id,
        url: url,
        sort_order: idx
      }));
      const { error: imgErr } = await supabase.from('product_images').insert(imagesToInsert);
      if (imgErr) {
        console.error(`Failed to insert images for ${data.name}:`, imgErr);
      } else {
        console.log(`Inserted images for ${data.name}`);
      }
    }
  }

  console.log("Migration complete!");
}

migrateProducts();
