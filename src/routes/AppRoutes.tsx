import { Route, Routes, Navigate } from 'react-router-dom';
import FranchiseSignup from '../pages/FranchiseSignupPage';
import FranchiseLogin from '../pages/FranchiseLoginPage';
import AuthLayout from '../components/layout/AuthLayout';
import NotFound from '../pages/NotFoundPage';
import Dashboard from '../components/FranchiseHomePage/Dashboard';
import Profile from '../components/FranchiseHomePage/Profile';
import Technicians from '../components/FranchiseHomePage/Technicians';
import Earnings from '../components/FranchiseHomePage/Earning';
import FranchiseLayout from '../components/layout/FranchiseLayout';
import CategoriesPage from '../pages/CategoriesPage';
import AboutUs from '../pages/AboutPage';
import SubscriptionPage from '../pages/SubscriptionPage';
import KeyFeaturesPage from '../pages/KeyFeaturesPage';
import PlanDetailsPage from '../pages/PlanDetailsPage';
import AddTechnician from '../components/FranchiseHomePage/AddTechnician';
import BuySubscription from '../components/FranchiseHomePage/BuySubscription';
import FranchiseSubscription from '../components/FranchiseHomePage/FranchiseSubscription';
import EditTechnician from '../components/FranchiseHomePage/EditTechnician';
import FranchisePlans from '../components/FranchiseHomePage/FranchisePlans';
import TechnicianView from '../components/FranchiseHomePage/TechinicianView';

// Protected Route component to restrict access to franchise users
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('jwt_token');
  const role = localStorage.getItem('role');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Check if user is authenticated and has franchise role
  if (!token || role !== 'franchise') {
    return <Navigate to="/login/franchise" replace />;
  }

  // Check if user is a new franchise (e.g., no subscription or incomplete profile)
  // Assuming subscription status is stored in user object or can be checked via API
  // const isNewFranchise = !user.subscription || !user.buildingName; // Example condition
  // if (isNewFranchise) {
  //   return <Navigate to="/franchiseSubscription" replace />;
  // }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login/franchise" element={<FranchiseLogin />} />
        <Route path="/signup/franchise" element={<FranchiseSignup />} />
      </Route>

      {/* Franchise Routes (Protected) */}
      <Route element={<FranchiseLayout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technicians"
          element={
            <ProtectedRoute>
              <Technicians />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addTechnician"
          element={
            <ProtectedRoute>
              <AddTechnician />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/:id"
          element={
            <ProtectedRoute>
              <TechnicianView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editTechnician/:id"
          element={
            <ProtectedRoute>
              <EditTechnician />
            </ProtectedRoute>
          }
        />
        <Route
          path="/earnings"
          element={
            <ProtectedRoute>
              <Earnings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyPlan"
          element={
            <ProtectedRoute>
              <BuySubscription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/franchiseSubscription"
          element={
            <ProtectedRoute>
              <FranchiseSubscription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/franchisePlans"
          element={
            <ProtectedRoute>
              <FranchisePlans />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Public Routes */}
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/subscription/:subscriptionId" element={<PlanDetailsPage />} />
      <Route path="/features" element={<KeyFeaturesPage />} />

      {/* Catch-all Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
// import { Route, Routes } from 'react-router-dom';
// import FranchiseSignup from '../pages/FranchiseSignupPage';
// import FranchiseLogin from '../pages/FranchiseLoginPage';
// import AuthLayout from '../components/layout/AuthLayout';
// import NotFound from '../pages/NotFoundPage';
// import Dashboard from '../components/FranchiseHomePage/Dashboard';
// import Profile from '../components/FranchiseHomePage/Profile';
// import Technicians from '../components/FranchiseHomePage/Technicians';
// import Earnings from '../components/FranchiseHomePage/Earning';
// import FranchiseLayout from '../components/layout/FranchiseLayout';
// import CategoriesPage from '../pages/CategoriesPage';
// import AboutUs from '../pages/AboutPage';
// import SubscriptionPage from '../pages/SubscriptionPage';
// import KeyFeaturesPage from '../pages/KeyFeaturesPage';
// import PlanDetailsPage from '../pages/PlanDetailsPage';
// import AddTechnician from '../components/FranchiseHomePage/AddTechnician';
// import BuySubscription from '../components/FranchiseHomePage/BuySubscription';
// import TechnicianView from '../components/FranchiseHomePage/TechinicianView';
// import FranchiseSubscription from '../components/FranchiseHomePage/FranchiseSubscription';
// import EditTechnician from '../components/FranchiseHomePage/EditTechnician';
// import FranchisePlans from '../components/FranchiseHomePage/FranchisePlans';

// const AppRoutes = () => {
//     return (
//         <Routes>
//             <Route element={<AuthLayout />}>
//                 <Route path="/login/franchise" element={<FranchiseLogin />} />
//                 <Route path="/signup/franchise" element={<FranchiseSignup />} />
//             </Route>

//             <Route element={<FranchiseLayout />}>
//                 <Route path="/" element={<Dashboard />} />
//                 <Route path="/profile" element={<Profile />} />
//                 <Route path="/technicians" element={<Technicians />} />
//                 <Route path="/addTechnician" element={<AddTechnician />} />
//                 <Route path="/technician/:id" element={<TechnicianView />} />
//                 <Route path='/editTechnician/:id' element={<EditTechnician />} />
//                 <Route path="/earnings" element={<Earnings />} />
//                 <Route path="/buyPlan" element={<BuySubscription />} />
//                 <Route path='/franchiseSubscription' element={<FranchiseSubscription />}/>
//                 <Route path='/franchisePlans' element={<FranchisePlans />}/>
                
//             </Route>


//             <Route path="/categories" element={<CategoriesPage />} />
//             <Route path="/about" element={<AboutUs />} />
//             <Route path="/subscription" element={<SubscriptionPage />} />
//             <Route path="/subscription/:subscriptionId" element={<PlanDetailsPage/>} />
//             <Route path="/features" element={<KeyFeaturesPage />} />
            
//             <Route path="*" element={<NotFound />} />
//         </Routes>
//     );
// };

// export default AppRoutes;
{/* <Route path="/refer" element={<Refer />} /> */}