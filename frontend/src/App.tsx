import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth pages
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import CompletePage from "./pages/auth/CompletePage";
import FailPage from "./pages/auth/FailPage";

// Admin layout & pages
import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./pages/admin/Dashboard/DashboardPage";
import UsersPage from "./pages/admin/Users/UsersPage";
import ProductsPage from "./pages/admin/Products/ProductsPage";
import SuppliersPage from "./pages/admin/Supplier/SupplierPage";
import PurchaseOrdersPage from "./pages/admin/PurchaseOrders/PurchaseOrdersPage";
import OrdersPage from "./pages/admin/Orders/OrdersPage";
import InventoryLogsPage from "./pages/admin/Inventorylog/InventoryLogPage";
import SupplierDetailPage from "./pages/admin/Supplier/SupplierDetailPage";
import CategoryPage from "./pages/admin/Category/CategoryPage";
import CategoryDetailPage from "./pages/admin/Category/CategoryDetailPage";
import ProductDetailPage from "./pages/admin/Products/ProductsDetailPage";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Auth routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/complete" element={<CompletePage />} />
        <Route path="/register/failpage" element={<FailPage />} />

        {/* Admin routes */}
        <Route path="/admin/*" element={<MainLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="suppliers/:id" element={<SupplierDetailPage />} />

          <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="categories/:id" element={<CategoryDetailPage />} />
          <Route path="inventory-logs" element={<InventoryLogsPage />} />
        </Route>

        {/* Redirect all unknown routes */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
