import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Card, Table } from "react-bootstrap";

const API_URL = "https://api.rentyourpc.com/api/terms";
const CLIENT_URL = "https://api.rentyourpc.com/api/client/getallclients";

function Terms() {
  const [clients, setClients] = useState([]);
  const [termsList, setTermsList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    clientId: "",
    clientName: "",
    title: "",
    points: [{ pointNumber: 1, description: "" }],
  });

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(CLIENT_URL);
        setClients(res.data.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  // Fetch all terms
  const fetchTerms = async () => {
    try {
      const res = await axios.get(`${API_URL}/getallterms`);
      setTermsList(res.data);
    } catch (error) {
      console.error("Error fetching terms:", error);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle point change
  const handlePointChange = (index, value) => {
    const newPoints = [...formData.points];
    newPoints[index].description = value;
    setFormData((prev) => ({ ...prev, points: newPoints }));
  };

  // Add new point
  const addPoint = () => {
    const newPointNumber = formData.points.length + 1;
    setFormData((prev) => ({
      ...prev,
      points: [...prev.points, { pointNumber: newPointNumber, description: "" }],
    }));
  };

  // Remove point
  const removePoint = (index) => {
    const newPoints = formData.points.filter((_, i) => i !== index);
    newPoints.forEach((p, i) => (p.pointNumber = i + 1));
    setFormData((prev) => ({ ...prev, points: newPoints }));
  };

  // Handle client selection
  const handleClientSelect = (e) => {
    const selectedClient = clients.find((c) => c._id === e.target.value);
    setFormData((prev) => ({
      ...prev,
      clientId: selectedClient?._id || "",
      clientName: selectedClient?.clientName || "",
    }));
  };

  // Open modal for add
  const handleAdd = () => {
    setIsEdit(false);
    setFormData({
      _id: "",
      clientId: "",
      clientName: "",
      title: "",
      points: [{ pointNumber: 1, description: "" }],
    });
    setShowModal(true);
  };

  // Open modal for edit
  const handleEdit = (term) => {
    setIsEdit(true);
    setFormData({
      _id: term._id,
      clientId: term.clientId,
      clientName: term.clientName,
      title: term.title,
      points: term.points,
    });
    setShowModal(true);
  };

  // Delete term
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this term?")) {
      try {
        await axios.delete(`${API_URL}/deleteterms/${id}`);
        fetchTerms();
      } catch (error) {
        console.error("Error deleting term:", error);
      }
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`${API_URL}/updateterms/${formData._id}`, formData);
      } else {
        await axios.post(`${API_URL}/create`, formData);
      }
      setShowModal(false);
      fetchTerms();
    } catch (error) {
      console.error("Error saving terms:", error);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "800px", fontSize: "14px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-semibold text-primary mb-0" style={{ fontSize: "16px" }}>
          Terms & Conditions
        </h4>
        <Button variant="primary" onClick={handleAdd}>
          Add Terms
        </Button>
      </div>

      {/* Terms List */}
      <Table striped bordered hover responsive>
        <thead style={{ fontSize: "13px" }}>
          <tr>
            <th>#</th>
            <th>Client Name</th>
            <th>Title</th>
            <th>Points</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody style={{ fontSize: "13px" }}>
          {termsList.map((term, index) => (
            <tr key={term._id}>
              <td>{index + 1}</td>
              <td>{term.clientName}</td>
              <td>{term.title}</td>
              <td>
                <ol>
                  {term.points.map((p) => (
                    <li key={p.pointNumber}>{p.description}</li>
                  ))}
                </ol>
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEdit(term)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(term._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "15px" }}>
            {isEdit ? "Edit Terms & Conditions" : "Add Terms & Conditions"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px" }}>Select Client</Form.Label>
              <Form.Select
                name="clientId"
                value={formData.clientId}
                onChange={handleClientSelect}
              >
                <option value="">-- Select Client --</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.clientName} ({client.clientphoneNumber})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px" }}>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter title"
                style={{ fontSize: "14px" }}
              />
            </Form.Group>

            <Form.Label style={{ fontSize: "13px" }}>Points</Form.Label>
            {formData.points.map((point, index) => (
              <div key={index} className="d-flex mb-2">
                <Form.Control
                  type="text"
                  placeholder={`Point ${point.pointNumber}`}
                  value={point.description}
                  onChange={(e) => handlePointChange(index, e.target.value)}
                  style={{ fontSize: "14px" }}
                />
                <Button
                  variant="danger"
                  size="sm"
                  className="ms-2"
                  onClick={() => removePoint(index)}
                >
                  X
                </Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={addPoint} className="mb-2">
              + Add Point
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Terms;
