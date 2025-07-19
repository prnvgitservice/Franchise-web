import React from 'react';
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';

const Earnings: React.FC = () => {
  const earningsData = [
    { month: 'January', amount: 2800 },
    { month: 'February', amount: 3200 },
    { month: 'March', amount: 2900 },
    { month: 'April', amount: 3500 },
    { month: 'May', amount: 4100 },
    { month: 'June', amount: 3800 },
  ];

  const recentEarnings = [
    { date: '2025-07-18', service: 'AC Repair', amount: 800, customer: 'John Smith' },
    { date: '2025-07-15', service: 'Plumbing Fix', amount: 450, customer: 'Sarah Johnson' },
    { date: '2025-07-12', service: 'Electrical Work', amount: 620, customer: 'Mike Wilson' },
    { date: '2025-07-10', service: 'HVAC Maintenance', amount: 750, customer: 'Emily Davis' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">₹21,800</p>
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
              <p className="text-2xl font-bold text-gray-900">₹3,800</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Per Service</p>
              <p className="text-2xl font-bold text-gray-900">₹620</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Earnings</h3>
          <button className="flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
        
        <div className="space-y-4">
          {earningsData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">{item.month}</span>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.amount / 4500) * 100}%` }}
                  ></div>
                </div>
                <span className="text-gray-900 font-semibold">₹{item.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Earnings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Earnings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Service</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentEarnings.map((earning, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-3 px-4 text-gray-700">{earning.date}</td>
                  <td className="py-3 px-4 text-gray-700">{earning.service}</td>
                  <td className="py-3 px-4 text-gray-700">{earning.customer}</td>
                  <td className="py-3 px-4 text-right font-semibold text-green-600">₹{earning.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Earnings;