import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout/Layout";
import Userlist from "./Pages/Userlist";
import Login from "./Login";
import Clientlist from "./Pages/Clientlist";
import Product from "./Pages/Product";
import QuotationList from "./Pages/Quotationlist";
import Quotationdetails from "./Pages/Quotationdetails";
import Orderlist from "./Pages/Orderlist";
import Orderdetaills from "./Pages/Orderdetaills";
import Generateinvoice from "./Pages/Generateinvoice";
import Deliverychallan from "./Pages/Deliverychallan";
import Paymentreport from "./Pages/Paymentreport";
import Pendingpaymentreport from "./Pages/Pendingpaymentreport";
import Terms from "./Pages/Terms";
import Generatepymentinvoice from "./Pages/Generatepymentinvoice";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="users" element={<Userlist />} />
          <Route path="client-added" element={<Clientlist />} />
            <Route path="product-list" element={<Product />} />
                 {/* <Route path="order-list" element={<div>Add Orders Page</div>} /> */}
          {/* <Route path="add-orders" element={<div>Add Orders Page</div>} /> */}
          <Route path="order-list" element={<Orderlist />} />
           <Route path="order-details/:id" element={<Orderdetaills />} />
            <Route path="generate-invoice/:id" element={<Generateinvoice />} />
                   <Route path="generate-payment-invoice" element={<Generatepymentinvoice />} />
                <Route path="delivery-challan/:id" element={<Deliverychallan />} />
          <Route path="add-quotation" element={<div>Add Quotation Page</div>} />
          <Route path="quotation-list" element={<QuotationList />} />
           <Route path="quotation-details/:id" element={<Quotationdetails />} />
          <Route path="pending-payment" element={<Pendingpaymentreport />} />
          <Route path="payment-report" element={<Paymentreport />} />
          <Route path="terms" element={<Terms />} />
          <Route path="logout" element={<div>Logout Page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
