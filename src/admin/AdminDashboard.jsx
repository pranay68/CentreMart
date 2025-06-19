import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import {
  collection, getDocs, deleteDoc, doc, updateDoc,
  query, orderBy
} from 'firebase/firestore';
import AddProduct from './AddProduct';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState(new Set()); // for checkboxes

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, 'products'));
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProducts(items);
    setLoading(false);
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setSelectedOrders(new Set()); // reset selection on fetch
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (showOrders) {
      fetchOrders();
    }
  }, [showOrders]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    }
  };

  const updateOffer = async (offerData) => {
    if (!selectedProduct) return;
    const productRef = doc(db, 'products', selectedProduct.id);
    await updateDoc(productRef, { offer: offerData });
    alert('✅ Offer Updated!');
    fetchProducts();
    setSelectedProduct(null);
  };

  // NEW: Mark selected orders as Delivered
  const markSelectedAsDelivered = async () => {
    if (selectedOrders.size === 0) {
      alert('⚠️ No orders selected!');
      return;
    }
    try {
      const promises = [];
      selectedOrders.forEach(orderId => {
        const orderRef = doc(db, 'orders', orderId);
        promises.push(updateDoc(orderRef, { status: 'Delivered' }));
      });
      await Promise.all(promises);
      alert('🔥 Selected orders marked as Delivered!');
      fetchOrders();
    } catch (error) {
      console.error("Error marking orders as Delivered:", error);
      alert('❌ Failed to mark orders Delivered. Try again.');
    }
  };

  // Checkbox toggle
  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  // Check if all selected orders are already delivered (disable button)
  const allSelectedDelivered = () => {
    if (selectedOrders.size === 0) return true;
    return [...selectedOrders].every(id => {
      const order = orders.find(o => o.id === id);
      return order?.status === 'Delivered';
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>

      {/* Toggle Orders */}
      <button onClick={() => setShowOrders(prev => !prev)} style={{ marginRight: 10 }}>
        {showOrders ? 'Hide Orders' : 'View Orders'}
      </button>

      {/* Toggle Add Product */}
      <button 
        onClick={() => setShowAddProduct(prev => !prev)}
        style={{
          backgroundColor: showAddProduct ? '#e74c3c' : '#27ae60',
          color: 'white',
          border: 'none',
          padding: '10px 15px',
          borderRadius: 5,
          cursor: 'pointer'
        }}
      >
        {showAddProduct ? 'Close Add Product' : 'Add New Product'}
      </button>

      {/* AddProduct Form */}
      {showAddProduct && (
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <AddProduct 
            onSuccess={() => {
              setShowAddProduct(false);
              fetchProducts();
            }} 
          />
        </div>
      )}

      {/* Products or Orders Table */}
      {!showOrders ? (
        loading ? <p>Loading products...</p> : (
          <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', marginTop: 20 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Description</th>
                <th>Offer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>Rs. {p.price}</td>
                  <td>{p.description}</td>
                  <td>{p.offer?.type !== 'none' ? `${p.offer?.value}` : 'None'}</td>
                  <td>
                    <button onClick={() => handleDelete(p.id)} style={{ color: 'red' }}>Delete</button>
                    <button onClick={() => setSelectedProduct(p)} style={{ marginLeft: 10 }}>Manage Offer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      ) : (
        <>
          <h3>📦 Orders</h3>

          {/* ACTION BUTTON TOP */}
          <button
            onClick={markSelectedAsDelivered}
            disabled={selectedOrders.size === 0 || allSelectedDelivered()}
            style={{
              backgroundColor: (selectedOrders.size === 0 || allSelectedDelivered()) ? '#bdc3c7' : '#27ae60',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: 5,
              cursor: (selectedOrders.size === 0 || allSelectedDelivered()) ? 'not-allowed' : 'pointer',
              marginBottom: 10,
              fontWeight: 'bold',
            }}
            title={selectedOrders.size === 0 ? 'Select orders first' : allSelectedDelivered() ? 'Selected orders already delivered' : 'Mark selected orders as Delivered'}
          >
            🚀 Mark Selected as Delivered
          </button>

          {orders.length === 0 ? <p>No orders yet.</p> : (
            <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', marginTop: 20 }}>
              <thead>
                <tr>
                  <th>
                    {/* Select All Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedOrders.size === orders.length && orders.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Select all non-delivered orders only for practical usage
                          const allIds = orders.filter(o => o.status !== 'Delivered').map(o => o.id);
                          setSelectedOrders(new Set(allIds));
                        } else {
                          setSelectedOrders(new Set());
                        }
                      }}
                      title="Select All non-delivered"
                    />
                  </th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ backgroundColor: selectedOrders.has(order.id) ? '#d1f7d1' : 'transparent' }}>
                    <td>
                      {order.status !== 'Delivered' ? (
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                        />
                      ) : '✔️'}
                    </td>
                    <td>{order.productName}</td>
                    <td>Rs. {order.price}</td>
                    <td>{order.customerName}</td>
                    <td>{order.phone}</td>
                    <td>{order.address}</td>
                    <td>{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Offer Modal */}
      {selectedProduct && (
        <div style={modalStyles.backdrop}>
          <div style={modalStyles.modal}>
            <h3>🛠 Manage Offer: {selectedProduct.name}</h3>
            <OfferForm
              initialData={selectedProduct.offer}
              onCancel={() => setSelectedProduct(null)}
              onSave={updateOffer}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const OfferForm = ({ initialData = {}, onCancel, onSave }) => {
  const [type, setType] = useState(initialData?.type || 'none');
  const [value, setValue] = useState(initialData?.value || '');
  const [expiresAt, setExpiresAt] = useState(initialData?.expiresAt || '');

  const handleSave = () => {
    onSave({ type, value, expiresAt });
  };

  return (
    <>
      <label>Type:
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="none">None</option>
          <option value="discount">Discount (%)</option>
          <option value="custom">Custom Text</option>
        </select>
      </label>
      <br />
      <label>Value:
        <input type="text" value={value} onChange={e => setValue(e.target.value)} />
      </label>
      <br />
      <label>Expires At:
        <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
      </label>
      <br /><br />
      <button onClick={handleSave}>💾 Save</button>
      <button onClick={onCancel} style={{ marginLeft: 10 }}>❌ Cancel</button>
    </>
  );
};

const modalStyles = {
  backdrop: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff', padding: 20, borderRadius: 8,
    minWidth: 400, boxShadow: '0 0 20px rgba(0,0,0,0.3)',
  },
};

export default AdminDashboard;
