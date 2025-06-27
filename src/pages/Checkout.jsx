import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'cod'
  });

  const cartItemsArray = Object.values(cartItems);
  const deliveryAreas = [
    'kadam chowk', 'bhanu chowk', 'siva chowk', 'pirari chowk',
    'mills area', 'thapa chowk', 'murli chowk', 'campus chowk',
    'railway station area', 'janaki chowk', 'janak chowk'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItemsArray.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create orders for each cart item
      const orderPromises = cartItemsArray.map(item => 
        addDoc(collection(db, 'orders'), {
          userId: user?.uid || null,
          productId: item.id,
          productName: item.name,
          productImageURL: item.imageUrl,
          price: item.price * item.quantity,
          quantity: item.quantity,
          customerName: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          paymentMethod: formData.paymentMethod,
          status: 'Pending',
          createdAt: serverTimestamp(),
          isGuest: !user
        })
      );

      await Promise.all(orderPromises);
      
      toast.success('Order placed successfully!');
      clearCart();
      navigate('/order-success');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItemsArray.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <Card.Content className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to checkout</p>
              <Button onClick={() => navigate('/')}>
                Continue Shopping
              </Button>
            </Card.Content>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shipping Information */}
            <div>
              <Card>
                <Card.Header>
                  <h2 className="text-xl font-semibold">Shipping Information</h2>
                </Card.Header>
                <Card.Content className="space-y-4">
                  <Input
                    label="Full Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  
                  <Input
                    label="Phone Number *"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+977-9812345678"
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Area *
                    </label>
                    <select
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select delivery area</option>
                      {deliveryAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                  
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Janakpur"
                  />
                  
                  <Input
                    label="ZIP Code"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                  />
                </Card.Content>
              </Card>

              {/* Payment Method */}
              <Card className="mt-6">
                <Card.Header>
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span className="text-lg">💰 Cash on Delivery</span>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Pay when your order is delivered to your doorstep.
                  </p>
                </Card.Content>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <Card.Header>
                  <h2 className="text-xl font-semibold">Order Summary</h2>
                </Card.Header>
                <Card.Content className="space-y-4">
                  {cartItemsArray.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 py-2 border-b border-gray-100">
                      <img
                        src={item.imageUrl || 'https://via.placeholder.com/60'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  
                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rs. {getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>Rs. {getTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    loading={loading}
                  >
                    Place Order
                  </Button>
                </Card.Content>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;