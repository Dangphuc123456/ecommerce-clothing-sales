// src/pages/admin/OrderDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Form, InputGroup, Button } from "react-bootstrap";
import api from "../../../api/axios";
import { formatCurrency, formatPhone } from "../../../utils/format";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  variant: {
    id: number;
    size: string;
    color: string;
    product: {
      id: number;
      name: string;
    };
  };
}

interface Order {
  id: number;
  status: string;
  payment_method: string;
  total: number;
  created_at: string;
  customer: {
    id: number;
    username: string;
    email: string;
    phone: string;
  };
  staff?: {
    id: number;
    username: string;
  };
  items: OrderItem[];
}

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const copyToClipboard = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/admin/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Error fetching order detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="container my-4">
      <h2>Chi tiết đơn hàng #{order.id}</h2>
      <div className="row mt-4">
        {/* Left: Order Info */}
        <div className="col-md-4">
          <Card className="shadow-sm p-3 mb-3">
            <Card.Body>
              <h5 className="text-info mb-3">Thông tin đơn hàng</h5>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Order ID</Form.Label>
                  <Form.Control type="text" value={order.id} readOnly />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Control type="text" value={order.status} readOnly />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Control type="text" value={order.payment_method} readOnly />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Total</Form.Label>
                  <Form.Control type="text" value={formatCurrency(order.total)} readOnly />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Created At</Form.Label>
                  <Form.Control
                    type="text"
                    value={new Date(order.created_at).toLocaleString()}
                    readOnly
                  />
                </Form.Group>

                <h6 className="text-success mt-3">Khách hàng</h6>

                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" value={order.customer.username} readOnly />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <InputGroup>
                    <Form.Control type="text" value={formatPhone(order.customer.phone)} readOnly />
                    <Button variant="outline-secondary" onClick={() => copyToClipboard(order.customer.phone)}>
                      Copy
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <InputGroup>
                    <Form.Control type="email" value={order.customer.email} readOnly />
                    <Button variant="outline-secondary" onClick={() => copyToClipboard(order.customer.email)}>
                      Copy
                    </Button>
                  </InputGroup>
                </Form.Group>

                {order.staff && (
                  <>
                    <h6 className="text-info mt-3">Nhân viên xử lý</h6>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control type="text" value={order.staff.username} readOnly />
                    </Form.Group>
                  </>
                )}
              </Form>
            </Card.Body>
          </Card>
        </div>

        {/* Right: Order Items */}
        <div className="col-md-8">
          <Card className="shadow-sm p-3">
            <Card.Body>
              <h5 className="text-warning mb-3">Các sản phẩm trong đơn</h5>
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Color</th>
                    <th>Size</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td>{item.variant.product.name}</td>
                      <td>{item.variant.color}</td>
                      <td>{item.variant.size}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
