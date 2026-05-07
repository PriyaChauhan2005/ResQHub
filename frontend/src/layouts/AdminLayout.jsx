import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="h-screen bg-[#0b1420] text-slate-100 flex">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-[#0b1420] to-[#0e1c2f]">
          <Outlet />
        </div>

      </div>
    </div>
  );
}