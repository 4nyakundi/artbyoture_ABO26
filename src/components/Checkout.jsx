import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import './Checkout.css';

export default function Checkout({ 
  isOpen, 
  onClose, 
  cartItems, 
  onClearCart,
  onSubmitOrder 
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    transactionCode: ''
  });
  
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.address) {
        alert('Please fill out all billing/shipping details.');
        return;
      }
      setStep(2);
    }
  };

  const handleBackStep = () => {
    if (step === 2) setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.transactionCode) {
      alert('Please enter your M-Pesa Transaction Code to submit.');
      return;
    }

    setLoading(true);

    const orderData = {
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      deliveryAddress: formData.address,
      mpesaTransactionCode: formData.transactionCode.toUpperCase().trim(),
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || null,
        type: item.type
      })),
      totalAmount: total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await onSubmitOrder(orderData);
      setStep(3);
      onClearCart();
    } catch (error) {
      console.error("Order submission failed: ", error);
      alert("There was an error saving your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const hasLutoni = cartItems.some(item => item.type === 'wearable' || item.category === 'wearables');

  if (!isOpen) return null;

  return (
    <div className={`checkout-backdrop ${isOpen ? 'open' : ''} ${hasLutoni ? 'lutoni-theme-checkout' : ''}`}>
      <div className="checkout-modal glass-panel">
        <button className="checkout-close-btn" onClick={onClose} aria-label="Close checkout">
          <X size={20} />
        </button>

        {step < 3 && <h2 className="checkout-title">Checkout</h2>}

        {step < 3 && (
          <div className="checkout-steps-indicator">
            <div className={`checkout-step-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              {step > 1 ? <Check size={14} /> : '1'}
            </div>
            <div className={`checkout-step-node ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              {step > 2 ? <Check size={14} /> : '2'}
            </div>
          </div>
        )}

        {step === 1 && (
          <form className="checkout-form-step" onSubmit={handleNextStep}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className="form-input" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                className="form-input" 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
                placeholder="e.g. john@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number (M-Pesa / Contact)</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                className="form-input" 
                value={formData.phone} 
                onChange={handleInputChange} 
                required 
                placeholder="e.g. 0712345678"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Delivery Address / Details</label>
              <textarea 
                id="address" 
                name="address" 
                className="form-input" 
                rows="3"
                value={formData.address} 
                onChange={handleInputChange} 
                required 
                placeholder="e.g. Apartment, Street, City, Estate"
              />
            </div>

            <div className="checkout-nav-buttons">
              <button type="button" className="checkout-btn secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="checkout-btn primary">
                Continue to Payment
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="checkout-form-step" onSubmit={handleSubmit}>
            <div className="mpesa-instructions-card">
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'center' }}>
                M-Pesa Payment Recipient
              </span>
              <div className="mpesa-number-highlight">0723968164</div>
              <p className="mpesa-instructions-text">
                Please open M-Pesa on your phone, choose <strong>Send Money</strong>, enter the number above, and send <strong>{formatPrice(total)}</strong>.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="transactionCode">M-Pesa Transaction Code</label>
              <input 
                type="text" 
                id="transactionCode" 
                name="transactionCode" 
                className="form-input" 
                value={formData.transactionCode} 
                onChange={handleInputChange} 
                required 
                placeholder="e.g. RJ73FF89DK"
                maxLength="12"
                style={{ textTransform: 'uppercase', textAlign: 'center', letterSpacing: '2px', fontWeight: 'bold' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Enter the confirmation code from the M-Pesa SMS to verify your purchase.
              </span>
            </div>

            <div className="checkout-nav-buttons">
              <button type="button" className="checkout-btn secondary" onClick={handleBackStep} disabled={loading}>
                Back
              </button>
              <button type="submit" className="checkout-btn primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Order'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="checkout-success-view">
            <div className="success-icon-wrap">
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 className="success-title">Order Submitted</h2>
            <p className="success-message">
              Thank you for your purchase! Your order has been registered under M-Pesa Transaction <strong>{formData.transactionCode.toUpperCase()}</strong>.
              <br /><br />
              The administrator will verify your transaction code and email you an invoice once payment is confirmed.
            </p>
            <button className="checkout-btn primary" style={{ width: '200px', marginTop: '10px' }} onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
