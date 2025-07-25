import { data, Navigate, Route, Routes } from 'react-router-dom';
import FranchiseSignup from '../pages/FranchiseSignupPage';
import FranchiseLogin from '../pages/FranchiseLoginPage';
import AuthLayout from '../components/layout/AuthLayout';
import NotFound from '../pages/NotFoundPage';
import Homepage from '../pages/Homepage';
import Dashboard from '../components/FranchiseHomePage/Dashboard';
import Profile from '../components/FranchiseHomePage/Profile';
import Technicians from '../components/FranchiseHomePage/Technicians';
import Earnings from '../components/FranchiseHomePage/Earning';
import Refer from '../components/FranchiseHomePage/ReferTechnician';
import FranchiseLayout from '../components/layout/FranchiseLayout';
import CategoriesPage from '../pages/CategoriesPage';
import AboutUs from '../pages/AboutPage';
import SubscriptionPage from '../pages/SubscriptionPage';
import KeyFeaturesPage from '../pages/KeyFeaturesPage';
import PlanDetailsPage from '../pages/PlanDetailsPage';
import AddTechnician from '../components/FranchiseHomePage/AddTechnician';
import BuySubscription from '../components/FranchiseHomePage/BuySubscription';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route path="/login/franchise" element={<FranchiseLogin />} />
                <Route path="/signup/franchise" element={<FranchiseSignup />} />
            </Route>

            <Route element={<FranchiseLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/technicians" element={<Technicians />} />
                <Route path="/addTechnician" element={<AddTechnician />} />
                <Route path="/earnings" element={<Earnings />} />
                <Route path="/buyPlan" element={<BuySubscription />} />
                {/* <Route path="/refer" element={<Refer />} /> */}
            </Route>


            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/subscription/:subscriptionId" element={<PlanDetailsPage/>} />
            <Route path="/key-features" element={<KeyFeaturesPage />} />
            
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;