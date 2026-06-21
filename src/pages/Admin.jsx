import React, { useState, useEffect } from 'react';
import { database } from '../services/firebase';
import Invoice from '../components/Invoice';
import { KeyRound, RefreshCw, Plus, Edit2, Trash2, FileSpreadsheet, FileText, CheckCircle, XCircle } from 'lucide-react';
import './Admin.css';

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
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'Paintings',
    type: 'art', // 'art' or 'wearable'
    sizes: '', // comma-separated S,M,L,XL for wearables
    medium: '', // for art
    dimensions: '', // for art
    year: '2026' // for art
  });

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
    // Check if user has an active session
    const session = sessionStorage.getItem('admin_logged_in');
    if (session === 'true') {
      setIsLoggedIn(true);
    }
    
    // Load current config text representation
    const currentConfig = database.getFirebaseConfig();
    setFirebaseConfigText(JSON.stringify(currentConfig, null, 2));
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchDbData();
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
      // Refresh local state
      fetchDbData();
      alert(`Order ${orderId} status set to ${status}.`);
    } catch (e) {
      alert('Failed to update status.');
    }
  };

  // Product Add / Edit / Delete
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    // Parse sizes
    let parsedSizes = [];
    if (newProduct.type === 'wearable' && newProduct.sizes.trim()) {
      parsedSizes = newProduct.sizes.split(',').map(s => s.trim().toUpperCase());
    }

    const payload = {
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      imageUrl: newProduct.imageUrl || '/assets/artbyoture_logo.png',
      category: newProduct.type === 'art' ? newProduct.category : 'Wearables',
      type: newProduct.type,
      sizes: newProduct.type === 'wearable' ? parsedSizes : null,
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
      
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        category: 'Paintings',
        type: 'art',
        sizes: '',
        medium: '',
        dimensions: '',
        year: '2026'
      });
      setEditingProduct(null);
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
      sizes: product.sizes ? product.sizes.join(', ') : '',
      medium: product.medium || '',
      dimensions: product.dimensions || '',
      year: product.year || '2026'
    });
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

  // Metrics Calculations
  const approvedOrders = orders.filter(o => o.status === 'approved');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  
  const totalRevenue = approvedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  // 1. Render Login Screen
  if (!isLoggedIn) {
    return (
      <div className="admin-page-container container">
        <div className="admin-login-card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <KeyRound size={40} style={{ opacity: 0.8 }} />
          </div>
          <h2 className="login-title">Admin Access</h2>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

            <button type="submit" className="login-btn">Log In</button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Render Main Admin Dashboard
  return (
    <div className="admin-page-container container">
      {/* Dashboard Top Header */}
      <div className="admin-header-section">
        <h1 className="admin-title">Studio Dashboard</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="admin-logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="admin-tabs-nav">
        <button 
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Bookkeeping
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
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Refreshing Database...</h3>
        </div>
      ) : (
        <>
          {/* Tab 1: Bookkeeping Overview */}
          {activeTab === 'overview' && (
            <div>
              <div className="metrics-row">
                <div className="metric-card glass-panel">
                  <span className="metric-label">Approved Sales</span>
                  <div className="metric-value" style={{ color: '#4cd964' }}>{formatPrice(totalRevenue)}</div>
                </div>
                <div className="metric-card glass-panel">
                  <span className="metric-label">Pending Verifications</span>
                  <div className="metric-value" style={{ color: '#ff9500' }}>{formatPrice(pendingRevenue)}</div>
                </div>
                <div className="metric-card glass-panel">
                  <span className="metric-label">Total Transactions</span>
                  <div className="metric-value">{orders.length}</div>
                </div>
                <div className="metric-card glass-panel">
                  <span className="metric-label">Registered Items</span>
                  <div className="metric-value">{products.length}</div>
                </div>
              </div>

              {/* Accounts spreadsheet view */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="form-title" style={{ margin: 0 }}>Spreadsheet Bookkeeping</h3>
                <button 
                  className="invoice-action-btn print"
                  onClick={handleExportCSV}
                  disabled={orders.length === 0}
                  style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '8px 16px' }}
                >
                  <FileSpreadsheet size={14} />
                  <span>Export Spreadsheet (CSV)</span>
                </button>
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
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No transactions registered yet.</td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id}>
                          <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 'bold' }}>{o.mpesaTransactionCode}</td>
                          <td>{o.customerName}</td>
                          <td style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                            {o.items.map(i => `${i.name} (x${i.quantity}${i.size ? ' size '+i.size : ''})`).join(', ')}
                          </td>
                          <td style={{ fontWeight: '700' }}>{formatPrice(o.totalAmount)}</td>
                          <td>
                            <span className={`status-badge ${o.status}`}>{o.status}</span>
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
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No order requests recorded.</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontSize: '0.8rem' }}>{new Date(order.createdAt).toLocaleDateString()}<br />{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          <strong>{order.customerName}</strong><br />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Ph: {order.customerPhone}<br />
                            Email: {order.customerEmail}<br />
                            Addr: {order.deliveryAddress}
                          </span>
                        </td>
                        <td style={{ fontWeight: 'bold', letterSpacing: '1px' }}>
                          {order.mpesaTransactionCode}
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {order.items.map((item, idx) => (
                            <div key={idx}>
                              - {item.name} (x{item.quantity}) {item.size && `[Size ${item.size}]`}
                            </div>
                          ))}
                        </td>
                        <td style={{ fontWeight: '700' }}>{formatPrice(order.totalAmount)}</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>{order.status}</span>
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
                                <FileText size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
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
          )}

          {/* Tab 3: Products tab */}
          {activeTab === 'products' && (
            <div className="admin-product-management-layout">
              {/* Product Form Card */}
              <div className="product-form-card glass-panel">
                <h3 className="form-title">
                  {editingProduct ? `Edit Product (${editingProduct.id})` : 'Register New Item'}
                </h3>
                
                <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="form-group">
                    <label>Item Type</label>
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
                    <label>Product Name</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      required
                      placeholder="e.g. Zebra Wave Vest"
                    />
                  </div>

                  <div className="form-group">
                    <label>Price (KES)</label>
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
                    <label>Description</label>
                    <textarea 
                      className="form-input"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      required
                      rows="3"
                      placeholder="Detail materials, layout concepts, and visual styles..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Image Resource Link (relative/absolute)</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={newProduct.imageUrl}
                      onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                      placeholder="e.g. /assets/IMG_1333.jpg or upload URL"
                    />
                  </div>

                  {newProduct.type === 'art' ? (
                    <>
                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Medium</label>
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
                          <label>Year</label>
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
                          placeholder="e.g. 80cm x 100cm"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="form-group">
                      <label>Available Sizing (comma-separated)</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={newProduct.sizes}
                        onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                        placeholder="e.g. S, M, L, XL"
                        required={newProduct.type === 'wearable'}
                      />
                    </div>
                  )}

                  <div className="checkout-nav-buttons" style={{ marginTop: '10px' }}>
                    {editingProduct && (
                      <button 
                        type="button" 
                        className="checkout-btn secondary"
                        onClick={() => {
                          setEditingProduct(null);
                          setNewProduct({
                            name: '',
                            description: '',
                            price: '',
                            imageUrl: '',
                            category: 'Paintings',
                            type: 'art',
                            sizes: '',
                            medium: '',
                            dimensions: '',
                            year: '2026'
                          });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="checkout-btn primary">
                      {editingProduct ? 'Save Product' : 'Add Item'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Products Table list */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <img 
                            src={p.imageUrl} 
                            alt={p.name} 
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                          />
                        </td>
                        <td>
                          <strong>{p.name}</strong><br />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {p.id}</span>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>
                          {p.type}
                        </td>
                        <td style={{ fontWeight: 'bold' }}>{formatPrice(p.price)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="action-icon-btn" onClick={() => handleEditClick(p)} title="Edit product">
                              <Edit2 size={12} />
                            </button>
                            <button className="action-icon-btn" onClick={() => handleDeleteClick(p.id)} title="Delete product">
                              <Trash2 size={12} style={{ color: 'var(--accent-red)' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Cloud Settings */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '650px' }}>
              {/* Database Status Alert banner */}
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

              <div className="product-form-card glass-panel">
                <h3 className="form-title">Firebase Web Connection Setup</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
                  If you have created a project at <a href="https://console.firebase.google.com/u/0/project/artbyoture/overview" target="_blank" style={{ color: 'var(--accent-red)', fontWeight: 'bold', textDecoration: 'underline' }}>console.firebase.google.com</a>, register a web application inside the project settings, and paste the web config JSON object below. 
                  <br /><br />
                  Saving will write config keys locally and switch your site automatically to query your live Firebase project database!
                </p>

                <form onSubmit={handleSaveFirebaseConfig}>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
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
                    <button type="submit" className="checkout-btn primary">
                      Save & Connect
                    </button>
                    {!database.isMock() && (
                      <button 
                        type="button" 
                        className="checkout-btn secondary"
                        onClick={handleClearFirebaseConfig}
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
