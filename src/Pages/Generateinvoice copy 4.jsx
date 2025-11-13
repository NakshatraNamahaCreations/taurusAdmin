import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import html2pdf from 'html2pdf.js';
import logo from "../assets/t-logo.jpeg"
import axios from 'axios';

const API_URL = "https://api.rentyourpc.com/api/order";

// Company details
const COMPANY_NAME = "Taurus Technologies";
const COMPANY_ADDRESS = "#401/b, sriven rag landmark,3rd floor, 13th cross Wilson garden bangalore";
const COMPANY_PHONE = "+917022296356";
const COMPANY_EMAIL = "contact.taurus@hireapc.in";
const COMPANY_GST = "29AFYPK2328E1Z4";

function Generateinvoice() {
    const {id} = useParams();
    const [orderdata, setOrderdata] = useState(null);
    const [loading, setLoading] = useState(true);
    const invoiceRef = useRef();
    const [invoicename,setInvoicename]=useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
const [newInvoiceName, setNewInvoiceName] = useState("");

    useEffect(()=>{
fetchallinvoicename()
    },[])

    const fetchallinvoicename = async()=>{
         try{
         const response = await axios.get("https://api.rentyourpc.com/api/invoicename/getallinvoicename");
         setInvoicename(response.data.data)
         }catch(error){
            console.log("error",error)
         }
    }
    console.log("invoicename",invoicename)

    const fetchQuotation = async () => {
        try {
            const res = await axios.get(`${API_URL}/getorder/${id}`);
            setOrderdata(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching order:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotation();
    }, [id]);

    const handleUpdateInvoiceName = async (id) => {
  if (!newInvoiceName.trim()) return alert("Invoice name cannot be empty");

  try {
    await axios.put(`https://api.rentyourpc.com/api/invoicename/updateinvoicename/${id}`, {
      invoiceName: newInvoiceName.trim(),
    });
    alert("✅ Invoice name updated successfully!");
    setSelectedInvoice(null);
    fetchallinvoicename(); // refresh updated data
  } catch (error) {
    console.error("Error updating invoice name:", error);
    alert("❌ Failed to update invoice name");
  }
};

    const downloadPDF = () => {
        const element = invoiceRef.current;
        const opt = {
            margin: 0.5,
            filename: `Invoice-${orderdata._id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2" style={{ fontSize: '14px' }}>Loading invoice...</p>
                </div>
            </div>
        );
    }

    if (!orderdata) {
        return <div className="text-center mt-5">Order not found</div>;
    }

    const client = orderdata.clientId || {};
    const subtotal = orderdata.products.reduce(
        (sum, p) => sum + (p.totalPrice || p.unitPrice * p.quantity),
        0
    );
    const gstAmount = (subtotal * orderdata.gst) / 100;
    const discountAmount = (subtotal * orderdata.discount) / 100;
    const grandTotal = subtotal + (orderdata.transportCharges || 0) + gstAmount - discountAmount;

    return (
        <div className="container-fluid p-4" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0" style={{ fontSize: '18px', color: '#2c3e50' }}>Invoice Preview</h4>
                <button 
                    className="btn btn-primary" 
                    onClick={downloadPDF}
                    style={{ fontSize: '14px', padding: '8px 16px' }}
                >
                    Download PDF
                </button>
            </div>

            <div ref={invoiceRef} className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                {/* Header with gradient */}
                <div className="bg-gradient-primary" style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '20px 20px 15px 20px',
                    color: 'white'
                }}>
                      <img 
                                    src={logo} 
                                    alt="Company Logo" 
                                    className="me-3" 
                                    style={{ width: '150px', height: '70px', objectFit: 'cover', borderRadius: '10px', border: '3px solid rgba(255,255,255,0.3)' }}
                                />
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center">
                              
                                <div>
                                  {invoicename.map((data) => (
  <div
    key={data._id}
    className="d-flex align-items-center mb-2"
    style={{ gap: "10px" }}
  >
    {selectedInvoice === data._id ? (
      <>
        <input
          type="text"
          className="form-control"
          value={newInvoiceName}
          onChange={(e) => setNewInvoiceName(e.target.value)}
          onBlur={() => handleUpdateInvoiceName(data._id)} // auto-save when you click outside
          autoFocus
          style={{
            width: "250px",
            fontSize: "16px",
            fontWeight: "bold",
            border: "2px solid #667eea",
            borderRadius: "6px",
            padding: "4px 8px",
          }}
        />
      </>
    ) : (
      <h3
        className="mb-0"
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          cursor: "pointer",
          color: "#fff",
        }}
        onClick={() => {
          setSelectedInvoice(data._id);
          setNewInvoiceName(data.invoiceName);
        }}
        title="Click to edit invoice name"
      >
         {data.invoiceName}
      </h3>
    )}
  </div>
))}
                                   
                                    <p className="mb-1" style={{ fontSize: '12px', opacity: 0.9 }}>
                                        {COMPANY_ADDRESS}
                                    </p>
                                    <p className="mb-1" style={{ fontSize: '12px', opacity: 0.9 }}>
                                        📞 {COMPANY_PHONE}
                                    </p>
                                    <p className="mb-0" style={{ fontSize: '12px', opacity: 0.9 }}>
                                        ✉️ {COMPANY_EMAIL} | 🏢 GST: {COMPANY_GST}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <h2 className="mb-3" style={{ fontSize: '28px', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                                INVOICE
                            </h2>
                            <div className="d-flex flex-column align-items-md-end">
                                <div className="mb-1" style={{ fontSize: '14px' }}>
                                    <strong className="me-2">Invoice No:</strong>
                                    <span>INV-{orderdata._id?.slice(-6).toUpperCase()}</span>
                                </div>
                                <div className="mb-1" style={{ fontSize: '14px' }}>
                                    <strong className="me-2">Date:</strong>
                                    <span>
                                        {new Date(orderdata.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <span 
                                        className={`badge ${orderdata.status === 'confirmed' ? 'bg-success' : 'bg-warning'}`}
                                        style={{ fontSize: '12px', padding: '6px 12px' }}
                                    >
                                        {orderdata.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Info */}
                <div className="card-body p-4" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <h5 className="mb-3" style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>
                                Bill To:
                            </h5>
                            <div className="bg-white p-3 rounded" style={{ borderLeft: '4px solid #667eea' }}>
                                <p className="mb-1" style={{ fontSize: '14px', fontWeight: '600' }}>
                                    {client.clientName || orderdata.clientName}
                                </p>
                                <p className="mb-1" style={{ fontSize: '14px' }}>
                                    {client.address || 'N/A'}
                                </p>
                                <p className="mb-1" style={{ fontSize: '14px' }}>
                                    📱 {client.clientphoneNumber || 'N/A'}
                                </p>
                                <p className="mb-0" style={{ fontSize: '14px' }}>
                                    🏢 GST: {client.gstNo || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <h5 className="mb-3" style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>
                                Rental Period:
                            </h5>
                            <div className="bg-white p-3 rounded" style={{ borderLeft: '4px solid #764ba2' }}>
                                <p className="mb-1" style={{ fontSize: '14px' }}>
                                    <strong>Start Date:</strong> {orderdata.startDate ? new Date(orderdata.startDate).toLocaleDateString() : 'N/A'}
                                </p>
                                <p className="mb-1" style={{ fontSize: '14px' }}>
                                    <strong>End Date:</strong> {orderdata.endDate ? new Date(orderdata.endDate).toLocaleDateString() : 'N/A'}
                                </p>
                                <p className="mb-0" style={{ fontSize: '14px' }}>
                                    <strong>Rental Type:</strong> {orderdata.rentalType?.toUpperCase() || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="table-responsive mb-4">
                        <table className="table table-hover mb-0" style={{ border: '1px solid #dee2e6' }}>
                            <thead className="bg-gradient" style={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white'
                            }}>
                                <tr>
                                    <th className="text-center" style={{ fontSize: '13px', padding: '12px', width: '5%' }}>#</th>
                                    <th style={{ fontSize: '13px', padding: '12px', width: '35%' }}>Product Name</th>
                                    <th className="text-center" style={{ fontSize: '13px', padding: '12px', width: '10%' }}>Qty</th>
                                    <th className="text-center" style={{ fontSize: '13px', padding: '12px', width: '15%' }}>Unit Price</th>
                                    <th className="text-center" style={{ fontSize: '13px', padding: '12px', width: '15%' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderdata.products.map((product, index) => (
                                    <tr key={product._id || product.productId} style={{ 
                                        backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa' 
                                    }}>
                                        <td className="text-center" style={{ fontSize: '14px', padding: '12px' }}>
                                            {index + 1}
                                        </td>
                                        <td style={{ fontSize: '14px', padding: '12px' }}>
                                            <div style={{ fontWeight: '600' }}>{product.productName}</div>
                                            <div className="text-muted" style={{ fontSize: '12px' }}>
                                                {product.productType}
                                            </div>
                                        </td>
                                        <td className="text-center" style={{ fontSize: '14px', padding: '12px' }}>
                                            {product.quantity}
                                        </td>
                                        <td className="text-end" style={{ fontSize: '14px', padding: '12px' }}>
                                            ₹{product.unitPrice?.toLocaleString() || '0'}
                                        </td>
                                        <td className="text-end" style={{ fontSize: '14px', padding: '12px' }}>
                                            ₹{(product.unitPrice * product.quantity).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-1" style={{ fontSize: '14px' }}>
                                <strong className="me-2">Subtotal:</strong>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="mb-1" style={{ fontSize: '14px' }}>
                                <strong className="me-2">Transport:</strong>
                                <span>₹{orderdata.transportCharges?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="mb-1" style={{ fontSize: '14px' }}>
                                <strong className="me-2">GST ({orderdata.gst}%):</strong>
                                <span>₹{gstAmount.toLocaleString()}</span>
                            </div>
                            <div className="mb-1" style={{ fontSize: '14px' }}>
                                <strong className="me-2">Discount ({orderdata.discount}%):</strong>
                                <span>₹{discountAmount.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="border-top pt-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <strong style={{ fontSize: '16px' }}>Grand Total:</strong>
                                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                                        ₹{grandTotal.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h6 className="mb-2" style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                            Terms & Conditions:
                        </h6>
                        <ul className="mb-0" style={{ fontSize: '13px', color: '#7f8c8d', paddingLeft: '15px' }}>
                            <li>All goods are subject to our standard terms and conditions of hire.</li>
                            <li>Payment is due within 30 days of invoice date.</li>
                            <li>Equipment must be returned in same condition as delivered.</li>
                            <li>Any damages will be charged at replacement cost.</li>
                        </ul>
                    </div>

                    <div className="mt-5 pt-3 border-top text-center">
                        <p className="mb-0" style={{ fontSize: '12px', color: '#7f8c8d' }}>
                            Thank you for your business! For any queries, contact us at {COMPANY_EMAIL}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Generateinvoice