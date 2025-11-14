import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import logo from "../assets/t-logo.jpeg";
import axios from 'axios';

const API_URL = "https://api.rentyourpc.com/api/order";

const COMPANY_NAME = "Taurus Technologies";
const COMPANY_ADDRESS = "#401/B, Sriven Rag Landmark, 3rd Floor, 13th Cross, Wilson Garden, Bangalore";
const COMPANY_PHONE = "+91 70222 96356";
const COMPANY_EMAIL = "contact.taurus@hireapc.in";
const COMPANY_GST = "29AFYPK2328E1Z4";

function Deliverychallan() {
  const { id } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingDC, setEditingDC] = useState(false);
  const [dcNumber, setDCNumber] = useState("");
  const invoiceRef = useRef();

  // Fetch order data
  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API_URL}/getorder/${id}`);
      setOrderData(res.data);
      setDCNumber(res.data.deliveryChallanNo || ""); // set initial DC number
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Save DC number to backend
  const saveDCNumber = async () => {
    if (!dcNumber.trim()) return alert("Delivery Challan number cannot be empty");
    try {
      await axios.put(`${API_URL}/updatedeliverychallanno/${id}`, { deliveryChallanNo: dcNumber.trim() });
      alert("✅ Delivery Challan number updated successfully!");
      setEditingDC(false);
      fetchOrder(); // refresh order data
    } catch (error) {
      console.error("Error updating DC number:", error);
      alert("❌ Failed to update Delivery Challan number");
    }
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading Delivery Challan...</div>;
  if (!orderData) return <div style={{ textAlign: "center", marginTop: "50px", color: "red" }}>Failed to load delivery details.</div>;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div ref={invoiceRef} style={{
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        fontSize: '14px',
        lineHeight: 1.6,
        color: '#4a5568'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', flex: 1, minWidth: '300px' }}>
            <img src={logo} alt="Company Logo" style={{ height: '60px', borderRadius: '4px', objectFit: 'contain' }} />
            <div style={{ fontSize: '14px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#2c3e50', margin: '4px 0' }}>{COMPANY_NAME}</h1>
              <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>{COMPANY_ADDRESS}</p>
              <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>Phone: {COMPANY_PHONE}</p>
              <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>Email: {COMPANY_EMAIL}</p>
              <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>GSTIN: {COMPANY_GST}</p>
            </div>
          </div>

          <div style={{ textAlign: 'right', minWidth: '200px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1e40af', margin: '0 0 12px' }}>DELIVERY CHALLAN</h2>
            
            {editingDC ? (
              <input
                type="text"
                value={dcNumber}
                onChange={(e) => setDCNumber(e.target.value)}
                onBlur={saveDCNumber}
                autoFocus
                style={{ padding: "6px 8px", fontSize: "16px", fontWeight: "600", width: "150px" }}
              />
            ) : (
              <p onClick={() => setEditingDC(true)} style={{ cursor: "pointer" }}>
                <strong>Challan No:</strong> {dcNumber || "Click to add"}
              </p>
            )}

            <p><strong>Date:</strong> {formatDate(new Date().toISOString())}</p>
          </div>
        </div>

        <hr style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '24px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
          <div>
            <h3 style={{ fontSize: '16px', color: '#2d3748', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #edf2f7' }}>Deliver To:</h3>
            <p style={{ fontWeight: '600' }}>{orderData.clientName || "N/A"}</p>
            <p>{orderData.clientId?.address || "Address not provided"}</p>
            <p>Phone: {orderData.clientId?.clientphoneNumber || "N/A"}</p>
            <p>Email: {orderData.clientId?.email || "N/A"}</p>
            {orderData.clientId?.gstNo && <p>GSTIN: {orderData.clientId.gstNo}</p>}
          </div>

          <div>
            <h3 style={{ fontSize: '16px', color: '#2d3748', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #edf2f7' }}>Delivery Details:</h3>
            <p><strong>From:</strong> {formatDate(orderData.startDate)}</p>
            <p><strong>To:</strong> {formatDate(orderData.endDate)}</p>
            <p><strong>Rental Type:</strong> {orderData.rentalType?.charAt(0).toUpperCase() + orderData.rentalType?.slice(1) || "N/A"}</p>
            <p><strong>Joining Date:</strong> {formatDate(orderData.clientId?.joiningdate)}</p>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '16px', color: '#2d3748', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #edf2f7' }}>Items Delivered</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0' }}>Item Description</th>
                <th style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0' }}>Quantity</th>
                <th style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0' }}>Available After Delivery</th>
              </tr>
            </thead>
            <tbody>
              {orderData.products?.length > 0 ? orderData.products.map((product, i) => (
                <tr key={i}>
                  <td style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0' }}>{product.productName || "N/A"}</td>
                  <td style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0' }}>{product.quantity || 0}</td>
                  <td style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0' }}>{product.availableQty || "N/A"}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: '#a0aec0', fontStyle: 'italic' }}>No items to display</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '25px', padding: '12px', backgroundColor: '#f0f9ff', borderLeft: '3px solid #3182ce', borderRadius: '0 4px 4px 0', fontStyle: 'italic', color: '#2c5282' }}>
          Note: This document serves as proof of delivery only. It does not represent a financial invoice.
        </div>

       
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
            <div style={{ height: '1px', backgroundColor: '#4a5568', margin: '0 auto 12px', width: '200px' }}></div>
            <p style={{ fontWeight: '600', color: '#2d3748', margin: '8px 0 4px' }}>For {COMPANY_NAME}</p>
            <p>Authorized Signatory</p>
          </div>
          <div style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
            <div style={{ height: '1px', backgroundColor: '#4a5568', margin: '0 auto 12px', width: '200px' }}></div>
            <p style={{ fontWeight: '600', color: '#2d3748', margin: '8px 0 4px' }}>{orderData.clientName || "Client Name"}</p>
            <p>Client Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Deliverychallan;
