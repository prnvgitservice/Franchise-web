import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

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

const EditTechnician: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [technician, setTechnician] = useState<Technician | undefined>(location.state?.technician);
  const [formData, setFormData] = useState<Partial<Technician>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch technician data if not provided in navigation state
  useEffect(() => {
    if (!technician && id) {
      const fetchTechnician = async () => {
        try {
          setLoading(true);
          setError('');
          const franchiseId = localStorage.getItem('userId') || '';
          const response = await editAllTechnicianByFranchise();
          if (Array.isArray(response?.data?.result)) {
            const foundTechnician = response.data.result.find((tech: Technician) => tech.id === id);
            if (foundTechnician) {
              setTechnician(foundTechnician);
              setFormData(foundTechnician);
            } else {
              setError('Technician not found');
            }
          } else {
            setError('No technicians found');
          }
        } catch (error) {
          setError((error as Error)?.message || 'Failed to fetch technician');
        } finally {
          setLoading(false);
        }
      };
      fetchTechnician();
    } else if (technician) {
      setFormData(technician);
    }
  }, [technician, id]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Mock API call to update technician (replace with actual API call)
      // For example: await updateTechnician(id, formData);
      console.log('Updating technician:', { id, ...formData });

      // Simulate API success
      setSuccess('Technician updated successfully!');
      setTimeout(() => navigate('/technicians'), 2000); // Redirect after 2 seconds
    } catch (error) {
      setError((error as Error)?.message || 'Failed to update technician');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !technician) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-xl">
          {error || 'No technician data available.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Technician</h2>
        
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username || ''}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Technician username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <input
                  type="text"
                  value={technician.userId}
                  disabled
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  aria-label="Technician user ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Technician phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input
                  type="text"
                  value={technician.role}
                  disabled
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  aria-label="Technician role"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Technician category"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Building</label>
                <input
                  type="text"
                  name="buildingName"
                  value={formData.buildingName || ''}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Building name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Area</label>
                <input
                  type="text"
                  name="areaName"
                  value={formData.areaName || ''}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Area name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="City"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="State"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode || ''}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Pincode"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Subscription Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subscription Name</label>
                <input
                  type="text"
                  value={technician.subscription.subscriptionName}
                  disabled
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  aria-label="Subscription name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="text"
                  value={formatDate(technician.subscription.startDate)}
                  disabled
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  aria-label="Subscription start date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="text"
                  value={formatDate(technician.subscription.endDate)}
                  disabled
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  aria-label="Subscription end date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Leads</label>
                <input
                  type="text"
                  value={technician.subscription.leads ? technician.subscription.leads : 'None'}
                  disabled
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  aria-label="Subscription leads"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Orders Count</label>
                <input
                  type="text"
                  value={technician.subscription.ordersCount}
                  disabled
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  aria-label="Subscription orders count"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/technicians')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Save changes"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTechnician;