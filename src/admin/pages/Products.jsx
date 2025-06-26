import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';
import axios from 'axios';

const CATEGORIES = [
  'Groceries', 'Home Appliances', 'Sports', 'Kid Stuff', 
  'Medicines', 'Electronics', 'Fashion', 'Books', 'Others'
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Single product form
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Bulk upload
  const [bulkData, setBulkData] = useState('');
  const [bulkUploading, setBulkUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const uploadToCloudinary = async (file) => {
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

    if (!uploadPreset || !cloudName) {
      throw new Error('Missing Cloudinary configuration');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData
    );
    return response.data.secure_url;
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.category || !imageFile) {
      toast.error('Please fill all fields and select an image');
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(imageFile);
      
      await addDoc(collection(db, 'products'), {
        name: productForm.name,
        price: parseFloat(productForm.price),
        description: productForm.description,
        category: productForm.category,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      toast.success('Product added successfully!');
      setShowAddModal(false);
      setProductForm({ name: '', price: '', description: '', category: '' });
      setImageFile(null);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setUploading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkData.trim()) {
      toast.error('Please enter product data');
      return;
    }

    setBulkUploading(true);
    try {
      const lines = bulkData.trim().split('\n');
      const products = [];

      for (const line of lines) {
        const parts = line.split('|').map(part => part.trim());
        if (parts.length >= 4) {
          const [name, price, description, category, imageUrl] = parts;
          products.push({
            name,
            price: parseFloat(price) || 0,
            description,
            category: CATEGORIES.includes(category) ? category : 'Others',
            imageUrl: imageUrl || 'https://via.placeholder.com/300x200?text=No+Image',
            createdAt: serverTimestamp(),
          });
        }
      }

      // Add products in batches
      for (const product of products) {
        await addDoc(collection(db, 'products'), product);
      }

      toast.success(`Successfully added ${products.length} products!`);
      setShowBulkModal(false);
      setBulkData('');
      fetchProducts();
    } catch (error) {
      console.error('Error bulk uploading:', error);
      toast.error('Failed to bulk upload products');
    } finally {
      setBulkUploading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast.success('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowBulkModal(true)} variant="outline">
            📤 Bulk Upload
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            ➕ Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <Card.Content className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </Card.Content>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} hover>
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/300x200'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-xl"
              />
            </div>
            <Card.Content className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-primary-600">
                  Rs. {product.price?.toLocaleString()}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
            </Card.Content>
            <Card.Footer className="p-4 pt-0">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="danger" 
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  Delete
                </Button>
              </div>
            </Card.Footer>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found</p>
        </div>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Product"
        size="lg"
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <Input
            label="Product Name"
            value={productForm.name}
            onChange={(e) => setProductForm({...productForm, name: e.target.value})}
            required
          />
          <Input
            label="Price"
            type="number"
            step="0.01"
            value={productForm.price}
            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={productForm.category}
              onChange={(e) => setProductForm({...productForm, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" loading={uploading} className="flex-1">
              Add Product
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Upload Products"
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Format Instructions:</h4>
            <p className="text-sm text-blue-700 mb-2">
              Enter one product per line in this format:
            </p>
            <code className="text-xs bg-blue-100 p-2 rounded block">
              Product Name | Price | Description | Category | Image URL (optional)
            </code>
            <p className="text-xs text-blue-600 mt-2">
              Available categories: {CATEGORIES.join(', ')}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Data
            </label>
            <textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              rows={10}
              placeholder="iPhone 14 | 999 | Latest iPhone model | Electronics | https://example.com/image.jpg
Samsung TV | 599 | 55 inch Smart TV | Electronics
Nike Shoes | 129 | Running shoes | Fashion"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleBulkUpload} 
              loading={bulkUploading} 
              className="flex-1"
            >
              Upload Products
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowBulkModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;