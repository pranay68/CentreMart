// /admin/ManagePanel.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const ManagePanel = () => {
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, 'categories'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(data.sort((a, b) => a.order - b.order));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleEnabled = async (id, enabled) => {
    await updateDoc(doc(db, 'categories', id), { enabled: !enabled });
    fetchCategories();
  };

  const updateOrder = async (id, newOrder) => {
    await updateDoc(doc(db, 'categories', id), { order: parseInt(newOrder) });
    fetchCategories();
  };

  return (
    <div>
      <h3>🎛 Home Panel Management</h3>
      <ul>
        {categories.map(cat => (
          <li key={cat.id}>
            <strong>{cat.name}</strong>
            <label style={{ marginLeft: 10 }}>
              Show on Home:
              <input
                type="checkbox"
                checked={cat.enabled}
                onChange={() => toggleEnabled(cat.id, cat.enabled)}
              />
            </label>
            <input
              type="number"
              value={cat.order}
              onChange={e => updateOrder(cat.id, e.target.value)}
              style={{ width: 50, marginLeft: 10 }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManagePanel;
