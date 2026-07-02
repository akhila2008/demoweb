import { supabase } from './supabaseClient';

export async function saveProducts(products: any[]): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const processedProducts = await Promise.all(products.map(async (p) => {
      let productData = { ...p };
      
      // Upload new files if they exist
      const filesToUpload = (p.imageFiles && p.imageFiles.length > 0) 
        ? p.imageFiles 
        : (p.imageFile ? [p.imageFile] : []);
        
      if (filesToUpload.length > 0) {
        const newImageUrls = [];
        for (let i = 0; i < filesToUpload.length; i++) {
          const file = filesToUpload[i];
          if (file && (file instanceof File || file instanceof Blob)) {
            const fileExt = (file as any).name ? (file as any).name.split('.').pop() : 'jpg';
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const { data, error } = await supabase.storage
              .from('product-media')
              .upload(fileName, file);
              
            if (error) {
              console.error('Error uploading file:', error);
              newImageUrls.push(p.images[i] || p.image || ''); 
            } else {
              const { data: publicUrlData } = supabase.storage
                .from('product-media')
                .getPublicUrl(fileName);
              newImageUrls.push(publicUrlData.publicUrl);
            }
          } else {
            // Already a URL
            newImageUrls.push(p.images[i] || p.image);
          }
        }
        productData.images = newImageUrls;
        productData.image = newImageUrls[0] || productData.image;
      }
      
      // Remove File objects so JSON serialization doesn't crash or store junk
      delete productData.imageFiles;
      delete productData.imageFile;
      
      return productData;
    }));

    const currentIds = processedProducts.map(p => p.id);
    
    // Delete removed products
    const { data: existing } = await supabase.from('products').select('id');
    const existingIds = existing?.map(r => r.id) || [];
    const idsToDelete = existingIds.filter(id => !currentIds.includes(id));
    
    if (idsToDelete.length > 0) {
      await supabase.from('products').delete().in('id', idsToDelete);
    }
    
    // Upsert remaining products
    if (processedProducts.length > 0) {
      const { error } = await supabase.from('products').upsert(
        processedProducts.map(p => ({ id: p.id, data: p }))
      );
      if (error) throw error;
    }

    window.dispatchEvent(new Event('akhila_products_updated'));
    return true;
  } catch (e) {
    console.error('Error saving to Supabase:', e);
    console.error('Error details:', JSON.stringify(e), e.message || e.details || e.hint);
    return false;
  }
}

export async function loadProducts(): Promise<any[]> {
  if (typeof window === 'undefined') return [];
  try {
    const { data, error } = await supabase.from('products').select('data');
    if (error) throw error;
    
    let products = data.map(row => row.data);

    // Auto-migration from IndexedDB
    if (products.length === 0) {
      try {
        const oldProducts = await new Promise<any[]>((resolve) => {
          const req = indexedDB.open('AkhilaSareesDB', 2);
          req.onsuccess = (e: any) => {
            const db = e.target.result;
            if (db.objectStoreNames.contains('products')) {
              const tx = db.transaction('products', 'readonly');
              const getReq = tx.objectStore('products').get('all_products');
              getReq.onsuccess = () => resolve(getReq.result || []);
              getReq.onerror = () => resolve([]);
            } else {
              resolve([]);
            }
          };
          req.onerror = () => resolve([]);
        });

        if (oldProducts && oldProducts.length > 0) {
          console.log('Migrating local products to Supabase...');
          await saveProducts(oldProducts);
          const { data: newData } = await supabase.from('products').select('data');
          if (newData) products = newData.map(row => row.data);
        }
      } catch (err) {
        console.error('Migration failed:', err);
      }
    }
    
    return products;
  } catch (e) {
    console.error('Error loading products from Supabase', e);
    return [];
  }
}

export async function saveOffers(offers: any[]): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const processedOffers = await Promise.all(offers.map(async (o) => {
      let offerData = { ...o };
      
      if (o.imageFile && (o.imageFile instanceof File || o.imageFile instanceof Blob)) {
        const fileExt = (o.imageFile as any).name ? (o.imageFile as any).name.split('.').pop() : 'jpg';
        const fileName = `offer_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('product-media')
          .upload(fileName, o.imageFile);
          
        if (error) {
          console.error('Error uploading offer file:', error);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('product-media')
            .getPublicUrl(fileName);
          offerData.image = publicUrlData.publicUrl;
        }
      }
      
      delete offerData.imageFile;
      return offerData;
    }));

    const currentIds = processedOffers.map(o => o.id);
    
    const { data: existing } = await supabase.from('offers').select('id');
    const existingIds = existing?.map(r => r.id) || [];
    const idsToDelete = existingIds.filter(id => !currentIds.includes(id));
    
    if (idsToDelete.length > 0) {
      await supabase.from('offers').delete().in('id', idsToDelete);
    }
    
    if (processedOffers.length > 0) {
      const { error } = await supabase.from('offers').upsert(
        processedOffers.map(o => ({ id: o.id, data: o }))
      );
      if (error) throw error;
    }

    return true;
  } catch (e) {
    console.error('Error saving offers to Supabase:', e);
    return false;
  }
}

export async function loadOffers(): Promise<any[]> {
  if (typeof window === 'undefined') return [];
  try {
    const { data, error } = await supabase.from('offers').select('data');
    if (error) throw error;
    
    let offers = data.map(row => row.data);

    // Auto-migration from IndexedDB
    if (offers.length === 0) {
      try {
        const oldOffers = await new Promise<any[]>((resolve) => {
          const req = indexedDB.open('AkhilaSareesDB', 2);
          req.onsuccess = (e: any) => {
            const db = e.target.result;
            if (db.objectStoreNames.contains('offers')) {
              const tx = db.transaction('offers', 'readonly');
              const getReq = tx.objectStore('offers').get('all_offers');
              getReq.onsuccess = () => resolve(getReq.result || []);
              getReq.onerror = () => resolve([]);
            } else {
              resolve([]);
            }
          };
          req.onerror = () => resolve([]);
        });

        if (oldOffers && oldOffers.length > 0) {
          console.log('Migrating local offers to Supabase...');
          await saveOffers(oldOffers);
          const { data: newData } = await supabase.from('offers').select('data');
          if (newData) offers = newData.map(row => row.data);
        }
      } catch (err) {
        console.error('Migration failed:', err);
      }
    }
    
    return offers;
  } catch (e) {
    console.error('Error loading offers from Supabase', e);
    return [];
  }
}

export async function initializeStorage(): Promise<boolean> {
  // Supabase doesn't require initialization like IndexedDB
  return true;
}
