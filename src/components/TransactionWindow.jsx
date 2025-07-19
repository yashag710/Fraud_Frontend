import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

function TransactionWindow() {
  const Navigate = useNavigate();

  const [paymentData, setPaymentData] = useState({
    payer_id: '',
    payee_id: '',
    amount: '',
    transaction_channel: '',
    payment_mode: '',
    ip: '',
    nt_mode: '',
  });

  const [summary, setSummary] = useState({
    amount: '₹0.00',
    fee: '₹0.00',
    total: '₹0.00'
  });

  const [apiResponses, setApiResponses] = useState({
    ruleBased: null,
    secondRoute: null,
    finalResult: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIPData = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        setPaymentData(prev => ({
          ...prev,
          ip: response.data.ip,
        }));
      } catch (err) {
        console.error('Error fetching IP data:', err);
      }
    };

    fetchIPData();
  }, []);

  useEffect(() => {
    if (paymentData.amount) {
      const amount = parseFloat(paymentData.amount);
      const fee = amount * 0.015;
      const total = amount + fee;

      setSummary({
        amount: `₹${amount.toFixed(2)}`,
        fee: `₹${fee.toFixed(2)}`,
        total: `₹${total.toFixed(2)}`
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
      const res = await axiosInstance.post('https://tapinsbackend-production.up.railway.app/api/transaction', {
        payer_id: paymentData.payer_id,
        payee_id: paymentData.payee_id,
        amount: paymentData.amount,
        payment_channel: paymentData.transaction_channel,
        payment_mode: paymentData.payment_mode,
        ip: paymentData.ip
      });

      const data = res.data;

      if (data && data.final_check.success) {
        const queryParams = new URLSearchParams({
          transaction_id: data.transaction_id,
          is_fraud: data.final_check.is_fraud ? 'true' : 'false',
          status: data.final_check.status || '',
          ip: data.ip || '',
          state: data.state || '',
          failed_attempts: (data.rule_based?.failed_attempts || 0).toString(),
          amount: data.amount?.toString() || '0'
        }).toString();

        Navigate(`/transaction-result?${queryParams}`);

        setApiResponses({
          ruleBased: data.rule_based,
          secondRoute: data.ml_based,
          finalResult: data.final_check
        });
      } else {
        console.error("❌ Transaction check failed or incomplete response:", data);
      }
    } catch (err) {
      console.error('Transaction error:', err);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Network error while processing your request'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='relative'>
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
                  {/* Transaction Details */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Transaction Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="payer_id" className="block text-sm font-medium text-gray-700 mb-1">Payer ID</label>
                        <input type="text" id="payer_id" name="payer_id" required
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter Payer ID"
                          value={paymentData.payer_id}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="payee_id" className="block text-sm font-medium text-gray-700 mb-1">Payee ID</label>
                        <input type="text" id="payee_id" name="payee_id" required
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter Payee ID"
                          value={paymentData.payee_id}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Amount</h2>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        className="block w-full pl-7 pr-12 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0.00"
                        step="1"
                        min="1"
                        required
                        value={paymentData.amount}
                        onChange={handleInputChange}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">INR</span>
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
                          className="block w-full py-3 pl-3 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={paymentData.transaction_channel}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Channel</option>
                          <option value="web">Web</option>
                          <option value="mobile">Mobile</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="payment_mode" className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                        <select
                          id="payment_mode"
                          name="payment_mode"
                          className="block w-full py-3 pl-3 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={paymentData.payment_mode}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Mode</option>
                          <option value="UPI">UPI</option>
                          <option value="Card">Card</option>
                          <option value="NetBanking">NetBanking</option>
                        </select>
                      </div>
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

                  {/* Submit */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition duration-150 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Submit Transaction'}
                    </button>
                  </div>

                  {/* Error message */}
                  {error && (
                    <p className="mt-4 text-red-600 text-sm">{error}</p>
                  )}
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TransactionWindow;
