import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import logo from "./assets/t-logo.jpeg";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const ApiURL = "https://api.rentyourpc.com/api/master";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${ApiURL}/loginteammember`, {
        email,
        password,
      });

      if (response.status === 200) {
        toast.success("Login successful");
        const userData = response.data.user;
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/users");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Invalid credentials or server error";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #eef3ff, #dde6ff)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <Toaster position="top-center" />

      <div
        style={{
          display: "flex",
          width: "750px",
          maxWidth: "92vw",
          minHeight: "460px",
          background: "rgba(255,255,255,0.96)",
          borderRadius: "18px",
          boxShadow: "0 6px 28px rgba(0,0,0,0.1)",
          overflow: "hidden",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Left Side - Image Section */}
        <div
          style={{
            flex: 1,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.5)",
              padding: "18px 25px",
              borderRadius: "14px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            }}
          >
            <h2 style={{ fontWeight: 700, fontSize: "22px", marginBottom: "8px" }}>
              Reliable Laptop Rentals
            </h2>
            <p style={{ fontSize: "13px", color: "#ddd", margin: 0 }}>
              Power your business with top-quality laptops.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div
          style={{
            flex: 1,
            padding: "35px 30px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: "#ffffff",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "18px" }}>
            <img
              src={logo}
              alt="Logo"
              style={{
                width: "90px",
                height: "90px",
                objectFit: "contain",
                marginBottom: "8px",
              }}
            />
            <h3 style={{ fontWeight: 700, color: "#1a237e", margin: 0, fontSize: "20px" }}>
              Welcome Back
            </h3>
            <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              Sign in to manage rentals
            </p>
          </div>

          <Form onSubmit={handleSubmit} autoComplete="off">
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label style={{ fontWeight: 600, color: "#333", fontSize: "14px" }}>
                Email Address
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{
                  borderRadius: "8px",
                  border: "1px solid #ccd1ff",
                  fontSize: "14px",
                  padding: "10px",
                  transition: "0.3s",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label style={{ fontWeight: 600, color: "#333", fontSize: "14px" }}>
                Password
              </Form.Label>
              <div style={{ position: "relative" }}>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #ccd1ff",
                    fontSize: "14px",
                    padding: "10px 38px 10px 10px",
                    transition: "0.3s",
                  }}
                />
                <span
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#777",
                    fontSize: "16px",
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </Form.Group>

            <Button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                borderRadius: "8px",
                background: "linear-gradient(90deg, #3949ab, #5c6bc0)",
                border: "none",
                padding: "10px 0",
                color: "#fff",
                fontWeight: 600,
                fontSize: "15px",
                marginTop: "6px",
                boxShadow: "0 3px 10px rgba(63,81,181,0.3)",
                cursor: "pointer",
              }}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </Form>

          <p
            style={{
              textAlign: "center",
              marginTop: "16px",
              fontSize: "12px",
              color: "#666",
            }}
          >
            © 2025 Laptop Rental Service. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
