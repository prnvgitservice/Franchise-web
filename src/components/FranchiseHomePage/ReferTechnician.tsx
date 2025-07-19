import React, { useState } from 'react';
import { UserPlus, Share2, Gift, Users, Copy, CheckCircle } from 'lucide-react';

const Refer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const referralCode = 'LOHITHA2025';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralStats = [
    { label: 'Total Referrals', value: '12', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Technicians', value: '8', icon: UserPlus, color: 'bg-green-100 text-green-600' },
    { label: 'Bonus Earned', value: '₹4,800', icon: Gift, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Refer & Earn Program</h1>
        <p className="text-green-100">Join or Invite skilled technicians and 10% on Subscription for each successful referral!</p>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {referralStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Referral Code Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Code</h3>
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 bg-gray-100 rounded-xl p-4 font-mono text-lg text-center">
            {referralCode}
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors duration-200">
            <Share2 className="h-4 w-4" />
            <span>Share via WhatsApp</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200">
            <UserPlus className="h-4 w-4" />
            <span>Send Invitation</span>
          </button>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Share Your Code</h4>
            <p className="text-gray-600 text-sm">Share your unique referral code with qualified technicians</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">They Join</h4>
            <p className="text-gray-600 text-sm">Your referral signs up and completes verification</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 font-bold">3</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Earn Rewards</h4>
            <p className="text-gray-600 text-sm">Get ₹500 bonus after their first completed service</p>
          </div>
        </div>
      </div>

      {/* Recent Referrals */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Referrals</h3>
        <div className="space-y-4">
          {[
            { name: 'Arjun Kumar', status: 'Active', date: '2025-07-15', bonus: '₹500' },
            { name: 'Sneha Patel', status: 'Pending', date: '2025-07-10', bonus: 'Pending' },
            { name: 'Vikram Singh', status: 'Active', date: '2025-07-05', bonus: '₹500' },
          ].map((referral, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{referral.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{referral.name}</h4>
                  <p className="text-sm text-gray-600">{referral.date}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  referral.status === 'Active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {referral.status}
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1">{referral.bonus}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Refer;