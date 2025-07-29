import React, { useEffect, useState } from "react";
import {
  Check,
  X,
  Star,
  Crown,
  Zap,
  Shield,
  EyeIcon,
  DollarSign,
  Calendar,
  Book,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getFranchisePlans, getFranchiseSubscriptionPlan } from "../../api/apiMethods";

// Define interfaces based on API responses
interface Feature {
  name: string;
  included: boolean;
}

interface FullFeature {
  text: string;
}

interface Plan {
  _id: string;
  name: string;
  originalPrice: number;
  discount: string;
  discountPercentage: number;
  price: number;
  gstPercentage: number;
  gst: number;
  finalPrice: number;
  validity: number;
  features: Feature[];
  fullFeatures: FullFeature[];
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Subscription {
  franchiseSubscriptionId: string;
  subscriptionName: string;
  startDate: string;
  endDate: string;
  _id: string;
}

interface TermCondition {
  icon: React.ElementType;
  text: string;
}

const FranchiseSubscription: React.FC = () => {
  const navigate = useNavigate();
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const franchiseId = localStorage.getItem("userId");

  const fetchSubscriptionDetails = async (): Promise<void> => {
    try {
      if (!franchiseId) {
        console.error("Franchise ID is not available in localStorage.");
        return;
      }

      const response = await getFranchiseSubscriptionPlan(franchiseId);

      if (response && response?.result) {
        setCurrentSubscription(response?.result);
      } else {
        console.error("No subscription details found for the franchise.");
      }
    } catch (error) {
      console.error("Error fetching subscription details:", error);
    }
  };

  const fetchPlans = async (): Promise<void> => {
    try {
      const response = await getFranchisePlans();
      if (response && response?.data) {
        setPlans(response?.data);
      } else {
        console.error("No plans found for the franchise.");
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  useEffect(() => {
    fetchSubscriptionDetails();
    fetchPlans();
  }, []);

  const getDaysLeft = (endDate: string | undefined): number => {
    if (!endDate) return 0;
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getPlanConfig = (planName: string) => {
    const configs = {
      "Economy Plan": { icon: Zap, color: "blue" },
      "Gold Plan": { icon: Star, color: "yellow" },
      "Platinum Plan": { icon: Crown, color: "purple" },
      "Free Plan": { icon: Shield, color: "green" },
      "Premium Plan": { icon: Crown, color: "purple" },
    };
    return configs[planName] || { icon: Star, color: "gray" };
  };

  // Terms & Conditions data
  const termsConditions: TermCondition[] = [
    {
      icon: DollarSign,
      text: "Franchise will earn Rs 10% commission on their enrollments and renewals of professionals (service providers/technicians) & advertisement plans as well.",
    },
    {
      icon: DollarSign,
      text: "The franchise has to pay a monthly subscription fee of Rs. 100 + GST (18%), Rs. 18 = Rs. 118 (valid for 30 days). (It Is Not Refundable.) (Actual amount Rs. 1000 + 18% GST Rs. 180 Total Rs. 1,180).",
    },
    {
      icon: Calendar,
      text: "The franchise has to renew with Rs. 118 after every 30 days.",
    },
    {
      icon: Book,
      text: "The franchise must have Marketing as well as organizing knowledge.",
    },
    {
      icon: Clock,
      text: "This commission will be paid every month. The total commission earned from the 1st to the end of the month will be paid next month between the 5th to 10th by PRNIV Services.",
    },
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Subscription Plan</h1>
        <button
          onClick={() => navigate('/franchisePlans')}
          className="px-3 py-2 border rounded-lg bg-purple-300 hover:bg-purple-400 flex text-purple-800 font-bold"
       >
          <EyeIcon />
          <span className='ms-1.5'> View All Plans</span>
       </button>
      </div>

      {currentSubscription ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-5">
              <div
                className={`bg-${
                  getPlanConfig(currentSubscription.subscriptionName).color
                }-100 p-3 rounded-full mt-1`}
              >
                {React.createElement(
                  getPlanConfig(currentSubscription.subscriptionName).icon,
                  {
                    className: `text-${
                      getPlanConfig(currentSubscription.subscriptionName).color
                    }-600 text-xl`,
                  }
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">
                  {currentSubscription.subscriptionName}
                </h3>
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
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    getDaysLeft(currentSubscription.endDate) <= 0
                      ? "bg-red-100 text-red-800"
                      : getDaysLeft(currentSubscription.endDate) <= 3
                      ? "bg-red-100 text-red-800"
                      : getDaysLeft(currentSubscription.endDate) <= 7
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {getDaysLeft(currentSubscription.endDate) <= 0
                    ? "Expired"
                    : `${getDaysLeft(currentSubscription.endDate)} days left`}
                </span>
              )}
            </div>
          </div>

          <hr className="my-6" />

          {currentSubscription && plans.length > 0 && (
            <div className="">
              <h2 className="text-xl font-semibold mb-4">Plan Details</h2>
              {plans
                .filter(
                  (plan) => plan._id === currentSubscription.franchiseSubscriptionId
                )
                .map((plan) => {
                  const config = getPlanConfig(plan.name);
                  return (
                    <div
                      key={plan._id}
                      className="bg-gray-50 p-6 rounded-lg shadow border border-gray-200"
                    >
                      <div className="flex items-center mb-4">
                        <div
                          className={`bg-${config.color}-100 text-${config.color}-600 w-12 h-12 rounded-full flex items-center justify-center mr-4`}
                        >
                          {React.createElement(config.icon, { size: 20 })}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{plan.name}</h3>
                          <p className="text-md font-medium text-gray-600">
                            ₹{plan.finalPrice}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {plan.features?.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {feature.included ? (
                              <Check className="text-green-500" size={16} />
                            ) : (
                              <X className="text-red-500" size={16} />
                            )}
                            <span className="text-sm">{feature.name}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2 mt-3">
                        {plan.fullFeatures?.map((details, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-sm">
                              <span className="me-3">•</span>
                              {details?.text}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-4 mt-6">
                        <h4 className="text-lg font-semibold">Terms & Conditions</h4>
                        {termsConditions.map((term, index) => (
                          <div key={index} className="flex items-start">
                            <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                              {React.createElement(term.icon, {
                                className: "text-blue-600",
                                size: 16,
                              })}
                            </div>
                            <p className="text-gray-700 text-sm">{term.text}</p>
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
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200 flex-wrap">
          No Subscription Plan. Please choose a suitable plan to grow your
          technical service business.
        </div>
      )}
    </div>
  );
};

export default FranchiseSubscription;
// import React, { use, useEffect, useState } from "react";
// import {
//   Check,
//   X,
//   Star,
//   Crown,
//   Zap,
//   Shield,
//   EyeIcon,
//   DollarSign,
//   Calendar,
//   Book,
//   Clock,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { getFranchisePlans, getFranchiseSubscriptionPlan } from "../../api/apiMethods";

// const FranchiseSubscription = () => {
//   const navigate = useNavigate();
//   const [currentSubscription, setCurrentSubscription] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const franchiseId = localStorage.getItem('userId');



//   const fetchSubscriptionDetails = async () =>{
//     try{
//       if(!franchiseId) {
//         console.error("Franchise ID is not available in localStorage.");
//       }

//       const response = await getFranchiseSubscriptionPlan(franchiseId);

//       if(response && response?.result) {
//         setCurrentSubscription(response?.result);
//       }else {
//         console.error("No subscription details found for the franchise.");
//       }

//     }catch(error){
//       console.log("Error fetching subscription details:", error);
//     }

//   }

//   const fetchPlans = async () => {
//     try {
//       const response = await getFranchisePlans();
//       if (response && response?.result) {
//         setPlans(response?.result);
//       } else {
//         console.error("No plans found for the franchise.");
//       }
//     } catch (error) {
//       console.error("Error fetching plans:", error);
//     }
//   }


//   useEffect(()=>{
//     fetchSubscriptionDetails();
//     fetchPlans();
//   }, [])

//   const getDaysLeft = (endDate) => {
//     if (!endDate) return 0;
//     const diff = new Date(endDate) - new Date();
//     return Math.ceil(diff / (1000 * 60 * 60 * 24));
//   };

//   // Terms & Conditions data from the image
//   const termsConditions = [
//     {
//       icon: DollarSign,
//       text: "Franchise will earn Rs 10% commission on their enrollments and renewals of professionals (service providers/technicians) & advertisement plans as well.",
//     },
//     {
//       icon: DollarSign,
//       text: "The franchise has to pay a monthly subscription fee of Rs. 100 + GST (18%), Rs. 18 = Rs. 118 (valid for 30 days). (It Is Not Refundable.) (Actual amount Rs. 1000 + 18% GST Rs. 180 Total Rs. 1,180).",
//     },
//     {
//       icon: Calendar,
//       text: "The franchise has to renew with Rs. 118 after every 30 days.",
//     },
//     {
//       icon: Book,
//       text: "The franchise must have Marketing as well as organizing knowledge.",
//     },
//     {
//       icon: Clock,
//       text: "This commission will be paid every month. The total commission earned from the 1st to the end of the month will be paid next month between the 5th to 10th by PRNIV Services.",
//     },
//   ];

//   return (
//     <div className="p-4 max-w-6xl mx-auto">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">
//           My Subscription Plan
//         </h1>
//       </div>

//       {currentSubscription ? (
//         <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
//           <div className="flex justify-between items-start">
//             <div className="flex items-start gap-5">
//               <div
//                 className={`bg-${
//                   getPlanConfig(currentSubscription.name).color
//                 }-100 p-3 rounded-full mt-1`}
//               >
//                 {React.createElement(
//                   getPlanConfig(currentSubscription.name).icon,
//                   {
//                     className: `text-${
//                       getPlanConfig(currentSubscription.name).color
//                     }-600 text-xl`,
//                   }
//                 )}
//               </div>
//               <div className="space-y-2">
//                 <h3 className="text-2xl font-bold">
//                   {currentSubscription.name}
//                 </h3>
//                 <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
//                   <div>
//                     <p className="text-gray-500">Start Date</p>
//                     <p className="font-medium">
//                       {new Date(
//                         currentSubscription.startDate
//                       ).toLocaleDateString()}
//                     </p>
//                   </div>
//                   {currentSubscription?.endDate && (
//                     <div>
//                       <p className="text-gray-500">End Date</p>
//                       <p className="font-medium">
//                         {new Date(
//                           currentSubscription.endDate
//                         ).toLocaleDateString()}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className="flex flex-col items-end">
//               {currentSubscription?.endDate !== null && (
//                 <span
//                   className={`px-3 py-1 rounded-full text-sm font-medium ${
//                     getDaysLeft(currentSubscription.endDate) <= 0
//                       ? "bg-red-100 text-red-800"
//                       : getDaysLeft(currentSubscription.endDate) <= 3
//                       ? "bg-red-100 text-red-800"
//                       : getDaysLeft(currentSubscription.endDate) <= 7
//                       ? "bg-yellow-100 text-yellow-800"
//                       : "bg-green-100 text-green-800"
//                   }`}
//                 >
//                   {getDaysLeft(currentSubscription.endDate) <= 0
//                     ? "Expired"
//                     : `${getDaysLeft(currentSubscription.endDate)} days left`}
//                 </span>
//               )}
//             </div>
//           </div>

//           <hr className="my-6" />

//           {currentSubscription && plans.length > 0 && (
//             <div className="">
//               <h2 className="text-xl font-semibold mb-4">Plan Details</h2>
//               {plans
//                 .filter(
//                   (plan) => plan._id === currentSubscription.subscriptionId
//                 )
//                 .map((plan) => {
//                   const config = getPlanConfig(plan.name);
//                   return (
//                     <div
//                       key={plan._id}
//                       className="bg-gray-50 p-6 rounded-lg shadow border border-gray-200"
//                     >
//                       <div className="flex items-center mb-4">
//                         <div
//                           className={`bg-${config.color}-100 text-${config.color}-600 w-12 h-12 rounded-full flex items-center justify-center mr-4`}
//                         >
//                           {React.createElement(config.icon, { size: 20 })}
//                         </div>
//                         <div>
//                           <h3 className="text-xl font-bold">{plan.name}</h3>
//                           <p className="text-md font-medium text-gray-600">
//                             ₹{plan.price}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="space-y-2">
//                         {plan.features?.map((feature, i) => (
//                           <div key={i} className="flex items-center gap-2">
//                             {feature.included ? (
//                               <Check className="text-green-500" size={16} />
//                             ) : (
//                               <X className="text-red-500" size={16} />
//                             )}
//                             <span className="text-sm">{feature.name}</span>
//                           </div>
//                         ))}
//                       </div>
//                       <div className="space-y-2 mt-3">
//                         {plan.fullFeatures?.map((details, i) => (
//                           <div key={i} className="flex items-center gap-2">
//                             <span className="text-sm">
//                               <span className="me-3">•</span>
//                               {details?.text}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                       <div className="space-y-4">
//                         <h4 className="text-lg font-semibold mt-4">
//                           Terms & Conditions   
//                         </h4>
//                         {termsConditions.map((term, index) => (
//                           <div key={index} className="flex items-start">
//                             <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
//                               {React.createElement(term.icon, {
//                                 className: "text-blue-600",
//                                 size: 16,
//                               })}
//                             </div>
//                             <p className="text-black-700 text-sm">{term.text}</p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   );
//                 })}
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200 flex-wrap">
//           No Subscription Plan. Please choose a suitable plan to grow your
//           technical service business.
//         </div>
//       )}
//     </div>
//   );
// };

// export default FranchiseSubscription;
// import React from 'react';
// import { Check, X, Star, Crown, Zap, Shield, EyeIcon } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const FranchiseSubscription = () => {
//   const navigate = useNavigate();

//   // Mock data for demonstration
//   const currentSubscription = {
//     name: "Gold Plan",
//     startDate: "2025-01-01",
//     endDate: "2025-12-31",
//     leads: 100,
//     ordersCount: 60,
//     subscriptionId: "gold-plan-id"
//   };

//   const plans = [
//     {
//       _id: "gold-plan-id",
//       name: "Gold Plan",
//       price: 999,
//       features: [
//         { name: "Access to premium leads", included: true },
//         { name: "Priority support", included: true },
//         { name: "Advanced analytics", included: false }
//       ],
//       fullFeatures: [
//         { text: "Up to 100 leads per month" },
//         { text: "24/7 priority support" },
//         { text: "Basic reporting dashboard" }
//       ]
//     }
//   ];

//   const getDaysLeft = (endDate) => {
//     if (!endDate) return 0;
//     const diff = new Date(endDate) - new Date();
//     return Math.ceil(diff / (1000 * 60 * 60 * 24));
//   };

//   const getPlanConfig = (planName) => {
//     const configs = {
//       "Economy Plan": { icon: Zap, color: "blue" },
//       "Gold Plan": { icon: Star, color: "yellow" },
//       "Platinum Plan": { icon: Crown, color: "purple" },
//       "Free Plan": { icon: Shield, color: "green" }
//     };
//     return configs[planName] || { icon: Star, color: "gray" };
//   };

//   return (
//     <div className="p-4 max-w-6xl mx-auto">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">My Subscription Plan</h1>
//         {/* <button
//           onClick={() => navigate('/technician/plans')}
//           className="px-3 py-2 border rounded-lg bg-purple-300 hover:bg-purple-400 flex text-purple-800 font-bold"
//         >
//           <EyeIcon />
//           <span className='ms-1.5'> View All Plans</span>
//         </button> */}
//       </div>

//       {currentSubscription ? (
//         <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
//           <div className="flex justify-between items-start">
//             <div className="flex items-start gap-5">
//               <div className={`bg-${getPlanConfig(currentSubscription.name).color}-100 p-3 rounded-full mt-1`}>
//                 {React.createElement(getPlanConfig(currentSubscription.name).icon, {
//                   className: `text-${getPlanConfig(currentSubscription.name).color}-600 text-xl`
//                 })}
//               </div>
//               <div className="space-y-2">
//                 <h3 className="text-2xl font-bold">{currentSubscription.name}</h3>
//                 <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
//                   <div>
//                     <p className="text-gray-500">Start Date</p>
//                     <p className="font-medium">
//                       {new Date(currentSubscription.startDate).toLocaleDateString()}
//                     </p>
//                   </div>
//                   {currentSubscription?.endDate && (
//                     <div>
//                       <p className="text-gray-500">End Date</p>
//                       <p className="font-medium">
//                         {new Date(currentSubscription.endDate).toLocaleDateString()}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className="flex flex-col items-end">
//               {currentSubscription?.endDate !== null && (
//                 <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                   getDaysLeft(currentSubscription.endDate) <= 0 ? 'bg-red-100 text-red-800' :
//                   getDaysLeft(currentSubscription.endDate) <= 3 ? 'bg-red-100 text-red-800' :
//                   getDaysLeft(currentSubscription.endDate) <= 7 ? 'bg-yellow-100 text-yellow-800' :
//                   'bg-green-100 text-green-800'
//                 }`}>
//                   {getDaysLeft(currentSubscription.endDate) <= 0 ? 'Expired' :
//                    `${getDaysLeft(currentSubscription.endDate)} days left`}
//                 </span>
//               )}
//               {currentSubscription?.leads !== null && (
//                 <div className="mt-3 text-right bg-yellow-100 px-2 py-1 rounded-xl">
//                   <p className="text-gray-600 text-sm">
//                     <span className='text-lg font-bold'>{currentSubscription.leads - currentSubscription.ordersCount}</span> Leads Remaining
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           <hr className='my-6'/>

//           {currentSubscription && plans.length > 0 && (
//             <div className="">
//               <h2 className="text-xl font-semibold mb-4">Plan Details</h2>
//               {plans
//                 .filter((plan) => plan._id === currentSubscription.subscriptionId)
//                 .map((plan) => {
//                   const config = getPlanConfig(plan.name);
//                   return (
//                     <div key={plan._id} className="bg-gray-50 p-6 rounded-lg shadow border border-gray-200">
//                       <div className="flex items-center mb-4">
//                         <div className={`bg-${config.color}-100 text-${config.color}-600 w-12 h-12 rounded-full flex items-center justify-center mr-4`}>
//                           {React.createElement(config.icon, { size: 20 })}
//                         </div>
//                         <div>
//                           <h3 className="text-xl font-bold">{plan.name}</h3>
//                           <p className="text-md font-medium text-gray-600">₹{plan.price}</p>
//                         </div>
//                       </div>
//                       <div className="space-y-2">
//                         {plan.features?.map((feature, i) => (
//                           <div key={i} className="flex items-center gap-2">
//                             {feature.included ? <Check className="text-green-500" size={16} /> : <X className="text-red-500" size={16} />}
//                             <span className="text-sm">{feature.name}</span>
//                           </div>
//                         ))}
//                       </div>
//                       <div className="space-y-2 mt-3">
//                         {plan.fullFeatures?.map((details, i) => (
//                           <div key={i} className="flex items-center gap-2">
//                             <span className="text-sm"><span className='me-3'>•</span>{details?.text}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   );
//                 })}
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className='bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200 flex-wrap'>
//           No Subscription Plan. Please choose a suitable plan to grow your technical service business.
//         </div>
//       )}
//     </div>
//   );
// };

// export default FranchiseSubscription;
