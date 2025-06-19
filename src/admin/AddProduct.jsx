import React, { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import axios from "axios";

const FIXED_CATEGORIES = [
  "Groceries",
  "Home Appliances",
  "Sports",
  "Kid Stuff",
  "Medicines",
  "Electronics",
  "Others"
];

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image too large! Must be under 5MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadToCloudinary = async () => {
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

    if (!uploadPreset || !cloudName) {
      setStatus("❌ Missing Cloudinary config in .env file.");
      return null;
    }

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", uploadPreset);

    let attempts = 3;
    while (attempts > 0) {
      try {
        setStatus(`🚀 Uploading image... (Attempts left: ${attempts})`);
        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData
        );
        return res.data.secure_url;
      } catch (error) {
        console.warn(`Cloudinary upload failed, retrying... ${attempts - 1} attempts left`);
        attempts--;
        if (attempts === 0) {
          setStatus("❌ Cloudinary upload failed after retries.");
          return null;
        }
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.name.trim() || !product.price || !product.category || !imageFile) {
      return setStatus("❌ All fields and an image are required.");
    }

    setUploading(true);
    setStatus("🔄 Uploading...");

    const imageUrl = await uploadToCloudinary();
    if (!imageUrl) {
      setUploading(false);
      return;
    }

    try {
      await addDoc(collection(db, "products"), {
        name: product.name,
        price: parseFloat(product.price),
        description: product.description,
        category: product.category,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      setStatus("✅ Product added!");
      setProduct({ name: "", price: "", description: "", category: "" });
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Firestore error:", err);
      setStatus("❌ Failed to add product.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 500, margin: "auto" }}>
      <h2 style={{ marginBottom: 20 }}>📦 Add Product</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Product name"
          value={product.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={product.price}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          style={inputStyle}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={product.description}
          onChange={handleChange}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />

        {/* 🔥 Dropdown only - fixed categories */}
        <select
          name="category"
          value={product.category}
          onChange={handleChange}
          required
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="">-- Select Category --</option>
          {FIXED_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ marginBottom: 10 }}
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: 250,
              objectFit: "cover",
              borderRadius: 8,
              marginBottom: 10,
            }}
          />
        )}

        <button
          type="submit"
          disabled={uploading}
          style={{
            ...inputStyle,
            backgroundColor: uploading ? "#aaa" : "#4caf50",
            color: "#fff",
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? "Uploading..." : "Add Product"}
        </button>
      </form>

      {status && (
        <p
          style={{
            marginTop: 10,
            fontWeight: "bold",
            color: status.startsWith("✅") ? "green" : "red",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: 10,
  fontSize: 16,
  marginBottom: 12,
  borderRadius: 6,
  border: "1px solid #ccc",
};

export default AddProduct;
