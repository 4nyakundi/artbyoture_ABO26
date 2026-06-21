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
            await setDoc(doc(db, 'products', prod.id), prod);
            productsList.push(prod);
          }
        }
        return productsList;
      } catch (e) {
        console.error("Firestore read error, falling back to local mock products:", e);
        return getLocalData('mock_products', initialMockProducts);
      }
    }
  },

  addProduct: async (product) => {
    const id = product.id || 'prod-' + Math.random().toString(36).substr(2, 9);
    const newProduct = { ...product, id, createdAt: new Date().toISOString() };
    
    if (isMockMode) {
      const prods = getLocalData('mock_products', initialMockProducts);
      prods.unshift(newProduct);
      setLocalData('mock_products', prods);
      return newProduct;
    } else {
      await setDoc(doc(db, 'products', id), newProduct);
      return newProduct;
    }
  },

  updateProduct: async (id, updatedFields) => {
    if (isMockMode) {
      const prods = getLocalData('mock_products', initialMockProducts);
      const index = prods.findIndex(p => p.id === id);
      if (index > -1) {
        prods[index] = { ...prods[index], ...updatedFields };
        setLocalData('mock_products', prods);
        return prods[index];
      }
      throw new Error("Product not found");
    } else {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, updatedFields);
      const updatedSnap = await getDoc(docRef);
      return { id: updatedSnap.id, ...updatedSnap.data() };
    }
  },

  deleteProduct: async (id) => {
    if (isMockMode) {
      const prods = getLocalData('mock_products', initialMockProducts);
      const filtered = prods.filter(p => p.id !== id);
      setLocalData('mock_products', filtered);
      return true;
    } else {
      await deleteDoc(doc(db, 'products', id));
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
        return ordersList.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (e) {
        console.error("Firestore read error, falling back to local mock orders:", e);
        return getLocalData('mock_orders', initialMockOrders).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }
  },

  addOrder: async (order) => {
    const id = 'ord-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newOrder = { ...order, id };
    
    if (isMockMode) {
      const orders = getLocalData('mock_orders', initialMockOrders);
      orders.unshift(newOrder);
      setLocalData('mock_orders', orders);
      return newOrder;
    } else {
      await setDoc(doc(db, 'orders', id), newOrder);
      return newOrder;
    }
  },

  updateOrderStatus: async (id, status) => {
    if (isMockMode) {
      const orders = getLocalData('mock_orders', initialMockOrders);
      const index = orders.findIndex(o => o.id === id);
      if (index > -1) {
        orders[index].status = status;
        setLocalData('mock_orders', orders);
        return orders[index];
      }
      throw new Error("Order not found");
    } else {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { status });
      const updatedSnap = await getDoc(docRef);
      return { id: updatedSnap.id, ...updatedSnap.data() };
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
        return invoicesList.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
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
      await setDoc(doc(db, 'invoices', id), newInvoice);
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
      await deleteDoc(doc(db, 'invoices', id));
      return true;
    }
  },

  // Media Items CRUD
  getMediaItems: async () => {
    if (isMockMode) {
      return getLocalData('mock_media_items', [
        { id: 'm-1', name: 'Zebra Lines Painting', url: '/assets/IMG_1333.jpg', type: 'image', size: '2.5 MB', createdAt: new Date().toISOString() },
        { id: 'm-2', name: 'Process Video', url: '/videos/Progress_E2_80_A6_F0_9F_92_9A_20_23acrylicpainting_20_23explore.mp4', type: 'video', size: '5.5 MB', createdAt: new Date().toISOString() }
      ]);
    } else {
      try {
        const querySnapshot = await getDocsWithTimeout(collection(db, 'media_items'));
        const mediaList = [];
        querySnapshot.forEach((doc) => {
          mediaList.push({ id: doc.id, ...doc.data() });
        });
        return mediaList.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (e) {
        console.error("Firestore read error for media:", e);
        return getLocalData('mock_media_items', []);
      }
    }
  },

  addMediaItem: async (mediaItem) => {
    const id = 'media-' + Math.random().toString(36).substr(2, 9);
    const newMedia = { ...mediaItem, id, createdAt: new Date().toISOString() };
    
    if (isMockMode) {
      const media = getLocalData('mock_media_items', []);
      media.unshift(newMedia);
      setLocalData('mock_media_items', media);
      return newMedia;
    } else {
      await setDoc(doc(db, 'media_items', id), newMedia);
      return newMedia;
    }
  },

  deleteMediaItem: async (id, storagePath) => {
    if (isMockMode) {
      const media = getLocalData('mock_media_items', []);
      const filtered = media.filter(m => m.id !== id);
      setLocalData('mock_media_items', filtered);
      return true;
    } else {
      await deleteDoc(doc(db, 'media_items', id));
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
      const storagePath = pathName || `media/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      return { downloadUrl, storagePath };
    }
  }
};
