import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTechniciansByFranchise } from "../../api/apiMethods";
import { Eye, Filter, Phone, Plus, Search, SquarePen, Users } from "lucide-react";

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

const Technicians: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [allTechs, setAllTechs] = useState<Technician[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const fetchTechsByFranchise = async () => {
    try {
      setLoading(true);
      setError('');
      const franchiseId = localStorage.getItem('userId') || '';
      const response = await getAllTechniciansByFranchise(franchiseId);
      if (Array.isArray(response?.result)) {
        setAllTechs(response.result);
      } else {
        setAllTechs([]);
        setError('No technicians found');
      }
    } catch (error) {
      setError(error?.message || 'Failed to fetch technicians');
      setAllTechs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechsByFranchise();
  }, []);

  // Get unique subscription plans for filter
  const subscriptionPlans = useMemo(() => {
    const plans = new Set(allTechs.map(tech => tech.subscription?.subscriptionName));
    return ['all', ...plans];
  }, [allTechs]);

  // Memoize filtered technicians
  const filteredTechnicians = useMemo(() => {
    return allTechs.filter(tech => {
      const matchesSearch =
        tech.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan =
        filterPlan === 'all' || tech.subscription?.subscriptionName === filterPlan;
      return matchesSearch && matchesPlan;
    });
  }, [allTechs, searchTerm, filterPlan]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTechnicians.length / itemsPerPage);
  const paginatedTechnicians = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTechnicians.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTechnicians, currentPage]);

  // Format date to "DD MMM YYYY"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Technicians Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all technicians in your network</p>
        </div>
        <button
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center"
          onClick={() => navigate('/addTechnician')}
          aria-label="Add new technician"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Technician
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search technicians by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search technicians"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by subscription plan"
            >
              {subscriptionPlans.map(plan => (
                <option key={plan} value={plan}>
                  {plan === 'all' ? 'All Plans' : plan}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Technicians Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Technician</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Mobile</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Category</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Address</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Subscription Plan</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Plan End Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-600">
                    Loading...
                  </td>
                </tr>
              ) : paginatedTechnicians.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No technicians found</h3>
                  </td>
                </tr>
              ) : (
                paginatedTechnicians.map((tech) => (
                  <tr key={tech.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {tech?.username.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 whitespace-nowrap">{tech.username}</h4>
                          <p className="text-sm text-gray-500">ID: {tech.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-sm text-gray-700 whitespace-nowrap">
                        <Phone className="h-3 w-3 mr-2 text-gray-400" />
                        {tech.phoneNumber}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">{tech.category}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-sm text-gray-700">
                        {`${tech.buildingName}, ${tech.areaName}, ${tech.city}, ${tech.state} ${tech.pincode}`}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">{tech.subscription.subscriptionName}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">{formatDate(tech.subscription.endDate)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                          aria-label="View technician details"
                          onClick={() => navigate(`/technician/${tech.id}`, { state: { technician: tech } })}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-200"
                          aria-label="Edit technician"
                          onClick={() => navigate(`/editTechnician/${tech.id}`)}
                        >
                          <SquarePen size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 py-4">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl disabled:opacity-50"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`px-4 py-2 rounded-xl ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => handlePageChange(page)}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            ))}
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl disabled:opacity-50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Total Technicians</p>
          <p className="text-2xl font-bold text-gray-900">{allTechs.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Unique Subscription Plans</p>
          <p className="text-2xl font-bold text-purple-600">
            {new Set(allTechs.map(tech => tech.subscription?.subscriptionName)).size}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Technicians;
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { getAllTechniciansByFranchise } from "../../api/apiMethods";
// import { Eye, Filter, Phone, Plus, Search, SquarePen, Users } from "lucide-react";
//     interface Subscription {
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

//     const Technicians = () => {
//       const [searchTerm, setSearchTerm] = useState('');
//       const [filterPlan, setFilterPlan] = useState('all');
//       const [allTechs, setAllTechs] = useState<Technician>([]);
//       const [error, setError] = useState('');
//       const [loading, setLoading] = useState(false);
//       const [currentPage, setCurrentPage] = useState(1);
//       const itemsPerPage = 5;
//       const navigate = useNavigate();

//       const fetchTechsByFranchise = async () => {
//         try {
//           setLoading(true);
//           setError('');
//           const franchiseId = localStorage.getItem('userId') || '';
//           const response = await getAllTechniciansByFranchise(franchiseId);
//           if (Array.isArray(response?.result)) {
//             setAllTechs(response.result);
//           } else {
//             setAllTechs([]);
//             setError('No technicians found');
//           }
//         } catch (error) {
//           setError(error?.message || 'Failed to fetch technicians');
//           setAllTechs([]);
//         } finally {
//           setLoading(false);
//         }
//       };

//       useEffect(() => {
//         fetchTechsByFranchise();
//       }, []);

//       // Get unique subscription plans for filter
//       const subscriptionPlans = useMemo(() => {
//         const plans = new Set(allTechs.map(tech => tech.subscription?.subscriptionName));
//         return ['all', ...plans];
//       }, [allTechs]);

//       // Memoize filtered technicians
//       const filteredTechnicians = useMemo(() => {
//         return allTechs.filter(tech => {
//           const matchesSearch =
//             tech.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             tech.category.toLowerCase().includes(searchTerm.toLowerCase());
//           const matchesPlan =
//             filterPlan === 'all' || tech.subscription?.subscriptionName === filterPlan;
//           return matchesSearch && matchesPlan;
//         });
//       }, [allTechs, searchTerm, filterPlan]);

//       // Pagination logic
//       const totalPages = Math.ceil(filteredTechnicians.length / itemsPerPage);
//       const paginatedTechnicians = useMemo(() => {
//         const startIndex = (currentPage - 1) * itemsPerPage;
//         return filteredTechnicians.slice(startIndex, startIndex + itemsPerPage);
//       }, [filteredTechnicians, currentPage]);

//       // Format date to "DD MMM YYYY"
//       const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-GB', {
//           day: '2-digit',
//           month: 'short',
//           year: 'numeric'
//         });
//       };

//       // Handle page change
//       const handlePageChange = (page) => {
//         if (page >= 1 && page <= totalPages) {
//           setCurrentPage(page);
//         }
//       };

//       return (
//         <div className="space-y-6 max-w-7xl mx-auto p-4">
//           {/* Header */}
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Technicians Management</h1>
//               <p className="text-gray-600 mt-1">Manage and monitor all technicians in your network</p>
//             </div>
//             <button
//               className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center"
//               onClick={() => navigate('/addTechnician')}
//               aria-label="Add new technician"
//             >
//               <Plus className="h-4 w-4 mr-2" />
//               Add Technician
//             </button>
//           </div>

//           {/* Error Message */}
//           {error && (
//             <div className="bg-red-100 text-red-700 p-4 rounded-xl">
//               {error}
//             </div>
//           )}

//           {/* Search and Filter */}
//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//             <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search technicians by name or category..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   aria-label="Search technicians"
//                 />
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Filter className="h-5 w-5 text-gray-400" />
//                 <select
//                   value={filterPlan}
//                   onChange={(e) => setFilterPlan(e.target.value)}
//                   className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   aria-label="Filter by subscription plan"
//                 >
//                   {subscriptionPlans.map(plan => (
//                     <option key={plan} value={plan}>
//                       {plan === 'all' ? 'All Plans' : plan}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Technicians Table */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b border-gray-200">
//                   <tr>
//                     <th className="text-left py-4 px-6 font-semibold text-gray-700">Technician</th>
//                     <th className="text-left py-4 px-6 font-semibold text-gray-700">Mobile</th>
//                     <th className="text-left py-4 px-6 font-semibold text-gray-700">Category</th>
//                     <th className="text-left py-4 px-6 font-semibold text-gray-700">Address</th>
//                     <th className="text-left py-4 px-6 font-semibold text-gray-700">Subscription Plan</th>
//                     <th className="text-left py-4 px-6 font-semibold text-gray-700">Plan End Date</th>
//                     <th className="text-left py-4 px-6 font-semibold text-gray-700">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td colSpan={7} className="text-center py-12 text-gray-600">
//                         Loading...
//                       </td>
//                     </tr>
//                   ) : paginatedTechnicians.length === 0 ? (
//                     <tr>
//                       <td colSpan={7} className="text-center py-12">
//                         <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                         <h3 className="text-lg font-medium text-gray-900 mb-2">No technicians found</h3>
//                       </td>
//                     </tr>
//                   ) : (
//                     paginatedTechnicians.map((tech) => (
//                       <tr key={tech.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
//                         <td className="py-4 px-6">
//                           <div className="flex items-center space-x-3">
//                             <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
//                               <span className="text-white font-medium text-sm">
//                                 {tech?.username.split(' ').map(n => n[0]).join('')}
//                               </span>
//                             </div>
//                             <div>
//                               <h4 className="font-semibold text-gray-900 whitespace-nowrap">{tech.username}</h4>
//                               <p className="text-sm text-gray-500">ID: {tech.id}</p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="py-4 px-6">
//                           <div className="flex items-center text-sm text-gray-700 whitespace-nowrap">
//                             <Phone className="h-3 w-3 mr-2 text-gray-400" />
//                             {tech.phoneNumber}
//                           </div>
//                         </td>
//                         <td className="py-4 px-6">
//                           <span className="text-gray-700">{tech.category}</span>
//                         </td>
//                         <td className="py-4 px-6">
//                           <div className="flex items-center text-sm text-gray-700">
//                             {`${tech.buildingName}, ${tech.areaName}, ${tech.city}, ${tech.state} ${tech.pincode}`}
//                           </div>
//                         </td>
//                         <td className="py-4 px-6">
//                           <span className="text-gray-700">{tech.subscription.subscriptionName}</span>
//                         </td>
//                         <td className="py-4 px-6">
//                           <span className="text-gray-700">{formatDate(tech.subscription.endDate)}</span>
//                         </td>
//                         <td className="py-4 px-6">
//                           <div className="flex space-x-2">
//                             <button
//                               className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
//                               aria-label="View technician details"
//                               onClick={() => navigate(`/technician/${tech.id}`, { state: { technician: tech } })}
//                             >
//                               <Eye size={18} />
//                             </button>
//                             <button
//                               className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-200"
//                               aria-label="Edit technician"
//                               onClick={() => navigate(`/editTechnician/${tech.id}`)}
//                             >
//                               <SquarePen size={16} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex justify-center items-center space-x-2 py-4">
//                 <button
//                   className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl disabled:opacity-50"
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   aria-label="Previous page"
//                 >
//                   Previous
//                 </button>
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
//                   <button
//                     key={page}
//                     className={`px-4 py-2 rounded-xl ${
//                       currentPage === page
//                         ? 'bg-blue-600 text-white'
//                         : 'bg-gray-200 text-gray-700'
//                     }`}
//                     onClick={() => handlePageChange(page)}
//                     aria-label={`Go to page ${page}`}
//                   >
//                     {page}
//                   </button>
//                 ))}
//                 <button
//                   className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl disabled:opacity-50"
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   aria-label="Next page"
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Summary Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//               <p className="text-sm text-gray-600">Total Technicians</p>
//               <p className="text-2xl font-bold text-gray-900">{allTechs.length}</p>
//             </div>
//             <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//               <p className="text-sm text-gray-600">Unique Subscription Plans</p>
//               <p className="text-2xl font-bold text-purple-600">
//                 {new Set(allTechs.map(tech => tech.subscription?.subscriptionName)).size}
//               </p>
//             </div>
//           </div>
//         </div>
//       );
//     };

//     export default Technicians;
// import React, { useEffect, useState, useMemo } from 'react';
// import { Users, Search, Plus, Star, Phone, SquarePen, Eye } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { getAllTechniciansByFranchise } from '../../api/apiMethods';

// // Define TypeScript interfaces for type safety
// interface Technician {
//   id: number;
//   username: string;
//   phoneNumber: string;
//   category: string;
//   areaName: string;
// }

// const Technicians: React.FC = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [allTechs, setAllTechs] = useState<Technician[]>([]);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false); // Added loading state
//   const navigate = useNavigate();

//   const fetchTechsByFranchise = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const franchiseId = localStorage.getItem('userId') || '';
//       const response = await getAllTechniciansByFranchise(franchiseId);
      
//       // Validate response structure
//       if (Array.isArray(response?.result)) {
//         setAllTechs(response.result);
//       } else {
//         setAllTechs([]);
//         setError('No technicians found');
//       }
//     } catch (error: any) {
//       setError(error?.message || 'Failed to fetch technicians');
//       setAllTechs([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTechsByFranchise();
//   }, []);

//   // Memoize filtered technicians for performance
//   const filteredTechnicians = useMemo(() => {
//     return allTechs.filter(tech =>
//       tech.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       tech.category.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [allTechs, searchTerm]);

//   return (
//     <div className="space-y-6 max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Technicians Management</h1>
//           <p className="text-gray-600 mt-1">Manage and monitor all technicians in your network</p>
//         </div>
//         <button
//           className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center"
//           onClick={() => navigate('/addTechnician')}
//           aria-label="Add new technician"
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Add Technician
//         </button>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-100 text-red-700 p-4 rounded-xl">
//           {error}
//         </div>
//       )}

//       {/* Search */}
//       <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search technicians by name or category..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             aria-label="Search technicians"
//           />
//         </div>
//       </div>

//       {/* Technicians Table */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="text-left py-4 px-6 font-semibold text-gray-700">Technician</th>
//                 <th className="text-left py-4 px-6 font-semibold text-gray-700">Mobile</th>
//                 <th className="text-left py-4 px-6 font-semibold text-gray-700">Category</th>
//                 <th className="text-left py-4 px-6 font-semibold text-gray-700">Address</th>
//                 <th className="text-left py-4 px-6 font-semibold text-gray-700">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={8} className="text-center py-12 text-gray-600">
//                     Loading...
//                   </td>
//                 </tr>
//               ) : filteredTechnicians.length === 0 ? (
//                 <tr>
//                   <td colSpan={8} className="text-center py-12">
//                     <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                     <h3 className="text-lg font-medium text-gray-900 mb-2">No technicians found</h3>
//                   </td>
//                 </tr>
//               ) : (
//                 filteredTechnicians.map((tech) => (
//                   <tr key={tech.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
//                     <td className="py-4 px-6">
//                       <div className="flex items-center space-x-3">
//                         <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
//                           <span className="text-white font-medium text-sm">
//                             {tech.username.split(' ').map(n => n[0]).join('')}
//                           </span>
//                         </div>
//                         <div>
//                           <h4 className="font-semibold text-gray-900 whitespace-nowrap">{tech.username}</h4>
//                           <p className="text-sm text-gray-500">ID: {tech.id.toString().padStart(3, '0')}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="py-4 px-6">
//                       <div className="flex items-center text-sm text-gray-700 whitespace-nowrap">
//                         <Phone className="h-3 w-3 mr-2 text-gray-400" />
//                         {tech.phoneNumber}
//                       </div>
//                     </td>
//                     <td className="py-4 px-6">
//                       <span className="text-gray-700">{tech.category}</span>
//                     </td>
//                     <td className="py-4 px-6">
//                       <div className="flex items-center text-sm text-gray-700">
//                         {tech?.areaName?.toString()}
//                       </div>
//                     </td>
//                     <td className="py-4 px-6">
//                       <div className="flex space-x-2">
//                         <button
//                           className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
//                           aria-label="View technician details"
//                           onClick={() => navigate(`/technician/${tech.id}`)}
//                         >
//                           <Eye size={18} />
//                         </button>
//                         <button
//                           className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-200"
//                           aria-label="Edit technician"
//                           onClick={() => navigate(`/editTechnician/${tech.id}`)}
//                         >
//                           <SquarePen size={16} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Summary Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//           <p className="text-sm text-gray-600">Total Technicians</p>
//           <p className="text-2xl font-bold text-gray-900">{allTechs.length}</p>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//           <p className="text-sm text-gray-600">Average Rating</p>
//           <p className="text-2xl font-bold text-purple-600">
//             {(allTechs.length > 0
//               ? allTechs.reduce((acc, t) => acc + t.rating, 0) / allTechs.length
//               : 0
//             ).toFixed(1)}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Technicians;
// import React, { useEffect, useState } from 'react';
// import { Users, Search, Plus, Star, MapPin, Phone, Mail, Filter, SquarePen, Eye, Trash } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { getAllTechniciansByFranchise } from '../../api/apiMethods';

// const Technicians: React.FC = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [allTechs, setAllTechs] = useState([]);
//   const [error, setError] = useState('');
//   const navigate = useNavigate()


//   const fetchTechsByFranchise = async () => {
//     try {
//       const franchiseId = localStorage.getItem('userId') || '';
//       const response = await getAllTechniciansByFranchise(franchiseId);
//       if (response?.result) {
//         setAllTechs(response?.result);
//         console.log('Technicians fetched successfully:', response);
//       } else {
//         setAllTechs([]);
//         console.error('No technicians found');
//       }
//     } catch (error) {
//       setError(error?.message || 'Failed to fetch technicians');
//       console.error('Error fetching technicians:', error);

//     }
//   };
//   useEffect(() => {
//     fetchTechsByFranchise();
//   }, []);

//   const filteredTechnicians = allTechs.filter(tech => {
//     const matchesSearch = tech?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       tech?.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
//     // const matchesFilter = filterStatus === 'all' || tech.status.toLowerCase() === filterStatus.toLowerCase();
//     return matchesSearch;
//   });

//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'available':
//         return 'bg-green-100 text-green-700';
//       case 'busy':
//         return 'bg-yellow-100 text-yellow-700';
//       case 'offline':
//         return 'bg-red-100 text-red-700';
//       default:
//         return 'bg-gray-100 text-gray-700';
//     }
//   };

//   return (
//     <div className="space-y-6 max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Technicians Management</h1>
//           <p className="text-gray-600 mt-1">Manage and monitor all technicians in your network</p>
//         </div>
//         <button 
//         className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center"
//         onClick={()=> navigate('/addTechnician')}>
//           <Plus className="h-4 w-4 mr-2" />
//           Add Technician
//         </button>
//       </div>

//       {/* Search and Filter */}
//       <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//         <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search technicians by name, Categories..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//           {/* <div className="flex items-center space-x-2">
//             <Filter className="h-5 w-5 text-gray-400" />
//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="all">All Status</option>
//               <option value="available">Available</option>
//               <option value="busy">Busy</option>
//               <option value="offline">Offline</option>
//             </select>
//           </div> */}
//         </div>
//       </div>

//       {/* Technicians Table */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="text-left py-4 px-6 font-semibold text-gray-700">Technician</th>
//                 <th className="text-left py-4 px-6 font-semibold text-gray-700">Mobile</th>
//                 <th className="text-left py-4 px-6 font-semibold text-gray-700">Category</th>
//                 <th className="text-left py-4 px-6 font-semibold text-gray-700">Address</th>
//                 <th className="text-left py-4 px-6 font-semibold text-gray-700">Rating</th>
//                 <th className="text-left py-4 px-6 font-semibold text-gray-700">Services</th>
//                 <th className="text-left py-4 px-6 font-semibold text-gray-700">Experience</th>
//                 {/* <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th> */}
//                 <th className="text-left py-4 px-6 font-semibold text-gray-700">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredTechnicians.map((tech) => (
//                 <tr key={tech?.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
//                   <td className="py-4 px-6">
//                     <div className="flex items-center space-x-3">
//                       <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
//                         <span className="text-white font-medium text-sm">
//                           {tech?.username?.split(' ').map(n => n[0]).join('')}
//                         </span>
//                       </div>
//                       <div>
//                         <h4 className="font-semibold text-gray-900 whitespace-nowrap">{tech.username}</h4>
//                         <p className="text-sm text-gray-500">ID: {tech.id.toString().padStart(3, '0')}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="py-4 px-6">
//                     <div className="space-y-1">
//                       {/* <div className="flex items-center text-sm text-gray-700">
//                         <Mail className="h-3 w-3 mr-2 text-gray-400" />
//                         {tech.email}
//                       </div> */}
//                       <div className="flex items-center text-sm text-gray-700 whitespace-nowrap">
//                         {/* <Phone className="h-3 w-3 mr-2 text-gray-400 " /> */}
//                         {tech?.phoneNumber}
//                       </div>
//                     </div>
//                   </td>
//                   <td className="py-4 px-6">
//                     <span className="text-gray-700">{tech?.category}</span>
//                   </td>
//                   <td className="py-4 px-6">
//                     <div className="flex items-center text-sm text-gray-700">
//                       {/* <MapPin className="h-3 w-3 mr-1 text-gray-400" /> */}
//                       {tech?.areaName}
//                     </div>
//                   </td>
//                   <td className="py-4 px-6">
//                     <div className="flex items-center">
//                       <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
//                       <span className="text-gray-700 font-medium">{tech.rating}</span>
//                     </div>
//                   </td>
//                   <td className="py-4 px-6">
//                     <span className="text-gray-700 font-medium">{tech?.services || 4} </span>
//                   </td>
//                   <td className="py-4 px-6">
//                     <span className="text-gray-700">{tech?.experience || 0}</span>
//                   </td>
//                   {/* <td className="py-4 px-6">
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tech.status)}`}>
//                       {tech.status}
//                     </span>
//                   </td> */}
//                   <td className="py-4 px-6">
//                     <div className="flex space-x-2">
//                       <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200">
//                         <Eye size={18} />
//                       </button>
//                       <button className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-200">
//                         <SquarePen size={16} />
//                       </button>
//                       {/* <button className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200">
//                         <Trash />
//                       </button> */}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {filteredTechnicians.length === 0 && (
//           <div className="text-center py-12">
//             <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No technicians found</h3>
//           </div>
//         )}
//       </div>

//       {/* Summary Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//           <p className="text-sm text-gray-600">Total Technicians</p>
//           <p className="text-2xl font-bold text-gray-900">{allTechs.length|| 0} </p>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//           <p className="text-sm text-gray-600">Available</p>
//           <p className="text-2xl font-bold text-green-600">
//             {allTechs.filter(t => t.status === 'Available').length}
//           </p>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//           <p className="text-sm text-gray-600">Busy</p>
//           <p className="text-2xl font-bold text-yellow-600">
//             {allTechs.filter(t => t.status === 'Busy').length}
//           </p>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//           <p className="text-sm text-gray-600">Average Rating</p>
//           <p className="text-2xl font-bold text-purple-600">
//             {(allTechs.reduce((acc, t) => acc + t.rating, 0) / allTechs.length).toFixed(1)}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Technicians;