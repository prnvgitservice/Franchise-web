import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, ChevronRight, CreditCard, Smartphone, DollarSign, Landmark, QrCode } from 'lucide-react';
import { addTechSubscriptionPlan, registerTechByFranchise } from '../../api/apiMethods';
import { BiLeftArrowAlt } from 'react-icons/bi';

const BuySubscription = () => {
  const { state } = useLocation();
  const { plan, technicianData } = state || {};
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: Smartphone,
      description: 'Pay using any UPI app like Google Pay, PhonePe, Paytm',
      popular: true,
    },
    {
      id: 'cards',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Pay using Visa, Mastercard, Rupay or other cards',
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: Landmark,
      description: 'Direct bank transfer from 50+ Indian banks',
    },
    {
      id: 'wallet',
      name: 'Paytm Wallet',
      icon: DollarSign,
      description: 'Pay using your Paytm wallet balance',
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: QrCode,
      description: 'Scan and pay using any UPI app',
    },
  ];

  const handlePaymentSelection = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const proceedToPayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Step 1: Process subscription payment
      const subscriptionData = {
        technicianId: localStorage.getItem('userId'),
        subscriptionId: plan._id,
      };

      const subscriptionResponse = await addTechSubscriptionPlan(subscriptionData);

      if (!subscriptionResponse?.success) {
        throw new Error(subscriptionResponse?.message || 'Failed to process subscription payment');
      }

      // Step 2: Register technician with full payload
      const technicianPayload = {
        username: technicianData.username,
        franchiseId: technicianData.franchiseId,
        category: technicianData.category,
        phoneNumber: technicianData.phoneNumber,
        password: technicianData.password,
        buildingName: technicianData.buildingName,
        areaName: technicianData.areaName,
        city: technicianData.city,
        state: technicianData.state,
        pincode: technicianData.pincode,
        subscriptionId: plan._id,
      };

      const technicianResponse = await registerTechByFranchise(technicianPayload);

      if (technicianResponse?.success) {
        alert('Payment successful! Technician added successfully.');
        navigate('/technicians'); // Navigate to a technicians list or dashboard
      } else {
        throw new Error(technicianResponse?.message || 'Failed to add technician');
      }
    } catch (error: any) {
      setError(error?.errors?.[0] || error?.message || 'Something went wrong while processing payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <BiLeftArrowAlt size={25} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Purchase</h1>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg mb-6 animate-pulse">{error}</div>
          )}

          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{plan?.name}</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{plan?.finalPrice} <span className="text-sm text-gray-500">({plan?.price} + {plan?.gst} GST)</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h2>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div
                    key={method.id}
                    onClick={() => handlePaymentSelection(method.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-lg mr-4 ${
                            selectedMethod === method.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">{method.name}</h3>
                          <p className="text-sm text-gray-500">{method.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {method.popular && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-3">
                            Popular
                          </span>
                        )}
                        {selectedMethod === method.id ? (
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check size={14} className="text-white" />
                          </div>
                        ) : (
                          <ChevronRight size={20} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h3 className="font-medium text-gray-800 mb-2">Order Summary</h3>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Plan Price</span>
              <span className="font-medium">₹{plan?.price}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">GST</span>
              <span className="font-medium">₹{plan?.gst}</span>
            </div>
            <div className="flex justify-between pt-4 mt-2 border-t border-gray-200">
              <span className="font-semibold">Total Amount</span>
              <span className="font-bold text-lg">₹{(parseFloat(plan?.price) + parseFloat(plan?.gst)).toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={proceedToPayment}
            disabled={!selectedMethod || loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white shadow-md transition ${
              selectedMethod && !loading
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                </svg>
                Processing Payment...
              </div>
            ) : (
              `Proceed to Pay ₹${(parseFloat(plan?.price) + parseFloat(plan?.gst)).toFixed(2)}`
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">
            By completing your purchase, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuySubscription;
// import React, { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { Check, ChevronRight, CreditCard, Smartphone, DollarSign, Landmark, QrCode } from 'lucide-react';
// import { addTechSubscriptionPlan } from '../../api/apiMethods';
// import { BiLeftArrow, BiLeftArrowAlt } from 'react-icons/bi';

// const BuySubscription = () => {
//   const { state } = useLocation();
//   const plan = state?.plan;
//   const navigate = useNavigate();
//   const [selectedMethod, setSelectedMethod] = useState(null);
// console.log("plan", plan)
//   const paymentMethods = [
//     {
//       id: 'upi',
//       name: 'UPI Payment',
//       icon: Smartphone,
//       description: 'Pay using any UPI app like Google Pay, PhonePe, Paytm',
//       popular: true
//     },
//     {
//       id: 'cards',
//       name: 'Credit/Debit Card',
//       icon: CreditCard,
//       description: 'Pay using Visa, Mastercard, Rupay or other cards'
//     },
//     {
//       id: 'netbanking',
//       name: 'Net Banking',
//       icon: Landmark, 
//       description: 'Direct bank transfer from 50+ Indian banks'
//     },
//     {
//       id: 'wallet',
//       name: 'Paytm Wallet',
//       icon: DollarSign,
//       description: 'Pay using your Paytm wallet balance'
//     },
//     {
//       id: 'qr',
//       name: 'QR Code',
//       icon: QrCode,
//       description: 'Scan and pay using any UPI app'
//     }
//   ];

//   const handlePaymentSelection = (methodId) => {
//     setSelectedMethod(methodId);

//   };

//  const proceedToPayment = async () => {
//   alert(`Processing ${selectedMethod} payment for ${plan.name}`);

//   const data = {
//     technicianId: localStorage.getItem('userId'),
//     subscriptionId: plan._id,
//   };

//   try {
//     const response = await addTechSubscriptionPlan(data);

//     if (response?.success) {
//       alert(response.message); // ✅ show success message
//       // Optionally navigate or refresh page
//       // navigate('/payment-success');
//     }
//   } catch (error) {
//     console.error('Error subscribing:', error);
//     if (error?.errors?.length) {
//       alert(error.errors[0]); // show the first error message
//     } else {
//       alert('Something went wrong while subscribing');
//     }
//   }
// };


//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-4">
//       <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
//         <div className="p-6 md:p-8">
//           <div className="flex items-center mb-6">
//             <button 
//               onClick={() => navigate(-1)} 
//               className="mr-4 text-gray-500 hover:text-gray-700"
//             >
//               <BiLeftArrowAlt size={25}/>
//               {/* &larr; */}
//             </button>
//             <h1 className="text-2xl font-bold text-gray-900">Complete Your Purchase</h1>
//           </div>

//           <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">{plan?.name}</h2>
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-gray-600">Total Amount</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   ₹{plan?.price} <span className="text-sm text-gray-500">+ ₹{plan?.gst} GST</span>
//                 </p>
//                 <p className="text-sm text-gray-500 mt-1">
//                   Valid for {plan?.validity} {plan?.validityUnit}
//                 </p>
//               </div>
//               {plan?.discount > 0 && (
//                 <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
//                   {plan?.discount}% OFF
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="mb-8">
//             <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h2>
//             <div className="space-y-3">
//               {paymentMethods.map((method) => {
//                 const Icon = method.icon;
//                 return (
//                   <div
//                     key={method.id}
//                     onClick={() => handlePaymentSelection(method.id)}
//                     className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center">
//                         <div className={`p-2 rounded-lg mr-4 ${selectedMethod === method.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
//                           <Icon size={20} />
//                         </div>
//                         <div>
//                           <h3 className="font-medium text-gray-800">{method.name}</h3>
//                           <p className="text-sm text-gray-500">{method.description}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center">
//                         {method.popular && (
//                           <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-3">
//                             Popular
//                           </span>
//                         )}
//                         {selectedMethod === method.id ? (
//                           <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
//                             <Check size={14} className="text-white" />
//                           </div>
//                         ) : (
//                           <ChevronRight size={20} className="text-gray-400" />
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
//             <h3 className="font-medium text-gray-800 mb-2">Order Summary</h3>
//             <div className="flex justify-between py-2 border-b border-gray-200">
//               <span className="text-gray-600">Plan Price</span>
//               <span className="font-medium">₹{plan?.price}</span>
//             </div>
//             <div className="flex justify-between py-2 border-b border-gray-200">
//               <span className="text-gray-600">GST (18%)</span>
//               <span className="font-medium">₹{plan?.gst}</span>
//             </div>
//             <div className="flex justify-between py-2">
//               <span className="text-gray-600">Discount</span>
//               <span className="font-medium text-green-600">-₹{plan?.originalPrice - plan?.price || 0}</span>
//             </div>
//             <div className="flex justify-between pt-4 mt-2 border-t border-gray-200">
//               <span className="font-semibold">Total Amount</span>
//               <span className="font-bold text-lg">₹{(parseFloat(plan?.price) + parseFloat(plan?.gst)).toFixed(2)}</span>
//             </div>
//           </div>

//           <button
//             onClick={proceedToPayment}
//             disabled={!selectedMethod}
//             className={`w-full py-3 px-6 rounded-lg font-semibold text-white shadow-md transition ${selectedMethod ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
//           >
//             Proceed to Pay ₹{(parseFloat(plan?.price) + parseFloat(plan?.gst)).toFixed(2)}
//           </button>

//           <p className="text-xs text-gray-500 mt-4 text-center">
//             By completing your purchase, you agree to our Terms of Service and Privacy Policy
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BuySubscription;