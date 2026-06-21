import React, { useState, useEffect, useRef } from 'react';
import { database } from '../services/firebase';
import Invoice from '../components/Invoice';
import { 
  KeyRound, 
  RefreshCw, 
  Plus, 
  Edit2, 
  Trash2, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Clock, 
  X,
  Database,
  Upload,
  Copy,
  PlusCircle,
  Trash,
  ExternalLink
} from 'lucide-react';
import gsap from 'gsap';
import './Admin.css';

// SVG Line Chart Component for Sales Trends
const SalesTrendChart = ({ approvedOrders, formatPrice }) => {
  const [tooltip, setTooltip] = useState(null);

  if (approvedOrders.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        No sales data available.
      </div>
    );
  }

  // Sort approved orders oldest to newest
  const sortedOrders = [...approvedOrders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  // Calculate cumulative revenue points
  let currentTotal = 0;
  const dataPoints = sortedOrders.map((order) => {
    currentTotal += order.totalAmount;
    return {
      date: new Date(order.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
      amount: order.totalAmount,
      cumulative: currentTotal,
      ref: order.mpesaTransactionCode,
      id: order.id
    };
  });

  // SVG Dimensions
  const width = 500;
  const height = 200;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...dataPoints.map(p => p.cumulative)) * 1.1 || 1000;
  
  const getX = (idx) => {
    if (dataPoints.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (idx / (dataPoints.length - 1)) * chartWidth;
  };

  const getY = (val) => {
    return height - paddingBottom - (val / maxVal) * chartHeight;
  };

  // Draw Path
  let pathD = '';
  dataPoints.forEach((pt, idx) => {
    const x = getX(idx);
    const y = getY(pt.cumulative);
    if (idx === 0) {
      pathD = `M ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
    }
  });

  return (
    <div className="chart-svg-container">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingTop + ratio * chartHeight;
          const val = maxVal * (1 - ratio);
          return (
            <g key={i}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} className="chart-grid-line" />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="chart-axis-text">
                {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Chart Line Path */}
        {dataPoints.length > 0 && (
          <path d={pathD} className="chart-line-path" />
        )}

        {/* Data points (circles) */}
        {dataPoints.map((pt, idx) => {
          const x = getX(idx);
          const y = getY(pt.cumulative);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r={4.5}
              className="chart-dot"
              onMouseEnter={(e) => {
                const rect = e.target.getBoundingClientRect();
                const containerRect = e.target.parentElement.parentElement.getBoundingClientRect();
                setTooltip({
                  x: rect.left - containerRect.left + rect.width / 2,
                  y: rect.top - containerRect.top,
                  content: `${pt.date} • Cum: ${formatPrice(pt.cumulative)} (+${formatPrice(pt.amount)})`
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          );
        })}

        {/* Labels */}
        {dataPoints.map((pt, idx) => {
          if (idx === 0 || idx === dataPoints.length - 1 || (dataPoints.length > 2 && idx === Math.floor(dataPoints.length / 2))) {
            const x = getX(idx);
            return (
              <text key={idx} x={x} y={height - paddingBottom + 18} textAnchor="middle" className="chart-axis-text">
                {pt.date}
              </text>
            );
          }
          return null;
        })}
      </svg>

      {tooltip && (
        <div 
          className="chart-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Database States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms & Editing States
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedSavedInvoice, setSelectedSavedInvoice] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [firebaseConfigText, setFirebaseConfigText] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  
  // Selected Wearable Sizes (Chips UI)
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Search & Filter States
  const [bookkeepingSearch, setBookkeepingSearch] = useState('');
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersStatusFilter, setOrdersStatusFilter] = useState('all');
  const [productsSearch, setProductsSearch] = useState('');
  const [searchInvoiceQuery, setSearchInvoiceQuery] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'Paintings',
    type: 'art', // 'art' or 'wearable'
    medium: '', // for art
    dimensions: '', // for art
    year: '2026', // for art
    status: 'available' // 'available' or 'sold'
  });

  const [newInvoice, setNewInvoice] = useState({
    id: '',
    brand: 'oture', // 'oture', 'lutoni', 'both'
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    status: 'paid', // 'paid', 'pending'
    items: [{ name: '', type: 'art', size: '', price: '', quantity: 1 }],
    taxPercent: 0,
    shipping: 0
  });

  const loginFormRef = useRef(null);
  const dashboardRef = useRef(null);

  // Default credentials
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = '26abo@365';

  const fetchDbData = async () => {
    setLoading(true);
    try {
      const allProds = await database.getProducts();
      const allOrders = await database.getOrders();
      const allInvoices = await database.getInvoices();
      const allMedia = await database.getMediaItems();
      setProducts(allProds);
      setOrders(allOrders);
      setInvoices(allInvoices);
      setMediaItems(allMedia);
    } catch (e) {
      console.error("Error fetching admin database: ", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = sessionStorage.getItem('admin_logged_in');
    if (session === 'true') {
      setIsLoggedIn(true);
    }
    
    const currentConfig = database.getFirebaseConfig();
    setFirebaseConfigText(JSON.stringify(currentConfig, null, 2));
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchDbData();
    }
  }, [isLoggedIn]);

  // GSAP Animations
  useEffect(() => {
    if (!isLoggedIn && loginFormRef.current) {
      gsap.fromTo(loginFormRef.current, 
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }
      );
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      sessionStorage.setItem('admin_logged_in', 'true');
    } else {
      alert('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('admin_logged_in');
  };

  // Order Actions
  const handleUpdateStatus = async (orderId, status) => {
    try {
      await database.updateOrderStatus(orderId, status);
      fetchDbData();
      alert(`Order ${orderId} status set to ${status}.`);
    } catch (e) {
      alert('Failed to update status.');
    }
  };

  // Toggle size chip selection
  const handleSizeToggle = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  // Product Add / Edit / Delete
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      imageUrl: newProduct.imageUrl || '/assets/artbyoture_logo.png',
      category: newProduct.type === 'art' ? newProduct.category : 'Wearables',
      type: newProduct.type,
      sizes: newProduct.type === 'wearable' ? selectedSizes : null,
      medium: newProduct.type === 'art' ? newProduct.medium : null,
      dimensions: newProduct.type === 'art' ? newProduct.dimensions : null,
      year: newProduct.type === 'art' ? newProduct.year : null,
      status: newProduct.type === 'art' ? (newProduct.status || 'available') : 'available'
    };

    try {
      if (editingProduct) {
        await database.updateProduct(editingProduct.id, payload);
        alert('Product updated successfully!');
      } else {
        await database.addProduct(payload);
        alert('Product added successfully!');
      }
      
      handleCancelEdit();
      fetchDbData();
    } catch (e) {
      alert('Failed to save product.');
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      imageUrl: product.imageUrl,
      category: product.category || 'Paintings',
      type: product.type,
      medium: product.medium || '',
      dimensions: product.dimensions || '',
      year: product.year || '2026',
      status: product.status || 'available'
    });
    setSelectedSizes(product.sizes || []);
    
    // Smooth scroll to product form card when editing starts
    window.scrollTo({
      top: document.querySelector('.product-form-card').offsetTop - 120,
      behavior: 'smooth'
    });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setNewProduct({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      category: 'Paintings',
      type: 'art',
      medium: '',
      dimensions: '',
      year: '2026',
      status: 'available'
    });
    setSelectedSizes([]);
  };

  const handleDeleteClick = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await database.deleteProduct(productId);
        fetchDbData();
        alert('Product deleted.');
      } catch (e) {
        alert('Failed to delete product.');
      }
    }
  };

  // Firebase Config panel save
  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(firebaseConfigText);
      if (!parsed.apiKey) {
        alert('Please provide a valid apiKey parameter.');
        return;
      }
      database.saveFirebaseConfig(parsed);
      alert('Firebase credentials saved successfully! The page will now reload.');
    } catch (err) {
      alert('Invalid JSON structure. Please verify formatting (double quotes on all keys and values).');
    }
  };

  const handleClearFirebaseConfig = () => {
    if (window.confirm('Reset database back to local offline mock mode?')) {
      database.saveFirebaseConfig(null);
    }
  };

  // Bookkeeping Export (CSV)
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order ID,Customer Name,Email,Phone,M-Pesa Ref,Items,Total Amount (KES),Status,Created Date\n";
    
    orders.forEach(order => {
      const itemsListStr = order.items.map(i => `${i.name} (${i.quantity}x${i.size ? ' size '+i.size : ''})`).join('; ');
      const row = [
        order.id,
        `"${order.customerName}"`,
        order.customerEmail,
        `'${order.customerPhone}`,
        order.mpesaTransactionCode,
        `"${itemsListStr}"`,
        order.totalAmount,
        order.status,
        order.createdAt
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `artbyoture_bookkeeping_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate random invoice number
  const generateRandomInvoiceNumber = (brand) => {
    const brandSuffix = brand === 'lutoni' ? 'LUT' : brand === 'oture' ? 'ABO' : 'ALL';
    return `INV-${Math.floor(100000 + Math.random() * 900000)}-${brandSuffix}`;
  };

  // Generate initial invoice number when brand changes
  useEffect(() => {
    if (!newInvoice.id) {
      setNewInvoice(prev => ({
        ...prev,
        id: generateRandomInvoiceNumber(prev.brand)
      }));
    }
  }, [newInvoice.brand]);

  // Invoice Handlers
  const handleInvoiceItemChange = (index, field, value) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index][field] = value;
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const handleAddInvoiceItemRow = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { name: '', type: 'art', size: '', price: '', quantity: 1 }]
    });
  };

  const handleRemoveInvoiceItemRow = (index) => {
    if (newInvoice.items.length === 1) return;
    const updatedItems = newInvoice.items.filter((_, idx) => idx !== index);
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const calculateInvoiceSubtotal = () => {
    return newInvoice.items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity) || 1;
      return sum + (price * qty);
    }, 0);
  };

  const calculateInvoiceTotal = () => {
    const subtotal = calculateInvoiceSubtotal();
    const taxPercent = parseFloat(newInvoice.taxPercent) || 0;
    const shipping = parseFloat(newInvoice.shipping) || 0;
    const tax = subtotal * (taxPercent / 100);
    return subtotal + tax + shipping;
  };

  const handleSaveInvoice = async (e) => {
    if (e) e.preventDefault();

    const subtotal = calculateInvoiceSubtotal();
    const taxPercent = parseFloat(newInvoice.taxPercent) || 0;
    const tax = subtotal * (taxPercent / 100);
    const totalAmount = subtotal + tax + (parseFloat(newInvoice.shipping) || 0);

    const payload = {
      id: newInvoice.id,
      brand: newInvoice.brand,
      customerName: newInvoice.customerName,
      customerEmail: newInvoice.customerEmail,
      customerPhone: newInvoice.customerPhone,
      deliveryAddress: newInvoice.deliveryAddress,
      status: newInvoice.status,
      items: newInvoice.items.map(item => ({
        name: item.name,
        type: item.type,
        size: item.size || null,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1
      })),
      subtotal,
      tax,
      shipping: parseFloat(newInvoice.shipping) || 0,
      totalAmount,
      createdAt: new Date().toISOString()
    };

    try {
      await database.addInvoice(payload);
      alert('Invoice saved successfully!');
      fetchDbData();
      setNewInvoice({
        id: generateRandomInvoiceNumber(newInvoice.brand),
        brand: newInvoice.brand,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        deliveryAddress: '',
        status: 'paid',
        items: [{ name: '', type: 'art', size: '', price: '', quantity: 1 }],
        taxPercent: 0,
        shipping: 0
      });
    } catch (e) {
      console.warn("Firestore sync failed, saving locally:", e);
      try {
        const invoicesList = JSON.parse(localStorage.getItem('mock_invoices')) || [];
        invoicesList.unshift(payload);
        localStorage.setItem('mock_invoices', JSON.stringify(invoicesList));
        alert('Invoice saved locally on this browser (Cloud database sync failed).');
        fetchDbData();
        setNewInvoice({
          id: generateRandomInvoiceNumber(newInvoice.brand),
          brand: newInvoice.brand,
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          deliveryAddress: '',
          status: 'paid',
          items: [{ name: '', type: 'art', size: '', price: '', quantity: 1 }],
          taxPercent: 0,
          shipping: 0
        });
      } catch (err) {
        alert('Failed to save invoice completely.');
      }
    }
  };

  const handlePreviewAndPrintInvoice = async () => {
    const subtotal = calculateInvoiceSubtotal();
    const taxPercent = parseFloat(newInvoice.taxPercent) || 0;
    const tax = subtotal * (taxPercent / 100);
    const totalAmount = subtotal + tax + (parseFloat(newInvoice.shipping) || 0);

    const payload = {
      id: newInvoice.id,
      brand: newInvoice.brand,
      customerName: newInvoice.customerName,
      customerEmail: newInvoice.customerEmail,
      customerPhone: newInvoice.customerPhone,
      deliveryAddress: newInvoice.deliveryAddress,
      status: newInvoice.status,
      items: newInvoice.items.map(item => ({
        name: item.name,
        type: item.type,
        size: item.size || null,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1
      })),
      subtotal,
      tax,
      shipping: parseFloat(newInvoice.shipping) || 0,
      totalAmount,
      createdAt: new Date().toISOString()
    };

    try {
      await database.addInvoice(payload);
      fetchDbData();
      setSelectedSavedInvoice(payload);
      setNewInvoice({
        id: generateRandomInvoiceNumber(newInvoice.brand),
        brand: newInvoice.brand,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        deliveryAddress: '',
        status: 'paid',
        items: [{ name: '', type: 'art', size: '', price: '', quantity: 1 }],
        taxPercent: 0,
        shipping: 0
      });
    } catch (e) {
      console.warn("Firestore sync failed, opening preview and saving locally:", e);
      try {
        const invoicesList = JSON.parse(localStorage.getItem('mock_invoices')) || [];
        invoicesList.unshift(payload);
        localStorage.setItem('mock_invoices', JSON.stringify(invoicesList));
        fetchDbData();
        setSelectedSavedInvoice(payload);
        alert('Invoice opened for print preview and saved locally (Cloud sync failed).');
        setNewInvoice({
          id: generateRandomInvoiceNumber(newInvoice.brand),
          brand: newInvoice.brand,
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          deliveryAddress: '',
          status: 'paid',
          items: [{ name: '', type: 'art', size: '', price: '', quantity: 1 }],
          taxPercent: 0,
          shipping: 0
        });
      } catch (err) {
        alert('Failed to save invoice locally, but opening preview.');
        setSelectedSavedInvoice(payload);
      }
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm(`Are you sure you want to delete Invoice ${invoiceId}?`)) {
      try {
        await database.deleteInvoice(invoiceId);
        fetchDbData();
        alert('Invoice deleted.');
      } catch (e) {
        alert('Failed to delete invoice.');
      }
    }
  };

  // Media Handlers
  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      const uploadResult = await database.uploadMediaFile(file);
      
      const downloadUrl = typeof uploadResult === 'string' ? uploadResult : uploadResult.downloadUrl;
      const storagePath = typeof uploadResult === 'object' ? uploadResult.storagePath : null;

      const mediaItem = {
        name: file.name,
        url: downloadUrl,
        type,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        storagePath
      };

      await database.addMediaItem(mediaItem);
      fetchDbData();
      alert('Media uploaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to upload media.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (mediaId, storagePath) => {
    if (window.confirm('Delete this media resource?')) {
      try {
        await database.deleteMediaItem(mediaId, storagePath);
        fetchDbData();
        alert('Media deleted.');
      } catch (e) {
        alert('Failed to delete media.');
      }
    }
  };

  // Art Ledger Matching Calculations
  const getPaintingSaleDetails = (productId) => {
    const matchingOrder = orders.find(
      o => o.status === 'approved' && o.items.some(i => i.id === productId)
    );
    if (matchingOrder) {
      return {
        type: 'online',
        customer: matchingOrder.customerName,
        date: new Date(matchingOrder.createdAt).toLocaleDateString(),
        ref: matchingOrder.mpesaTransactionCode
      };
    }
    return null;
  };

  const getPaintingStatus = (painting) => {
    const onlineSale = getPaintingSaleDetails(painting.id);
    if (onlineSale) return 'sold';
    return painting.status || 'available';
  };

  const handleToggleSoldStatus = async (productId, currentStatus) => {
    const nextStatus = currentStatus === 'sold' ? 'available' : 'sold';
    try {
      await database.updateProduct(productId, { status: nextStatus });
      fetchDbData();
      alert(`Painting status updated to ${nextStatus.toUpperCase()}.`);
    } catch (e) {
      alert('Failed to toggle status.');
    }
  };

  // Metrics & Analytics Calculations
  const approvedOrders = orders.filter(o => o.status === 'approved');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  
  const totalRevenue = approvedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Split Category Revenue Calculations
  let artRev = 0;
  let wearableRev = 0;
  approvedOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.type === 'art') {
        artRev += item.price * item.quantity;
      } else {
        wearableRev += item.price * item.quantity;
      }
    });
  });
  const splitTotal = artRev + wearableRev;
  const artPct = splitTotal > 0 ? (artRev / splitTotal) * 100 : 0;
  const wearablePct = splitTotal > 0 ? (wearableRev / splitTotal) * 100 : 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Art Ledger Matching Calculations
  const paintings = products.filter(p => p.type === 'art');
  const totalPaintingsCount = paintings.length;
  const totalLedgerValue = paintings.reduce((sum, p) => sum + p.price, 0);
  const soldPaintingsCount = paintings.filter(p => getPaintingStatus(p) === 'sold').length;
  const soldRevenue = paintings.filter(p => getPaintingStatus(p) === 'sold').reduce((sum, p) => sum + p.price, 0);
  const remainingValue = totalLedgerValue - soldRevenue;

  // Filtering Logic
  const filteredBookkeeping = orders.filter(o => {
    const q = bookkeepingSearch.toLowerCase();
    const matchesId = o.id.toLowerCase().includes(q);
    const matchesCode = o.mpesaTransactionCode.toLowerCase().includes(q);
    const matchesName = o.customerName.toLowerCase().includes(q);
    const matchesItems = o.items.some(i => i.name.toLowerCase().includes(q));
    return matchesId || matchesCode || matchesName || matchesItems;
  });

  const filteredOrders = orders.filter(o => {
    // Status Filter
    if (ordersStatusFilter !== 'all' && o.status !== ordersStatusFilter) return false;
    
    // Search Query
    const q = ordersSearch.toLowerCase();
    if (!q) return true;
    return (
      o.id.toLowerCase().includes(q) ||
      o.mpesaTransactionCode.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerPhone.includes(q)
    );
  });

  const filteredProducts = products.filter(p => {
    const q = productsSearch.toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  // 1. Render Login Screen
  if (!isLoggedIn) {
    return (
      <div className="admin-page-container container">
        {/* Glowing background circles for visual richness */}
        <div className="admin-ambient-blob admin-blob-1" />
        <div className="admin-ambient-blob admin-blob-2" />
        
        <div className="admin-login-wrapper">
          <div className="admin-login-card glass-panel" ref={loginFormRef}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: 'var(--accent-red)' }}>
              <KeyRound size={44} style={{ opacity: 0.95 }} />
            </div>
            <h2 className="login-title">Studio Access</h2>
            <p className="login-subtitle">Art By Oture & Lutoni Administration Panel</p>
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter Username"
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter Password"
                />
              </div>

              <button type="submit" className="login-btn">Secure Login</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. Render Main Admin Dashboard
  return (
    <div className="admin-page-container" ref={dashboardRef}>
      {/* Background blobs for rich layout depth */}
      <div className="admin-ambient-blob admin-blob-1" />
      <div className="admin-ambient-blob admin-blob-2" />

      {/* Dashboard Top Header */}
      <div className="admin-header-section">
        <div className="admin-title-wrap">
          <h1 className="admin-title">Studio Dashboard</h1>
          <span className="admin-subtitle">Welcome back, Administrator Calvin Oture</span>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>Log Out</button>
      </div>

      {/* Tabs Menu */}
      <div className="admin-tabs-nav">
        <button 
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Bookkeeping & Analytics
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders & Payments ({orders.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Art Ledger & Products
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          Invoice Creator ({invoices.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          Media Manager ({mediaItems.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Cloud Sync Settings
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 20px', opacity: 0.6 }} />
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Refreshing Database...</h3>
        </div>
      ) : (
        <>
          {/* Tab 1: Bookkeeping & Analytics */}
          {activeTab === 'overview' && (
            <div>
              {/* Premium metric display cards */}
              <div className="metrics-row">
                <div className="metric-card approved-sales glass-panel">
                  <div className="metric-card-header">
                    <span className="metric-label">Approved Sales</span>
                    <div className="metric-card-icon"><DollarSign size={18} /></div>
                  </div>
                  <div className="metric-value" style={{ color: '#2ea44f' }}>{formatPrice(totalRevenue)}</div>
                </div>
                
                <div className="metric-card pending-verifications glass-panel">
                  <div className="metric-card-header">
                    <span className="metric-label">Pending Verifications</span>
                    <div className="metric-card-icon"><Clock size={18} /></div>
                  </div>
                  <div className="metric-value" style={{ color: '#ff9500' }}>{formatPrice(pendingRevenue)}</div>
                </div>

                <div className="metric-card total-orders glass-panel">
                  <div className="metric-card-header">
                    <span className="metric-label">Total Transactions</span>
                    <div className="metric-card-icon"><TrendingUp size={18} /></div>
                  </div>
                  <div className="metric-value">{orders.length}</div>
                </div>

                <div className="metric-card registered-items glass-panel">
                  <div className="metric-card-header">
                    <span className="metric-label">Registered Items</span>
                    <div className="metric-card-icon"><Layers size={18} /></div>
                  </div>
                  <div className="metric-value">{products.length}</div>
                </div>
              </div>

              {/* Analytics Section Grid (Charts) */}
              <div className="analytics-section-grid">
                <div className="analytics-card glass-panel">
                  <div className="analytics-title-wrap">
                    <h3 className="analytics-title">Revenue Progress Trend</h3>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Approved Sales (Cumulative)</span>
                  </div>
                  <SalesTrendChart approvedOrders={approvedOrders} formatPrice={formatPrice} />
                </div>

                <div className="analytics-card glass-panel">
                  <div className="analytics-title-wrap">
                    <h3 className="analytics-title">Revenue Category Split</h3>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Canvas vs Wearables</span>
                  </div>
                  <div className="revenue-split-list">
                    <div className="split-category-row">
                      <div className="split-meta">
                        <span className="split-category-name">Canvas Art</span>
                        <span className="split-category-value">{formatPrice(artRev)} ({artPct.toFixed(1)}%)</span>
                      </div>
                      <div className="split-bar-bg">
                        <div className="split-bar-fill art" style={{ width: `${artPct}%` }} />
                      </div>
                    </div>

                    <div className="split-category-row">
                      <div className="split-meta">
                        <span className="split-category-name">Lutoni Wearables</span>
                        <span className="split-category-value">{formatPrice(wearableRev)} ({wearablePct.toFixed(1)}%)</span>
                      </div>
                      <div className="split-bar-bg">
                        <div className="split-bar-fill wearable" style={{ width: `${wearablePct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accounts spreadsheet view */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h3 className="form-title" style={{ margin: 0 }}>Spreadsheet Bookkeeping</h3>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="search-input-wrap" style={{ maxWidth: '280px' }}>
                    <Search className="search-icon-svg" size={16} />
                    <input 
                      type="text" 
                      className="search-input-field" 
                      placeholder="Search accounts..." 
                      value={bookkeepingSearch}
                      onChange={(e) => setBookkeepingSearch(e.target.value)}
                    />
                  </div>

                  <button 
                    className="invoice-action-btn print"
                    onClick={handleExportCSV}
                    disabled={orders.length === 0}
                    style={{ borderRadius: '20px', fontSize: '0.75rem', padding: '10px 18px', display: 'flex', gap: '6px', alignItems: 'center' }}
                  >
                    <FileSpreadsheet size={15} />
                    <span>Export Bookkeeping (CSV)</span>
                  </button>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Ref Code</th>
                      <th>Customer Name</th>
                      <th>Purchased Items</th>
                      <th>Amount (KES)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookkeeping.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>No transactions found.</td>
                      </tr>
                    ) : (
                      filteredBookkeeping.map((o) => (
                        <tr key={o.id}>
                          <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td style={{ fontWeight: '800', letterSpacing: '0.5px' }}>{o.mpesaTransactionCode}</td>
                          <td>{o.customerName}</td>
                          <td style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                            {o.items.map(i => `${i.name} (x${i.quantity}${i.size ? ' size '+i.size : ''})`).join(', ')}
                          </td>
                          <td style={{ fontWeight: '800' }}>{formatPrice(o.totalAmount)}</td>
                          <td>
                            <span className={`status-badge ${o.status}`}>
                              <span className="status-badge-dot" />
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Orders & Payments */}
          {activeTab === 'orders' && (
            <div>
              {/* Search & Status Filters */}
              <div className="filters-bar">
                <div className="search-input-wrap">
                  <Search className="search-icon-svg" size={18} />
                  <input 
                    type="text" 
                    className="search-input-field" 
                    placeholder="Search by name, transaction code, phone..."
                    value={ordersSearch}
                    onChange={(e) => setOrdersSearch(e.target.value)}
                  />
                </div>

                <div className="status-tabs-filter">
                  {['all', 'pending', 'approved', 'rejected'].map((status) => (
                    <button
                      key={status}
                      className={`status-filter-btn ${ordersStatusFilter === status ? 'active' : ''}`}
                      onClick={() => setOrdersStatusFilter(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer Details</th>
                      <th>M-Pesa Code</th>
                      <th>Purchased Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '50px 0' }}>No matching order requests found.</td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td style={{ fontSize: '0.8rem' }}>
                            <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                            <br />
                            <span style={{ opacity: 0.6 }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td>
                            <strong>{order.customerName}</strong><br />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: 'block', marginTop: '3px' }}>
                              Ph: {order.customerPhone}<br />
                              Email: {order.customerEmail}<br />
                              Addr: {order.deliveryAddress}
                            </span>
                          </td>
                          <td style={{ fontWeight: '800', letterSpacing: '1px', color: 'var(--text-primary)' }}>
                            {order.mpesaTransactionCode}
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>
                            {order.items.map((item, idx) => (
                              <div key={idx} style={{ marginBottom: '2px' }}>
                                • {item.name} <span style={{ fontWeight: '700' }}>(x{item.quantity})</span> {item.size && `[Size ${item.size}]`}
                              </div>
                            ))}
                          </td>
                          <td style={{ fontWeight: '800' }}>{formatPrice(order.totalAmount)}</td>
                          <td>
                            <span className={`status-badge ${order.status}`}>
                              <span className="status-badge-dot" />
                              {order.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              {order.status === 'pending' && (
                                <>
                                  <button 
                                    className="action-text-btn approve"
                                    onClick={() => handleUpdateStatus(order.id, 'approved')}
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    className="action-text-btn reject"
                                    onClick={() => handleUpdateStatus(order.id, 'rejected')}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              
                              {order.status === 'approved' && (
                                <button 
                                  className="action-text-btn invoice"
                                  onClick={() => setSelectedInvoice(order)}
                                >
                                  <FileText size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                  Invoice
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Products Database */}
          {activeTab === 'products' && (
            <div>
              {/* Product search box */}
              <div className="filters-bar" style={{ justifyContent: 'flex-start' }}>
                <div className="search-input-wrap" style={{ maxWidth: '350px' }}>
                  <Search className="search-icon-svg" size={18} />
                  <input 
                    type="text" 
                    className="search-input-field" 
                    placeholder="Search product items by name or category..."
                    value={productsSearch}
                    onChange={(e) => setProductsSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-product-management-layout">
                {/* Product Form Card */}
                <div className={`product-form-card glass-panel ${editingProduct ? 'editing-active' : ''}`}>
                  {editingProduct && (
                    <div className="editing-mode-hud">
                      <span>Editing mode active</span>
                      <button className="editing-mode-hud-cancel" onClick={handleCancelEdit}>Cancel</button>
                    </div>
                  )}

                  <h3 className="form-title">
                    {editingProduct ? 'Update Product Details' : 'Register New Artwork / Wearable'}
                  </h3>
                  
                  {/* Live Image Preview */}
                  <div className="form-image-preview-box">
                    {newProduct.imageUrl ? (
                      <img src={newProduct.imageUrl} alt="Live Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <span>Live Image Preview</span>
                    )}
                  </div>

                  <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div className="form-group">
                      <label>Item Category Type</label>
                      <select 
                        className="form-input"
                        value={newProduct.type}
                        onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                      >
                        <option value="art">Art Canvas (Paintings)</option>
                        <option value="wearable">Lutoni Wearable (Garments)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Product Title Name</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                        placeholder="e.g. Wave Emblem Tee"
                      />
                    </div>

                    <div className="form-group">
                      <label>Base Price (KES)</label>
                      <input 
                        type="number" 
                        className="form-input"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                        placeholder="e.g. 3500"
                      />
                    </div>

                    <div className="form-group">
                      <label>Detailed Description</label>
                      <textarea 
                        className="form-input"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        required
                        rows="3"
                        placeholder="Materials, aesthetic motifs, visual elements..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Image Resource Link (relative or absolute url)</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={newProduct.imageUrl}
                        onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                        placeholder="e.g. /assets/IMG_1333.jpg or hosted image url"
                      />
                    </div>

                    {newProduct.type === 'art' ? (
                      <>
                        <div className="form-group-row">
                          <div className="form-group">
                            <label>Medium / Materials</label>
                            <input 
                              type="text" 
                              className="form-input"
                              value={newProduct.medium}
                              onChange={(e) => setNewProduct({ ...newProduct, medium: e.target.value })}
                              placeholder="e.g. Acrylic on Canvas"
                              required={newProduct.type === 'art'}
                            />
                          </div>
                          <div className="form-group">
                            <label>Year Created</label>
                            <input 
                              type="text" 
                              className="form-input"
                              value={newProduct.year}
                              onChange={(e) => setNewProduct({ ...newProduct, year: e.target.value })}
                              placeholder="e.g. 2026"
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Dimensions</label>
                          <input 
                            type="text" 
                            className="form-input"
                            value={newProduct.dimensions}
                            onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })}
                            placeholder="e.g. 100cm x 120cm"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="form-group">
                        <label>Available Sizes</label>
                        <div className="size-chips-wrapper">
                          {['S', 'M', 'L', 'XL'].map((size) => (
                            <button
                              type="button"
                              key={size}
                              className={`size-chip ${selectedSizes.includes(size) ? 'selected' : ''}`}
                              onClick={() => handleSizeToggle(size)}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      {editingProduct && (
                        <button 
                          type="button" 
                          className="action-text-btn"
                          onClick={handleCancelEdit}
                          style={{ flex: 1, borderRadius: '8px', padding: '12px' }}
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        type="submit" 
                        className="action-text-btn invoice"
                        style={{ flex: 2, borderRadius: '8px', padding: '12px' }}
                      >
                        {editingProduct ? 'Save Product' : 'Add Item'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Products Table list */}
                <div className="admin-table-container" style={{ alignSelf: 'start' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Product Details</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>No matching products registered.</td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <img 
                                src={p.imageUrl} 
                                alt={p.name} 
                                style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--glass-border)' }} 
                              />
                            </td>
                            <td>
                              <strong>{p.name}</strong><br />
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {p.id}</span>
                            </td>
                            <td style={{ textTransform: 'capitalize' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{p.type}</span>
                            </td>
                            <td style={{ fontWeight: '800' }}>{formatPrice(p.price)}</td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button className="action-icon-btn" onClick={() => handleEditClick(p)} title="Edit product">
                                  <Edit2 size={13} />
                                </button>
                                <button className="action-icon-btn" onClick={() => handleDeleteClick(p.id)} title="Delete product">
                                  <Trash2 size={13} style={{ color: 'var(--accent-red)' }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Art Ledger Bookkeeping Panel */}
              <h3 className="form-title" style={{ marginTop: '40px', marginBottom: '20px' }}>Art Paintings Ledger</h3>
              
              {/* Art Ledger Accounting Banner */}
              <div className="ledger-metrics-banner">
                <div className="ledger-metric-item">
                  <span className="ledger-metric-label">Total Art Cataloged</span>
                  <div className="ledger-metric-val">{totalPaintingsCount} Paintings</div>
                </div>
                <div className="ledger-metric-item">
                  <span className="ledger-metric-label">Ledger Book Value</span>
                  <div className="ledger-metric-val">{formatPrice(totalLedgerValue)}</div>
                </div>
                <div className="ledger-metric-item">
                  <span className="ledger-metric-label">Sold Paintings</span>
                  <div className="ledger-metric-val" style={{ color: '#ff9500' }}>{soldPaintingsCount} Sold</div>
                </div>
                <div className="ledger-metric-item">
                  <span className="ledger-metric-label" style={{ fontWeight: '700' }}>Ledger Revenue</span>
                  <div className="ledger-metric-val" style={{ color: '#2ea44f' }}>{formatPrice(soldRevenue)}</div>
                </div>
                <div className="ledger-metric-item">
                  <span className="ledger-metric-label">Available Inventory</span>
                  <div className="ledger-metric-val">{formatPrice(remainingValue)}</div>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Preview</th>
                      <th>Painting Name</th>
                      <th>Medium / Size</th>
                      <th>Ledger Value</th>
                      <th>Status Toggle</th>
                      <th>Sales Booking Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paintings.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>No paintings cataloged in database.</td>
                      </tr>
                    ) : (
                      paintings.map((art) => {
                        const status = getPaintingStatus(art);
                        const onlineSale = getPaintingSaleDetails(art.id);
                        return (
                          <tr key={art.id}>
                            <td>
                              <img 
                                src={art.imageUrl} 
                                alt={art.name} 
                                style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--glass-border)' }} 
                              />
                            </td>
                            <td>
                              <strong>{art.name}</strong><br />
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {art.id}</span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.85rem' }}>{art.medium}</span><br />
                              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{art.dimensions || '100cm x 100cm'}</span>
                            </td>
                            <td style={{ fontWeight: '800' }}>{formatPrice(art.price)}</td>
                            <td>
                              <button 
                                className={`action-text-btn ${status === 'sold' ? 'reject' : 'approve'}`}
                                onClick={() => handleToggleSoldStatus(art.id, status)}
                                disabled={!!onlineSale} // Disable if sold online through orders
                                title={onlineSale ? "Cannot toggle: sold online via M-Pesa order" : "Toggle Availability"}
                                style={{ fontSize: '0.7rem', padding: '6px 12px', minWidth: '100px', textAlign: 'center', borderRadius: '15px' }}
                              >
                                {status === 'sold' ? 'SOLD' : 'AVAILABLE'}
                              </button>
                            </td>
                            <td style={{ fontSize: '0.8rem' }}>
                              {onlineSale ? (
                                <div style={{ color: '#2ea44f' }}>
                                  <strong>Online Order Approved</strong><br />
                                  <span>To: {onlineSale.customer} on {onlineSale.date}</span><br />
                                  <span>M-Pesa Ref: <strong>{onlineSale.ref}</strong></span>
                                </div>
                              ) : status === 'sold' ? (
                                <div style={{ color: '#ff9500' }}>
                                  <strong>Manual Sale Recorded</strong><br />
                                  <span>Marked sold manually (Offline Sale)</span>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-secondary)' }}>— No bookings recorded</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Invoice Creator */}
          {activeTab === 'invoices' && (
            <div className="invoice-creator-layout">
              {/* Form Side */}
              <div className="product-form-card glass-panel" style={{ padding: '30px' }}>
                <h3 className="form-title">Invoice Creator Form</h3>
                
                <form onSubmit={handleSaveInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="form-group-row" style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Invoice Number</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={newInvoice.id} 
                          readOnly
                          style={{ background: 'rgba(0,0,0,0.02)', fontWeight: 'bold' }}
                        />
                        <button 
                          type="button" 
                          className="action-icon-btn" 
                          onClick={() => setNewInvoice({ ...newInvoice, id: generateRandomInvoiceNumber(newInvoice.brand) })}
                          title="Generate New Number"
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Branding Header Logo</label>
                      <select 
                        className="form-input" 
                        value={newInvoice.brand} 
                        onChange={(e) => setNewInvoice({ ...newInvoice, brand: e.target.value })}
                      >
                        <option value="oture">Art By Oture Logo</option>
                        <option value="lutoni">Lutoni Wear Logo</option>
                        <option value="both">Both Brand Logos</option>
                      </select>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '5px', margin: '15px 0 5px 0' }}>Customer Contact</h4>
                  
                  <div className="form-group">
                    <label>Client Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newInvoice.customerName}
                      onChange={(e) => setNewInvoice({ ...newInvoice, customerName: e.target.value })}
                      required
                      placeholder="e.g. Kelvin Njoroge"
                    />
                  </div>

                  <div className="form-group-row" style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={newInvoice.customerEmail}
                        onChange={(e) => setNewInvoice({ ...newInvoice, customerEmail: e.target.value })}
                        placeholder="client@gmail.com"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Phone Number</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={newInvoice.customerPhone}
                        onChange={(e) => setNewInvoice({ ...newInvoice, customerPhone: e.target.value })}
                        placeholder="e.g. 0722000111"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Shipping / Delivery Address</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newInvoice.deliveryAddress}
                      onChange={(e) => setNewInvoice({ ...newInvoice, deliveryAddress: e.target.value })}
                      placeholder="e.g. Karen, Nairobi"
                    />
                  </div>

                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '5px', margin: '20px 0 10px 0' }}>Itemized Rows</h4>
                  
                  <div>
                    {newInvoice.items.map((item, index) => (
                      <div key={index} className="invoice-item-row">
                        <div style={{ gridColumn: 'span 2' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={item.name} 
                            onChange={(e) => handleInvoiceItemChange(index, 'name', e.target.value)}
                            required
                            placeholder="Item Title"
                          />
                        </div>
                        <div>
                          <select 
                            className="form-input"
                            value={item.type}
                            onChange={(e) => handleInvoiceItemChange(index, 'type', e.target.value)}
                          >
                            <option value="art">Art</option>
                            <option value="wearable">Wearable</option>
                          </select>
                        </div>
                        <div>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={item.size} 
                            onChange={(e) => handleInvoiceItemChange(index, 'size', e.target.value)}
                            placeholder="Size"
                          />
                        </div>
                        <div>
                          <input 
                            type="number" 
                            className="form-input" 
                            value={item.price} 
                            onChange={(e) => handleInvoiceItemChange(index, 'price', e.target.value)}
                            required
                            placeholder="Price"
                          />
                        </div>
                        <div>
                          <input 
                            type="number" 
                            className="form-input" 
                            value={item.quantity} 
                            onChange={(e) => handleInvoiceItemChange(index, 'quantity', e.target.value)}
                            required
                            min="1"
                            placeholder="Qty"
                          />
                        </div>
                        <div>
                          <button 
                            type="button" 
                            className="remove-row-btn"
                            onClick={() => handleRemoveInvoiceItemRow(index)}
                            disabled={newInvoice.items.length === 1}
                            title="Remove row"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button type="button" className="add-row-btn" onClick={handleAddInvoiceItemRow}>
                      <PlusCircle size={14} />
                      <span>Add Item Line</span>
                    </button>
                  </div>

                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '5px', margin: '20px 0 5px 0' }}>Tax & Shipping Calculations</h4>
                  <div className="form-group-row" style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Tax Percentage (%)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={newInvoice.taxPercent}
                        onChange={(e) => setNewInvoice({ ...newInvoice, taxPercent: parseFloat(e.target.value) || 0 })}
                        min="0"
                        placeholder="e.g. 16 for VAT"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Shipping / Freight (KES)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={newInvoice.shipping}
                        onChange={(e) => setNewInvoice({ ...newInvoice, shipping: parseFloat(e.target.value) || 0 })}
                        min="0"
                        placeholder="e.g. 500"
                      />
                    </div>
                  </div>

                  <div className="invoice-calculations-card">
                    <div className="calc-row">
                      <span>Subtotal:</span>
                      <strong>{formatPrice(calculateInvoiceSubtotal())}</strong>
                    </div>
                    <div className="calc-row">
                      <span>Tax ({newInvoice.taxPercent}%):</span>
                      <strong>{formatPrice(calculateInvoiceSubtotal() * (newInvoice.taxPercent / 100))}</strong>
                    </div>
                    <div className="calc-row">
                      <span>Shipping Fee:</span>
                      <strong>{formatPrice(newInvoice.shipping)}</strong>
                    </div>
                    <div className="calc-row total">
                      <span>Grand Total:</span>
                      <strong>{formatPrice(calculateInvoiceTotal())}</strong>
                    </div>
                  </div>

                  <div className="checkout-nav-buttons" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      className="checkout-btn secondary" 
                      onClick={handlePreviewAndPrintInvoice}
                      disabled={!newInvoice.customerName || newInvoice.items.some(i => !i.name || !i.price)}
                    >
                      Save & Print PDF
                    </button>
                    <button 
                      type="submit" 
                      className="checkout-btn primary"
                      disabled={!newInvoice.customerName || newInvoice.items.some(i => !i.name || !i.price)}
                    >
                      Save Invoice
                    </button>
                  </div>
                </form>
              </div>

              {/* Leads Board Side */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 className="form-title" style={{ margin: 0 }}>Invoices Leads Board</h3>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Search by client or invoice number..."
                    value={searchInvoiceQuery}
                    onChange={(e) => setSearchInvoiceQuery(e.target.value)}
                    style={{ maxWidth: '250px', padding: '8px 12px', fontSize: '0.82rem', marginBottom: 0 }}
                  />
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Client Details</th>
                        <th>Brand</th>
                        <th>Grand Total</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>No custom invoices created yet.</td>
                        </tr>
                      ) : (
                        invoices
                          .filter(inv => {
                            const query = searchInvoiceQuery.toLowerCase();
                            return (
                              inv.id.toLowerCase().includes(query) ||
                              inv.customerName.toLowerCase().includes(query) ||
                              (inv.customerEmail && inv.customerEmail.toLowerCase().includes(query)) ||
                              (inv.customerPhone && inv.customerPhone.includes(query))
                            );
                          })
                          .map((inv) => (
                            <tr key={inv.id}>
                              <td style={{ fontWeight: 'bold' }}>{inv.id}</td>
                              <td style={{ fontSize: '0.8rem' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                              <td>
                                <strong>{inv.customerName}</strong><br />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  {inv.customerPhone} {inv.customerEmail && `| ${inv.customerEmail}`}
                                </span>
                              </td>
                              <td style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                {inv.brand}
                              </td>
                              <td style={{ fontWeight: '700' }}>{formatPrice(inv.totalAmount)}</td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button 
                                    className="action-text-btn invoice" 
                                    onClick={() => setSelectedSavedInvoice(inv)}
                                    style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                                  >
                                    View/Print
                                  </button>
                                  <button 
                                    className="action-icon-btn" 
                                    onClick={() => handleDeleteInvoice(inv.id)}
                                    title="Delete Invoice"
                                  >
                                    <Trash size={12} style={{ color: 'var(--accent-red)' }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Media Manager */}
          {activeTab === 'media' && (
            <div className="media-manager-layout">
              <div className="product-form-card glass-panel" style={{ padding: '30px' }}>
                <h3 className="form-title">Media Library Registry</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: '1.5' }}>
                  Upload picture and video files directly. In online mode, files will be securely synced with Firebase Storage and return public links. Copy these links to register new products or embed visuals.
                </p>

                {/* Upload Field */}
                <div 
                  className="media-upload-dropzone" 
                  onClick={() => document.getElementById('media-file-input').click()}
                >
                  <Upload size={32} style={{ margin: '0 auto 10px auto', opacity: 0.6 }} />
                  {uploadingMedia ? (
                    <strong style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Uploading resource... Please wait...</strong>
                  ) : (
                    <>
                      <strong>Select or Drop File to Upload</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Supports JPG, PNG, SVG, and MP4 (max 20MB)</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    id="media-file-input" 
                    onChange={handleMediaUpload} 
                    style={{ display: 'none' }} 
                    accept="image/*,video/*"
                    disabled={uploadingMedia}
                  />
                </div>
              </div>

              {/* Media Grid listing */}
              <div>
                <h3 className="form-title">Media Library Resources ({mediaItems.length})</h3>
                
                {mediaItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--glass-border)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                    No media uploaded yet.
                  </div>
                ) : (
                  <div className="media-grid">
                    {mediaItems.map((item) => (
                      <div key={item.id} className="media-card">
                        <div className="media-preview-wrap">
                          <span className="media-type-tag">{item.type}</span>
                          {item.type === 'image' ? (
                            <img src={item.url} alt={item.name} className="media-preview-asset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <video src={item.url} className="media-card-video" style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline loop onMouseEnter={(e) => e.target.play().catch(() => {})} onMouseLeave={(e) => e.target.pause()} />
                          )}
                        </div>
                        <div className="media-card-details">
                          <span className="media-card-name" title={item.name}>{item.name}</span>
                          <span className="media-card-meta">Size: {item.size || 'Unknown size'}</span>
                          
                          <div className="media-card-actions">
                            <button 
                              className="copy-url-btn" 
                              onClick={() => {
                                navigator.clipboard.writeText(item.url);
                                alert('Resource link copied to clipboard!');
                              }}
                            >
                              Copy Link
                            </button>
                            
                            <button 
                              className="action-icon-btn" 
                              onClick={() => handleDeleteMedia(item.id, item.storagePath)}
                              title="Delete Resource"
                              style={{ padding: '4px' }}
                            >
                              <Trash size={12} style={{ color: 'var(--accent-red)' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 6: Cloud Settings */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '680px' }}>
              {/* Database Status Indicator */}
              {database.isMock() ? (
                <div className="settings-db-status mock">
                  <div className="settings-db-dot" />
                  <span>Currently Running in Offline MOCK DATABASE FALLBACK (LocalStorage)</span>
                </div>
              ) : (
                <div className="settings-db-status cloud">
                  <div className="settings-db-dot" />
                  <span>Connected to Remote GOOGLE CLOUD FIREBASE Database</span>
                </div>
              )}

              <div className="product-form-card glass-panel" style={{ position: 'static' }}>
                <h3 className="form-title">Firebase Web Connection Setup</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '22px', lineHeight: '1.6' }}>
                  If you have created a project at <a href="https://console.firebase.google.com/u/0/project/artbyoture/overview" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-red)', fontWeight: 'bold', textDecoration: 'underline' }}>console.firebase.google.com</a>, register a web application inside the project settings, and paste the web config JSON object below. 
                  <br /><br />
                  Saving will write config keys locally and switch your site automatically to query your live Firebase project database!
                </p>

                <form onSubmit={handleSaveFirebaseConfig}>
                  <div className="form-group" style={{ marginBottom: '22px' }}>
                    <label>Firebase Web Config JSON</label>
                    <textarea 
                      className="form-input settings-textarea"
                      rows="8"
                      value={firebaseConfigText}
                      onChange={(e) => setFirebaseConfigText(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button type="submit" className="action-text-btn invoice" style={{ borderRadius: '8px', padding: '12px 24px' }}>
                      Save & Connect Cloud
                    </button>
                    {!database.isMock() && (
                      <button 
                        type="button" 
                        className="action-text-btn"
                        onClick={handleClearFirebaseConfig}
                        style={{ borderRadius: '8px', padding: '12px 24px' }}
                      >
                        Disconnect Cloud
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Invoice Modal Overlay */}
      {selectedInvoice && (
        <Invoice 
          order={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}

      {/* Manual Invoice Modal Overlay */}
      {selectedSavedInvoice && (
        <Invoice 
          order={selectedSavedInvoice} 
          onClose={() => setSelectedSavedInvoice(null)} 
        />
      )}
    </div>
  );
}
