import React, { useState, useCallback, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  getAllTechniciansByFranchise,
  getAllPincodes,
  getAllCategories,
  getPlans,
  updateTechByFranchise,
} from "../../api/apiMethods";

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
  profileImage?: string;
}

interface PincodeData {
  _id: string;
  code: string;
  city: string;
  state: string;
  areas: { _id: string; name: string }[];
}

interface CategoryData {
  _id: string;
  category_name: string;
  status: number;
}

interface SubscriptionPlan {
  _id: string;
  name: string;
}

const initialFormState = {
  username: "",
  category: "",
  phoneNumber: "",
  password: "",
  buildingName: "",
  areaName: "",
  city: "",
  state: "",
  pincode: "",
  subscriptionId: "",
  technicianId: "",
  profileImage: "",
};

const EditTechnician: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [apiCategories, setApiCategories] = useState<CategoryData[]>([]);
  const [pincodeData, setPincodeData] = useState<PincodeData[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [areaOptions, setAreaOptions] = useState<
    { _id: string; name: string }[]
  >([]);
  const [showPassword, setShowPassword] = useState(false);
  const [technician, setTechnician] = useState<Technician | undefined>(
    location.state?.technician
  );
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!technician && id) {
          const franchiseId = localStorage.getItem("userId") || "";
          const response = await getAllTechniciansByFranchise(franchiseId);
          if (Array.isArray(response?.result)) {
            const foundTechnician = response.result.find(
              (tech: Technician) => tech.id === id
            );
            if (foundTechnician) {
              setTechnician(foundTechnician);
              setFormData({
                username: foundTechnician.username,
                category: foundTechnician.category,
                phoneNumber: foundTechnician.phoneNumber,
                password: "",
                buildingName: foundTechnician.buildingName,
                areaName: foundTechnician.areaName,
                city: foundTechnician.city,
                state: foundTechnician.state,
                pincode: foundTechnician.pincode,
                subscriptionId: foundTechnician.subscription.subscriptionId,
                technicianId: foundTechnician.id,
                profileImage: foundTechnician.profileImage || "",
              });
              setProfileImagePreview(foundTechnician.profileImage || null);
            } else {
              setError("Technician not found");
            }
          } else {
            setError("No technicians found");
          }
        } else if (technician) {
          setFormData({
            username: technician.username,
            category: technician.category,
            phoneNumber: technician.phoneNumber,
            password: "",
            buildingName: technician.buildingName,
            areaName: technician.areaName,
            city: technician.city,
            state: technician.state,
            pincode: technician.pincode,
            subscriptionId: technician.subscription.subscriptionId,
            technicianId: technician.id,
            profileImage: technician.profileImage || "",
          });
          setProfileImagePreview(technician.profileImage || null);
        }

        const pincodesResponse = await getAllPincodes();
        if (Array.isArray(pincodesResponse?.data)) {
          setPincodeData(pincodesResponse.data);
        }

        const categoriesResponse = await getAllCategories(null);
        if (Array.isArray(categoriesResponse?.data)) {
          setApiCategories(categoriesResponse.data);
        } else {
          setApiCategories([]);
          setError("Failed to load categories");
        }

        const plansResponse = await getPlans();
        if (Array.isArray(plansResponse?.data)) {
          setSubscriptionPlans(plansResponse.data);
        } else {
          setSubscriptionPlans([]);
          setError("Failed to load subscription plans");
        }
      } catch (error) {
        setError((error as Error)?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [technician, id]);

  useEffect(() => {
    if (formData.pincode && pincodeData.length > 0) {
      const found = pincodeData.find((p) => p.code === formData.pincode);
      if (found && found.areas) {
        setAreaOptions(found.areas);
        setFormData((prev) => ({
          ...prev,
          city: found.city,
          state: found.state,
          areaName: found.areas.some((area) => area.name === prev.areaName)
            ? prev.areaName
            : found.areas[0]?.name || "",
        }));
      } else {
        setAreaOptions([]);
        setFormData((prev) => ({
          ...prev,
          city: "",
          state: "",
          areaName: "",
        }));
      }
    } else {
      setAreaOptions([]);
      setFormData((prev) => ({
        ...prev,
        city: "",
        state: "",
        areaName: "",
      }));
    }
  }, [formData.pincode, pincodeData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFormData((prev) => ({ ...prev, profileImage: file.name }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      setSuccess("");

      try {
        const franchiseId = localStorage.getItem("userId");
        if (!franchiseId) {
          setError("Franchise ID not found. Please log in again.");
          setLoading(false);
          return;
        }

        if (!formData.pincode || formData.pincode.length !== 6) {
          setError("Pincode must be exactly 6 digits");
          setLoading(false);
          return;
        }

        if (!/^\d{10}$/.test(formData.phoneNumber)) {
          setError("Phone number must be exactly 10 digits");
          setLoading(false);
          return;
        }

        if (!formData.category) {
          setError("Category is required");
          setLoading(false);
          return;
        }

        if (!formData.buildingName) {
          setError("Building name is required");
          setLoading(false);
          return;
        }

        if (!formData.areaName) {
          setError("Area is required");
          setLoading(false);
          return;
        }

        const updateData = {
          subscriptionId: formData.subscriptionId,
          category: formData.category,
          phoneNumber: formData.phoneNumber,
          password: formData.password || undefined,
          buildingName: formData.buildingName,
          areaName: formData.areaName,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          technicianId: formData.technicianId,
          profileImage: formData.profileImage || undefined,
        };

        await updateTechByFranchise(updateData);
        setSuccess("Technician updated successfully!");
        setTimeout(() => navigate("/technicians"), 2000);
      } catch (error) {
        setError((error as Error)?.message || "Failed to update technician");
      } finally {
        setLoading(false);
      }
    },
    [formData, navigate]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 text-gray-600"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
            />
          </svg>
          <span className="ml-3 text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !technician) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-lg shadow-md">
        <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
          {error || "No technician data available."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-extrabold text-indigo-900 mb-8 text-center">
        Edit Technician
      </h2>
      {error && (
        <div className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg mb-6 animate-pulse">
          {error}
        </div>
      )}
      {success && (
        <div className="text-green-600 text-sm text-center bg-green-100 p-3 rounded-lg mb-6 animate-pulse">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              id: "profileImage",
              label: "Profile Image",
              type: "file",
              accept: "image/*",
              placeholder: "Upload profile image",
            },
            {
              id: "username",
              label: "Technician Name",
              type: "text",
              placeholder: "Enter technician name",
            },
            {
              id: "category",
              label: "Category",
              type: "select",
              disabled: true,
              required: true,
            },
            {
              id: "phoneNumber",
              label: "Phone Number",
              type: "tel",
              disabled: true,
              pattern: "[0-9]{10}",
              placeholder: "Enter 10-digit phone number",
            },
            {
              id: "password",
              label: "Password",
              type: "password",
              minLength: 6,
              maxLength: 10,
              placeholder: "6-10 characters (optional)",
            },
            {
              id: "buildingName",
              label: "Building Name",
              type: "text",
              required: true,
              placeholder: "Enter building name",
            },
            { id: "pincode", label: "Pincode", type: "select", required: true },
            { id: "areaName", label: "Area", type: "select", required: true },
            { id: "city", label: "City", type: "select", disabled: true },
            { id: "state", label: "State", type: "select", disabled: true },
            {
              id: "subscriptionId",
              label: "Subscription Plan",
              type: "text",
              disabled: true,
            },
          ].map(
            ({
              id,
              label,
              type,
              disabled,
              pattern,
              minLength,
              maxLength,
              placeholder,
              required,
              accept,
            }) => (
              <div key={id} className="relative group">
                <label
                  htmlFor={id}
                  className="block text-sm font-medium text-indigo-700 mb-1"
                >
                  {label}{" "}
                  {required && !disabled && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                {id === "profileImage" ? (
                  <div className="flex items-center space-x-4">
                    {profileImagePreview && (
                      <img
                        src={profileImagePreview}
                        alt="Profile Preview"
                        className="w-16 h-16 object-cover rounded-full"
                      />
                    )}
                    <input
                      id="profileImage"
                      name="profileImage"
                      type="file"
                      accept={accept}
                      onChange={handleImageChange}
                      className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
                    />
                  </div>
                ) : id === "category" ? (
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required={required}
                    disabled={disabled}
                    className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {apiCategories
                      .filter((category) => category?.status === 1)
                      .map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.category_name}
                        </option>
                      ))}
                  </select>
                ) : id === "password" ? (
                  <div className="relative">
                    <input
                      id={id}
                      name={id}
                      type={showPassword ? "text" : "password"}
                      placeholder={placeholder}
                      value={formData[id as keyof typeof initialFormState]}
                      onChange={handleChange}
                      minLength={minLength}
                      maxLength={maxLength}
                      className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white pr-10 disabled:bg-gray-100"
                    />
                    <span
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-indigo-500 hover:text-amber-500 transition"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                ) : id === "pincode" ? (
                  <select
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required={required}
                    disabled={disabled}
                    className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
                  >
                    <option value="" disabled>
                      Select Pincode
                    </option>
                    {pincodeData.map((p) => (
                      <option key={p._id} value={p.code}>
                        {p.code}
                      </option>
                    ))}
                  </select>
                ) : id === "areaName" ? (
                  <select
                    id="areaName"
                    name="areaName"
                    value={formData.areaName}
                    onChange={handleChange}
                    required={required}
                    disabled={!formData.pincode}
                    className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
                  >
                    <option value="" disabled>
                      Select Area
                    </option>
                    {areaOptions.map((a) => (
                      <option key={a._id} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                ) : id === "city" ? (
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required={required}
                    disabled={disabled || !formData.pincode}
                    className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
                  >
                    <option value="" disabled>
                      Select City
                    </option>
                    {formData.pincode &&
                      pincodeData.find((p) => p.code === formData.pincode) && (
                        <option
                          value={
                            pincodeData.find((p) => p.code === formData.pincode)
                              ?.city
                          }
                        >
                          {
                            pincodeData.find((p) => p.code === formData.pincode)
                              ?.city
                          }
                        </option>
                      )}
                  </select>
                ) : id === "state" ? (
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required={required}
                    disabled={disabled || !formData.pincode}
                    className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
                  >
                    <option value="" disabled>
                      Select State
                    </option>
                    {formData.pincode &&
                      pincodeData.find((p) => p.code === formData.pincode) && (
                        <option
                          value={
                            pincodeData.find((p) => p.code === formData.pincode)
                              ?.state
                          }
                        >
                          {
                            pincodeData.find((p) => p.code === formData.pincode)
                              ?.state
                          }
                        </option>
                      )}
                  </select>
                ) : id === "subscriptionId" ? (
                  <input
                    id="subscriptionId"
                    name="subscriptionId"
                    type="text"
                    value={
                      subscriptionPlans.find(
                        (plan) => plan._id === formData.subscriptionId
                      )?.name || technician.subscription.subscriptionName
                    }
                    disabled
                    className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
                  />
                ) : (
                  <input
                    id={id}
                    name={id}
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    value={formData[id as keyof typeof initialFormState]}
                    onChange={handleChange}
                    pattern={pattern}
                    disabled={disabled}
                    className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
                  />
                )}
              </div>
            )
          )}
        </div>
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={() => navigate("/technicians")}
            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition duration-200 transform hover:scale-105"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-teal-500 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 transform hover:scale-105"
            aria-label="Save changes"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                  />
                </svg>
                Saving...
              </div>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
// <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-lg shadow-md">
//   <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Technician</h2>
//   {error && (
//     <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md mb-6">{error}</div>
//   )}
//   {success && (
//     <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md mb-6">{success}</div>
//   )}
//   <form onSubmit={handleSubmit}>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       {[
//         { id: 'profileImage', label: 'Profile Image', type: 'file', accept: 'image/*', placeholder: 'Upload profile image' },
//         { id: 'username', label: 'Technician Name', type: 'text', placeholder: 'Enter technician name' },
//         { id: 'category', label: 'Category', type: 'select', disabled: true, required: true },
//         { id: 'phoneNumber', label: 'Phone Number', type: 'tel', disabled: true, pattern: '[0-9]{10}', placeholder: 'Enter 10-digit phone number' },
//         { id: 'password', label: 'Password', type: 'password', minLength: 6, maxLength: 10, placeholder: '6-10 characters (optional)' },
//         { id: 'buildingName', label: 'Building Name', type: 'text', required: true, placeholder: 'Enter building name' },
//         { id: 'pincode', label: 'Pincode', type: 'select', required: true },
//         { id: 'areaName', label: 'Area', type: 'select', required: true },
//         { id: 'city', label: 'City', type: 'select', disabled: true },
//         { id: 'state', label: 'State', type: 'select', disabled: true },
//         { id: 'subscriptionId', label: 'Subscription Plan', type: 'text', disabled: true },
//       ].map(({ id, label, type, disabled, pattern, minLength, maxLength, placeholder, required, accept }) => (
//         <div key={id} className="relative">
//           <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
//             {label} {required && !disabled && <span className="text-red-500">*</span>}
//           </label>
//           {id === 'profileImage' ? (
//             <div className="flex items-center space-x-4">
//               {profileImagePreview && (
//                 <img src={profileImagePreview} alt="Profile Preview" className="w-16 h-16 object-cover rounded-full" />
//               )}
//               <input
//                 id="profileImage"
//                 name="profileImage"
//                 type="file"
//                 accept={accept}
//                 onChange={handleImageChange}
//                 className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//               />
//             </div>
//           ) : id === 'category' ? (
//             <select
//               id="category"
//               name="category"
//               value={formData.category}
//               onChange={handleChange}
//               required={required}
//               disabled={disabled}
//               className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100"
//             >
//               <option value="" disabled>
//                 Select a category
//               </option>
//               {apiCategories
//                 .filter((category) => category?.status === 1)
//                 .map((item) => (
//                   <option key={item._id} value={item._id}>
//                     {item.category_name}
//                   </option>
//                 ))}
//             </select>
//           ) : id === 'password' ? (
//             <div className="relative">
//               <input
//                 id={id}
//                 name={id}
//                 type={showPassword ? 'text' : 'password'}
//                 placeholder={placeholder}
//                 value={formData[id as keyof typeof initialFormState]}
//                 onChange={handleChange}
//                 minLength={minLength}
//                 maxLength={maxLength}
//                 className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white pr-10 disabled:bg-gray-100"
//               />
//               <span
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-blue-500"
//                 onClick={() => setShowPassword((prev) => !prev)}
//               >
//                 {showPassword ? <FaEyeSlash /> : <FaEye />}
//               </span>
//             </div>
//           ) : id === 'pincode' ? (
//             <select
//               id="pincode"
//               name="pincode"
//               value={formData.pincode}
//               onChange={handleChange}
//               required={required}
//               disabled={disabled}
//               className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100"
//             >
//               <option value="" disabled>
//                 Select Pincode
//               </option>
//               {pincodeData.map((p) => (
//                 <option key={p._id} value={p.code}>
//                   {p.code}
//                 </option>
//               ))}
//             </select>
//           ) : id === 'areaName' ? (
//             <select
//               id="areaName"
//               name="areaName"
//               value={formData.areaName}
//               onChange={handleChange}
//               required={required}
//               disabled={!formData.pincode}
//               className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100"
//             >
//               <option value="" disabled>
//                 Select Area
//               </option>
//               {areaOptions.map((a) => (
//                 <option key={a._id} value={a.name}>
//                   {a.name}
//                 </option>
//               ))}
//             </select>
//           ) : id === 'city' ? (
//             <select
//               id="city"
//               name="city"
//               value={formData.city}
//               onChange={handleChange}
//               required={required}
//               disabled={disabled || !formData.pincode}
//               className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100"
//             >
//               <option value="" disabled>
//                 Select City
//               </option>
//               {formData.pincode && pincodeData.find((p) => p.code === formData.pincode) && (
//                 <option value={pincodeData.find((p) => p.code === formData.pincode)?.city}>
//                   {pincodeData.find((p) => p.code === formData.pincode)?.city}
//                 </option>
//               )}
//             </select>
//           ) : id === 'state' ? (
//             <select
//               id="state"
//               name="state"
//               value={formData.state}
//               onChange={handleChange}
//               required={required}
//               disabled={disabled || !formData.pincode}
//               className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100"
//             >
//               <option value="" disabled>
//                 Select State
//               </option>
//               {formData.pincode && pincodeData.find((p) => p.code === formData.pincode) && (
//                 <option value={pincodeData.find((p) => p.code === formData.pincode)?.state}>
//                   {pincodeData.find((p) => p.code === formData.pincode)?.state}
//                 </option>
//               )}
//             </select>
//           ) : id === 'subscriptionId' ? (
//             <input
//               id="subscriptionId"
//               name="subscriptionId"
//               type="text"
//               value={subscriptionPlans.find((plan) => plan._id === formData.subscriptionId)?.name || technician.subscription.subscriptionName}
//               disabled
//               className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
//             />
//           ) : (
//             <input
//               id={id}
//               name={id}
//               type={type}
//               placeholder={placeholder}
//               required={required}
//               value={formData[id as keyof typeof initialFormState]}
//               onChange={handleChange}
//               pattern={pattern}
//               disabled={disabled}
//               className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100"
//             />
//           )}
//         </div>
//       ))}
//       {/* <div className="col-span-1 md:col-span-2">
//         <h3 className="text-lg font-semibold text-gray-700 mb-2">Subscription Details</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//             <input
//               type="text"
//               value={formatDate(technician.subscription.startDate)}
//               disabled
//               className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
//               aria-label="Subscription start date"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//             <input
//               type="text"
//               value={formatDate(technician.subscription.endDate)}
//               disabled
//               className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
//               aria-label="Subscription end date"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Leads</label>
//             <input
//               type="text"
//               value={technician.subscription.leads ?? 'N/A'}
//               disabled
//               className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
//               aria-label="Subscription leads"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Orders Count</label>
//             <input
//               type="text"
//               value={technician.subscription.ordersCount}
//               disabled
//               className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
//               aria-label="Subscription orders count"
//             />
//           </div>
//         </div>
//       </div> */}
//     </div>
//     <div className="flex justify-end space-x-4 mt-8">
//       <button
//         type="button"
//         onClick={() => navigate('/technicians')}
//         className="px-4 py-3 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition duration-200"
//         aria-label="Cancel"
//       >
//         Cancel
//       </button>
//       <button
//         type="submit"
//         disabled={loading}
//         className="px-4 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
//         aria-label="Save changes"
//       >
//         {loading ? (
//           <div className="flex items-center justify-center">
//             <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
//             </svg>
//             Saving...
//           </div>
//         ) : (
//           'Save Changes'
//         )}
//       </button>
//     </div>
//   </form>
// </div>

export default EditTechnician;
// import React, { useState, useCallback, useEffect } from 'react';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import { useLocation, useParams, useNavigate } from 'react-router-dom';
// import { editAllTechnicianByFranchise, getAllTechniciansByFranchise, getAllPincodes, getAllCategories, getPlans } from '../../api/apiMethods';

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

// interface PincodeData {
//   _id: string;
//   code: string;
//   city: string;
//   state: string;
//   areas: { _id: string; name: string }[];
// }

// interface CategoryData {
//   _id: string;
//   category_name: string;
//   status: number;
// }

// interface SubscriptionPlan {
//   _id: string;
//   name: string;
// }

// const initialFormState = {
//   username: '',
//   category: '',
//   phoneNumber: '',
//   password: '',
//   buildingName: '',
//   areaName: '',
//   city: '',
//   state: '',
//   pincode: '',
//   subscriptionId: '',
//   technicianId: '',
// };

// const EditTechnician: React.FC = () => {
//   const location = useLocation();
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState(initialFormState);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState('');
//   const [apiCategories, setApiCategories] = useState<CategoryData[]>([]);
//   const [pincodeData, setPincodeData] = useState<PincodeData[]>([]);
//   const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
//   const [areaOptions, setAreaOptions] = useState<{ _id: string; name: string }[]>([]);
//   const [showPassword, setShowPassword] = useState(false);
//   const [technician, setTechnician] = useState<Technician | undefined>(location.state?.technician);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError('');

//         if (!technician && id) {
//           const franchiseId = localStorage.getItem('userId') || '';
//           const response = await getAllTechniciansByFranchise(franchiseId);
//           if (Array.isArray(response?.result)) {
//             const foundTechnician = response.result.find((tech: Technician) => tech.id === id);
//             if (foundTechnician) {
//               setTechnician(foundTechnician);
//               setFormData({
//                 username: foundTechnician.username,
//                 category: foundTechnician.category,
//                 phoneNumber: foundTechnician.phoneNumber,
//                 password: '',
//                 buildingName: foundTechnician.buildingName,
//                 areaName: foundTechnician.areaName,
//                 city: foundTechnician.city,
//                 state: foundTechnician.state,
//                 pincode: foundTechnician.pincode,
//                 subscriptionId: foundTechnician.subscription.subscriptionId,
//                 technicianId: foundTechnician.id,
//               });
//             } else {
//               setError('Technician not found');
//             }
//           } else {
//             setError('No technicians found');
//           }
//         } else if (technician) {
//           setFormData({
//             username: technician.username,
//             category: technician.category,
//             phoneNumber: technician.phoneNumber,
//             password: '',
//             buildingName: technician.buildingName,
//             areaName: technician.areaName,
//             city: technician.city,
//             state: technician.state,
//             pincode: technician.pincode,
//             subscriptionId: technician.subscription.subscriptionId,
//             technicianId: technician.id,
//           });
//         }

//         const pincodesResponse = await getAllPincodes();
//         if (Array.isArray(pincodesResponse?.data)) {
//           setPincodeData(pincodesResponse.data);
//         }

//         const categoriesResponse = await getAllCategories(null);
//         if (Array.isArray(categoriesResponse?.data)) {
//           setApiCategories(categoriesResponse.data);
//         } else {
//           setApiCategories([]);
//           setError('Failed to load categories');
//         }

//         const plansResponse = await getPlans();
//         if (Array.isArray(plansResponse?.data)) {
//           setSubscriptionPlans(plansResponse.data);
//         } else {
//           setSubscriptionPlans([]);
//           setError('Failed to load subscription plans');
//         }
//       } catch (error) {
//         setError((error as Error)?.message || 'Failed to fetch data');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [technician, id]);

//   useEffect(() => {
//     if (formData.pincode && pincodeData.length > 0) {
//       const found = pincodeData.find((p) => p.code === formData.pincode);
//       if (found && found.areas) {
//         setAreaOptions(found.areas);
//         setFormData((prev) => ({
//           ...prev,
//           city: found.city,
//           state: found.state,
//           areaName: found.areas.some((area) => area.name === prev.areaName) ? prev.areaName : found.areas[0]?.name || '',
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
//   }, [formData.pincode, pincodeData]);

//   const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   }, []);

//   const handleSubmit = useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault();
//       setError(null);
//       setLoading(true);
//       setSuccess('');

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

//         if (!formData.category) {
//           setError('Category is required');
//           setLoading(false);
//           return;
//         }

//         if (!formData.buildingName) {
//           setError('Building name is required');
//           setLoading(false);
//           return;
//         }

//         if (!formData.areaName) {
//           setError('Area is required');
//           setLoading(false);
//           return;
//         }

//         const updateData = {
//           subscriptionId: formData.subscriptionId,
//           category: formData.category,
//           phoneNumber: formData.phoneNumber,
//           password: formData.password || undefined,
//           buildingName: formData.buildingName,
//           areaName: formData.areaName,
//           city: formData.city,
//           state: formData.state,
//           pincode: formData.pincode,
//           technicianId: formData.technicianId,
//         };

//         await editAllTechnicianByFranchise(formData.technicianId, updateData);
//         setSuccess('Technician updated successfully!');
//         setTimeout(() => navigate('/technicians'), 2000);
//       } catch (error) {
//         setError((error as Error)?.message || 'Failed to update technician');
//       } finally {
//         setLoading(false);
//       }
//     },
//     [formData, navigate]
//   );

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   if (loading) {
//     return (
//       <div className="max-w-3xl mx-auto mt-12 p-8 bg-gradient-to-br from-teal-50 to-indigo-50 rounded-xl shadow-2xl">
//         <div className="flex items-center justify-center">
//           <svg className="animate-spin h-5 w-5 text-indigo-600" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
//           </svg>
//           <span className="ml-3 text-indigo-900">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error || !technician) {
//     return (
//       <div className="max-w-3xl mx-auto mt-12 p-8 bg-gradient-to-br from-teal-50 to-indigo-50 rounded-xl shadow-2xl">
//         <div className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg">{error || 'No technician data available.'}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-3xl mx-auto mt-12 p-8 bg-gradient-to-br from-teal-50 to-indigo-50 rounded-xl shadow-2xl">
//       <h2 className="text-3xl font-extrabold text-indigo-900 mb-8 text-center">Edit Technician</h2>
//       {error && (
//         <div className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg mb-6 animate-pulse">{error}</div>
//       )}
//       {success && (
//         <div className="text-green-600 text-sm text-center bg-green-100 p-3 rounded-lg mb-6 animate-pulse">{success}</div>
//       )}
//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {[
//             { id: 'username', label: 'Username', type: 'text', disabled: true, placeholder: 'Enter username' },
//             { id: 'category', label: 'Category', type: 'select', required: true },
//             { id: 'phoneNumber', label: 'Phone Number', type: 'tel', disabled: true, pattern: '[0-9]{10}', placeholder: 'Enter 10-digit phone number' },
//             { id: 'password', label: 'Password', type: 'password', minLength: 6, maxLength: 10, placeholder: '6-10 characters (optional)' },
//             { id: 'buildingName', label: 'Building Name', type: 'text', required: true, placeholder: 'Enter building name' },
//             { id: 'pincode', label: 'Pincode', type: 'select', required: true },
//             { id: 'areaName', label: 'Area', type: 'select', required: true },
//             { id: 'city', label: 'City', type: 'select', disabled: true },
//             { id: 'state', label: 'State', type: 'select', disabled: true },
//             { id: 'subscriptionId', label: 'Subscription Plan', type: 'text', disabled: true },
//           ].map(({ id, label, type, disabled, pattern, minLength, maxLength, placeholder, required }) => (
//             <div key={id} className="relative group">
//               <label htmlFor={id} className="block text-sm font-medium text-indigo-700 mb-1">
//                 {label} {required && !disabled && <span className="text-amber-500">*</span>}
//               </label>
//               {id === 'category' ? (
//                 <select
//                   id="category"
//                   name="category"
//                   value={formData.category}
//                   onChange={handleChange}
//                   required={required}
//                   disabled={disabled}
//                   className="mt-1 block w-full px-4 py-3 border border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white hover:bg-indigo-50 disabled:bg-gray-100"
//                 >
//                   <option value="" disabled>
//                     Select a category
//                   </option>
//                   {apiCategories
//                     .filter((category) => category?.status === 1)
//                     .map((item) => (
//                       <option key={item._id} value={item._id}>
//                         {item.category_name}
//                       </option>
//                     ))}
//                 </select>
//               ) : id === 'password' ? (
//                 <div className="relative">
//                   <input
//                     id={id}
//                     name={id}
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder={placeholder}
//                     value={formData[id as keyof typeof initialFormState]}
//                     onChange={handleChange}
//                     minLength={minLength}
//                     maxLength={maxLength}
//                     className="mt-1 block w-full px-4 py-3 border border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white hover:bg-indigo-50 pr-10 disabled:bg-gray-100"
//                   />
//                   <span
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-indigo-500 hover:text-amber-500 transition"
//                     onClick={() => setShowPassword((prev) => !prev)}
//                   >
//                     {showPassword ? <FaEyeSlash /> : <FaEye />}
//                   </span>
//                 </div>
//               ) : id === 'pincode' ? (
//                 <select
//                   id="pincode"
//                   name="pincode"
//                   value={formData.pincode}
//                   onChange={handleChange}
//                   required={required}
//                   disabled={disabled}
//                   className="mt-1 block w-full px-4 py-3 border border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white hover:bg-indigo-50 disabled:bg-gray-100"
//                 >
//                   <option value="" disabled>
//                     Select Pincode
//                   </option>
//                   {pincodeData.map((p) => (
//                     <option key={p._id} value={p.code}>
//                       {p.code}
//                     </option>
//                   ))}
//                 </select>
//               ) : id === 'areaName' ? (
//                 <select
//                   id="areaName"
//                   name="areaName"
//                   value={formData.areaName}
//                   onChange={handleChange}
//                   required={required}
//                   disabled={!formData.pincode}
//                   className="mt-1 block w-full px-4 py-3 border border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white hover:bg-indigo-50 disabled:bg-gray-100"
//                 >
//                   <option value="" disabled>
//                     Select Area
//                   </option>
//                   {areaOptions.map((a) => (
//                     <option key={a._id} value={a.name}>
//                       {a.name}
//                     </option>
//                   ))}
//                 </select>
//               ) : id === 'city' ? (
//                 <select
//                   id="city"
//                   name="city"
//                   value={formData.city}
//                   onChange={handleChange}
//                   required={required}
//                   disabled={disabled || !formData.pincode}
//                   className="mt-1 block w-full px-4 py-3 border border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white hover:bg-indigo-50 disabled:bg-gray-100"
//                 >
//                   <option value="" disabled>
//                     Select City
//                   </option>
//                   {formData.pincode && pincodeData.find((p) => p.code === formData.pincode) && (
//                     <option value={pincodeData.find((p) => p.code === formData.pincode)?.city}>
//                       {pincodeData.find((p) => p.code === formData.pincode)?.city}
//                     </option>
//                   )}
//                 </select>
//               ) : id === 'state' ? (
//                 <select
//                   id="state"
//                   name="state"
//                   value={formData.state}
//                   onChange={handleChange}
//                   required={required}
//                   disabled={disabled || !formData.pincode}
//                   className="mt-1 block w-full px-4 py-3 border border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white hover:bg-indigo-50 disabled:bg-gray-100"
//                 >
//                   <option value="" disabled>
//                     Select State
//                   </option>
//                   {formData.pincode && pincodeData.find((p) => p.code === formData.pincode) && (
//                     <option value={pincodeData.find((p) => p.code === formData.pincode)?.state}>
//                       {pincodeData.find((p) => p.code === formData.pincode)?.state}
//                     </option>
//                   )}
//                 </select>
//               ) : id === 'subscriptionId' ? (
//                 <input
//                   id="subscriptionId"
//                   name="subscriptionId"
//                   type="text"
//                   value={subscriptionPlans.find((plan) => plan._id === formData.subscriptionId)?.name || technician.subscription.subscriptionName}
//                   disabled
//                   className="mt-1 block w-full px-4 py-3 border border-indigo-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
//                 />
//               ) : (
//                 <input
//                   id={id}
//                   name={id}
//                   type={type}
//                   placeholder={placeholder}
//                   required={required}
//                   value={formData[id as keyof typeof initialFormState]}
//                   onChange={handleChange}
//                   pattern={pattern}
//                   disabled={disabled}
//                   className="mt-1 block w-full px-4 py-3 border border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white hover:bg-indigo-50 disabled:bg-gray-100"
//                 />
//               )}
//             </div>
//           ))}
//           <div className="col-span-1 md:col-span-2">
//             <h3 className="text-lg font-semibold text-indigo-700 mb-2">Subscription Details</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-indigo-700 mb-1">Start Date</label>
//                 <input
//                   type="text"
//                   value={formatDate(technician.subscription.startDate)}
//                   disabled
//                   className="mt-1 block w-full px-4 py-3 border border-indigo-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
//                   aria-label="Subscription start date"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-indigo-700 mb-1">End Date</label>
//                 <input
//                   type="text"
//                   value={formatDate(technician.subscription.endDate)}
//                   disabled
//                   className="mt-1 block w-full px-4 py-3 border border-indigo-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
//                   aria-label="Subscription end date"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-indigo-700 mb-1">Leads</label>
//                 <input
//                   type="text"
//                   value={technician.subscription.leads ?? 'N/A'}
//                   disabled
//                   className="mt-1 block w-full px-4 py-3 border border-indigo-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
//                   aria-label="Subscription leads"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-indigo-700 mb-1">Orders Count</label>
//                 <input
//                   type="text"
//                   value={technician.subscription.ordersCount}
//                   disabled
//                   className="mt-1 block w-full px-4 py-3 border border-indigo-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
//                   aria-label="Subscription orders count"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="flex justify-end space-x-4 mt-8">
//           <button
//             type="button"
//             onClick={() => navigate('/technicians')}
//             className="px-4 py-3 bg-gray-200 text-indigo-700 rounded-lg font-semibold hover:bg-gray-300 transition duration-200 transform hover:scale-105"
//             aria-label="Cancel"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-teal-500 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 transform hover:scale-105"
//             aria-label="Save changes"
//           >
//             {loading ? (
//               <div className="flex items-center justify-center">
//                 <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 01-8-8z" />
//                 </svg>
//                 Saving...
//               </div>
//             ) : (
//               'Save Changes'
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default EditTechnician;
// import React, { useEffect, useState } from 'react';
// import { useLocation, useParams, useNavigate } from 'react-router-dom';
// import { editAllTechnicianByFranchise, getAllPincodes, getAllTechniciansByFranchise, getPlans } from '../../api/apiMethods';

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

// interface Plan {
//   subscriptionId: string;
//   subscriptionName: string;
// }

// interface PincodeData {
//   pincode: string;
//   areaName: string;
//   city: string;
//   state: string;
// }

// const EditTechnician: React.FC = () => {
//   const location = useLocation();
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [technician, setTechnician] = useState<Technician | undefined>(location.state?.technician);
//   const [formData, setFormData] = useState<{
//     subscriptionId: string;
//     category: string;
//     phoneNumber: string;
//     password: string;
//     buildingName: string;
//     areaName: string;
//     city: string;
//     state: string;
//     pincode: string;
//     technicianId: string;
//     profileImage: string | File | null;
//   }>({
//     subscriptionId: '',
//     category: '',
//     phoneNumber: '',
//     password: '',
//     buildingName: '',
//     areaName: '',
//     city: '',
//     state: '',
//     pincode: '',
//     technicianId: '',
//     profileImage: null
//   });
//   const [plans, setPlans] = useState<Plan[]>([]);
//   const [pincodes, setPincodes] = useState<PincodeData[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // Fetch technician data if not in state, and load plans/pincodes
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError('');

//         if (!technician && id) {
//           const franchiseId = localStorage.getItem('userId') || '';
//           const response = await getAllTechniciansByFranchise(franchiseId);
//           if (Array.isArray(response?.result)) {
//             const foundTechnician = response?.result?.find((tech: Technician) => tech.id === id);
//             if (foundTechnician) {
//               setTechnician(foundTechnician);
//               setFormData({
//                 subscriptionId: foundTechnician.subscription.subscriptionId,
//                 category: foundTechnician.category,
//                 phoneNumber: foundTechnician.phoneNumber,
//                 password: '',
//                 buildingName: foundTechnician.buildingName,
//                 areaName: foundTechnician.areaName,
//                 city: foundTechnician.city,
//                 state: foundTechnician.state,
//                 pincode: foundTechnician.pincode,
//                 technicianId: foundTechnician.id,
//                 profileImage: null
//               });
//             } else {
//               setError('Technician not found');
//             }
//           } else {
//             setError('No technicians found');
//           }
//         } else if (technician) {
//           setFormData({
//             subscriptionId: technician.subscription.subscriptionId,
//             category: technician.category,
//             phoneNumber: technician.phoneNumber,
//             password: '',
//             buildingName: technician.buildingName,
//             areaName: technician.areaName,
//             city: technician.city,
//             state: technician.state,
//             pincode: technician.pincode,
//             technicianId: technician.id,
//             profileImage: null
//           });
//         }

//         const plansResponse = await getPlans();
//         if (Array.isArray(plansResponse?.result)) {
//           setPlans(plansResponse.result);
//         }

//         const pincodesResponse = await getAllPincodes();
//         if (Array.isArray(pincodesResponse?.result)) {
//           setPincodes(pincodesResponse?.result);
//         }
//       } catch (error) {
//         setError((error as Error)?.message || 'Failed to fetch data');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [technician, id]);

//   // Function to update address fields based on pincode
//   const updateAddressFromPincode = (pincode: string) => {
//     const pincodeData = pincodes.find(p => p.pincode === pincode);
//     if (pincodeData) {
//       setFormData(prev => ({
//         ...prev,
//         areaName: pincodeData.areaName,
//         city: pincodeData.city,
//         state: pincodeData.state
//       }));
//     }
//   };

//   // Update address fields when technician and pincodes are loaded
//   useEffect(() => {
//     if (technician && pincodes.length > 0) {
//       updateAddressFromPincode(technician.pincode);
//     }
//   }, [technician, pincodes]);

//   // Handle pincode change
//   const handlePincodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedPincode = e.target.value;
//     setFormData(prev => ({ ...prev, pincode: selectedPincode }));
//     updateAddressFromPincode(selectedPincode);
//   };

//   // Handle text input changes
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   // Handle file input for profile image
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     setFormData(prev => ({ ...prev, profileImage: file }));
//   };

//   // Handle form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const updateData = {
//         subscriptionId: formData.subscriptionId,
//         category: formData.category,
//         phoneNumber: formData.phoneNumber,
//         password: formData.password || undefined,
//         buildingName: formData.buildingName,
//         areaName: formData.areaName,
//         city: formData.city,
//         state: formData.state,
//         pincode: formData.pincode,
//         technicianId: formData.technicianId,
//         profileImage: formData.profileImage instanceof File ? formData.profileImage.name : formData.profileImage
//       };

//       await editAllTechnicianByFranchise(formData.technicianId, updateData);
//       setSuccess('Technician updated successfully!');
//       setTimeout(() => navigate('/technicians'), 2000);
//     } catch (error) {
//       setError((error as Error)?.message || 'Failed to update technician');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Format date to MM/DD/YYYY
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto p-4">
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !technician) {
//     return (
//       <div className="max-w-7xl mx-auto p-4">
//         <div className="bg-red-100 text-red-700 p-4 rounded-xl">
//           {error || 'No technician data available.'}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto p-4">
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Technician</h2>

//         {success && (
//           <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-4">
//             {success}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Personal Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                 <label className="block text-sm font-medium text-gray-700">Username</label>
//                 <input
//                   type="text"
//                   value={technician.username}
//                   disabled
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
//                   aria-label="Technician username"
//                 />
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Category</label>
//                 <input
//                   type="text"
//                   name="category"
//                   value={formData.category}
//                   onChange={handleInputChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   aria-label="Technician category"
//                   required
//                 />
//               </div>
//                 <label className="block text-sm font-medium text-gray-700">Phone Number</label>
//                 <input
//                   type="text"
//                   name="phoneNumber"
//                   value={formData.phoneNumber}
//                   disabled
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
//                   aria-label="Technician phone number"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Password</label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   aria-label="Technician password"
//                   placeholder="Enter new password (optional)"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Technician ID</label>
//                 <input
//                   type="text"
//                   value={formData.technicianId}
//                   disabled
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
//                   aria-label="Technician ID"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Profile Image</label>
//                 <input
//                   type="file"
//                   name="profileImage"
//                   onChange={handleFileChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl"
//                   aria-label="Profile image upload"
//                   accept="image/*"
//                 />
//                 {formData.profileImage && typeof formData.profileImage === 'string' && (
//                   <p className="text-sm text-gray-600 mt-1">Current: {formData.profileImage}</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="mb-4">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Location</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Building</label>
//                 <input
//                   type="text"
//                   name="buildingName"
//                   value={formData.buildingName}
//                   onChange={handleInputChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   aria-label="Building name"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Pincode</label>
//                 <select
//                   name="pincode"
//                   value={formData.pincode}
//                   onChange={handlePincodeChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   aria-label="Pincode"
//                   required
//                 >
//                   <option value="">Select Pincode</option>
//                   {pincodes.map(p => (
//                     <option key={p.pincode} value={p.pincode}>{p.pincode}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Area</label>
//                 <input
//                   type="text"
//                   name="areaName"
//                   value={formData.areaName}
//                   disabled
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
//                   aria-label="Area name"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">City</label>
//                 <input
//                   type="text"
//                   name="city"
//                   value={formData.city}
//                   disabled
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
//                   aria-label="City"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">State</label>
//                 <input
//                   type="text"
//                   name="state"
//                   value={formData.state}
//                   disabled
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
//                   aria-label="State"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="mb-4">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Subscription</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Subscription Plan</label>
//                 <select
//                   name="subscriptionId"
//                   value={formData.subscriptionId}
//                   disabled
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
//                   aria-label="Subscription plan"
//                 >
//                   {plans.map(plan => (
//                     <option key={plan.subscriptionId} value={plan.subscriptionId}>
//                       {plan.subscriptionName}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="mt-4">
//               <h4 className="text-md font-semibold text-gray-700 mb-2">Subscription Details</h4>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Start Date</label>
//                   <input
//                     type="text"
//                     value={formatDate(technician.subscription.startDate)}
//                     disabled
//                     className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
//                     aria-label="Subscription start date"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">End Date</label>
//                   <input
//                     type="text"
//                     value={formatDate(technician.subscription.endDate)}
//                     disabled
//                     className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
//                     aria-label="Subscription end date"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Leads</label>
//                   <input
//                     type="text"
//                     value={technician.subscription.leads ?? 'N/A'}
//                     disabled
//                     className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
//                     aria-label="Subscription leads"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Orders Count</label>
//                   <input
//                     type="text"
//                     value={technician.subscription.ordersCount}
//                     disabled
//                     className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
//                     aria-label="Subscription orders count"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end space-x-4">
//             <button
//               type="button"
//               onClick={() => navigate('/technicians')}
//               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200"
//               aria-label="Cancel"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className={`px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
//               aria-label="Save changes"
//             >
//               {loading ? 'Saving...' : 'Save'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditTechnician;
// import React, { useEffect, useState } from 'react';
// import { useLocation, useParams, useNavigate } from 'react-router-dom';
// import { editAllTechnicianByFranchise, getAllPincodes, getAllTechniciansByFranchise, getPlans} from '../../api/apiMethods';

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

// interface Plan {
//   subscriptionId: string;
//   subscriptionName: string;
// }

// interface PincodeData {
//   pincode: string;
//   areaName: string;
//   city: string;
//   state: string;
// }

// const EditTechnician: React.FC = () => {
//   const location = useLocation();
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [technician, setTechnician] = useState<Technician | undefined>(location.state?.technician);
//   const [formData, setFormData] = useState<{
//     subscriptionId: string;
//     category: string;
//     phoneNumber: string;
//     password: string;
//     buildingName: string;
//     areaName: string;
//     city: string;
//     state: string;
//     pincode: string;
//     technicianId: string;
//     profileImage: string | File | null;
//   }>({
//     subscriptionId: '',
//     category: '',
//     phoneNumber: '',
//     password: '',
//     buildingName: '',
//     areaName: '',
//     city: '',
//     state: '',
//     pincode: '',
//     technicianId: '',
//     profileImage: null
//   });
//   const [plans, setPlans] = useState<Plan[]>([]);
//   const [pincodes, setPincodes] = useState<PincodeData[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // Fetch technician data if not in state, and load plans/pincodes
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError('');

//         // Fetch technician if not provided
//         if (!technician && id) {
//           const franchiseId = localStorage.getItem('userId') || '';
//           const response = await getAllTechniciansByFranchise(franchiseId);
//           if (Array.isArray(response?.result)) {
//             const foundTechnician = response?.result?.find((tech: Technician) => tech.id === id);
//             if (foundTechnician) {
//               setTechnician(foundTechnician);
//               setFormData({
//                 subscriptionId: foundTechnician.subscription.subscriptionId,
//                 category: foundTechnician.category,
//                 phoneNumber: foundTechnician.phoneNumber,
//                 password: '',
//                 buildingName: foundTechnician.buildingName,
//                 areaName: foundTechnician.areaName,
//                 city: foundTechnician.city,
//                 state: foundTechnician.state,
//                 pincode: foundTechnician.pincode,
//                 technicianId: foundTechnician.id,
//                 profileImage: null
//               });
//             } else {
//               setError('Technician not found');
//             }
//           } else {
//             setError('No technicians found');
//           }
//         } else if (technician) {
//           setFormData({
//             subscriptionId: technician.subscription.subscriptionId,
//             category: technician.category,
//             phoneNumber: technician.phoneNumber,
//             password: '',
//             buildingName: technician.buildingName,
//             areaName: technician.areaName,
//             city: technician.city,
//             state: technician.state,
//             pincode: technician.pincode,
//             technicianId: technician.id,
//             profileImage: null
//           });
//         }

//         // Fetch plans
//         const plansResponse = await getPlans();
//         if (Array.isArray(plansResponse?.result)) {
//           setPlans(plansResponse.result);
//         }

//         // Fetch pincodes
//         const pincodesResponse = await getAllPincodes();
//         if (Array.isArray(pincodesResponse?.result)) {
//           setPincodes(pincodesResponse?.result);
//         }
//       } catch (error) {
//         setError((error as Error)?.message || 'Failed to fetch data');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [technician, id]);

//   // Update formData when pincode changes
//   const handlePincodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedPincode = e.target.value;
//     const pincodeData = pincodes.find(p => p.pincode === selectedPincode);
//     setFormData(prev => ({
//       ...prev,
//       pincode: selectedPincode,
//       areaName: pincodeData?.areaName || prev.areaName,
//       city: pincodeData?.city || prev.city,
//       state: pincodeData?.state || prev.state
//     }));
//   };

//   // Handle text input changes
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   // Handle file input for profile image
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     setFormData(prev => ({ ...prev, profileImage: file }));
//   };

//   // Handle form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const updateData = {
//         subscriptionId: formData.subscriptionId,
//         category: formData.category,
//         phoneNumber: formData.phoneNumber,
//         password: formData.password || undefined,
//         buildingName: formData.buildingName,
//         areaName: formData.areaName,
//         city: formData.city,
//         state: formData.state,
//         pincode: formData.pincode,
//         technicianId: formData.technicianId,
//         profileImage: formData.profileImage instanceof File ? formData.profileImage.name : formData.profileImage
//       };

//       await editAllTechnicianByFranchise(formData.technicianId, updateData);
//       setSuccess('Technician updated successfully!');
//       setTimeout(() => navigate('/technicians'), 2000);
//     } catch (error) {
//       setError((error as Error)?.message || 'Failed to update technician');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto p-4">
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !technician) {
//     return (
//       <div className="max-w-7xl mx-auto p-4">
//         <div className="bg-red-100 text-red-700 p-4 rounded-xl">
//           {error || 'No technician data available.'}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto p-4">
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Technician</h2>

//         {success && (
//           <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-4">
//             {success}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Personal Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Category</label>
//                 <input
//                   type="text"
//                   name="category"
//                   value={formData.category}
//                   onChange={handleInputChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   aria-label="Technician category"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Phone Number</label>
//                 <input
//                   type="text"
//                   name="phoneNumber"
//                   value={formData.phoneNumber}
//                   disabled
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
//                   aria-label="Technician phone number"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Password</label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   aria-label="Technician password"
//                   placeholder="Enter new password (optional)"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Technician ID</label>
//                 <input
//                   type="text"
//                   value={formData.technicianId}
//                   disabled
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
//                   aria-label="Technician ID"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Profile Image</label>
//                 <input
//                   type="file"
//                   name="profileImage"
//                   onChange={handleFileChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl"
//                   aria-label="Profile image upload"
//                   accept="image/*"
//                 />
//                 {formData.profileImage && typeof formData.profileImage === 'string' && (
//                   <p className="text-sm text-gray-600 mt-1">Current: {formData.profileImage}</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="mb-4">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Location</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Building</label>
//                 <input
//                   type="text"
//                   name="buildingName"
//                   value={formData.buildingName}
//                   onChange={handleInputChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   aria-label="Building name"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Pincode</label>
//                 <select
//                   name="pincode"
//                   value={formData.pincode}
//                   onChange={handlePincodeChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   aria-label="Pincode"
//                   required
//                 >
//                   <option value="">Select Pincode</option>
//                   {pincodes.map(p => (
//                     <option key={p.pincode} value={p.pincode}>{p.pincode}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Area</label>
//                 <input
//                   type="text"
//                   name="areaName"
//                   value={formData.areaName}
//                   onChange={handleInputChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   aria-label="Area name"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">City</label>
//                 <input
//                   type="text"
//                   name="city"
//                   value={formData.city}
//                   onChange={handleInputChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   aria-label="City"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">State</label>
//                 <input
//                   type="text"
//                   name="state"
//                   value={formData.state}
//                   onChange={handleInputChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   aria-label="State"
//                   required
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="mb-4">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Subscription</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Subscription Plan</label>
//                 <select
//                   name="subscriptionId"
//                   value={formData.subscriptionId}
//                   disabled
//                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
//                   aria-label="Subscription plan"
//                 >
//                   {plans.map(plan => (
//                     <option key={plan.subscriptionId} value={plan.subscriptionId}>
//                       {plan.subscriptionName}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end space-x-4">
//             <button
//               type="button"
//               onClick={() => navigate('/technicians')}
//               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200"
//               aria-label="Cancel"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className={`px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
//               aria-label="Save changes"
//             >
//               {loading ? 'Saving...' : 'Save'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditTechnician;
