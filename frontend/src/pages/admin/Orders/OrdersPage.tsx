// src/pages/admin/OrderManagementPage.tsx
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Spinner, Form } from "react-bootstrap";
import api from "../../../api/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatCurrency } from "../../../utils/format";

interface User { id: number; username: string; }
interface Variant { id: number; Product: { name: string }; size: string; color: string; }
interface OrderItem { id: number; Variant: Variant; quantity: number; price: number; }
interface Order {
  id: number;
  CustomerID: number;
  Customer: User;
  StaffID?: number;
  Staff?: User;
  status: string;
  payment_method: string;
  total: number;
  created_at: string;
  Items: OrderItem[];
}

const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdate, setStatusUpdate] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/orders");
      const data = Array.isArray(res.data?.data ?? res.data) ? res.data.data ?? res.data : [];
      setOrders(data);
    } catch (err: any) {
      toast.error("Failed to load orders: " + (err.response?.data?.error ?? err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const openDetail = async (orderId: number) => {
    try {
      const res = await api.get(`/api/admin/orders/${orderId}`);
      const order = res.data ?? res.data?.data;
      setSelectedOrder(order);
      setStatusUpdate(order.status);
      setShowDetailModal(true);
    } catch { toast.error("Failed to load order detail"); }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    try {
      await api.patch(`/api/admin/orders/${selectedOrder.id}/status`, { status: statusUpdate });
      toast.success("Order status updated");
      setShowDetailModal(false);
      loadOrders();
    } catch { toast.error("Failed to update status"); }
  };

  // Pagination logic
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getVisiblePages = () => {
    if (totalPages <= 2) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage === totalPages) return [totalPages - 1, totalPages];
    return [currentPage, currentPage + 1];
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [currentPage]);

  return (
    <div className="p-2">
      <ToastContainer />
      <h5>Order Management</h5>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Table striped bordered hover responsive className="table-sm shadow-sm bg-white rounded">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Staff</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted">No orders</td>
                </tr>
              ) : (
                paginatedOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>
                      <Button variant="link" onClick={() => openDetail(order.id)}>
                        {order.Customer?.username ?? `ID ${order.CustomerID}`}
                      </Button>
                    </td>
                    <td>{order.Staff?.username ?? order.StaffID ?? "-"}</td>
                    <td>{order.status}</td>
                    <td>{order.payment_method}</td>
                    <td>{formatCurrency(Number(order.total))}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td>
                      <Button variant="info" size="sm" onClick={() => openDetail(order.id)}>Details</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          <div className="d-flex align-items-center justify-content-end mt-3 gap-3">
            <div className="d-flex align-items-center gap-2">
              <span>Hiển thị</span>
              <select
                className="form-select"
                style={{ width: "70px" }}
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={50}>50</option>
              </select>
              <span>bản ghi / trang</span>
              <span className="ms-3">Tổng {totalPages} trang ({orders.length} bản ghi)</span>
            </div>

            <nav>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>‹</button>
                </li>

                {getVisiblePages().map(page => (
                  <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>›</button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Order Detail - ID {selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <p><strong>Customer:</strong> {selectedOrder.Customer?.username}</p>
              <p><strong>Staff:</strong> {selectedOrder.Staff?.username ?? "-"}</p>
              <p>
                <strong>Status:</strong>{" "}
                <Form.Select value={statusUpdate} onChange={e => setStatusUpdate(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </p>
              <p><strong>Payment:</strong> {selectedOrder.payment_method}</p>
              <p><strong>Total:</strong> {selectedOrder.total}</p>
              <hr />
              <h5>Items</h5>
              <Table striped bordered hover responsive size="sm">
                <thead className="table-secondary">
                  <tr>
                    <th>Product</th>
                    <th>Variant</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.Items.map(item => (
                    <tr key={item.id}>
                      <td>{item.Variant.Product?.name}</td>
                      <td>{item.Variant.size} - {item.Variant.color}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price}</td>
                      <td>{item.quantity * item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleStatusUpdate}>Update Status</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderManagementPage;
