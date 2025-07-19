import { useState, useEffect } from "react";

const TransactionTable = () => {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    payerId: "",
    payeeId: "",
    transactionId: "",
  });
  const [transactions, setTransactions] = useState([]);
  const [columns, setColumns] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        payerId: filters.payerId,
        payeeId: filters.payeeId,
        transactionId: filters.transactionId,
        page: pagination.page,
        limit: pagination.limit
      });

      const response = await fetch(`https://tapinsbackend-production.up.railway.app/api/transaction-dashboard?${queryParams}`);
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
      }
      
      const data = await response.json();
      
      setTransactions(data.data.transactions);
      setColumns(data.data.columns);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      console.error("Full error details:", {
        message: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions on initial load
  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleChange = (e) => {
    const id = e.target.id.charAt(0).toLowerCase() + e.target.id.slice(1); // Convert PayerId to payerId
    setFilters({ ...filters, [id]: e.target.value });
  };

  const handleApplyFilters = async () => {
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    await fetchTransactions();
  };

  const handleReset = async () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      payerId: "",
      payeeId: "",
      transactionId: "",
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    await fetchTransactions();
  };

  const handlePageChange = async (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    await fetchTransactions();
  };

  return (
    <div className="page-section h-full py-6 px-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Transaction Data
        </h2>
        <p className="text-gray-600">
          View and analyze raw transaction data with fraud prediction and
          reporting information.
        </p>

        {/* Filters */}
        <div className="w-full mb-6">
          <form
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            onSubmit={e => { e.preventDefault(); handleApplyFilters(); }}
          >
            {/* Date From */}
            <div className="flex flex-col">
              <label htmlFor="dateFrom" className="text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                id="dateFrom"
                className="rounded-md border px-3 py-2 text-sm"
                value={filters.dateFrom}
                onChange={handleChange}
              />
            </div>
            {/* Date To */}
            <div className="flex flex-col">
              <label htmlFor="dateTo" className="text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                id="dateTo"
                className="rounded-md border px-3 py-2 text-sm"
                value={filters.dateTo}
                onChange={handleChange}
              />
            </div>
            {/* Payer ID */}
            <div className="flex flex-col">
              <label htmlFor="payerId" className="text-sm font-medium text-gray-700 mb-1">
                Payer ID
              </label>
              <input
                type="text"
                id="payerId"
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Enter Payer ID"
                value={filters.payerId}
                onChange={handleChange}
              />
            </div>
            {/* Transaction ID */}
            <div className="flex flex-col">
              <label htmlFor="transactionId" className="text-sm font-medium text-gray-700 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                id="transactionId"
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Enter Transaction ID"
                value={filters.transactionId}
                onChange={handleChange}
              />
            </div>
          </form>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mb-6">
          <button 
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            onClick={handleReset}
          >
            Reset
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </button>
        </div>

        {/* Show loading state */}
        {loading && (
          <div className="text-center py-4">
            Loading...
          </div>
        )}

        {/* Modified Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={`${txn.id}-${column.key}`} className="px-6 py-4">
                      {column.type === 'status' ? (
                        <span
                          className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                            txn[column.key] === "Yes"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {txn[column.key]}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {txn[column.key]}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Update Pagination section */}
        <div className="flex items-center justify-between py-4">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span> of{" "}
            <span className="font-medium">{pagination.total}</span> results
          </p>
          <div className="flex space-x-2">
            <button 
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            <button 
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;