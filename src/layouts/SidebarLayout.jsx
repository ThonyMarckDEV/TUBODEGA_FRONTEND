// src/layouts/SidebarLayout.jsx
import React from "react";
import Sidebar from "../components/Shared/SideBar";
import { Outlet } from "react-router-dom";

const SidebarLayout = () => {
  return (
    <div className="min-h-screen flex bg-slate-50 overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-w-0">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default SidebarLayout;
