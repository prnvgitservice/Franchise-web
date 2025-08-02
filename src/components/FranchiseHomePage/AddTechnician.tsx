import React, { useState, useCallback, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { getAllCategories, getAllPincodes, getPlans } from '../../api/apiMethods';
import { useNavigate } from 'react-router-dom';

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
  subscriptionId: string;
}

interface PincodeData {
  _id: string;
  code: string;
  city: string;
  state: string;
  areas: { _id: string; name: string }[];
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  finalPrice: number;
  gst: number;
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
  subscriptionId: '',
};

const AddTechnician: React.FC = () => {
  const [formData, setFormData] = useState<TechnicianData>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiCategories, setApiCategories] = useState<{ _id: string; category_name: string; status: number }[]>([]);
  const [pincodeData, setPincodeData] = useState<PincodeData[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPincode, setSelectedPincode] = useState<string>('');
  const [areaOptions, setAreaOptions] = useState<{ _id: string; name: string }[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
    getAllCategories(null)
      .then((res: any) => {
        if (Array.isArray(res?.data)) {
          setApiCategories(res.data);
        } else {
          setApiCategories([]);
          setError('Failed to load categories');
        }
      })
      .catch(() => {
        setApiCategories([]);
        setError('Failed to load categories');
      });
  }, []);

  useEffect(() => {
    getPlans()
      .then((res: any) => {
        if (Array.isArray(res?.data)) {
          setSubscriptionPlans(res.data);
        } else {
          setSubscriptionPlans([]);
          setError('Failed to load subscription plans');
        }
      })
      .catch(() => {
        setSubscriptionPlans([]);
        setError('Failed to load subscription plans');
      });
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
        const franchiseId = localStorage.getItem('userId');
        if (!franchiseId) {
          setError('Franchise ID not found. Please log in again.');
          setLoading(false);
          return;
        }

        if (!formData.username) {
          setError('Technician name is required');
          setLoading(false);
          return;
        }

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

        if (!formData.subscriptionId) {
          setError('Please select a subscription plan');
          setLoading(false);
          return;
        }

        const selectedPlan = subscriptionPlans.find((plan) => plan._id === formData.subscriptionId);
        if (!selectedPlan) {
          setError('Selected subscription plan is invalid');
          setLoading(false);
          return;
        }

        console.log('Form Data:', formData);

        navigate('/buyPlan', {
          state: {
            plan: selectedPlan,
            technicianData: { ...formData, franchiseId },
          },
        });
      } catch (err: any) {
        setError(err?.data?.error?.[0] || err?.message || 'Failed to proceed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [formData, subscriptionPlans, navigate]
  );

  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-gradient-to-br rounded-xl shadow-2xl">
      <h2 className="text-3xl font-extrabold text-indigo-900 mb-8 text-center">Add New Technician</h2>
      {error && (
        <div className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg mb-6 animate-pulse">{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { id: 'username', label: 'Technician Name', required: true, type: 'text', placeholder: 'Enter technician name' },
            { id: 'category', label: 'Category', required: true, type: 'select' },
            { id: 'phoneNumber', label: 'Phone Number', required: true, type: 'tel', pattern: '[0-9]{10}', placeholder: 'Enter 10-digit phone number' },
            { id: 'password', label: 'Password', required: true, type: 'password', minLength: 6, maxLength: 10, placeholder: '6-10 characters' },
            { id: 'buildingName', label: 'Building Name', required: true, type: 'text', placeholder: 'Enter building name' },
            { id: 'pincode', label: 'Pincode', required: true, type: 'select' },
            { id: 'areaName', label: 'Area', required: true, type: 'select' },
            { id: 'city', label: 'City', required: true, type: 'select' },
            { id: 'state', label: 'State', required: true, type: 'select' },
            { id: 'subscriptionId', label: 'Subscription Plan', required: true, type: 'select' },
          ].map(({ id, label, type, pattern, minLength, maxLength, placeholder }) => (
            <div key={id} className="relative group">
              <label htmlFor={id} className="block text-sm font-medium text-indigo-700 mb-1">
                {label} <span className="text-red-500">*</span>
              </label>
              {id === 'username' ? (
                <input
                  id={id}
                  name={id}
                  type={type}
                  placeholder={placeholder}
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
                />
              ) : id === 'category' ? (
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
                >
                  <option value="" disabled>Select a category</option>
                  {apiCategories
                    .filter((category) => category?.status === 1)
                    .map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.category_name}
                      </option>
                    ))}
                </select>
              ) : id === 'password' ? (
                <div className="relative">
                  <input
                    id={id}
                    name={id}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={placeholder}
                    required
                    value={formData[id as keyof TechnicianData]}
                    onChange={handleChange}
                    minLength={minLength}
                    maxLength={maxLength}
                    className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white pr-10"
                  />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-indigo-500 hover:text-amber-500 transition"
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
                  className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
                >
                  <option value="" disabled>Select Pincode</option>
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
                  className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
                >
                  <option value="" disabled>Select Area</option>
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
                  className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
                >
                  <option value="" disabled>Select City</option>
                  {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
                    <option value={pincodeData.find((p) => p.code === selectedPincode)?.city}>
                      {pincodeData.find((p) => p.code === selectedPincode)?.city}
                    </option>
                  )}
me
                </select>
              ) : id === 'state' ? (
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  disabled={!selectedPincode}
                  className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
                >
                  <option value="" disabled>Select State</option>
                  {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
                    <option value={pincodeData.find((p) => p.code === selectedPincode)?.state}>
                      {pincodeData.find((p) => p.code === selectedPincode)?.state}
                    </option>
                  )}
                </select>
              ) : id === 'subscriptionId' ? (
                <select
                  id="subscriptionId"
                  name="subscriptionId"
                  value={formData.subscriptionId}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
                >
                  <option value="" disabled>Select Subscription Plan</option>
                  {subscriptionPlans
                    .filter((plan) => plan.name === 'Economy Plan')
                    .map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name} - ₹{plan.finalPrice} ({plan.price} + {plan.gst} GST)
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  id={id}
                  name={id}
                  type={type}
                  placeholder={placeholder}
                  required
                  value={formData[id as keyof TechnicianData]}
                  onChange={handleChange}
                  pattern={pattern}
                  className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
                />
              )}
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 transform hover:scale-105"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
              </svg>
              Processing...
            </div>
          ) : (
            'Proceed to Payment'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddTechnician;
// import React, { useState, useCallback, useEffect } from 'react';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import { getAllCategories, getAllPincodes, getPlans } from '../../api/apiMethods';
// import { useNavigate } from 'react-router-dom';

// interface TechnicianData {
//   username: string;
//   franchiseId: string;
//   category: string;
//   phoneNumber: string;
//   password: string;
//   buildingName: string;
//   areaName: string;
//   city: string;
//   state: string;
//   pincode: string;
//   subscriptionId: string;
// }

// interface PincodeData {
//   _id: string;
//   code: string;
//   city: string;
//   state: string;
//   areas: { _id: string; name: string }[];
// }

// interface SubscriptionPlan {
//   _id: string;
//   name: string;
//   price: number;
//   finalPrice: number;
//   gst: number;
// }

// const initialFormState: TechnicianData = {
//   username: '',
//   franchiseId: '',
//   category: '',
//   phoneNumber: '',
//   password: '',
//   buildingName: '',
//   areaName: '',
//   city: '',
//   state: '',
//   pincode: '',
//   subscriptionId: '',
// };

// const AddTechnician: React.FC = () => {
//   const [formData, setFormData] = useState<TechnicianData>(initialFormState);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [apiCategories, setApiCategories] = useState<{ _id: string; category_name: string; status: number }[]>([]);
//   const [pincodeData, setPincodeData] = useState<PincodeData[]>([]);
//   const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
//   const [selectedPincode, setSelectedPincode] = useState<string>('');
//   const [areaOptions, setAreaOptions] = useState<{ _id: string; name: string }[]>([]);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     getAllPincodes()
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//           setPincodeData(res.data);
//         }
//       })
//       .catch(() => {});
//   }, []);

//   useEffect(() => {
//     getAllCategories(null)
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//           setApiCategories(res.data);
//         } else {
//           setApiCategories([]);
//           setError('Failed to load categories');
//         }
//       })
//       .catch(() => {
//         setApiCategories([]);
//         setError('Failed to load categories');
//       });
//   }, []);

//   useEffect(() => {
//     getPlans()
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//           setSubscriptionPlans(res.data);
//         } else {
//           setSubscriptionPlans([]);
//           setError('Failed to load subscription plans');
//         }
//       })
//       .catch(() => {
//         setSubscriptionPlans([]);
//         setError('Failed to load subscription plans');
//       });
//   }, []);

//   useEffect(() => {
//     if (selectedPincode) {
//       const found = pincodeData.find((p) => p.code === selectedPincode);
//       if (found && found.areas) {
//         setAreaOptions(found.areas);
//         setFormData((prev) => ({
//           ...prev,
//           city: found.city,
//           state: found.state,
//         }));
//       } else {
//         setAreaOptions([]);
//         setFormData((prev) => ({
//           ...prev,
//           city: '',
//           state: '',
//           areaName: '',
//         }));
//       }
//     } else {
//       setAreaOptions([]);
//       setFormData((prev) => ({
//         ...prev,
//         city: '',
//         state: '',
//         areaName: '',
//       }));
//     }
//   }, [selectedPincode, pincodeData]);

//   const handleChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//       const { name, value } = e.target;
//       setFormData((prev) => ({ ...prev, [name]: value }));
//       if (name === 'pincode') {
//         setSelectedPincode(value);
//       }
//     },
//     []
//   );

//   const handleSubmit = useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault();
//       setError(null);
//       setLoading(true);

//       try {
//         const franchiseId = localStorage.getItem('userId');
//         if (!franchiseId) {
//           setError('Franchise ID not found. Please log in again.');
//           setLoading(false);
//           return;
//         }

//         if (!formData.pincode || formData.pincode.length !== 6) {
//           setError('Pincode must be exactly 6 digits');
//           setLoading(false);
//           return;
//         }

//         if (!/^\d{10}$/.test(formData.phoneNumber)) {
//           setError('Phone number must be exactly 10 digits');
//           setLoading(false);
//           return;
//         }

//         if (!formData.subscriptionId) {
//           setError('Please select a subscription plan');
//           setLoading(false);
//           return;
//         }

//         const selectedPlan = subscriptionPlans.find((plan) => plan._id === formData.subscriptionId);
//         if (!selectedPlan) {
//           setError('Selected subscription plan is invalid');
//           setLoading(false);
//           return;
//         }

//         console.log('Form Data:', formData);

//         // Navigate to /buyPlan with plan and technician data
//         navigate('/buyPlan', {
//           state: {
//             plan: selectedPlan,
//             technicianData: { ...formData, franchiseId },
//           },
//         });
//       } catch (err: any) {
//         setError(err?.data?.error?.[0] || err?.message || 'Failed to proceed. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     },
//     [formData, subscriptionPlans, navigate]
//   );

//   return (
//     <div className="max-w-3xl mx-auto mt-12 p-8 bg-gradient-to-br rounded-xl shadow-2xl">
//       <h2 className="text-3xl font-extrabold text-indigo-900 mb-8 text-center">Add New Technician</h2>
//       {error && (
//         <div className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg mb-6 animate-pulse">{error}</div>
//       )}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {[
//           { id: 'technicianName', label: 'Technician Name', required: true, type: 'text', placeholder: 'Enter technician name' },
//           { id: 'category', label: 'Category', required: true, type: 'select' },
//           { id: 'phoneNumber', label: 'Phone Number', required: true, type: 'tel', pattern: '[0-9]{10}', placeholder: 'Enter 10-digit phone number' },
//           { id: 'password', label: 'Password', required: true, type: 'password', minLength: 6, maxLength: 10, placeholder: '6-10 characters' },
//           { id: 'buildingName', label: 'Building Name', required: true, type: 'text', placeholder: 'Enter building name' },
//           { id: 'pincode', label: 'Pincode', required: true, type: 'select' },
//           { id: 'areaName', label: 'Area', required: true, type: 'select' },
//           { id: 'city', label: 'City', required: true, type: 'select' },
//           { id: 'state', label: 'State', required: true, type: 'select' },
//           { id: 'subscriptionId', label: 'Subscription Plan', required: true, type: 'select' },
//         ].map(({ id, label, type, pattern, minLength, maxLength, placeholder }) => (
//           <div key={id} className="relative group">
//             <label htmlFor={id} className="block text-sm font-medium text-indigo-700 mb-1" >
//               {label} <span className="text-red-500">*</span>
//             </label>
//             {id === 'username' ? (
//               <input
//                 id={id}
//                 name={id}
//                 type={type}
//                 placeholder={placeholder}
//                 required
//                 value={formData[id as keyof TechnicianData]}
//                 onChange={handleChange}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               />
//             ) : id === 'category' ? (
//               <select
//                 id="category"
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select a category</option>
//                 {apiCategories
//                   .filter((category) => category?.status === 1)
//                   .map((item) => (
//                     <option key={item._id} value={item._id}>
//                       {item.category_name}
//                     </option>
//                   ))}
//               </select>
//             ) : id === 'password' ? (
//               <div className="relative">
//                 <input
//                   id={id}
//                   name={id}
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder={placeholder}
//                   required
//                   value={formData[id as keyof TechnicianData]}
//                   onChange={handleChange}
//                   minLength={minLength}
//                   maxLength={maxLength}
//                   className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white pr-10"
//                 />
//                 <span
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-indigo-500 hover:text-amber-500 transition"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                 >
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </span>
//               </div>
//             ) : id === 'pincode' ? (
//               <select
//                 id="pincode"
//                 name="pincode"
//                 value={formData.pincode}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select Pincode</option>
//                 {pincodeData.map((p) => (
//                   <option key={p._id} value={p.code}>
//                     {p.code}
//                   </option>
//                 ))}
//               </select>
//             ) : id === 'areaName' ? (
//               <select
//                 id="areaName"
//                 name="areaName"
//                 value={formData.areaName}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select Area</option>
//                 {areaOptions.map((a) => (
//                   <option key={a._id} value={a.name}>
//                     {a.name}
//                   </option>
//                 ))}
//               </select>
//             ) : id === 'city' ? (
//               <select
//                 id="city"
//                 name="city"
//                 value={formData.city}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select City</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.city}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.city}
//                   </option>
//                 )}
//               </select>
//             ) : id === 'state' ? (
//               <select
//                 id="state"
//                 name="state"
//                 value={formData.state}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select State</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.state}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.state}
//                   </option>
//                 )}
//               </select>
//             ) : id === 'subscriptionId' ? (
//               <select
//                 id="subscriptionId"
//                 name="subscriptionId"
//                 value={formData.subscriptionId}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select Subscription Plan</option>
//                 {subscriptionPlans
//                   .filter((plan) => plan.name !== 'Free Plan')
//                   .map((plan) => (
//                     <option key={plan._id} value={plan._id}>
//                       {plan.name} - ₹{plan.finalPrice} ({plan.price} + {plan.gst} GST)
//                     </option>
//                   ))}
//               </select>
//             ) : (
//               <input
//                 id={id}
//                 name={id}
//                 type={type}
//                 placeholder={placeholder}
//                 required
//                 value={formData[id as keyof TechnicianData]}
//                 onChange={handleChange}
//                 pattern={pattern}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               />
//             )}
//           </div>
//         ))}
//       </div>
//       <button
//         type="submit"
//         onClick={handleSubmit}
//         disabled={loading}
//         className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 transform hover:scale-105"
//       >
//         {loading ? (
//           <div className="flex items-center justify-center">
//             <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="e2c7a15-0674-40e6-a58b-9147c820d290" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
//             </svg>
//             Processing...
//           </div>
//         ) : (
//           'Proceed to Payment'
//         )}
//       </button>
//     </div>
//   );
// };

// export default AddTechnician;
// import React, { useState, useCallback, useEffect } from 'react';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import { getAllCategories, getAllPincodes, registerTechByFranchise, getPlans } from '../../api/apiMethods';
// import { useNavigate } from 'react-router-dom';

// // Interfaces for type safety
// interface TechnicianData {
//   username: string;
//   franchiseId: string;
//   category: string;
//   phoneNumber: string;
//   password: string;
//   buildingName: string;
//   areaName: string;
//   city: string;
//   state: string;
//   pincode: string;
//   subscriptionId: string;
// }

// interface ApiCategory {
//   _id: string;
//   category_name: string;
//   status: number;
// }

// interface PincodeData {
//   _id: string;
//   code: string;
//   city: string;
//   state: string;
//   areas: { _id: string; name: string }[];
// }

// interface SubscriptionPlan {
//   _id: string;
//   name: string;
//   price: number;
//   finalPrice: number;
//   gst: number;
// }

// const initialFormState: TechnicianData = {
//   username: '',
//   franchiseId: '',
//   category: '',
//   phoneNumber: '',
//   password: '',
//   buildingName: '',
//   areaName: '',
//   city: '',
//   state: '',
//   pincode: '',
//   subscriptionId: '',
// };

// const AddTechnician: React.FC = () => {
//   const [formData, setFormData] = useState<TechnicianData>(initialFormState);
//   const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TechnicianData, string>>>({});
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
//   const [pincodeData, setPincodeData] = useState<PincodeData[]>([]);
//   const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
//   const [selectedPincode, setSelectedPincode] = useState<string>('');
//   const [areaOptions, setAreaOptions] = useState<{ _id: string; name: string }[]>([]);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   // Consolidated API calls
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [categoriesRes, pincodesRes, plansRes] = await Promise.all([
//           getAllCategories(null),
//           getAllPincodes(),
//           getPlans(),
//         ]);
//         setApiCategories(Array.isArray(categoriesRes?.data) ? categoriesRes.data : []);
//         setPincodeData(Array.isArray(pincodesRes?.data) ? pincodesRes.data : []);
//         setSubscriptionPlans(Array.isArray(plansRes?.data) ? plansRes.data : []);
//       } catch (err) {
//         console.error('Failed to load data:', err);
//         setError('Failed to load data');
//       }
//     };
//     fetchData();
//   }, []);

//   // Update city, state, and areas based on selected pincode
//   useEffect(() => {
//     if (selectedPincode) {
//       const found = pincodeData.find((p) => p.code === selectedPincode);
//       if (found && found.areas) {
//         setAreaOptions(found.areas);
//         setFormData((prev) => ({
//           ...prev,
//           city: found.city,
//           state: found.state,
//         }));
//       } else {
//         setAreaOptions([]);
//         setFormData((prev) => ({
//           ...prev,
//           city: '',
//           state: '',
//           areaName: '',
//         }));
//       }
//     } else {
//       setAreaOptions([]);
//       setFormData((prev) => ({
//         ...prev,
//         city: '',
//         state: '',
//         areaName: '',
//       }));
//     }
//   }, [selectedPincode, pincodeData]);

//   // Real-time field validation
//   const validateField = (name: keyof TechnicianData, value: string) => {
//     if (name === 'username' && !/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
//       return 'Username must be 3-20 characters and contain only letters, numbers, or underscores';
//     }
//     if (name === 'phoneNumber' && !/^\d{10}$/.test(value)) {
//       return 'Phone number must be exactly 10 digits';
//     }
//     if (name === 'pincode' && value.length !== 6) {
//       return 'Pincode must be exactly 6 digits';
//     }
//     return '';
//   };

//   const handleChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//       const { name, value } = e.target;
//       setFormData((prev) => ({ ...prev, [name]: value }));
//       setFieldErrors((prev) => ({ ...prev, [name]: validateField(name as keyof TechnicianData, value) }));
//       if (name === 'pincode') {
//         setSelectedPincode(value);
//       }
//     },
//     []
//   );

//   const handleSubmit = useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault();
//       setError(null);
//       setLoading(true);

//       try {
//         const franchiseId = localStorage.getItem('userId');
//         if (!franchiseId) {
//           setError('Franchise ID not found. Please log in again.');
//           setLoading(false);
//           return;
//         }

//         // Validate all fields
//         const errors = Object.keys(formData).reduce((acc, key) => {
//           const error = validateField(key as keyof TechnicianData, formData[key as keyof TechnicianData]);
//           if (error) acc[key as keyof TechnicianData] = error;
//           return acc;
//         }, {} as Partial<Record<keyof TechnicianData, string>>);

//         if (!formData.subscriptionId) {
//           errors.subscriptionId = 'Please select a subscription plan';
//         }

//         if (Object.keys(errors).length > 0) {
//           setFieldErrors(errors);
//           setError('Please fix the errors in the form');
//           setLoading(false);
//           return;
//         }

//         const payload = {
//           username: formData.username,
//           franchiseId,
//           category: formData.category,
//           phoneNumber: formData.phoneNumber,
//           password: formData.password,
//           buildingName: formData.buildingName,
//           areaName: formData.areaName,
//           city: formData.city,
//           state: formData.state,
//           pincode: formData.pincode,
//           subscriptionId: formData.subscriptionId,
//         };

//         const response = await registerTechByFranchise(payload);

//         if (response?.success) {
//           setFormData(initialFormState);
//           setFieldErrors({});
//           alert('Technician added successfully!');
//           navigate('/technicians'); // Redirect to a technician list page
//         } else {
//           throw new Error('Failed to add technician');
//         }
//       } catch (err: any) {
//         setError(err?.data?.error?.[0] || err?.message || 'Failed to add technician. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     },
//     [formData, navigate]
//   );

//   return (
//     <div className="max-w-3xl mx-auto mt-12 p-8 bg-gradient-to-br from-teal-50 to-indigo-50 rounded-xl shadow-2xl">
//       <h2 className="text-3xl font-extrabold text-indigo-900 mb-8 text-center">Add New Technician</h2>
//       {error && (
//         <div className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg mb-6 animate-pulse">{error}</div>
//       )}
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {[
//           { id: 'username', label: 'Username', type: 'text', placeholder: 'Enter username' },
//           { id: 'category', label: 'Category', type: 'select' },
//           { id: 'phoneNumber', label: 'Phone Number', type: 'tel', placeholder: 'Enter 10-digit phone number' },
//           { id: 'password', label: 'Password', type: 'password', placeholder: '6-10 characters' },
//           { id: 'buildingName', label: 'Building Name', type: 'text', placeholder: 'Enter building name' },
//           { id: 'pincode', label: 'Pincode', type: 'select' },
//           { id: 'areaName', label: 'Area', type: 'select' },
//           { id: 'city', label: 'City', type: 'select' },
//           { id: 'state', label: 'State', type: 'select' },
//           { id: 'subscriptionId', label: 'Subscription Plan', type: 'select' },
//         ].map(({ id, label, type, placeholder }) => (
//           <div key={id} className="relative group">
//             <label htmlFor={id} className="block text-sm font-medium text-indigo-700 mb-1">
//               {label} <span className="text-amber-500">*</span>
//             </label>
//             {id === 'category' ? (
//               <select
//                 id="category"
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 required
//                 aria-label={label}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select a category</option>
//                 {apiCategories.length === 0 ? (
//                   <option disabled>No categories available</option>
//                 ) : (
//                   apiCategories
//                     .filter((category) => category?.status === 1)
//                     .map((item) => (
//                       <option key={item._id} value={item._id}>
//                         {item.category_name}
//                       </option>
//                     ))
//                 )}
//               </select>
//             ) : id === 'password' ? (
//               <div className="relative">
//                 <input
//                   id={id}
//                   name={id}
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder={placeholder}
//                   required
//                   value={formData[id as keyof TechnicianData]}
//                   onChange={handleChange}
//                   minLength={6}
//                   maxLength={10}
//                   aria-label={label}
//                   className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white pr-10"
//                 />
//                 <span
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-indigo-500 hover:text-amber-500 transition"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                   aria-label={showPassword ? 'Hide password' : 'Show password'}
//                 >
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </span>
//               </div>
//             ) : id === 'pincode' ? (
//               <select
//                 id="pincode"
//                 name="pincode"
//                 value={formData.pincode}
//                 onChange={handleChange}
//                 required
//                 aria-label={label}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select Pincode</option>
//                 {pincodeData.length === 0 ? (
//                   <option disabled>No pincodes available</option>
//                 ) : (
//                   pincodeData.map((p) => (
//                     <option key={p._id} value={p.code}>
//                       {p.code}
//                     </option>
//                   ))
//                 )}
//               </select>
//             ) : id === 'areaName' ? (
//               <select
//                 id="areaName"
//                 name="areaName"
//                 value={formData.areaName}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 aria-label={label}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select Area</option>
//                 {areaOptions.length === 0 ? (
//                   <option disabled>No areas available</option>
//                 ) : (
//                   areaOptions.map((a) => (
//                     <option key={a._id} value={a.name}>
//                       {a.name}
//                     </option>
//                   ))
//                 )}
//               </select>
//             ) : id === 'city' ? (
//               <select
//                 id="city"
//                 name="city"
//                 value={formData.city}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 aria-label={label}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select City</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.city}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.city}
//                   </option>
//                 )}
//               </select>
//             ) : id === 'state' ? (
//               <select
//                 id="state"
//                 name="state"
//                 value={formData.state}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 aria-label={label}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select State</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.state}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.state}
//                   </option>
//                 )}
//               </select>
//             ) : id === 'subscriptionId' ? (
//               <select
//                 id="subscriptionId"
//                 name="subscriptionId"
//                 value={formData.subscriptionId}
//                 onChange={handleChange}
//                 required
//                 aria-label={label}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select Subscription Plan</option>
//                 {subscriptionPlans.length === 0 ? (
//                   <option disabled>No plans available</option>
//                 ) : (
//                   subscriptionPlans
//                     .filter((plan) => plan.name !== 'Free Plan')
//                     .map((plan) => (
//                       <option key={plan._id} value={plan._id}>
//                         {plan.name} - ₹{plan.finalPrice} ({plan.price} + {plan.gst})
//                       </option>
//                     ))
//                 )}
//               </select>
//             ) : (
//               <input
//                 id={id}
//                 name={id}
//                 type={type}
//                 placeholder={placeholder}
//                 required
//                 value={formData[id as keyof TechnicianData]}
//                 onChange={handleChange}
//                 aria-label={label}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               />
//             )}
//             {fieldErrors[id as keyof TechnicianData] && (
//               <p className="text-red-600 text-sm mt-1">{fieldErrors[id as keyof TechnicianData]}</p>
//             )}
//           </div>
//         ))}
//         <button
//           type="submit"
//           disabled={loading}
//           className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 transform hover:scale-105"
//         >
//           {loading ? (
//             <div className="flex items-center justify-center">
//               <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
//               </svg>
//               Adding Technician...
//             </div>
//           ) : (
//             'Add Technician'
//           )}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddTechnician;
// import React, { useState, useCallback, useEffect } from 'react';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import { getAllCategories, getAllPincodes, registerTechByFranchise, getPlans } from '../../api/apiMethods';
// import { useNavigate } from 'react-router-dom';

// interface TechnicianData {
//   username: string;
//   franchiseId: string;
//   category: string;
//   phoneNumber: string;
//   password: string;
//   buildingName: string;
//   areaName: string;
//   city: string;
//   state: string;
//   pincode: string;
//   subscriptionId: string;
// }

// interface PincodeData {
//   _id: string;
//   code: string;
//   city: string;
//   state: string;
//   areas: { _id: string; name: string }[];
// }

// interface SubscriptionPlan {
//   _id: string;
//   name: string;
//   price: number;
//   finalPrice: number;
//   gst: number
// }

// const initialFormState: TechnicianData = {
//   username: '',
//   franchiseId: '',
//   category: '',
//   phoneNumber: '',
//   password: '',
//   buildingName: '',
//   areaName: '',
//   city: '',
//   state: '',
//   pincode: '',
//   subscriptionId: '',
// };

// const AddTechnician: React.FC = () => {
//   const [formData, setFormData] = useState<TechnicianData>(initialFormState);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [apiCategories, setApiCategories] = useState<{ _id: string; category_name: string; status: number }[]>([]);
//   const [pincodeData, setPincodeData] = useState<PincodeData[]>([]);
//   const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
//   const [selectedPincode, setSelectedPincode] = useState<string>('');
//   const [areaOptions, setAreaOptions] = useState<{ _id: string; name: string }[]>([]);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate()

//   useEffect(() => {
//     getAllPincodes()
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//           setPincodeData(res.data);
//         }
//       })
//       .catch(() => {});
//   }, []);

//   useEffect(() => {
//     getAllCategories(null)
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//           setApiCategories(res.data);
//         } else {
//           setApiCategories([]);
//           setError('Failed to load categories');
//         }
//       })
//       .catch(() => {
//         setApiCategories([]);
//         setError('Failed to load categories');
//       });
//   }, []);

//   useEffect(() => {
//     getPlans()
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//             console.log(res)
//           setSubscriptionPlans(res.data);
//         } else {
//           setSubscriptionPlans([]);
//           setError('Failed to load subscription plans');
//         }
//       })
//       .catch(() => {
//         setSubscriptionPlans([]);
//         setError('Failed to load subscription plans');
//       });
//   }, []);

//   useEffect(() => {
//     if (selectedPincode) {
//       const found = pincodeData.find((p) => p.code === selectedPincode);
//       if (found && found.areas) {
//         setAreaOptions(found.areas);
//         setFormData((prev) => ({
//           ...prev,
//           city: found.city,
//           state: found.state,
//         }));
//       } else {
//         setAreaOptions([]);
//         setFormData((prev) => ({
//           ...prev,
//           city: '',
//           state: '',
//           areaName: '',
//         }));
//       }
//     } else {
//       setAreaOptions([]);
//       setFormData((prev) => ({
//         ...prev,
//         city: '',
//         state: '',
//         areaName: '',
//       }));
//     }
//   }, [selectedPincode, pincodeData]);

//   const handleChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//       const { name, value } = e.target;
//       setFormData((prev) => ({ ...prev, [name]: value }));
//       if (name === 'pincode') {
//         setSelectedPincode(value);
//       }
//     },
//     []
//   );

//   const handleSubmit = useCallback(
    
//     async (e: React.FormEvent) => {
//         navigate('/buyPlans', { state: { plan } } )
//       e.preventDefault();
//       setError(null);
//       setLoading(true);

//       try {
//         const franchiseId = localStorage.getItem('userId');
//         if (!franchiseId) {
//           setError('Franchise ID not found. Please log in again.');
//           setLoading(false);
//           return;
//         }

//         if (!formData.pincode || formData.pincode.length !== 6) {
//           setError('Pincode must be exactly 6 digits');
//           setLoading(false);
//           return;
//         }

//         if (!/^\d{10}$/.test(formData.phoneNumber)) {
//           setError('Phone number must be exactly 10 digits');
//           setLoading(false);
//           return;
//         }

//         if (!formData.subscriptionId) {
//           setError('Please select a subscription plan');
//           setLoading(false);
//           return;
//         }

//         const payload = {
//           username: formData.username,
//           franchiseId,
//           category: formData.category,
//           phoneNumber: formData.phoneNumber,
//           password: formData.password,
//           buildingName: formData.buildingName,
//           areaName: formData.areaName,
//           city: formData.city,
//           state: formData.state,
//           pincode: formData.pincode,
//           subscriptionId: formData.subscriptionId,
//         };

//         const response = await registerTechByFranchise(payload);

//         if (response?.success) {
//           setFormData(initialFormState);
//           alert('Technician added successfully!');
//         } else {
//           throw new Error('Failed to add technician');
//         }
//       } catch (err: any) {
//         setError(err?.data?.error?.[0] || err?.message || 'Failed to add technician. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     },
//     [formData]
//   );

//   return (
//     <div className="max-w-3xl mx-auto mt-12 p-8 bg-gradient-to-br from-teal-50 to-indigo-50 rounded-xl shadow-2xl">
//       <h2 className="text-3xl font-extrabold text-indigo-900 mb-8 text-center">Add New Technician</h2>
//       {error && (
//         <div className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg mb-6 animate-pulse">{error}</div>
//       )}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {[
//           { id: 'username', label: 'Username', type: 'text', placeholder: 'Enter username' },
//           { id: 'category', label: 'Category', type: 'select' },
//           { id: 'phoneNumber', label: 'Phone Number', type: 'tel', pattern: '[0-9]{10}', placeholder: 'Enter 10-digit phone number' },
//           { id: 'password', label: 'Password', type: 'password', minLength: 6, maxLength: 10, placeholder: '6-10 characters' },
//           { id: 'buildingName', label: 'Building Name', type: 'text', placeholder: 'Enter building name' },
//           { id: 'pincode', label: 'Pincode', type: 'select' },
//           { id: 'areaName', label: 'Area', type: 'select' },
//           { id: 'city', label: 'City', type: 'select' },
//           { id: 'state', label: 'State', type: 'select' },
//           { id: 'subscriptionId', label: 'Subscription Plan', type: 'select' },
//         ].map(({ id, label, type, pattern, minLength, maxLength, placeholder }) => (
//           <div key={id} className="relative group">
//             <label htmlFor={id} className="block text-sm font-medium text-indigo-700 mb-1">
//               {label} <span className="text-amber-500">*</span>
//             </label>
//             {id === 'category' ? (
//               <select
//                 id="category"
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select a category</option>
//                 {apiCategories
//                   .filter((category) => category?.status === 1)
//                   .map((item) => (
//                     <option key={item._id} value={item._id}>
//                       {item.category_name}
//                     </option>
//                   ))}
//               </select>
//             ) : id === 'password' ? (
//               <div className="relative">
//                 <input
//                   id={id}
//                   name={id}
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder={placeholder}
//                   required
//                   value={formData[id as keyof TechnicianData]}
//                   onChange={handleChange}
//                   minLength={minLength}
//                   maxLength={maxLength}
//                   className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white pr-10"
//                 />
//                 <span
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-indigo-500 hover:text-amber-500 transition"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                 >
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </span>
//               </div>
//             ) : id === 'pincode' ? (
//               <select
//                 id="pincode"
//                 name="pincode"
//                 value={formData.pincode}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select Pincode</option>
//                 {pincodeData.map((p) => (
//                   <option key={p._id} value={p.code}>
//                     {p.code}
//                   </option>
//                 ))}
//               </select>
//             ) : id === 'areaName' ? (
//               <select
//                 id="areaName"
//                 name="areaName"
//                 value={formData.areaName}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select Area</option>
//                 {areaOptions.map((a) => (
//                   <option key={a._id} value={a.name}>
//                     {a.name}
//                   </option>
//                 ))}
//               </select>
//             ) : id === 'city' ? (
//               <select
//                 id="city"
//                 name="city"
//                 value={formData.city}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select City</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.city}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.city}
//                   </option>
//                 )}
//               </select>
//             ) : id === 'state' ? (
//               <select
//                 id="state"
//                 name="state"
//                 value={formData.state}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select State</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.state}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.state}
//                   </option>
//                 )}
//               </select>
//             ) : id === 'subscriptionId' ? (
//               <select
//                 id="subscriptionId"
//                 name="subscriptionId"
//                 value={formData.subscriptionId}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select Subscription Plan</option>
//                 {subscriptionPlans
//                 .filter(plan => plan.name !== "Free Plan") 
//                 .map((plan) => (
//                   <option key={plan._id} value={plan._id}>
//                     {plan.name} - ₹{plan.finalPrice} ({plan.price} + {plan.gst})
//                   </option>
//                 ))}
//               </select>
//             ) : (
//               <input
//                 id={id}
//                 name={id}
//                 type={type}
//                 placeholder={placeholder}
//                 required
//                 value={formData[id as keyof TechnicianData]}
//                 onChange={handleChange}
//                 pattern={pattern}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               />
//             )}
//           </div>
//         ))}
//       </div>
//       <button
//         type="submit"
//         onClick={handleSubmit}
//         disabled={loading}
//         className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 transform hover:scale-105"
//       >
//         {loading ? (
//           <div className="flex items-center justify-center">
//             <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
//             </svg>
//             Adding Technician...
//           </div>
//         ) : (
//           'Add Technician'
//         )}
//       </button>
//     </div>
//   );
// };

// export default AddTechnician;
// import React, { useState, useCallback, useEffect } from 'react';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import { getAllCategories, getAllPincodes, registerTechByFranchise} from '../../api/apiMethods'; // Assuming addTechnician API method

// interface TechnicianData {
//   username: string;
//   franchiseId: string;
//   category: string;
//   phoneNumber: string;
//   password: string;
//   buildingName: string;
//   areaName: string;
//   city: string;
//   state: string;
//   pincode: string;
// }

// interface PincodeData {
//   _id: string;
//   code: string;
//   city: string;
//   state: string;
//   areas: { _id: string; name: string }[];
// }

// const initialFormState: TechnicianData = {
//   username: '',
//   franchiseId: '',
//   category: '',
//   phoneNumber: '',
//   password: '',
//   buildingName: '',
//   areaName: '',
//   city: '',
//   state: '',
//   pincode: '',
// };

// const AddTechnician: React.FC = () => {
//   const [formData, setFormData] = useState<TechnicianData>(initialFormState);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [apiCategories, setApiCategories] = useState<{ _id: string; category_name: string; status :number }[]>([]);
//   const [pincodeData, setPincodeData] = useState<PincodeData[]>([]);
//   const [selectedPincode, setSelectedPincode] = useState<string>('');
//   const [areaOptions, setAreaOptions] = useState<{ _id: string; name: string }[]>([]);
//   const [showPassword, setShowPassword] = useState(false);
  

//   useEffect(() => {
//     getAllPincodes()
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//           setPincodeData(res.data);
//         }
//       })
//       .catch(() => {});
//   }, []);

//   useEffect(() => {
//     if (selectedPincode) {
//       const found = pincodeData.find((p) => p.code === selectedPincode);
//       if (found && found.areas) {
//         setAreaOptions(found.areas);
//         setFormData((prev) => ({
//           ...prev,
//           city: found.city,
//           state: found.state,
//         }));
//       } else {
//         setAreaOptions([]);
//         setFormData((prev) => ({
//           ...prev,
//           city: '',
//           state: '',
//           areaName: '',
//         }));
//       }
//     } else {
//       setAreaOptions([]);
//       setFormData((prev) => ({
//         ...prev,
//         city: '',
//         state: '',
//         areaName: '',
//       }));
//     }
//   }, [selectedPincode, pincodeData]);

//   useEffect(()=>{
//     getAllCategories(null)
//         .then((res: any) => {
//           if (Array.isArray(res?.data)) {
//             setApiCategories(res.data);
//           } else {
//             setApiCategories([]);
//             setCatError('Failed to load categories');
//           }
//         })
//         .catch(() => {
//           setApiCategories([]);
//           setCatError('Failed to load categories');
//         })
//   },[])

//   const handleChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//       const { name, value } = e.target;
//       setFormData((prev) => ({ ...prev, [name]: value }));
//       if (name === 'pincode') {
//         setSelectedPincode(value);
//       }
//     },
//     []
//   );

//   const handleSubmit = useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault();
//       setError(null);
//       setLoading(true);

//       try {
//         const franchiseId = localStorage.getItem('userId')
//         if (!formData.pincode || formData.pincode.length !== 6) {
//           setError('Pincode must be exactly 6 digits');
//           setLoading(false);
//           return;
//         }

//         if (!/^\d{10}$/.test(formData.phoneNumber)) {
//           setError('Phone number must be exactly 10 digits');
//           setLoading(false);
//           return;
//         }

//         const payload = {
//           username: formData.username,
//           franchiseId: franchiseId,
//           category: formData.category,
//           phoneNumber: formData.phoneNumber,
//           password: formData.password,
//           buildingName: formData.buildingName,
//           areaName: formData.areaName,
//           city: formData.city,
//           state: formData.state,
//           pincode: formData.pincode,
//         };

//         const response = await registerTechByFranchise(payload);

//         if (response?.success) {
//           setFormData(initialFormState); // Reset form on success
//           alert('Technician added successfully!');
//         } else {
//           throw new Error('Failed to add technician');
//         }
//       } catch (err: any) {
//         setError(err?.data?.error?.[0] || err?.message || 'Failed to add technician. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     },
//     [formData]
//   );

//   return (
//     <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-xl">
//       <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Technician</h2>
//       {error && (
//         <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded mb-4">{error}</div>
//       )}
//       <div className="space-y-4">
//         {[
//           { id: 'username', label: 'Username', type: 'text' },
//           { id: 'category', label: 'Category', type: 'text' },
//           { id: 'phoneNumber', label: 'Phone Number', type: 'tel', pattern: '[0-9]{10}' },
//           { id: 'password', label: 'Password', type: 'password', minLength: 6, maxLength: 10 },
//           { id: 'buildingName', label: 'Building Name', type: 'text' },
//           { id: 'pincode', label: 'Pincode', type: 'select' },
//           { id: 'areaName', label: 'Area', type: 'select' },
//           { id: 'city', label: 'City', type: 'select' },
//           { id: 'state', label: 'State', type: 'select' },
//         ].map(({ id, label, type, pattern, minLength, maxLength }) => (
//           <div key={id}>
//             <label htmlFor={id} className="block text-sm font-medium text-gray-700">
//               {label} <span className="text-red-600">*</span>
//             </label>
//             {id === 'category' ? (
//                 <div>
//               <label htmlFor="category" className="block text-sm font-medium text-gray-700">
//               </label>
//               <select
//                 id="category"
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 w-full border border-gray-300 rounded-md p-2"
//               >
//                 <option value="" disabled>
//                    Select a category
//                 </option>
        
//                  {apiCategories
//                       .filter((category) => category?.status === 1)
//                       .map((item) => (
//                         <option key={item._id} value={item._id}>
//                           {item.category_name}
//                         </option>
//                       ))}
//               </select>
//             </div>
//             ) :id === 'password' ? (
//               <div className="relative">
//                 <input
//                   id={id}
//                   name={id}
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="Password (6-10 characters)"
//                   required
//                   value={formData[id as keyof TechnicianData]}
//                   onChange={handleChange}
//                   minLength={minLength}
//                   maxLength={maxLength}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//                 <span
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                 >
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </span>
//               </div>
//             ) : id === 'pincode' ? (
//               <select
//                 id="pincode"
//                 name="pincode"
//                 value={formData.pincode}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               >
//                 <option value="">Select Pincode</option>
//                 {pincodeData.map((p) => (
//                   <option key={p._id} value={p.code}>
//                     {p.code}
//                   </option>
//                 ))}
//               </select>
//             ) : id === 'areaName' ? (
//               <select
//                 id="areaName"
//                 name="areaName"
//                 value={formData.areaName}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
//               >
//                 <option value="">Select Area</option>
//                 {areaOptions.map((a) => (
//                   <option key={a._id} value={a.name}>
//                     {a.name}
//                   </option>
//                 ))}
//               </select>
//             ) : id === 'city' ? (
//               <select
//                 id="city"
//                 name="city"
//                 value={formData.city}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
//               >
//                 <option value="">Select City</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.city}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.city}
//                   </option>
//                 )}
//               </select>
//             ) : id === 'state' ? (
//               <select
//                 id="state"
//                 name="state"
//                 value={formData.state}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
//               >
//                 <option value="">Select State</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.state}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.state}
//                   </option>
//                 )}
//               </select>
//             ) : (
//               <input
//                 id={id}
//                 name={id}
//                 type={type}
//                 placeholder={label}
//                 required
//                 value={formData[id as keyof TechnicianData]}
//                 onChange={handleChange}
//                 pattern={pattern}
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             )}
//           </div>
//         ))}
//         <button
//           type="submit"
//           onClick={handleSubmit}
//           disabled={loading}
//           className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
//         >
//           {loading ? 'Adding Technician...' : 'Add Technician'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AddTechnician;