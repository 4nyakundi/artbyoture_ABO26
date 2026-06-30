import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, setDoc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Default mock products
const initialMockProducts = [
  {
    id: 'art-01',
    name: 'Neo Action',
    description: 'A dynamic, high-energy acrylic painting capturing bold movement and texture.',
    price: 45000,
    imageUrl: '/assets/7BE81036-261E-4BFB-ADD4-781D9F76BF5F.JPG',
    category: 'Paintings',
    type: 'art',
    year: '2026',
    medium: 'Acrylic on Canvas',
    dimensions: '100cm x 120cm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'art-02',
    name: 'Thorned',
    description: 'An evocative cubist oil painting highlighting high-contrast structures and sharp forms.',
    price: 38000,
    imageUrl: '/assets/7D43C050-0C75-49E7-860E-415290BA16EF.jpg',
    category: 'Paintings',
    type: 'art',
    year: '2025',
    medium: 'Oil on Canvas',
    dimensions: '80cm x 100cm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'art-03',
    name: 'Pure Motion',
    description: 'A black-and-white fluid abstract work mimicking the flow of natural patterns.',
    price: 52000,
    imageUrl: '/assets/BCB72D95-50CC-4213-9FE9-6C4141604DAF.JPG',
    category: 'Paintings',
    type: 'art',
    year: '2025',
    medium: 'Acrylic on Canvas',
    dimensions: '110cm x 110cm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'art-04',
    name: 'Cubism Dream',
    description: 'Picasso-inspired cubism composition blending human forms and abstract lines.',
    price: 60000,
    imageUrl: '/assets/IMG_0559.jpg',
    category: 'Paintings',
    type: 'art',
    year: '2026',
    medium: 'Mixed Media on Wood',
    dimensions: '90cm x 120cm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'art-05',
    name: "Picasso's Muse",
    description: 'A study in minimalist line art and bold blocks of organic shapes.',
    price: 35000,
    imageUrl: '/assets/IMG_0959_Original.JPG',
    category: 'Paintings',
    type: 'art',
    year: '2025',
    medium: 'Acrylic and Charcoal',
    dimensions: '60cm x 80cm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'art-06',
    name: 'Zebra Lines',
    description: 'The iconic zebra wave pattern, expressing natural complexity and contrast.',
    price: 48000,
    imageUrl: '/assets/IMG_1333.jpg',
    category: 'Paintings',
    type: 'art',
    year: '2026',
    medium: 'Acrylic on Canvas',
    dimensions: '100cm x 100cm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'art-07',
    name: 'Organic Flow',
    description: 'A gorgeous, complex texturized oil canvas, rendering deep layers of movement.',
    price: 55000,
    imageUrl: '/assets/IMG_2048_Original.JPG',
    category: 'Paintings',
    type: 'art',
    year: '2025',
    medium: 'Oil on Canvas',
    dimensions: '120cm x 150cm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'art-08',
    name: 'Abstract Waves',
    description: 'A vibrant acrylic piece experimenting with black, grey, and white layers.',
    price: 32000,
    imageUrl: '/assets/IMG_2796.JPG',
    category: 'Paintings',
    type: 'art',
    year: '2026',
    medium: 'Acrylic on Canvas',
    dimensions: '70cm x 90cm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'art-09',
    name: 'Shattered Minds',
    description: 'A psychological representation of fragmented thought, painted with heavy textures.',
    price: 40000,
    imageUrl: '/assets/ac01249f-c3e8-43fa-8c76-fbf83d5e5e07.jpg',
    category: 'Paintings',
    type: 'art',
    year: '2026',
    medium: 'Mixed Media on Canvas',
    dimensions: '80cm x 80cm',
    createdAt: new Date().toISOString()
  },
  
  // Lutoni Wearables
  {
    id: 'wear-01',
    name: 'Lutoni Signature Tee',
    description: 'Heavyweight cotton T-shirt featuring the white Lutoni organic blossom emblem printed on the back and red logo embroidered on front.',
    price: 25000, // KES 2,500
    priceText: '2,500 KES',
    priceValue: 2500, // Actual price
    imageUrl: '/assets/lutoni_logo.png',
    category: 'Wearables',
    type: 'wearable',
    sizes: ['S', 'M', 'L', 'XL'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'wear-02',
    name: 'Lutoni Oversized Hoodie',
    description: 'Garment-dyed luxury hoodie in charcoal black. Styled with a bold red Lutoni font overlay and ultra-thick lining.',
    price: 4500,
    imageUrl: '/assets/lutoni_logo.png',
    category: 'Wearables',
    type: 'wearable',
    sizes: ['M', 'L', 'XL'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'wear-03',
    name: 'Zebra Knit Sweater',
    description: 'Exclusive knitwear incorporating the signature Art By Oture zebra line pattern in soft jacquard cotton.',
    price: 3800,
    imageUrl: '/assets/artbyoture_logo.png',
    category: 'Wearables',
    type: 'wearable',
    sizes: ['S', 'M', 'L'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'wear-04',
    name: 'Lutoni Street Cargo Pants',
    description: 'Structured cargo garments crafted from heavy twill. Accented with drawstring details and zebra pattern inner linings.',
    price: 4200,
    imageUrl: '/assets/lutoni_logo.png',
    category: 'Wearables',
    type: 'wearable',
    sizes: ['S', 'M', 'L', 'XL'],
    createdAt: new Date().toISOString()
  }
];

// Clean mock items to ensure prices are standardized
initialMockProducts.forEach(p => {
  if (p.id === 'wear-01') {
    p.price = 2500; // Correct initial KES 25,000 to KES 2,500
  }
});

const initialMockOrders = [
  {
    id: 'ord-101',
    customerName: 'Kamau Njoroge',
    customerEmail: 'kamau@gmail.com',
    customerPhone: '0712445566',
    deliveryAddress: 'House 4B, Karen Estate, Nairobi',
    mpesaTransactionCode: 'SDR8839FKK',
    items: [
      { id: 'art-02', name: 'Thorned', price: 38000, quantity: 1, type: 'art' },
      { id: 'wear-01', name: 'Lutoni Signature Tee', price: 2500, quantity: 1, size: 'L', type: 'wearable' }
    ],
    totalAmount: 40500,
    status: 'approved',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-102',
    customerName: 'Amina Mohamed',
    customerEmail: 'amina.m@outlook.com',
    customerPhone: '0722889900',
    deliveryAddress: 'Apt C6, Nyali Heights, Mombasa',
    mpesaTransactionCode: 'QPA0981HSD',
    items: [
      { id: 'wear-02', name: 'Lutoni Oversized Hoodie', price: 4500, quantity: 2, size: 'XL', type: 'wearable' }
    ],
    totalAmount: 9000,
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Firebase Setup Helper
let app = null;
let db = null;
let storage = null;
let isMockMode = true;

const defaultFirebaseConfig = {
  apiKey: "AIzaSyC0843y55nxo4EQ8f7WLUk7_eeQ2M2jx7o",
  authDomain: "artbyoture.firebaseapp.com",
  projectId: "artbyoture",
  storageBucket: "artbyoture.firebasestorage.app",
  messagingSenderId: "630164849235",
  appId: "1:630164849235:web:58e12994ff687545493ca6",
  measurementId: "G-CRMSH027JW"
};

const loadFirebaseConfig = () => {
  const saved = localStorage.getItem('firebase_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved Firebase configuration", e);
    }
  }
  
  // Try environment variables
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'artbyoture',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }
  return defaultFirebaseConfig;
};

const config = loadFirebaseConfig();

if (config && config.apiKey && config.apiKey !== 'YOUR_API_KEY') {
  try {
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    db = getFirestore(app);
    storage = getStorage(app);
    isMockMode = false;
    console.log("Firebase initialized successfully. Running in CLOUD mode.");
  } catch (error) {
    console.error("Firebase initialization failed, falling back to local database:", error);
    isMockMode = true;
  }
} else {
  isMockMode = true;
  console.log("No Firebase config detected. Running in local MOCK database mode.");
}

// Helper to race Firestore getDocs against a timeout to prevent hanging UI on misconfigured Firebase instances
const getDocsWithTimeout = async (collectionRef, timeoutMs = 4000) => {
  return Promise.race([
    getDocs(collectionRef),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Firestore connection timeout")), timeoutMs)
    )
  ]);
};

const setDocWithTimeout = async (docRef, data, timeoutMs = 4000) => {
  return Promise.race([
    setDoc(docRef, data),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Firestore write timeout")), timeoutMs)
    )
  ]);
};

const updateDocWithTimeout = async (docRef, data, timeoutMs = 4000) => {
  return Promise.race([
    updateDoc(docRef, data),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Firestore update timeout")), timeoutMs)
    )
  ]);
};

