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
dayjs.extend(isBetween);

function Pendingpaymentreport() {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formData, setFormData] = useState({
    paymentMethod: "",
    paymentType: "",
    amount: "",
    nextPaymentDate: "",
    paymentStatus: "", // ✅ added
  });
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllPayments();
  }, []);

  const fetchAllPayments = async () => {
    try {
      const res = await axios.get(
        "https://api.rentyourpc.com/api/payment/getNextPaymentsdate"
      );
      const data = res.data.payments || [];
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

  // ✅ Filtering
  const handleFilter = (type) => {
    setFilterType(type);
    const today = dayjs().startOf("day");
    let filtered = [];

    switch (type) {
      case "today":
        filtered = pendingPayments.filter((p) =>
          p._nextPaymentDateObj?.isSame(today, "day")
        );
        break;
      case "tomorrow":
        filtered = pendingPayments.filter((p) =>
          p._nextPaymentDateObj?.isSame(today.add(1, "day"), "day")
        );
        break;
      case "week":
        filtered = pendingPayments.filter((p) =>
          p._nextPaymentDateObj?.isBetween(
            today.startOf("week"),
            today.endOf("week"),
            null,
            "[]"
          )
        );
        break;
      case "month":
        filtered = pendingPayments.filter((p) =>
          p._nextPaymentDateObj?.isBetween(
            today.startOf("month"),
            today.endOf("month"),
            null,
            "[]"
          )
        );
        break;
      case "year":
        filtered = pendingPayments.filter((p) =>
          p._nextPaymentDateObj?.isBetween(
            today.startOf("year"),
            today.endOf("year"),
            null,
            "[]"
          )
        );
        break;
      case "custom":
        if (fromDate && toDate) {
          filtered = pendingPayments.filter((p) =>
            p._nextPaymentDateObj?.isBetween(
              dayjs(fromDate),
              dayjs(toDate),
              null,
              "[]"
            )
          );
        } else {
          alert("Please select both From and To dates");
        }
        break;
      default:
        filtered = pendingPayments;
    }

    setFilteredPayments(filtered);
    setCurrentPage(1);
  };

  // ✅ Show modal
  const handleShowModal = (p) => {
    setSelectedPayment(p);
    setFormData({
      paymentMethod: p.paymentMethod || "",
      paymentType: p.paymentType || "",
      amount: p.amount || "",
      nextPaymentDate: p.nextPaymentDate
        ? dayjs(p.nextPaymentDate).format("YYYY-MM-DD")
        : "",
      paymentStatus: p.paymentStatus || "pending", // default pending
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Update payment (Create new payment in backend)
  const handleUpdatePayment = async () => {
    try {
      const payload = {
        orderId: selectedPayment?.orderId?._id,
        clientId: selectedPayment?.clientId?._id,
        paymentMethod: formData.paymentMethod,
        paymentType: formData.paymentType,
        amount: formData.amount,
        nextPaymentDate: formData.nextPaymentDate,
        paymentStatus: formData.paymentStatus, // ✅ include status
      };

      await axios.post("https://api.rentyourpc.com/api/payment/createpayment", payload);

      alert("Payment updated successfully!");
      setShowModal(false);
      fetchAllPayments();
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  // Pagination
  const indexOfLast = currentPage * paymentsPerPage;
  const indexOfFirst = indexOfLast - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  const textStyle = { fontSize: "13px" };

  return (
    <Container fluid className="py-4">
      <Card className="p-3 shadow-sm border-0">
        <Row className="align-items-center mb-3">
          <Col>
            <h5 style={{ fontSize: "15px", fontWeight: 600 }}>
              Pending Payment Report
            </h5>
          </Col>
        </Row>

        {/* 🔍 Filter Section */}
        <Row className="align-items-end mb-3" style={{ fontSize: "13px" }}>
          <Col xs={12} md={2}>
            <Form.Label>From</Form.Label>
            <Form.Control
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={textStyle}
            />
          </Col>
          <Col xs={12} md={2}>
            <Form.Label>To</Form.Label>
            <Form.Control
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={textStyle}
            />
          </Col>
          <Col xs="auto" className="mt-3 mt-md-0">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handleFilter("custom")}
            >
              Apply
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant={filterType === "today" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => handleFilter("today")}
            >
              Today
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant={filterType === "tomorrow" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => handleFilter("tomorrow")}
            >
              Tomorrow
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant={filterType === "week" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => handleFilter("week")}
            >
              This Week
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant={filterType === "month" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => handleFilter("month")}
            >
              This Month
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant={filterType === "year" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => handleFilter("year")}
            >
              This Year
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant={filterType === "all" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => handleFilter("all")}
              style={{ marginTop: "10px" }}
            >
              All
            </Button>
          </Col>
        </Row>

        {/* 🧾 Table */}
        <div style={{ overflowX: "auto" }}>
          <Table bordered hover responsive style={{ fontSize: "13.5px" }}>
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Phone</th>
                <th>Next Payment</th>
                <th>Amount (₹)</th>
                {/* <th>Status</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.length > 0 ? (
                currentPayments.map((p, i) => (
                  <tr key={p._id}>
                    <td>{indexOfFirst + i + 1}</td>
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
                        className="me-2"
                        onClick={() => handleShowModal(p)}
                      >
                        Pay
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() =>
                          navigate(`/generate-invoice/${p.orderId._id}`)
                        }
                      >
                        Invoice
                      </Button>
                       <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(p)}
                      >
                        updatepay
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-3">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* 📄 Pagination */}
        {totalPages > 1 && (
          <Pagination className="justify-content-end">
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        )}
      </Card>

      {/* 💰 Update Payment Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "14px" }}>Update Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "13px" }}>
          {selectedPayment && (
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

              <Form.Group className="mb-2">
                <Form.Label>Next Payment Date</Form.Label>
                <Form.Control
                  type="date"
                  name="nextPaymentDate"
                  value={formData.nextPaymentDate}
                  onChange={handleChange}
                  style={textStyle}
                />
              </Form.Group>

              {/* ✅ Payment Status Dropdown */}
              <Form.Group className="mb-2">
                <Form.Label>Payment Status</Form.Label>
                <Form.Select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  style={textStyle}
                >
                  <option value="">Select</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleUpdatePayment}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Pendingpaymentreport;
