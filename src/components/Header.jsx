import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './auth/AuthModal';
import Button from './ui/Button';

const Header = ({ searchTerm, setSearchTerm }) => {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  const handleAuthClick = (tab) => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="home-header">
        <Link to="/" className="no-underline">
          <h1>🛒 Centre Mart</h1>
        </Link>
        
        <div className="flex items-center gap-4">
          <input
            className="search-bar"
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/account" className="text-white hover:text-blue-300 transition-colors">
                  👤 {user.displayName || 'Account'}
                </Link>
                <Link to="/wishlist" className="text-white hover:text-blue-300 transition-colors">
                  ❤️ Wishlist
                </Link>
                <Link to="/cart" className="text-white hover:text-blue-300 transition-colors relative">
                  🛒 Cart
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </Link>
                <Button size="sm" variant="outline" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/cart" className="text-white hover:text-blue-300 transition-colors relative">
                  🛒 Cart
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </Link>
                <Button size="sm" onClick={() => handleAuthClick('login')}>
                  Login
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAuthClick('signup')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultTab={authTab}
      />
    </>
  );
};

export default Header;