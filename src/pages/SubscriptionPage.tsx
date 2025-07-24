import React, { useEffect, useState } from 'react';
import { Check, X, Star, Crown, Zap, Shield, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPlans } from '../api/apiMethods';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface FullFeature {
  text: string;
}

export interface Plan {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  gst: number;
  finalPrice: number;
  validity: number;
  validityUnit: string;
  icon: string;
  color: string;
  features: PlanFeature[];
  fullFeatures: FullFeature[];
  discount?: number;
  isPopular?: boolean;
  buttonColor: string;
}

const PLAN_CONFIG: Record<string, {
  gradient: string;
  icon: LucideIcon;
  button: string;
}> = {
  "Economy Plan": {
    gradient: "from-blue-500 to-blue-600",
    icon: Zap,
    button: "bg-blue-600 hover:bg-blue-700",
  },
  "Gold Plan": {
    gradient: "from-yellow-400 to-yellow-600",
    icon: Star,
    button: "bg-yellow-500 hover:bg-yellow-600",
  },
  "Platinum Plan": {
    gradient: "from-purple-500 to-purple-700",
    icon: Crown,
    button: "bg-purple-600 hover:bg-purple-700",
  },
  "Free Plan": {
    gradient: "from-green-400 to-green-600",
    icon: Shield,
    button: "bg-green-500 hover:bg-green-700",
  },
};

const SubscriptionPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await getPlans();
        if (response?.data) {
          setPlans(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      }
    };
    fetchPlans();
  }, []);

  const handleFullDetails = (plan: Plan) => {
    navigate(`/subscription/${plan._id}`, { state: { plan } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold text-gray-800">Technician Subscription Plans</h1>
          <p className="text-lg text-gray-600 mt-3">Choose the right plan to grow your business.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const config = PLAN_CONFIG[plan.name] || {
              gradient: "from-gray-400 to-gray-600",
              icon: Star,
              button: "bg-gray-500 hover:bg-gray-600",
            };

            const IconComponent = config.icon;

            return (
              <div
                key={plan._id}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 relative"
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold">MOST POPULAR</div>
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center mx-auto`}>
                    <IconComponent className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-2">{plan.name}</h3>
                  <div className="text-2xl font-bold mt-2">₹ {plan.price}</div>
                  {plan.originalPrice && (
                    <div className="text-sm line-through text-gray-500">₹{plan.originalPrice} + GST</div>
                  )}
                  <div className="text-sm text-gray-600">
                    ₹{plan.price} + ₹{plan.gst} (GST 18%)
                  </div>
                  <div className="mt-2 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full inline-block">
                    Valid until {plan.validity} {plan.validityUnit}
                  </div>
                </div>

                <ul className="space-y-2 text-sm mb-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      {feature.included ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}
                      {feature.name}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleFullDetails(plan)}
                  className="w-full text-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Full Details →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
