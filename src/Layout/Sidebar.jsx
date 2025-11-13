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
import Logo from "../assets/t-logo.jpeg";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [hovered, setHovered] = useState(null);
  const location = useLocation();

  const userData = JSON.parse(localStorage.getItem("user"));
  console.log("userData", userData);

  const menuItems = [
    { key: "user", name: "User List", icon: <FaUserPlus />, path: "/users", color: "#FF6B6B" },
    { key: "clients", name: "Client Added", icon: <FaUsers />, path: "/client-added", color: "#FFA726" },
     { key: "product", name: "Product list", icon: <FaUsers />, path: "/product-list", color: "#FFA726" },
    { key: "quotation", name: "Quotation List", icon: <FaFileInvoice />, path: "/quotation-list", color: "#7E57C2" },
    { key: "orders", name: "Order List", icon: <FaListAlt />, path: "/order-list", color: "#26C6DA" },
    { key: "paymentreports", name: "Pending Payment Report", icon: <FaHourglassHalf />, path: "/pending-payment", color: "#EF5350" },
    { key: "paymentreports", name: "Payment Report", icon: <FaMoneyBillWave />, path: "/payment-report", color: "#66BB6A" },
    { key: "termsandcondition", name: "Terms & Conditions", icon: <FaFileAlt />, path: "/terms", color: "#29B6F6" },
    { key: "logout", name: "Logout", icon: <FaSignOutAlt />, path: "/", color: "#BDBDBD" },
  ];

  const sidebarStyle = {
    height: "100vh",
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
    borderRadius: "10px",
    fontSize: "14.5px",
    color: "#333",
    marginBottom: "6px",
    textDecoration: "none",
    fontWeight: "500",
    transition: "all 0.3s ease",
  };

  const handleLogout = ()=>{
    localStorage.clear("user");
    window.location.assign("/")
  }

  return (
    <div style={{ display: "flex" }}>
      <style>
        {`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background-color: #aaa; }
      `}
      </style>

      <div style={sidebarStyle}>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isOpen ? "space-between" : "center",
              marginBottom: "20px",
            }}
          >
            {isOpen && <img src={Logo} alt="loading..." style={{ width: "150px", height: "65px" }} />}
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

          <div
            style={{
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "#c1c1c1 transparent",
              paddingRight: "4px",
            }}
          >
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {menuItems
                .filter((item) => {
                  if (item.key === "logout") return true; 
                  return userData?.[item.key] === true;
                })
                .map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={index}>
                      <Link
                        to={item.path}
                         onClick={() => {
    if (item.key === "logout") handleLogout();
  }}
                        onMouseEnter={() => setHovered(index)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          ...menuItemBase,
                          background: isActive
                            ? item.color
                            : hovered === index
                            ? `${item.color}22`
                            : "transparent",
                          color: isActive ? "#fff" : "#333",
                          boxShadow: isActive
                            ? `0 3px 10px ${item.color}66`
                            : hovered === index
                            ? `0 2px 6px ${item.color}33`
                            : "none",
                          borderLeft: isActive ? `4px solid ${item.color}` : "4px solid transparent",
                          transform: hovered === index ? "translateX(3px)" : "translateX(0)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "17px",
                            color: isActive ? "#fff" : item.color,
                            transition: "color 0.3s ease",
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
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "#888",
            padding: "10px 0",
          }}
        >
          {isOpen && "© 2025 Your Company"}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
