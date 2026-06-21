import React, { useState, useEffect } from 'react';
import { database } from '../services/firebase';
import { X, Search } from 'lucide-react';
import './Gallery.css';

export default function Gallery({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    const fetchArt = async () => {
      try {
        const allProds = await database.getProducts();
        // Filter down to only Art items
        const artProds = allProds.filter(prod => prod.type === 'art');
        setProducts(artProds);
      } catch (e) {
        console.error("Failed to load products in Gallery: ", e);
      } finally {
        setLoading(false);
      }
    };
    fetchArt();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Get distinct mediums for filtering
  const filters = ['All', 'Acrylic', 'Oil', 'Mixed Media'];

  const filteredProducts = activeFilter === 'All' 
    ? products
    : products.filter(prod => {
        const medium = prod.medium || '';
        return medium.toLowerCase().includes(activeFilter.toLowerCase());
      });

  if (loading) {
    return (
      <div className="gallery-container container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <h3 style={{ fontFamily: 'var(--font-header)', letterSpacing: '1px', textTransform: 'uppercase' }}>Loading Collection...</h3>
      </div>
    );
  }

  return (
    <div className="gallery-container container">
      {/* Header */}
      <div className="gallery-header-section">
        <h1 className="gallery-title">Paintings Gallery</h1>
        <p className="gallery-subtitle">
          Original contemporary paintings by Art By Oture. Every piece is an organic exploration of high contrast, visual rhythm, and layered acrylic/oil textures.
        </p>
      </div>

      {/* Filter Tags */}
      <div className="gallery-filters">
        {filters.map((filter) => (
          <button 
            key={filter} 
            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <p>No paintings found matching this category.</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredProducts.map((art) => (
            <div key={art.id} className="gallery-card">
              <div 
                className="gallery-card-img-wrap" 
                onClick={() => setLightboxItem(art)}
              >
                <img 
                  src={art.imageUrl} 
                  alt={art.name} 
                  className="gallery-card-img" 
                  loading="lazy"
                />
              </div>

              <div className="gallery-card-details">
                <div className="gallery-card-top">
                  <h3 className="gallery-card-title">{art.name}</h3>
                  <span className="gallery-card-year">{art.year || '2026'}</span>
                </div>
                
                <p className="gallery-card-meta">
                  <strong>Medium:</strong> {art.medium || 'Acrylic on Canvas'}<br />
                  <strong>Dimensions:</strong> {art.dimensions || '100cm x 100cm'}
                </p>

                <p className="gallery-card-meta" style={{ opacity: 0.85, fontSize: '0.85rem', flexGrow: 1 }}>
                  {art.description}
                </p>

                <div className="gallery-card-bottom">
                  <span className="gallery-card-price">{formatPrice(art.price)}</span>
                  <button 
                    className="gallery-buy-btn"
                    onClick={() => onAddToCart(art)}
                  >
                    Buy Original
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Overlay */}
      <div 
        className={`lightbox-overlay ${lightboxItem ? 'open' : ''}`}
        onClick={() => setLightboxItem(null)}
      >
        {lightboxItem && (
          <>
            <button className="lightbox-close-btn" onClick={() => setLightboxItem(null)}>
              <X size={24} />
            </button>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <img 
                src={lightboxItem.imageUrl} 
                alt={lightboxItem.name} 
                className="lightbox-img" 
              />
              <div className="lightbox-caption">
                {lightboxItem.name} • {lightboxItem.year || '2026'} • {lightboxItem.medium} ({lightboxItem.dimensions})
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
