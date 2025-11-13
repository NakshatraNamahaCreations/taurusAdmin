import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Form, Pagination, Card, Container, Row, Col } from "react-bootstrap";

function Paymentreport() {
  const [allPayment, setAllPayment] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(5);

  useEffect(() => {
    fetchAllPayments();
  }, []);

  const fetchAllPayments = async () => {
    try {
      const response = await axios.get("https://api.rentyourpc.com/api/payment/getallpayment");
      setAllPayment(response.data.payments || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  // 🔍 Search filter (by name, phone, or payment status)
  const filteredPayments = allPayment.filter((p) => {
    const name = p.clientId?.clientName || p.clientName || "";
    const phone = p.clientId?.clientphoneNumber || p.clientphoneNumber || "";
    const status = p.paymentStatus || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // 📄 Pagination logic
  const indexOfLast = currentPage * paymentsPerPage;
  const indexOfFirst = indexOfLast - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <Container fluid className="mt-4">
      <Card className="shadow-sm p-3">
        <Row className="align-items-center mb-3">
          <Col md={6}>
            <h5 style={{ fontSize: "16px", fontWeight: "600" }}>💳 Payment Report</h5>
          </Col>
          <Col md={6} className="text-end">
            <Form.Control
              type="text"
              placeholder="Search by name, phone, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: "13px", width: "70%", display: "inline-block" }}
            />
          </Col>
        </Row>

        <div style={{ overflowX: "auto" }}>
          <Table striped bordered hover responsive className="text-center" style={{ fontSize: "13px" }}>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Client Name</th>
                <th>Phone Number</th>
                <th>Payment Status</th>
                <th>Payment Method</th>
                <th>Payment Type</th>
                <th>Payment Date</th>
                <th>Next Payment Date</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.length > 0 ? (
                currentPayments.map((payment, index) => {
                  const client = payment.clientId || {};
                  return (
                    <tr key={payment._id}>
                      <td>{indexOfFirst + index + 1}</td>
                      <td>{client.clientName || payment.clientName || "N/A"}</td>
                      <td>{client.clientphoneNumber || payment.clientphoneNumber || "N/A"}</td>
                      <td>
                        <span
                          className={`badge ${
                            payment.paymentStatus === "paid"
                              ? "bg-success"
                              : payment.paymentStatus === "pending"
                              ? "bg-warning text-dark"
                              : "bg-secondary"
                          }`}
                        >
                          {payment.paymentStatus?.toUpperCase() || "N/A"}
                        </span>
                      </td>
                      <td>{payment.paymentMethod || "N/A"}</td>
                      <td>{payment.paymentType || "N/A"}</td>
                      <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td>{new Date(payment.nextPaymentDate).toLocaleDateString()}</td>
                      <td style={{ fontWeight: "600" }}>{payment.amount || 0}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9">No payments found</td>
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
                key={i}
                active={i + 1 === currentPage}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        )}
      </Card>
    </Container>
  );
}

export default Paymentreport;
