import React, { useState, useCallback, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { getAllPincodes, addTechnician } from '../../api/apiMethods'; // Assuming addTechnician API method

interface TechnicianData {
  username: string;
  franchiseId: string;
  category: string;
  phoneNumber: string;
  password: string;
  buildingName: string;
  areaName: string;
  city: string;
  state: string;
  pincode: string;
}

interface PincodeData {
  _id: string;
  code: string;
  city: string;
  state: string;
  areas: { _id: string; name: string }[];
}

const initialFormState: TechnicianData = {
  username: '',
  franchiseId: '',
  category: '',
  phoneNumber: '',
  password: '',
  buildingName: '',
  areaName: '',
  city: '',
  state: '',
  pincode: '',
};

const AddTechnician: React.FC = () => {
  const [formData, setFormData] = useState<TechnicianData>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pincodeData, setPincodeData] = useState<PincodeData[]>([]);
  const [selectedPincode, setSelectedPincode] = useState<string>('');
  const [areaOptions, setAreaOptions] = useState<{ _id: string; name: string }[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    getAllPincodes()
      .then((res: any) => {
        if (Array.isArray(res?.data)) {
          setPincodeData(res.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedPincode) {
      const found = pincodeData.find((p) => p.code === selectedPincode);
      if (found && found.areas) {
        setAreaOptions(found.areas);
        setFormData((prev) => ({
          ...prev,
          city: found.city,
          state: found.state,
        }));
      } else {
        setAreaOptions([]);
        setFormData((prev) => ({
          ...prev,
          city: '',
          state: '',
          areaName: '',
        }));
      }
    } else {
      setAreaOptions([]);
      setFormData((prev) => ({
        ...prev,
        city: '',
        state: '',
        areaName: '',
      }));
    }
  }, [selectedPincode, pincodeData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === 'pincode') {
        setSelectedPincode(value);
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        if (!formData.pincode || formData.pincode.length !== 6) {
          setError('Pincode must be exactly 6 digits');
          setLoading(false);
          return;
        }

        if (!/^\d{10}$/.test(formData.phoneNumber)) {
          setError('Phone number must be exactly 10 digits');
          setLoading(false);
          return;
        }

        const payload = {
          username: formData.username,
          franchiseId: formData.franchiseId,
          category: formData.category,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          buildingName: formData.buildingName,
          areaName: formData.areaName,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        };

        const response = await addTechnician(payload);

        if (response?.success) {
          setFormData(initialFormState); // Reset form on success
          alert('Technician added successfully!');
        } else {
          throw new Error('Failed to add technician');
        }
      } catch (err: any) {
        setError(err?.data?.error?.[0] || err?.message || 'Failed to add technician. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [formData]
  );

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Technician</h2>
      {error && (
        <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded mb-4">{error}</div>
      )}
      <div className="space-y-4">
        {[
          { id: 'username', label: 'Username', type: 'text' },
          { id: 'franchiseId', label: 'Franchise ID', type: 'text' },
          { id: 'category', label: 'Category', type: 'text' },
          { id: 'phoneNumber', label: 'Phone Number', type: 'tel', pattern: '[0-9]{10}' },
          { id: 'password', label: 'Password', type: 'password', minLength: 6, maxLength: 10 },
          { id: 'buildingName', label: 'Building Name', type: 'text' },
          { id: 'pincode', label: 'Pincode', type: 'select' },
          { id: 'areaName', label: 'Area', type: 'select' },
          { id: 'city', label: 'City', type: 'select' },
          { id: 'state', label: 'State', type: 'select' },
        ].map(({ id, label, type, pattern, minLength, maxLength }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
              {label} <span className="text-red-600">*</span>
            </label>
            {id === 'password' ? (
              <div className="relative">
                <input
                  id={id}
                  name={id}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (6-10 characters)"
                  required
                  value={formData[id as keyof TechnicianData]}
                  onChange={handleChange}
                  minLength={minLength}
                  maxLength={maxLength}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            ) : id === 'pincode' ? (
              <select
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Pincode</option>
                {pincodeData.map((p) => (
                  <option key={p._id} value={p.code}>
                    {p.code}
                  </option>
                ))}
              </select>
            ) : id === 'areaName' ? (
              <select
                id="areaName"
                name="areaName"
                value={formData.areaName}
                onChange={handleChange}
                required
                disabled={!selectedPincode}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              >
                <option value="">Select Area</option>
                {areaOptions.map((a) => (
                  <option key={a._id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            ) : id === 'city' ? (
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={!selectedPincode}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              >
                <option value="">Select City</option>
                {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
                  <option value={pincodeData.find((p) => p.code === selectedPincode)?.city}>
                    {pincodeData.find((p) => p.code === selectedPincode)?.city}
                  </option>
                )}
              </select>
            ) : id === 'state' ? (
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                disabled={!selectedPincode}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              >
                <option value="">Select State</option>
                {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
                  <option value={pincodeData.find((p) => p.code === selectedPincode)?.state}>
                    {pincodeData.find((p) => p.code === selectedPincode)?.state}
                  </option>
                )}
              </select>
            ) : (
              <input
                id={id}
                name={id}
                type={type}
                placeholder={label}
                required
                value={formData[id as keyof TechnicianData]}
                onChange={handleChange}
                pattern={pattern}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding Technician...' : 'Add Technician'}
        </button>
      </div>
    </div>
  );
};

export default AddTechnician;