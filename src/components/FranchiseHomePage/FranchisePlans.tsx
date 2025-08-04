import React, { useEffect, useState } from 'react';
import {
  Check,
  X,
  Crown,
  BadgeIndianRupee,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFranchisePlans } from '../../api/apiMethods';

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

const FranchisePlans: React.FC = () => {
  const [plan, setPlan] = useState<FranchisePlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-100 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-yellow-500 to-purple-600 drop-shadow-lg">
            The Ultimate Franchise Plan
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mt-4 leading-relaxed">
            Unlock every premium feature and grow your franchise business with our all-in-one, most popular plan.
          </p>
        </div>

        {error && (
          <div className="text-center text-red-500 mb-8">{error}</div>
        )}

        {plan && (
          <div
            className="relative bg-gradient-to-br from-pink-500 via-yellow-400 to-purple-600 rounded-3xl shadow-2xl p-1"
          >
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 h-fit z-10">
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-white px-2 py-2 rounded-full text-lg font-extrabold shadow-xl border-4 border-white">
                <Crown className="text-yellow-200 drop-shadow" size={28} />
                MOST POPULAR
              </div>
            </div>
            <div className="bg-white rounded-3xl p-2 pt-8 flex flex-col items-center relative overflow-hidden">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-purple-600 flex items-center justify-center mb-4 shadow-lg border-4 border-white">
                <Crown className="text-white" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-wide">{plan.name}</h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl font-extrabold text-gray-900 flex items-center">
                  <BadgeIndianRupee className="inline-block" size={28} />
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
                  ₹{plan.price} + ₹{plan.gst} (GST {plan.gstPercentage}%)
                </div>
              )}
              <div className="mt-3 text-base font-medium text-purple-700 bg-purple-100 px-4 py-2 rounded-full inline-block shadow">
                Valid for {plan.validity} days
              </div>

              <ul className="space-y-3 my-8 w-md max-w-md">
                {Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-lg text-gray-800 font-medium">
                    {feature.included ? (
                      <Check size={20} className="text-green-500" />
                    ) : (
                      <X size={20} className="text-red-400" />
                    )}
                    {feature.name}
                  </li>
                ))}
              </ul>

              {Array.isArray(plan.fullFeatures) && plan.fullFeatures.length > 0 && (
                <ul className="space-y-1 mb-6 w-md max-w-md" >
                  {plan.fullFeatures.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="me-3 text-red-500 text-3xl">•</span>
                      {f.text}
                    </li>
                  ))}
                </ul>
              )}

              <div className="w-md flex flex-col gap-4 mt-4">
                <button
                  onClick={() => alert("Please contact Prnv Admin.")}
                  // onClick={() => navigate('/buyPlan', { state: { plan } })}
                  className="w-md mx-auto py-4 px-2 rounded-2xl font-bold text-lg transition duration-300 text-white shadow-lg bg-gradient-to-r from-pink-600 via-yellow-500 to-purple-600 hover:from-pink-700 hover:to-purple-700 hover:scale-105"
                >
                  Buy Now
                </button>
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
  );
};

export default FranchisePlans;
