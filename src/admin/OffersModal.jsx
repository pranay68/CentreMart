// OffersModal.jsx
import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const OffersModal = ({ product, onClose, onOfferUpdated }) => {
  const [offerType, setOfferType] = useState(product.offer?.type || 'none');
  const [offerValue, setOfferValue] = useState(product.offer?.value || 0);
  const [expiresAt, setExpiresAt] = useState(product.offer?.expiresAt || '');

  const saveOffer = async () => {
    const offer = {
      type: offerType,
      value: parseFloat(offerValue),
      expiresAt: expiresAt || null,
    };

    try {
      await updateDoc(doc(db, 'products', product.id), { offer });
      alert('Offer updated!');
      onOfferUpdated(); // refresh list
      onClose();        // close modal
    } catch (err) {
      console.error('Error updating offer:', err);
      alert('Failed to update offer');
    }
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h3>🎯 Manage Offer - {product.name}</h3>
        <label>
          Type:
          <select value={offerType} onChange={e => setOfferType(e.target.value)}>
            <option value="none">None</option>
            <option value="discount">Discount</option>
            <option value="custom">Custom Text</option>
          </select>
        </label>
        <br />
        <label>
          Value (% or message):
          <input
            type="text"
            value={offerValue}
            onChange={e => setOfferValue(e.target.value)}
          />
        </label>
        <br />
        <label>
          Expiry Date:
          <input
            type="date"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
          />
        </label>
        <br />
        <button onClick={saveOffer}>💾 Save Offer</button>
        <button onClick={onClose} style={{ marginLeft: 10 }}>❌ Cancel</button>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: 'white',
    padding: 20,
    borderRadius: 8,
    width: 400,
  },
};

export default OffersModal;
