import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaUserPlus,
  FaUsers,
  FaClipboardList,
  FaListAlt,
  FaFileSignature,
  FaFileInvoice,
  FaHourglassHalf,
  FaMoneyBillWave,
  FaFileAlt,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: "User Added", icon: <FaUserPlus />, path: "/user-added", color: "#FF6B6B" },
    { name: "Client Added", icon: <FaUsers />, path: "/client-added", color: "#FFA726" },
    { name: "Add Orders", icon: <FaClipboardList />, path: "/add-orders", color: "#42A5F5" },
    { name: "Order List", icon: <FaListAlt />, path: "/order-list", color: "#26C6DA" },
    { name: "Add Quotation", icon: <FaFileSignature />, path: "/add-quotation", color: "#AB47BC" },
    { name: "Quotation List", icon: <FaFileInvoice />, path: "/quotation-list", color: "#7E57C2" },
    { name: "Pending Payment Report", icon: <FaHourglassHalf />, path: "/pending-payment", color: "#EF5350" },
    { name: "Payment Report", icon: <FaMoneyBillWave />, path: "/payment-report", color: "#66BB6A" },
    { name: "Terms & Conditions", icon: <FaFileAlt />, path: "/terms", color: "#29B6F6" },
    { name: "Logout", icon: <FaSignOutAlt />, path: "/logout", color: "#BDBDBD" },
  ];

  

  const sidebarStyle = {
    height: "120vh",
    width: isOpen ? "240px" : "75px",
    background: "linear-gradient(180deg, #f9fafc 0%, #ffffff 100%)",
    boxShadow: "0 0 15px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    padding: "15px 12px",
    fontFamily: "'Poppins', sans-serif",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 999,
    
  };

  const menuItemBase = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "12px",
    fontSize: "14.5px",
    color: "#333",
    marginBottom: "6px",
    textDecoration: "none",
    fontWeight: "500",
    transition: "all 0.3s ease",
      overflowY: "auto",
  scrollbarWidth: "thin", 
  scrollbarColor: "#c1c1c1 transparent", 
  };

  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ display: "flex" }}>
     
      <div style={sidebarStyle}>
        <div>
 
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isOpen ? "space-between" : "center",
              marginBottom: "25px",
            }}
          >
            {isOpen && (
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#2E3A59" }}>Dashboard</h2>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#2E3A59",
                fontSize: "18px",
              }}
            >
              <FaBars />
            </button>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      ...menuItemBase,
                      background:
                        isActive || hovered === index
                          ? `linear-gradient(90deg, ${item.color} 0%, #ffffff 100%)`
                          : "transparent",
                      color: isActive ? "#fff" : "#333",
                      boxShadow:
                        isActive || hovered === index
                          ? `0 2px 8px ${item.color}50`
                          : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "17px",
                        color: isActive || hovered === index ? "#fff" : item.color,
                      }}
                    >
                      {item.icon}
                    </span>
                    {isOpen && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>


        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "#888",
            paddingBottom: "10px",
          }}
        >
          {isOpen && "© 2025 Your Company"}
        </div>
      </div>

 
      <div
        style={{
          marginLeft: isOpen ? "240px" : "75px",
          flexGrow: 1,
          transition: "all 0.3s ease",
          backgroundColor: "#f6f8fb",
          minHeight: "100vh",
        }}
      >
       
        <div
          style={{
            height: "60px",
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: "500", color: "#333" }}>
            Welcome, Admin
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="https://i.pravatar.cc/40"
              alt="profile"
              style={{
                borderRadius: "50%",
                width: "35px",
                height: "35px",
                border: "2px solid #42A5F5",
              }}
            />
          </div>
        </div>

    
        <div style={{ padding: "20px", fontSize: "15px", color: "#333" }}>
          <h2>Dashboard Content Area</h2>
          <p>This is where your page content will appear.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
