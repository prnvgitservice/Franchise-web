import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { franchiseLogin } from '../../api/apiMethods';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface LoginData {
  phoneNumber: string;
  password: string;
}

const FranchiseLoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({ phoneNumber: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await franchiseLogin({ ...formData }) as any;
      if (response?.result?.token) {
        localStorage.setItem('jwt_token', response.result.token);
        localStorage.setItem('user', JSON.stringify(response.result));
        localStorage.setItem('userId', response.result.id);
        localStorage.setItem('role', 'franchise');
        navigate('/franchise/dashboard');
      } else {
        throw new Error('Invalid credentials or server error');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
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
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Franchise Sign In</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
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
                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Sign In
          </button>
        </form>
      </div>

      <p className="mt-4 text-sm text-center text-gray-600">
        Don't have an account?
        <a
          href="/signup/franchise"
          className="text-blue-600 hover:underline font-medium ms-1"
        >
          Sign Up
        </a>
      </p>
    </main>
  );
};

export default FranchiseLoginForm;