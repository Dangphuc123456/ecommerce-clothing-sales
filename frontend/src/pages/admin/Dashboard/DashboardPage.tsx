import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  type ChartOptions,
} from "chart.js";
import { Spinner } from "react-bootstrap";

// register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// ------------------- Interfaces -------------------
interface User { id: number; username: string; role: string; }
interface Order { id: number; total: number; quantity: number; status: string; created_at: string; }
interface Purchase { id: number; variant_id: number; quantity: number; total: number; created_at: string; }

// ------------------- Injected styles (tight gutters) -------------------
const injectedStyles = `
/* Compact dashboard: giảm lề trái/phải, thu gọn khoảng cách */
.dashboard-fluid { padding-left: 12px; padding-right: 12px; }
.dashboard-inner { max-width: 1300px; margin: 0 auto; }
.dashboard-header { padding: 6px 0 12px 0; }
.dashboard-title { font-size: 1.25rem; letter-spacing: 0.2px; }

.quick-card .card { min-height: 84px; border-radius: 8px; }
.quick-card .card-body { padding: 10px 12px; }
.card .card-title { font-size: 0.85rem; margin-bottom: 6px; }
.card .metric { font-size: 1.15rem; font-weight: 600; }
.chart-card .card-body { padding: 14px; }
.pie-wrap { display:flex; align-items:center; justify-content:center; height:100%; }
.chart-area { width:100%; height:100%; }

/* ---- status legend: horizontal, taller boxes ---- */
.status-legend {
  display:flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: 12px;
}
.status-item {
  display:flex;
  align-items:center;
  gap: 12px;
  min-width: 150px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(0,0,0,0.03);
  box-shadow: 0 4px 10px rgba(16,24,40,0.03);
  height: 56px; /* tăng chiều cao như bạn yêu cầu */
}
.status-color {
  width: 16px;
  height: 36px; /* ô màu cao hơn */
  border-radius: 6px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
.status-label { font-size: 0.92rem; font-weight: 600; }
.status-count { margin-left: auto; font-size: 0.95rem; font-weight: 700; }

/* responsive nhỏ */
@media (max-width: 767.98px) {
  .dashboard-inner { padding-left: 6px; padding-right: 6px; }
  .quick-card .card-body { padding: 8px; }
  .status-item { min-width: 48%; }
}
`;

// ------------------- Helpers -------------------
const fmtCurrency = (v: number) =>
  v >= 0 ? `${v.toLocaleString("vi-VN")}₫` : `${Math.abs(v).toLocaleString("vi-VN")}₫`;

const fmtMoneyCompact = (v: number | string) => {
  const n = Number(v);
  if (n >= 1_000_000_000) {
    return `${Math.round(n / 1_000_000_000)}B`;
  } else if (n >= 1_000_000) {
    return `${Math.round(n / 1_000_000)}M`;
  }
  return `${n.toLocaleString("vi-VN")}₫`;
};

