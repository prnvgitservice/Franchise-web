import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { franchiseLogin } from "../../api/apiMethods";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Phone } from "lucide-react";

interface LoginData {
  phoneNumber: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  result?: {
    token: string;
    id: string;
    username: string;
    franchiseId: string;
    phoneNumber: string;
    role: string;
    buildingName: string;
    areaName: string;
    city: string;
    state: string;
    pincode: string;
  };
  error?: string[];
}

const FranchiseLoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    phoneNumber: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null); // Clear error on input change
  };

  const validateInputs = (data: LoginData): string | null => {
    // Phone number: exactly 10 digits
    if (!/^\d{10}$/.test(data.phoneNumber)) {
      return "Phone number must be exactly 10 digits";
    }
    // Password: 6-10 characters
    if (data.password.length < 6 || data.password.length > 10) {
      return "Password must be between 6 and 10 characters";
    }
    // No leading/trailing whitespace
    if (
      data.phoneNumber.trim() !== data.phoneNumber ||
      data.password.trim() !== data.password
    ) {
      return "Inputs cannot contain leading or trailing spaces";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Client-side validation
    const inputError = validateInputs(formData);
    if (inputError) {
      setError(inputError);
      setLoading(false);
      return;
    }

    try {
      const response = (await franchiseLogin({ ...formData })) as LoginResponse;

      // Handle API response
      if (response.success && response.result?.token) {
        localStorage.setItem("jwt_token", response.result.token);
        localStorage.setItem("user", JSON.stringify(response.result));
        localStorage.setItem("userId", response.result.id);
        localStorage.setItem("role", "franchise");
        navigate("/");
      } else if (!response.success && response.error) {
        throw new Error(
          response.error[0] || response.message || "Invalid credentials"
        );
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      // Handle specific error cases
      let errorMessage = "Login failed. Please try again.";
      if (err.response?.status === 401) {
        errorMessage =
          response.error?.[0] || "Invalid phone number or password";
      } else if (err.response?.status === 400) {
        errorMessage =
          response.error?.[0] || "Bad request. Please check your inputs.";
      } else if (err.response?.status === 403) {
        errorMessage = "Account is locked or access denied. Contact support.";
      } else if (err.response?.status === 429) {
        errorMessage = "Too many login attempts. Please try again later.";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-center mb-6">
        <div className="bg-blue-900 rounded px-2 py-1 flex items-center">
          <img
            src="https://prnvservices.com/uploads/logo/1695377568_logo-white.png"
            alt="Justdial Logo"
            className="h-8 w-auto"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Franchise Sign In
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              pattern="[0-9]{10}"
              placeholder="Enter 10-digit phone number"
              className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (6-10 characters)"
                minLength={6}
                maxLength={10}
                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-sm text-center text-gray-600 flex justify-center items-center gap-1">
        Don't have an account?
        <Phone className="text-green-400 fill-current ms-1" size={'15'} />
        <a
          href="tel:+9196035583369"
          className="text-blue-600 hover:underline font-medium ms-1"
        >
          +91 96035583369
        </a>
      </p>

    </main>
  );
};

export default FranchiseLoginForm;
{/* <a href="/signup/franchise" className="text-blue-600 hover:underline font-medium ms-1">
  Sign Up
</a> */}
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { franchiseLogin } from '../../api/apiMethods'; // Ensure this is implemented
// import { FaEye, FaEyeSlash } from 'react-icons/fa';

// interface LoginData {
//   phoneNumber: string;
//   password: string;
// }

// const FranchiseLoginForm: React.FC = () => {
//   const [formData, setFormData] = useState<LoginData>({ phoneNumber: '', password: '' });
//   const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     try {
//       const response = await franchiseLogin({ ...formData }) as any; // Replace 'any' with proper typing if possible
//       if (response?.result?.token) {
//         localStorage.setItem('jwt_token', response.result.token);
//         localStorage.setItem('user', JSON.stringify(response.result));
//         localStorage.setItem('userId', response.result.id);
//         localStorage.setItem('role', 'franchise');
//         navigate('/');
//       } else {
//         throw new Error('Invalid credentials or server error');
//       }
//     } catch (err: any) {
//       setError(err?.message || 'Login failed. Please try again.');
//     }
//   };

//   return (
//     <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="flex justify-center mb-6">
//         <div className="bg-blue-900 rounded px-2 py-1 flex items-center">
//           <img
//             src="https://prnvservices.com/uploads/logo/1695377568_logo-white.png"
//             alt="Justdial Logo"
//             className="h-8 w-auto"
//           />
//         </div>
//       </div>

//       <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
//         <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Franchise Sign In</h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {error && <p className="text-red-600 text-sm text-center">{error}</p>}

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Phone Number <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               name="phoneNumber"
//               required
//               value={formData.phoneNumber}
//               onChange={handleChange}
//               className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Password <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 name="password"
//                 required
//                 value={formData.password}
//                 onChange={handleChange}
//                 className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
//               />
//               <span
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
//                 onClick={() => setShowPassword((prev) => !prev)}
//               >
//                 {showPassword ? <FaEyeSlash /> : <FaEye />}
//               </span>
//             </div>
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-200"
//           >
//             Sign In
//           </button>
//         </form>
//       </div>

//       <p className="mt-4 text-sm text-center text-gray-600">
//         Don't have an account?
//         <a
//           href="/signup/franchise"
//           className="text-blue-600 hover:underline font-medium ms-1"
//         >
//           Sign Up
//         </a>
//       </p>
//     </main>
//   );
// };

// export default FranchiseLoginForm;
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import { franchiseLogin } from '../../api/apiMethods';

// interface LoginData {
//   phoneNumber: string;
//   password: string;
// }

// const FranchiseLoginForm: React.FC = () => {
//   const [formData, setFormData] = useState<LoginData>({ phoneNumber: '', password: '' });
//   const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     try {
//       const response = await franchiseLogin({ ...formData }) as any;
//       if (response?.result?.token) {
//         localStorage.setItem('jwt_token', response.result.token);
//         localStorage.setItem('user', JSON.stringify(response.result));
//         localStorage.setItem('userId', response.result.id);
//         localStorage.setItem('role', 'franchise');
//         navigate('/franchise/dashboard');
//       } else {
//         throw new Error('Invalid credentials or server error');
//       }
//     } catch (err: any) {
//       setError(err?.message || 'Login failed. Please try again.');
//     }
//   };

//   return (
//     <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="flex justify-center mb-6">
//         <div className="bg-blue-900 rounded px-2 py-1 flex items-center">
//           <img
//             src="https://prnvservices.com/uploads/logo/1695377568_logo-white.png"
//             alt="Justdial Logo"
//             className="h-8 w-auto"
//           />
//         </div>
//       </div>

//       <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
//         <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Franchise Sign In</h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {error && <p className="text-red-600 text-sm text-center">{error}</p>}

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Phone Number <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               name="phoneNumber"
//               required
//               value={formData.phoneNumber}
//               onChange={handleChange}
//               className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Password <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 required
//                 value={formData.password}
//                 onChange={handleChange}
//                 className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
//               />
//               <span
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
//                 onClick={() => setShowPassword((prev) => !prev)}
//               >
//                 {showPassword ? <FaEyeSlash /> : <FaEye />}
//               </span>
//             </div>
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-200"
//           >
//             Sign In
//           </button>
//         </form>
//       </div>

//       <p className="mt-4 text-sm text-center text-gray-600">
//         Don't have an account?
//         <a
//           href="/signup/franchise"
//           className="text-blue-600 hover:underline font-medium ms-1"
//         >
//           Sign Up
//         </a>
//       </p>
//     </main>
//   );
// };

// export default FranchiseLoginForm;
