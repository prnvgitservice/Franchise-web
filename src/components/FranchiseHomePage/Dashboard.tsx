import React, { useEffect, useState } from "react";
import { Users, DollarSign, Clock, CreditCard, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  getFranchiseAccount,
  getFranchiseAccountValues,
} from "../../api/apiMethods";

const PLAN_COLORS: Record<string, string> = {
  "Economy Plan": "#10B981",
  "Gold Plan": "#F59E0B",
  "Platinum Plan": "#3B82F6",
  "Basic Plan": "#8B5CF6",
  "Premium Plan": "#EC4899",
  "No Plan": "#6B7280",
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountValues, setAccountValues] = useState<null | {
    totalEarnings: number;
    totalThisMonthEarnings: number;
    earningsByMonth: number[];
    totalNoOfTechnicians: number;
    totalNoOfSubscriptions: number;
  }>(null);
  const [recentEarnings, setRecentEarnings] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [error, setError] = useState("");

  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Format currency
  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const franchiseId = localStorage.getItem("userId") || "";
        // Fetch account values
        const valuesRes = await getFranchiseAccountValues(franchiseId);
        if (valuesRes?.success && valuesRes?.result) {
          setAccountValues(valuesRes?.result);
        } else {
          setAccountValues(null);
        }

        // Fetch recent earnings
        const earningsRes = await getFranchiseAccount(franchiseId);
        if (earningsRes?.success && Array.isArray(earningsRes?.result)) {
          setRecentEarnings(earningsRes?.result);

          // Calculate subscription distribution for pie chart
          const planCounts: Record<string, number> = {};
          earningsRes?.result.forEach((item: any) => {
            const planName = item.subscriptionName || "No Plan";
            planCounts[planName] = (planCounts[planName] || 0) + 1;
          });
          const subData = Object.entries(planCounts).map(([name, value]) => ({
            name,
            value,
            color: PLAN_COLORS[name] || PLAN_COLORS["No Plan"],
          }));
          setSubscriptionData(subData);
        } else {
          setRecentEarnings([]);
          setSubscriptionData([]);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to fetch data");
        setAccountValues(null);
        setRecentEarnings([]);
        setSubscriptionData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare stats
  const stats = [
    {
      title: "Total Technicians",
      value: accountValues?.totalNoOfTechnicians ?? 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      title: "Total Subscriptions",
      value: accountValues?.totalNoOfSubscriptions ?? 0,
      icon: CreditCard,
      color: "bg-green-100 text-green-600",
      iconBg: "bg-green-100",
    },
    {
      title: "Total Earnings",
      value: `₹${accountValues?.totalEarnings?.toLocaleString() ?? 0}`,
      icon: DollarSign,
      color: "bg-yellow-100 text-yellow-600",
      iconBg: "bg-yellow-100",
    },
    {
      title: "Monthly Earnings",
      value: `₹${accountValues?.totalThisMonthEarnings?.toLocaleString() ?? 0}`,
      icon: DollarSign,
      color: "bg-orange-100 text-orange-600",
      iconBg: "bg-orange-100",
    },
  ];

  // Prepare monthly earnings for chart
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyEarnings = (accountValues?.earningsByMonth || []).map(
    (amount, idx) => ({
      month: monthLabels[idx],
      amount,
    })
  );

  // Prepare recent activities
  const recentActivities = recentEarnings.map((item, idx) => ({
    id: item._id,
    title: `${item.subscriptionName}`,
    customer: item.technicianName,
    date: new Date(item.createdAt).toLocaleDateString("en-GB"),
    commission: formatCurrency(item.amount),
    icon: UserCog,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto scrollbar-hide">
      <div className="bg-gradient-to-r from-indigo-600 to-teal-500 rounded-2xl p-6 text-white relative overflow-hidden">
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
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                  <Icon className={`h-6 w-6 ${stat.color.split(" ")[1]}`} />
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
              <h3 className="text-lg font-semibold text-gray-900">
                Monthly Earnings
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {monthlyEarnings.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 font-medium w-12">
                  {item.month}
                </span>
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 mx-4">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-teal-500 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (item.amount /
                            Math.max(
                              ...(accountValues?.earningsByMonth || [1]),
                              1
                            )) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-gray-900 font-semibold w-16 text-right">
                    ₹{(item.amount / 1000).toFixed(0)}k
                  </span>
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
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Earnings
              </h3>
            </div>
            <button
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200 cursor-pointer"
              onClick={() => navigate("/earnings")}
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center text-gray-500">
                No recent earnings found.
              </div>
            ) : (
              recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {activity.customer}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 text-green-700 bg-green-100`}
                      >
                        {activity.commission}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{activity.date}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Subscription Plans
            </h3>
          </div>
          <button
            className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200 cursor-pointer"
            onClick={() => navigate("/technicians")}
          >
            View Details
          </button>
        </div>

        {subscriptionData.length === 0 ? (
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Technicians Found
            </h3>
            <p className="text-gray-500">
              It seems there are no technicians associated with any subscription
              plans.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              onClick={() => navigate("/technicians")}
            >
              Create New Technicians
            </button>
          </div>
        ) : (
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
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}`, "Technicians"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionData.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                    style={{ backgroundColor: `${item.color}10` }}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <h4 className="text-md font-semibold text-gray-900">
                        {item.name}
                      </h4>
                    </div>
                    <div className="flex items-end justify-between mt-2">
                      <p
                        className="text-2xl font-bold"
                        style={{ color: item.color }}
                      >
                        {item.value}
                      </p>
                      <div className="text-sm text-gray-500">technicians</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Subscription Plans</h3>
          </div>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200 cursor-pointer"
            onClick={() => navigate('/technicians')}
          >
            View Details
          </button>
        </div>

        {accountValues?.totalNoOfTechnicians === 0 ? (
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Technicians Found</h3>
            <p className="text-gray-500">It seems there are no technicians available at the moment.</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              onClick={() => navigate('/technicians')}
            >
              Add Technicians
            </button>
          </div>
        ) : (
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
                {subscriptionData.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                    style={{ backgroundColor: `${item.color}10` }}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                      <h4 className="text-md font-semibold text-gray-900">{item.name}</h4>
                    </div>
                    <div className="flex items-end justify-between mt-2">
                      <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                      <div className="text-sm text-gray-500">technicians</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div> */}
    </div>
  );
};

export default Dashboard;
// import React, { useEffect, useState } from 'react';
// import { Calendar, Users, CheckCircle, DollarSign, Star, Clock, User, Monitor, CreditCard, Wrench } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
// import { getAllTechniciansByFranchise } from '../../api/apiMethods';

// interface Subscription {
//   subscriptionId: string;
//   subscriptionName: string;
//   startDate: string;
//   endDate: string;
//   leads: number | null;
//   ordersCount: number;
//   _id: string;
// }

// interface Technician {
//   id: string;
//   franchiseId: string;
//   username: string;
//   userId: string;
//   phoneNumber: string;
//   role: string;
//   category: string;
//   buildingName: string;
//   areaName: string;
//   city: string;
//   state: string;
//   pincode: string;
//   subscription: Subscription;
// }

// const Dashboard: React.FC = () => {
//   const navigate = useNavigate();
//   const [technicians, setTechnicians] = useState<Technician[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const today = new Date();
//   const dateString = today.toLocaleDateString('en-US', {
//     weekday: 'long',
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric'
//   });

//   // Fetch technicians data
//   const fetchTechsByFranchise = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const franchiseId = localStorage.getItem('userId') || '';
//       const response = await getAllTechniciansByFranchise(franchiseId);
//       if (Array.isArray(response?.result)) {
//         setTechnicians(response.result);
//       } else {
//         setTechnicians([]);
//         setError('No technicians found');
//       }
//     } catch (error: any) {
//       setError(error?.message || 'Failed to fetch technicians');
//       setTechnicians([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTechsByFranchise();
//   }, []);

//   // Calculate stats
//   const totalTechnicians = technicians.length;
//   const totalSubscriptions = technicians.length;

//   // Calculate subscription distribution for pie chart
//   const planCounts: Record<string, number> = {};
//   technicians.forEach(tech => {
//     const planName = tech.subscription?.subscriptionName || 'No Plan';
//     planCounts[planName] = (planCounts[planName] || 0) + 1;
//   });

//   const subscriptionData = Object.entries(planCounts).map(([name, value]) => ({
//     name,
//     value,
//     color: getColorForPlan(name)
//   }));

//   function getColorForPlan(planName: string): string {
//     const colorMap: Record<string, string> = {
//       'Economy Plan': '#10B981',
//       'Gold Plan': '#F59E0B',
//       'Platinum Plan': '#3B82F6',
//       'Basic Plan': '#8B5CF6',
//       'Premium Plan': '#EC4899'
//     };
//     return colorMap[planName] || '#6B7280';
//   }

//   const stats = [
//     {
//       title: 'Total Technicians',
//       value: totalTechnicians,
//       icon: Users,
//       color: 'bg-blue-100 text-blue-600',
//       iconBg: 'bg-blue-100'
//     },
//     {
//       title: 'Total Subscriptions',
//       value: totalSubscriptions,
//       icon: CreditCard,
//       color: 'bg-green-100 text-green-600',
//       iconBg: 'bg-green-100'
//     },
//     {
//       title: 'Total Earnings',
//       value: '₹45,00',
//       icon: DollarSign,
//       color: 'bg-yellow-100 text-yellow-600',
//       iconBg: 'bg-yellow-100'
//     },

//       {
//       title: 'Monthly Earnings',
//       value: '₹45,00',
//       icon: DollarSign,
//       color: 'bg-yellow-100 text-yellow-600',
//       iconBg: 'bg-yellow-100'
//     },

//   ];

//   const monthlyEarnings = [
//     { month: 'Jan', amount: 38000 },
//     { month: 'Feb', amount: 42000 },
//     { month: 'Mar', amount: 39000 },
//     { month: 'Apr', amount: 45000 },
//     { month: 'May', amount: 48000 },
//     { month: 'Jun', amount: 45300 },
//   ];

//   const recentActivities = [
//     {
//       id: 1,
//       title: 'AC Repair Completed',
//       customer: 'John Smith',
//       date: '15-07-2025',
//       status: 'completed',
//       icon: Monitor
//     },
//     {
//       id: 2,
//       title: 'Plumbing Service',
//       customer: 'Sarah Johnson',
//       date: '12-07-2025',
//       status: 'completed',
//       icon: Monitor
//     },
//     {
//       id: 3,
//       title: 'New Technician Joined',
//       customer: 'Raj Kumar',
//       date: '10-07-2025',
//       status: 'active',
//       icon: User
//     },
//     {
//       id: 4,
//       title: 'Subscription Renewed',
//       customer: 'Mike Wilson',
//       date: '08-07-2025',
//       status: 'active',
//       icon: CreditCard
//     }
//   ];

//   return (
//     <div className="space-y-6 max-w-7xl mx-auto scrollbar-hide">
//       <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
//           <div className="mb-4 lg:mb-0">
//             <h1 className="text-2xl lg:text-3xl font-bold mb-2">
//               Welcome back, Franchise
//             </h1>
//             <p className="text-blue-100 text-lg">
//               Here's your performance overview for today
//             </p>
//           </div>
//           <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
//             <p className="text-sm text-blue-100 mb-1">Today's Date</p>
//             <p className="text-lg font-semibold">{dateString}</p>
//           </div>
//         </div>
//         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
//         <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => {
//           const Icon = stat.icon;
//           return (
//             <div
//               key={index}
//               className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105"
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
//                   <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
//                 </div>
//                 <div className={`p-3 rounded-xl ${stat.iconBg}`}>
//                   <Icon className={`h-6 w-6 ${stat.color.split(' ')[1]}`} />
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-blue-100 rounded-lg mr-3">
//                 <DollarSign className="h-5 w-5 text-blue-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Monthly Earnings</h3>
//             </div>
//           </div>

//           <div className="space-y-4">
//             {monthlyEarnings.map((item, index) => (
//               <div key={index} className="flex items-center justify-between">
//                 <span className="text-gray-700 font-medium w-12">{item.month}</span>
//                 <div className="flex items-center space-x-4 flex-1">
//                   <div className="flex-1 bg-gray-200 rounded-full h-3 mx-4">
//                     <div
//                       className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
//                       style={{ width: `${(item.amount / 50000) * 100}%` }}
//                     ></div>
//                   </div>
//                   <span className="text-gray-900 font-semibold w-16 text-right">₹{(item.amount / 1000).toFixed(0)}k</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-green-100 rounded-lg mr-3">
//                 <Clock className="h-5 w-5 text-green-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Recent Earnings</h3>
//             </div>
//             <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200 cursor-pointer"
//               onClick={() => navigate('/earnings')}
//             >
//               View All
//             </button>
//           </div>

//           <div className="space-y-4">
//             {recentActivities.map((activity) => {
//               const Icon = activity.icon;
//               return (
//                 <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <Icon className="h-5 w-5 text-blue-600" />
//                   </div>
//                   <div className="flex-1">
//                     <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
//                     <p className="text-sm text-gray-500">{activity.customer}</p>
//                     <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${activity.status === 'completed'
//                         ? 'text-green-700 bg-green-100'
//                         : 'text-blue-700 bg-blue-100'
//                       }`}>
//                       {activity.status}
//                     </span>
//                   </div>
//                   <p className="text-xs text-gray-400">{activity.date}</p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center">
//             <div className="p-2 bg-purple-100 rounded-lg mr-3">
//               <CreditCard className="h-5 w-5 text-purple-600" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900">Subscription Plans</h3>
//           </div>
//           <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200 cursor-pointer"
//             onClick={() => navigate('/technicians')}>
//             View Details
//           </button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <div className="h-[300px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={subscriptionData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={60}
//                   outerRadius={100}
//                   paddingAngle={5}
//                   dataKey="value"
//                   label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                 >
//                   {subscriptionData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   formatter={(value) => [`${value}`, 'Technicians']}
//                   contentStyle={{
//                     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                     border: 'none',
//                     borderRadius: '12px',
//                     boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
//                   }}
//                 />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {subscriptionData.map((item, index) => (
//                 <div
//                   key={index}
//                   className="flex flex-col p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
//                   style={{ backgroundColor: `${item.color}10` }}
//                 >
//                   <div className="flex items-center mb-2">
//                     <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
//                     <h4 className="text-md font-semibold text-gray-900">{item.name}</h4>
//                   </div>
//                   <div className="flex items-end justify-between mt-2">
//                     <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
//                     <div className="text-sm text-gray-500">technicians</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
// import { Calendar, Users, DollarSign, Clock, User, Monitor, CreditCard } from 'lucide-react';

// interface Subscription {
//   subscriptionId: string;
//   subscriptionName: string;
//   startDate: string;
//   endDate: string;
//   leads: number | null;
//   ordersCount: number;
//   _id: string;
// }

// interface Technician {
//   id: string;
//   franchiseId: string;
//   username: string;
//   userId: string;
//   phoneNumber: string;
//   role: string;
//   category: string;
//   buildingName: string;
//   areaName: string;
//   city: string;
//   state: string;
//   pincode: string;
//   subscription: Subscription;
// }

// interface Stat {
//   title: string;
//   value: string | number;
//   icon: React.ElementType;
//   color: string;
//   iconBg: string;
// }

// interface MonthlyEarning {
//   month: string;
//   amount: number;
// }

// interface Activity {
//   id: number;
//   title: string;
//   customer: string;
//   date: string;
//   status: string;
//   icon: React.ElementType;
// }

// interface SubscriptionData {
//   name: string;
//   value: number;
//   color: string;
// }

// const Dashboard: React.FC = () => {
//   const navigate = useNavigate();
//   const [technicians, setTechnicians] = useState<Technician[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>('');

//   const today = new Date();
//   const dateString = today.toLocaleDateString('en-US', {
//     weekday: 'long',
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric',
//   });

//   // Mock API call (replace with actual implementation)
//   const getAllTechniciansByFranchise = async (franchiseId: string): Promise<{ result: Technician[] }> => {
//     // Simulated API response
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve({
//           result: [
//             {
//               id: '1',
//               franchiseId,
//               username: 'Tech 1',
//               userId: 'u1',
//               phoneNumber: '1234567890',
//               role: 'technician',
//               category: 'AC Repair',
//               buildingName: 'Building A',
//               areaName: 'Area 1',
//               city: 'City',
//               state: 'State',
//               pincode: '123456',
//               subscription: {
//                 subscriptionId: 's1',
//                 subscriptionName: 'Gold Plan',
//                 startDate: '2025-01-01',
//                 endDate: '2025-12-31',
//                 leads: 10,
//                 ordersCount: 5,
//                 _id: 's1',
//               },
//             },
//             // Add more mock technicians as needed
//           ],
//         });
//       }, 1000);
//     });
//   };

//   const fetchTechsByFranchise = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const franchiseId = localStorage.getItem('userId') || '';
//       const response = await getAllTechniciansByFranchise(franchiseId);
//       if (Array.isArray(response?.result)) {
//         setTechnicians(response.result);
//       } else {
//         setTechnicians([]);
//         setError('No technicians found');
//       }
//     } catch (error: any) {
//       setError(error?.message || 'Failed to fetch technicians');
//       setTechnicians([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTechsByFranchise();
//   }, []);

//   // Calculate stats
//   const totalTechnicians = technicians.length;
//   const totalSubscriptions = technicians.length;

//   // Calculate subscription distribution for pie chart
//   const planCounts: Record<string, number> = {};
//   technicians.forEach((tech) => {
//     const planName = tech.subscription?.subscriptionName || 'No Plan';
//     planCounts[planName] = (planCounts[planName] || 0) + 1;
//   });

//   const getColorForPlan = (planName: string): string => {
//     const colorMap: Record<string, string> = {
//       'Economy Plan': '#10B981',
//       'Gold Plan': '#F59E0B',
//       'Platinum Plan': '#3B82F6',
//       'Basic Plan': '#8B5CF6',
//       'Premium Plan': '#EC4899',
//       'No Plan': '#6B7280',
//     };
//     return colorMap[planName] || '#6B7280';
//   };

//   const subscriptionData: SubscriptionData[] = Object.entries(planCounts).map(([name, value]) => ({
//     name,
//     value,
//     color: getColorForPlan(name),
//   }));
//   const stats: Stat[] = [
//     {
//       title: 'Total Technicians',
//       value: totalTechnicians,
//       icon: Users,
//       color: 'bg-indigo-100 text-indigo-600',
//       iconBg: 'bg-indigo-100',
//     },
//     {
//       title: 'Total Subscriptions',
//       value: totalSubscriptions,
//       icon: CreditCard,
//       color: 'bg-teal-100 text-teal-600',
//       iconBg: 'bg-teal-100',
//     },
//     {
//       title: 'Total Earnings',
//       value: '₹45,00',
//       icon: DollarSign,
//       color: 'bg-yellow-100 text-yellow-600',
//       iconBg: 'bg-yellow-100',
//     },
//     {
//       title: 'Monthly Earnings',
//       value: '₹45,00',
//       icon: DollarSign,
//       color: 'bg-yellow-100 text-yellow-600',
//       iconBg: 'bg-yellow-100',
//     },
//   ];

//   const monthlyEarnings: MonthlyEarning[] = [
//     { month: 'Jan', amount: 38000 },
//     { month: 'Feb', amount: 42000 },
//     { month: 'Mar', amount: 39000 },
//     { month: 'Apr', amount: 45000 },
//     { month: 'May', amount: 48000 },
//     { month: 'Jun', amount: 45300 },
//   ];

//   const recentActivities: Activity[] = [
//     {
//       id: 1,
//       title: 'AC Repair Completed',
//       customer: 'John Smith',
//       date: '15-07-2025',
//       status: 'completed',
//       icon: Monitor,
//     },
//     {
//       id: 2,
//       title: 'Plumbing Service',
//       customer: 'Sarah Johnson',
//       date: '12-07-2025',
//       status: 'completed',
//       icon: Monitor,
//     },
//     {
//       id: 3,
//       title: 'New Technician Joined',
//       customer: 'Raj Kumar',
//       date: '10-07-2025',
//       status: 'active',
//       icon: User,
//     },
//     {
//       id: 4,
//       title: 'Subscription Renewed',
//       customer: 'Mike Wilson',
//       date: '08-07-2025',
//       status: 'active',
//       icon: CreditCard,
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-lg text-gray-600">Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 max-w-7xl mx-auto scrollbar-hide">
//       {/* Welcome Section */}
//       <div className="bg-gradient-to-r from-indigo-600 to-teal-500 rounded-2xl p-6 text-white relative overflow-hidden">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
//           <div className="mb-4 lg:mb-0">
//             <h1 className="text-2xl lg:text-3xl font-bold mb-2">
//               Welcome back, Franchise
//             </h1>
//             <p className="text-indigo-100 text-lg">
//               Here's your performance overview for today
//             </p>
//           </div>
//           <div className="bg-indigo-700/30 backdrop-blur-sm rounded-xl p-4 border border-teal-400/30">
//             <p className="text-sm text-indigo-100 mb-1">Today's Date</p>
//             <p className="text-lg font-semibold">{dateString}</p>
//           </div>
//         </div>
//         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -translate-y-16 translate-x-16"></div>
//         <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/20 rounded-full translate-y-12 -translate-x-12"></div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => {
//           const Icon = stat.icon;
//           return (
//             <div
//               key={index}
//               className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105"
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
//                   <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
//                 </div>
//                 <div className={`p-3 rounded-xl ${stat.iconBg}`}>
//                   <Icon className={`h-6 w-6 ${stat.color.split(' ')[1]}`} />
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Monthly Earnings & Recent Activities */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Monthly Earnings */}
//         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-indigo-100 rounded-lg mr-3">
//                 <DollarSign className="h-5 w-5 text-indigo-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Monthly Earnings</h3>
//             </div>
//           </div>
//           <div className="space-y-4">
//             {monthlyEarnings.map((item, index) => (
//               <div key={index} className="flex items-center justify-between">
//                 <span className="text-gray-700 font-medium w-12">{item.month}</span>
//                 <div className="flex items-center space-x-4 flex-1">
//                   <div className="flex-1 bg-gray-200 rounded-full h-3 mx-4">
//                     <div
//                       className="bg-gradient-to-r from-indigo-600 to-teal-500 h-3 rounded-full transition-all duration-300"
//                       style={{ width: `${(item.amount / 50000) * 100}%` }}
//                     ></div>
//                   </div>
//                   <span className="text-gray-900 font-semibold w-16 text-right">₹{(item.amount / 1000).toFixed(0)}k</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Recent Activities */}
//         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-teal-100 rounded-lg mr-3">
//                 <Clock className="h-5 w-5 text-teal-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
//             </div>
//             <button
//               className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors duration-200 cursor-pointer"
//               onClick={() => navigate('/earnings')}
//             >
//               View All
//             </button>
//           </div>
//           <div className="space-y-4">
//             {recentActivities.map((activity) => {
//               const Icon = activity.icon;
//               return (
//                 <div
//                   key={activity.id}
//                   className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
//                 >
//                   <div className="p-2 bg-indigo-100 rounded-lg">
//                     <Icon className="h-5 w-5 text-indigo-600" />
//                   </div>
//                   <div className="flex-1">
//                     <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
//                     <p className="text-sm text-gray-500">{activity.customer}</p>
//                     <span
//                       className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
//                         activity.status === 'completed'
//                           ? 'text-teal-700 bg-teal-100'
//                           : 'text-indigo-700 bg-indigo-100'
//                       }`}
//                     >
//                       {activity.status}
//                     </span>
//                   </div>
//                   <p className="text-xs text-gray-400">{activity.date}</p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* Subscription Plans */}
//       <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center">
//             <div className="p-2 bg-indigo-100 rounded-lg mr-3">
//               <CreditCard className="h-5 w-5 text-indigo-600" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900">Subscription Plans</h3>
//           </div>
//           <button
//             className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors duration-200 cursor-pointer"
//             onClick={() => navigate('/technicians')}
//           >
//             View Details
//           </button>
//         </div>
//         {technicians.length === 0 ? (
//           <div className="text-center py-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">No Technicians Found</h3>
//             <p className="text-gray-500">It seems there are no technicians available at the moment.</p>
//             <button
//               className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
//               onClick={() => navigate('/technicians')}
//             >
//               Add Technicians
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {subscriptionData.map((item, index) => {
//                 let gradientClass = '';
//                 let textColor = 'text-gray-900';
//                 switch (item.name) {
//                   case 'Economy Plan':
//                     gradientClass = 'bg-gradient-to-br from-blue-400 to-blue-500';
//                     textColor = 'text-white';
//                     break;
//                   case 'Gold Plan':
//                     gradientClass = 'bg-gradient-to-br from-yellow-400 to-yellow-500';
//                     textColor = 'text-white';
//                     break;
//                   case 'Platinum Plan':
//                     gradientClass = 'bg-gradient-to-br from-purple-400 to-purple-500';
//                     textColor = 'text-white';
//                     break;
//                   case 'Basic Plan':
//                     gradientClass = 'bg-gradient-to-br from-green-500 to-green-600';
//                     textColor = 'text-white';
//                     break;
//                   case 'Premium Plan':
//                     gradientClass = 'bg-gradient-to-br from-pink-500 to-pink-600';
//                     textColor = 'text-white';
//                     break;
//                   default:
//                     gradientClass = 'bg-gray-50';
//                 }
//                 return (
//                   <div
//                     key={index}
//                     className={`flex flex-col p-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.03] min-h-[100px] ${gradientClass}`}
//                   >
//                     <div className="flex items-center mb-2">
//                       <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
//                       <h4 className={`text-md font-semibold ${textColor}`}>{item.name}</h4>
//                     </div>
//                     <div className="flex items-end justify-between mt-2">
//                       <p className={`text-2xl font-bold ${textColor}`} style={{ color: textColor === 'text-gray-900' ? item.color : 'inherit' }}>
//                         {item.value}
//                       </p>
//                       <div className={`text-sm ${textColor === 'text-gray-900' ? 'text-gray-500' : 'text-white/80'}`}>technicians</div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//             <div className="h-64">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={subscriptionData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="value"
//                     nameKey="name"
//                   >
//                     {subscriptionData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
// import React, { useEffect, useState } from 'react';
// import { Calendar, Users, CheckCircle, DollarSign, Star, Clock, User, Monitor, CreditCard, Wrench } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
// import { getAllTechniciansByFranchise } from '../../api/apiMethods';

// interface Subscription {
//   subscriptionId: string;
//   subscriptionName: string;
//   startDate: string;
//   endDate: string;
//   leads: number | null;
//   ordersCount: number;
//   _id: string;
// }

// interface Technician {
//   id: string;
//   franchiseId: string;
//   username: string;
//   userId: string;
//   phoneNumber: string;
//   role: string;
//   category: string;
//   buildingName: string;
//   areaName: string;
//   city: string;
//   state: string;
//   pincode: string;
//   subscription: Subscription;
// }

// const Dashboard: React.FC = () => {
//   const navigate = useNavigate();
//   const [technicians, setTechnicians] = useState<Technician[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const today = new Date();
//   const dateString = today.toLocaleDateString('en-US', {
//     weekday: 'long',
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric'
//   });

//   // Fetch technicians data
//   const fetchTechsByFranchise = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const franchiseId = localStorage.getItem('userId') || '';
//       const response = await getAllTechniciansByFranchise(franchiseId);
//       if (Array.isArray(response?.result)) {
//         setTechnicians(response.result);
//       } else {
//         setTechnicians([]);
//         setError('No technicians found');
//       }
//     } catch (error: any) {
//       setError(error?.message || 'Failed to fetch technicians');
//       setTechnicians([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTechsByFranchise();
//   }, []);

//   // Calculate stats
//   const totalTechnicians = technicians.length;
//   const totalSubscriptions = technicians.length;

//   // Calculate subscription distribution for pie chart
//   const planCounts: Record<string, number> = {};
//   technicians.forEach(tech => {
//     const planName = tech.subscription?.subscriptionName || 'No Plan';
//     planCounts[planName] = (planCounts[planName] || 0) + 1;
//   });

//   const subscriptionData = Object.entries(planCounts).map(([name, value]) => ({
//     name,
//     value,
//     color: getColorForPlan(name)
//   }));

//   function getColorForPlan(planName: string): string {
//     const colorMap: Record<string, string> = {
//       'Economy Plan': '#10B981',
//       'Gold Plan': '#F59E0B',
//       'Platinum Plan': '#3B82F6',
//       'Basic Plan': '#8B5CF6',
//       'Premium Plan': '#EC4899'
//     };
//     return colorMap[planName] || '#6B7280';
//   }

//   const stats = [
//     {
//       title: 'Total Technicians',
//       value: totalTechnicians,
//       icon: Users,
//       color: 'bg-blue-100 text-blue-600',
//       iconBg: 'bg-blue-100'
//     },
//     {
//       title: 'Total Subscriptions',
//       value: totalSubscriptions,
//       icon: CreditCard,
//       color: 'bg-green-100 text-green-600',
//       iconBg: 'bg-green-100'
//     },
//     {
//       title: 'Total Earnings',
//       value: '₹45,00',
//       icon: DollarSign,
//       color: 'bg-yellow-100 text-yellow-600',
//       iconBg: 'bg-yellow-100'
//     },
//     {
//       title: 'Monthly Earnings',
//       value: '₹45,00',
//       icon: DollarSign,
//       color: 'bg-yellow-100 text-yellow-600',
//       iconBg: 'bg-yellow-100'
//     },
//   ];

//   const monthlyEarnings = [
//     { month: 'Jan', amount: 38000 },
//     { month: 'Feb', amount: 42000 },
//     { month: 'Mar', amount: 39000 },
//     { month: 'Apr', amount: 45000 },
//     { month: 'May', amount: 48000 },
//     { month: 'Jun', amount: 45300 },
//   ];

//   const recentActivities = [
//     {
//       id: 1,
//       title: 'AC Repair Completed',
//       customer: 'John Smith',
//       date: '15-07-2025',
//       status: 'completed',
//       icon: Monitor
//     },
//     {
//       id: 2,
//       title: 'Plumbing Service',
//       customer: 'Sarah Johnson',
//       date: '12-07-2025',
//       status: 'completed',
//       icon: Monitor
//     },
//     {
//       id: 3,
//       title: 'New Technician Joined',
//       customer: 'Raj Kumar',
//       date: '10-07-2025',
//       status: 'active',
//       icon: User
//     },
//     {
//       id: 4,
//       title: 'Subscription Renewed',
//       customer: 'Mike Wilson',
//       date: '08-07-2025',
//       status: 'active',
//       icon: CreditCard
//     }
//   ];

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-lg text-gray-600">Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 max-w-7xl mx-auto scrollbar-hide">
//       {/* Updated with indigo to teal gradient */}
//       <div className="bg-gradient-to-r from-indigo-600 to-teal-500 rounded-2xl p-6 text-white relative overflow-hidden">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
//           <div className="mb-4 lg:mb-0">
//             <h1 className="text-2xl lg:text-3xl font-bold mb-2">
//               Welcome back, Franchise
//             </h1>
//             <p className="text-indigo-100 text-lg">
//               Here's your performance overview for today
//             </p>
//           </div>
//           <div className="bg-indigo-700/30 backdrop-blur-sm rounded-xl p-4 border border-teal-400/30">
//             <p className="text-sm text-indigo-100 mb-1">Today's Date</p>
//             <p className="text-lg font-semibold">{dateString}</p>
//           </div>
//         </div>
//         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -translate-y-16 translate-x-16"></div>
//         <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/20 rounded-full translate-y-12 -translate-x-12"></div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => {
//           const Icon = stat.icon;
//           return (
//             <div
//               key={index}
//               className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105"
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
//                   <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
//                 </div>
//                 <div className={`p-3 rounded-xl ${stat.iconBg}`}>
//                   <Icon className={`h-6 w-6 ${stat.color.split(' ')[1]}`} />
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-indigo-100 rounded-lg mr-3">
//                 <DollarSign className="h-5 w-5 text-indigo-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Monthly Earnings</h3>
//             </div>
//           </div>

//           <div className="space-y-4">
//             {monthlyEarnings.map((item, index) => (
//               <div key={index} className="flex items-center justify-between">
//                 <span className="text-gray-700 font-medium w-12">{item.month}</span>
//                 <div className="flex items-center space-x-4 flex-1">
//                   <div className="flex-1 bg-gray-200 rounded-full h-3 mx-4">
//                     {/* Updated with indigo to teal gradient */}
//                     <div
//                       className="bg-gradient-to-r from-indigo-600 to-teal-500 h-3 rounded-full transition-all duration-300"
//                       style={{ width: `${(item.amount / 50000) * 100}%` }}
//                     ></div>
//                   </div>
//                   <span className="text-gray-900 font-semibold w-16 text-right">₹{(item.amount / 1000).toFixed(0)}k</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-green-100 rounded-lg mr-3">
//                 <Clock className="h-5 w-5 text-green-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Recent Earnings</h3>
//             </div>
//             <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200 cursor-pointer"
//               onClick={() => navigate('/earnings')}
//             >
//               View All
//             </button>
//           </div>

//           <div className="space-y-4">
//             {recentActivities.map((activity) => {
//               const Icon = activity.icon;
//               return (
//                 <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <Icon className="h-5 w-5 text-blue-600" />
//                   </div>
//                   <div className="flex-1">
//                     <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
//                     <p className="text-sm text-gray-500">{activity.customer}</p>
//                     <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${activity.status === 'completed'
//                         ? 'text-green-700 bg-green-100'
//                         : 'text-blue-700 bg-blue-100'
//                       }`}>
//                       {activity.status}
//                     </span>
//                   </div>
//                   <p className="text-xs text-gray-400">{activity.date}</p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center">
//             <div className="p-2 bg-purple-100 rounded-lg mr-3">
//               <CreditCard className="h-5 w-5 text-purple-600" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900">Subscription Plans</h3>
//           </div>
//           <button
//           className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200 cursor-pointer"
//             onClick={() => navigate('/technicians')}
//           >
//             View Details
//           </button>
//         </div>

//         {technicians.length === 0 ? (
//           <div className="text-center py-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">No Technicians Found</h3>
//             <p className="text-gray-500">It seems there are no technicians available at the moment.</p>
//             <button
//               className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
//               onClick={() => navigate('/technicians')}
//             >
//               Add Technicians
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {subscriptionData.map((item, index) => {
//                 let gradientClass = "";
//                 let textColor = "text-gray-900";

//                 // Apply different gradients based on plan name
//                 if (item.name === "Economy Plan") {
//                   gradientClass = "bg-gradient-to-br from-blue-400 to-blue-500";
//                   textColor = "text-white";
//                 } else if (item.name === "Gold Plan") {
//                   gradientClass = "bg-gradient-to-br from-yellow-400 to-yellow-500";
//                   textColor = "text-white";
//                 } else if (item.name === "Platinum Plan") {
//                   gradientClass = "bg-gradient-to-br from-purple-400 to-purple-500";
//                   textColor = "text-white";
//                 } else if (item.name === "Basic Plan") {
//                   gradientClass = "bg-gradient-to-br from-green-500 to-green-600";
//                   textColor = "text-white";
//                 } else if (item.name === "Premium Plan") {
//                   gradientClass = "bg-gradient-to-br from-pink-500 to-pink-600";
//                   textColor = "text-white";
//                 } else {
//                   gradientClass = "bg-gray-50";
//                 }

//                 return (
//                   <div
//                     key={index}
//                     className={`flex flex-col p-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.03] min-h-[100px] ${gradientClass}`}
//                   >
//                     <div className="flex items-center mb-2">
//                       <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
//                       <h4 className="text-md font-semibold text-gray-900">{item.name}</h4>
//                     </div>
//                     <div className="flex items-end justify-between mt-2">
//                       <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
//                       <div className="text-sm text-gray-500">technicians</div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//             </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
