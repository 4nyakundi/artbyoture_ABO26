import React from 'react';
import { Printer, X } from 'lucide-react';
import './Invoice.css';

export default function Invoice({ order, onClose }) {
  if (!order) return null;

  const total = order.totalAmount;
  
  // Format price helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determine logo branding based on items purchased
  const hasArt = order.items.some(item => item.type === 'art');
  const hasWearable = order.items.some(item => item.type === 'wearable');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-modal-overlay" onClick={onClose}>
      <div className="invoice-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Actions bar (hidden in print) */}
        <div className="invoice-actions-bar">
          <button className="invoice-action-btn print" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Invoice / Save PDF</span>
          </button>
          <button className="invoice-action-btn close" onClick={onClose}>
            <X size={16} />
            <span>Close</span>
          </button>
        </div>

        {/* Printable Invoice Area */}
        <div className="invoice-print-area">
          
          {/* Angled Paid Stamp */}
          {order.status === 'approved' && (
            <div className="invoice-paid-stamp">
              PAID VIA M-PESA
            </div>
          )}

          {/* Header Layout */}
          <div className="invoice-header-layout">
            <div className="invoice-logo-wrap">
              {hasWearable && (
                <img 
                  src="/assets/lutoni_logo.png" 
                  className="invoice-logo-img" 
                  alt="Lutoni Brand Logo" 
                />
              )}
              {hasArt && (
                <img 
                  src="/assets/artbyoture_logo.png" 
                  className="invoice-logo-img" 
                  alt="Art By Oture Logo" 
                />
              )}
              <span className="invoice-brand-title">
                {hasArt && hasWearable 
                  ? 'Oture • Lutoni' 
                  : hasWearable 
                    ? 'Lutoni Wear' 
                    : 'Art By Oture'}
              </span>
            </div>

            <div className="invoice-meta-info">
              <span className="invoice-label">Invoice</span>
              <span className="invoice-id-text">No: {order.id}</span>
              <span className="invoice-date-text">Date: {formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* Billing Info */}
          <div className="invoice-billing-row">
            <div>
              <h4 className="invoice-bill-col-title">Issued By</h4>
              <div className="invoice-bill-address">
                <strong>Art By Oture & Lutoni Wear</strong><br />
                M-Pesa payment: 0723968164<br />
                Instagram: @artbyoture / @lutoni.ke<br />
                Nairobi, Kenya
              </div>
            </div>

            <div>
              <h4 className="invoice-bill-col-title">Billed To</h4>
              <div className="invoice-bill-address">
                <strong>{order.customerName}</strong><br />
                Email: {order.customerEmail}<br />
                Phone: {order.customerPhone}<br />
                Address: {order.deliveryAddress}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Type</th>
                <th>Size</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{item.type}</td>
                  <td>{item.size || '—'}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{formatPrice(item.price)}</td>
                  <td className="invoice-item-subtotal">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div className="invoice-summary-section">
            <div className="invoice-summary-box">
              <div className="invoice-summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="invoice-summary-row">
                <span>M-Pesa Verification fee</span>
                <span>{formatPrice(0)}</span>
              </div>
              <div className="invoice-summary-row grand-total">
                <span>Grand Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              
              <div style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                Payment Method: Mobile Money (M-Pesa)<br />
                Transaction Ref: <strong>{order.mpesaTransactionCode}</strong>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
