import React, { useEffect, useState } from 'react';
import { Calendar, Users, CheckCircle, DollarSign, Star, Clock, User, Monitor, CreditCard, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getAllTechniciansByFranchise } from '../../api/apiMethods';

interface Subscription {
  subscriptionId: string;
  subscriptionName: string;
  startDate: string;
  endDate: string;
  leads: number | null;
  ordersCount: number;
  _id: string;
}

interface Technician {
  id: string;
  franchiseId: string;
  username: string;
  userId: string;
  phoneNumber: string;
  role: string;
  category: string;
  buildingName: string;
  areaName: string;
  city: string;
  state: string;
  pincode: string;
  subscription: Subscription;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Fetch technicians data
  const fetchTechsByFranchise = async () => {
    try {
      setLoading(true);
      setError('');
      const franchiseId = localStorage.getItem('userId') || '';
      const response = await getAllTechniciansByFranchise(franchiseId);
      if (Array.isArray(response?.result)) {
        setTechnicians(response.result);
      } else {
        setTechnicians([]);
        setError('No technicians found');
      }
    } catch (error: any) {
      setError(error?.message || 'Failed to fetch technicians');
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechsByFranchise();
  }, []);

  // Calculate stats
  const totalTechnicians = technicians.length;
  const totalSubscriptions = technicians.length;

  // Calculate subscription distribution for pie chart
  const planCounts: Record<string, number> = {};
  technicians.forEach(tech => {
    const planName = tech.subscription?.subscriptionName || 'No Plan';
    planCounts[planName] = (planCounts[planName] || 0) + 1;
  });

  const subscriptionData = Object.entries(planCounts).map(([name, value]) => ({
    name,
    value,
    color: getColorForPlan(name)
  }));

  function getColorForPlan(planName: string): string {
    const colorMap: Record<string, string> = {
      'Economy Plan': '#3B82F6', // Blue
      'Gold Plan': '#F59E0B',    // Yellow
      'Platinum Plan': '#8B5CF6', // Purple
      'Basic Plan': '#10B981',   // Green
      'Premium Plan': '#EC4899'  // Pink
    };
    return colorMap[planName] || '#6B7280'; // Gray as fallback
  }

  const stats = [
    {
      title: 'Total Technicians',
      value: totalTechnicians,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Total Subscriptions',
      value: totalSubscriptions,
      icon: CreditCard,
      color: 'bg-green-100 text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Total Earnings',
      value: '₹45,00',
      icon: DollarSign,
      color: 'bg-yellow-100 text-yellow-600',
      iconBg: 'bg-yellow-100'
    },

      {
      title: 'Monthly Earnings',
      value: '₹45,00',
      icon: DollarSign,
      color: 'bg-yellow-100 text-yellow-600',
      iconBg: 'bg-yellow-100'
    },

    
  ];

  const monthlyEarnings = [
    { month: 'Jan', amount: 38000 },
    { month: 'Feb', amount: 42000 },
    { month: 'Mar', amount: 39000 },
    { month: 'Apr', amount: 45000 },
    { month: 'May', amount: 48000 },
    { month: 'Jun', amount: 45300 },
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'AC Repair Completed',
      customer: 'John Smith',
      date: '15-07-2025',
      status: 'completed',
      icon: Monitor
    },
    {
      id: 2,
      title: 'Plumbing Service',
      customer: 'Sarah Johnson',
      date: '12-07-2025',
      status: 'completed',
      icon: Monitor
    },
    {
      id: 3,
      title: 'New Technician Joined',
      customer: 'Raj Kumar',
      date: '10-07-2025',
      status: 'active',
      icon: User
    },
    {
      id: 4,
      title: 'Subscription Renewed',
      customer: 'Mike Wilson',
      date: '08-07-2025',
      status: 'active',
      icon: CreditCard
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto scrollbar-hide">
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Welcome back, Franchise
            </h1>
            <p className="text-blue-100 text-lg">
              Here's your performance overview for today
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
            <p className="text-sm text-blue-100 mb-1">Today's Date</p>
            <p className="text-lg font-semibold">{dateString}</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                  <Icon className={`h-6 w-6 ${stat.color.split(' ')[1]}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly Earnings</h3>
            </div>
          </div>

          <div className="space-y-4">
            {monthlyEarnings.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 font-medium w-12">{item.month}</span>
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 mx-4">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(item.amount / 50000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-900 font-semibold w-16 text-right">₹{(item.amount / 1000).toFixed(0)}k</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Earnings</h3>
            </div>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200 cursor-pointer"
              onClick={() => navigate('/earnings')}
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-500">{activity.customer}</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${activity.status === 'completed'
                        ? 'text-green-700 bg-green-100'
                        : 'text-blue-700 bg-blue-100'
                      }`}>
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{activity.date}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Subscription Plans</h3>
          </div>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200 cursor-pointer"
            onClick={() => navigate('/earnings')}>
            View Details
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Technicians']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subscriptionData.map((item, index) => {
                let gradientClass = "";
                let textColor = "text-gray-900";
                
                // Apply different gradients based on plan name
                if (item.name === "Economy Plan") {
                  gradientClass = "bg-gradient-to-br from-blue-500 to-blue-600";
                  textColor = "text-white";
                } else if (item.name === "Gold Plan") {
                  gradientClass = "bg-gradient-to-br from-yellow-400 to-yellow-600";
                  textColor = "text-white";
                } else if (item.name === "Platinum Plan") {
                  gradientClass = "bg-gradient-to-br from-purple-500 to-purple-700";
                  textColor = "text-white";
                } else if (item.name === "Basic Plan") {
                  gradientClass = "bg-gradient-to-br from-green-500 to-green-600";
                  textColor = "text-white";
                } else if (item.name === "Premium Plan") {
                  gradientClass = "bg-gradient-to-br from-pink-500 to-pink-600";
                  textColor = "text-white";
                } else {
                  gradientClass = "bg-gray-50";
                }
                
                return (
                  <div 
                    key={index} 
                    className={`flex flex-col p-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.03] min-h-[100px] ${gradientClass}`}
                  >
                    <div className="flex items-center mb-2">
                      <div 
                        className="w-3 h-3 rounded-full mr-3" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <h4 className={`text-md font-semibold ${textColor}`}>{item.name}</h4>
                    </div>
                    <div className="flex items-end justify-between mt-2">
                      <p className={`text-2xl font-bold ${textColor}`}>{item.value}</p>
                      <div className={`text-sm ${textColor} opacity-80`}>technicians</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
