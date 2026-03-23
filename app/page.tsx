"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- NEW STATE FOR CHECKOUT ---
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setIsLoading(false);
      });
  }, []);

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product_id === product.product_id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price_inr * item.quantity), 0);

  // --- NEW SUBMIT ORDER FUNCTION ---
  const submitOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert("Please fill in all details for delivery.");
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerInfo,
          items: cart,
          totalAmount: cartTotal
        })
      });

      if (response.ok) {
        setIsOrderComplete(true);
        setCart([]); // Empty the cart
        
        // Close everything after 3 seconds
        setTimeout(() => {
          setIsCartOpen(false);
          setIsOrderComplete(false);
          setIsCheckoutMode(false);
          setCustomerInfo({ name: '', phone: '', address: '' }); // Reset form
        }, 3000);
      } else {
        alert("There was an issue placing your order. Please try again.");
      }
    } catch (error) {
      alert("Network error. Please check your connection.");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-green-800 font-bold">Loading Alvara Wellness...</div>;
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] pb-24 relative">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-center text-green-900 tracking-wide">
          Alvara Wellness
        </h1>
        <p className="text-center text-xs text-gray-500 mt-1">Nature's Touch for Modern Living</p>
      </header>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {Array.isArray(products) && products.length > 0 ? (
          products.map((product) => (
            <div key={product.product_id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
                <span className="text-sm font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                  ₹{product.price_inr}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">{product.category}</p>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              
              <button 
                onClick={() => addToCart(product)}
                disabled={!product.inStock}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  product.inStock 
                    ? 'bg-green-800 text-white hover:bg-green-900 active:scale-[0.98]' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center p-8 bg-red-50 rounded-xl">
            <p className="text-red-800 font-bold mb-2">Oops! Products not found.</p>
            <p className="text-sm text-red-600">Please check your database connection.</p>
          </div>
        )}
      </div>

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 flex flex-col justify-end">
          <div className="bg-white w-full max-w-md mx-auto h-[85%] rounded-t-3xl p-6 flex flex-col animate-slide-up">
            
            {/* Success Screen */}
            {isOrderComplete ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-slide-up">
                <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-4xl mb-4">✓</div>
                <h2 className="text-2xl font-bold text-gray-800">Order Placed!</h2>
                <p className="text-gray-500">Thank you for choosing Alvara. Your wellness journey begins soon.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    {isCheckoutMode ? 'Delivery Details' : 'Your Cart'}
                  </h2>
                  <button onClick={() => { setIsCartOpen(false); setIsCheckoutMode(false); }} className="text-gray-400 text-xl">✕</button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4">
                  {!isCheckoutMode ? (
                    /* View Cart Mode */
                    cart.length === 0 ? (
                      <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
                    ) : (
                      cart.map((item, index) => (
                        <div key={index} className="flex justify-between border-b pb-4 mt-2">
                          <div>
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium text-gray-800">₹{item.price_inr * item.quantity}</p>
                        </div>
                      ))
                    )
                  ) : (
                    /* Checkout Form Mode */
                    <div className="space-y-4 pt-2">
                      <input 
                        type="text" placeholder="Full Name" 
                        value={customerInfo.name} onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-green-700" 
                      />
                      <input 
                        type="tel" placeholder="Phone Number" 
                        value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-green-700" 
                      />
                      <textarea 
                        placeholder="Complete Delivery Address" rows={3}
                        value={customerInfo.address} onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                        className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-green-700 resize-none" 
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t mt-4">
                  <div className="flex justify-between mb-4">
                    <span className="font-bold text-lg text-gray-600">Total:</span>
                    <span className="font-bold text-2xl text-green-900">₹{cartTotal}</span>
                  </div>
                  
                  {!isCheckoutMode ? (
                    <button 
                      onClick={() => setIsCheckoutMode(true)} disabled={cart.length === 0}
                      className="w-full bg-green-900 text-white py-4 rounded-xl font-bold disabled:bg-gray-300 transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                  ) : (
                    <button 
                      onClick={submitOrder} 
                      className="w-full bg-green-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all"
                    >
                      Confirm Order
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 p-4 flex justify-around text-gray-500 max-w-md left-1/2 -translate-x-1/2 z-10">
        <button onClick={() => { setIsCartOpen(false); setIsCheckoutMode(false); }} className="text-sm font-bold text-green-800">Shop</button>
        <button onClick={() => setIsCartOpen(true)} className="text-sm relative">
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-3 -right-4 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>
        <button className="text-sm">Profile</button>
      </nav>
    </main>
  );
}