import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const formatDate = useCallback((date) => {
    if (!date) return 'Unknown';
    return date.toLocaleString();
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || null
        }));
        setOrders(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('🔥 Error fetching orders:', err);
        setError('❌ Could not load orders. Check console.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = orders;
    if (searchTerm.trim()) {
      filtered = filtered.filter(order =>
        `${order.productName} ${order.customerName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const markAsDelivered = async (orderId) => {
    try {
      setUpdatingOrderId(orderId);
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'Delivered' });
    } catch (err) {
      console.error('🔥 Update failed:', err);
      alert('❌ Could not mark as delivered');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) return <p className="loading-msg">⏳ Loading orders...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <section className="orders-panel">
      <h2>📦 Admin Order Control Panel</h2>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 Search by name or product"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {!filteredOrders.length ? (
        <p className="no-orders-msg">🧼 No matching orders found.</p>
      ) : (
        <ul className="orders-list">
          {filteredOrders.map(order => (
            <li
              key={order.id}
              className={`order-card ${order.status === 'Delivered' ? 'delivered' : ''}`}
            >
              <div className="order-info">
                <img
                  src={order.productImageURL || 'https://via.placeholder.com/100?text=No+Image'}
                  alt={order.productName}
                  className="order-product-image"
                  onError={e => { e.currentTarget.src = 'https://via.placeholder.com/100?text=No+Image'; }}
                />
                <div className="order-details">
                  <p><strong>🛍️ Product:</strong> {order.productName}</p>
                  <p><strong>💵 Price:</strong> Rs. {order.price?.toLocaleString() ?? 'N/A'}</p>
                  <p><strong>🙋 Customer:</strong> {order.customerName}</p>
                  <p><strong>📞 Phone:</strong> {order.phone}</p>
                  <p><strong>📍 Address:</strong> {order.address}</p>
                  <p><strong>🚚 Payment:</strong> {order.paymentMethod}</p>
                  <p><strong>📦 Status:</strong> <span className={`status-tag status-${order.status?.toLowerCase()}`}>{order.status}</span></p>
                  <p><strong>🕓 Ordered At:</strong> {formatDate(order.createdAt)}</p>
                </div>
              </div>

              {order.status !== 'Delivered' && (
                <button
                  onClick={() => markAsDelivered(order.id)}
                  disabled={updatingOrderId === order.id}
                  className="mark-delivered-btn"
                >
                  {updatingOrderId === order.id ? 'Updating...' : '✔️ Mark as Delivered'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Orders;
