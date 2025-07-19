import React from "react";
import { BrowserRouter as Router , Routes , Route } from "react-router-dom";
import "./App.css";
import TransactionWindow from "./components/TransactionWindow";
import TransactionTable from "./components/TransactionTable";
import TransactionResult from "./components/TransactionResult";
import PhoneVerification from "./components/PhoneVerification";
import Home from "./components/Home";

function App(){
  return(
    <Router>
      <Routes>
      <Route>
      <Route path="/phone-verification" element={<PhoneVerification />} />
      <Route path="/transaction" element={<TransactionWindow />} />
      <Route path="/transaction-dashboard" element={<TransactionTable/>}/>
      <Route path="/transaction-result" element={<TransactionResult />} />
      <Route path="/" element={<Home />} />
      </Route>
      </Routes>
    </Router>
  )
}

export default App;