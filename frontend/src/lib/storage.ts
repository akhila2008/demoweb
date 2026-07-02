export async function saveProducts(products: any[]): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AkhilaSareesDB', 2);
    
    request.onupgradeneeded = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products');
      }
      if (!db.objectStoreNames.contains('offers')) {
        db.createObjectStore('offers');
      }
    };
    
    request.onsuccess = (e) => {
      const db = (e.target as any).result;
      const tx = db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');
      store.put(products, 'all_products');
      
      tx.oncomplete = () => {
        // Also fire a custom event so other tabs/components can know about the update
        window.dispatchEvent(new Event('akhila_products_updated'));
        resolve(true);
      };
      tx.onerror = () => {
        console.error('Error saving to IndexedDB:', tx.error);
        reject(tx.error);
      };
    };
    
    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject(request.error);
    };
  });
}

export async function loadProducts(): Promise<any[]> {
  if (typeof window === 'undefined') return [];
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AkhilaSareesDB', 2);
    
    request.onupgradeneeded = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products');
      }
      if (!db.objectStoreNames.contains('offers')) {
        db.createObjectStore('offers');
      }
    };
    
    request.onsuccess = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains('products')) {
        return resolve([]);
      }
      
      const tx = db.transaction('products', 'readonly');
      const store = tx.objectStore('products');
      const getReq = store.get('all_products');
      
      getReq.onsuccess = () => {
        const results = getReq.result || [];
        // Rehydrate File objects back into blob URLs
        const hydrated = results.map((p: any) => {
          // Handle old single image format
          if (p.imageFile && (p.imageFile instanceof File || p.imageFile instanceof Blob)) {
            p.image = URL.createObjectURL(p.imageFile);
          }
          // Handle new multiple images format (carousel)
          if (p.imageFiles && Array.isArray(p.imageFiles)) {
            p.images = p.imageFiles.map((f: any) => 
              (f instanceof File || f instanceof Blob) ? URL.createObjectURL(f) : f
            );
          }
          return p;
        });
        resolve(hydrated);
      };
      
      getReq.onerror = () => {
        console.error('Error reading from IndexedDB:', getReq.error);
        reject(getReq.error);
      };
    };
    
    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject(request.error);
    };
  });
}

export async function saveOffers(offers: any[]): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AkhilaSareesDB', 2);
    
    request.onupgradeneeded = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products');
      }
      if (!db.objectStoreNames.contains('offers')) {
        db.createObjectStore('offers');
      }
    };
    
    request.onsuccess = (e) => {
      const db = (e.target as any).result;
      const tx = db.transaction('offers', 'readwrite');
      const store = tx.objectStore('offers');
      store.put(offers, 'all_offers');
      
      tx.oncomplete = () => {
        window.dispatchEvent(new Event('akhila_offers_updated'));
        resolve(true);
      };
      tx.onerror = () => {
        console.error('Error saving offers to IndexedDB:', tx.error);
        reject(tx.error);
      };
    };
    
    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject(request.error);
    };
  });
}

export async function loadOffers(): Promise<any[]> {
  if (typeof window === 'undefined') return [];
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AkhilaSareesDB', 2);
    
    request.onupgradeneeded = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products');
      }
      if (!db.objectStoreNames.contains('offers')) {
        db.createObjectStore('offers');
      }
    };
    
    request.onsuccess = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains('offers')) {
        return resolve([]);
      }
      
      const tx = db.transaction('offers', 'readonly');
      const store = tx.objectStore('offers');
      const getReq = store.get('all_offers');
      
      getReq.onsuccess = () => {
        const results = getReq.result || [];
        const hydrated = results.map((o: any) => {
          if (o.imageFile && (o.imageFile instanceof File || o.imageFile instanceof Blob)) {
            o.image = URL.createObjectURL(o.imageFile);
          }
          return o;
        });
        resolve(hydrated);
      };
      
      getReq.onerror = () => {
        console.error('Error reading offers from IndexedDB:', getReq.error);
        reject(getReq.error);
      };
    };
    
    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject(request.error);
    };
  });
}
