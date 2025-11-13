import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="container-fluid" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="row">
        <div className="col-md-2">
        <Sidebar />

        </div>
        <div
          className="col-md-10"
          style={{
            backgroundColor: "#f6f8fb",
            minHeight: "100vh",
            padding: "20px",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;
