import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, setDoc, query, orderBy, deleteDoc } from 'firebase/firestore';

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
let isMockMode = true;

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
  return null;
};

const config = loadFirebaseConfig();

if (config && config.apiKey && config.apiKey !== 'YOUR_API_KEY') {
  try {
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    db = getFirestore(app);
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
    return loadFirebaseConfig() || {
      apiKey: '',
      authDomain: '',
      projectId: 'artbyoture',
      storageBucket: 'artbyoture.appspot.com',
      messagingSenderId: '',
      appId: ''
    };
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
        const querySnapshot = await getDocs(collection(db, 'products'));
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
        const querySnapshot = await getDocs(collection(db, 'orders'));
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
  }
};
