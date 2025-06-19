import React, { useState } from 'react';
import './ProductCard.css';
import OrderPanel from './OrderPanel';

const ProductCard = ({ product, loading }) => {
  const [showOrder, setShowOrder] = useState(false);

  if (loading) {
    return (
      <div className="product-card skeleton-card">
        <div className="skeleton skeleton-image shimmer" />
        <div className="skeleton skeleton-text shimmer title" />
        <div className="skeleton skeleton-text shimmer price" />
      </div>
    );
  }

  // 🔥 Calculate discounted price if offer is discount type
  const isDiscount = product.offer?.type === 'discount';
  const discountValue = parseFloat(product.offer?.value || 0);
  const originalPrice = parseFloat(product.price);
  const discountedPrice = isDiscount
    ? (originalPrice * (1 - discountValue / 100)).toFixed(2)
    : originalPrice;

  return (
    <>
      <div className="product-card">
        <img
          src={product.imageUrl || 'https://via.placeholder.com/220x180?text=No+Image'}
          alt={product.name}
          className="product-image"
        />
        <div className="product-title">{product.name}</div>

        {/* 🧨 Offer tag */}
        {product.offer && product.offer.type !== 'none' && (
          <div className="product-offer">
            {isDiscount
              ? `🔥 ${product.offer.value}% OFF`
              : product.offer.value}
          </div>
        )}

        {/* 💸 Pricing */}
        <div className="product-price">
          {isDiscount ? (
            <>
              <span className="discounted-price">Rs. {discountedPrice}</span>{' '}
              <span className="original-price">Rs. {originalPrice}</span>
            </>
          ) : (
            <>Rs. {originalPrice}</>
          )}
        </div>

        <button className="buy-now-btn" onClick={() => setShowOrder(true)}>Buy Now</button>
      </div>

      {showOrder && (
        <OrderPanel product={product} onClose={() => setShowOrder(false)} />
      )}
    </>
  );
};

export default ProductCard;
