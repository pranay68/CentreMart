import React, { useState } from 'react';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (password === 'im_admin@') {
      onLogin(true);
    } else {
      setError('Wrong password, try again.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 10 }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AdminLogin;
