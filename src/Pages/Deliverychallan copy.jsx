import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import logo from "../assets/t-logo.jpeg";

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
  const invoiceRef = useRef();

  const fetchQuotation = async () => {
    try {
      const res = await fetch(`${API_URL}/getorder/${id}`);
      const data = await res.json();
      setOrderData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f9fafb'
      }}>
        Loading Delivery Challan...
      </div>
    );
  }

  if (!orderData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#e53e3e',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f9fafb'
      }}>
        Failed to load delivery details.
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Inline styles
  const containerStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    padding: '40px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    borderRadius: '10px',
    // fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#4a5568'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    flexWrap: 'wrap'
  };

  const logoSectionStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    flex: 1,
    minWidth: '300px'
  };

  const logoStyle = {
    height: '60px',
    borderRadius: '4px',
    objectFit: 'contain'
  };

  const companyInfoStyle = {
    fontSize: '14px'
  };

  const companyNameStyle = {
    fontSize: '22px',
    fontWeight: '700',
    color: '#2c3e50',
    margin: '4px 0'
  };

  const companyAddressStyle = {
    fontSize: '13px',
    color: '#555',
    margin: '2px 0'
  };

  const challanInfoStyle = {
    textAlign: 'right',
    minWidth: '200px'
  };

  const titleStyle = {
    fontSize: '26px',
    fontWeight: '800',
    color: '#1e40af',
    margin: '0 0 12px',
    letterSpacing: '0.5px'
  };

  const dividerStyle = {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '24px 0'
  };

  const infoGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '30px'
  };

  const sectionTitleStyle = {
    fontSize: '16px',
    color: '#2d3748',
    marginBottom: '10px',
    paddingBottom: '6px',
    borderBottom: '1px solid #edf2f7'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '12px'
  };

  const thStyle = {
    backgroundColor: '#f8fafc',
    color: '#3182ce',
    fontWeight: '600',
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0'
  };

  const tdStyle = {
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0'
  };

  const notesStyle = {
    marginTop: '25px',
    padding: '12px',
    backgroundColor: '#f0f9ff',
    borderLeft: '3px solid #3182ce',
    borderRadius: '0 4px 4px 0',
    fontStyle: 'italic',
    color: '#2c5282'
  };

  const signaturesStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '50px',
    gap: '40px',
    flexWrap: 'wrap'
  };

  const signatureBoxStyle = {
    textAlign: 'center',
    flex: 1,
    minWidth: '200px'
  };

  const signLineStyle = {
    height: '1px',
    backgroundColor: '#4a5568',
    margin: '0 auto 12px',
    width: '200px'
  };

  const signLabelStyle = {
    fontWeight: '600',
    color: '#2d3748',
    margin: '8px 0 4px'
  };

  const responsiveStyle = `
    @media (max-width: 768px) {
      .dc-header { flex-direction: column; text-align: center !important; }
      .dc-challan-info { text-align: center !important; margin-top: 15px; }
      .dc-info-grid { grid-template-columns: 1fr !important; }
      .dc-signatures { flex-direction: column !important; gap: 30px !important; }
    }
  `;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <style>{responsiveStyle}</style>
      <div ref={invoiceRef} style={containerStyle}>
        {/* Header */}
        <div style={headerStyle} className="dc-header">
          <div style={logoSectionStyle}>
            <img src={logo} alt="Company Logo" style={logoStyle} />
            <div style={companyInfoStyle}>
              <h1 style={companyNameStyle}>{COMPANY_NAME}</h1>
              <p style={companyAddressStyle}>{COMPANY_ADDRESS}</p>
              <p style={companyAddressStyle}>Phone: {COMPANY_PHONE}</p>
              <p style={companyAddressStyle}>Email: {COMPANY_EMAIL}</p>
              <p style={companyAddressStyle}>GSTIN: {COMPANY_GST}</p>
            </div>
          </div>

          <div style={challanInfoStyle} className="dc-challan-info">
            <h2 style={titleStyle}>DELIVERY CHALLAN</h2>
            <p><strong>Challan No:</strong> {orderData._id?.substring(0, 8).toUpperCase()}</p>
            <p><strong>Date:</strong> {formatDate(new Date().toISOString())}</p>
          </div>
        </div>

        <hr style={dividerStyle} />

        {/* Client & Delivery Info */}
        <div style={infoGridStyle} className="dc-info-grid">
          <div>
            <h3 style={sectionTitleStyle}>Deliver To:</h3>
            <p style={{ fontWeight: '600' }}>{orderData.clientName || "N/A"}</p>
            <p>{orderData.clientId?.address || "Address not provided"}</p>
            <p>Phone: {orderData.clientId?.clientphoneNumber || "N/A"}</p>
            <p>Email: {orderData.clientId?.email || "N/A"}</p>
            {orderData.clientId?.gstNo && (
              <p>GSTIN: {orderData.clientId.gstNo}</p>
            )}
          </div>

          <div>
            <h3 style={sectionTitleStyle}>Delivery Details:</h3>
            <p><strong>From:</strong> {formatDate(orderData.startDate)}</p>
            <p><strong>To:</strong> {formatDate(orderData.endDate)}</p>
            <p><strong>Rental Type:</strong> {orderData.rentalType ? orderData.rentalType.charAt(0).toUpperCase() + orderData.rentalType.slice(1) : "N/A"}</p>
            <p><strong>Joining Date:</strong> {formatDate(orderData.clientId?.joiningdate)}</p>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <h3 style={{ ...sectionTitleStyle, marginTop: '30px' }}>Items Delivered</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Item Description</th>
                <th style={thStyle}>Quantity</th>
                <th style={thStyle}>Available After Delivery</th>
              </tr>
            </thead>
            <tbody>
              {orderData.products && orderData.products.length > 0 ? (
                orderData.products.map((product, index) => (
                  <tr key={index}>
                    <td style={tdStyle}>{product.productName || "N/A"}</td>
                    <td style={tdStyle}>{product.quantity || 0}</td>
                    <td style={tdStyle}>{product.availableQty || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ ...tdStyle, textAlign: 'center', color: '#a0aec0', fontStyle: 'italic' }}>
                    No items to display
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div style={notesStyle}>
          Note: This document serves as proof of delivery only. It does not represent a financial invoice.
        </div>

        {/* Signatures */}
        <div style={signaturesStyle} className="dc-signatures">
          <div style={signatureBoxStyle}>
            <div style={signLineStyle}></div>
            <p style={signLabelStyle}>For {COMPANY_NAME}</p>
            <p>Authorized Signatory</p>
          </div>
          <div style={signatureBoxStyle}>
            <div style={signLineStyle}></div>
            <p style={signLabelStyle}>{orderData.clientName || "Client Name"}</p>
            <p>Client Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Deliverychallan;