import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import logo from "../assets/t-logo.jpeg";
import axios from "axios";

const API_URL = "https://api.rentyourpc.com/api/order";

// Company details
const COMPANY_NAME = "Taurus Technologies";
const COMPANY_ADDRESS =
  "#401/b, sriven rag landmark, 3rd floor, 13th cross Wilson garden, Bangalore";
const COMPANY_PHONE = "+917022296356";
const COMPANY_EMAIL = "contact.taurus@hireapc.in";
const COMPANY_GST = "29AFYPK2328E1Z4";

function Generateinvoice() {
  const { id } = useParams();
  const [orderdata, setOrderdata] = useState(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef();
  const [termsdata,settermsdata]=useState([])

  console.log("orderdata",orderdata);



  const fetchallclientsterms = async()=>{
    try{
       const response = await axios.get(`https://api.rentyourpc.com/api/terms/getbyclient/${orderdata?.clientId?._id}`);
       settermsdata(response.data)
    }catch(error){
      console.log("error",error)
    }
  }

    useEffect(()=>{
    fetchallclientsterms()
  },[orderdata?.clientId?._id])

  console.log("termsdata",termsdata);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API_URL}/getorder/${id}`);
      setOrderdata(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order:", error);
      setLoading(false);
    }
  };

  const handleInvoiceUpdate = async () => {
    if (!orderdata.invoiceNo || !orderdata.invoiceNo.trim()) {
      alert("Invoice number cannot be empty");
      return;
    }

    try {
      const res = await axios.put(
        `${API_URL}/updateinvoice/${orderdata._id}`,
        { invoiceNo: orderdata.invoiceNo.trim() }
      );
      alert("✅ Invoice number updated successfully!");
      setOrderdata({ ...orderdata, isEditingInvoice: false });
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert("❌ Failed to update invoice number");
    }
  };

  // ✅ Download PDF
  const downloadPDF = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 0.5,
      filename: `Invoice-${orderdata.invoiceNo || orderdata._id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2" style={{ fontSize: "14px" }}>
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  if (!orderdata) {
    return <div className="text-center mt-5">Order not found</div>;
  }

  const client = orderdata.clientId || {};
  // const totalDepositSimple = orderdata.clientId.amount || 0;
  const totalDepositSimple = orderdata.products.reduce((sum, p) => sum + (Number(p.depositAmount) || 0), 0);

  const subtotal = orderdata.products.reduce(
    (sum, p) => sum + (p.totalPrice || p.unitPrice * p.quantity),
    0
  );
  const gstAmount = (subtotal * orderdata.gst) / 100;
  const discountAmount = (subtotal * orderdata.discount) / 100;
  const grandTotal =
    subtotal + (orderdata.transportCharges || 0) + gstAmount - discountAmount + totalDepositSimple;

  return (
    <div
      className="container-fluid p-4"
      style={{ maxWidth: "900px", margin: "0 auto" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4
          className="mb-0"
          style={{ fontSize: "18px", color: "#2c3e50", fontWeight: "600" }}
        >
          Invoice Preview
        </h4>
        <button
          className="btn btn-primary"
          onClick={downloadPDF}
          style={{ fontSize: "14px", padding: "8px 16px" }}
        >
          Download PDF
        </button>
      </div>

      {/* INVOICE CARD */}
      <div
        ref={invoiceRef}
        className="card shadow-sm border-0"
        style={{ borderRadius: "12px", overflow: "hidden" }}
      >
        {/* HEADER */}
        <div
          className="bg-gradient-primary"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "20px 20px 15px 20px",
            color: "white",
          }}
        >
          <div className="row align-items-center">
            <div className="col-md-6 d-flex align-items-center">
              <img
                src={logo}
                alt="Company Logo"
                style={{
                  width: "120px",
                  height: "60px",
                  objectFit: "cover",
                  marginRight: "15px",
                  borderRadius: "8px",
                  border: "2px solid rgba(255,255,255,0.3)",
                }}
              />
              <div>
                <h4 className="mb-1 fw-bold">{COMPANY_NAME}</h4>
                <p className="mb-1" style={{ fontSize: "12px", opacity: 0.9 }}>
                  {COMPANY_ADDRESS}
                </p>
                <p className="mb-1" style={{ fontSize: "12px", opacity: 0.9 }}>
                  📞 {COMPANY_PHONE}
                </p>
                <p className="mb-0" style={{ fontSize: "12px", opacity: 0.9 }}>
                  ✉️ {COMPANY_EMAIL} | 🏢 GST: {COMPANY_GST}
                </p>
              </div>
            </div>

            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              <h2
                className="mb-3"
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                INVOICE
              </h2>

              <div
                className="mb-2 d-flex justify-content-md-end align-items-center"
                style={{ gap: "8px" }}
              >
                <strong>Invoice No:</strong>
                {orderdata.isEditingInvoice ? (
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={orderdata.invoiceNo || ""}
                    onChange={(e) =>
                      setOrderdata({ ...orderdata, invoiceNo: e.target.value })
                    }
                    onBlur={handleInvoiceUpdate}
                    autoFocus
                    style={{ width: "150px", fontSize: "14px" }}
                  />
                ) : (
                  <span
                    style={{
                      cursor: "pointer",
                      color: "#fff",
                      textDecoration: "underline",
                    }}
                    title="Click to edit invoice number"
                    onClick={() =>
                      setOrderdata({ ...orderdata, isEditingInvoice: true })
                    }
                  >
                    {orderdata.invoiceNo ||
                      `INV-${orderdata._id?.slice(-6).toUpperCase()}`}
                  </span>
                )}
              </div>

              <div className="mb-1" style={{ fontSize: "14px" }}>
                <strong>Date:</strong>{" "}
                {new Date(orderdata.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span
                  className={`badge ${
                    orderdata.status === "confirmed"
                      ? "bg-success"
                      : "bg-warning"
                  }`}
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  {orderdata.status?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-4" style={{ backgroundColor: "#f8f9fa" }}>
          <div className="row mb-4">
            <div className="col-md-6">
              <h5
                className="mb-3"
                style={{ fontSize: "16px", fontWeight: "600", color: "#2c3e50" }}
              >
                Bill To:
              </h5>
              <div
                className="bg-white p-3 rounded"
                style={{ borderLeft: "4px solid #667eea" }}
              >
                <p className="mb-1 fw-bold">{client.clientName}</p>
                <p className="mb-1">{client.address || "N/A"}</p>
                <p className="mb-1">📱 {client.clientphoneNumber || "N/A"}</p>
                <p className="mb-0">🏢 GST: {client.gstNo || "N/A"}</p>
              </div>
            </div>
            <div className="col-md-6">
              <h5
                className="mb-3"
                style={{ fontSize: "16px", fontWeight: "600", color: "#2c3e50" }}
              >
                Rental Period:
              </h5>
              <div
                className="bg-white p-3 rounded"
                style={{ borderLeft: "4px solid #764ba2" }}
              >
                <p className="mb-1">
                  <strong>Start Date:</strong>{" "}
                  {orderdata.startDate
                    ? new Date(orderdata.startDate).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="mb-1">
                  <strong>End Date:</strong>{" "}
                  {orderdata.endDate
                    ? new Date(orderdata.endDate).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="mb-0">
                  <strong>Rental Type:</strong>{" "}
                  {orderdata.rentalType?.toUpperCase() || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="table-responsive mb-4">
            <table className="table table-hover mb-0">
              <thead
                className="bg-gradient"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                }}
              >
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orderdata.products.map((p, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      <strong>{p.productName}</strong>
                      <div className="text-muted" style={{ fontSize: "12px" }}>
                        {p.productType}
                      </div>
                    </td>
                    <td className="text-center">{p.quantity}</td>
                    <td className="text-end">₹{p.unitPrice}</td>
                    <td className="text-end">
                      ₹{(p.unitPrice * p.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="row">
            <div className="col-md-6">
                 <p>
                <strong>Deposit amount:</strong> ₹{totalDepositSimple.toLocaleString()}
              </p>
              <p>
                <strong>Subtotal:</strong> ₹{subtotal.toLocaleString()}
              </p>
              <p>
                <strong>Transport:</strong> ₹
                {orderdata.transportCharges?.toLocaleString() || "0"}
              </p>
              <p>
                <strong>GST ({orderdata.gst}%):</strong> ₹
                {gstAmount.toLocaleString()}
              </p>
              <p>
                <strong>Discount ({orderdata.discount}%):</strong> ₹
                {discountAmount.toLocaleString()}
              </p>
            </div>
            <div className="col-md-6 text-end">
              <h5 className="border-top pt-2">
                <strong>Grand Total:</strong>{" "}
                <span style={{ color: "#667eea", fontSize: "20px" }}>
                  ₹{grandTotal.toLocaleString()}
                </span>
              </h5>
            </div>
          </div>

         

          <div className="mt-4">
  {termsdata.length > 0 ? (
    termsdata.map((term) => (
      <div key={term._id} className="mb-2">
        {term.title && <strong>{term.title}</strong>}
        <ul style={{ fontSize: "13px", color: "#7f8c8d" }}>
          {term.points.map((point) => (
            <li key={point._id}>{point.description}</li>
          ))}
        </ul>
      </div>
    ))
  ) : (
    <p style={{ fontSize: "13px", color: "#7f8c8d" }}></p>
  )}
</div>


          <div className="mt-5 pt-3 border-top text-center">
            <p style={{ fontSize: "12px", color: "#7f8c8d" }}>
              Thank you for your business! For any queries, contact us at{" "}
              {COMPANY_EMAIL}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Generateinvoice;
