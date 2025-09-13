
// src/components/layout/MainLayout.tsx
import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Navbar cố định */}
      <Navbar />

      {/* Sidebar + Nội dung */}
      <div className="d-flex" style={{ paddingTop: "95px" }}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main
          className="flex-grow-1 p-4 overflow-auto"
          style={{
            marginLeft: collapsed ? "50px" : "180px", // bằng với width của sidebar
            transition: "margin-left 0.3s",
          }}
        >
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default MainLayout;
