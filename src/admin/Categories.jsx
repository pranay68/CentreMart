// /admin/Categories.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const Categories = () => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, 'categories'));
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(items);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!name) return;
    await addDoc(collection(db, 'categories'), { name, order: categories.length + 1, enabled: false });
    setName('');
    fetchCategories();
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Delete this category?')) {
      await deleteDoc(doc(db, 'categories', id));
      fetchCategories();
    }
  };

  return (
    <div>
      <h3>🗂 Manage Categories</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New Category" />
      <button onClick={addCategory}>Add</button>
      <ul>
        {categories.map(cat => (
          <li key={cat.id}>
            {cat.name} 
            <button onClick={() => deleteCategory(cat.id)} style={{ marginLeft: 10 }}>🗑</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;
