import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Card,
  Row,
  Col,
  InputGroup,
  Pagination,
  Badge,
} from "react-bootstrap";
import {
  FaEye,
  FaPlus,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
  FaFileAlt,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ApiURL = "https://api.rentyourpc.com/api/order";
const ProductApiURL = "https://api.rentyourpc.com/api/product/getallproducts";
const ClientApiURL = "https://api.rentyourpc.com/api/client/getallclients";
const CreateClientApiURL = "https://api.rentyourpc.com/api/client/add-client";

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clientId: "",
    clientName: "",
    products: [],
    transportCharges: 0,
    gst: 0,
    discount: 0,
    rentalType: "daily",
    startDate: "",
    endDate: "",
  });

  const [form, setForm] = useState({
    clientName: "",
    clientphoneNumber: "",
    email: "",
    gstNo: "",
    joiningdate: "",
    address: "",
    amount: "",
  });

  // Fetch Data
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${ApiURL}/getallorder`);
      setOrders(res.data);
      setFilteredOrders(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(ProductApiURL);
      setProductsList(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get(ClientApiURL);
      setAllClients(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchClients();
  }, []);

  // Search
  const handleSearch = (e) => {
    setSearch(e.target.value);
    const filtered = orders.filter(
      (o) =>
        o.clientName.toLowerCase().includes(e.target.value.toLowerCase()) ||
        o.products.some((p) =>
          p.productName.toLowerCase().includes(e.target.value.toLowerCase())
        )
    );
    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  // Sort
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

 

const openModal = (order = null) => {
  if (order) {
    const clientId =
      typeof order.clientId === "object" ? order.clientId._id : order.clientId;

    setEditOrder(order);
    setFormData({
      clientId: clientId || "",
      clientName: order.clientName || (order.clientId?.clientName || ""),
      products: order.products || [],
      transportCharges: order.transportCharges || 0,
      gst: order.gst || 0,
      discount: order.discount || 0,
      rentalType: order.rentalType || "daily",
      startDate: order.startDate
        ? new Date(order.startDate).toISOString().split("T")[0]
        : "",
      endDate: order.endDate
        ? new Date(order.endDate).toISOString().split("T")[0]
        : "",
    });
  } else {
    setEditOrder(null);
    setFormData({
      clientId: "",
      clientName: "",
      products: [],
      transportCharges: 0,
      gst: 0,
      discount: 0,
      rentalType: "daily",
      startDate: "",
      endDate: "",
    });
  }
  setShowModal(true);
};

const deleteOrder = async (id) => {
  if (window.confirm("Are you sure you want to delete this order?")) {
    try {
      await axios.delete(`${ApiURL}/deleteorder/${id}`);
      fetchOrders(); 
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order");
    }
  }
};

  // Handle Input
  const handleChange = (e, index = null, field = null) => {
    if (index !== null && field) {
      const updatedProducts = [...formData.products];
      if (field === "productId") {
        const selectedProduct = productsList.find(
          (prod) => prod._id === e.target.value
        );
        updatedProducts[index] = {
          ...updatedProducts[index],
          productId: e.target.value,
          productName: selectedProduct.productName,
          unitPrice: selectedProduct.price,
          availableQty: selectedProduct.availableQty,
          quantity: 1,
        };
      } else if (field === "quantity") {
        let qty = Number(e.target.value);
        if (qty > updatedProducts[index].availableQty)
          qty = updatedProducts[index].availableQty;
        updatedProducts[index].quantity = qty;
      }
      setFormData({ ...formData, products: updatedProducts });
    } else {
      if (e.target.name === "clientId") {
        const selectedClient = allClients.find((c) => c._id === e.target.value);
        setFormData({
          ...formData,
          clientId: e.target.value,
          clientName: selectedClient ? selectedClient.clientName : "",
        });
      } else {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      }
    }
  };

  const addProductRow = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        {
          productId: "",
          productName: "",
          unitPrice: 0,
          quantity: 1,
          availableQty: 0,
        },
      ],
    });
  };

  const removeProductRow = (index) => {
    const updated = [...formData.products];
    updated.splice(index, 1);
    setFormData({ ...formData, products: updated });
  };

  const calculateGrandTotal = () => {
    const subtotal = formData.products.reduce(
      (acc, p) => acc + p.unitPrice * p.quantity,
      0
    );
    const gstAmount = (subtotal * formData.gst) / 100;
    const discountAmount = (subtotal * formData.discount) / 100;
    const transport = Number(formData.transportCharges || 0);
    return Math.round(subtotal + gstAmount + transport - discountAmount);
  };

  const handleSubmit = async () => {
    try {
      const products = formData.products.map((p) => ({
        ...p,
        totalPrice: p.unitPrice * p.quantity,
      }));
      const grandTotal = calculateGrandTotal();
      const payload = { ...formData, products, grandTotal };
      if (editOrder) {
        await axios.put(`${ApiURL}/updateorder/${editOrder._id}`, payload);
      } else {
        await axios.post(`${ApiURL}/createorder`, payload);
      }
      setShowModal(false);
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <div className="container mt-4" style={{ fontSize: "13px" }}>
      <Card className="p-3 shadow-sm" style={{ borderRadius: "12px", border: "none" }}>
        <Row className="mb-3 align-items-center">
          <Col md={6}>
            <h3 style={{ fontSize: "14px", fontWeight: "600" }}>📋 Order List</h3>
          </Col>
          <Col md={4}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search by client or product..."
                value={search}
                onChange={handleSearch}
                style={{ fontSize: "13px", borderRadius: "20px 0 0 20px" }}
              />
              <Button variant="outline-secondary" style={{ borderRadius: "0 20px 20px 0" }}>
                <FaSearch />
              </Button>
            </InputGroup>
          </Col>
          <Col md={2}>
            <Button
              variant="primary"
              onClick={() => openModal()}
              style={{
                fontSize: "13px",
                borderRadius: "20px",
                padding: "6px 14px",
                fontWeight: "600",
              }}
            >
              <FaPlus size={12} className="me-1" /> Create Order
            </Button>
          </Col>
        </Row>

        {/* TABLE */}
        <Table striped bordered hover responsive style={{ fontSize: "13px" }}>
          <thead style={{ background: "#f8fafc", fontWeight: "600", fontSize: "14px" }}>
            <tr>
              <th>S.No</th>
              <th>Client</th>
              <th>Products</th>
              <th>Grand Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length ? (
              currentOrders.map((o, i) => (
                <tr key={o._id}>
                  <td>{(currentPage - 1) * ordersPerPage + i + 1}</td>
                  <td>{o.clientName}</td>
                  <td>
                    {o.products.map((p, j) => (
                      <div key={j}>{p.productName} x {p.quantity}</div>
                    ))}
                  </td>
                  <td>₹{o.grandTotal}</td>
                  <td>
                    <Badge bg={o.status === "pending" ? "warning" : "success"} style={{ fontSize: "12px" }}>
                      {o.status}
                    </Badge>
                  </td>
                  <td>
                      <Button
    variant="outline-primary"
    size="sm"
    style={{ fontSize: "12px", marginRight: "6px" }}
    onClick={() => openModal(o)}
    title="Edit Order"
  >
    Edit
  </Button>
                    <Button
    variant="outline-success"
    size="sm"
    style={{ fontSize: "12px", marginRight: "6px" }}
    onClick={() => navigate(`/order-details/${o._id}`)}
    title="View Details"
  >
    <FaEye />
  </Button>
  <Button
    variant="outline-danger"
    size="sm"
    style={{ fontSize: "12px" }}
    onClick={() => deleteOrder(o._id)}
    title="Delete Order"
  >
    <FaTrash />
  </Button>



  
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  <FaFileAlt size={28} style={{ color: "#adb5bd" }} />
                  <div>No orders found.</div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* ORDER MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "14px" }}>
            {editOrder ? "Edit Order" : "Create Order"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "13px" }}>
          <Form>
            {/* CLIENT */}
            <Form.Group className="mb-3">
              <Form.Label>Client</Form.Label>
              <div style={{ display: "flex", gap: "8px" }}>
                <Form.Select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  style={{ fontSize: "13px" }}
                >
                  <option value="">Select Client</option>
                  {allClients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.clientName}
                    </option>
                  ))}
                </Form.Select>
                <Button
                //   variant="outline-success"
                  size="sm"
                  onClick={() => setShowClientModal(true)}
                  style={{ fontSize: "12px" }}
                >
                  <FaPlus /> 
                </Button>
              </div>
            </Form.Group>

            {/* DATE FIELDS */}
            <Row>
                 <Col md={4}>
                <Form.Group>
                  <Form.Label>Rental Type</Form.Label>
                  <Form.Select
                    name="rentalType"
                    value={formData.rentalType}
                    onChange={handleChange}
                    style={{ fontSize: "13px" }}
                  >
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    style={{ fontSize: "13px",backgroundColor:"#00000069" }}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    style={{ fontSize: "13px",backgroundColor:"#00000069" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* PRODUCT TABLE */}
            <Form.Group className="mb-3">
              <Form.Label>Products</Form.Label>
              {formData.products.map((p, i) => (
                <Row key={i} className="mb-2">
                  <Col md={5}>
                    <Form.Select
                      value={p.productId}
                      onChange={(e) => handleChange(e, i, "productId")}
                      style={{ fontSize: "13px" }}
                    >
                      <option value="">Select Product</option>
                      {productsList.map((prod) => (
                        <option key={prod._id} value={prod._id}>
                          {prod.productName}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="number"
                      min="1"
                      max={p.availableQty}
                      value={p.quantity}
                      onChange={(e) => handleChange(e, i, "quantity")}
                      style={{ fontSize: "13px" }}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="text"
                      value={p.unitPrice * p.quantity}
                      readOnly
                      style={{ fontSize: "13px" }}
                    />
                  </Col>
                  <Col md={1}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeProductRow(i)}
                    >
                      <FaTrash />
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button
                variant="outline-primary"
                size="sm"
                onClick={addProductRow}
                style={{ fontSize: "13px" }}
              >
                <FaPlus /> Add Product
              </Button>
            </Form.Group>

            {/* CHARGES */}
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Transport Charges</Form.Label>
                  <Form.Control
                    type="number"
                    name="transportCharges"
                    value={formData.transportCharges}
                    onChange={handleChange}
                    style={{ fontSize: "13px" }}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
               <Form.Group>
  <Form.Label>GST (%)</Form.Label>
  <Form.Select
    name="gst"
    value={formData.gst}
    onChange={handleChange}
    style={{ fontSize: "13px" }}
  >
    <option value="0">0%</option>
    <option value="18">18%</option>
  </Form.Select>
</Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Discount (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    style={{ fontSize: "13px" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-3">
             
              <Col md={6}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginTop: "30px",
                    color: "#1d4ed8",
                  }}
                >
                  Grand Total: ₹{calculateGrandTotal()}
                </div>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} style={{ fontSize: "13px" }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} style={{ fontSize: "13px" }}>
            {editOrder ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default OrderList;
