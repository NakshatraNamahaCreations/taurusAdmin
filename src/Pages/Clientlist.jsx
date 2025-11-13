import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Form,
  Button,
  Badge,
  Pagination,
  Modal,
} from "react-bootstrap";
import { FaEdit, FaTrashAlt, FaUserFriends, FaInfoCircle } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

function Clientlist() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    clientName: "",
    clientphoneNumber: "",
    email: "",
    gstNo: "",
    joiningdate: "",
    address: "",
    amount: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 5;

  const ApiURL = "https://api.rentyourpc.com/api/client";

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ApiURL}/getallclients`);
      setClients(res.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch clients");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleDateChange = (dateValue) => {
    setForm((prev) => ({ ...prev, joiningdate: dateValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${ApiURL}/edit-client/${editId}`, form);
        toast.success("Client updated successfully");
      } else {
        await axios.post(`${ApiURL}/add-client`, form);
        toast.success("Client added successfully");
      }
      resetForm();
      fetchClients();
      setShowModal(false);
    } catch (error) {
      toast.error("Operation failed");
      console.error(error);
    }
  };

  const resetForm = () => {
    setForm({
      clientName: "",
      clientphoneNumber: "",
      email: "",
      gstNo: "",
      joiningdate: "",
      address: "",
      amount: "",
    });
    setEditId(null);
  };

  const handleEdit = (client) => {
    setEditId(client._id);
    setForm({
      clientName: client.clientName || "",
      clientphoneNumber: client.clientphoneNumber || "",
      email: client.email || "",
      gstNo: client.gstNo || "",
      joiningdate: client.joiningdate?.split("T")[0] || "",
      address: client.address || "",
      amount: client.amount || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    try {
      await axios.delete(`${ApiURL}/deleteclient/${id}`);
      toast.success("Client deleted successfully");
      fetchClients();
    } catch (error) {
      toast.error("Failed to delete client");
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await axios.put(`${ApiURL}/toggleactive/${id}`);
      toast.success(`Client marked ${currentStatus ? "inactive" : "active"}`);
      fetchClients();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Pagination
  const totalPages = Math.ceil(clients.length / limit);
  const indexOfLast = page * limit;
  const indexOfFirst = indexOfLast - limit;
  const currentClients = clients.slice(indexOfFirst, indexOfLast);

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

  return (
    <Container
      fluid
      style={{
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        padding: "32px",
        fontSize: "14px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          alignItems: "center",
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
          <FaUserFriends />
          Client Management
        </h5>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          style={{
            backgroundColor: "#bd5525",
            border: "none",
            fontSize: "14px",
            padding: "8px 18px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: 500,
          }}
        >
          <FaUserFriends /> Add Client
        </Button>
      </div>

      {/* Table Card */}
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
            <p style={{ textAlign: "center", padding: "1.5rem", color: "#64748b" }}>
              Loading...
            </p>
          ) : (
            <>
              <Table
                hover
                responsive
                className="align-middle"
                style={{ fontSize: "14px" }}
              >
                <thead
                  style={{
                    backgroundColor: "#f8fafc",
                    color: "#334155",
                    fontWeight: 600,
                  }}
                >
                  <tr>
                    <th style={{ width: "5%", padding: "12px" }}>S.No</th>
                    <th style={{ padding: "12px" }}>Name</th>
                    <th style={{ padding: "12px" }}>Phone</th>
                    <th style={{ padding: "12px" }}>Email</th>
                    <th style={{ padding: "12px" }}>GST</th>
                    <th style={{ padding: "12px" }}>Join Date</th>
                    <th style={{ padding: "12px" }}>Amount</th>
                    <th style={{ padding: "12px" }}>Address</th>
                    <th style={{ padding: "12px" }}>Status</th>
                    <th style={{ width: "10%", padding: "12px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentClients.length > 0 ? (
                    currentClients.map((client, index) => (
                      <tr
                        key={client._id}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={{ padding: "12px" }}>{indexOfFirst + index + 1}</td>
                        <td
                          style={{
                            padding: "12px",
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {client.clientName}
                        </td>
                        <td style={{ padding: "12px" }}>{client.clientphoneNumber}</td>
                        <td style={{ padding: "12px", color: "#334155" }}>
                          {client.email}
                        </td>
                        <td style={{ padding: "12px" }}>{client.gstNo}</td>
                        <td style={{ padding: "12px" }}>
                          {client.joiningdate
                            ? new Date(client.joiningdate).toLocaleDateString("en-GB")
                            : "-"}
                        </td>
                        <td style={{ padding: "12px", fontWeight: 500 }}>
                          ₹{client.amount}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            maxWidth: "180px",
                            wordWrap: "break-word",
                            color: "#475569",
                          }}
                        >
                          {client.address}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <Badge
                            bg={client.isActive ? "success" : "secondary"}
                            text={client.isActive ? "light" : "dark"}
                            style={{
                              fontSize: "12px",
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontWeight: 500,
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onClick={() => handleToggle(client._id, client.isActive)}
                          >
                            {client.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <FaEdit
                            style={{
                              color: "#3b82f6",
                              cursor: "pointer",
                              marginRight: "14px",
                              fontSize: "16px",
                              transition: "color 0.2s",
                            }}
                            onClick={() => handleEdit(client)}
                          />
                          <FaTrashAlt
                            style={{
                              color: "#ef4444",
                              cursor: "pointer",
                              fontSize: "16px",
                              transition: "color 0.2s",
                            }}
                            onClick={() => handleDelete(client._id)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="10"
                        style={{
                          textAlign: "center",
                          padding: "1.5rem",
                          color: "#94a3b8",
                        }}
                      >
                        No clients found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
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
                        style={{
                          fontSize: "13px",
                          padding: "6px 10px",
                          margin: "0 2px",
                        }}
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

      {/* ✨ Modal with Special Date Picker */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          resetForm();
        }}
        centered
        size="lg"
        animation={true}
        backdrop={true}
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
              <FaUserFriends
                style={{
                  color: editId ? "#3b82f6" : "#bd5525",
                  fontSize: "20px",
                }}
              />
              {editId ? "Edit Client Details" : "Add New Client"}
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
              <FaInfoCircle style={{ color: "#94a3b8" }} />
              Fill in the details below to {editId ? "update" : "register"} a client.
            </p>
          </div>
        </Modal.Header>

        <Modal.Body style={{ padding: "24px" }}>
          <Form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <Form.Group>
                <Form.Label
                  style={{
                    fontWeight: 500,
                    marginBottom: "6px",
                    display: "block",
                    fontSize: "14px",
                  }}
                >
                  Client Name <span style={{ color: "#e53e3e" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="clientName"
                  value={form.clientName}
                  onChange={handleChange}
                  required
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#94a3b8")}
                  onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label
                  style={{
                    fontWeight: 500,
                    marginBottom: "6px",
                    display: "block",
                    fontSize: "14px",
                  }}
                >
                  Phone Number
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="clientphoneNumber"
                  value={form.clientphoneNumber}
                  onChange={handleChange}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#94a3b8")}
                  onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label
                  style={{
                    fontWeight: 500,
                    marginBottom: "6px",
                    display: "block",
                    fontSize: "14px",
                  }}
                >
                  Email
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#94a3b8")}
                  onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label
                  style={{
                    fontWeight: 500,
                    marginBottom: "6px",
                    display: "block",
                    fontSize: "14px",
                  }}
                >
                  GST No
                </Form.Label>
                <Form.Control
                  name="gstNo"
                  value={form.gstNo}
                  onChange={handleChange}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#94a3b8")}
                  onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                />
              </Form.Group>

              {/* ✅ Special Joining Date Field */}
         <Form.Group>
  <Form.Label
    style={{
      fontWeight: 500,
      marginBottom: "6px",
      display: "block",
      fontSize: "14px",
    }}
  >
    Joining Date
  </Form.Label>
  {/* <div style={{ position: "relative", width: "100%" }}>
    <input
      type="date"
      value={form.joiningdate}
      onChange={(e) => setForm((prev) => ({ ...prev, joiningdate: e.target.value }))}
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        fontSize: "14px",
        color: "transparent",
        textShadow: "0 0 0 #0f172a",
        backgroundColor: "transparent",
        cursor: "pointer",
        appearance: "none", 
        MozAppearance: "none",
        WebkitAppearance: "none",
      }}
      placeholder="Select a date"
    />

    <span
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#94a3b8",
        pointerEvents: "none",
      }}
    >
      📅
    </span>
  </div> */}
  <input type="date" 
   onChange={(e) => setForm((prev) => ({ ...prev, joiningdate: e.target.value }))}
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        fontSize: "14px",
        color: "black",
        // textShadow: "0 0 0 #0f172a",
        backgroundColor: "#00000069",
        // cursor: "pointer",
        // appearance: "none", 
        // MozAppearance: "none",
        // WebkitAppearance: "none",
      }} />
</Form.Group>

              <Form.Group>
                <Form.Label
                  style={{
                    fontWeight: 500,
                    marginBottom: "6px",
                    display: "block",
                    fontSize: "14px",
                  }}
                >
                  Amount
                </Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#94a3b8")}
                  onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                />
              </Form.Group>

              <Form.Group style={{ gridColumn: "1 / -1" }}>
                <Form.Label
                  style={{
                    fontWeight: 500,
                    marginBottom: "6px",
                    display: "block",
                    fontSize: "14px",
                  }}
                >
                  Address
                </Form.Label>
                <Form.Control
                  as="textarea"
                  name="address"
                  rows={3}
                  value={form.address}
                  onChange={handleChange}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    resize: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#94a3b8")}
                  onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                />
              </Form.Group>
            </div>
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
              backgroundColor: editId ? "#3b82f6" : "#bd5525",
              border: "none",
            }}
          >
            {editId ? "Update Client" : "Add Client"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Clientlist;