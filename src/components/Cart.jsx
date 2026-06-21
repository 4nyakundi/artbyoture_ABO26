import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import './Cart.css';

export default function Cart({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckoutOpen 
}) {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Format price helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const hasLutoni = cartItems.some(item => item.type === 'wearable' || item.category === 'wearables');

  return (
    <>
      <div 
        className={`cart-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose} 
      />
      <div className={`cart-drawer glass-panel ${isOpen ? 'open' : ''} ${hasLutoni ? 'lutoni-cart' : ''}`}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        <div className="cart-items-container">
          {cartItems.length === 0 ? (
            <div className="cart-empty-message">
              <ShoppingBagIcon />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div key={`${item.id}-${item.size || 'no-size'}-${index}`} className="cart-item">
                <img 
                  src={item.imageUrl || '/assets/artbyoture_logo.png'} 
                  alt={item.name} 
                  className="cart-item-img" 
                />
                
                <div className="cart-item-details">
                  <span className="cart-item-name">{item.name}</span>
                  <span className="cart-item-meta">
                    {item.type} {item.size ? `• Size: ${item.size}` : ''}
                  </span>
                  <span className="cart-item-price">{formatPrice(item.price)}</span>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-controller">
                    <button 
                      className="quantity-btn" 
                      onClick={() => onUpdateQuantity(item.id, item.size, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button 
                      className="quantity-btn" 
                      onClick={() => onUpdateQuantity(item.id, item.size, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button 
                    className="cart-item-remove" 
                    onClick={() => onRemoveItem(item.id, item.size)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span className="cart-summary-label">Total</span>
              <span className="cart-summary-value">{formatPrice(total)}</span>
            </div>
            
            <button 
              className="cart-checkout-btn" 
              onClick={() => {
                onClose();
                onCheckoutOpen();
              }}
            >
              Proceed to Payment
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// Simple internal icon component for empty state
function ShoppingBagIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="48" 
      height="48" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={{ opacity: 0.3 }}
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  );
}
