import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import {
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Users,
  TrendingUp,
  Award,
  DollarSign,
  Calendar,
  Target,
  BookOpen,
  Briefcase,
  Clock,
  Globe,
  FileText,
  CreditCard,
  Shield,
  Check,
  X,
  BadgeIndianRupee,
} from "lucide-react";
import { franchiseTerms } from "../data/FranchiseData";
import { createFranchaseEnquiry, getFranchisePlans } from "../api/apiMethods";
import { useNavigate } from "react-router-dom";

interface FormData {
  name: string;
  mobile: string;
  phoneNumber: string;
  message: string;
}

interface Term {
  id: number;
  text: string;
}

type PlanFeature = {
  name: string;
  included: boolean;
};

type PlanFullFeature = {
  text: string;
};

type FranchisePlan = {
  _id: string;
  name: string;
  finalPrice: number;
  originalPrice: number;
  price: number;
  gst: number;
  gstPercentage: number;
  validity: number;
  discount: number;
  features: PlanFeature[];
  fullFeatures?: PlanFullFeature[];
};

const FranchisePage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobile: "",
    phoneNumber: "",
    message: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<FranchisePlan | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await getFranchisePlans();
        if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
          setPlan(response.data[0]);
        } else {
          setError('No plan found');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch franchise plan');
      }
    };
    fetchPlan();
  }, []); 

  const handleFullDetails = (plan: FranchisePlan) => {
    navigate(`/subscription/${plan._id}`, { state: { plan } });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      // setError("Please enter a valid 10-digit phone number (e.g., 9876543210)");
      return;
    }

    if (!formData.message) {
      // setError("Please select a category");
      return;
    }

    try {
      const response = await createFranchaseEnquiry(formData);
      if (response?.success) {
        alert("Thanks for contacting us! We'll get back to you soon.");
        setFormData({ name: "", mobile: "", phoneNumber: "", message: "" });
      } else {
        console.log(response?.message || "Failed to submit contact form");
        // setError(response.message || "Failed to submit contact form");
      }
    } catch (err: any) {
      console.log(
        err?.message || "An error occurred while submitting the form"
      );
      // setError(err?.message || "An error occurred while submitting the form");
    } finally {
      // setIsLoading(false);
    }
  };

  const termIcons = [
    DollarSign,
    CreditCard,
    Calendar,
    BookOpen,
    Clock,
    Shield,
    Award,
    TrendingUp,
    Users,
    Target,
    Globe,
    Briefcase,
    DollarSign,
    Users,
    FileText,
    MapPin,
    Shield,
    CreditCard,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-yellow-500 to-purple-600 drop-shadow-lg">
            The Ultimate Franchise Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-5xl mx-auto mt-3 leading-relaxed">
            Join PRNV Services and build your business with comprehensive
            support and unlimited earning potential
          </p>
        </div>

        <div className="grid lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-full max-w-xl mx-auto px-4">
                {error && (
                  <div className="text-center text-red-500 mb-8">{error}</div>
                )}

                {plan && (
                  <div className="relative bg-gradient-to-br from-pink-500 via-yellow-400 to-purple-600 rounded-3xl shadow-2xl p-1">
                    <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-white px-2 py-2 rounded-full text-lg font-extrabold shadow-xl border-4 border-white">
                        <Award
                          className="text-yellow-200 drop-shadow"
                          size={28}
                        />
                        MOST POPULAR
                      </div>
                    </div>
                    <div className="bg-white rounded-3xl p-2 pt-8 flex flex-col items-center relative overflow-hidden">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-purple-600 flex items-center justify-center mb-4 shadow-lg border-4 border-white">
                        <Award className="text-white" size={40} />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-wide">
                        {plan.name}
                      </h2>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-4xl font-extrabold text-gray-900 flex items-center">
                          <BadgeIndianRupee
                            className="inline-block"
                            size={28}
                          />
                          {plan.finalPrice}
                        </span>
                        {Number(plan.discount) > 0 && (
                          <span className="ml-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                            {plan.discount}% OFF
                          </span>
                        )}
                      </div>
                      {Number(plan.originalPrice) > 0 && (
                        <div className="text-base text-gray-400 line-through">
                          ₹{plan.originalPrice} + (GST {plan.gstPercentage}%)
                        </div>
                      )}
                      {Number(plan.price) > 0 && (
                        <div className="text-base text-gray-600">
                          ₹{plan.price} + ₹{plan.gst} (GST {plan.gstPercentage}
                          %)
                        </div>
                      )}
                      <div className="mt-3 text-base font-medium text-purple-700 bg-purple-100 px-4 py-2 rounded-full inline-block shadow">
                        Valid for {plan.validity} days
                      </div>

                      <ul className="space-y-2 my-4 w-md max-w-md">
                        {Array.isArray(plan.features) &&
                          plan.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-3 text-lg text-gray-800 font-medium"
                            >
                              {feature.included ? (
                                <Check size={20} className="text-green-500" />
                              ) : (
                                <X size={20} className="text-red-400" />
                              )}
                              {feature.name}
                            </li>
                          ))}
                      </ul>

                      {Array.isArray(plan.fullFeatures) &&
                        plan.fullFeatures.length > 0 && (
                          <ul className="space-y-1 mb-1 w-md max-w-md">
                            {plan.fullFeatures.slice(0, 5).map((f, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 text-sm text-gray-500"
                              >
                                <span className="me-3 text-red-500 text-3xl">
                                  •
                                </span>
                                {f.text}
                              </li>
                            ))}
                          </ul>
                        )}

                      <div className="w-md flex flex-col gap-4">
                        <button
                          onClick={() => handleFullDetails(plan)}
                          className="w-md py-2 px-4 text-gray-700 hover:text-pink-600 font-medium transition duration-300"
                        >
                          Full Details →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Get Started Now Form with Gold Color */}
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300">
                <div className="bg-white rounded-2xl p-6 m-1">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce">
                      <Phone className="text-white" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-700 mb-2">
                      Get Started Now
                    </h3>
                    <p className="text-sm text-gray-600">
                      Fill the form to apply
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phoneNumber"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="Enter your mobile number"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                        placeholder="Tell us about your interest..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      CONTACT US
                    </button>
                  </form>
                </div>
              </div>

              {/* Contact Info with White Background */}
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6">
                <h4 className="font-bold text-gray-800 mb-4 text-center">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:animate-spin">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">
                      +91 9603558369
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:animate-pulse">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">
                      prnvservices@gmail.com
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:animate-bounce">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">
                      PRNV SERVICES, Hyd
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FranchisePage;