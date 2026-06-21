import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lenis from 'lenis';

// Services
import { database } from './services/firebase';

// Components
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Cursor from './components/Cursor';
import LoginDrawer from './components/LoginDrawer';

// Pages
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Shop from './pages/Shop';
import Videos from './pages/Videos';
import Admin from './pages/Admin';

import './App.css'; // Let's keep it clear or empty

export default function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // 1. Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // 2. Load Cart from localStorage on init
  useEffect(() => {
    const savedCart = localStorage.getItem('oture_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart items:", e);
      }
    }
  }, []);

  // 3. Save Cart to localStorage on changes
  const saveCartToStorage = (newCart) => {
    setCart(newCart);
    localStorage.setItem('oture_cart', JSON.stringify(newCart));
  };

  // Cart operations
  const handleAddToCart = (product) => {
    const existingIndex = cart.findIndex(
      item => item.id === product.id && item.size === product.size
    );

    let newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += 1;
    } else {
      newCart.push({ ...product, quantity: 1 });
    }

    saveCartToStorage(newCart);
    setCartOpen(true); // Auto-open cart for immediate feedback!
  };

  const handleUpdateQuantity = (productId, size, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId, size);
      return;
    }

    const newCart = cart.map(item => {
      if (item.id === productId && item.size === size) {
        return { ...item, quantity: newQty };
      }
      return item;
    });

    saveCartToStorage(newCart);
  };

  const handleRemoveItem = (productId, size) => {
    const newCart = cart.filter(
      item => !(item.id === productId && item.size === size)
    );
    saveCartToStorage(newCart);
  };

  const handleClearCart = () => {
    saveCartToStorage([]);
  };

  const handleSubmitOrder = async (orderData) => {
    // Send to database (Firebase or Mock)
    await database.addOrder(orderData);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <BrowserRouter>
      {/* Dynamic Custom Cursor */}
      <Cursor />

      {/* Global Header Navigation */}
      <Navbar 
        cartCount={cartCount} 
        onCartToggle={() => setCartOpen(!cartOpen)} 
        onLoginToggle={() => setLoginOpen(!loginOpen)}
      />

      {/* Main Pages Router */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery onAddToCart={handleAddToCart} />} />
          <Route path="/shop" element={<Shop onAddToCart={handleAddToCart} />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* Global Slide-over Drawer Cart */}
      <Cart 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckoutOpen={() => setCheckoutOpen(true)}
      />

      {/* Global Payment Checkout Modal */}
      <Checkout 
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cart}
        onClearCart={handleClearCart}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* Global Admin Login Drawer */}
      <LoginDrawer 
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
      />
    </BrowserRouter>
  );
}
