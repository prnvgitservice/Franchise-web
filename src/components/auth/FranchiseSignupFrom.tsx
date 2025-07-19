import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPincodes } from '../../api/apiMethods';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface FormData {
  name: string;
  mobile: string;
  password: string;
  buildingName: string;
  areaName: string;
  city: string;
  state: string;
  pincode: string;
}

const initialFormState: FormData = {
  name: '',
  mobile: '',
  password: '',
  buildingName: '',
  areaName: '',
  city: '',
  state: '',
  pincode: '',
};

const FranchiseSignupForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [pincodeData, setPincodeData] = useState<any[]>([]);
  const [selectedPincode, setSelectedPincode] = useState<string>("");
  const [areaOptions, setAreaOptions] = useState<any[]>([]);
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
      } else {
        setAreaOptions([]);
      }
    } else {
      setAreaOptions([]);
    }
  }, [selectedPincode, pincodeData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "pincode") {
        setSelectedPincode(value);
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        if (!formData.pincode || formData.pincode.length !== 6) {
          setError('Pincode must be exactly 6 digits');
          setLoading(false);
          return;
        }

        const payload = {
          username: formData.name,
          phoneNumber: formData.mobile,
          password: formData.password,
          buildingName: formData.buildingName,
          areaName: formData.areaName,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        };

        const response = await franchiseRegister(payload);

        if (response?.success) {
          navigate('/login/franchise');
        }
      } catch (err: any) {
        setError(err?.data?.error?.[0] || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [formData, navigate]
  );

  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className='flex justify-center'>
        <div className="bg-blue-900 rounded px-1 py-1 w-fit flex ">
          <img
            src="https://prnvservices.com/uploads/logo/1695377568_logo-white.png"
            alt="Justdial Logo"
            className="h-8 w-auto "
          />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Sign Up as Franchise
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</div>
          )}

          {[
            { id: 'name', label: 'Name', type: 'text' },
            { id: 'mobile', label: 'Phone Number', type: 'tel', pattern: '[0-9]{10}' },
            { id: 'password', label: 'Password', type: 'password', minLength: 6, maxLength: 10 },
            { id: 'buildingName', label: 'House/Building Name', type: 'text' },
            { id: 'pincode', label: 'Pincode', type: 'text' },
            { id: 'areaName', label: 'Area/Street Name', type: 'text' },
            { id: 'city', label: 'City', type: 'text' },
            { id: 'state', label: 'State', type: 'text' },
          ].map(({ id, label, type, pattern }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label} <span className='text-red-600'>*</span>
              </label>
              {id === 'password' ? (
                <div className="relative">
                  <input
                    id={id}
                    name={id}
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Password (6-10 characters)'
                    required
                    value={formData[id]}
                    onChange={handleChange}
                    pattern={pattern}
                    minLength={id === 'password' ? 6 : undefined}
                    maxLength={id === 'password' ? 10 : undefined}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2 pr-10"
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
                  className="mt-1 w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select Pincode</option>
                  {pincodeData.map((p) => (
                    <option key={p._id} value={p.code}>{p.code}</option>
                  ))}
                </select>
              ) : id === 'city' ? (
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select City</option>
                  {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) ? (
                    <option value={pincodeData.find((p) => p.code === selectedPincode)?.city}>
                      {pincodeData.find((p) => p.code === selectedPincode)?.city}
                    </option>
                  ) : (
                    pincodeData.map((p) => (
                      <option key={p._id} value={p.city}>{p.city}</option>
                    ))
                  )}
                </select>
              ) : id === 'state' ? (
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select State</option>
                  {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) ? (
                    <option value={pincodeData.find((p) => p.code === selectedPincode)?.state}>
                      {pincodeData.find((p) => p.code === selectedPincode)?.state}
                    </option>
                  ) : (
                    pincodeData.map((p) => (
                      <option key={p._id} value={p.state}>{p.state}</option>
                    ))
                  )}
                </select>
              ) : id === 'areaName' ? (
                <select
                  id="areaName"
                  name="areaName"
                  value={formData.areaName}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select Area</option>
                  {areaOptions.map((a: any) => (
                    <option key={a._id} value={a.name}>{a.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  name={id}
                  type={type}
                  placeholder={label}
                  required
                  value={formData[id]}
                  onChange={handleChange}
                  pattern={pattern}
                  className="mt-1 w-full border border-gray-300 rounded-md p-2"
                />
              )}
            </div>
          ))}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Are you a user or technician?{' '}
          <a
            href="/signup/user"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign Up here
          </a>
          {' or '}
          <a
            href="/signup/technician"
            className="text-blue-600 hover:underline font-medium"
          >
            Technician
          </a>
        </p>
      </div>
      <p className="mt-4 text-sm text-center text-gray-600">
        Already signed up?
        <a
          href="/login/franchise"
          className="text-blue-600 hover:underline font-medium ms-1"
        >
          Sign In
        </a>
      </p>
    </main>
  );
};

export default FranchiseSignupForm;