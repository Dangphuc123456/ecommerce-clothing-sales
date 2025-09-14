import React, { useState, useRef, useEffect } from "react";
import {
  Navbar as BsNavbar,
  Container,
  Nav,
  Dropdown,
  Form,
  FormControl,
  Badge,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaEnvelope, FaBars, FaTimes } from "react-icons/fa";
import logo from "../../assets/logo.png";
import api from "../../api/axios";
import "./Navbar.css";

interface SearchResult {
  id: number;
  name: string;
  type: string;
}
const typeLabels: Record<string, string> = {
  product: "Sản phẩm",
  supplier: "Nhà cung cấp",
  category: "Loại",
  order: "Đơn hàng",
  purchase: "Phiếu nhập",
};

const Navbar: React.FC = () => {
  const [orderNotifications, setOrderNotifications] = useState(0);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const messageNotifications = 5;

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNavPanel, setShowNavPanel] = useState(false);

  // brightness
  const [brightness, setBrightness] = useState(100);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);

    if (timer.current) clearTimeout(timer.current);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/admin/search?q=${encodeURIComponent(value)}`);
        setResults(res.data || []);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      }
      setLoading(false);
    }, 300);
  };

  const handleSelect = (item: SearchResult) => {
    switch (item.type) {
      case "supplier":
        navigate(`/admin/suppliers/${item.id}`);
        break;
      case "category":
        navigate(`/admin/categories/${item.id}`);
        break;
      case "product":
        navigate(`/admin/products/${item.id}`);
        break;
      case "order":
        navigate(`/admin/orders/${item.id}`);
        break;
      case "purchase":
        navigate(`/admin/purchaseorders/${item.id}`);
        break;
      default:
        break;
    }
    setKeyword("");
    setShowDropdown(false);
    setShowNavPanel(false);
  };

  const handleBrightnessChange = (value: number) => {
    setBrightness(value);
    document.body.style.filter = `brightness(${value}%)`;
  };
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const res = await api.get("/api/admin/orders?status=pending");
        const orders = res.data?.data || [];
        setOrderNotifications(orders.length);   // badge hiển thị số lượng
        setPendingOrders(orders.slice(0, 5));   // tối đa 5 cái trong dropdown
      } catch (err) {
        console.error("Error fetching pending orders:", err);
      }
    };

    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 30000); // auto refresh mỗi 30s
    return () => clearInterval(interval);
  }, []);
  return (
    <BsNavbar
      expand="lg"
      className="shadow-sm"
      style={{
        backgroundColor: "navy",
        height: "95px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}>
      <Container fluid style={{ position: "relative" }}>
        <BsNavbar.Brand
          as={Link}
          to="/admin/dashboard"
          className="text-white d-flex align-items-center">
          <img
            src={logo}
            alt="Logo"
            style={{ maxWidth: "120px", height: "78px" }}
            className="d-inline-block align-top me-2 img-fluid"
          />
        </BsNavbar.Brand>

        {/* Nút toggle nav nhỏ */}
        <button
          className="btn btn-link text-white p-1 d-lg-none"
          aria-label="Mở menu"
          onClick={() => setShowNavPanel((s) => !s)}
          style={{ textDecoration: "none" }}>
          {showNavPanel ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        {/* Thanh nav desktop */}
        <div className="d-none d-lg-flex w-100">
          <div
            style={{ position: "relative", maxWidth: "400px", width: "100%" }}
            className="mx-auto my-2 my-lg-0">
            <Form className="d-flex">
              <FormControl
                type="search"
                placeholder="Tìm kiếm..."
                className="me-2"
                style={{ borderRadius: "4px", height: "40px" }}
                value={keyword}
                onChange={handleChange}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
            </Form>
            {showDropdown && (
              <ul
                className="list-group position-absolute w-100 mt-1 shadow"
                style={{ zIndex: 2000, maxHeight: "250px", overflowY: "auto" }}>
                {loading && (
                  <li className="list-group-item text-muted">Đang tìm...</li>
                )}
                {!loading && results.length === 0 && (
                  <li className="list-group-item text-muted">
                    Không có kết quả
                  </li>
                )}
                {!loading &&
                  results.map((item) => (
                    <li
                      key={`${item.type}-${item.id}`}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSelect(item)}
                      style={{ cursor: "pointer" }}>
                      <strong>{item.name}</strong>{" "}
                      <span className="text-muted">
                        ({typeLabels[item.type] || item.type})
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <Nav className="ms-auto d-flex align-items-center gap-3">
            {/* Thông báo đơn hàng */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="position-relative text-white"
                style={{ textDecoration: "none" }}
              >
                <FaBell size={20} />
                {orderNotifications > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute top-0 start-100 translate-middle"
                    style={{ fontSize: "0.6rem" }}
                  >
                    {orderNotifications}
                  </Badge>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ minWidth: "300px" }}>
                <Dropdown.Header>Đơn hàng chờ xử lý</Dropdown.Header>
                {pendingOrders.length === 0 && (
                  <Dropdown.Item>Không có đơn hàng</Dropdown.Item>
                )}
                {pendingOrders.map((order) => (
                  <Dropdown.Item
                    key={order.id}
                    onClick={() => {
                      navigate(`/admin/orders/${order.id}`);
                      // sau khi click thì gọi lại fetch để cập nhật số lượng
                    }}
                  >
                    #{order.id} - {order.customer?.username || "Khách"} ({order.status})
                  </Dropdown.Item>
                ))}
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/admin/orders">
                  Xem tất cả
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>


            {/* Thông báo tin nhắn */}
            <Nav.Link
              as={Link}
              to="/messages"
              className="position-relative text-white">
              <FaEnvelope size={20} />
              {messageNotifications > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: "0.6rem" }}>
                  {messageNotifications}
                </Badge>
              )}
            </Nav.Link>

            {/* Dropdown Admin */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                id="dropdown-small"
                style={{ backgroundColor: "white", color: "navy" }}>
                Admin
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.ItemText style={{ fontWeight: "bold" }}>
                  ⚙ Settings
                </Dropdown.ItemText>
                <Dropdown.Item
                  onClick={() => {
                    navigate("/admin/logs");
                    setShowNavPanel(false);
                  }}>
                  Login Logs
                </Dropdown.Item>

                <Dropdown.Item>
                  Brightness
                  <Form.Range
                    min={50}
                    max={150}
                    value={brightness}
                    onChange={(e) =>
                      handleBrightnessChange(Number(e.target.value))
                    } />
                </Dropdown.Item>

                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={() => {
                    handleLogout();
                    setShowNavPanel(false);
                  }}>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </div>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
