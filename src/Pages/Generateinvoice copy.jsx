import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
            <div className="card shadow-sm border-0" style={{ borderRadius: '8px' }}>
                <div className="card-body p-4">
                    {/* Header */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center">
                                <img 
                                    src={logo} 
                                    alt="Company Logo" 
                                    className="me-3" 
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                                <div>
                                    <h3 className="mb-1" style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
                                        {COMPANY_NAME}
                                    </h3>
                                    <p className="mb-1" style={{ fontSize: '13px', color: '#7f8c8d' }}>
                                        {COMPANY_ADDRESS}
                                    </p>
                                    <p className="mb-1" style={{ fontSize: '13px', color: '#7f8c8d' }}>
                                        Phone: {COMPANY_PHONE}
                                    </p>
                                    <p className="mb-0" style={{ fontSize: '13px', color: '#7f8c8d' }}>
                                        Email: {COMPANY_EMAIL} | GST: {COMPANY_GST}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <h2 className="mb-3" style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                                INVOICE
                            </h2>
                            <div className="d-flex flex-column align-items-md-end">
                                <div className="mb-1">
                                    <strong className="me-2" style={{ fontSize: '14px' }}>Invoice No:</strong>
                                    <span style={{ fontSize: '14px' }}>INV-{orderdata._id?.slice(-6).toUpperCase()}</span>
                                </div>
                                <div className="mb-1">
                                    <strong className="me-2" style={{ fontSize: '14px' }}>Date:</strong>
                                    <span style={{ fontSize: '14px' }}>
                                        {new Date(orderdata.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <strong className="me-2" style={{ fontSize: '14px' }}>Status:</strong>
                                    <span 
                                        className={`badge ${orderdata.status === 'confirmed' ? 'bg-success' : 'bg-warning'}`}
                                        style={{ fontSize: '12px' }}
                                    >
                                        {orderdata.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Client Info */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <h5 className="mb-3" style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>
                                Bill To:
                            </h5>
                            <p className="mb-1" style={{ fontSize: '14px', fontWeight: '600' }}>
                                {client.clientName || orderdata.clientName}
                            </p>
                            <p className="mb-1" style={{ fontSize: '14px' }}>
                                {client.address || 'N/A'}
                            </p>
                            <p className="mb-1" style={{ fontSize: '14px' }}>
                                Phone: {client.clientphoneNumber || 'N/A'}
                            </p>
                            <p className="mb-0" style={{ fontSize: '14px' }}>
                                GST: {client.gstNo || 'N/A'}
                            </p>
                        </div>
                        <div className="col-md-6">
                            <h5 className="mb-3" style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>
                                Rental Period:
                            </h5>
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

                    {/* Products Table */}
                    <div className="table-responsive mb-4">
                        <table className="table table-bordered mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="text-center" style={{ fontSize: '13px', padding: '10px', width: '5%' }}>#</th>
                                    <th style={{ fontSize: '13px', padding: '10px', width: '35%' }}>Product Name</th>
                                    <th className="text-center" style={{ fontSize: '13px', padding: '10px', width: '10%' }}>Qty</th>
                                    <th className="text-center" style={{ fontSize: '13px', padding: '10px', width: '15%' }}>Unit Price</th>
                                    <th className="text-center" style={{ fontSize: '13px', padding: '10px', width: '15%' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderdata.products.map((product, index) => (
                                    <tr key={product._id || product.productId}>
                                        <td className="text-center" style={{ fontSize: '14px', padding: '10px' }}>
                                            {index + 1}
                                        </td>
                                        <td style={{ fontSize: '14px', padding: '10px' }}>
                                            <div><strong>{product.productName}</strong></div>
                                            <div className="text-muted" style={{ fontSize: '12px' }}>
                                                {product.productType}
                                            </div>
                                        </td>
                                        <td className="text-center" style={{ fontSize: '14px', padding: '10px' }}>
                                            {product.quantity}
                                        </td>
                                        <td className="text-end" style={{ fontSize: '14px', padding: '10px' }}>
                                            ₹{product.unitPrice?.toLocaleString() || '0'}
                                        </td>
                                        <td className="text-end" style={{ fontSize: '14px', padding: '10px' }}>
                                            ₹{(product.unitPrice * product.quantity).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-1">
                                <strong className="me-2" style={{ fontSize: '14px' }}>Subtotal:</strong>
                                <span style={{ fontSize: '14px' }}>₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="mb-1">
                                <strong className="me-2" style={{ fontSize: '14px' }}>Transport:</strong>
                                <span style={{ fontSize: '14px' }}>₹{orderdata.transportCharges?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="mb-1">
                                <strong className="me-2" style={{ fontSize: '14px' }}>GST ({orderdata.gst}%):</strong>
                                <span style={{ fontSize: '14px' }}>₹{gstAmount.toLocaleString()}</span>
                            </div>
                            <div className="mb-1">
                                <strong className="me-2" style={{ fontSize: '14px' }}>Discount ({orderdata.discount}%):</strong>
                                <span style={{ fontSize: '14px' }}>₹{discountAmount.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="border-top pt-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <strong style={{ fontSize: '16px' }}>Grand Total:</strong>
                                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
                                        ₹{grandTotal.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
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

                    {/* Footer */}
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