// ------------------- Component -------------------
const DashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // inject styles once
  useEffect(() => {
    if (!document.getElementById("dashboard-tight-styles")) {
      const s = document.createElement("style");
      s.id = "dashboard-tight-styles";
      s.innerHTML = injectedStyles;
      document.head.appendChild(s);
    }
  }, []);

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, ordersRes, purchasesRes] = await Promise.all([
          api.get("/api/admin/users"),
          api.get("/api/admin/orders"),
          api.get("/api/admin/purchases"),
        ]);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setPurchases(Array.isArray(purchasesRes.data) ? purchasesRes.data : []);
      } catch (e) {
        setError("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;

  // ----- metrics -----
  const totalOrders = orders.length;
  const totalCustomers = users.filter((u) => u.role === "customer").length;
  const totalRevenue = orders
    .filter((o) => o.status === "completed" || o.status === "shipped")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalPurchasesValue = purchases.reduce((sum, p) => sum + (Number(p.total) || 0), 0);

  const cards = [
    { title: "Tổng đơn hàng", value: totalOrders, bg: "bg-primary" },
    { title: "Tổng khách hàng", value: totalCustomers, bg: "bg-success" },
    { title: "Tổng tiền nhập", value: fmtCurrency(totalPurchasesValue), bg: "bg-warning text-dark" },
    { title: "Tổng doanh thu", value: fmtCurrency(totalRevenue), bg: "bg-danger" },
  ];

  // ----- pie: order statuses -----
  const statuses = ["pending", "confirmed", "shipped", "completed", "cancelled"];
  const statusCounts: Record<string, number> = {};
  statuses.forEach((s) => (statusCounts[s] = 0));
  orders.forEach((o) => {
    if (o.status && o.status in statusCounts) statusCounts[o.status]++;
  });
  const pieData = {
    labels: statuses.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [
      {
        label: "Trạng thái đơn hàng",
        data: statuses.map((s) => statusCounts[s]),
        backgroundColor: ["#ffc107", "#0d6efd", "#28a745", "#6f42c1", "#dc3545"],
        hoverOffset: 8,
      },
    ],
  };

  // ----- months / line / bar data -----
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => `${currentYear}-${String(i + 1).padStart(2, "0")}`);
  const getMonthKey = (d: string | Date) => {
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return "invalid";
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
  };

  const monthLabelsShort = months.map((m) => {
    const [y, mm] = m.split("-");
    return new Date(Number(y), Number(mm) - 1).toLocaleString("vi-VN", { month: "short" });
  });

  const lineData = {
    labels: monthLabelsShort,
    datasets: [
      {
        label: "Tiền nhập",
        data: months.map((month) =>
          purchases
            .filter((p) => getMonthKey(p.created_at) === month)
            .reduce((s, p) => s + (Number(p.total) || 0), 0)
        ),
        borderColor: "#0d6efd",
        backgroundColor: "#0d6efd33",
        tension: 0.32,
        pointRadius: 2,
        fill: true,
      },
      {
        label: "Tiền bán",
        data: months.map((month) =>
          orders
            .filter((o) => (o.status === "completed" || o.status === "shipped") && getMonthKey(o.created_at) === month)
            .reduce((s, o) => s + (Number(o.total) || 0), 0)
        ),
        borderColor: "#28a745",
        backgroundColor: "#28a74533",
        tension: 0.32,
        pointRadius: 2,
        fill: true,
      },
    ],
  };

  // ----- ChartOptions with explicit types to avoid TS 'options' errors -----
  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) => {
            const v = context.parsed.y ?? context.parsed;
            return `${context.dataset.label}: ${fmtCurrency(Number(v) || 0)}`;
          },
        },
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 12 },
      },
      y: {
        type: "linear",
        min: 0,
        max: 5_000_000_000,
        beginAtZero: false,
        grid: { display: true },
        ticks: {
          stepSize: 100_000_000,
          callback: (v: number | string) => fmtMoneyCompact(v),
        },
      },
    },
  };

  const barData = {
    labels: monthLabelsShort,
    datasets: [
      {
        label: "Số lượng nhập",
        data: months.map((month) =>
          purchases.filter((p) => getMonthKey(p.created_at) === month).reduce((s, p) => s + (Number(p.quantity) || 0), 0)
        ),
        backgroundColor: "#0d6efd99",
      },
      {
        label: "Số lượng bán",
        data: months.map((month) =>
          orders.filter((o) => (o.status === "completed" || o.status === "shipped") && getMonthKey(o.created_at) === month).reduce((s, o) => s + (Number(o.quantity) || 0), 0)
        ),
        backgroundColor: "#28a74599",
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y ?? context.parsed}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { autoSkip: true, maxTicksLimit: 12 },
      },
      y: {
        type: "linear",
        min: 0,
        max: 8000,
        beginAtZero: false,
        grid: { display: true },
        ticks: {
          stepSize: 200,
          callback: (v: number | string) => `${v}`,
        },
      },
    },
  };

  // ----- Render -----
  return (
    <div className="dashboard-fluid">
      <div className="dashboard-inner">
        <div className="dashboard-header d-flex align-items-center justify-content-between">
          <div>
            <h5 className="dashboard-title">Dashboard</h5>
          </div>
        </div>

        {/* Quick metrics */}
        <div className="row quick-card gx-2 gy-2 mb-3">
          {cards.map((c, i) => (
            <div className="col-6 col-sm-4 col-md-3" key={i}>
              <div className={`card ${c.bg}`}>
                <div className="card-body text-center text-white">
                  <div className="card-title">{c.title}</div>
                  <div className="metric mt-1">{c.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts top row */}
        <div className="row gx-2 gy-3">
          <div className="col-lg-4 col-md-6">
            <div className="card chart-card " style={{ height: "490px" }}>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Order Status Overviews</h5>
                <div style={{ height: 440 }} className="pie-wrap mt-2">
                  <div className="chart-area">
                    <Pie data={pieData} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-8 col-md-6">
            <div className="card chart-card" style={{ height: "490px" }}>
              <div className="card-body">
                <h5 className="card-title">Revenue Flow: Purchases and Sales</h5>
                <div style={{ height: 440 }} className="mt-2">
                  <Line data={lineData} options={lineOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width bar */}
        <div className="row mt-3 gx-2">
          <div className="col-12">
            <div className="card chart-card" style={{ height: "490px" }}>
              <div className="card-body">
                <h5 className="card-title">Sales/Purchases chart</h5>
                <div style={{ height: 440 }} className="mt-2">
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
