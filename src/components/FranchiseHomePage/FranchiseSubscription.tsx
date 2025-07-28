import React from 'react';
import { Check, X, Star, Crown, Zap, Shield, EyeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FranchiseSubscription = () => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const currentSubscription = {
    name: "Gold Plan",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    leads: 100,
    ordersCount: 60,
    subscriptionId: "gold-plan-id"
  };

  const plans = [
    {
      _id: "gold-plan-id",
      name: "Gold Plan",
      price: 999,
      features: [
        { name: "Access to premium leads", included: true },
        { name: "Priority support", included: true },
        { name: "Advanced analytics", included: false }
      ],
      fullFeatures: [
        { text: "Up to 100 leads per month" },
        { text: "24/7 priority support" },
        { text: "Basic reporting dashboard" }
      ]
    }
  ];

  const getDaysLeft = (endDate) => {
    if (!endDate) return 0;
    const diff = new Date(endDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getPlanConfig = (planName) => {
    const configs = {
      "Economy Plan": { icon: Zap, color: "blue" },
      "Gold Plan": { icon: Star, color: "yellow" },
      "Platinum Plan": { icon: Crown, color: "purple" },
      "Free Plan": { icon: Shield, color: "green" }
    };
    return configs[planName] || { icon: Star, color: "gray" };
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Subscription Plan</h1>
        {/* <button 
          onClick={() => navigate('/technician/plans')}
          className="px-3 py-2 border rounded-lg bg-purple-300 hover:bg-purple-400 flex text-purple-800 font-bold"
        >
          <EyeIcon />
          <span className='ms-1.5'> View All Plans</span>
        </button> */}
      </div>

      {currentSubscription ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-5">
              <div className={`bg-${getPlanConfig(currentSubscription.name).color}-100 p-3 rounded-full mt-1`}>
                {React.createElement(getPlanConfig(currentSubscription.name).icon, {
                  className: `text-${getPlanConfig(currentSubscription.name).color}-600 text-xl`
                })}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{currentSubscription.name}</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {new Date(currentSubscription.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  {currentSubscription?.endDate && (
                    <div>
                      <p className="text-gray-500">End Date</p>
                      <p className="font-medium">
                        {new Date(currentSubscription.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              {currentSubscription?.endDate !== null && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  getDaysLeft(currentSubscription.endDate) <= 0 ? 'bg-red-100 text-red-800' :
                  getDaysLeft(currentSubscription.endDate) <= 3 ? 'bg-red-100 text-red-800' :
                  getDaysLeft(currentSubscription.endDate) <= 7 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {getDaysLeft(currentSubscription.endDate) <= 0 ? 'Expired' : 
                   `${getDaysLeft(currentSubscription.endDate)} days left`}
                </span>
              )}
              {currentSubscription?.leads !== null && (
                <div className="mt-3 text-right bg-yellow-100 px-2 py-1 rounded-xl">
                  <p className="text-gray-600 text-sm">
                    <span className='text-lg font-bold'>{currentSubscription.leads - currentSubscription.ordersCount}</span> Leads Remaining
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <hr className='my-6'/>

          {currentSubscription && plans.length > 0 && (
            <div className="">
              <h2 className="text-xl font-semibold mb-4">Plan Details</h2>
              {plans
                .filter((plan) => plan._id === currentSubscription.subscriptionId)
                .map((plan) => {
                  const config = getPlanConfig(plan.name);
                  return (
                    <div key={plan._id} className="bg-gray-50 p-6 rounded-lg shadow border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className={`bg-${config.color}-100 text-${config.color}-600 w-12 h-12 rounded-full flex items-center justify-center mr-4`}>
                          {React.createElement(config.icon, { size: 20 })}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{plan.name}</h3>
                          <p className="text-md font-medium text-gray-600">₹{plan.price}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {plan.features?.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {feature.included ? <Check className="text-green-500" size={16} /> : <X className="text-red-500" size={16} />}
                            <span className="text-sm">{feature.name}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2 mt-3">
                        {plan.fullFeatures?.map((details, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-sm"><span className='me-3'>•</span>{details?.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      ) : (
        <div className='bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200 flex-wrap'>
          No Subscription Plan. Please choose a suitable plan to grow your technical service business.
        </div>
      )}
    </div>
  );
};

export default FranchiseSubscription;
