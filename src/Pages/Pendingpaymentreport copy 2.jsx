import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Card,
  Container,
  Row,
  Col,
  Form,
  Button,
  Pagination,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { FaCalendarAlt, FaEdit, FaFileInvoice } from "react-icons/fa";

dayjs.extend(isBetween);

function Pendingpaymentreport() {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formData, setFormData] = useState({
    paymentMethod: "",
    paymentType: "",
    amount: "",
    nextPaymentDate: "",
  });

  const paymentsPerPage = 5;
  const navigate = useNavigate();
  const textStyle = { fontSize: "13.5px" };

  useEffect(() => {
    fetchAllPayments();
  }, []);

  const fetchAllPayments = async () => {
    try {
      const response = await axios.get(
        "https://api.rentyourpc.com/api/payment/getNextPaymentsdate"
      );
      const data = response.data.payments || [];
      const normalized = data.map((p) => ({
        ...p,
        _nextPaymentDateObj: p.nextPaymentDate ? dayjs(p.nextPaymentDate) : null,
      }));
      setPendingPayments(normalized);
      setFilteredPayments(normalized);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const handleShowModal = (payment) => {
    setSelectedPayment(payment);
    setFormData({
      paymentMethod: payment.paymentMethod || "",
      paymentType: payment.paymentType || "",
      amount: payment.amount || "",
      nextPaymentDate: payment.nextPaymentDate
        ? dayjs(payment.nextPaymentDate).format("YYYY-MM-DD")
        : "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdatePayment = async () => {
    if (!selectedPayment) return;
    try {
      await axios.put(
        `https://api.rentyourpc.com/api/payment/update/${selectedPayment._id}`,
        formData
      );
      alert("✅ Payment updated successfully!");
      setShowModal(false);
      fetchAllPayments();
    } catch (error) {
      alert("❌ Failed to update payment.");
    }
  };

  // ✅ Quick Filter Logic
  const applyQuickFilter = (type) => {
    setFilterType(type);
    const today = dayjs().startOf("day");
    let filtered = [];

    const match = (start, end) =>
      pendingPayments.filter(
        (p) =>
          p._nextPaymentDateObj &&
          p._nextPaymentDateObj.isBetween(start, end, null, "[]")
      );

    switch (type) {
      case "today":
        filtered = match(today, today.endOf("day"));
        break;
      case "tomorrow":
        filtered = match(today.add(1, "day"), today.add(1, "day").endOf("day"));
        break;
      case "week":
        filtered = match(today.startOf("week"), today.endOf("week"));
        break;
      case "month":
        filtered = match(today.startOf("month"), today.endOf("month"));
        break;
      case "year":
        filtered = match(today.startOf("year"), today.endOf("year"));
        break;
      default:
        filtered = pendingPayments;
    }

    setFilteredPayments(filtered);
  };

  // ✅ Date Range Filter
  const handleDateRange = () => {
    if (!fromDate || !toDate) return;
    const start = dayjs(fromDate);
    const end = dayjs(toDate).endOf("day");
    const filtered = pendingPayments.filter(
      (p) =>
        p._nextPaymentDateObj &&
        p._nextPaymentDateObj.isBetween(start, end, null, "[]")
    );
    setFilteredPayments(filtered);
    setFilterType("custom");
  };

  const indexOfLast = currentPage * paymentsPerPage;
  const indexOfFirst = indexOfLast - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  return (
    <Container fluid className="mt-4">
      <Card className="shadow-lg border-0 rounded-4">
        <div
          className="p-3 rounded-top-4 text-white"
          style={{
            background: "linear-gradient(90deg, #3b82f6, #9333ea)",
          }}
        >
          <h5 className="mb-0" style={{ fontSize: "15px", fontWeight: "600" }}>
            <FaCalendarAlt className="me-2" />
            Pending Payment Report
          </h5>
        </div>

        <Card.Body className="p-4" style={{ backgroundColor: "#fafafa" }}>
          {/* 🔍 Filter Section */}
          <Row className="align-items-end mb-3">
            <Col md={3}>
              <Form.Label style={textStyle}>From Date</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={textStyle}
              />
            </Col>
            <Col md={3}>
              <Form.Label style={textStyle}>To Date</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={textStyle}
              />
            </Col>
            <Col md={2} className="mt-2 mt-md-0">
              <Button
                variant="primary"
                className="w-100 rounded-pill shadow-sm"
                size="sm"
                style={{ fontSize: "13px" }}
                onClick={handleDateRange}
              >
                Apply
              </Button>
            </Col>
            <Col md={4} className="mt-3 mt-md-0 text-md-end">
              {["all", "today", "tomorrow", "week", "month", "year"].map((t) => (
                <Button
                  key={t}
                  variant={filterType === t ? "primary" : "outline-primary"}
                  size="sm"
                  className="me-1 mb-1 rounded-pill shadow-sm"
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    transition: "all 0.2s ease-in-out",
                  }}
                  onClick={() => applyQuickFilter(t)}
                >
                  {t === "all"
                    ? "All"
                    : t === "today"
                    ? "Today"
                    : t === "tomorrow"
                    ? "Tomorrow"
                    : t === "week"
                    ? "This Week"
                    : t === "month"
                    ? "This Month"
                    : "This Year"}
                </Button>
              ))}
            </Col>
          </Row>

          {/* 💰 Payment Table */}
          <div
            className="rounded-3 shadow-sm bg-white p-2"
            style={{ overflowX: "auto" }}
          >
            <Table
              hover
              responsive
              className="text-center align-middle"
              style={{
                fontSize: "13.5px",
                borderRadius: "10px",
              }}
            >
              <thead style={{ backgroundColor: "#f1f5f9" }}>
                <tr>
                  <th>#</th>
                  <th>Client Name</th>
                  <th>Phone</th>
                  <th>Next Payment</th>
                  <th>Amount (₹)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.length ? (
                  currentPayments.map((p, idx) => (
                    <tr
                      key={p._id}
                      style={{
                        transition: "all 0.2s ease",
                      }}
                      className="hover-row"
                    >
                      <td>{indexOfFirst + idx + 1}</td>
                      <td>{p.clientId?.clientName || "N/A"}</td>
                      <td>{p.clientId?.clientphoneNumber || "N/A"}</td>
                      <td>
                        {p._nextPaymentDateObj
                          ? p._nextPaymentDateObj.format("DD-MM-YYYY")
                          : "N/A"}
                      </td>
                      <td>{p.amount ?? 0}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2 rounded-pill"
                          style={textStyle}
                          onClick={() => handleShowModal(p)}
                        >
                          <FaEdit className="me-1" /> Edit
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="rounded-pill"
                          style={textStyle}
                          onClick={() =>
                            navigate(`/generate-order/${p.orderId?._id}`)
                          }
                        >
                          <FaFileInvoice className="me-1" /> Invoice
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-muted py-3">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* 📄 Pagination */}
          {totalPages > 1 && (
            <Pagination className="justify-content-end mt-3">
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i}
                  active={i + 1 === currentPage}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </Card.Body>
      </Card>

      {/* 💳 Update Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "14px" }}>
            Update Payment Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "13.5px" }}>
          {selectedPayment && (
            <>
              <p>
                <strong>Client:</strong> {selectedPayment.clientId?.clientName}
              </p>
             
              <Form>
                <Form.Group className="mb-2">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    style={textStyle}
                  >
                    <option value="">Select</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Payment Type</Form.Label>
                  <Form.Select
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleChange}
                    style={textStyle}
                  >
                    <option value="">Select</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank Transfer</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Amount (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    style={textStyle}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Next Payment Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="nextPaymentDate"
                    value={formData.nextPaymentDate}
                    onChange={handleChange}
                    style={textStyle}
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleUpdatePayment}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Small Hover Style */}
      <style>{`
        .hover-row:hover {
          background-color: #eef2ff !important;
          transform: scale(1.005);
        }
      `}</style>
    </Container>
  );
}

export default Pendingpaymentreport;
