import React, { useState, createContext, useContext } from "react";
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";

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
const ProductContext = createContext<ProductContextType | undefined>(undefined);

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
    const [products, setProducts] = useState<Product[]>(initialProducts);

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
    const ctx = useContext(ProductContext);
    if (!ctx) throw new Error("useProducts must be used within ProductProvider");
    return ctx;
};

// --- Layout ---
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-gray-50 min-h-screen py-8">
    <div className="max-w-4xl mx-auto">
      <nav className="flex gap-8 mb-8 text-lg font-semibold">
        <Link to="/" className="hover:text-blue-600">Dashboard</Link>
        <Link to="/products" className="hover:text-blue-600">Manage Products</Link>
        <Link to="/add" className="hover:text-blue-600">Add Product</Link>
      </nav>
      <div>{children}</div>
    </div>
  </div>
);

// --- Dashboard Page ---
const Dashboard: React.FC = () => {
  const { products } = useProducts();
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h2>
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 bg-gray-100 rounded-lg p-4 text-center shadow">
          <div className="text-3xl font-bold text-blue-700">{products.length}</div>
          <div className="text-gray-600 mt-2">Total Products</div>
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

// --- Product List Page ---
const ManageProducts: React.FC = () => {
  const { products, deleteProduct } = useProducts();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Products</h2>
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
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded border" />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-400 rounded border">No Image</div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">
                  <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm">{p.category}</span>
                </td>
                <td className="px-4 py-3 font-semibold">₹{p.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${p.status === "In Stock" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 font-semibold" onClick={() => navigate(`/edit/${p.id}`)}>Edit</button>
                  <button className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 font-semibold" onClick={() => deleteProduct(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  <div className="mb-2 text-lg">No products found.</div>
                  <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold" onClick={() => navigate("/add")}>Add Product</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Product Form (Add/Edit) ---
type ProductFormProps = {
    initial?: Omit<Product, "id">;
    onSubmit: (p: Omit<Product, "id">) => void;
    submitLabel: string;
};
const ProductForm: React.FC<ProductFormProps> = ({ initial, onSubmit, submitLabel }) => {
    const [name, setName] = useState(initial?.name || "");
    const [category, setCategory] = useState(initial?.category || "");
    const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
    const [price, setPrice] = useState(initial?.price?.toString() || "");
    const [description, setDescription] = useState(initial?.description || "");
    const [status, setStatus] = useState<Product["status"]>(initial?.status || "In Stock");
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const validate = () => {
        const errs: { [k: string]: string } = {};
        if (!name.trim()) errs.name = "Name is required";
        if (!category.trim()) errs.category = "Category is required";
        if (!price.trim() || isNaN(Number(price)) || Number(price) < 0) errs.price = "Valid price required";
        if (!description.trim()) errs.description = "Description required";
        if (!status) errs.status = "Status required";
        return errs;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length) return;
        onSubmit({
            name: name.trim(),
            category: category.trim(),
            imageUrl: imageUrl.trim(),
            price: Number(price),
            description: description.trim(),
            status,
        });
    };

    return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 max-w-lg mx-auto mt-8">
      <div className="mb-4">
        <label className="block font-semibold mb-1">Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400" />
        {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Category</label>
        <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400" />
        {errors.category && <div className="text-red-500 text-xs mt-1">{errors.category}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Image URL</label>
        <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400" />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Price</label>
        <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400" min={0} />
        {errors.price && <div className="text-red-500 text-xs mt-1">{errors.price}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400 min-h-[60px]" />
        {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Stock Status</label>
        <select value={status} onChange={e => setStatus(e.target.value as Product["status"])} className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400">
          <option value="In Stock">In Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
        {errors.status && <div className="text-red-500 text-xs mt-1">{errors.status}</div>}
      </div>
      <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold mt-4">{submitLabel}</button>
    </form>
    );
};

// --- Add Product Page ---
const AddProduct: React.FC = () => {
    const { addProduct } = useProducts();
    const navigate = useNavigate();

    return (
        <div>
            <h2>Add Product</h2>
            <ProductForm
                onSubmit={(p) => {
                    addProduct(p);
                    navigate("/products");
                }}
                submitLabel="Add Product"
            />
        </div>
    );
};

// --- Edit Product Page ---
const EditProduct: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { products, updateProduct } = useProducts();
    const navigate = useNavigate();
    const product = products.find((p) => p.id === Number(id));

    if (!product) return <div>Product not found.</div>;

    return (
        <div>
            <h2>Edit Product</h2>
            <ProductForm
                initial={product}
                onSubmit={(p) => {
                    updateProduct(product.id, p);
                    navigate("/products");
                }}
                submitLabel="Update Product"
            />
        </div>
    );
};

// --- Main App ---
const AdminPanel: React.FC = () => (
    <ProductProvider>
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<ManageProducts />} />
                <Route path="/add" element={<AddProduct />} />
                <Route path="/edit/:id" element={<EditProduct />} />
            </Routes>
        </Layout>
    </ProductProvider>
);

export default AdminPanel;