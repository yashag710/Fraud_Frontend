import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const PhoneVerification = () => {

  const Navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [payerId, setPayerId] = useState(""); // NEW STATE
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("");
  const [step, setStep] = useState("form");

  const sendOTP = async () => {
    if (!name || !phone || !payerId) { // Include payerId in validation
      setStatus("Please fill all fields.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, payerId }),
      });

      const data = await res.json();
      setStatus(data.message || data.error);

      if (res.ok) {
        setStep("otp");
      }
    } catch (err) {
      setStatus("❌ Error sending OTP.");
      console.error(err);
    }
  };

  const verifyOTP = async () => {
    if (!otp) {
      setStatus("Please enter the OTP.");
      return;
    }

    try {
      const res = await fetch("https://tapinsbackend-production.up.railway.app/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, name, payerId }), // Include payerId
      });

      const data = await res.json();
      setStatus(data.message || data.error);

      if (res.ok) {
        setStep("done");
        Navigate("/");
      }
    } catch (err) {
      setStatus("❌ Error verifying OTP.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6"> Phone Verification</h2>

        {step === "form" && (
          <>
            <label className="block mb-1 font-medium text-sm">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label className="block mb-1 font-medium text-sm">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91XXXXXXXXXX"
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label className="block mb-1 font-medium text-sm">Payer ID</label>
            <input
              type="text"
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
              placeholder="Enter Payer ID"
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={sendOTP}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Send OTP
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <label className="block mb-1 font-medium text-sm">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={verifyOTP}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            >
              Verify OTP
            </button>
          </>
        )}

        {step === "done" && (
          <div className="bg-green-100 p-4 rounded-md text-center mt-4">
            <p className="text-green-700 font-medium">✅ Phone number verified successfully!</p>
          </div>
        )}

        {status && (
          <p className="mt-4 text-sm text-center text-gray-600">{status}</p>
        )}
      </div>
    </div>
  );
};

export default PhoneVerification;
