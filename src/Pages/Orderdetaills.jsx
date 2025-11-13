import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Form,
  Spinner,
  Alert,
  Modal,
  Badge,
  Container
} from "react-bootstrap";
import {
  FaTrash,
  FaSave,
  FaBan,
  FaEdit,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarker,
  FaTag,
  FaInfoCircle,
  FaTimes,
  FaCheck,
  FaCheckCircle,
  FaFileInvoice,
  FaTruck,
  FaPrint,
  FaMoneyBill,
  FaCalendarAlt
} from "react-icons/fa";

const API_URL = "https://api.rentyourpc.com/api/order";

function Orderdetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [generatingChallan, setGeneratingChallan] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editProductName, setEditProductName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
   const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [paymentData, setPaymentData] = useState({
    paymentMethod: "",
    paymentType: "",
    amount: "",
    nextPaymentDate: "",
    
  });

  const fetchQuotation = async () => {
    try {
      const res = await axios.get(`${API_URL}/getorder/${id}`);
      setQuotation(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  console.log("quotation", quotation);

  const isCancelled = quotation?.status === "cancelled";
  const isConfirmed = quotation?.status === "confirmed";

  // const startEditingProduct = (product) => {
  //   if (isCancelled || isConfirmed) return;
  //   setEditingProductId(product.productId || product._id);
  //   setEditProductName(product.productName);
  //   setEditQuantity(product.quantity);
  //   setEditStartDate(product.startDate ? new Date(product.startDate).toISOString().split('T')[0] : "");
  //   setEditEndDate(product.endDate ? new Date(product.endDate).toISOString().split('T')[0] : "");
  // };

  const startEditingProduct = (product) => {
  if (isCancelled || isConfirmed) return;
  setEditingProductId(product.productId || product._id);
  setEditProductName(product.productName);
  setEditQuantity(product.quantity);
  setEditStartDate(
    product.startDate
      ? new Date(product.startDate).toISOString().split("T")[0]
      : quotation.startDate
      ? new Date(quotation.startDate).toISOString().split("T")[0]
      : ""
  );
  setEditEndDate(
    product.endDate
      ? new Date(product.endDate).toISOString().split("T")[0]
      : quotation.endDate
      ? new Date(quotation.endDate).toISOString().split("T")[0]
      : ""
  );
};

  const cancelEditing = () => {
    setEditingProductId(null);
    setEditProductName("");
    setEditQuantity("");
    setEditStartDate("");
    setEditEndDate("");
  };

  const handleSaveProduct = async (productId, product) => {
    try {
      setUpdating(true);
      
      const updateData = {
        productName: editProductName.trim() || product.productName,
        quantity: parseInt(editQuantity) || product.quantity,
        startDate: editStartDate || product.startDate || "",
        endDate: editEndDate || product.endDate || "",
      };

      await axios.put(`${API_URL}/updateproduct/${quotation._id}/${productId}`, updateData);
      await fetchQuotation();
      cancelEditing();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (isCancelled || isConfirmed) return;
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/${quotation._id}/product/${productId}`);
      fetchQuotation();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const handleCancelQuotation = async () => {
    setShowCancelModal(false);
    setCancelling(true);
    try {
      await axios.put(`${API_URL}/cancelorder/${quotation._id}`);
      alert("Quotation cancelled successfully!");
      fetchQuotation();
    } catch (error) {
      console.error("Error cancelling quotation:", error);
      alert("Failed to cancel quotation!");
    } finally {
      setCancelling(false);
    }
  };

   const handleConfirmPayment = async () => {
    if (
      !paymentData.paymentMethod ||
      !paymentData.paymentType ||
      !paymentData.amount
    ) {
      alert("Please fill all payment details!");
      return;
    }

    setConfirming(true);
    try {
      await axios.post("https://api.rentyourpc.com/api/payment/createpayment", {
        orderId: quotation._id,
        clientId: quotation.clientId?._id || quotation.clientId,
        paymentMethod: paymentData.paymentMethod,
        paymentType: paymentData.paymentType,
        amount: paymentData.amount,
        nextPaymentDate: paymentData.nextPaymentDate,
        paymentStatus:"paid",
      });

      alert("Payment saved successfully & Order confirmed!");
      setShowPaymentModal(false);
      fetchQuotation();
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Failed to confirm payment!");
    } finally {
      setConfirming(false);
    }
  };

  const handleGenerateInvoice =  () => {
      navigate(`/generate-invoice/${quotation._id}`);
  }

  const handleGenerateChallan =  () => {
      navigate(`/delivery-challan/${quotation._id}`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2" style={{ fontSize: '14px' }}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!quotation) return <div className="text-center mt-5">No Order Found</div>;
const clientAmount = quotation.clientId.amount || 0;
  const client = quotation.clientId || {};
  const subtotal = quotation.products.reduce(
    (sum, p) => sum + (p.totalPrice || p.unitPrice * p.quantity),
    0
  );
  const gstAmount = (subtotal * quotation.gst) / 100;
  const discountAmount = (subtotal * quotation.discount) / 100;
  const grandTotal = subtotal + (quotation.transportCharges || 0) + gstAmount - discountAmount + clientAmount;
  

  const getStatusBadge = (status) => {
    const base = {
      padding: "6px 14px",
      borderRadius: "30px",
      fontSize: "13px",
      fontWeight: "600",
      display: "inline-block",
    };
    switch (status) {
      case "confirmed":
        return {
          ...base,
          backgroundColor: "#dcfce7",
          color: "#166534",
          border: "1px solid #4ade80",
        };
      case "cancelled":
        return {
          ...base,
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #f87171",
        };
      case "completed":
        return {
          ...base,
          backgroundColor: "#dbeafe",
          color: "#1e40af",
          border: "1px solid #3b82f6",
        };
      default:
        return {
          ...base,
          backgroundColor: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fbbf24",
        };
    }
  };

  return (
    <Container fluid className="p-4" style={{ maxWidth: '1200px' }}>
      {isCancelled && (
        <Alert variant="danger" className="text-center fw-bold mb-4" style={{ fontSize: '14px' }}>
          <FaInfoCircle className="me-2" />
          This quotation has been CANCELLED. Editing disabled.
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0" style={{ fontSize: '18px', color: '#2c3e50' }}>
          Order Details
        </h4>
        
        <div className="d-flex gap-2 flex-wrap">
          {/* {!isCancelled && !isConfirmed && ( */}
             
            <Button 
              variant="success" 
              size="sm"
             onClick={() => setShowPaymentModal(true)}
              disabled={confirming}
            >
              {/* {confirming ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-1" />
                  Confirming...
                </>
              ) : (
                <> */}
                  <FaCheckCircle className="me-1" /> Confirm Order
                {/* </>
              )} */}
            </Button>
          {/* )} */}
          
          {/* Invoice and Challan buttons appear only after confirmation */}
          {/* {isConfirmed && (
            <> */}
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleGenerateInvoice}
                disabled={generatingInvoice}
              >
              
                    <FaFileInvoice className="me-1" /> Generate Invoice
               
              </Button>
              
              <Button 
                variant="warning" 
                size="sm"
                onClick={handleGenerateChallan}
                disabled={generatingChallan}
              >
             
                    <FaTruck className="me-1" /> Delivery Challan
             
              </Button>
         
          {/* {!isCancelled && !isConfirmed && ( */}
            <Button 
              variant="danger" 
              size="sm"
              onClick={() => setShowCancelModal(true)}
              disabled={cancelling}
            >
              Cancel Order
            </Button>
          {/* )} */}
        </div>
      </div>

      {/* Client Info Card */}
      <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '12px' }}>
        <Card.Header className="bg-light text-dark py-3" style={{ borderRadius: '12px 12px 0 0', fontSize: '14px' }}>
          <FaUser className="me-2" />
          <strong>Client Information</strong>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="g-3">
            <Col md={6}>
              <div className="d-flex align-items-center mb-2">
                <FaUser className="text-muted me-2" size={14} />
                <strong className="me-2" style={{ fontSize: '14px' }}>Client:</strong>
                <span style={{ fontSize: '14px' }}>{client.clientName || quotation.clientName}</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <FaPhone className="text-muted me-2" size={14} />
                <strong className="me-2" style={{ fontSize: '14px' }}>Phone:</strong>
                <span style={{ fontSize: '14px' }}>{client.clientphoneNumber || "Not available"}</span>
              </div>
              <div className="d-flex align-items-center">
                <FaEnvelope className="text-muted me-2" size={14} />
                <strong className="me-2" style={{ fontSize: '14px' }}>Email:</strong>
                <span style={{ fontSize: '14px' }}>{client.email || "Not available"}</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex align-items-center mb-2">
                <FaMapMarker className="text-muted me-2" size={14} />
                <strong className="me-2" style={{ fontSize: '14px' }}>Address:</strong>
                <span style={{ fontSize: '14px' }}>{client.address || "N/A"}</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <FaTag className="text-muted me-2" size={14} />
                <strong className="me-2" style={{ fontSize: '14px' }}>GST:</strong>
                <span style={{ fontSize: '14px' }}>{client.gstNo || "N/A"}</span>
              </div>
              <div className="d-flex align-items-center">
                <FaInfoCircle className="text-muted me-2" size={14} />
                <strong className="me-2" style={{ fontSize: '14px' }}>Status:</strong>
                <span style={getStatusBadge(quotation.status)} className="text-uppercase">
                  {quotation.status}
                </span>
              </div>
            </Col>
          </Row>
          
          <Row className="g-3 mt-3">
            <Col md={6}>
              <div className="d-flex align-items-center mb-2">
                  <strong className="me-2" style={{ fontSize: '14px', color: '#2c3e50' }}>Deposit Amount:</strong>
                  <span style={{ fontSize: '14px', color: '#27ae60', fontWeight: 'bold' }}>
                    ₹{client.amount?.toLocaleString() || '0'}
                  </span>
              </div>
            </Col>
            
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '12px' }}>
        <Card.Header className="bg-primary text-white py-3" style={{ borderRadius: '12px 12px 0 0' }}>
          <div className="d-flex justify-content-between align-items-center">
            <strong style={{ fontSize: '14px' }}>Product List</strong>
            <span className="badge bg-light text-primary" style={{ fontSize: '12px' }}>
              {quotation.products.length} Products
            </span>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover responsive bordered className="mb-0" style={{ fontSize: '14px' }}>
              <thead className="bg-light">
                <tr>
                  <th className="text-center" style={{ fontSize: '13px', padding: '12px' }}>#</th>
                  <th style={{ fontSize: '13px', padding: '12px' }}>Product Name</th>
                  <th className="text-center" style={{ fontSize: '13px', padding: '12px' }}>Qty</th>
                  <th className="text-center" style={{ fontSize: '13px', padding: '12px' }}>Start Date</th>
                  <th className="text-center" style={{ fontSize: '13px', padding: '12px' }}>End Date</th>
                  <th className="text-center" style={{ fontSize: '13px', padding: '12px' }}>Unit Price</th>
                  <th className="text-center" style={{ fontSize: '13px', padding: '12px' }}>Total</th>
                  <th className="text-center" style={{ fontSize: '13px', padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotation.products.map((p, index) => {
                  const isEditing = editingProductId === (p.productId || p._id);
                  return (
                    <tr key={p._id || p.productId}>
                      <td className="text-center" style={{ padding: '12px' }}>{index + 1}</td>

                      {/* Product Name */}
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <Form.Control
                            type="text"
                            value={editProductName}
                            onChange={(e) => setEditProductName(e.target.value)}
                            size="sm"
                            placeholder="Enter product name"
                            className="form-control-sm"
                            style={{ fontSize: '13px' }}
                          />
                        ) : (
                          <span style={{ fontSize: '14px' }}>{p.productName}</span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="text-center" style={{ padding: '12px' }}>
                        {isEditing ? (
                          <Form.Control
                            type="number"
                            min="1"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            size="sm"
                            className="form-control-sm mx-auto"
                            style={{ width: '80px', fontSize: '13px' }}
                          />
                        ) : (
                          <span style={{ fontSize: '14px' }}>{p.quantity}</span>
                        )}
                      </td>

                      {/* Start Date */}
                      {/* <td className="text-center" style={{ padding: '12px' }}>
                        {isEditing ? (
                          <Form.Control
                            type="date"
                            value={editStartDate}
                            onChange={(e) => setEditStartDate(e.target.value)}
                            size="sm"
                            className="form-control-sm"
                            style={{ fontSize: '13px' }}
                          />
                        ) : p.startDate ? (
                          new Date(p.startDate).toLocaleDateString()
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>

                      <td className="text-center" style={{ padding: '12px' }}>
                        {isEditing ? (
                          <Form.Control
                            type="date"
                            value={editEndDate}
                            onChange={(e) => setEditEndDate(e.target.value)}
                            size="sm"
                            className="form-control-sm"
                            style={{ fontSize: '13px' }}
                          />
                        ) : p.endDate ? (
                          new Date(p.endDate).toLocaleDateString()
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td> */}
                      <td className="text-center" style={{ padding: "12px" }}>
  {isEditing ? (
    <Form.Control
      type="date"
      value={editStartDate}
      onChange={(e) => setEditStartDate(e.target.value)}
      size="sm"
      className="form-control-sm"
      style={{ fontSize: "13px" }}
    />
  ) : p.startDate ? (
    new Date(p.startDate).toLocaleDateString()
  ) : quotation.startDate ? (
    new Date(quotation.startDate).toLocaleDateString()
  ) : (
    <span className="text-muted">-</span>
  )}
</td>

{/* End Date */}
<td className="text-center" style={{ padding: "12px" }}>
  {isEditing ? (
    <Form.Control
      type="date"
      value={editEndDate}
      onChange={(e) => setEditEndDate(e.target.value)}
      size="sm"
      className="form-control-sm"
      style={{ fontSize: "13px" }}
    />
  ) : p.endDate ? (
    new Date(p.endDate).toLocaleDateString()
  ) : quotation.endDate ? (
    new Date(quotation.endDate).toLocaleDateString()
  ) : (
    <span className="text-muted">-</span>
  )}
</td>

                      <td className="text-center" style={{ padding: '12px' }}>
                        <span style={{ fontSize: '14px' }}>₹{p.unitPrice.toLocaleString()}</span>
                      </td>

                      {/* Total */}
                      <td className="text-center fw-bold text-primary" style={{ padding: '12px' }}>
                        <span style={{ fontSize: '14px' }}>₹{(p.unitPrice * p.quantity).toLocaleString()}</span>
                      </td>

                      {/* Actions */}
                      <td className="text-center" style={{ padding: '12px' }}>
                        {isEditing ? (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() =>
                                handleSaveProduct(p._id || p.productId, p)
                              }
                              disabled={updating}
                              className="me-1"
                              title="Save"
                            >
                              <FaSave size={12} />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={cancelEditing}
                              title="Cancel"
                            >
                              <FaBan size={12} />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => startEditingProduct(p)}
                              disabled={isCancelled || isConfirmed}
                              className="me-1"
                              title="Edit"
                            >
                              <FaEdit size={12} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() =>
                                handleDeleteProduct(p._id || p.productId)
                              }
                              disabled={isCancelled || isConfirmed}
                              title="Delete"
                            >
                              <FaTrash size={12} />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
      <Modal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaMoneyBill className="me-2" /> Confirm Payment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select
                value={paymentData.paymentMethod}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    paymentMethod: e.target.value,
                  })
                }
              >
                <option value="">Select</option>
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Payment Type</Form.Label>
              <Form.Select
                value={paymentData.paymentType}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    paymentType: e.target.value,
                  })
                }
              >
                <option value="">Select</option>
                <option value="upi">UPI</option>
                <option value="bankTransfer">Bank Transfer</option>
                <option value="cash">Cash</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, amount: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FaCalendarAlt className="me-2" /> Next Payment Date
              </Form.Label>
              <Form.Control
                type="date"
                value={paymentData.nextPaymentDate}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    nextPaymentDate: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleConfirmPayment}>
            {confirming ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" /> Saving...
              </>
            ) : (
              <>
                <FaCheck className="me-1" /> Confirm & Save
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
        <Card.Header className="bg-light text-dark py-3" style={{ borderRadius: '12px 12px 0 0', fontSize: '14px' }}>
          <strong>Financial Summary</strong>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="g-3">
            <Col md={6} className="offset-md-6">
                <div className="d-flex justify-content-between">
                <span style={{ fontSize: '14px', color: '#e74c3c', fontWeight: 'bold' }}>
                  Deposit Amount:
                </span>
                <span style={{ fontSize: '14px', color: '#e74c3c', fontWeight: 'bold' }}>
                   ₹{client.amount?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span style={{ fontSize: '14px' }}>Subtotal:</span>
                <strong style={{ fontSize: '14px' }}>₹{subtotal.toLocaleString()}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span style={{ fontSize: '14px' }}>Transport:</span>
                <strong style={{ fontSize: '14px' }}>₹{quotation.transportCharges?.toLocaleString() || '0'}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1 text-success">
                <span style={{ fontSize: '14px' }}>GST ({quotation.gst}%):</span>
                <strong style={{ fontSize: '14px' }}>+₹{gstAmount.toLocaleString()}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1 text-danger">
                <span style={{ fontSize: '14px' }}>Discount ({quotation.discount}%):</span>
                <strong style={{ fontSize: '14px' }}>-₹{discountAmount.toLocaleString()}</strong>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between">
                <h5 className="text-dark mb-0" style={{ fontSize: '16px' }}>
                  Grand Total:
                </h5>
                <h5 className="text-primary mb-0" style={{ fontSize: '16px' }}>
                  ₹{grandTotal.toLocaleString()}
                </h5>
              </div>
              
            
          
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Cancel Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <FaInfoCircle className="me-2" />
            Confirm Cancellation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this quotation?</p>
          <Alert variant="warning">
            This action cannot be undone. All editing will be disabled.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            <FaTimes className="me-1" /> No, Keep It
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelQuotation}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-1" />
                Cancelling...
              </>
            ) : (
              <>
                <FaCheck className="me-1" /> Yes, Cancel Quotation
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Orderdetails;