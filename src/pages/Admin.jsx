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
  Database
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
  const [loading, setLoading] = useState(true);

  // Forms & Editing States
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [firebaseConfigText, setFirebaseConfigText] = useState('');
  
  // Selected Wearable Sizes (Chips UI)
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Search & Filter States
  const [bookkeepingSearch, setBookkeepingSearch] = useState('');
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersStatusFilter, setOrdersStatusFilter] = useState('all');
  const [productsSearch, setProductsSearch] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'Paintings',
    type: 'art', // 'art' or 'wearable'
    medium: '', // for art
    dimensions: '', // for art
    year: '2026' // for art
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
      setProducts(allProds);
      setOrders(allOrders);
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
    } else if (isLoggedIn && dashboardRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.admin-title-wrap', { opacity: 0, x: -30, duration: 0.8, ease: 'power2.out' });
        gsap.from('.admin-logout-btn', { opacity: 0, x: 30, duration: 0.8, ease: 'power2.out' }, '-=0.8');
        gsap.from('.admin-tabs-nav button', { opacity: 0, y: 15, stagger: 0.08, duration: 0.6, ease: 'power2.out' }, '-=0.4');
        gsap.from('.metric-card', { opacity: 0, y: 30, stagger: 0.1, duration: 0.8, ease: 'back.out(1.2)' });
        gsap.from('.analytics-card', { opacity: 0, y: 40, stagger: 0.15, duration: 1, ease: 'power3.out' }, '-=0.4');
      }, dashboardRef.current);

      return () => ctx.revert();
    }
  }, [isLoggedIn, loading]);

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
      year: newProduct.type === 'art' ? newProduct.year : null
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
      year: product.year || '2026'
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
      year: '2026'
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
    <div className="admin-page-container container" ref={dashboardRef}>
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
          Product Database
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
            </div>
          )}

          {/* Tab 4: Cloud Settings */}
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
    </div>
  );
}
