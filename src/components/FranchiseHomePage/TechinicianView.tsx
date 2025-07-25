import React from 'react';

interface Subscription {
  subscriptionId: string;
  subscriptionName: string;
  startDate: string;
  endDate: string;
  leads: null | any;
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

const TechnicianView: React.FC<{ technician: Technician }> = ({ technician }) => {
    console.log(technician)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-6 m-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Technician Details</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
        <p className="text-gray-600"><span className="font-medium">Username:</span> {technician?.username}</p>
        <p className="text-gray-600"><span className="font-medium">User ID:</span> {technician?.userId}</p>
        <p className="text-gray-600"><span className="font-medium">Phone Number:</span> {technician?.phoneNumber}</p>
        <p className="text-gray-600"><span className="font-medium">Role:</span> {technician?.role}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Location</h3>
        <p className="text-gray-600"><span className="font-medium">Building:</span> {technician?.buildingName}</p>
        <p className="text-gray-600"><span className="font-medium">Area:</span> {technician?.areaName}</p>
        <p className="text-gray-600"><span className="font-medium">City:</span> {technician?.city}</p>
        <p className="text-gray-600"><span className="font-medium">State:</span> {technician?.state}</p>
        <p className="text-gray-600"><span className="font-medium">Pincode:</span> {technician?.pincode}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700">Subscription Details</h3>
        <p className="text-gray-600"><span className="font-medium">Subscription Name:</span> {technician?.subscription?.subscriptionName}</p>
        <p className="text-gray-600"><span className="font-medium">Start Date:</span> {formatDate(technician?.subscription?.startDate)}</p>
        <p className="text-gray-600"><span className="font-medium">End Date:</span> {formatDate(technician?.subscription?.endDate)}</p>
        <p className="text-gray-600"><span className="font-medium">Leads:</span> {technician?.subscription?.leads ? technician?.subscription?.leads : 'None'}</p>
        <p className="text-gray-600"><span className="font-medium">Orders Count:</span> {technician?.subscription?.ordersCount}</p>
      </div>
    </div>
  );
};

export default TechnicianView;