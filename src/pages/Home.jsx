import { Link } from 'react-router-dom';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import CategoryPanel from '../components/CategoryPanel';
import { db } from '../firebase/config';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  where
} from 'firebase/firestore';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [panels, setPanels] = useState([]);
  const observer = useRef();

  const normalize = str =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '')
      .replace(/moblie|mobl|mobliee/g, 'mobile')
      .replace(/sho|sneekar|snkar/g, 'shoe')
      .replace(/laptap|labtop/g, 'laptop')
      .replace(/tv|teevee|tvee/g, 'television');

  const filterProducts = list => {
    if (!searchTerm) return list;
    const cleaned = normalize(searchTerm);
    return list.filter(product => {
      const name = normalize(product.name || '');
      const desc = normalize(product.description || '');
      const cat = normalize(product.category || '');
      return name.includes(cleaned) || desc.includes(cleaned) || cat.includes(cleaned);
    });
  };

  const fetchProducts = async (initial = false) => {
    if (loading) return;
    setLoading(true);

    const productsRef = collection(db, 'products');
    const q = initial || !lastDoc
      ? query(productsRef, orderBy('name'), limit(12))
      : query(productsRef, orderBy('name'), startAfter(lastDoc), limit(12));

    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    setProducts(prev => (initial ? items : [...prev, ...items]));
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length === 12);
    setLoading(false);
  };

  const fetchPanels = async () => {
    const catSnap = await getDocs(
      query(collection(db, 'categories'), where('enabled', '==', true), orderBy('order'))
    );
    const cats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const panels = await Promise.all(
      cats.map(async cat => {
        const productSnap = await getDocs(
          query(
            collection(db, 'products'),
            where('category', '==', cat.name),
            orderBy('name'),
            limit(6)
          )
        );
        const products = productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return {
          title: cat.name,
          products: products
        };
      })
    );

    const filteredPanels = panels.filter(panel =>
      panel.products && panel.products.length > 0
    );

    setPanels(filteredPanels);
  };

  useEffect(() => {
    fetchProducts(true);
    fetchPanels();
  }, []);

  const lastProductRef = useCallback(
    node => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          fetchProducts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>🛒 Centre Mart</h1>
        <input
          className="search-bar"
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </header>

      {/* 🔥 Category Panels */}
      {panels.length > 0 && !searchTerm && (
        <>
          {panels.map((panel, i) => {
            const filtered = filterProducts(panel.products);
            return filtered.length > 0 ? (
              <CategoryPanel
                key={i}
                title={panel.title}
                products={filtered}
              />
            ) : null;
          })}
        </>
      )}

      {/* 🔁 Infinite Feed */}
      {(panels.length === 0 || searchTerm) && (
        <section className="product-section">
          {!products.length && !searchTerm &&
            Array(12).fill(null).map((_, i) => (
              <ProductCard key={i} loading={true} />
            ))}

          {products.length > 0 && filterProducts(products).length === 0 && searchTerm && (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666' }}>
              No products found matching "{searchTerm}"
            </p>
          )}

          {filterProducts(products).map((product, i, arr) => {
            const isLast = i === arr.length - 1 && !searchTerm;
            return (
              <div
                key={product.id}
                ref={isLast ? lastProductRef : null}
                style={{ cursor: "pointer" }}
              >
                <ProductCard product={product} />
              </div>
            );
          })}

          {loading && !searchTerm &&
            Array(4).fill(null).map((_, i) => (
              <ProductCard key={`loading-${i}`} loading={true} />
            ))}
        </section>
      )}

          </div>
  );
};

export default Home;
