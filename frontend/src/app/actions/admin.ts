'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('admin_auth')?.value === 'true';
  if (!isAdmin) {
    throw new Error('Unauthorized');
  }
}

export async function getCategories() {
  const { data, error } = await supabaseAdmin.from('categories').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function addCategory(name: string, description: string) {
  await requireAdmin();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const { data, error } = await supabaseAdmin.from('categories').insert({ name, slug, description }).select().single();
  if (error) throw error;
  return data;
}

export async function addProduct(productData: any, imageUrls: string[]) {
  await requireAdmin();
  
  const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
  
  const { data: product, error } = await supabaseAdmin.from('products').insert({
    category_id: productData.category_id,
    name: productData.name,
    slug: slug,
    description: productData.description || '',
    price: productData.price,
    stock: productData.stock,
    is_active: true,
    colors: productData.colors || [],
    occasions: productData.occasions || []
  }).select().single();

  if (error) throw error;

  if (imageUrls.length > 0) {
    const imagesToInsert = imageUrls.map((url, idx) => ({
      product_id: product.id,
      url,
      sort_order: idx
    }));
    const { error: imgError } = await supabaseAdmin.from('product_images').insert(imagesToInsert);
    if (imgError) throw imgError;
  }
  
  revalidatePath('/admin/products');
  revalidatePath('/shop');
  return product;
}

export async function updateProduct(productId: string, productData: any, imageUrls: string[]) {
  await requireAdmin();
  
  const { error } = await supabaseAdmin.from('products').update({
    category_id: productData.category_id,
    name: productData.name,
    description: productData.description || '',
    price: productData.price,
    stock: productData.stock,
    is_active: productData.is_active !== undefined ? productData.is_active : true,
    colors: productData.colors || [],
    occasions: productData.occasions || []
  }).eq('id', productId);

  if (error) throw error;

  // For images, we simply append new ones. Deleting is handled separately.
  if (imageUrls.length > 0) {
    // Get max sort_order
    const { data: existingImgs } = await supabaseAdmin.from('product_images').select('sort_order').eq('product_id', productId).order('sort_order', { ascending: false }).limit(1);
    let startIdx = existingImgs && existingImgs.length > 0 ? existingImgs[0].sort_order + 1 : 0;
    
    const imagesToInsert = imageUrls.map((url, idx) => ({
      product_id: productId,
      url,
      sort_order: startIdx + idx
    }));
    const { error: imgError } = await supabaseAdmin.from('product_images').insert(imagesToInsert);
    if (imgError) throw imgError;
  }
  
  revalidatePath('/admin/products');
  revalidatePath('/shop');
  revalidatePath(`/product/${productId}`);
  return true;
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  const { error } = await supabaseAdmin.from('products').delete().eq('id', productId);
  if (error) throw error;
  revalidatePath('/admin/products');
  revalidatePath('/shop');
  return true;
}

export async function deleteProductImage(imageId: string) {
  await requireAdmin();
  const { error } = await supabaseAdmin.from('product_images').delete().eq('id', imageId);
  if (error) throw error;
  revalidatePath('/admin/products');
  return true;
}
