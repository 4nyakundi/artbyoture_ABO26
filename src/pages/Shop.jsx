import React, { useState, useEffect } from 'react';
import { database } from '../services/firebase';
import './Shop.css';

export default function Shop({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});

  useEffect(() => {
    const fetchWearables = async () => {
      try {
        const allProds = await database.getProducts();
        const wearProds = allProds.filter(prod => prod.type === 'wearable');
        setProducts(wearProds);
        
        // Pre-select first size for each product
        const initialSizes = {};
        wearProds.forEach(prod => {
          if (prod.sizes && prod.sizes.length > 0) {
            initialSizes[prod.id] = prod.sizes[0];
          }
        });
        setSelectedSizes(initialSizes);
      } catch (e) {
        console.error("Failed to load products in Shop: ", e);
      } finally {
        setLoading(false);
      }
    };
    fetchWearables();
  }, []);

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }));
  };

  const handleBuyClick = (product) => {
    const size = selectedSizes[product.id];
    if (product.sizes && product.sizes.length > 0 && !size) {
      alert('Please select a garment size first.');
      return;
    }
    
    // Add size metadata to the item
    onAddToCart({
      ...product,
      size: size || null
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="shop-container container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <h3 style={{ fontFamily: 'var(--font-header)', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent-red)' }}>Loading Collection...</h3>
      </div>
    );
  }

  return (
    <div className="shop-container container">
      {/* Header */}
      <div className="shop-header-section">
        <div className="shop-title-wrap">
          <img src="/assets/lutoni_logo.png" alt="Lutoni Brand Logo" className="shop-logo-img" />
          <h1 className="shop-title">Lutoni Wear</h1>
        </div>
        <p className="shop-subtitle">
          High-concept wearable garments, shirts, and accessories. Designed as an extension of the painter’s organic visual textures.
        </p>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <p>No garments available at the moment.</p>
        </div>
      ) : (
        <div className="shop-grid">
          {products.map((item) => (
            <div key={item.id} className="shop-card">
              <div className="shop-card-img-wrap">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="shop-card-img" 
                  loading="lazy"
                />
                <span className="shop-badge">Lutoni Ke</span>
              </div>

              <div className="shop-card-details">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="shop-card-title">{item.name}</h3>
                </div>
                
                <span className="shop-card-price">{formatPrice(item.price)}</span>
                
                <p className="shop-card-desc">
                  {item.description}
                </p>

                {/* Sizing Selector */}
                {item.sizes && item.sizes.length > 0 && (
                  <div className="size-selector-wrap">
                    <span className="size-selector-label">Select Size</span>
                    <div className="size-btn-grid">
                      {item.sizes.map((size) => (
                        <button
                          key={size}
                          className={`size-btn ${selectedSizes[item.id] === size ? 'selected' : ''}`}
                          onClick={() => handleSizeSelect(item.id, size)}
                          aria-label={`Select size ${size}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  className="shop-buy-btn"
                  onClick={() => handleBuyClick(item)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
