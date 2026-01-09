// src/layouts/SidebarLayout.jsx
import React from "react";
import Sidebar from "../components/Shared/SideBar";
import { Outlet } from "react-router-dom";

const SidebarLayout = () => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6">
        {/* Aquí se renderizan las rutas hijas */}
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
