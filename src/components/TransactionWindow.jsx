import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
function App() {
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState({
    payer_id: '',
    payee_id: '',
    amount: '',
    transaction_channel: '',
    payment_mode: '',
    state: '',
    ip: '',
  });

  const [summary, setSummary] = useState({
    amount: '$0.00',
    fee: '$0.00',
    total: '$0.00'
  });

  const [apiResponses, setApiResponses] = useState({
    ruleBased: null,
    secondRoute: null,
    finalResult: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch IP and geolocation data when component mounts
  useEffect(() => {
    const fetchIPData = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        setPaymentData(prev => ({
          ...prev,
          ip: response.data.ip,
          country: response.data.country_name
        }));
      } catch (err) {
        console.error('Error fetching IP data:', err);
      }
    };

    fetchIPData();
  }, []);

  // Update summary when amount changes
  useEffect(() => {
    if (paymentData.amount) {
      const amount = parseFloat(paymentData.amount);
      const fee = amount * 0.015; // Assuming 1.5% fee
      const total = amount + fee;
      
      setSummary({
        amount: `$${amount.toFixed(2)}`,
        fee: `$${fee.toFixed(2)}`,
        total: `$${total.toFixed(2)}`
      });
    }
  }, [paymentData.amount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Send transaction data to Kafka producer endpoint
      const kafkaResponse = await axios.post('https://kafka-producer-k5sv.onrender.com/send-message', {
        payer_id: paymentData.payer_id,
        payee_id: paymentData.payee_id,
        amount: paymentData.amount,
        payment_channel: paymentData.transaction_channel,
        payment_mode: paymentData.payment_mode,
        state: paymentData.state,
        ip: paymentData.ip,
        timestamp: new Date().toISOString()
      });

      // Navigate to result page with transaction ID
      if (kafkaResponse.data.success) {
        navigate('/result', {
          state: {
            transactionDetails: {
              transaction_id: kafkaResponse.data.transactionId,
              ip: paymentData.ip || 'N/A',
              country: paymentData.country || 'N/A',
              amount: Number(paymentData.amount) || 0,
              dateTime: new Date().toLocaleString(),
              status: 'Processing'
            }
          }
        });
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='relative'><Link to = "/dash">
      <button type="submit" className="w-full my-5 mx-5 sm:w-auto bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-medium rounded-lg text-sm px-8 py-3.5 text-center transition duration-200 flex items-center justify-center">
      <span>Proceed to Dashboard</span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
        </button>
    </Link>
  <div className="bg-gray-50 min-h-screen w-full flex justify-center items-center">
      <div className="w-full max-w-3xl mx-auto">
        <section id="transaction-form" className="bg-white py-12 px-4 sm:px-6 lg:px-8 rounded-lg shadow-md">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">New Transaction</h1>
            <p className="mt-3 text-lg text-gray-600">Complete the form below to initiate your payment</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit}>
                {/* Transaction Parties */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Transaction Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="payer_id" className="block text-sm font-medium text-gray-700 mb-1">Payer ID</label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input 
                          type="text" 
                          id="payer_id" 
                          name="payer_id" 
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                          placeholder="Enter Payer ID" 
                          required
                          value={paymentData.payer_id}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="payee_id" className="block text-sm font-medium text-gray-700 mb-1">Payee ID</label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input 
                          type="text" 
                          id="payee_id" 
                          name="payee_id" 
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                          placeholder="Enter Payee ID" 
                          required
                          value={paymentData.payee_id}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Amount</h2>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input 
                      type="number" 
                      name="amount" 
                      id="amount" 
                      className="block w-full pl-7 pr-12 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                      placeholder="0.00" 
                      step="0.01" 
                      min="0.01" 
                      required
                      value={paymentData.amount}
                      onChange={handleInputChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">USD</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Enter the amount you want to transfer</p>
                </div>

                {/* Payment Options */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Options</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="transaction_channel" className="block text-sm font-medium text-gray-700 mb-1">Transaction Channel</label>
                      <select 
                        id="transaction_channel" 
                        name="transaction_channel" 
                        className="block w-full py-3 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={paymentData.transaction_channel}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Channel</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="paypal">PayPal</option>
                        <option value="crypto">Cryptocurrency</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="payment_mode" className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                      <select 
                        id="payment_mode" 
                        name="payment_mode" 
                        className="block w-full py-3 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={paymentData.payment_mode}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Mode</option>
                        <option value="instant">Instant Transfer</option>
                        <option value="standard">Standard (2-3 days)</option>
                        <option value="recurring">Recurring Payment</option>
                        <option value="scheduled">Scheduled Payment</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-8 w-full">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Select State</h2>
                  <div>
                    <label 
                      htmlFor="state" 
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Enter Your State
                    </label>
                    <select 
                      id="state" 
                      name="state" 
                      className="block w-full py-3 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={paymentData.state}
                      onChange={handleInputChange}
                    >
                      <option value="">Select State</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                      <option value="Lakshadweep">Lakshadweep</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Puducherry">Puducherry</option>
                      <option value="Ladakh">Ladakh</option>
                      <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                    </select>
                  </div>
                </div>

                {/* Transaction Summary */}
                <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Transaction Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transfer Amount</span>
                      <span className="font-medium" id="summary_amount">{summary.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Fee</span>
                      <span className="font-medium" id="summary_fee">{summary.fee}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-900 font-semibold">Total</span>
                        <span className="text-gray-900 font-semibold" id="summary_total">{summary.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add loading and error states */}
                {loading && (
                  <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-md">
                    Processing your request...
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                    {error}
                  </div>
                )}

                {/* Display API responses if available */}
                {apiResponses.finalResult && (
                  <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
                    Transaction processed successfully!
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row-reverse space-y-3 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
                  <button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-medium rounded-lg text-sm px-8 py-3.5 text-center transition duration-200 flex items-center justify-center">
                    <span>Proceed to Payment</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button type="button" className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 text-gray-700 font-medium rounded-lg text-sm px-8 py-3.5 text-center transition duration-200">
                    Save as Draft
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-8 flex items-center justify-center text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>All transactions are secure and encrypted</span>
          </div>
        </section>
      </div>
    </div></div>
   
  );
}

export default App;
