import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Form,
  Button,
  Badge,
  Modal,
  Row,
  Col,
  Pagination,
} from "react-bootstrap";
import { FaBox, FaEdit, FaTrashAlt, FaPlus, FaInfoCircle } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Product() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    productName: "",
    productType: "",
    brandName: "",
    price: "",
    depositAmount: "",
    quantity: "",
    availableQty: "",
    systemNumber: "",
    serialNumber: "",
    description: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 5;

  const API_URL = "https://api.rentyourpc.com/api/product";

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/getallproducts`);
      setProducts(res.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "quantity") {
      setForm((prev) => ({
        ...prev,
        quantity: value,
        availableQty: value,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/updateproduct/${editId}`, form);
        toast.success("Product updated successfully!");
      } else {
        await axios.post(`${API_URL}/addproduct`, form);
        toast.success("Product added successfully!");
      }
      resetForm();
      fetchProducts();
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const resetForm = () => {
    setForm({
      productName: "",
      productType: "",
      brandName: "",
      price: "",
      depositAmount: "",
      quantity: "",
      availableQty: "",
      systemNumber: "",
      serialNumber: "",
      description: "",
    });
    setEditId(null);
  };

  const handleEdit = (product) => {
    setEditId(product._id);
    setForm({
      productName: product.productName || "",
      productType: product.productType || "",
      brandName: product.brandName || "",
      price: product.price || "",
      depositAmount: product.depositAmount || "",
      quantity: product.quantity?.toString() || "",
      availableQty: product.availableQty?.toString() || "",
      systemNumber: product.systemNumber || "",
      serialNumber: product.serialNumber || "",
      description: product.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/deleteproduct/${id}`);
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const totalPages = Math.ceil(products.length / limit);
  const indexOfLast = page * limit;
  const indexOfFirst = indexOfLast - limit;
  const currentProducts = products.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, 5);
      if (end === totalPages) start = Math.max(1, totalPages - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const getProductTypeIcon = (type) => {
    switch (type) {
      case "Laptop Rental": return "💻";
      case "PC/Desktop Rental": return "🖥️";
      case "Monitor Rental": return "📺";
      case "Gaming Pc Rental": return "🎮";
      default: return "📦";
    }
  };

  return (
    <Container
      fluid
      style={{
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        padding: "24px",
        fontSize: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h5
          style={{
            margin: 0,
            color: "#1e293b",
            fontWeight: 600,
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaBox /> Product Management
        </h5>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          style={{
            backgroundColor: "#0d6efd",
            border: "none",
            fontSize: "13px",
            padding: "8px 18px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: 500,
          }}
        >
          <FaPlus /> Add Product
        </Button>
      </div>

      <Card
        className="shadow-sm"
        style={{
          borderRadius: "12px",
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Card.Body>
          {loading ? (
            <p style={{ textAlign: "center", padding: "1.5rem", color: "#64748b", fontSize: "14px" }}>
              Loading...
            </p>
          ) : currentProducts.length === 0 ? (
            <p style={{ textAlign: "center", padding: "1.5rem", color: "#94a3b8", fontSize: "14px" }}>
              No products found
            </p>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <Table hover responsive className="align-middle" style={{ fontSize: "13px" }}>
                  <thead style={{ backgroundColor: "#f8fafc", color: "#334155", fontWeight: 600 }}>
                    <tr>
                      <th style={{ padding: "12px" }}>#</th>
                      <th style={{ padding: "12px" }}>Product</th>
                      <th style={{ padding: "12px" }}>Brand</th>
                      <th style={{ padding: "12px" }}>Type</th>
                      <th style={{ padding: "12px" }}>Price (₹)</th>
                      <th style={{ padding: "12px" }}>Qty / Avail</th>
                      <th style={{ padding: "12px", fontSize: "12px" }}>Serial</th>
                      <th style={{ padding: "12px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product, index) => (
                      <tr key={product._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px" }}>{indexOfFirst + index + 1}</td>
                        <td style={{ padding: "12px", fontWeight: 600 }}>
                          {product.productName}
                          {product.description && (
                            <div className="text-muted" style={{ fontSize: "12px", marginTop: "4px" }}>
                              {product.description}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "12px" }}>{product.brandName}</td>
                        <td style={{ padding: "12px" }}>
                          <Badge bg="light" text="dark" style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "20px" }}>
                            {getProductTypeIcon(product.productType)} {product.productType}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px", fontWeight: 500 }}>₹{product.price}</td>
                        <td style={{ padding: "12px" }}>
                          <Badge bg="secondary" pill style={{ fontSize: "11px", padding: "4px 8px" }}>
                            Total: {product.quantity}
                          </Badge>{" "}
                          <Badge
                            bg={product.availableQty > 0 ? "success" : "danger"}
                            pill
                            style={{ fontSize: "11px", padding: "4px 8px", marginLeft: "4px" }}
                          >
                            Avail: {product.availableQty}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px", fontSize: "12px", color: "#475569" }}>
                          {product.serialNumber || "—"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <FaEdit
                            style={{ color: "#0d6efd", cursor: "pointer", marginRight: "12px", fontSize: "15px" }}
                            onClick={() => handleEdit(product)}
                          />
                          <FaTrashAlt
                            style={{ color: "#dc3545", cursor: "pointer", fontSize: "15px" }}
                            onClick={() => handleDelete(product._id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                  <Pagination size="sm">
                    <Pagination.Prev
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      style={{ fontSize: "13px", padding: "6px 10px" }}
                    />
                    {getPageNumbers().map((pageNum) => (
                      <Pagination.Item
                        key={pageNum}
                        active={pageNum === page}
                        onClick={() => handlePageChange(pageNum)}
                        style={{ fontSize: "13px", padding: "6px 10px", margin: "0 2px" }}
                      >
                        {pageNum}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      style={{ fontSize: "13px", padding: "6px 10px" }}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          resetForm();
        }}
        centered
        size="lg"
        style={{ fontSize: "14px" }}
      >
        <Modal.Header
          closeButton
          style={{
            borderBottom: "1px solid #e2e8f0",
            padding: "18px 24px",
            backgroundColor: "#f8fafc",
          }}
        >
          <div>
            <Modal.Title
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaBox style={{ color: editId ? "#0d6efd" : "#28a745" }} />
              {editId ? "Edit Product" : "Add New Product"}
            </Modal.Title>
            <p
              style={{
                margin: "6px 0 0",
                color: "#64748b",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <FaInfoCircle style={{ color: "#94a3b8" }} /> Fill all required fields marked with{" "}
              <span style={{ color: "#e53e3e" }}>*</span>
            </p>
          </div>
        </Modal.Header>

        <Modal.Body style={{ padding: "24px" }}>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: 500 }}>
                    Product Name <span style={{ color: "#e53e3e" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="productName"
                    value={form.productName}
                    onChange={handleChange}
                    required
                    style={{
                      fontSize: "14px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: 500 }}>
                    Brand Name <span style={{ color: "#e53e3e" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="brandName"
                    value={form.brandName}
                    onChange={handleChange}
                    required
                    style={{
                      fontSize: "14px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: 500 }}>
                    Product Type <span style={{ color: "#e53e3e" }}>*</span>
                  </Form.Label>
                  <div style={{ position: "relative" }}>
                    <Form.Select
                      name="productType"
                      value={form.productType}
                      onChange={handleChange}
                      required
                      style={{
                        appearance: "none",
                        width: "100%",
                        fontSize: "14px",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        color: form.productType ? "#0f172a" : "#94a3b8",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="" disabled>Select Product Type</option>
                      <option value="Laptop Rental">💻 Laptop Rental</option>
                      <option value="PC/Desktop Rental">🖥️ PC/Desktop Rental</option>
                      <option value="Monitor Rental">📺 Monitor Rental</option>
                      <option value="Gaming Pc Rental">🎮 Gaming PC Rental</option>
                    </Form.Select>
                    <span
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        color: "#94a3b8",
                      }}
                    >
                      ▼
                    </span>
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: 500 }}>
                    Price (₹) <span style={{ color: "#e53e3e" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="0"
                    style={{
                      fontSize: "14px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: 500 }}>
                    Deposit Amount (₹)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="depositAmount"
                    value={form.depositAmount}
                    onChange={handleChange}
                    min="0"
                    style={{
                      fontSize: "14px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: 500 }}>
                    Total Quantity <span style={{ color: "#e53e3e" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange} 
                    required
                    min="1"
                    style={{
                      fontSize: "14px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: 500 }}>
                    Available Quantity
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={form.availableQty}
                    readOnly 
                    style={{
                      fontSize: "14px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#f8fafc", 
                    }}
                  />
                  <div className="text-muted" style={{ fontSize: "12px", marginTop: "4px" }}>
                    Automatically set to total quantity
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: 500 }}>
                    System Number
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="systemNumber"
                    value={form.systemNumber}
                    onChange={handleChange}
                    style={{
                      fontSize: "14px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: 500 }}>
                    Serial Number
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="serialNumber"
                    value={form.serialNumber}
                    onChange={handleChange}
                    style={{
                      fontSize: "14px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: 500 }}>
                    Description
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={handleChange}
                    style={{
                      fontSize: "14px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      resize: "none",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer
          style={{
            borderTop: "1px solid #e2e8f0",
            padding: "16px 24px",
            backgroundColor: "#f8fafc",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
            style={{
              fontSize: "13px",
              padding: "8px 20px",
              borderRadius: "6px",
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            style={{
              fontSize: "13px",
              padding: "8px 24px",
              borderRadius: "6px",
              fontWeight: 500,
              backgroundColor: editId ? "#0d6efd" : "#28a745",
              border: "none",
            }}
          >
            {editId ? "Update Product" : "Add Product"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Product;