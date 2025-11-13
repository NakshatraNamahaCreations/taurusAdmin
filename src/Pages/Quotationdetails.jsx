import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Card, Row, Col, Form, Spinner, Alert } from "react-bootstrap";
import { FaTrash, FaCheck, FaTimes, FaDownload } from "react-icons/fa";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from "../assets/t-logo.jpeg";

const API_URL = "https://api.rentyourpc.com/api/quotations";

// Company details
const COMPANY_NAME = "Taurus Technologies";
const COMPANY_ADDRESS = "#401/b, sriven rag landmark,3rd floor, 13th cross Wilson garden bangalore";
const COMPANY_PHONE = "+917022296356";
const COMPANY_EMAIL = "contact.taurus@hireapc.in";
const COMPANY_GST = "29AFYPK2328E1Z4";

function QuotationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchQuotation = async () => {
    try {
      const res = await axios.get(`${API_URL}/getbyquotation/${id}`);
      setQuotation(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quotation:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const isCancelled = quotation?.status === "cancelled";

  const handleQuantityChange = (index, value) => {
    if (isCancelled) return;
    const newQty = Math.max(1, Number(value));
    const updatedProducts = [...quotation.products];
    const product = updatedProducts[index];
    product.quantity = newQty;
    product.totalPrice = product.unitPrice * newQty;
    setQuotation({ ...quotation, products: updatedProducts });
    updateQuotationOnServer(updatedProducts, quotation.startDate, quotation.endDate);
  };

  const handleDateChange = (field, value) => {
    if (isCancelled) return;
    const updatedQuotation = { ...quotation, [field]: value };
    setQuotation(updatedQuotation);
    updateQuotationOnServer(quotation.products, updatedQuotation.startDate, updatedQuotation.endDate);
  };

  const updateQuotationOnServer = async (products, startDate, endDate) => {
    if (isCancelled) return;
    try {
      setUpdating(true);
      const subtotal = products.reduce((sum, p) => sum + p.totalPrice, 0);
      const gstAmount = (subtotal * quotation.gst) / 100;
      const discountAmount = (subtotal * quotation.discount) / 100;
      const grandTotal = subtotal + quotation.transportCharges + gstAmount - discountAmount;

      await axios.put(`${API_URL}/editquotation/${quotation._id}`, {
        clientName: quotation.clientName,
        products,
        gst: quotation.gst,
        discount: quotation.discount,
        transportCharges: quotation.transportCharges,
        rentalType: quotation.rentalType,
        startDate,
        endDate,
        grandTotal,
      });
      setUpdating(false);
    } catch (error) {
      console.error("Error updating quotation:", error);
      setUpdating(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (isCancelled) return;
    if (!window.confirm("Delete this product from quotation?")) return;
    try {
      await axios.delete(`${API_URL}/${quotation._id}/product/${productId}`);
      fetchQuotation();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleCancelQuotation = async () => {
    if (!window.confirm("Are you sure you want to cancel this quotation?")) return;

    setCancelling(true);
    try {
      await axios.put(`${API_URL}/cancelquotation/${quotation._id}`);
      alert("Quotation cancelled successfully!");
      fetchQuotation();
    } catch (error) {
      console.error("Error cancelling quotation:", error);
      alert("Failed to cancel quotation!");
    } finally {
      setCancelling(false);
    }
  };

  const handleGenerateOrder = async () => {
    if (isCancelled) return;
    if (!window.confirm("Generate order for this quotation?")) return;
    try {
      await axios.post(`${API_URL}/generate-order/${quotation._id}`);
      alert("Order generated successfully!");
      navigate("/order-list");
    } catch (error) {
      console.error("Error generating order:", error);
      alert("Failed to generate order!");
    }
  };

  const calculateDays = () => {
    if (!quotation?.startDate || !quotation?.endDate) return 1;
    const start = new Date(quotation.startDate);
    const end = new Date(quotation.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleDownloadPDF = async () => {
    try {
      const pdfContent = document.createElement('div');
      pdfContent.id = 'pdf-content';
      pdfContent.style.position = 'absolute';
      pdfContent.style.left = '-9999px';
      pdfContent.style.top = '0';
      pdfContent.style.width = '210mm';
      pdfContent.style.padding = '20px';
      pdfContent.style.backgroundColor = '#ffffff';
      pdfContent.style.fontFamily = 'Arial, sans-serif';
      pdfContent.style.fontSize = '12px';
      pdfContent.style.lineHeight = '1.4';

      const client = quotation.clientId || {};
      const subtotal = quotation.products.reduce((sum, p) => sum + p.totalPrice, 0);
      const gstAmount = (subtotal * quotation.gst) / 100;
      const discountAmount = (subtotal * quotation.discount) / 100;
      const grandTotal = subtotal + quotation.transportCharges + gstAmount - discountAmount;
      const deliveryDate = new Date(quotation.startDate).toLocaleDateString();
      const dismantleDate = new Date(quotation.endDate).toLocaleDateString();
      const noOfDays = calculateDays();

      const logoDataUrl = logo ? await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg'));
        };
        img.src = logo;
      }) : null;

      pdfContent.innerHTML = `
        <div style="max-width: 210mm; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #2c6bb5;">
            <div style="flex: 1;">
              ${logoDataUrl ? `<img src="${logoDataUrl}" alt="Logo" style="height: 60px;" />` : `<h2>${COMPANY_NAME}</h2>`}
            </div>
            <div style="text-align: right; flex: 1;">
              <h1 style="color: #000; font-size: 24px; margin: 0;">Quotation</h1>
              <p style="margin: 5px 0; font-size: 14px; color: #666;">ID: ${quotation._id}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #666;">Date: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div style="display: flex; margin-bottom: 20px;">
            <div style="flex: 1; padding-right: 10px;">
              <h3 style="color: #2c6bb5; margin: 0 0 10px; font-size: 14px; border-bottom: 1px solid #2c6bb5; padding-bottom: 5px;">Company Details</h3>
              <p><strong>${COMPANY_NAME}</strong></p>
              <p>${COMPANY_ADDRESS}</p>
              <p>Phone: ${COMPANY_PHONE}</p>
              <p>Email: ${COMPANY_EMAIL}</p>
              <p>GST: ${COMPANY_GST}</p>
            </div>
            <div style="flex: 1; padding-left: 10px;">
              <h3 style="color: #2c6bb5; margin: 0 0 10px; font-size: 14px; border-bottom: 1px solid #2c6bb5; padding-bottom: 5px;">Client Details</h3>
              <p><strong>${client.clientName || quotation.clientName || "N/A"}</strong></p>
              <p>${client.address || "N/A"}</p>
              <p>Phone: ${client.clientphoneNumber || "N/A"}</p>
              <p>Email: ${client.email || "N/A"}</p>
              <p>GST: ${client.gst || "N/A"}</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold; background-color: #f8f9fa;">Delivery Date</td>
              <td style="padding: 8px; border: 1px solid #ccc;">${deliveryDate}</td>
              <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold; background-color: #f8f9fa;">Dismantle Date</td>
              <td style="padding: 8px; border: 1px solid #ccc;">${dismantleDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold; background-color: #f8f9fa;">Rental Type</td>
              <td style="padding: 8px; border: 1px solid #ccc;">${quotation.rentalType || "N/A"}</td>
              <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold; background-color: #f8f9fa;">No of Days</td>
              <td style="padding: 8px; border: 1px solid #ccc;">${noOfDays}</td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #2c6bb5; color: white;">
                <th style="padding: 8px; border: 1px solid #2c6bb5; text-align: left;">S.No</th>
                <th style="padding: 8px; border: 1px solid #2c6bb5; text-align: left;">Product Name</th>
                <th style="padding: 8px; border: 1px solid #2c6bb5; text-align: right;">Unit Price</th>
                <th style="padding: 8px; border: 1px solid #2c6bb5; text-align: center;">Qty</th>
                <th style="padding: 8px; border: 1px solid #2c6bb5; text-align: center;">Days</th>
                <th style="padding: 8px; border: 1px solid #2c6bb5; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${quotation.products.map((p, i) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ccc;">${i + 1}</td>
                  <td style="padding: 8px; border: 1px solid #ccc;">${p.productName}</td>
                  <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">₹${p.unitPrice.toLocaleString()}</td>
                  <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${p.quantity}</td>
                  <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${noOfDays}</td>
                  <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">₹${p.totalPrice.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px; border: 1px solid #ccc; font-weight: bold; background-color: #f8f9fa;">Subtotal</td><td style="padding: 8px; border: 1px solid #ccc; text-align: right;">₹${subtotal.toLocaleString()}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ccc; font-weight: bold; background-color: #f8f9fa;">Transportation</td><td style="padding: 8px; border: 1px solid #ccc; text-align: right;">₹${quotation.transportCharges?.toLocaleString() || "0"}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ccc; font-weight: bold; background-color: #f8f9fa;">Discount (${quotation.discount}%)</td><td style="padding: 8px; border: 1px solid #ccc; text-align: right;">- ₹${discountAmount.toLocaleString()}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ccc; font-weight: bold; background-color: #f8f9fa;">GST (${quotation.gst}%)</td><td style="padding: 8px; border: 1px solid #ccc; text-align: right;">₹${gstAmount.toLocaleString()}</td></tr>
            <tr style="font-weight: bold; background-color: #e9f0f7;"><td style="padding: 8px; border: 1px solid #ccc; font-size: 14px;">Grand Total</td><td style="padding: 8px; border: 1px solid #ccc; text-align: right; font-size: 14px;">₹${grandTotal.toLocaleString()}</td></tr>
          </table>

          <div style="margin-top: 20px; padding: 15px; border: 1px solid #2c6bb5; background-color: #f9f9f9;">
            <strong style="color: #2c6bb5;">Notes:</strong>
            <ol style="margin: 10px 0; padding-left: 20px; font-size: 11px;">
              <li>Additional elements would be charged on actuals, transportation would be additional.</li>
              <li>100% Payment for confirmation of event.</li>
              <li>Costing is merely for estimation purposes. Requirements are blocked post payment in full.</li>
              <li>If inventory is not reserved with payments, we are not committed to keep it.</li>
              <li>The nature of the rental industry that our furniture is frequently moved and transported, which can lead to scratches on glass, minor chipping of paintwork, & minor stains etc. We ask you to visit the warehouse to inspect blocked furniture if you wish.</li>
            </ol>
          </div>

          <div style="margin-top: 20px; text-align: center; padding-top: 10px; border-top: 1px solid #ccc; font-size: 11px; color: #666;">
            <p>Thank you for your business!</p>
            <p>${COMPANY_NAME} | ${COMPANY_PHONE} | ${COMPANY_EMAIL}</p>
          </div>
        </div>
      `;

      document.body.appendChild(pdfContent);
      await new Promise(resolve => setTimeout(resolve, 500));
      const canvas = await html2canvas(pdfContent, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      document.body.removeChild(pdfContent);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Quotation-${quotation._id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading quotation details...</p>
      </div>
    );
  }

  if (!quotation) return <div className="text-center mt-5">No Quotation Found</div>;

  const client = quotation.clientId || {};
  const subtotal = quotation.products.reduce((sum, p) => sum + p.totalPrice, 0);
  const gstAmount = (subtotal * quotation.gst) / 100;
  const discountAmount = (subtotal * quotation.discount) / 100;
  const grandTotal = subtotal + quotation.transportCharges + gstAmount - discountAmount;
  const noOfDays = calculateDays();

  const getStatusBadge = (status) => {
    const base = { padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" };
    switch (status) {
      case "confirmed": return { ...base, backgroundColor: "#dcfce7", color: "#166534", border: "1px solid #4ade80" };
      case "cancelled": return { ...base, backgroundColor: "#fee2e2", color: "#b91c1c", border: "1px solid #f87171" };
      default: return { ...base, backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fbbf24" };
    }
  };

  return (
    <div className="container mt-4" style={{ fontSize: "14px", maxWidth: "920px" }}>
      {/* Cancelled Banner */}
      {isCancelled && (
        <Alert variant="danger" className="text-center fw-bold mb-4" style={{ borderRadius: "12px" }}>
          This quotation has been CANCELLED. All editing is disabled.
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold" style={{ color: "#1e293b" }}>Quotation Details</h5>
        <div className="d-flex gap-2">
          <Button
            size="sm"
            onClick={handleDownloadPDF}
            style={{ backgroundColor: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", fontWeight: "600" }}
          >
            <FaDownload size={12} /> Download PDF
          </Button>
          <Button
            size="sm"
            disabled={updating || isCancelled}
            style={{ backgroundColor: updating ? "#e2e8f0" : "#dbeafe", color: updating ? "#64748b" : "#1d4ed8" }}
          >
            {updating ? <>Saving...</> : "Saved"}
          </Button>
        </div>
      </div>

      {/* Client & Dates Card */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
        <div className="p-4" style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)" }}>
          <Row className="g-3">
            <Col md={6}>
              <div><small className="text-muted fw-bold">Client</small><p className="fw-medium">{client.clientName || quotation.clientName || "N/A"}</p></div>
              <div><small className="text-muted fw-bold">Phone</small><p>{client.clientphoneNumber || "N/A"}</p></div>
              <div><small className="text-muted fw-bold">Email</small><p>{client.email || "N/A"}</p></div>
            </Col>
            <Col md={6}>
              <div><small className="text-muted fw-bold">Address</small><p>{client.address || "N/A"}</p></div>
              <div><small className="text-muted fw-bold">GST No</small><p>{client.gstNo || "N/A"}</p></div>
              <div><small className="text-muted fw-bold">Status</small><div style={getStatusBadge(quotation.status)} className="mt-1">{quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}</div></div>
            </Col>
          </Row>
          <hr className="my-4" />
          <Row className="g-3">
            <Col md={6}>
              <Form.Label className="fw-bold">Start Date</Form.Label>
              <Form.Control
                type="date"
                value={quotation.startDate ? new Date(quotation.startDate).toISOString().split("T")[0] : ""}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                disabled={isCancelled}
                style={{ backgroundColor: isCancelled ? "#f5f5f5" : "#00000069" }}
              />
            </Col>
            <Col md={6}>
              <Form.Label className="fw-bold">End Date</Form.Label>
              <Form.Control
                type="date"
                value={quotation.endDate ? new Date(quotation.endDate).toISOString().split("T")[0] : ""}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                disabled={isCancelled}
                style={{ backgroundColor: isCancelled ? "#f5f5f5" : "#00000069" }}
              />
            </Col>
          </Row>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
        <div className="p-3">
          <h6 className="fw-bold mb-3">Products</h6>
          <Table hover className="align-middle mb-0" style={{ fontSize: "13px" }}>
            <thead style={{ backgroundColor: "#f8fafc" }}>
              <tr>
                <th>Product</th><th>Type</th><th className="text-center">Qty</th><th className="text-center">Unit Price</th><th className="text-center">Total</th><th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {quotation.products.map((p, index) => (
                <tr key={p.productId || index}>
                  <td className="fw-medium">{p.productName}</td>
                  <td>{p.productType}</td>
                  <td className="text-center">
                    <Form.Control
                      type="number"
                      min="1"
                      value={p.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      disabled={isCancelled}
                      style={{ width: "80px", margin: "0 auto", backgroundColor: isCancelled ? "#f5f5f5" : "white" }}
                    />
                  </td>
                  <td className="text-center">₹{p.unitPrice.toLocaleString()}</td>
                  <td className="text-center fw-bold" style={{ color: "#3b82f6" }}>₹{p.totalPrice.toLocaleString()}</td>
                  <td className="text-center">
                    <Button
                      size="sm"
                      variant="light"
                      onClick={() => handleDeleteProduct(p.productId)}
                      disabled={isCancelled}
                      style={{ backgroundColor: isCancelled ? "#f0f0f0" : "#fef2f2", border: "1px solid #fecaca", opacity: isCancelled ? 0.6 : 1 }}
                    >
                      <FaTrash size={12} style={{ color: isCancelled ? "#999" : "#dc2626" }} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Totals */}
      <Card className="border-0 mb-4" style={{ borderRadius: "16px", background: "#f8fafc" }}>
        <div className="p-4">
          <Row className="g-2 mb-3">
            <Col md={6} className="text-muted">Subtotal:</Col><Col md={6} className="text-end fw-medium">₹{subtotal.toLocaleString()}</Col>
            <Col md={6} className="text-muted">Transport Charges:</Col><Col md={6} className="text-end fw-medium">₹{quotation.transportCharges?.toLocaleString() || "0"}</Col>
            <Col md={6} className="text-muted">GST ({quotation.gst}%):</Col><Col md={6} className="text-end fw-medium" style={{ color: "#3b82f6" }}>₹{gstAmount.toLocaleString()}</Col>
            <Col md={6} className="text-muted">Discount ({quotation.discount}%):</Col><Col md={6} className="text-end fw-medium" style={{ color: "#ef4444" }}>- ₹{discountAmount.toLocaleString()}</Col>
          </Row>
          <hr />
          <div className="d-flex justify-content-between align-items-center mt-2">
            <h6 className="mb-0 fw-bold">Grand Total:</h6>
            <h4 className="mb-0 fw-bold" style={{ color: "#1d4ed8" }}>₹{grandTotal.toLocaleString()}</h4>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="d-flex gap-3 mt-3">
        <Button
          className="flex-grow-1 py-2"
          style={{ backgroundColor: "#10b981", border: "none", opacity: isCancelled ? 0.6 : 1 }}
          onClick={handleGenerateOrder}
          disabled={isCancelled}
        >
          <FaCheck className="me-2" /> Generate Order
        </Button>

        <Button
          variant="outline-danger"
          className="flex-grow-1 py-2"
          style={{ borderColor: "#f87171", color: "#dc2626", opacity: isCancelled ? 0.6 : 1 }}
          onClick={handleCancelQuotation}
          disabled={cancelling || isCancelled}
        >
          {cancelling ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Cancelling...
            </>
          ) : (
            <>
              <FaTimes className="me-2" />
              {isCancelled ? "Cancelled" : "Cancel Quotation"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default QuotationDetails;