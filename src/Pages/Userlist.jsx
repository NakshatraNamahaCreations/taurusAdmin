import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Card,
  Table,
  Container,
  Badge,
  Pagination,
} from "react-bootstrap";
import { FaEdit, FaTrashAlt, FaUserShield } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const ApiURL = "https://api.rentyourpc.com/api/master";

function Userlist() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [permissionsList] = useState([
    "user",
    "clients",
    "orders",
    "quotation",
    "paymentreports",
    "termsandcondition",
    "product"
  ]);

  const [updatedMember, setUpdatedMember] = useState({
    name: "",
    email: "",
    password: "",
    permissions: {},
  });

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    password: "",
    permissions: {},
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      const res = await axios.get(`${ApiURL}/getallteammembers`);
      setAllMembers(res.data.data || []);
      setCurrentPage(1); // Reset to first page on fresh data
    } catch (error) {
      toast.error("Failed to fetch team members");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(allMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMembers = allMembers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const deleteMember = async (id) => {
    try {
      const res = await axios.delete(`${ApiURL}/deleteteammember/${id}`);
      if (res.status === 200) {
        toast.success("Member deleted successfully");
        fetchData();
      }
    } catch {
      toast.error("Failed to delete member");
    }
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    const permissions = {};
    permissionsList.forEach((perm) => {
      permissions[perm] = member[perm] || false;
    });

    setUpdatedMember({
      name: member.name || "",
      email: member.email || "",
      password: member.password || "",
      permissions,
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...updatedMember, ...updatedMember.permissions };
      delete payload.permissions;

      const res = await axios.put(
        `${ApiURL}/updateteammember/${selectedMember._id}`,
        payload
      );

      if (res.status === 200) {
        toast.success("Member updated successfully");
        setShowEditModal(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update member");
      console.error(error);
    }
  };

  const handleAdd = async () => {
    try {
      const payload = { ...newMember, ...newMember.permissions };
      delete payload.permissions;

      const res = await axios.post(`${ApiURL}/addteammember`, payload);
      if (res.status === 200) {
        toast.success("Member added successfully");
        setShowAddModal(false);
        setNewMember({ name: "", email: "", password: "", permissions: {} });
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to add member");
      console.error(error);
    }
  };

  const handleChange = (field, value, isNew = false) => {
    const setFn = isNew ? setNewMember : setUpdatedMember;
    setFn((prev) => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = (key, isNew = false) => {
    const setFn = isNew ? setNewMember : setUpdatedMember;
    setFn((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <h5 style={{ margin: 0, color: "#1e293b", fontWeight: 600, fontSize: "16px" }}>
          <FaUserShield className="me-2" />
          Team Members
        </h5>
        <Button
          onClick={() => setShowAddModal(true)}
          style={{
            backgroundColor: "#bd5525",
            border: "none",
            fontSize: "14px",
            padding: "8px 18px",
            borderRadius: "8px",
          }}
        >
          + Add Member
        </Button>
      </div>

      {/* Table */}
      <Card
        className="shadow-sm"
        style={{
          borderRadius: "10px",
          border: "none",
          fontSize: "14px",
        }}
      >
        <Card.Body>
          <Table hover responsive className="align-middle" style={{ fontSize: "14px" }}>
            <thead style={{ backgroundColor: "#f1f5f9", color: "#475569" }}>
              <tr>
                <th style={{ width: "5%" }}>S.No</th>
                <th style={{ width: "20%" }}>Name</th>
                <th style={{ width: "25%" }}>Email</th>
                <th style={{ width: "20%" }}>Password</th>
                <th style={{ width: "20%" }}>Permissions</th>
                <th style={{ width: "10%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentMembers.length > 0 ? (
                currentMembers.map((row, index) => (
                  <tr key={row._id}>
                    <td>{startIndex + index + 1}</td>
                    <td className="fw-semibold">{row.name}</td>
                    <td>{row.email}</td>
                    <td style={{ color: "#64748b" }}>{row.password}</td>
                    <td>
                      {permissionsList
                        .filter((perm) => row[perm])
                        .map((perm) => (
                          <Badge
                            key={perm}
                            bg="light"
                            className="me-1"
                            style={{
                              backgroundColor: "#e9ecef",
                              color: "#334155",
                              fontWeight: 500,
                              fontSize: "12px",
                              padding: "4px 8px",
                            }}
                          >
                            {perm}
                          </Badge>
                        ))}
                    </td>
                    <td>
                      <FaEdit
                        style={{
                          color: "#2563eb",
                          cursor: "pointer",
                          marginRight: "12px",
                        }}
                        onClick={() => handleEdit(row)}
                      />
                      <FaTrashAlt
                        style={{
                          color: "#dc2626",
                          cursor: "pointer",
                        }}
                        onClick={() => deleteMember(row._id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-3 text-muted">
                    No Members Found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination size="sm" style={{ fontSize: "13px" }}>
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => handlePageChange(i + 1)}
                    style={{ fontSize: "13px" }}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Team Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form style={{ fontSize: "14px" }}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={updatedMember.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={updatedMember.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={updatedMember.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Permissions</Form.Label>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {permissionsList.map((key) => (
                  <Form.Check
                    key={key}
                    type="switch"
                    id={`edit-${key}`}
                    label={key}
                    checked={updatedMember.permissions[key] || false}
                    onChange={() => handlePermissionChange(key)}
                  />
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ fontSize: "13px" }}>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} style={{ backgroundColor: "#2563eb" }}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form style={{ fontSize: "14px" }}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={newMember.name}
                onChange={(e) => handleChange("name", e.target.value, true)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={newMember.email}
                onChange={(e) => handleChange("email", e.target.value, true)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={newMember.password}
                onChange={(e) => handleChange("password", e.target.value, true)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Permissions</Form.Label>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {permissionsList.map((key) => (
                  <Form.Check
                    key={key}
                    type="switch"
                    id={`add-${key}`}
                    label={key}
                    checked={newMember.permissions[key] || false}
                    onChange={() => handlePermissionChange(key, true)}
                  />
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ fontSize: "13px" }}>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} style={{ backgroundColor: "#bd5525" }}>
            Add Member
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Userlist;