import { useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  const location = useLocation();
  
  // Define routes where header should be hidden
  const hideHeaderRoutes = [
    '/login/franchise', 
    '/signup/franchise'
  ];
  
  // Check if current route should hide header
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!shouldHideHeader && <Header />}
      <main className={`px-4 sm:px-6 py-8 ${shouldHideHeader ? 'pt-0' : ''}`}>
        <AppRoutes />
      </main>
      {!shouldHideHeader && <Footer />}
    </div>
  );
};

export default App;
