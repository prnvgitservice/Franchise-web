import React from 'react';
import { useLocation } from 'react-router-dom';

interface Subscription {
  subscriptionId: string;
  subscriptionName: string;
  startDate: string;
  endDate: string;
  leads?: number; // Optional, in case the subscription is based on leads
  _id: string;
}

interface Technician {
  id: string;
  franchiseId: string;
  username: string;
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

const TechnicianView: React.FC = () => {
  const location = useLocation();
  const technician = location.state?.technician as Technician;

  if (!technician) {
    return (
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 m-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Technician Not Found</h2>
        <p className="text-gray-600">Please select a technician from the list to view details.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 m-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Technician Details</h2>
      
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3 pb-2 border-b">Personal Information</h3>
          <div className="space-y-3">
            <p><span className="font-medium text-gray-600">Technician Name:</span> {technician.username}</p>
            <p><span className="font-medium text-gray-600">Phone Number:</span> {technician.phoneNumber}</p>
            {/* <p><span className="font-medium text-gray-600">Role:</span> {technician.role}</p> */}
            <p><span className="font-medium text-gray-600">Category:</span> {technician.category}</p>
            <p><span className="font-medium text-gray-600">Address:</span> {`${technician.buildingName}, ${technician.areaName}, ${technician.city}, ${technician.pincode}`}</p>
          </div>
        </div>

        {/* <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3 pb-2 border-b">Location</h3>
          <div className="space-y-3">
            <p><span className="font-medium text-gray-600">Building:</span> {technician.buildingName}</p>
            <p><span className="font-medium text-gray-600">Area:</span> {technician.areaName}</p>
            <p><span className="font-medium text-gray-600">City:</span> {technician.city}</p>
            <p><span className="font-medium text-gray-600">State:</span> {technician.state}</p>
            <p><span className="font-medium text-gray-600">Pincode:</span> {technician.pincode}</p>
          </div>
        </div> */}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-3 pb-2 border-b">Subscription Information</h3>
        <div className="space-y-3">
          <p><span className="font-medium text-gray-600">Subscription Name:</span> {technician.subscription?.subscriptionName || 'N/A'}</p>
          {/* <p><span className="font-medium text-gray-600">Subscription ID:</span> {technician.subscription?.subscriptionId || 'N/A'}</p> */}
          <p><span className="font-medium text-gray-600">Start Date:</span> {technician.subscription?.startDate ? formatDate(technician.subscription.startDate) : 'N/A'}</p>
          <p><span className="font-medium text-gray-600">End Date:</span> {technician.subscription?.endDate ? formatDate(technician.subscription.endDate) : technician.subscription?.leads ? `${technician.subscription.leads} leads` : 'N/A'}
</p>
        </div>
      </div>
    </div>
  );
};

export default TechnicianView;