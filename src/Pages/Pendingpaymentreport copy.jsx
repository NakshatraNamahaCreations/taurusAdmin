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
} from "react-bootstrap";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

function Pendingpaymentreport() {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 5;

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
      setFilterType("all");
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  console.log("pendingPayments",pendingPayments)

  const computeBalance = (payment) => {
    const clientAmount = Number(payment.clientId?.amount ?? payment.clientId?.amount ?? 0);
    const orderGrand = Number(payment.orderId?.grandTotal ?? payment.orderId?.grandTotal ?? 0);
    return clientAmount - orderGrand;
  };

  const handleFilter = (type) => {
    setFilterType(type);
    setFromDate("");
    setToDate("");
    const today = dayjs().startOf("day");
    let filtered = [];

    switch (type) {
      case "today":
        filtered = pendingPayments.filter((p) =>
          p._nextPaymentDateObj &&
          p._nextPaymentDateObj.isBetween(today, today.endOf("day"), null, "[]")
        );
        break;

      case "tomorrow": {
        const t = today.add(1, "day");
        filtered = pendingPayments.filter((p) =>
          p._nextPaymentDateObj &&
          p._nextPaymentDateObj.isBetween(t, t.endOf("day"), null, "[]")
        );
        break;
      }

      case "week": {
        const start = today.startOf("week");
        const end = today.endOf("week");
        filtered = pendingPayments.filter((p) =>
          p._nextPaymentDateObj && p._nextPaymentDateObj.isBetween(start, end, null, "[]")
        );
        break;
      }

      case "month": {
        const start = today.startOf("month");
        const end = today.endOf("month");
        filtered = pendingPayments.filter((p) =>
          p._nextPaymentDateObj && p._nextPaymentDateObj.isBetween(start, end, null, "[]")
        );
        break;
      }

      case "year": {
        const start = today.startOf("year");
        const end = today.endOf("year");
        filtered = pendingPayments.filter((p) =>
          p._nextPaymentDateObj && p._nextPaymentDateObj.isBetween(start, end, null, "[]")
        );
        break;
      }

      default:
        filtered = pendingPayments;
    }

    setFilteredPayments(filtered);
    setCurrentPage(1);
  };

  const handleCustomFilter = () => {
    if (!fromDate || !toDate) {
      setFilteredPayments(pendingPayments);
      setFilterType("all");
      setCurrentPage(1);
      return;
    }

    const start = dayjs(fromDate).startOf("day");
    const end = dayjs(toDate).endOf("day");

    const filtered = pendingPayments.filter((p) =>
      p._nextPaymentDateObj && p._nextPaymentDateObj.isBetween(start, end, null, "[]")
    );

    setFilteredPayments(filtered);
    setFilterType("custom");
    setCurrentPage(1);
  };

  // pagination calculation
  const indexOfLast = currentPage * paymentsPerPage;
  const indexOfFirst = indexOfLast - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(Math.max(filteredPayments.length, 0) / paymentsPerPage);

  return (
    <Container fluid className="mt-4">
      <Card className="shadow-sm p-3">
        <Row className="align-items-center mb-3">
          <Col md={6}>
            <h5 style={{ fontSize: "16px", fontWeight: 600 }}>📅 Pending Payment Reminders</h5>
          </Col>

          <Col md={6} className="text-end">
            <Form className="d-inline-block me-2">
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ display: "inline-block", width: "160px", fontSize: "13px", marginRight: "8px" }}
              />
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ display: "inline-block", width: "160px", fontSize: "13px", marginRight: "8px" }}
              />
              <Button variant="primary" size="sm" onClick={handleCustomFilter} style={{ fontSize: "13px" }}>
                Apply
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                  setFilteredPayments(pendingPayments);
                  setFilterType("all");
                  setCurrentPage(1);
                }}
                style={{ fontSize: "13px", marginLeft: "8px" }}
              >
                Reset
              </Button>
            </Form>
          </Col>
        </Row>

        <div className="mb-3 text-center">
          {[
            { key: "all", label: "All" },
            { key: "today", label: "Today" },
            { key: "tomorrow", label: "Tomorrow" },
            { key: "week", label: "This Week" },
            { key: "month", label: "This Month" },
            { key: "year", label: "This Year" },
          ].map((f) => (
            <Button
              key={f.key}
              variant={filterType === f.key ? "dark" : "outline-dark"}
              size="sm"
              onClick={() => handleFilter(f.key)}
              className="me-2 mb-2"
              style={{ fontSize: "13px" }}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <div style={{ overflowX: "auto" }}>
          <Table striped bordered hover responsive className="text-center" style={{ fontSize: "13px" }}>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Client Name</th>
                <th>Phone Number</th>
                <th>Next Payment Date</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.length > 0 ? (
                currentPayments.map((p, idx) => {
                  const client = p.clientId || {};
                  const displayNextDate = p._nextPaymentDateObj ? p._nextPaymentDateObj.format("DD-MM-YYYY") : "N/A";
                  const balance = computeBalance(p);
                  return (
                    <tr key={p._id}>
                      <td>{indexOfFirst + idx + 1}</td>
                      <td style={{ fontSize: "14px" }}>{client.clientName || p.clientName || "N/A"}</td>
                      <td>{client.clientphoneNumber || p.clientphoneNumber || "N/A"}</td>
                      <td>{displayNextDate}</td>
                 
                      <td style={{ fontWeight: 600 }}>{p.amount ?? 0}</td>
                

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

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="justify-content-end">
            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} />
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
                  {page}
                </Pagination.Item>
              );
            })}
            <Pagination.Next onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        )}
      </Card>
    </Container>
  );
}

export default Pendingpaymentreport;
