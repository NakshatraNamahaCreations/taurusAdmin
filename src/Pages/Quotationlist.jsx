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
import {  FaEye, FaPlus, FaSort, FaSortUp, FaSortDown,FaSearch,FaFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ApiURL = "https://api.rentyourpc.com/api/quotations";
const ProductApiURL = "https://api.rentyourpc.com/api/product/getallproducts";
const ClientApiURL = "https://api.rentyourpc.com/api/client/getallclients";
const CreateClientApiURL = "https://api.rentyourpc.com/api/client/add-client";

function QuotationList() {
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editQuotation, setEditQuotation] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [quotationsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Use form state for client creation
  const [form, setForm] = useState({
    clientName: "",
    clientphoneNumber: "",
    email: "",
    gstNo: "",
    joiningdate: "",
    address: "",
    amount: "",
  });

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clientId: "",
    clientName: "",
    products: [],
    transportCharges: 0,
    gst: 0,
    discount: 0,
    startDate: "",
    endDate: "",
    rentalType: "daily",
  });

  // Fetch data
  const fetchQuotations = async () => {
    try {
      const res = await axios.get(`${ApiURL}/getallquotation`);
      setQuotations(res.data);
      setFilteredQuotations(res.data);
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
    fetchQuotations();
    fetchProducts();
    fetchClients();
  }, []);

  // Search
  const handleSearch = (e) => {
    setSearch(e.target.value);
    const filtered = quotations.filter(
      (q) =>
        q.clientName.toLowerCase().includes(e.target.value.toLowerCase()) ||
        q.products.some((p) =>
          p.productName.toLowerCase().includes(e.target.value.toLowerCase())
        )
    );
    setFilteredQuotations(filtered);
    setCurrentPage(1);
  };

  // Sort function
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const indexOfLast = currentPage * quotationsPerPage;
  const indexOfFirst = indexOfLast - quotationsPerPage;
  const currentQuotations = sortedQuotations.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedQuotations.length / quotationsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Modal
  const openModal = (quotation = null) => {
    if (quotation) {
      setEditQuotation(quotation);
      setFormData({
        clientId: quotation.clientId,
        clientName: quotation.clientName,
        products: quotation.products,
        transportCharges: Number(quotation.transportCharges),
        gst: Number(quotation.gst),
        discount: Number(quotation.discount),
        startDate: quotation.startDate.slice(0, 10),
        endDate: quotation.endDate.slice(0, 10),
        rentalType: quotation.rentalType,
      });
    } else {
      setEditQuotation(null);
      setFormData({
        clientId: "",
        clientName: "",
        products: [],
        transportCharges: 0,
        gst: 0,
        discount: 0,
        startDate: "",
        endDate: "",
        rentalType: "daily",
      });
    }
    setShowModal(true);
  };

  // Handle input change
  const handleChange = (e, index = null, field = null) => {
    if (index !== null && field) {
      const updatedProducts = [...formData.products];
      if (field === "productType") {
        updatedProducts[index] = {
          productType: e.target.value,
          productId: "",
          productName: "",
          unitPrice: 0,
          quantity: 1,
          availableQty: 0,
        };
      } else if (field === "productId") {
        const selectedProduct = productsList.find((prod) => prod._id === e.target.value);
        updatedProducts[index] = {
          ...updatedProducts[index],
          productId: e.target.value,
          productName: selectedProduct.productName,
          unitPrice: Number(selectedProduct.price),
          availableQty: selectedProduct.availableQty,
          quantity: 1,
        };
      } else if (field === "quantity") {
        let qty = Number(e.target.value);
        if (qty > updatedProducts[index].availableQty) qty = updatedProducts[index].availableQty;
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

  // Add/remove product
  const addProductRow = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        { productType: "", productId: "", productName: "", unitPrice: 0, quantity: 1, availableQty: 0 },
      ],
    });
  };
  const removeProductRow = (index) => {
    const updated = [...formData.products];
    updated.splice(index, 1);
    setFormData({ ...formData, products: updated });
  };

  // Calculate Grand Total
  const calculateGrandTotal = () => {
    const subtotal = formData.products.reduce(
      (acc, p) => acc + Number(p.unitPrice) * Number(p.quantity),
      0
    );
    const gstAmount = (subtotal * Number(formData.gst || 0)) / 100;
    const discountAmount = (subtotal * Number(formData.discount || 0)) / 100;
    const transport = Number(formData.transportCharges || 0);
    return Math.round(subtotal + gstAmount + transport - discountAmount);
  };

  // Client form handlers - using form state
  const handleClientChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateClient = async () => {
    try {
      const response = await axios.post(CreateClientApiURL, form);
      setAllClients([...allClients, response.data.data]);
      setFormData({
        ...formData,
        clientId: response.data.data._id,
        clientName: response.data.data.clientName,
      });
      setForm({
        clientName: "",
        clientphoneNumber: "",
        email: "",
        gstNo: "",
        joiningdate: "",
        address: "",
        amount: "",
      });
      setShowClientModal(false);
    } catch (error) {
      console.error("Error creating client:", error);
    }
  };

  // Submit quotation
  const handleSubmit = async () => {
    try { 
      const products = formData.products.map((p) => ({
        ...p,
        unitPrice: Number(p.unitPrice),
        quantity: Number(p.quantity),
        totalPrice: Number(p.unitPrice) * Number(p.quantity),
      }));

      const subtotal = products.reduce((acc, p) => acc + p.totalPrice, 0);
      const gstAmount = (subtotal * Number(formData.gst || 0)) / 100;
      const discountAmount = (subtotal * Number(formData.discount || 0)) / 100;
      const transport = Number(formData.transportCharges || 0);

      const grandTotal = Math.round(subtotal + gstAmount + transport - discountAmount);

      console.log("grandTotal inside function called",grandTotal)

      const payload = {
        ...formData,
        products,
        transportCharges: transport,
        gst: Number(formData.gst || 0),
        discount: Number(formData.discount || 0),
        grandTotal: grandTotal, // ensure number
      };
      console.log("payload",payload)

      if (editQuotation) {
        await axios.put(`${ApiURL}/editquotation/${editQuotation._id}`, payload, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        await axios.post(`${ApiURL}/createquotation`, payload, {
          headers: { "Content-Type": "application/json" },
        });
      }

      setShowModal(false);
      fetchQuotations();
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewQuotation = (id) => {
    navigate(`/quotation-details/${id}`);
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FaSort />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <div className="container mt-4">
      <Card className="p-3 shadow-sm" style={{ borderRadius: "12px", border: "none" }}>
        <Row className="mb-3 align-items-center">
          <Col md={6}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>📋 Quotation List</h3>
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
                padding: "6px 16px",
                fontWeight: "600"
              }}
            >
              <FaPlus size={12} className="me-1" /> Create Quotation
            </Button>
          </Col>
        </Row>

        <Table striped bordered hover responsive className="align-middle" style={{ fontSize: "13px", borderRadius: "8px", overflow: "hidden" }}>
          <thead style={{ backgroundColor: "#f8fafc", fontSize: "14px", fontWeight: "600" }}>
            <tr>
              <th style={{ width: "50px", cursor: "pointer" }} onClick={() => requestSort('_id')}>
                S.No {getSortIcon('_id')}
              </th>
              <th style={{ cursor: "pointer" }} onClick={() => requestSort('clientName')}>
                Client {getSortIcon('clientName')}
              </th>
              <th>Products</th>
              <th style={{ cursor: "pointer" }} onClick={() => requestSort('grandTotal')}>
                Grand Total {getSortIcon('grandTotal')}
              </th>
              <th style={{ cursor: "pointer" }} onClick={() => requestSort('status')}>
                Status {getSortIcon('status')}
              </th>
              <th style={{ width: "80px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentQuotations.length ? (
              currentQuotations.map((q, index) => (
                <tr key={q._id} style={{ transition: "all 0.2s ease" }}>
                  <td style={{ fontWeight: "600", textAlign: "center" }}>
                    {(currentPage - 1) * quotationsPerPage + index + 1}
                  </td>
                  <td>{q.clientName}</td>
                  <td>
                    {q.products.map((p, i) => (
                      <div key={i} style={{ fontSize: "12px", marginBottom: "2px" }}>
                        {p.productName} x {p.quantity}
                      </div>
                    ))}
                  </td>
                  <td style={{ fontWeight: "600", color: "#1d4ed8" }}>
                    ₹{q.grandTotal.toLocaleString()}
                  </td>
                  <td>
                    {q.status === "pending" && <Badge bg="warning" style={{ fontSize: "12px" }}>Pending</Badge>}
                    {q.status === "confirmed" && <Badge bg="success" style={{ fontSize: "12px" }}>Confirmed</Badge>}
                    {q.status === "cancelled" && <Badge bg="danger" style={{ fontSize: "12px" }}>Cancelled</Badge>}
                  </td>
                  <td className="d-flex gap-1">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => handleViewQuotation(q._id)}
                      style={{ 
                        padding: "4px 8px", 
                        borderRadius: "50%",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <FaEye />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4" style={{ fontSize: "14px", color: "#6c757d" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <FaFileAlt size={32} style={{ color: "#adb5bd" }} />
                    No quotations found.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <Pagination.Prev 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                style={{ fontSize: "13px" }}
              />
              {[...Array(totalPages).keys()].map((x) => (
                <Pagination.Item 
                  key={x + 1} 
                  active={x + 1 === currentPage} 
                  onClick={() => paginate(x + 1)}
                  style={{ fontSize: "13px" }}
                >
                  {x + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
                style={{ fontSize: "13px" }}
              />
            </Pagination>
          </div>
        )}
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "16px" }}>{editQuotation ? "Edit Quotation" : "Create Quotation"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Client & Rental Type */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Client</Form.Label>
                  <div className="d-flex">
                    <Form.Select 
                      name="clientId" 
                      value={formData.clientId} 
                      onChange={handleChange} 
                      style={{ fontSize: "13px", height: "38px", flex: 1, borderRadius: "4px 0 0 4px" }}
                    >
                      <option value="">Select Client</option>
                      {allClients.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>)}
                    </Form.Select>
                    <Button 
                      variant="outline-primary" 
                      onClick={() => setShowClientModal(true)}
                      style={{ borderRadius: "0 4px 4px 0", height: "38px", width: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <FaPlus size={12} />
                    </Button>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Rental Type</Form.Label>
                  <Form.Select name="rentalType" value={formData.rentalType} onChange={handleChange} style={{ fontSize: "13px", height: "38px" }}>
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Start & End Date */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control type="date" name="startDate" value={formData.startDate} onChange={handleChange} style={{ fontSize: "13px", height: "38px",backgroundColor:"#00000069" }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control type="date" name="endDate" value={formData.endDate} onChange={handleChange} style={{ fontSize: "13px", height: "38px",backgroundColor:"#00000069" }} />
                </Form.Group>
              </Col>
            </Row>

            {/* Products */}
            {formData.products.map((p, index) => {
              const filteredProducts = productsList.filter(prod => prod.productType === p.productType);
              return (
                <Row key={index} className="mb-2 align-items-center">
                  <Col md={3}>
                    <Form.Select value={p.productType || ""} onChange={(e) => handleChange(e, index, "productType")} style={{ fontSize: "13px", height: "38px" }}>
                      <option value="" disabled>Select Product Type</option>
                      <option value="Laptop Rental">💻 Laptop Rental</option>
                      <option value="PC/Desktop Rental">🖥️ PC/Desktop Rental</option>
                      <option value="Monitor Rental">📺 Monitor Rental</option>
                      <option value="Gaming Pc Rental">🎮 Gaming PC Rental</option>
                    </Form.Select>
                  </Col>

                  <Col md={3}>
                    <Form.Select value={p.productId || ""} onChange={(e) => handleChange(e, index, "productId")} disabled={!p.productType} style={{ fontSize: "13px", height: "38px" }}>
                      <option value="">Select Product</option>
                      {filteredProducts.map(prod => <option key={prod._id} value={prod._id}>{prod.productName} (Available: {prod.availableQty})</option>)}
                    </Form.Select>
                  </Col>

                  <Col md={2}>
                    <Form.Control type="number" value={p.unitPrice || 0} readOnly style={{ fontSize: "13px", height: "38px", textAlign: "right" }} />
                  </Col>

                  <Col md={2}>
                    <Form.Control type="number" min={1} max={p.availableQty || 0} value={p.quantity || 1} onChange={(e) => handleChange(e, index, "quantity")} style={{ fontSize: "13px", height: "38px" }} />
                  </Col>

                  <Col md={2} className="d-flex justify-content-center">
                    <Button variant="danger" size="sm" onClick={() => removeProductRow(index)}>Remove</Button>
                  </Col>
                </Row>
              );
            })}

            <Button variant="secondary" size="sm" onClick={addProductRow} className="mb-3">Add Product</Button>

            {/* Charges */}
            <Row className="mb-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>GST (%)</Form.Label>
                  <Form.Select name="gst" value={formData.gst} onChange={handleChange} style={{ fontSize: "13px", height: "38px" }}>
                    <option value={0}>0%</option>
                    <option value={18}>18%</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Transport Charges</Form.Label>
                  <Form.Control type="number" name="transportCharges" value={formData.transportCharges} onChange={handleChange} style={{ fontSize: "13px", height: "38px" }} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Discount (%)</Form.Label>
                  <Form.Control type="number" name="discount" value={formData.discount} min={0} max={100} onChange={handleChange} style={{ fontSize: "13px", height: "38px" }} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Grand Total</Form.Label>
                  <Form.Control type="number" value={calculateGrandTotal()} readOnly style={{ fontSize: "14px", height: "38px", fontWeight: "bold" }} />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="success" onClick={handleSubmit}>{editQuotation ? "Update Quotation" : "Create Quotation"}</Button>
        </Modal.Footer>
      </Modal>

      {/* Client Creation Modal */}
      <Modal show={showClientModal} onHide={() => setShowClientModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "16px" }}>Create New Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Client Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="clientName"
                    value={form.clientName}
                    onChange={handleClientChange}
                    placeholder="Enter client name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="clientphoneNumber"
                    value={form.clientphoneNumber}
                    onChange={handleClientChange}
                    placeholder="Enter phone number"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleClientChange}
                    placeholder="Enter email"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>GST No</Form.Label>
                  <Form.Control
                    type="text"
                    name="gstNo"
                    value={form.gstNo}
                    onChange={handleClientChange}
                    placeholder="Enter GST number"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                value={form.address}
                onChange={handleClientChange}
                placeholder="Enter address"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Joining Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="joiningdate"
                    value={form.joiningdate}
                    onChange={handleClientChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Initial Amount</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleClientChange}
                    placeholder="Enter initial amount"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClientModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateClient}
            disabled={!form.clientName || !form.clientphoneNumber}
          >
            Create Client
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default QuotationList;