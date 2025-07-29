import React, { useEffect, useState, useMemo } from 'react';
import { DollarSign, Calendar, ArrowLeftRight } from 'lucide-react';
import { getFranchiseAccount } from '../../api/apiMethods';

type AccountEntry = {
  _id: string;
  technicianId: string;
  subscriptionId: string;
  planId: string;
  amount: number;
  franchiseId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  technicianName: string;
  subscriptionName: string;
  categoryId: string;
};

const Earnings: React.FC = () => {
  const [accountEntries, setAccountEntries] = useState<AccountEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch account data
  useEffect(() => {
    const fetchAccount = async () => {
      setLoading(true);
      setError('');
      try {
        const franchiseId = localStorage.getItem('userId');
        if (!franchiseId) {
          setError('Franchise ID is missing');
          setLoading(false);
          return;
        }
        const response = await getFranchiseAccount(franchiseId);
        if (response && response.result && Array.isArray(response.result)) {
          setAccountEntries(response.result);
        } else {
          setError('No earnings data found.');
        }
      } catch (err) {
        setError('Failed to fetch earnings data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, []);

  // Calculate total earnings and this month's earnings
  const { totalEarnings, thisMonthEarnings } = useMemo(() => {
    let total = 0;
    let monthTotal = 0;
    const now = new Date();
    accountEntries.forEach(entry => {
      total += entry.amount;
      const createdAt = new Date(entry.createdAt);
      if (
        createdAt.getFullYear() === now.getFullYear() &&
        createdAt.getMonth() === now.getMonth()
      ) {
        monthTotal += entry.amount;
      }
    });
    return { totalEarnings: total, thisMonthEarnings: monthTotal };
  }, [accountEntries]);

  // Format currency
  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  // Sort recent earnings (latest first)
  const recentEarnings = useMemo(() => {
    return [...accountEntries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [accountEntries]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalEarnings)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(thisMonthEarnings)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {accountEntries.length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
            <ArrowLeftRight className='text-yellow-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Earnings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Earnings</h3>
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading earnings...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : recentEarnings.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No earnings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Technician</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Plan</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Commission</th>
                </tr>
              </thead>
              <tbody>
                {recentEarnings.map((earning, index) => (
                  <tr
                    key={earning._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-3 px-4 text-gray-700">
                      {new Date(earning.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{earning.technicianName || '-'}</td>
                    <td className="py-3 px-4 text-gray-700">{earning.categoryId || '-'}</td>
                    <td className="py-3 px-4 text-gray-700">{earning.subscriptionName || '-'}</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600">
                      {formatCurrency(earning.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;