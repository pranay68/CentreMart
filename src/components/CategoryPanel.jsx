import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import './CategoryPanel.css';

const CategoryPanel = ({ title = '', products = [] }) => {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="category-panel">
      <div className="category-header">
        <h2 className="category-title">🔥 {title}</h2>
        <Link 
          to={`/category/${encodeURIComponent(title.toLowerCase())}`} 
          className="see-all-btn"
        >
          See All →
        </Link>
      </div>

      <div className="product-grid">
        {products.slice(0, 4).map(product => (
          <div key={product.id || product.name} className="product-wrapper">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryPanel;
