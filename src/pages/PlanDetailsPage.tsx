import { useLocation, useParams } from 'react-router-dom';
import { Plan } from './SubscriptionPage';

const PlanDetailsPage: React.FC = () => {
  const { state } = useLocation();
  const { subscriptionId } = useParams();
  const subscription: Plan | undefined = state?.plan;

  if (!subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-600 text-xl font-semibold">
        Plan not found. Please go back and select a valid plan.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-gray-800">{subscription.name}</h2>

          <div className="text-3xl font-extrabold text-gray-900 mt-2">₹ {subscription.price}</div>
          {Number(subscription.originalPrice) > 0 && (
            <div className="text-sm text-gray-500 line-through">
              ₹{subscription.originalPrice} + GST
            </div>
          )}
          {Number(subscription.finalPrice) > 0 && (
            <div className="text-sm text-gray-600">
              ₹{subscription.finalPrice} + ₹{subscription.gst} (GST 18%)
            </div>
          )}
        </div>

        {Number(subscription.discount) > 0 && (
          <div className="text-center my-4">
            <span className="inline-block bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              {subscription.discount}% OFF
            </span>
          </div>
        )}

        <div className="text-center mb-6">
          <p className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full inline-block">
            Valid until {subscription.validity} {subscription.validityUnit}
          </p>
        </div>

        <hr className="my-6 border-gray-300" />

        <h2 className="text-xl font-semibold text-gray-800 mb-4">What's included:</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {subscription.fullFeatures.map((feature, index) => (
            <li key={index}>{feature.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlanDetailsPage;
