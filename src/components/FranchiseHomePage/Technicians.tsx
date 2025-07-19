import React, { useState } from 'react';
import { Users, Search, Plus, Star, MapPin, Phone, Mail, Filter, SquarePen, Eye, Trash } from 'lucide-react';

const Technicians: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const technicians = [
    {
      id: 1,
      name: 'Raj Kumar',
      email: 'raj.kumar@proservices.com',
      phone: '+91 98765 43211',
      specialty: 'HVAC Specialist',
      rating: 4.9,
      location: 'Mumbai, Maharashtra',
      status: 'Available',
      services: 156,
      joinDate: '2024-01-15',
      experience: '8 years'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@proservices.com',
      phone: '+91 98765 43212',
      specialty: 'Plumbing Expert',
      rating: 4.7,
      location: 'Delhi, NCR',
      status: 'Busy',
      services: 89,
      joinDate: '2024-02-20',
      experience: '5 years'
    },
    {
      id: 3,
      name: 'Amit Patel',
      email: 'amit.patel@proservices.com',
      phone: '+91 98765 43213',
      specialty: 'Electrical Services',
      rating: 4.8,
      location: 'Ahmedabad, Gujarat',
      status: 'Available',
      services: 234,
      joinDate: '2023-11-10',
      experience: '10 years'
    },
    {
      id: 4,
      name: 'Sneha Reddy',
      email: 'sneha.reddy@proservices.com',
      phone: '+91 98765 43214',
      specialty: 'Appliance Repair',
      rating: 4.6,
      location: 'Hyderabad, Telangana',
      status: 'Available',
      services: 67,
      joinDate: '2024-03-05',
      experience: '3 years'
    },
    {
      id: 5,
      name: 'Vikram Singh',
      email: 'vikram.singh@proservices.com',
      phone: '+91 98765 43215',
      specialty: 'HVAC & Plumbing',
      rating: 4.9,
      location: 'Jaipur, Rajasthan',
      status: 'Offline',
      services: 198,
      joinDate: '2023-09-12',
      experience: '12 years'
    }
  ];

  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tech.specialty.toLowerCase().includes(searchTerm.toLowerCase()) 
    const matchesFilter = filterStatus === 'all' || tech.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'busy':
        return 'bg-yellow-100 text-yellow-700';
      case 'offline':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Technicians Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all technicians in your network</p>
        </div>
        <button className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Technician
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search technicians by name, Categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
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
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Contact</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Specialty</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Location</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Rating</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Services</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Experience</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTechnicians.map((tech) => (
                <tr key={tech.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {tech.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{tech.name}</h4>
                        <p className="text-sm text-gray-500">ID: {tech.id.toString().padStart(3, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-700">
                        <Mail className="h-3 w-3 mr-2 text-gray-400" />
                        {tech.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Phone className="h-3 w-3 mr-2 text-gray-400" />
                        {tech.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-700">{tech.specialty}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                      {tech.location}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-gray-700 font-medium">{tech.rating}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-700 font-medium">{tech.services}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-700">{tech.experience}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tech.status)}`}>
                      {tech.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200">
                         <Eye />
                      </button>
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-200">
                        <SquarePen />
                      </button>
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200">
                        <Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTechnicians.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No technicians found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Total Technicians</p>
          <p className="text-2xl font-bold text-gray-900">{technicians.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Available</p>
          <p className="text-2xl font-bold text-green-600">
            {technicians.filter(t => t.status === 'Available').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Busy</p>
          <p className="text-2xl font-bold text-yellow-600">
            {technicians.filter(t => t.status === 'Busy').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Average Rating</p>
          <p className="text-2xl font-bold text-purple-600">
            {(technicians.reduce((acc, t) => acc + t.rating, 0) / technicians.length).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Technicians;