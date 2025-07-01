import React, { useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { FiHome, FiBox, FiUsers, FiSettings, FiLogOut, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import UserList from "../components/UserList";

// --- Types ---
type Product = {
  id: number;
  name: string;
  category: string;
  imageUrl: string;
  price: number;
  description: string;
  status: "In Stock" | "Out of Stock";
};

// --- Context for Products ---
type ProductContextType = {
  products: Product[];
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: number, p: Omit<Product, "id">) => void;
  deleteProduct: (id: number) => void;
};
const ProductContext = React.createContext<ProductContextType | undefined>(undefined);

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Sample Product 1",
    category: "Toys",
    imageUrl: "",
    price: 10,
    description: "A fun toy for kids.",
    status: "In Stock",
  },
  {
    id: 2,
    name: "Sample Product 2",
    category: "Clothing",
    imageUrl: "",
    price: 20,
    description: "Comfortable baby clothing.",
    status: "Out of Stock",
  },
];

// --- Product Provider ---
const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);

  const addProduct = (p: Omit<Product, "id">) => {
    setProducts((prev) => [...prev, { ...p, id: Date.now() }]);
  };

  const updateProduct = (id: number, p: Omit<Product, "id">) => {
    setProducts((prev) => prev.map((prod) => (prod.id === id ? { ...p, id } : prod)));
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

const useProducts = () => {
  const ctx = React.useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used within ProductProvider");
  return ctx;
};

// --- Sidebar Layout ---
const Sidebar: React.FC<{ onNavigate: (section: string) => void; active: string }> = ({ onNavigate, active }) => (
  <aside className="w-64 bg-white shadow-lg min-h-screen flex flex-col">
    <div className="p-6 text-2xl font-bold text-pink-600 flex items-center gap-2">
      <FiBox className="inline-block" /> Admin Panel
    </div>
    <nav className="flex-1">
      <ul className="space-y-2 px-4">
        <li>
          <button className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg ${active === "dashboard" ? "bg-pink-100 text-pink-700" : "hover:bg-gray-100"}`} onClick={() => onNavigate("dashboard")}> <FiHome /> Dashboard Home </button>
        </li>
        <li>
          <button className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg ${active === "products" ? "bg-pink-100 text-pink-700" : "hover:bg-gray-100"}`} onClick={() => onNavigate("products")}> <FiBox /> Manage Products </button>
        </li>
        <li>
          <button className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg ${active === "users" ? "bg-pink-100 text-pink-700" : "hover:bg-gray-100"}`} onClick={() => onNavigate("users")}> <FiUsers /> Registered Users </button>
        </li>
        <li>
          <button className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg ${active === "settings" ? "bg-pink-100 text-pink-700" : "hover:bg-gray-100"}`} onClick={() => onNavigate("settings")}> <FiSettings /> Settings </button>
        </li>
        <li>
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100 text-red-600" onClick={() => onNavigate("logout")}> <FiLogOut /> Logout </button>
        </li>
      </ul>
    </nav>
  </aside>
);

// --- Dashboard Home ---
const DashboardHome: React.FC<{ userCount: number }> = ({ userCount }) => {
  const { products } = useProducts();
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2"><FiHome /> Dashboard</h2>
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 bg-gray-100 rounded-lg p-4 text-center shadow">
          <div className="text-3xl font-bold text-pink-700">{products.length}</div>
          <div className="text-gray-600 mt-2">Total Products</div>
        </div>
        <div className="flex-1 bg-blue-100 rounded-lg p-4 text-center shadow">
          <div className="text-3xl font-bold text-blue-700">{userCount}</div>
          <div className="text-gray-600 mt-2">Total Users</div>
        </div>
        <div className="flex-1 bg-green-100 rounded-lg p-4 text-center shadow">
          <div className="text-3xl font-bold text-green-700">{products.filter(p => p.status === "In Stock").length}</div>
          <div className="text-gray-600 mt-2">In Stock</div>
        </div>
        <div className="flex-1 bg-red-100 rounded-lg p-4 text-center shadow">
          <div className="text-3xl font-bold text-red-700">{products.filter(p => p.status === "Out of Stock").length}</div>
          <div className="text-gray-600 mt-2">Out of Stock</div>
        </div>
      </div>
    </div>
  );
};

// --- Product Form Modal ---
type ProductFormProps = {
  initial?: Omit<Product, "id">;
  onSubmit: (p: Omit<Product, "id">) => void;
  onClose: () => void;
  submitLabel: string;
};
const ProductForm: React.FC<ProductFormProps> = ({ initial, onSubmit, onClose, submitLabel }) => {
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [price, setPrice] = useState(initial?.price?.toString() || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [status, setStatus] = useState<Product["status"]>(initial?.status || "In Stock");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !price || !description) return;
    onSubmit({ name, category, imageUrl, price: Number(price), description, status });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{submitLabel}</h3>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Name</label>
          <input className="border rounded px-3 py-2 w-full" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Category</label>
          <input className="border rounded px-3 py-2 w-full" value={category} onChange={e => setCategory(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Image URL</label>
          <input className="border rounded px-3 py-2 w-full" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Price</label>
          <input type="number" className="border rounded px-3 py-2 w-full" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Description</label>
          <textarea className="border rounded px-3 py-2 w-full" value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Status</label>
          <select className="border rounded px-3 py-2 w-full" value={status} onChange={e => setStatus(e.target.value as Product["status"]) }>
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700">{submitLabel}</button>
          <button type="button" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

// --- Manage Products ---
const ManageProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FiBox /> Manage Products</h2>
        <button className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700" onClick={() => setShowAdd(true)}><FiPlus /> Add Product</button>
      </div>
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Image</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Price</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <tr key={p.id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="px-4 py-3">
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded" /> : <span className="text-gray-400">No Image</span>}
                </td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3">₹{p.price}</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800" onClick={() => setEditProduct(p)} title="Edit"><FiEdit /></button>
                  <button className="text-red-600 hover:text-red-800" onClick={() => deleteProduct(p.id)} title="Delete"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdd && <ProductForm submitLabel="Add Product" onSubmit={addProduct} onClose={() => setShowAdd(false)} />}
      {editProduct && <ProductForm initial={editProduct} submitLabel="Update Product" onSubmit={p => { updateProduct(editProduct.id, p); setEditProduct(null); }} onClose={() => setEditProduct(null)} />}
    </div>
  );
};

// --- Settings ---
const Settings: React.FC = () => (
  <div className="bg-white rounded-xl shadow p-6">
    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2"><FiSettings /> Settings</h2>
    <div className="text-gray-600">Settings page (optional content).</div>
  </div>
);

// --- Main Admin Panel ---
const AdminPanel: React.FC = () => {
  const [section, setSection] = useState("dashboard");
  const [userCount, setUserCount] = useState(0);

  // Fetch user count for dashboard
  React.useEffect(() => {
    fetch("http://localhost:5000/users")
      .then(res => res.json())
      .then(data => setUserCount(data.length))
      .catch(() => setUserCount(0));
  }, []);

  return (
    <ProductProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onNavigate={setSection} active={section} />
        <main className="flex-1 p-8">
          {section === "dashboard" && <DashboardHome userCount={userCount} />}
          {section === "products" && <ManageProducts />}
          {section === "users" && <UserList />}
          {section === "settings" && <Settings />}
          {section === "logout" && (
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2"><FiLogOut /> Logout</h2>
              <div className="text-gray-600 mb-4">You have been logged out.</div>
              <Link to="/" className="text-pink-600 hover:underline">Go to Home</Link>
            </div>
          )}
        </main>
      </div>
    </ProductProvider>
  );
};

export default AdminPanel;