const deleteDocWithTimeout = async (docRef, timeoutMs = 4000) => {
  return Promise.race([
    deleteDoc(docRef),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Firestore delete timeout")), timeoutMs)
    )
  ]);
};

// LocalStorage helpers for Mock Mode
const getLocalData = (key, initial) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

const setLocalData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Database APIs
export const database = {
  isMock: () => isMockMode,
  
  getFirebaseConfig: () => {
    return loadFirebaseConfig() || defaultFirebaseConfig;
  },
  
  saveFirebaseConfig: (newConfig) => {
    if (!newConfig) {
      localStorage.removeItem('firebase_config');
    } else {
      localStorage.setItem('firebase_config', JSON.stringify(newConfig));
    }
    // Refresh page to trigger re-initialization
    window.location.reload();
  },

  // Products CRUD
  getProducts: async () => {
    if (isMockMode) {
      return getLocalData('mock_products', initialMockProducts);
    } else {
      try {
        const querySnapshot = await getDocsWithTimeout(collection(db, 'products'));
        const productsList = [];
        querySnapshot.forEach((doc) => {
          productsList.push({ id: doc.id, ...doc.data() });
        });
        
        if (productsList.length === 0) {
          // If Firestore is empty, seed it with initial data
          for (const prod of initialMockProducts) {
            await setDocWithTimeout(doc(db, 'products', prod.id), prod);
            productsList.push(prod);
          }
        }
        
        // Merge locally saved/updated mock products
        const localProds = getLocalData('mock_products', initialMockProducts);
        const mergedProds = [...productsList];
        localProds.forEach(localProd => {
          const index = mergedProds.findIndex(p => p.id === localProd.id);
          if (index === -1) {
            mergedProds.push(localProd);
          } else {
            mergedProds[index] = { ...mergedProds[index], ...localProd };
          }
        });
        return mergedProds;
      } catch (e) {
        console.error("Firestore read error, falling back to local mock products:", e);
        return getLocalData('mock_products', initialMockProducts);
      }
    }
  },

  addProduct: async (product) => {
    const id = product.id || 'prod-' + Math.random().toString(36).substr(2, 9);
    const newProduct = { ...product, id, createdAt: new Date().toISOString() };
    
    // Write locally first
    const prods = getLocalData('mock_products', initialMockProducts);
    const index = prods.findIndex(p => p.id === id);
    if (index === -1) {
      prods.unshift(newProduct);
    } else {
      prods[index] = newProduct;
    }
    setLocalData('mock_products', prods);
    
    if (isMockMode) {
      return newProduct;
    } else {
      try {
        await setDocWithTimeout(doc(db, 'products', id), newProduct);
      } catch (e) {
        console.warn("Firestore product add failed, utilizing local fallback:", e);
      }
      return newProduct;
    }
  },

  updateProduct: async (id, updatedFields) => {
    // Write locally first
    const prods = getLocalData('mock_products', initialMockProducts);
    const index = prods.findIndex(p => p.id === id);
    let localUpdated = null;
    if (index > -1) {
      prods[index] = { ...prods[index], ...updatedFields };
      localUpdated = prods[index];
      setLocalData('mock_products', prods);
    }
    
    if (isMockMode) {
      if (!localUpdated) throw new Error("Product not found");
      return localUpdated;
    } else {
      try {
        const docRef = doc(db, 'products', id);
        await updateDocWithTimeout(docRef, updatedFields);
        const updatedSnap = await getDoc(docRef);
        return { id: updatedSnap.id, ...updatedSnap.data() };
      } catch (e) {
        console.warn("Firestore product update failed, utilizing local fallback:", e);
        return localUpdated || { id, ...updatedFields };
      }
    }
  },

  deleteProduct: async (id) => {
    // Delete locally first
    const prods = getLocalData('mock_products', initialMockProducts);
    const filtered = prods.filter(p => p.id !== id);
    setLocalData('mock_products', filtered);
    
    if (isMockMode) {
      return true;
    } else {
      try {
        await deleteDocWithTimeout(doc(db, 'products', id));
      } catch (e) {
        console.warn("Firestore product delete failed, utilizing local fallback:", e);
      }
      return true;
    }
  },

  // Orders CRUD
  getOrders: async () => {
    if (isMockMode) {
      return getLocalData('mock_orders', initialMockOrders).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      try {
        const querySnapshot = await getDocsWithTimeout(collection(db, 'orders'));
        const ordersList = [];
        querySnapshot.forEach((doc) => {
          ordersList.push({ id: doc.id, ...doc.data() });
        });
        
        // Merge locally updated mock orders
        const localOrders = getLocalData('mock_orders', initialMockOrders);
        const mergedOrders = [...ordersList];
        localOrders.forEach(localOrd => {
          const idx = mergedOrders.findIndex(o => o.id === localOrd.id);
          if (idx === -1) {
            mergedOrders.push(localOrd);
          } else {
            mergedOrders[idx] = { ...mergedOrders[idx], ...localOrd };
          }
        });
        return mergedOrders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (e) {
        console.error("Firestore read error, falling back to local mock orders:", e);
        return getLocalData('mock_orders', initialMockOrders).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }
  },

  addOrder: async (order) => {
    const id = 'ord-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newOrder = { ...order, id };
    
    // Save locally first
    const orders = getLocalData('mock_orders', initialMockOrders);
    orders.unshift(newOrder);
    setLocalData('mock_orders', orders);
    
    if (isMockMode) {
      return newOrder;
    } else {
      try {
        await setDocWithTimeout(doc(db, 'orders', id), newOrder);
      } catch (e) {
        console.warn("Firestore order write failed, utilizing local fallback:", e);
      }
      return newOrder;
    }
  },

  updateOrderStatus: async (id, status) => {
    // Update locally first
    const orders = getLocalData('mock_orders', initialMockOrders);
    const index = orders.findIndex(o => o.id === id);
    let localUpdated = null;
    if (index > -1) {
      orders[index].status = status;
      localUpdated = orders[index];
      setLocalData('mock_orders', orders);
    }
    
    if (isMockMode) {
      if (!localUpdated) throw new Error("Order not found");
      return localUpdated;
    } else {
      try {
        const docRef = doc(db, 'orders', id);
        await updateDocWithTimeout(docRef, { status });
        const updatedSnap = await getDoc(docRef);
        return { id: updatedSnap.id, ...updatedSnap.data() };
      } catch (e) {
        console.warn("Firestore order update failed, utilizing local fallback:", e);
        return localUpdated || { id, status };
      }
    }
  },

  // Invoices CRUD
  getInvoices: async () => {
    if (isMockMode) {
      return getLocalData('mock_invoices', []);
    } else {
      try {
        const querySnapshot = await getDocsWithTimeout(collection(db, 'invoices'));
        const invoicesList = [];
        querySnapshot.forEach((doc) => {
          invoicesList.push({ id: doc.id, ...doc.data() });
        });
        
        // Merge locally saved/mock invoices (e.g., if writing to Firestore failed or saved offline earlier)
        const localInvoices = getLocalData('mock_invoices', []);
        const mergedInvoices = [...invoicesList];
        localInvoices.forEach(localInv => {
          if (!mergedInvoices.some(inv => inv.id === localInv.id)) {
            mergedInvoices.push(localInv);
          }
        });
        
        return mergedInvoices.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (e) {
        console.error("Firestore read error, falling back to local mock invoices:", e);
        return getLocalData('mock_invoices', []);
      }
    }
  },

  addInvoice: async (invoice) => {
    const id = invoice.id || 'INV-' + Math.floor(100000 + Math.random() * 900000) + '-' + (invoice.brand === 'lutoni' ? 'LUT' : invoice.brand === 'oture' ? 'ABO' : 'ALL');
    const newInvoice = { ...invoice, id, createdAt: invoice.createdAt || new Date().toISOString() };
    
    if (isMockMode) {
      const invoices = getLocalData('mock_invoices', []);
      invoices.unshift(newInvoice);
      setLocalData('mock_invoices', invoices);
      return newInvoice;
    } else {
      await setDocWithTimeout(doc(db, 'invoices', id), newInvoice);
      return newInvoice;
    }
  },

  deleteInvoice: async (id) => {
    if (isMockMode) {
      const invoices = getLocalData('mock_invoices', []);
      const filtered = invoices.filter(inv => inv.id !== id);
      setLocalData('mock_invoices', filtered);
      return true;
    } else {
      try {
        await deleteDocWithTimeout(doc(db, 'invoices', id));
      } catch (e) {
        console.error("Failed to delete from Firestore:", e);
      }
      const invoices = getLocalData('mock_invoices', []);
      const filtered = invoices.filter(inv => inv.id !== id);
      setLocalData('mock_invoices', filtered);
      return true;
    }
  },

  // Media Items CRUD
  getMediaItems: async () => {
    const defaultMedia = [
      { id: 'm-1', name: 'Zebra Lines Painting', url: '/assets/IMG_1333.jpg', type: 'image', size: '2.5 MB', createdAt: new Date().toISOString() },
      { id: 'm-2', name: 'Process Video', url: '/videos/Progress_E2_80_A6_F0_9F_92_9A_20_23acrylicpainting_20_23explore.mp4', type: 'video', size: '5.5 MB', createdAt: new Date().toISOString() }
    ];
    if (isMockMode) {
      return getLocalData('mock_media_items', defaultMedia);
    } else {
      try {
        const querySnapshot = await getDocsWithTimeout(collection(db, 'media_items'));
        const mediaList = [];
        querySnapshot.forEach((doc) => {
          mediaList.push({ id: doc.id, ...doc.data() });
        });
        
        // Merge local media items
        const localMedia = getLocalData('mock_media_items', defaultMedia);
        const mergedMedia = [...mediaList];
        localMedia.forEach(lm => {
          if (!mergedMedia.some(m => m.id === lm.id)) {
            mergedMedia.push(lm);
          }
        });
        return mergedMedia.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (e) {
        console.error("Firestore read error for media:", e);
        return getLocalData('mock_media_items', defaultMedia);
      }
    }
  },

  addMediaItem: async (mediaItem) => {
    const id = 'media-' + Math.random().toString(36).substr(2, 9);
    const newMedia = { ...mediaItem, id, createdAt: new Date().toISOString() };
    
    // Save locally first
    const media = getLocalData('mock_media_items', []);
    media.unshift(newMedia);
    setLocalData('mock_media_items', media);
    
    if (isMockMode) {
      return newMedia;
    } else {
      try {
        await setDocWithTimeout(doc(db, 'media_items', id), newMedia);
      } catch (e) {
        console.warn("Firestore media write failed, utilizing local fallback:", e);
      }
      return newMedia;
    }
  },

  deleteMediaItem: async (id, storagePath) => {
    // Delete locally first
    const media = getLocalData('mock_media_items', []);
    const filtered = media.filter(m => m.id !== id);
    setLocalData('mock_media_items', filtered);
    
    if (isMockMode) {
      return true;
    } else {
      try {
        await deleteDocWithTimeout(doc(db, 'media_items', id));
      } catch (e) {
        console.warn("Firestore media delete failed, utilizing local fallback:", e);
      }
      if (storagePath) {
        try {
          const storageRef = ref(storage, storagePath);
          await deleteObject(storageRef);
        } catch (e) {
          console.error("Could not delete from storage bucket:", e);
        }
      }
      return true;
    }
  },

  // Media File Uploading
  uploadMediaFile: async (file, pathName) => {
    if (isMockMode) {
      return new Promise((resolve, reject) => {
        if (file.size < 1.5 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        } else {
          const isVideo = file.type.startsWith('video/');
          resolve(isVideo ? `/videos/${file.name}` : `/assets/${file.name}`);
        }
      });
    } else {
      try {
        const storagePath = pathName || `media/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        return { downloadUrl, storagePath };
      } catch (e) {
        console.warn("Storage upload failed, falling back to local FileReader URL:", e);
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve({ downloadUrl: reader.result, storagePath: null });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
    }
  }
};
