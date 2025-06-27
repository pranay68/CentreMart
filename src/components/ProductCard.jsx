import React, { useState } from 'react';
import './ProductCard.css';
import OrderPanel from './OrderPanel';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';

const ProductCard = ({ product, loading }) => {
  const [showOrder, setShowOrder] = useState(false);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Add to recently viewed
  const addToRecentlyViewed = async () => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          recentlyViewed: arrayUnion({
            productId: product.id,
            viewedAt: new Date()
          })
        });
      } catch (error) {
        console.error('Error adding to recently viewed:', error);
      }
    } else {
      // Store in localStorage for guest users
      const recentlyViewed = JSON.parse(localStorage.getItem('centremart_recently_viewed') || '[]');
      const filtered = recentlyViewed.filter(item => item.productId !== product.id);
      const updated = [{ productId: product.id, viewedAt: new Date() }, ...filtered].slice(0, 10);
      localStorage.setItem('centremart_recently_viewed', JSON.stringify(updated));
    }
  };

  const handleProductClick = () => {
    addToRecentlyViewed();
    setShowOrder(true);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  if (loading) {
    return (
      <div className="product-card skeleton-card">
        <div className="skeleton skeleton-image shimmer" />
        <div className="skeleton skeleton-text shimmer title" />
        <div className="skeleton skeleton-text shimmer price" />
      </div>
    );
  }

  // Calculate discounted price if offer is discount type
  const isDiscount = product.offer?.type === 'discount';
  const discountValue = parseFloat(product.offer?.value || 0);
  const originalPrice = parseFloat(product.price);
  const discountedPrice = isDiscount
    ? (originalPrice * (1 - discountValue / 100)).toFixed(2)
    : originalPrice;

  return (
    <>
      <div className="product-card" onClick={handleProductClick}>
        <div className="product-card-header">
          <button 
            className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
            onClick={handleWishlistToggle}
          >
            {isInWishlist(product.id) ? '❤️' : '🤍'}
          </button>
        </div>
        
        <img
          src={product.imageUrl || 'https://via.placeholder.com/220x180?text=No+Image'}
          alt={product.name}
          className="product-image"
        />
        <div className="product-title">{product.name}</div>

        {/* Offer tag */}
        {product.offer && product.offer.type !== 'none' && (
          <div className="product-offer">
            {isDiscount
              ? `🔥 ${product.offer.value}% OFF`
              : product.offer.value}
          </div>
        )}

        {/* Pricing */}
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

        <div className="product-actions">
          <button className="buy-now-btn" onClick={handleProductClick}>Buy Now</button>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
        </div>
      </div>

      {showOrder && (
        <OrderPanel product={product} onClose={() => setShowOrder(false)} />
      )}
    </>
  );
};

export default ProductCard;