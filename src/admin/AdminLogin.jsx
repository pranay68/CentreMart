import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.username === 'admin' && credentials.password === 'im_admin@') {
      onLogin(true);
    } else {
      setError('Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <Card.Content className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Centre Mart</h1>
            <p className="text-gray-600">Admin Panel Login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              placeholder="Enter your username"
              required
            />

            <Input
              label="Password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="Enter your password"
              required
              error={error}
            />

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Demo Credentials:</p>
            <p>Username: <code className="bg-gray-100 px-1 rounded">admin</code></p>
            <p>Password: <code className="bg-gray-100 px-1 rounded">im_admin@</code></p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminLogin;